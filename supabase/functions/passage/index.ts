// Edge Function: resolve a single Bible reference to REAL scripture text.
// ESV (licensed, via the ESV API) when ESV_API_KEY is configured; otherwise the
// World English Bible (public domain, via bible-api.com). Never generates text.
// Used to auto-link the passages in a talk's AI notes to their actual verses.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ESV_PARAMS =
  'include-passage-references=false&include-verse-numbers=false' +
  '&include-first-verse-numbers=false&include-footnotes=false' +
  '&include-headings=false&include-short-copyright=false&indent-poetry=false';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { ref } = await req.json();
    if (!ref || typeof ref !== 'string') return json({ error: 'no ref' }, 400);
    const clean = ref.replace(/[–—]/g, '-').trim();

    const KEY = Deno.env.get('ESV_API_KEY');
    if (KEY) {
      const r = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(clean)}&${ESV_PARAMS}`,
        { headers: { Authorization: `Token ${KEY}` } });
      if (r.ok) {
        const d = await r.json();
        const text = (d.passages?.[0] ?? '').replace(/\s+/g, ' ').replace(/\s*\(ESV\)\s*$/, '').trim();
        if (text) return json({ ref, text, translation: 'ESV' });
      }
      // fall through to WEB if ESV fails
    }

    const w = await fetch(`https://bible-api.com/${encodeURIComponent(clean)}?translation=web`);
    if (!w.ok) return json({ error: 'not_found' }, 404);
    const wd = await w.json();
    const text = (wd.text ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return json({ error: 'not_found' }, 404);
    return json({ ref: wd.reference ?? ref, text, translation: 'World English Bible' });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
