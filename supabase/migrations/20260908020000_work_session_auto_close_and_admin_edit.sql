-- Members were forgetting to clock out -- production showed sessions logged
-- at 38h47m, 24h+, etc, because duration_minutes was computed purely as
-- now() - started_at at manual clock-out time with no upper bound. Since
-- there's only ever one active session per member, a forgotten clock-out
-- doesn't stay open forever either -- it just blocks the next clock-in until
-- the member finally closes it, at which point the whole multi-day gap gets
-- saved as one bogus "completed" session.
--
-- expire_stale_work_sessions() closes out anything active for more than
-- p_max_minutes (12h by default), capping its duration at exactly that many
-- minutes. It's called lazily from application code on every read/write path
-- for work sessions rather than on a cron -- Vercel's Hobby plan only allows
-- daily cron intervals, too coarse for this.

alter table public.work_sessions
  add column if not exists edited_by_admin boolean not null default false;

create or replace function public.expire_stale_work_sessions(p_max_minutes integer default 720)
returns setof public.work_sessions
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update work_sessions
  set status = 'completed',
      ended_at = started_at + (p_max_minutes || ' minutes')::interval,
      duration_minutes = p_max_minutes,
      summary = coalesce(summary, 'Auto clocked out -- exceeded ' || (p_max_minutes / 60) || 'h session cap'),
      is_finished = false
  where status = 'active'
    and started_at < now() - (p_max_minutes || ' minutes')::interval
  returning *;
end;
$$;

revoke all on function public.expire_stale_work_sessions(integer) from public, anon, authenticated;
grant execute on function public.expire_stale_work_sessions(integer) to service_role;
