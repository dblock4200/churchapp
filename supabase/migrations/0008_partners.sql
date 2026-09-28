-- Accountability partners: a private 1:1 within a group. Only the two people
-- in a partnership can read/write its focus, messages, and challenges.

create or replace function my_member_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from members where user_id = auth.uid()
$$;
grant execute on function my_member_ids() to authenticated;

create table partnerships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  member_a uuid not null references members(id) on delete cascade,   -- requester
  member_b uuid not null references members(id) on delete cascade,   -- invited
  requested_by uuid not null references members(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','ended')),
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  unique (member_a, member_b)
);
create table partner_focus (               -- "what each of you is carrying / praying"
  partnership_id uuid not null references partnerships(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  updated_at timestamptz not null default now(),
  primary key (partnership_id, member_id)
);
create table partner_messages (            -- the private thread + check-ins
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references partnerships(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create table challenges (                  -- shared practices (fasting, prayer, ...)
  id uuid primary key default gen_random_uuid(),
  partnership_id uuid not null references partnerships(id) on delete cascade,
  created_by uuid references members(id) on delete set null,
  kind text not null,
  title text not null,
  days int not null default 3,
  started_on date not null default current_date,
  status text not null default 'active' check (status in ('active','done','ended')),
  created_at timestamptz not null default now()
);

create or replace function in_partnership(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from partnerships p
    where p.id = pid
      and (p.member_a in (select id from members where user_id = auth.uid())
        or p.member_b in (select id from members where user_id = auth.uid()))
  )
$$;
grant execute on function in_partnership(uuid) to authenticated;

alter table partnerships enable row level security;
alter table partner_focus enable row level security;
alter table partner_messages enable row level security;
alter table challenges enable row level security;

create policy pship_read on partnerships for select using (member_a in (select my_member_ids()) or member_b in (select my_member_ids()));
create policy pship_insert on partnerships for insert with check (requested_by in (select my_member_ids()) and member_a in (select my_member_ids()) and status = 'pending');
create policy pship_update on partnerships for update using (member_a in (select my_member_ids()) or member_b in (select my_member_ids()));

create policy focus_all on partner_focus for all
  using (in_partnership(partnership_id))
  with check (in_partnership(partnership_id) and member_id in (select my_member_ids()));
create policy msg_read on partner_messages for select using (in_partnership(partnership_id));
create policy msg_write on partner_messages for insert with check (in_partnership(partnership_id) and member_id in (select my_member_ids()));
create policy ch_read on challenges for select using (in_partnership(partnership_id));
create policy ch_write on challenges for insert with check (in_partnership(partnership_id) and created_by in (select my_member_ids()));
create policy ch_update on challenges for update using (in_partnership(partnership_id));
