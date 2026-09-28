-- The week's talk: audio in Storage, AI-written notes on the row.
create table talks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  week_id uuid references weeks(id) on delete set null,
  recorded_by uuid references members(id) on delete set null,
  audio_path text,
  duration_seconds int,
  status text not null default 'processing' check (status in ('processing','ready','failed')),
  transcript text,
  summary text,
  key_points text[],
  passages text[],
  error text,
  created_at timestamptz not null default now()
);
alter table talks enable row level security;
create policy talks_read on talks for select using (group_id in (select my_group_ids()));
create policy talks_insert on talks for insert with check (recorded_by = my_member_id(group_id));
-- notes are written by the Edge Function via the service role (bypasses RLS)

-- private Storage bucket for the audio; objects are keyed <group_id>/<uuid>.m4a
insert into storage.buckets (id, name, public) values ('talks','talks', false) on conflict (id) do nothing;
create policy talks_obj_read on storage.objects for select using (
  bucket_id = 'talks' and (split_part(name,'/',1))::uuid in (select my_group_ids())
);
create policy talks_obj_write on storage.objects for insert with check (
  bucket_id = 'talks' and (split_part(name,'/',1))::uuid in (select my_group_ids())
);
