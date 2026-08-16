-- Track whether a member considers a work session finished or still in
-- progress. Informational only — no effect on bounties, XP, or workflow.
alter table public.work_sessions
  add column if not exists is_finished boolean;
