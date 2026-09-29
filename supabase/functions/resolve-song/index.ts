// Edge Function: turn a Spotify / Apple Music / YouTube share link into a small
// song card + embeddable player URL. No secrets — it only reads public metadata
// (Spotify oEmbed, Apple's iTunes lookup, YouTube oEmbed). Nothing is scored.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Song = { platform: string; url: string; title: string; artist: string; artwork: string; embedUrl: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') return json({ error: 'no url' }, 400);
    const song = await resolve(url.trim());
    return song ? json({ song }) : json({ error: 'unsupported_link' }, 422);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

async function resolve(raw: string): Promise<Song | null> {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');

  if (host.includes('spotify.com')) return spotify(raw, u);
  if (host.includes('music.apple.com')) return apple(raw, u);
  if (host.includes('youtube.com') || host === 'youtu.be') return youtube(raw, u);
  return null;
}

async function spotify(raw: string, u: URL): Promise<Song | null> {
  const m = u.pathname.match(/\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/);
  if (!m) return null;
  const [, type, id] = m;
  let title = 'Spotify', artist = '', artwork = '';
  try {
    const o = await (await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(raw)}`)).json();
    title = o.title ?? title; artwork = o.thumbnail_url ?? '';
  } catch { /* card still renders from the embed */ }
  return { platform: 'spotify', url: raw, title, artist, artwork, embedUrl: `https://open.spotify.com/embed/${type}/${id}` };
}

async function apple(raw: string, u: URL): Promise<Song | null> {
  const trackId = u.searchParams.get('i');
  const albumId = (u.pathname.match(/\/(?:album|playlist|song)\/[^/]+\/(?:pl\.)?(\d+)/) || [])[1];
  const lookupId = trackId || albumId;
  let title = 'Apple Music', artist = '', artwork = '';
  if (lookupId) {
    try {
      const d = await (await fetch(`https://itunes.apple.com/lookup?id=${lookupId}`)).json();
      const r = d.results?.[0];
      if (r) {
        title = r.trackName || r.collectionName || title;
        artist = r.artistName || '';
        artwork = (r.artworkUrl100 || '').replace('100x100bb', '600x600bb');
      }
    } catch { /* fall through */ }
  }
  const embedUrl = raw.replace('music.apple.com', 'embed.music.apple.com');
  return { platform: 'apple', url: raw, title, artist, artwork, embedUrl };
}

async function youtube(raw: string, u: URL): Promise<Song | null> {
  let id = '';
  if (u.hostname.replace(/^www\./, '') === 'youtu.be') id = u.pathname.slice(1);
  else id = u.searchParams.get('v') || (u.pathname.match(/\/(embed|shorts)\/([A-Za-z0-9_-]+)/) || [])[2] || '';
  if (!id) return null;
  let title = 'YouTube', artist = '', artwork = '';
  try {
    const watch = `https://www.youtube.com/watch?v=${id}`;
    const o = await (await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`)).json();
    title = o.title ?? title; artist = o.author_name ?? ''; artwork = o.thumbnail_url ?? '';
  } catch { /* fall through */ }
  return { platform: 'youtube', url: raw, title, artist, artwork, embedUrl: `https://www.youtube.com/embed/${id}` };
}

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
