-- Members could never update their own row: there was no UPDATE policy on
-- `members`, so saving avatar_path (profile photos) silently affected 0 rows and
-- returned no error — the photo uploaded but the pointer never saved.
create policy members_update_own on members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Harden: a member may change cosmetic fields on their own row (avatar_path,
-- display_name, username) but must never escalate their role, move groups, or
-- reassign the row to someone else. Service role / SECURITY DEFINER paths bypass.
create or replace function public.guard_member_self_update()
returns trigger language plpgsql as $$
begin
  if coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'authenticated' then
    new.is_leader := old.is_leader;
    new.group_id  := old.group_id;
    new.user_id   := old.user_id;
  end if;
  return new;
end $$;
drop trigger if exists members_guard_self_update on members;
create trigger members_guard_self_update before update on members
  for each row execute function public.guard_member_self_update();
