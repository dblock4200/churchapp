-- Let a member edit their own answer to the week's question (they could already
-- insert and read; this adds update of their own row only).
create policy answers_own on answers for update
  using (member_id in (select id from members where user_id = auth.uid()))
  with check (member_id in (select id from members where user_id = auth.uid()));
