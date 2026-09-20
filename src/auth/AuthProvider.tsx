import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Member = { id: string; group_id: string; display_name: string; is_leader: boolean; group_name?: string };
type Result = { error?: string; needsConfirm?: boolean };
type AuthValue = {
  ready: boolean;
  session: Session | null;
  member: Member | null;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  redeemInvite: (code: string, name: string) => Promise<Result>;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
};

const Ctx = createContext<AuthValue>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);

  const loadMember = useCallback(async (s: Session | null) => {
    if (!supabase || !s) { setMember(null); return; }
    const { data } = await supabase
      .from('members')
      .select('id, group_id, display_name, is_leader, groups(name)')
      .limit(1)
      .maybeSingle();
    setMember(data ? {
      id: data.id, group_id: data.group_id, display_name: data.display_name,
      is_leader: data.is_leader, group_name: (data as any).groups?.name,
    } : null);
  }, []);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    let sub: any;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      await loadMember(data.session);
      setReady(true);
      sub = supabase.auth.onAuthStateChange(async (_e, s) => {
        setSession(s);
        await loadMember(s);
      }).data.subscription;
    })();
    return () => sub?.unsubscribe?.();
  }, [loadMember]);

  const signIn = useCallback(async (email: string, password: string): Promise<Result> => {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    return error ? { error: friendly(error.message) } : {};
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<Result> => {
    if (!supabase) return { error: 'Not connected' };
    const emailRedirectTo = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), password, options: { emailRedirectTo },
    });
    if (error) return { error: friendly(error.message) };
    // If the project requires email confirmation, there's no session yet.
    return { needsConfirm: !data.session };
  }, []);

  const redeemInvite = useCallback(async (code: string, name: string): Promise<Result> => {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.rpc('redeem_invite', { p_code: code.trim(), p_name: name.trim() });
    if (error) return { error: friendly(error.message) };
    const { data } = await supabase.auth.getSession();
    await loadMember(data.session);
    return {};
  }, [loadMember]);

  const signOut = useCallback(async () => { await supabase?.auth.signOut(); setMember(null); }, []);
  const refreshMember = useCallback(async () => {
    const { data } = await supabase!.auth.getSession(); await loadMember(data.session);
  }, [loadMember]);

  return (
    <Ctx.Provider value={{ ready, session, member, signIn, signUp, redeemInvite, signOut, refreshMember }}>
      {children}
    </Ctx.Provider>
  );
}

function friendly(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'That email and password don’t match.';
  if (m.includes('already registered')) return 'There’s already an account for that email — try signing in.';
  if (m.includes('at least') || m.includes('password')) return 'Use a password of at least 6 characters.';
  return msg;
}

export const useAuth = () => useContext(Ctx);
