import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
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
        // On web the magic-link returns with tokens in the URL hash — let the
        // client pick them up. On native we hand it the deep-link URL ourselves.
        detectSessionInUrl: Platform.OS === 'web',
      },
    })
  : null;

export const hasSupabase = configured;
