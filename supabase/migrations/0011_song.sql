-- A shared song attached to a presence post. Stored as jsonb resolved at post
-- time: { platform, url, title, artist, artwork, embedUrl }. Nothing scored.
alter table presence_posts add column if not exists song jsonb;
