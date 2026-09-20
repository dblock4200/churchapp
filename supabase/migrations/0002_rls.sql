-- Row-level security. Everything is scoped to the member's own group, and the
-- answer-gate is enforced here so a client can never read others' answers early.

alter table groups enable row level security;
alter table members enable row level security;
alter table invites enable row level security;
alter table weeks enable row level security;
alter table rsvps enable row level security;
alter table answers enable row level security;
alter table presence_posts enable row level security;
alter table post_replies enable row level security;
alter table prayer_requests enable row level security;
alter table prayer_updates enable row level security;
alter table notifications enable row level security;
alter table push_tokens enable row level security;

-- Which groups the current user belongs to.
create or replace function my_group_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select group_id from members where user_id = auth.uid()
$$;

-- The current user's member row in a given group.
create or replace function my_member_id(gid uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select id from members where user_id = auth.uid() and group_id = gid limit 1
$$;

-- Group & members: readable by members of that group.
create policy grp_read on groups for select using (id in (select my_group_ids()));
create policy mem_read on members for select using (group_id in (select my_group_ids()));

-- Weeks / rsvps: read within group; write reserved for the leader (app checks is_leader).
create policy weeks_read on weeks for select using (group_id in (select my_group_ids()));
create policy rsvp_rw on rsvps for all
  using (week_id in (select id from weeks where group_id in (select my_group_ids())))
  with check (member_id = my_member_id((select group_id from weeks where id = week_id)));

-- Answers: you can always read your OWN; you can read others ONLY once you've
-- submitted your own answer for that week. This is the "locked until you answer" gate.
create policy answers_insert on answers for insert
  with check (member_id = my_member_id((select group_id from weeks where id = week_id)));
create policy answers_read on answers for select using (
  member_id = my_member_id((select group_id from weeks where id = week_id))
  or exists (
    select 1 from answers mine
    where mine.week_id = answers.week_id
      and mine.member_id = my_member_id((select group_id from weeks where id = answers.week_id))
  )
);

-- Presence + prayer: read/write within the group; a member edits only their own rows.
create policy posts_read on presence_posts for select using (group_id in (select my_group_ids()) and deleted_at is null);
create policy posts_write on presence_posts for insert with check (member_id = my_member_id(group_id));
create policy posts_own on presence_posts for update using (member_id = my_member_id(group_id));

create policy replies_read on post_replies for select using (
  post_id in (select id from presence_posts where group_id in (select my_group_ids())) and deleted_at is null);
create policy replies_write on post_replies for insert with check (
  member_id = my_member_id((select group_id from presence_posts where id = post_id)));

create policy prayers_read on prayer_requests for select using (group_id in (select my_group_ids()) and deleted_at is null);
create policy prayers_write on prayer_requests for insert with check (member_id = my_member_id(group_id));
create policy prayers_own on prayer_requests for update using (group_id in (select my_group_ids()));

create policy prupd_read on prayer_updates for select using (
  request_id in (select id from prayer_requests where group_id in (select my_group_ids())));
create policy prupd_write on prayer_updates for insert with check (
  member_id = my_member_id((select group_id from prayer_requests where id = request_id)));

-- Notifications & push tokens: strictly your own.
create policy notif_own on notifications for all using (member_id in (select id from members where user_id = auth.uid()));
create policy push_own on push_tokens for all using (member_id in (select id from members where user_id = auth.uid()));
