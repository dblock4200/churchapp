-- Fix: the answers SELECT policy referenced the answers table in its own
-- USING clause -> infinite recursion. Move the "have I answered this week?"
-- check into a SECURITY DEFINER function (bypasses RLS, so no recursion).
create or replace function has_answered(p_week uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from answers a
    join members m on m.id = a.member_id
    where a.week_id = p_week and m.user_id = auth.uid()
  )
$$;
grant execute on function has_answered(uuid) to authenticated;

drop policy if exists answers_read on answers;
create policy answers_read on answers for select using (
  member_id = my_member_id((select group_id from weeks where id = week_id))
  or has_answered(week_id)
);
