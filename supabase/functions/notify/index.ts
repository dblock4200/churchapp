// Edge Function: send a push notification for one of four group events.
// Runs with the service role so it can resolve recipients + read their push
// tokens (bypassing RLS). Sends through Expo's push service. Nothing scored.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { type, id, actorMemberId } = await req.json();
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    let recipientIds: string[] = [];
    let title = '', body = '', url = '/';

    if (type === 'reply') {
      const { data: r } = await admin.from('post_replies')
        .select('post_id, member_id, members(display_name), presence_posts(member_id)').eq('id', id).single();
      if (!r) return json({ error: 'not found' }, 404);
      const author = (r as any).presence_posts?.member_id;
      if (author && author !== r.member_id) recipientIds = [author];
      title = 'New reply';
      body = `${(r as any).members?.display_name ?? 'Someone'} replied to what you shared.`;
      url = `/post/${r.post_id}`;
    } else if (type === 'prayer') {
      const { data: pr } = await admin.from('prayer_requests')
        .select('group_id, member_id, members(display_name)').eq('id', id).single();
      if (!pr) return json({ error: 'not found' }, 404);
      const { data: ms } = await admin.from('members').select('id').eq('group_id', pr.group_id).neq('id', pr.member_id);
      recipientIds = (ms ?? []).map((m: any) => m.id);
      title = 'A prayer request';
      body = `${(pr as any).members?.display_name ?? 'Someone'} asked the group to pray.`;
      url = '/between';
    } else if (type === 'week') {
      const { data: w } = await admin.from('weeks').select('group_id').eq('id', id).single();
      if (!w) return json({ error: 'not found' }, 404);
      const q = admin.from('members').select('id').eq('group_id', w.group_id);
      if (actorMemberId) q.neq('id', actorMemberId);
      const { data: ms } = await q;
      recipientIds = (ms ?? []).map((m: any) => m.id);
      title = 'This week is live';
      body = 'The new week is up — come see.';
      url = '/';
    } else if (type === 'partner') {
      const { data: pm } = await admin.from('partner_messages')
        .select('partnership_id, member_id, members(display_name), partnerships(member_a, member_b)').eq('id', id).single();
      if (!pm) return json({ error: 'not found' }, 404);
      const p = (pm as any).partnerships;
      const other = p?.member_a === pm.member_id ? p?.member_b : p?.member_a;
      if (other) recipientIds = [other];
      title = 'A note from your partner';
      body = `${(pm as any).members?.display_name ?? 'Your partner'} sent you a note.`;
      url = '/partner';
    } else {
      return json({ error: 'unknown type' }, 400);
    }

    if (recipientIds.length === 0) return json({ ok: true, sent: 0 });
    const { data: toks } = await admin.from('push_tokens').select('token').in('member_id', recipientIds);
    const tokens = (toks ?? []).map((t: any) => t.token).filter((t: string) => t?.startsWith('ExponentPushToken'));
    if (tokens.length === 0) return json({ ok: true, sent: 0 });

    const messages = tokens.map((to: string) => ({ to, title, body, sound: 'default', data: { url } }));
    const push = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    return json({ ok: true, sent: tokens.length, result: await push.json() });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
}
