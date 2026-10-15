-- Optional profile photo for a member (stored in the photos bucket, group-scoped).
alter table members add column if not exists avatar_path text;
