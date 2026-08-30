-- Restore the member workflows expected by the deployed API.
-- This migration is safe to run more than once.

alter table public.submissions
  add column if not exists bounty_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'submissions_bounty_id_fkey'
      and conrelid = 'public.submissions'::regclass
  ) then
    alter table public.submissions
      add constraint submissions_bounty_id_fkey
      foreign key (bounty_id) references public.bounties(id) on delete set null;
  end if;
end $$;

create index if not exists submissions_bounty_id_idx
  on public.submissions(bounty_id)
  where bounty_id is not null;

-- Review a submission as one transaction. This prevents a submission from
-- showing as approved when its XP, bounty, history, or notification failed.
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
    if coalesce(reviewed.xp_earned, 0) > 0
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

  return jsonb_build_object('id', reviewed.id, 'status', p_status);
end;
$$;

revoke all on function public.admin_review_submission(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_review_submission(uuid, text) to service_role;

-- Work-session writes are performed only by server routes. Service-role
-- credentials bypass RLS; authenticated browser clients retain read-only
-- access to their own rows from the table's original migration.
