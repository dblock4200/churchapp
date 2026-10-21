import React, { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Stack, Row } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';

type Step = 'email' | 'code';

export default function ResetPassword() {
  const c = useColors();
  const router = useRouter();
  const { requestPasswordReset, completePasswordReset } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const codeOk = code.trim().length >= 6;
  const passOk = password.length >= 6;

  async function sendCode() {
    setBusy(true); setErr(null);
    const res = await requestPasswordReset(email);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    setStep('code');
  }

  async function setNewPassword() {
    setBusy(true); setErr(null);
    const res = await completePasswordReset(email, code, password);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    setDone(true);
  }

  const inputRow = (child: React.ReactNode) => (
    <View style={{ height: 56, borderRadius: 28, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>{child}</View>
  );

  if (done) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.ground }}>
        <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: c.sage, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={26} color={c.sageInk} strokeWidth={2.4} />
          </View>
          <T variant="t1" style={{ marginTop: 20 }}>Password changed</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 17, lineHeight: 25 }}>
            You're signed in with your new password.
          </T>
          <View style={{ marginTop: 24 }}>
            <Button label="Go to Philia" onPress={() => router.replace('/')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Back</T></Pressable>
      </Row>
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingBottom: 60 }}>
        <T variant="t1">{step === 'email' ? 'Reset your password' : 'Enter the code'}</T>
        <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 17, lineHeight: 25 }}>
          {step === 'email'
            ? 'Tell us your email and we’ll send a 6-digit code to reset it.'
            : `We sent a code to ${email.trim()}. Enter it and choose a new password.`}
        </T>

        {step === 'email' ? (
          <Stack gap={12} style={{ marginTop: 24 }}>
            {inputRow(
              <TextInput value={email} onChangeText={setEmail}
                placeholder="you@email.com" placeholderTextColor={c.text2}
                autoCapitalize="none" autoCorrect={false} keyboardType="email-address" inputMode="email"
                style={{ flex: 1, color: c.text, fontSize: 17 }} />
            )}
          </Stack>
        ) : (
          <Stack gap={12} style={{ marginTop: 24 }}>
            {inputRow(
              <TextInput value={code} onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="6-digit code" placeholderTextColor={c.text2}
                keyboardType="number-pad" style={{ flex: 1, color: c.text, fontSize: 17, letterSpacing: 4 }} />
            )}
            {inputRow(<>
              <TextInput value={password} onChangeText={setPassword}
                placeholder="New password" placeholderTextColor={c.text2}
                autoCapitalize="none" autoCorrect={false} secureTextEntry={!show}
                style={{ flex: 1, color: c.text, fontSize: 17 }} />
              <Pressable onPress={() => setShow(s => !s)} hitSlop={10}>
                <T variant="body" color={c.text2} style={{ fontSize: 14, fontWeight: '700' }}>{show ? 'Hide' : 'Show'}</T>
              </Pressable>
            </>)}
          </Stack>
        )}

        {err ? <T variant="body" color={c.clay} style={{ marginTop: 10 }}>{err}</T> : null}

        {step === 'email' ? (
          <View style={{ marginTop: 16, opacity: emailOk && !busy ? 1 : 0.5 }} pointerEvents={emailOk && !busy ? 'auto' : 'none'}>
            <Button label={busy ? 'Sending…' : 'Send code'} onPress={sendCode} />
          </View>
        ) : (
          <>
            <View style={{ marginTop: 16, opacity: codeOk && passOk && !busy ? 1 : 0.5 }} pointerEvents={codeOk && passOk && !busy ? 'auto' : 'none'}>
              <Button label={busy ? 'One moment…' : 'Set new password'} onPress={setNewPassword} />
            </View>
            <Pressable onPress={sendCode} disabled={busy} style={{ marginTop: 16, alignItems: 'center' }}>
              <T variant="body" color={c.accent} style={{ fontSize: 14, fontWeight: '700' }}>Send a new code</T>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
