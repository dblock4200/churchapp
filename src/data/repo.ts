// The one place that knows where data comes from. Today: in-memory mock.
// Next: replace each function body with a Supabase query (see src/lib/supabase).
import * as mock from './mock';
import { supabase } from '../lib/supabase';

const ok = <T,>(v: T) => Promise.resolve(v);

// Fire-and-forget push notification for a group event (reply/prayer/week/partner).
function fireNotify(payload: { type: string; id: string; actorMemberId?: string }) {
  supabase?.functions.invoke('notify', { body: payload }).catch(() => {});
}

function whenLabel(iso: string): string {
  const d = new Date(iso); const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return d.toLocaleDateString([], { weekday: 'long' });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}
function dateBox(d: Date): { dow: string; day: string } {
  return { dow: d.toLocaleDateString([], { weekday: 'short' }).toUpperCase(), day: String(d.getDate()) };
}
function timeText(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}
function dayLabel(iso: string): string {
  const d = new Date(iso); const now = new Date();
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'long' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export type AnswerState = {
  answered: boolean; count: number;
  mine: { id: string; text: string; when: string } | null;
  others: { id: string; author: string; text: string; when: string }[];
};

export const repo = {
  usingSupabase: !!supabase,
  getWeek: async () => {
    if (supabase) {
      const { data } = await supabase
        .from('weeks')
        .select('*, groups(name)')
        .order('starts_on', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return null;                       // real DB, no week set yet -> empty state
      let hostName = '';
      if (data.host_member_id) {
        const { data: h } = await supabase.from('members').select('display_name').eq('id', data.host_member_id).maybeSingle();
        hostName = h?.display_name ?? '';
      }
      return {
        id: data.id as string,
        groupName: (data as any).groups?.name ?? 'Philia',
        passageRef: data.passage_ref as string,
        question: data.question as string,
        hostName,
        hostMemberId: (data.host_member_id ?? null) as string | null,
        hostWhen: (data.host_when ?? '') as string,
        memoryVerseRef: (data.memory_verse_ref ?? '') as string,
        memoryVerseText: (data.memory_verse_text ?? '') as string,
      };
    }
    return mock.week as any;
  },
  getAnswers: () => ok(mock.answers),

  async getAnswerState(weekId?: string, memberId?: string): Promise<AnswerState> {
    if (!supabase || !weekId || !memberId) return { answered: false, count: 0, mine: null, others: [] };
    const [{ data: mineRow }, { data: cnt }] = await Promise.all([
      supabase.from('answers').select('id, body, created_at').eq('week_id', weekId).eq('member_id', memberId).maybeSingle(),
      supabase.rpc('week_answer_count', { p_week: weekId }),
    ]);
    const answered = !!mineRow;
    let others: AnswerState['others'] = [];
    if (answered) {
      const { data } = await supabase
        .from('answers')
        .select('id, body, created_at, members(display_name)')
        .eq('week_id', weekId).neq('member_id', memberId)
        .order('created_at', { ascending: true });
      others = (data ?? []).map((r: any) => ({
        id: r.id, author: r.members?.display_name ?? 'Someone', text: r.body, when: whenLabel(r.created_at),
      }));
    }
    return {
      answered, count: (cnt as number) ?? 0,
      mine: mineRow ? { id: mineRow.id, text: mineRow.body, when: whenLabel(mineRow.created_at) } : null,
      others,
    };
  },

  async submitAnswer(weekId: string, memberId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('answers').insert({ week_id: weekId, member_id: memberId, body: body.trim() });
    return error ? { error: error.message } : {};
  },
  async getPresence() {
    if (!supabase) return mock.presence as any[];
    const { data } = await supabase.from('presence_posts')
      .select('id, body, photo_path, song, created_at, members(display_name)')
      .is('deleted_at', null).order('created_at', { ascending: false });
    return (data ?? []).map((r: any) => ({
      id: r.id, author: r.members?.display_name ?? 'Someone',
      when: timeLabel(r.created_at), day: dayLabel(r.created_at),
      text: r.body, hasPhoto: !!r.photo_path, photoPath: r.photo_path ?? null, song: r.song ?? null,
    }));
  },
  async getPost(id: string) {
    if (!supabase) return mock.presence.find(p => p.id === id) ?? mock.presence[0];
    const { data: p } = await supabase.from('presence_posts')
      .select('id, body, photo_path, song, created_at, members(display_name)').eq('id', id).maybeSingle();
    if (!p) return null;
    const { data: reps } = await supabase.from('post_replies')
      .select('id, body, created_at, members(display_name)').eq('post_id', id).is('deleted_at', null)
      .order('created_at', { ascending: true });
    return {
      id: p.id, author: (p as any).members?.display_name ?? 'Someone',
      when: timeLabel(p.created_at), day: dayLabel(p.created_at), text: p.body, hasPhoto: !!p.photo_path, photoPath: (p as any).photo_path ?? null, song: (p as any).song ?? null,
      replies: (reps ?? []).map((r: any) => ({ id: r.id, author: r.members?.display_name ?? 'Someone', when: timeLabel(r.created_at), text: r.body })),
    };
  },
  async addPost(groupId: string, memberId: string, body: string, photoUri?: string, songUrl?: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    let photo_path: string | null = null;
    if (photoUri) {
      const ext = (photoUri.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
      const path = `${groupId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const blob = await (await fetch(photoUri)).blob();
      const up = await supabase.storage.from('photos').upload(path, blob, { contentType: blob.type || 'image/jpeg' });
      if (up.error) return { error: up.error.message };
      photo_path = path;
    }
    let song: any = null;
    if (songUrl) {
      try {
        const { data } = await supabase.functions.invoke('resolve-song', { body: { url: songUrl } });
        song = data?.song ?? null;
      } catch { /* a bad link just posts without a song card */ }
    }
    const { error } = await supabase.from('presence_posts').insert({ group_id: groupId, member_id: memberId, body: body.trim(), photo_path, song });
    return error ? { error: error.message } : {};
  },
  // Presence photos live in a private bucket; hand out a short-lived signed URL.
  async getPhotoUrl(path: string): Promise<string | null> {
    if (!supabase || !path) return null;
    const { data } = await supabase.storage.from('photos').createSignedUrl(path, 3600);
    return data?.signedUrl ?? null;
  },
  // Resolve a Bible reference (from a talk's notes) to real scripture text.
  async getPassage(ref: string): Promise<{ ref: string; text: string; translation: string } | null> {
    if (!supabase || !ref) return null;
    try {
      const { data } = await supabase.functions.invoke('passage', { body: { ref } });
      return data?.text ? data : null;
    } catch { return null; }
  },
  async savePushToken(memberId: string, token: string, platform: string): Promise<void> {
    if (!supabase) return;
    await supabase.from('push_tokens').upsert(
      { member_id: memberId, token, platform, updated_at: new Date().toISOString() },
      { onConflict: 'member_id,token' },
    );
  },
  async addReply(postId: string, memberId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { data, error } = await supabase.from('post_replies').insert({ post_id: postId, member_id: memberId, body: body.trim() }).select('id').single();
    if (error) return { error: error.message };
    fireNotify({ type: 'reply', id: data.id });
    return {};
  },
  async getPrayers() {
    if (!supabase) return mock.prayers as any[];
    const { data } = await supabase.from('prayer_requests')
      .select('id, body, on_behalf_of, answered_at, created_at, members(display_name)')
      .is('deleted_at', null).order('created_at', { ascending: false });
    return (data ?? []).map((r: any) => ({
      id: r.id, author: r.members?.display_name ?? 'Someone', when: dayLabel(r.created_at),
      text: r.body, onBehalfOf: r.on_behalf_of ?? undefined, answered: !!r.answered_at,
    }));
  },
  async addPrayer(groupId: string, memberId: string, body: string, onBehalfOf?: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { data, error } = await supabase.from('prayer_requests').insert({
      group_id: groupId, member_id: memberId, body: body.trim(), on_behalf_of: onBehalfOf?.trim() || null,
    }).select('id').single();
    if (error) return { error: error.message };
    fireNotify({ type: 'prayer', id: data.id });
    return {};
  },
  async markPrayerAnswered(id: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('prayer_requests').update({ answered_at: new Date().toISOString() }).eq('id', id);
    return error ? { error: error.message } : {};
  },
  getVerses: () => ok({ query: mock.verseQuery, source: mock.verseSource, results: mock.verses }),

  async getRsvps(weekId?: string, memberId?: string): Promise<{ coming: string[]; count: number; mine: 'yes' | 'no' | null }> {
    if (!supabase || !weekId) return { coming: [], count: 0, mine: null };
    const { data } = await supabase.from('rsvps').select('coming, member_id, members(display_name)').eq('week_id', weekId);
    const rows = (data ?? []) as any[];
    const coming = rows.filter(r => r.coming).map(r => r.members?.display_name ?? 'Someone');
    const mineRow = rows.find(r => r.member_id === memberId);
    return { coming, count: coming.length, mine: mineRow ? (mineRow.coming ? 'yes' : 'no') : null };
  },

  async setMyRsvp(weekId: string, memberId: string, coming: boolean): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('rsvps').upsert({ week_id: weekId, member_id: memberId, coming }, { onConflict: 'week_id,member_id' });
    return error ? { error: error.message } : {};
  },

  async listMembers(): Promise<{ id: string; name: string; isLeader: boolean }[]> {
    if (!supabase) return [];
    const { data } = await supabase.from('members').select('id, display_name, is_leader').order('display_name');
    return (data ?? []).map((m: any) => ({ id: m.id, name: m.display_name, isLeader: m.is_leader }));
  },

  async setWeek(f: { id?: string; groupId?: string; passageRef: string; question: string; hostMemberId?: string | null; hostWhen?: string; memoryVerseRef?: string; memoryVerseText?: string }): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const row: any = {
      passage_ref: f.passageRef.trim(), question: f.question.trim(),
      host_member_id: f.hostMemberId ?? null, host_when: f.hostWhen?.trim() || null,
      memory_verse_ref: f.memoryVerseRef?.trim() || null, memory_verse_text: f.memoryVerseText?.trim() || null,
    };
    if (f.id) {
      const { error } = await supabase.from('weeks').update(row).eq('id', f.id);
      return error ? { error: error.message } : {};
    }
    row.group_id = f.groupId; row.starts_on = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.from('weeks').insert(row).select('id').single();
    if (error) return { error: error.message };
    fireNotify({ type: 'week', id: data.id });
    return {};
  },

  async getSchedule() {
    if (!supabase) return [] as any[];
    const [{ data: weeks }, { data: events }] = await Promise.all([
      supabase.from('weeks').select('id, starts_on, host_when, host_member_id'),
      supabase.from('events').select('id, kind, title, place, starts_at, created_by, members!events_created_by_fkey(display_name), event_rsvps(going)').is('deleted_at', null),
    ]);
    const weekIds = (weeks ?? []).map((w: any) => w.id);
    const rsvpCount: Record<string, number> = {};
    if (weekIds.length) {
      const { data: rs } = await supabase.from('rsvps').select('week_id, coming').in('week_id', weekIds);
      (rs ?? []).forEach((r: any) => { if (r.coming) rsvpCount[r.week_id] = (rsvpCount[r.week_id] || 0) + 1; });
    }
    const hostIds = [...new Set((weeks ?? []).map((w: any) => w.host_member_id).filter(Boolean))];
    const hostName: Record<string, string> = {};
    if (hostIds.length) {
      const { data: hs } = await supabase.from('members').select('id, display_name').in('id', hostIds as any);
      (hs ?? []).forEach((h: any) => { hostName[h.id] = h.display_name; });
    }
    const items: any[] = [];
    (weeks ?? []).forEach((w: any) => {
      const d = new Date((w.starts_on || '') + 'T19:00:00');
      const host = w.host_member_id ? hostName[w.host_member_id] : '';
      items.push({ key: 'w' + w.id, kind: 'gathering', id: w.id, title: 'Philia',
        meta: [w.host_when, host ? host + '’s house' : ''].filter(Boolean).join(' · '),
        date: d, box: dateBox(d), going: rsvpCount[w.id] || 0 });
    });
    (events ?? []).forEach((e: any) => {
      const d = new Date(e.starts_at);
      const going = (e.event_rsvps || []).filter((r: any) => r.going).length;
      items.push({ key: 'e' + e.id, kind: e.kind, id: e.id, title: e.title,
        meta: [timeText(d), e.place, e.members?.display_name].filter(Boolean).join(' · '),
        date: d, box: dateBox(d), going });
    });
    items.sort((a, b) => a.date.getTime() - b.date.getTime());
    return items.map(({ date, ...rest }) => rest);
  },

  async getEvent(id: string) {
    if (!supabase) return null;
    const { data: e } = await supabase.from('events')
      .select('id, kind, title, place, starts_at, note, created_by, members!events_created_by_fkey(display_name)').eq('id', id).maybeSingle();
    if (!e) return null;
    const { data: rs } = await supabase.from('event_rsvps').select('going, member_id, members(display_name)').eq('event_id', id);
    const d = new Date(e.starts_at);
    const going = (rs ?? []).filter((r: any) => r.going).map((r: any) => r.members?.display_name ?? 'Someone');
    const cant = (rs ?? []).filter((r: any) => !r.going).map((r: any) => r.members?.display_name ?? 'Someone');
    return {
      id: e.id, kind: e.kind, title: e.title, place: e.place ?? '', note: e.note ?? '',
      by: (e as any).members?.display_name ?? '', createdBy: e.created_by,
      dateLabel: d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' }),
      timeLabel: timeText(d), going, cant,
    };
  },

  async addEvent(f: { kind: 'meetup' | 'event'; groupId: string; memberId: string; title: string; place?: string; startsAt: string; note?: string }): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('events').insert({
      group_id: f.groupId, created_by: f.memberId, kind: f.kind, title: f.title.trim(),
      place: f.place?.trim() || null, starts_at: f.startsAt, note: f.note?.trim() || null,
    });
    return error ? { error: error.message } : {};
  },

  async setEventRsvp(eventId: string, memberId: string, going: boolean): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('event_rsvps').upsert({ event_id: eventId, member_id: memberId, going }, { onConflict: 'event_id,member_id' });
    return error ? { error: error.message } : {};
  },

  // ── The talk (record → AI notes) ──────────────────────────────────────
  async getTalk(weekId?: string) {
    if (!supabase) return null;
    let q = supabase.from('talks')
      .select('id, status, summary, key_points, passages, duration_seconds, created_at, recorded_by, members(display_name)')
      .order('created_at', { ascending: false }).limit(1);
    if (weekId) q = q.eq('week_id', weekId);
    const { data } = await q.maybeSingle();
    if (!data) return null;
    return {
      id: data.id, status: data.status as 'processing' | 'ready' | 'failed',
      summary: data.summary ?? '', keyPoints: (data.key_points ?? []) as string[], passages: (data.passages ?? []) as string[],
      durationSeconds: data.duration_seconds ?? 0, by: (data as any).members?.display_name ?? '',
    };
  },
  async startTalk(groupId: string, weekId: string | null, memberId: string, fileUri: string, durationSeconds: number): Promise<{ error?: string; talkId?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const path = `${groupId}/${Date.now()}_${Math.random().toString(36).slice(2)}.m4a`;
    const blob = await (await fetch(fileUri)).blob();
    const up = await supabase.storage.from('talks').upload(path, blob, { contentType: 'audio/m4a' });
    if (up.error) return { error: up.error.message };
    const ins = await supabase.from('talks').insert({ group_id: groupId, week_id: weekId, recorded_by: memberId, audio_path: path, duration_seconds: durationSeconds, status: 'processing' }).select('id').single();
    if (ins.error) return { error: ins.error.message };
    supabase.functions.invoke('transcribe-talk', { body: { talkId: ins.data.id } }).catch(() => {});
    return { talkId: ins.data.id };
  },
  async retryTalk(talkId: string) {
    if (!supabase) return;
    await supabase.from('talks').update({ status: 'processing', error: null }).eq('id', talkId);
    supabase.functions.invoke('transcribe-talk', { body: { talkId } }).catch(() => {});
  },

  // ── Accountability partner ────────────────────────────────────────────
  async getPartnership(myMemberId?: string) {
    if (!supabase || !myMemberId) return null;
    const { data } = await supabase.from('partnerships')
      .select('id, status, member_a, member_b, requested_by, a:members!partnerships_member_a_fkey(display_name), b:members!partnerships_member_b_fkey(display_name)')
      .neq('status', 'ended').limit(1).maybeSingle();
    if (!data) return null;
    const iAmA = data.member_a === myMemberId;
    const partnerMemberId = iAmA ? data.member_b : data.member_a;
    const partnerName = (iAmA ? (data as any).b : (data as any).a)?.display_name ?? 'your partner';
    return {
      id: data.id, status: data.status as 'pending' | 'active',
      partnerMemberId, partnerName,
      iRequested: data.requested_by === myMemberId,
    };
  },
  async partnerCandidates(myMemberId?: string) {
    if (!supabase || !myMemberId) return [];
    const { data } = await supabase.from('members').select('id, display_name').neq('id', myMemberId).order('display_name');
    return (data ?? []).map((m: any) => ({ id: m.id, name: m.display_name }));
  },
  async askPartner(groupId: string, myMemberId: string, partnerMemberId: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('partnerships').insert({ group_id: groupId, member_a: myMemberId, member_b: partnerMemberId, requested_by: myMemberId, status: 'pending' });
    return error ? { error: error.message } : {};
  },
  async respondPartner(id: string, accept: boolean): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const patch: any = accept ? { status: 'active' } : { status: 'ended', ended_at: new Date().toISOString() };
    const { error } = await supabase.from('partnerships').update(patch).eq('id', id);
    return error ? { error: error.message } : {};
  },
  async endPartnership(id: string) {
    if (!supabase) return; await supabase.from('partnerships').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', id);
  },
  async getFocus(partnershipId: string) {
    if (!supabase) return {} as Record<string, string>;
    const { data } = await supabase.from('partner_focus').select('member_id, body').eq('partnership_id', partnershipId);
    const map: Record<string, string> = {}; (data ?? []).forEach((r: any) => { map[r.member_id] = r.body; }); return map;
  },
  async setFocus(partnershipId: string, memberId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('partner_focus').upsert({ partnership_id: partnershipId, member_id: memberId, body: body.trim(), updated_at: new Date().toISOString() }, { onConflict: 'partnership_id,member_id' });
    return error ? { error: error.message } : {};
  },
  async getPartnerMessages(partnershipId: string) {
    if (!supabase) return [] as any[];
    const { data } = await supabase.from('partner_messages').select('id, body, member_id, created_at, members(display_name)').eq('partnership_id', partnershipId).order('created_at', { ascending: true });
    return (data ?? []).map((r: any) => ({ id: r.id, memberId: r.member_id, author: r.members?.display_name ?? 'Someone', when: timeText(new Date(r.created_at)), text: r.body }));
  },
  async addPartnerMessage(partnershipId: string, memberId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { data, error } = await supabase.from('partner_messages').insert({ partnership_id: partnershipId, member_id: memberId, body: body.trim() }).select('id').single();
    if (error) return { error: error.message };
    fireNotify({ type: 'partner', id: data.id });
    return {};
  },
  async getActiveChallenge(partnershipId: string) {
    if (!supabase) return null;
    const { data } = await supabase.from('challenges').select('id, kind, title, days, started_on').eq('partnership_id', partnershipId).eq('status', 'active').order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    const start = new Date(data.started_on + 'T00:00:00'); const now = new Date();
    const dayNum = Math.min(data.days, Math.max(1, Math.floor((now.getTime() - start.getTime()) / 86400000) + 1));
    return { id: data.id, kind: data.kind, title: data.title, days: data.days, dayNum };
  },
  async startChallenge(partnershipId: string, memberId: string, kind: string, title: string, days: number): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('challenges').insert({ partnership_id: partnershipId, created_by: memberId, kind, title, days });
    return error ? { error: error.message } : {};
  },
  async endChallenge(id: string) { if (supabase) await supabase.from('challenges').update({ status: 'ended' }).eq('id', id); },

  async myEventRsvp(eventId: string, memberId?: string): Promise<'yes' | 'no' | null> {
    if (!supabase || !memberId) return null;
    const { data } = await supabase.from('event_rsvps').select('going').eq('event_id', eventId).eq('member_id', memberId).maybeSingle();
    return data ? (data.going ? 'yes' : 'no') : null;
  },
};

