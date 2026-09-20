// The one place that knows where data comes from. Today: in-memory mock.
// Next: replace each function body with a Supabase query (see src/lib/supabase).
import * as mock from './mock';
import { supabase } from '../lib/supabase';

const ok = <T,>(v: T) => Promise.resolve(v);

export const repo = {
  usingSupabase: !!supabase,
  getWeek: () => ok(mock.week),
  getAnswers: () => ok(mock.answers),
  getPresence: () => ok(mock.presence),
  getPost: (id: string) => ok(mock.presence.find(p => p.id === id) ?? mock.presence[0]),
  getPrayers: () => ok(mock.prayers),
  getVerses: () => ok({ query: mock.verseQuery, source: mock.verseSource, results: mock.verses }),
};
