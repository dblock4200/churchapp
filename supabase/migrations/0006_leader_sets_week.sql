-- Only a group's leader can create or edit that group's week.
-- (RSVPs already have their policy from 0002_rls: members write their own.)
create policy weeks_insert on weeks for insert with check (
  group_id in (select group_id from members where user_id = auth.uid() and is_leader)
);
create policy weeks_update on weeks for update using (
  group_id in (select group_id from members where user_id = auth.uid() and is_leader)
);
