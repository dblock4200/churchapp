// The one place that knows where data comes from. Today: in-memory mock.
// Next: replace each function body with a Supabase query (see src/lib/supabase).
import * as mock from './mock';
import { supabase } from '../lib/supabase';

const ok = <T,>(v: T) => Promise.resolve(v);

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
  getPresence: () => ok(mock.presence),
  getPost: (id: string) => ok(mock.presence.find(p => p.id === id) ?? mock.presence[0]),
  getPrayers: () => ok(mock.prayers),
  getVerses: () => ok({ query: mock.verseQuery, source: mock.verseSource, results: mock.verses }),
};
