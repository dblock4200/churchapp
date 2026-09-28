-- Schedule: meet-ups (any member) and group events (leader). Gatherings come
-- from the weeks table; this adds the ad-hoc/planned items + their RSVPs.
create table events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  created_by uuid references members(id) on delete set null,
  kind text not null check (kind in ('meetup','event')),
  title text not null,
  place text,
  starts_at timestamptz not null,
  note text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create table event_rsvps (
  event_id uuid not null references events(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  going boolean not null default true,
  primary key (event_id, member_id)
);
create index on events (group_id, starts_at);

alter table events enable row level security;
alter table event_rsvps enable row level security;

-- read within your group
create policy events_read on events for select using (group_id in (select my_group_ids()) and deleted_at is null);
-- meet-ups: any member; events: leader only
create policy events_insert on events for insert with check (
  created_by = my_member_id(group_id)
  and (kind = 'meetup' or group_id in (select group_id from members where user_id = auth.uid() and is_leader))
);
-- the creator or a leader can edit/cancel
create policy events_update on events for update using (
  created_by = my_member_id(group_id)
  or group_id in (select group_id from members where user_id = auth.uid() and is_leader)
);

create policy ersvp_read on event_rsvps for select using (
  event_id in (select id from events where group_id in (select my_group_ids())));
create policy ersvp_write on event_rsvps for all
  using (member_id in (select id from members where user_id = auth.uid()))
  with check (
    member_id in (select id from members where user_id = auth.uid())
    and event_id in (select id from events where group_id in (select my_group_ids()))
  );
