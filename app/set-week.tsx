import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Row } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';
import { useWeek, useMembers } from '../src/data/hooks';
import { repo } from '../src/data/repo';

export default function SetWeek() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { data: w } = useWeek();
  const { data: members } = useMembers();

  const [passage, setPassage] = useState('');
  const [question, setQuestion] = useState('');
  const [hostId, setHostId] = useState<string | null>(null);
  const [when, setWhen] = useState('');
  const [vref, setVref] = useState('');
  const [vtext, setVtext] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Prefill from the current week when editing
  useEffect(() => {
    if (w) {
      setPassage(w.passageRef ?? ''); setQuestion(w.question ?? '');
      setHostId((w as any).hostMemberId ?? null); setWhen(w.hostWhen ?? '');
      setVref(w.memoryVerseRef ?? ''); setVtext(w.memoryVerseText ?? '');
    }
  }, [w]);

  // Leaders only
  useEffect(() => {
    if (member && !member.is_leader) router.replace('/');
  }, [member]);

  async function save() {
    if (!passage.trim() || !question.trim()) { setErr('A passage and a question are needed.'); return; }
    setBusy(true); setErr(null);
    const res = await repo.setWeek({
      id: (w as any)?.id, groupId: member?.group_id,
      passageRef: passage, question, hostMemberId: hostId, hostWhen: when,
      memoryVerseRef: vref, memoryVerseText: vtext,
    });
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    qc.invalidateQueries();
    router.back();
  }

  const label = (t: string) => <T variant="kicker" color={c.text2} style={{ marginBottom: 8, marginTop: 18 }}>{t}</T>;
  const field = (v: string, set: (s: string) => void, ph: string, multi = false) => (
    <View style={{ borderRadius: 16, backgroundColor: c.surface2, paddingHorizontal: 16, paddingVertical: multi ? 14 : 0, minHeight: multi ? 96 : 54, justifyContent: 'center' }}>
      <TextInput value={v} onChangeText={set} placeholder={ph} placeholderTextColor={c.text2} multiline={multi}
        style={{ color: c.text, fontSize: 16, lineHeight: multi ? 24 : undefined, textAlignVertical: multi ? 'top' : 'center' }} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="t3">{w ? 'Edit this week' : 'Set this week'}</T>
        <View style={{ width: 52 }} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {label('Passage')}{field(passage, setPassage, 'e.g. Romans 8:18–30')}
        {label('The question')}{field(question, setQuestion, 'What are you asking the group?', true)}
        {label('Who’s hosting')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {(members ?? []).map(m => {
            const on = hostId === m.id;
            return (
              <Pressable key={m.id} onPress={() => setHostId(on ? null : m.id)}
                style={{ height: 40, borderRadius: 20, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface2 }}>
                <T variant="body" color={on ? c.onAccent : c.text} style={{ fontWeight: '600', fontSize: 15 }}>{m.name}</T>
              </Pressable>
            );
          })}
          {(members ?? []).length === 0 ? <T variant="body" color={c.text2}>Members appear here as they join.</T> : null}
        </View>
        {label('When')}{field(when, setWhen, 'e.g. Tuesday · 7:00pm')}
        {label('Memory verse reference')}{field(vref, setVref, 'e.g. Romans 8:28')}
        {label('Memory verse text')}{field(vtext, setVtext, 'Paste the verse (World English Bible)', true)}

        {err ? <T variant="body" color={c.clay} style={{ marginTop: 14 }}>{err}</T> : null}
        <View style={{ marginTop: 22 }}><Button label={busy ? 'Saving…' : (w ? 'Save changes' : 'Set this week')} onPress={save} /></View>
      </ScrollView>
    </SafeAreaView>
  );
}
