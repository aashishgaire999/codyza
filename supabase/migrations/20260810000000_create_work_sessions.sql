create table if not exists public.work_sessions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.contributors(id) on delete cascade,
  codyza_id text not null,
  bounty_id uuid references public.bounties(id) on delete set null,
  group_id uuid references public.project_groups(id) on delete set null,
  label text check (label is null or char_length(label) between 1 and 160),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  summary text check (summary is null or char_length(summary) between 1 and 2000),
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  constraint work_session_source check (not (bounty_id is not null and group_id is not null)),
  constraint completed_session_fields check (
    status <> 'completed' or (ended_at is not null and duration_minutes is not null and summary is not null)
  )
);

create unique index if not exists one_active_work_session_per_member
  on public.work_sessions(contributor_id)
  where status = 'active';

create index if not exists work_sessions_member_started_idx
  on public.work_sessions(contributor_id, started_at desc);

create index if not exists work_sessions_status_started_idx
  on public.work_sessions(status, started_at desc);

alter table public.work_sessions enable row level security;

drop policy if exists "members read own sessions" on public.work_sessions;
create policy "members read own sessions"
  on public.work_sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.contributors contributor
      where contributor.id = work_sessions.contributor_id
        and contributor.email = auth.jwt() ->> 'email'
    )
  );

-- Session writes go through authenticated server routes using the service role.
