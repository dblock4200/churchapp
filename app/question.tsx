import React, { useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Kicker, Row, Stack, PersonLine, Hairline, Button } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useWeek, useAnswerState } from '../src/data/hooks';
import { useAuth } from '../src/auth/AuthProvider';
import { repo } from '../src/data/repo';

function BackHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  const c = useColors();
  const router = useRouter();
  return (
    <Row style={{ height: 44, justifyContent: 'space-between' }}>
      <Pressable onPress={() => router.back()}>
        <Row gap={5}>
          <Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} />
          <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>{label}</T>
        </Row>
      </Pressable>
      {right}
    </Row>
  );
}

export default function Question() {
  const c = useColors();
  const { data: w } = useWeek();
  const { member } = useAuth();
  const { data: state, isLoading } = useAnswerState();
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    if (!w?.id || !member?.id || !draft.trim()) return;
    setBusy(true); setErr(null);
    const res = await repo.submitAnswer(w.id, member.id, draft);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    setDraft('');
    qc.invalidateQueries({ queryKey: ['answerState'] });
    qc.invalidateQueries({ queryKey: ['week'] });
  }

  const others = state?.others ?? [];
  const answered = state?.answered;

  return (
    <Screen>
      <BackHeader label="This Week" />
      <Kicker style={{ marginTop: 10 }}>The question</Kicker>
      <T variant="t2" style={{ marginTop: 10 }}>{w?.question}</T>
      <View style={{ marginTop: 16 }}><Hairline /></View>

      {isLoading || !state ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
      ) : !answered ? (
        // ── Locked: write yours first ──────────────────────────────
        <>
          <T variant="body" color={c.text2} style={{ marginTop: 16 }}>
            {state.count === 0
              ? 'No one has written yet — you can be the first.'
              : `${state.count} ${state.count === 1 ? 'person has' : 'have'} written theirs. They open once you send yours.`}
          </T>
          <View style={{ marginTop: 16, minHeight: 150, borderRadius: 22, backgroundColor: c.surface2, padding: 16 }}>
            <TextInput
              value={draft} onChangeText={setDraft} multiline
              placeholder="Start anywhere. A sentence is enough." placeholderTextColor={c.text2}
              style={{ color: c.text, fontSize: 17, lineHeight: 26, minHeight: 118, textAlignVertical: 'top' }}
            />
          </View>
          <T variant="kicker" color={c.text2} style={{ marginTop: 10 }}>Only {w?.groupName ?? 'the group'} can read this</T>
          {err ? <T variant="body" color={c.clay} style={{ marginTop: 10 }}>{err}</T> : null}
          <View style={{ marginTop: 16, opacity: draft.trim() && !busy ? 1 : 0.5 }} pointerEvents={draft.trim() && !busy ? 'auto' : 'none'}>
            <Button label={busy ? 'Sending…' : 'Send my answer'} onPress={send} />
          </View>
        </>
      ) : (
        // ── Open: everyone's answers ───────────────────────────────
        <>
          <T variant="body" color={c.text2} style={{ marginTop: 16 }}>
            You answered {state.mine?.when}. {others.length > 0 ? 'Everyone’s is below, in the order it was written.' : 'You’re the first — others will appear here as they write.'}
          </T>
          <Stack gap={24} style={{ marginTop: 20 }}>
            <View>
              <PersonLine name={member?.display_name ?? 'You'} meta="you" />
              <T variant="scripture" style={{ fontSize: 17, lineHeight: 30, marginTop: 10 }}>{state.mine?.text}</T>
            </View>
            {others.map(a => (
              <View key={a.id}>
                <PersonLine name={a.author} meta={a.when} />
                <T variant="scripture" style={{ fontSize: 17, lineHeight: 30, marginTop: 10 }}>{a.text}</T>
              </View>
            ))}
          </Stack>
        </>
      )}
    </Screen>
  );
}
