-- Anchor / Tuesday Night — initial schema.
-- Private, invite-only. One group of ~9. Nothing is scored: no counts,
-- streaks, or "who prayed" tallies are stored anywhere.
-- Run in Supabase → SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- ── Group & membership ──────────────────────────────────────────────────
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Tuesday Night',
  created_at timestamptz not null default now()
);

create table members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  is_leader boolean not null default false,
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

-- Invite-only: leader creates a code, new member redeems it on first sign-in.
create table invites (
  code text primary key,
  group_id uuid not null references groups(id) on delete cascade,
  created_by uuid references auth.users(id),
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days')
);

-- ── The Week ────────────────────────────────────────────────────────────
create table weeks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  starts_on date not null,
  passage_ref text not null,
  question text not null,
  host_member_id uuid references members(id),
  host_when text,                       -- e.g. 'Tuesday · 7:00pm'
  memory_verse_ref text,
  memory_verse_text text,
  recap text,                           -- filled in after the gathering
  created_at timestamptz not null default now(),
  unique (group_id, starts_on)
);

create table rsvps (
  week_id uuid not null references weeks(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  coming boolean not null default true,
  primary key (week_id, member_id)
);

-- One answer per member per week. The gate (can't read others until you've
-- written yours) is enforced by the RLS policy below, not just the UI.
create table answers (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references weeks(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  unique (week_id, member_id)
);

-- ── The Between ─────────────────────────────────────────────────────────
create table presence_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  photo_path text,                      -- Supabase Storage path; null = no photo
  created_at timestamptz not null default now(),
  deleted_at timestamptz               -- soft delete; heavy content is never hard-erased in-app
);

create table post_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references presence_posts(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table prayer_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  on_behalf_of text,                    -- name/label when it's for someone outside the group
  answered_at timestamptz,              -- set when the group marks it answered (sage state)
  follow_up_due_on date,                -- when the app should quietly circle back (clay state)
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table prayer_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references prayer_requests(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Deep-link targets for the two notifications (reply on your post, prayer follow-up).
create table notifications (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  kind text not null check (kind in ('reply','prayer_followup')),
  target_route text not null,           -- e.g. '/post/<id>' or '/(tabs)/between?seg=Prayer'
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table push_tokens (
  member_id uuid not null references members(id) on delete cascade,
  token text not null,
  platform text,
  updated_at timestamptz not null default now(),
  primary key (member_id, token)
);

create index on presence_posts (group_id, created_at desc);
create index on prayer_requests (group_id, created_at desc);
create index on answers (week_id);
