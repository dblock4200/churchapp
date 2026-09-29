-- Photos for presence posts: a private Storage bucket, group-scoped exactly
-- like the talks bucket. (presence_posts.photo_path already exists.)
-- Objects are keyed <group_id>/<uuid>.<ext>; only group members can read/write.
insert into storage.buckets (id, name, public) values ('photos','photos', false) on conflict (id) do nothing;

create policy photos_obj_read on storage.objects for select using (
  bucket_id = 'photos' and (split_part(name,'/',1))::uuid in (select my_group_ids())
);
create policy photos_obj_write on storage.objects for insert with check (
  bucket_id = 'photos' and (split_part(name,'/',1))::uuid in (select my_group_ids())
);
