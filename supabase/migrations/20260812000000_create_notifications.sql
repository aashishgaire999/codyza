-- Member activity inbox used by the notification bell and future web push.
create extension if not exists pgcrypto;

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  codyza_id text not null references contributors(codyza_id) on delete cascade,
  type text not null default 'general',
  message text not null,
  link text not null default '/member',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_member_created_idx on notifications(codyza_id, created_at desc);
alter table notifications enable row level security;
drop policy if exists "members read own notifications" on notifications;
create policy "members read own notifications" on notifications for select to authenticated using (
  exists (select 1 from contributors c where c.codyza_id = notifications.codyza_id and c.email = auth.jwt() ->> 'email')
);
