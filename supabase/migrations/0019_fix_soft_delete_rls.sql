-- Soft-delete was impossible: the SELECT policies required deleted_at IS NULL, so
-- the act of setting deleted_at made the row invisible to its owner mid-UPDATE,
-- which Postgres/PostgREST rejects as an RLS violation (42501). Delete silently
-- failed on the feed. Fix: let an owner still read their own just-deleted row.
-- Feed queries still filter deleted_at IS NULL, so deleted items stay hidden.
drop policy posts_read on presence_posts;
create policy posts_read on presence_posts for select using (
  group_id in (select my_group_ids())
  and (deleted_at is null or member_id = my_member_id(group_id))
);

drop policy replies_read on post_replies;
create policy replies_read on post_replies for select using (
  post_id in (select id from presence_posts where group_id in (select my_group_ids()))
  and (deleted_at is null or member_id = my_member_id((select group_id from presence_posts where id = post_id)))
);
