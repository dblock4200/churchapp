import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Stack } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';

type Mode = 'signin' | 'signup';

export default function SignIn() {
  const c = useColors();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const ready = emailOk && password.length >= 6 && !busy;

  async function submit() {
    setBusy(true); setErr(null);
    const res = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    if (res.needsConfirm) { setConfirm(true); return; }
    // success: the route guard takes it from here (→ join, or → the app)
  }

  if (confirm) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.ground }}>
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={26} color={c.sageInk} strokeWidth={2.4} />
          </View>
          <T variant="t1" style={{ marginTop: 20 }}>Confirm your email</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 17, lineHeight: 25 }}>
            We sent a confirmation link to <T variant="body" color={c.text} style={{ fontSize: 17, fontWeight: '700' }}>{email.trim()}</T>.
            Tap it once, then come back and sign in with your password.
          </T>
          <Pressable onPress={() => { setConfirm(false); setMode('signin'); }} style={{ marginTop: 24 }}>
            <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Back to sign in</T>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const inputRow = (child: React.ReactNode) => (
    <View style={{ height: 56, borderRadius: 28, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>{child}</View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.ground }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.pill, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="bookmark" size={26} color={c.accent} strokeWidth={2} />
        </View>
        <T variant="t1" style={{ marginTop: 20 }}>Tuesday Night</T>
        <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 17, lineHeight: 25 }}>
          {mode === 'signin'
            ? 'Welcome back. Sign in to see this week.'
            : 'First time? Create your sign-in, then enter your group’s invite code.'}
        </T>

        <Stack gap={12} style={{ marginTop: 24 }}>
          {inputRow(
            <TextInput value={email} onChangeText={setEmail}
              placeholder="you@email.com" placeholderTextColor={c.text2}
              autoCapitalize="none" autoCorrect={false} keyboardType="email-address" inputMode="email"
              style={{ flex: 1, color: c.text, fontSize: 17 }} />
          )}
          {inputRow(<>
            <TextInput value={password} onChangeText={setPassword}
              placeholder="Password" placeholderTextColor={c.text2}
              autoCapitalize="none" autoCorrect={false} secureTextEntry={!show}
              onSubmitEditing={() => ready && submit()}
              style={{ flex: 1, color: c.text, fontSize: 17 }} />
            <Pressable onPress={() => setShow(s => !s)} hitSlop={10}>
              <T variant="body" color={c.text2} style={{ fontSize: 14, fontWeight: '700' }}>{show ? 'Hide' : 'Show'}</T>
            </Pressable>
          </>)}
        </Stack>

        {err ? <T variant="body" color={c.clay} style={{ marginTop: 10 }}>{err}</T> : null}

        <View style={{ marginTop: 16, opacity: ready ? 1 : 0.5 }} pointerEvents={ready ? 'auto' : 'none'}>
          <Button label={busy ? 'One moment…' : (mode === 'signin' ? 'Sign in' : 'Create account')} onPress={submit} />
        </View>

        <View style={{ marginTop: 18, flexDirection: 'row', justifyContent: 'center' }}>
          <T variant="body" color={c.text2} style={{ fontSize: 15 }}>
            {mode === 'signin' ? 'New to the group? ' : 'Already have an account? '}
          </T>
          <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErr(null); }}>
            <T variant="body" color={c.accent} style={{ fontSize: 15, fontWeight: '700' }}>
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </T>
          </Pressable>
        </View>

        <T variant="body" color={c.text2} style={{ marginTop: 18, textAlign: 'center', fontSize: 13.5, lineHeight: 20 }}>
          Tuesday Night is invite-only — you’ll need a code from your group to join.
        </T>
      </View>
    </SafeAreaView>
  );
}
