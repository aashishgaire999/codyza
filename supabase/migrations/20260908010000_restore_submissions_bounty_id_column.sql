-- Approving ANY submission was failing in production with the raw Postgres
-- error `record "reviewed" has no field "bounty_id"` (surfaced verbatim to
-- admins in the dashboard's error banner). admin_review_submission -- as
-- redefined by 20260907000000_group_project_submissions.sql and
-- 20260908000000_submission_review_reason.sql -- reads `reviewed.bounty_id`
-- unconditionally whenever p_status = 'approved', but the live submissions
-- table does not have that column: the add-column statement in
-- 20260815000000_restore_member_workflows.sql evidently never landed (or was
-- reverted) in production, even though the function built on top of it was.
--
-- Restore the column (idempotent -- safe if it already exists) so approvals
-- work again.

alter table public.submissions
  add column if not exists bounty_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'submissions_bounty_id_fkey'
  ) then
    alter table public.submissions
      add constraint submissions_bounty_id_fkey
      foreign key (bounty_id) references public.bounties(id) on delete set null;
  end if;
end $$;

create index if not exists submissions_bounty_id_idx
  on public.submissions(bounty_id)
  where bounty_id is not null;
