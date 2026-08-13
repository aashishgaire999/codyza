-- Codyza editable-site foundation
-- Run manually in the Supabase SQL editor after reviewing against production.

create extension if not exists pgcrypto;

create table if not exists site_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  content jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  public_url text not null,
  alt_text text not null default '',
  mime_type text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists news_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null,
  tag text not null default 'update' check (tag in ('launch','update','announcement')),
  cover_image_url text,
  cover_image_alt text not null default '',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news_comments (
  id uuid primary key default gen_random_uuid(),
  news_slug text not null,
  contributor_id uuid references contributors(id) on delete cascade,
  codyza_id text not null,
  member_name text not null,
  body text not null check (char_length(body) between 1 and 1200),
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz not null default now()
);

create index if not exists news_comments_slug_created_idx on news_comments(news_slug, created_at);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  kind text not null default 'general' check (kind in ('general','meeting','release','urgent')),
  meeting_url text,
  starts_at timestamptz,
  ends_at timestamptz,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists work_sessions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references contributors(id) on delete cascade,
  codyza_id text not null,
  bounty_id uuid references bounties(id) on delete set null,
  group_id uuid references project_groups(id) on delete set null,
  label text check (label is null or char_length(label) between 1 and 160),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  summary text check (summary is null or char_length(summary) between 1 and 2000),
  status text not null default 'active' check (status in ('active','completed','cancelled')),
  created_at timestamptz not null default now(),
  constraint work_session_source check (not (bounty_id is not null and group_id is not null)),
  constraint completed_session_fields check (
    status <> 'completed' or (ended_at is not null and duration_minutes is not null and summary is not null)
  )
);

create unique index if not exists one_active_work_session_per_member
  on work_sessions(contributor_id) where status = 'active';

create index if not exists work_sessions_member_started_idx
  on work_sessions(contributor_id, started_at desc);

create index if not exists work_sessions_status_started_idx
  on work_sessions(status, started_at desc);

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update set public = excluded.public;

alter table site_content enable row level security;
alter table media_assets enable row level security;
alter table news_posts enable row level security;
alter table news_comments enable row level security;
alter table announcements enable row level security;
alter table notifications enable row level security;
alter table work_sessions enable row level security;

drop policy if exists "public reads published site content" on site_content;
create policy "public reads published site content" on site_content for select using (published = true);
drop policy if exists "public reads media metadata" on media_assets;
create policy "public reads media metadata" on media_assets for select using (true);
drop policy if exists "public reads published news" on news_posts;
create policy "public reads published news" on news_posts for select using (status = 'published' and published_at <= now());
drop policy if exists "public reads published comments" on news_comments;
create policy "public reads published comments" on news_comments for select using (status = 'published');
drop policy if exists "members read announcements" on announcements;
create policy "members read announcements" on announcements for select to authenticated using (published = true);
drop policy if exists "members read own notifications" on notifications;
create policy "members read own notifications" on notifications for select to authenticated using (
  exists (select 1 from contributors c where c.codyza_id = notifications.codyza_id and c.email = auth.jwt() ->> 'email')
);
drop policy if exists "members read own sessions" on work_sessions;
create policy "members read own sessions" on work_sessions for select to authenticated using (
  exists (select 1 from contributors c where c.id = work_sessions.contributor_id and c.email = auth.jwt() ->> 'email')
);

-- Writes are intentionally performed only by server routes using the service-role key.
