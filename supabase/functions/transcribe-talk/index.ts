// Edge Function: transcribe a talk's audio (Whisper) and write AI notes (gpt-4o-mini).
// Runs with the service role so it can update the talk row; the OpenAI key is a
// project secret. The notes summarize the human teacher — they never generate Scripture.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SYSTEM = `You summarize a recording of a Bible study talk given by a person.
Return ONLY JSON: {"summary": string, "key_points": string[], "passages": string[]}.
- summary: 2-3 warm, plain sentences of what the speaker said.
- key_points: 2-4 short bullets, each a sentence.
- passages: Bible references the speaker actually mentioned (e.g. "Romans 8:28"); [] if none.
Summarize only what was said. Do NOT invent Scripture, quotes, or theology. Do not speak for God.`;

Deno.serve(async (req) => {
  try {
    const { talkId } = await req.json();
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const OPENAI = Deno.env.get('OPENAI_API_KEY')!;
    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: talk, error: te } = await admin.from('talks').select('*').eq('id', talkId).single();
    if (te || !talk) return json({ error: 'talk not found' }, 404);

    // download the audio from Storage
    const { data: blob, error: de } = await admin.storage.from('talks').download(talk.audio_path);
    if (de || !blob) { await fail(admin, talkId, 'audio download failed'); return json({ error: 'audio' }, 500); }

    // 1) transcribe
    const fd = new FormData();
    fd.append('file', blob, 'audio.m4a');
    fd.append('model', 'whisper-1');
    const tr = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST', headers: { Authorization: `Bearer ${OPENAI}` }, body: fd,
    });
    if (!tr.ok) { await fail(admin, talkId, 'transcription failed: ' + (await tr.text()).slice(0, 200)); return json({ error: 'whisper' }, 500); }
    const transcript: string = (await tr.json()).text ?? '';

    // 2) notes
    const ch = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini', temperature: 0.3, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: transcript.slice(0, 60000) }],
      }),
    });
    if (!ch.ok) { await fail(admin, talkId, 'notes failed: ' + (await ch.text()).slice(0, 200)); return json({ error: 'gpt' }, 500); }
    const notes = JSON.parse((await ch.json()).choices[0].message.content);

    await admin.from('talks').update({
      status: 'ready', transcript,
      summary: notes.summary ?? '', key_points: notes.key_points ?? [], passages: notes.passages ?? [],
    }).eq('id', talkId);

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } });
}
async function fail(admin: any, id: string, msg: string) {
  await admin.from('talks').update({ status: 'failed', error: msg }).eq('id', id);
}
