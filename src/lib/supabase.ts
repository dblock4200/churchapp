// Supabase client. Reads public env (EXPO_PUBLIC_*). If the keys are not set
// yet, `supabase` is null and the app runs on mock data — so nothing breaks
// before you create the project. Fill .env from Supabase → Settings → API.
import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const configured = !!url && !!anon && !url.includes('YOUR-PROJECT-REF');

export const supabase: SupabaseClient | null = configured
  ? createClient(url!, anon!, {
      auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const hasSupabase = configured;
