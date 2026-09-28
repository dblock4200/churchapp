// ESV passage client. Sends verse REFERENCES to the esv-passage Edge Function
// (which holds the licensed API key) and returns the ESV text, keyed by ref.
// Results are cached locally for performance (permitted by the ESV API terms).
// If the ESV isn't configured or the network fails, this returns {} and the
// verse finder falls back to the bundled public-domain text.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export const ESV_LABEL = 'ESV';
// Crossway requires this notice wherever ESV text is displayed.
export const ESV_NOTICE =
  'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard ' +
  'Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. ' +
  'Used by permission. All rights reserved.';

const CACHE_PREFIX = 'esv:v1:';

async function cacheGet(ref: string): Promise<string | null> {
  try { return await AsyncStorage.getItem(CACHE_PREFIX + ref); } catch { return null; }
}
async function cacheSet(map: Record<string, string>) {
  try {
    await AsyncStorage.multiSet(Object.entries(map).map(([k, v]) => [CACHE_PREFIX + k, v]));
  } catch { /* caching is best-effort */ }
}

// Returns { [ref]: esvText } for every ref it could resolve. Missing refs are
// simply absent — the caller decides how to fall back.
export async function fetchEsv(refs: string[]): Promise<Record<string, string>> {
  if (!supabase || refs.length === 0) return {};
  const out: Record<string, string> = {};
  const missing: string[] = [];
  for (const ref of refs) {
    const hit = await cacheGet(ref);
    if (hit) out[ref] = hit; else missing.push(ref);
  }
  if (missing.length === 0) return out;

  try {
    const { data, error } = await supabase.functions.invoke('esv-passage', { body: { refs: missing } });
    if (error || !data?.passages) return out; // fall back for the missing ones
    const fresh = data.passages as Record<string, string>;
    Object.assign(out, fresh);
    await cacheSet(fresh);
  } catch { /* offline or not configured — fall back */ }
  return out;
}
