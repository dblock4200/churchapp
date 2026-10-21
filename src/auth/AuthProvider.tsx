import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Member = { id: string; group_id: string; display_name: string; is_leader: boolean; group_name?: string; avatar_path?: string | null; username?: string | null };
type Result = { error?: string; needsConfirm?: boolean };
type AuthValue = {
  ready: boolean;
  session: Session | null;
  member: Member | null;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  redeemInvite: (code: string, name: string, username?: string) => Promise<Result>;
  requestPasswordReset: (email: string) => Promise<Result>;
  completePasswordReset: (email: string, code: string, newPassword: string) => Promise<Result>;
  signOut: () => Promise<void>;
  refreshMember: () => Promise<void>;
};

// Password reset is fully built (reset-password screen + requestPasswordReset/
// completePasswordReset below). It stays gated until the recovery email can carry
// a 6-digit code — which needs Supabase Pro or a custom SMTP provider, since the
// free tier's default mailer only sends a link and won't allow template edits.
export const PASSWORD_RESET_ENABLED = false;

const Ctx = createContext<AuthValue>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);

  const loadMember = useCallback(async (s: Session | null) => {
    if (!supabase || !s) { setMember(null); return; }
    const { data } = await supabase
      .from('members')
      .select('id, group_id, display_name, is_leader, avatar_path, username, groups(name)')
      .eq('user_id', s.user.id)
      .limit(1)
      .maybeSingle();
    setMember(data ? {
      id: data.id, group_id: data.group_id, display_name: data.display_name,
      is_leader: data.is_leader, group_name: (data as any).groups?.name, avatar_path: (data as any).avatar_path ?? null, username: (data as any).username ?? null,
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

  const redeemInvite = useCallback(async (code: string, name: string, username?: string): Promise<Result> => {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.rpc('redeem_invite', { p_code: code.trim(), p_name: name.trim(), p_username: (username ?? '').trim() });
    if (error) return { error: friendly(error.message) };
    const { data } = await supabase.auth.getSession();
    await loadMember(data.session);
    return {};
  }, [loadMember]);

  // Password reset — mobile-friendly: Supabase emails a 6-digit recovery code,
  // the person enters it with a new password, we verify then set the password.
  const requestPasswordReset = useCallback(async (email: string): Promise<Result> => {
    if (!supabase) return { error: 'Not connected' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    return error ? { error: friendly(error.message) } : {};
  }, []);
  const completePasswordReset = useCallback(async (email: string, code: string, newPassword: string): Promise<Result> => {
    if (!supabase) return { error: 'Not connected' };
    const { error: vErr } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'recovery' });
    if (vErr) return { error: /expired|invalid|token/i.test(vErr.message) ? 'That code is wrong or has expired. Request a new one.' : friendly(vErr.message) };
    const { error: uErr } = await supabase.auth.updateUser({ password: newPassword });
    return uErr ? { error: friendly(uErr.message) } : {};
  }, []);

  const signOut = useCallback(async () => { await supabase?.auth.signOut(); setMember(null); }, []);
  const refreshMember = useCallback(async () => {
    const { data } = await supabase!.auth.getSession(); await loadMember(data.session);
  }, [loadMember]);

  return (
    <Ctx.Provider value={{ ready, session, member, signIn, signUp, redeemInvite, requestPasswordReset, completePasswordReset, signOut, refreshMember }}>
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
