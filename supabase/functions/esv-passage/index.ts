// Edge Function: fetch REAL ESV passage text from Crossway's ESV API.
// The ESV is copyrighted, so we never store its text in the repo — the app
// sends verse REFERENCES and this proxy returns the licensed text at runtime,
// keeping the ESV_API_KEY secret off the client. Non-commercial use per
// Crossway's ESV API terms. The app renders the required copyright notice.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Crossway wants clean verse text; the app supplies its own reference + notice.
const PARAMS =
  'include-passage-references=false&include-verse-numbers=false' +
  '&include-first-verse-numbers=false&include-footnotes=false' +
  '&include-headings=false&include-short-copyright=false&indent-poetry=false';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const KEY = Deno.env.get('ESV_API_KEY');
    if (!KEY) return json({ error: 'esv_not_configured' }, 503);

    const { refs } = await req.json();
    if (!Array.isArray(refs) || refs.length === 0) return json({ error: 'no refs' }, 400);

    // en-dash ranges (Phil 4:6–7) must be plain hyphens for the API.
    const clean = refs.slice(0, 24).map((r: string) => String(r).replace(/[–—]/g, '-').trim());
    const q = encodeURIComponent(clean.join(';'));

    const r = await fetch(`https://api.esv.org/v3/passage/text/?q=${q}&${PARAMS}`, {
      headers: { Authorization: `Token ${KEY}` },
    });
    if (!r.ok) return json({ error: 'esv_api', detail: (await r.text()).slice(0, 200) }, 502);

    const data = await r.json();
    const passages: string[] = data.passages ?? [];
    // Map each returned passage back to the caller's original ref (same order).
    const out: Record<string, string> = {};
    refs.forEach((ref: string, i: number) => {
      const text = (passages[i] ?? '').replace(/\s+/g, ' ').replace(/\s*\(ESV\)\s*$/, '').trim();
      if (text) out[ref] = text;
    });
    return json({ passages: out });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
