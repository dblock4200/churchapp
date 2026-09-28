// The one place that knows where data comes from. Today: in-memory mock.
// Next: replace each function body with a Supabase query (see src/lib/supabase).
import * as mock from './mock';
import { supabase } from '../lib/supabase';

const ok = <T,>(v: T) => Promise.resolve(v);

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
        groupName: (data as any).groups?.name ?? 'Tuesday Night',
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
      .select('id, body, photo_path, created_at, members(display_name)')
      .is('deleted_at', null).order('created_at', { ascending: false });
    return (data ?? []).map((r: any) => ({
      id: r.id, author: r.members?.display_name ?? 'Someone',
      when: timeLabel(r.created_at), day: dayLabel(r.created_at),
      text: r.body, hasPhoto: !!r.photo_path,
    }));
  },
  async getPost(id: string) {
    if (!supabase) return mock.presence.find(p => p.id === id) ?? mock.presence[0];
    const { data: p } = await supabase.from('presence_posts')
      .select('id, body, photo_path, created_at, members(display_name)').eq('id', id).maybeSingle();
    if (!p) return null;
    const { data: reps } = await supabase.from('post_replies')
      .select('id, body, created_at, members(display_name)').eq('post_id', id).is('deleted_at', null)
      .order('created_at', { ascending: true });
    return {
      id: p.id, author: (p as any).members?.display_name ?? 'Someone',
      when: timeLabel(p.created_at), day: dayLabel(p.created_at), text: p.body, hasPhoto: !!p.photo_path,
      replies: (reps ?? []).map((r: any) => ({ id: r.id, author: r.members?.display_name ?? 'Someone', when: timeLabel(r.created_at), text: r.body })),
    };
  },
  async addPost(groupId: string, memberId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('presence_posts').insert({ group_id: groupId, member_id: memberId, body: body.trim() });
    return error ? { error: error.message } : {};
  },
  async addReply(postId: string, memberId: string, body: string): Promise<{ error?: string }> {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.from('post_replies').insert({ post_id: postId, member_id: memberId, body: body.trim() });
    return error ? { error: error.message } : {};
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
    const { error } = await supabase.from('prayer_requests').insert({
      group_id: groupId, member_id: memberId, body: body.trim(), on_behalf_of: onBehalfOf?.trim() || null,
    });
    return error ? { error: error.message } : {};
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
    const { error } = await supabase.from('weeks').insert(row);
    return error ? { error: error.message } : {};
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
      items.push({ key: 'w' + w.id, kind: 'gathering', id: w.id, title: 'Tuesday Night',
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

  async myEventRsvp(eventId: string, memberId?: string): Promise<'yes' | 'no' | null> {
    if (!supabase || !memberId) return null;
    const { data } = await supabase.from('event_rsvps').select('going').eq('event_id', eventId).eq('member_id', memberId).maybeSingle();
    return data ? (data.going ? 'yes' : 'no') : null;
  },
};

