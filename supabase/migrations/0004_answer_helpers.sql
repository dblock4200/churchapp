-- A leak-proof count for the "locked" state: how many have answered a week,
-- with no access to the answer text. Only members of the week's group can call it.
create or replace function week_answer_count(p_week uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int
  from answers a
  join weeks w on w.id = a.week_id
  where a.week_id = p_week
    and w.group_id in (select group_id from members where user_id = auth.uid())
$$;
grant execute on function week_answer_count(uuid) to authenticated;
