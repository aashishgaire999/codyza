-- Groups had a status/github_url/live_url on project_groups and a member-
-- facing page promising "admin approves final submission, all members get
-- XP" -- but nothing ever wrote to those fields. This links a submission to
-- a group and teaches admin_review_submission to award XP to every current
-- member of the group instead of just the submitter.

alter table public.submissions
  add column if not exists group_id uuid references public.project_groups(id) on delete set null;

create index if not exists submissions_group_id_idx
  on public.submissions(group_id)
  where group_id is not null;

create or replace function public.admin_review_submission(
  p_submission_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed submissions%rowtype;
  member contributors%rowtype;
  next_xp integer;
  next_rank text;
  history_action text;
  group_member record;
begin
  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid submission status';
  end if;

  select * into reviewed
  from submissions
  where id = p_submission_id
  for update;

  if not found then raise exception 'Submission not found'; end if;
  if reviewed.status <> 'pending' then
    raise exception 'Submission was already %', reviewed.status;
  end if;

  if p_status = 'approved' then
    if reviewed.bounty_id is not null then
      update bounties
      set status = 'completed', completed_at = now()
      where id = reviewed.bounty_id
        and claimed_by = reviewed.codyza_id
        and status = 'claimed';
    end if;

    history_action := 'Approved submission:' || reviewed.id::text;

    if reviewed.group_id is not null then
      -- Group submission: every current member earns the full XP, not a split.
      for group_member in
        select codyza_id from group_members where group_id = reviewed.group_id
      loop
        if coalesce(reviewed.xp_earned, 0) > 0
          and not exists (
            select 1 from xp_history
            where codyza_id = group_member.codyza_id
              and action = history_action
          ) then
          select * into member from contributors where codyza_id = group_member.codyza_id for update;
          if found then
            next_xp := coalesce(member.xp, 0) + reviewed.xp_earned;
            next_rank := case
              when next_xp >= 35000 then 'Codyza Fellow'
              when next_xp >= 20000 then 'Distinguished Engineer'
              when next_xp >= 12000 then 'Principal Engineer'
              when next_xp >= 7000 then 'Staff Engineer'
              when next_xp >= 3500 then 'Senior Engineer'
              when next_xp >= 1500 then 'Software Engineer'
              when next_xp >= 500 then 'Associate Engineer'
              else 'Apprentice'
            end;

            update contributors
            set xp = next_xp,
                rank = next_rank,
                streak = case
                  when member.last_submission is not null
                    and now() - member.last_submission::timestamptz <= interval '7 days'
                    then coalesce(member.streak, 0) + 1
                  else 1
                end,
                last_submission = current_date
            where codyza_id = member.codyza_id;

            insert into xp_history (contributor_id, codyza_id, action, xp_change)
            values (member.id, member.codyza_id, history_action, reviewed.xp_earned);
          end if;
        end if;
      end loop;

      update project_groups set status = 'live' where id = reviewed.group_id;

    elsif coalesce(reviewed.xp_earned, 0) > 0
      and reviewed.contributor_id is not null
      and not exists (
        select 1 from xp_history
        where contributor_id = reviewed.contributor_id
          and action = history_action
      ) then
      select * into member
      from contributors
      where id = reviewed.contributor_id
      for update;
      if not found then raise exception 'Contributor not found'; end if;

      next_xp := coalesce(member.xp, 0) + reviewed.xp_earned;
      next_rank := case
        when next_xp >= 35000 then 'Codyza Fellow'
        when next_xp >= 20000 then 'Distinguished Engineer'
        when next_xp >= 12000 then 'Principal Engineer'
        when next_xp >= 7000 then 'Staff Engineer'
        when next_xp >= 3500 then 'Senior Engineer'
        when next_xp >= 1500 then 'Software Engineer'
        when next_xp >= 500 then 'Associate Engineer'
        else 'Apprentice'
      end;

      update contributors
      set xp = next_xp,
          rank = next_rank,
          streak = case
            when member.last_submission is not null
              and now() - member.last_submission::timestamptz <= interval '7 days'
              then coalesce(member.streak, 0) + 1
            else 1
          end,
          last_submission = current_date
      where id = reviewed.contributor_id;

      insert into xp_history (contributor_id, codyza_id, action, xp_change)
      values (reviewed.contributor_id, reviewed.codyza_id, history_action, reviewed.xp_earned);
    end if;
  elsif reviewed.group_id is not null then
    -- Rejected group submission: back to building so the group can revise and resubmit.
    update project_groups set status = 'building' where id = reviewed.group_id;
  end if;

  update submissions set status = p_status where id = reviewed.id;
  insert into notifications (codyza_id, type, message, link)
  values (
    reviewed.codyza_id,
    case when p_status = 'approved' then 'submission_approved' else 'submission_rejected' end,
    case when p_status = 'approved'
      then 'Your project "' || reviewed.project_name || '" was approved! +' || coalesce(reviewed.xp_earned, 0) || ' XP added.'
      else 'Your project "' || reviewed.project_name || '" was not approved this time.'
    end,
    '/member/projects'
  );

  -- Group submissions also notify every other member -- they earned the XP too.
  if reviewed.group_id is not null then
    insert into notifications (codyza_id, type, message, link)
    select gm.codyza_id,
      case when p_status = 'approved' then 'submission_approved' else 'submission_rejected' end,
      case when p_status = 'approved'
        then 'Your group project "' || reviewed.project_name || '" was approved! +' || coalesce(reviewed.xp_earned, 0) || ' XP added.'
        else 'Your group project "' || reviewed.project_name || '" was not approved this time.'
      end,
      '/member/groups'
    from group_members gm
    where gm.group_id = reviewed.group_id
      and gm.codyza_id <> reviewed.codyza_id;
  end if;

  return jsonb_build_object('id', reviewed.id, 'status', p_status);
end;
$$;

revoke all on function public.admin_review_submission(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_review_submission(uuid, text) to service_role;
