-- Auth slice: invite redemption. Invites carry who they're for and whether the
-- code makes that person the leader. Redemption goes through a SECURITY DEFINER
-- function so the invites table itself stays closed (no RLS read access needed).

alter table invites add column if not exists display_name text;
alter table invites add column if not exists grants_leader boolean not null default false;

create or replace function redeem_invite(p_code text, p_name text default null)
returns members
language plpgsql security definer set search_path = public as $$
declare inv invites; m members;
begin
  select * into inv from invites where code = p_code;
  if inv.code is null then raise exception 'That invite code is not valid.'; end if;
  if inv.redeemed_by is not null then raise exception 'That invite has already been used.'; end if;
  if inv.expires_at < now() then raise exception 'That invite has expired.'; end if;
  if exists (select 1 from members where user_id = auth.uid() and group_id = inv.group_id) then
    raise exception 'You are already in this group.';
  end if;
  insert into members (group_id, user_id, display_name, is_leader)
    values (inv.group_id, auth.uid(), coalesce(nullif(p_name,''), inv.display_name, 'Member'), inv.grants_leader)
    returning * into m;
  update invites set redeemed_by = auth.uid(), redeemed_at = now() where code = inv.code;
  return m;
end $$;

grant execute on function redeem_invite(text, text) to authenticated;
