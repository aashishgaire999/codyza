-- Least-privilege access for Codyza core tables.
-- Server mutations use the service role; browsers receive only the public
-- directory/project fields required by the public website.

alter table public.applications enable row level security;
alter table public.contributors enable row level security;
alter table public.submissions enable row level security;
alter table public.bounties enable row level security;
alter table public.project_groups enable row level security;
alter table public.group_members enable row level security;
alter table public.reactions enable row level security;
alter table public.notifications enable row level security;
alter table public.work_sessions enable row level security;

do $$
declare policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'applications', 'contributors', 'submissions', 'bounties',
        'project_groups', 'group_members', 'reactions', 'notifications',
        'work_sessions'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', policy_row.policyname, policy_row.schemaname, policy_row.tablename);
  end loop;
end $$;

revoke all on table public.applications from anon, authenticated;
revoke all on table public.contributors from anon, authenticated;
revoke all on table public.submissions from anon, authenticated;
revoke all on table public.bounties from anon, authenticated;
revoke all on table public.project_groups from anon, authenticated;
revoke all on table public.group_members from anon, authenticated;
revoke all on table public.reactions from anon, authenticated;
revoke all on table public.notifications from anon, authenticated;
revoke all on table public.work_sessions from anon, authenticated;

grant select (
  id, codyza_id, name, github, role, level, xp, rank, streak,
  joined_at, avatar_url, bio, is_crew, skills, last_submission
) on public.contributors to anon, authenticated;

grant select (
  id, contributor_id, codyza_id, project_name, github_url, live_url,
  description, tech_stack, ai_score, ai_feedback, ai_review, xp_earned,
  status, submitted_at
) on public.submissions to anon, authenticated;

create policy "public reads contributor directory"
  on public.contributors for select to anon, authenticated using (true);

create policy "public reads approved submissions"
  on public.submissions for select to anon using (status = 'approved');

create policy "members read approved or own submissions"
  on public.submissions for select to authenticated using (
    status = 'approved'
    or exists (
      select 1 from public.contributors contributor
      where contributor.id = submissions.contributor_id
        and contributor.email = auth.jwt() ->> 'email'
    )
  );

-- Applications, notifications, work sessions, bounties, groups and reactions
-- are intentionally available only through authenticated server routes.
