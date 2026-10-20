-- Owners can edit / soft-delete their own replies (presence posts already have posts_own).
create policy replies_own on post_replies for update
  using (member_id = my_member_id((select group_id from presence_posts where id = post_id)))
  with check (member_id = my_member_id((select group_id from presence_posts where id = post_id)));

-- Group members can update a talk row (used by "Try again" to re-run the notes).
create policy talks_update on talks for update
  using (group_id in (select my_group_ids()))
  with check (group_id in (select my_group_ids()));
