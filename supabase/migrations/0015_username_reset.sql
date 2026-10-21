-- Invite-gated accounts: give each member a unique username (a public handle),
-- collected when they redeem their invite. Display name stays the warm name the
-- group sees; username is the stable @handle identity (groundwork for selling).
create extension if not exists citext;

alter table members add column if not exists username citext;
create unique index if not exists members_username_key on members (username) where username is not null;

-- redeem_invite now also accepts a username. Validates the handle shape and that
-- it isn't taken before creating the member. Old 2-arg version is replaced.
drop function if exists redeem_invite(text, text);
create or replace function redeem_invite(p_code text, p_name text default null, p_username text default null)
returns members
language plpgsql security definer set search_path = public as $$
declare inv invites; m members; uname citext;
begin
  select * into inv from invites where code = p_code;
  if inv.code is null then raise exception 'That invite code is not valid.'; end if;
  if inv.redeemed_by is not null then raise exception 'That invite has already been used.'; end if;
  if inv.expires_at < now() then raise exception 'That invite has expired.'; end if;
  if exists (select 1 from members where user_id = auth.uid() and group_id = inv.group_id) then
    raise exception 'You are already in this group.';
  end if;
  uname := nullif(lower(trim(p_username)), '');
  if uname is not null then
    if uname !~ '^[a-z0-9_]{3,20}$' then
      raise exception 'Usernames are 3-20 letters, numbers, or underscores.';
    end if;
    if exists (select 1 from members where username = uname) then
      raise exception 'That username is already taken.';
    end if;
  end if;
  insert into members (group_id, user_id, display_name, is_leader, username)
    values (inv.group_id, auth.uid(), coalesce(nullif(p_name,''), inv.display_name, 'Member'), inv.grants_leader, uname)
    returning * into m;
  update invites set redeemed_by = auth.uid(), redeemed_at = now() where code = inv.code;
  return m;
end $$;
grant execute on function redeem_invite(text, text, text) to authenticated;
