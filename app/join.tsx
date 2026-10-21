import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Stack } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';

export default function Join() {
  const c = useColors();
  const router = useRouter();
  const { redeemInvite, signOut } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const usernameOk = /^[a-z0-9_]{3,20}$/.test(username.trim().toLowerCase());
  const ready = code.trim().length > 0 && name.trim().length > 0 && usernameOk && !busy;

  async function join() {
    setBusy(true); setErr(null);
    const { error } = await redeemInvite(code, name, username);
    setBusy(false);
    if (error) setErr(error); else router.replace('/');
  }

  const field = (v: string, set: (s: string) => void, ph: string, opts: any = {}) => (
    <View style={{ height: 56, borderRadius: 20, backgroundColor: c.surface2, justifyContent: 'center', paddingHorizontal: 18 }}>
      <TextInput value={v} onChangeText={set} placeholder={ph} placeholderTextColor={c.text2}
        style={{ color: c.text, fontSize: 17 }} autoCorrect={false} {...opts} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.ground }}>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
        <T variant="t1">You’re in — almost.</T>
        <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 17, lineHeight: 25 }}>
          Enter the invite code your group gave you. This is the one time we’ll ask.
        </T>
        <Stack gap={12} style={{ marginTop: 24 }}>
          {field(code, setCode, 'Invite code', { autoCapitalize: 'none' })}
          {field(name, setName, 'Your name (as the group knows you)')}
          {field(username, (t: string) => setUsername(t.replace(/\s/g, '').toLowerCase()), 'Username (e.g. hannah_m)', { autoCapitalize: 'none' })}
        </Stack>
        {username.length > 0 && !usernameOk ? (
          <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 13 }}>3-20 letters, numbers, or underscores.</T>
        ) : null}
        {err ? <T variant="body" color={c.clay} style={{ marginTop: 12 }}>{err}</T> : null}
        <View style={{ marginTop: 16, opacity: ready ? 1 : 0.5 }} pointerEvents={ready ? 'auto' : 'none'}>
          <Button label={busy ? 'Joining…' : 'Join Philia'} onPress={join} />
        </View>
        <View style={{ marginTop: 14, alignItems: 'center' }}>
          <T variant="body" color={c.text2} onPress={signOut} style={{ fontSize: 14 }}>Sign out</T>
        </View>
      </View>
    </SafeAreaView>
  );
}
