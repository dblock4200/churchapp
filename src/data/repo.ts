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
      if (data) {
        return {
          id: data.id,
          groupName: (data as any).groups?.name ?? 'Tuesday Night',
          memberCount: mock.week.memberCount,
          passageRef: data.passage_ref,
          question: data.question,
          hostName: mock.week.hostName,
          hostWhen: data.host_when ?? '',
          comingCount: 0,
          coming: [],
          memoryVerseRef: data.memory_verse_ref ?? '',
          memoryVerseText: data.memory_verse_text ?? '',
          youAnswered: false,
        };
      }
    }
    return mock.week;
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
  getPresence: () => ok(mock.presence),
  getPost: (id: string) => ok(mock.presence.find(p => p.id === id) ?? mock.presence[0]),
  getPrayers: () => ok(mock.prayers),
  getVerses: () => ok({ query: mock.verseQuery, source: mock.verseSource, results: mock.verses }),
};
