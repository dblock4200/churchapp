import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Row, Button } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';
import { repo } from '../src/data/repo';

export default function NewEvent() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { kind } = useLocalSearchParams<{ kind: string }>();
  const isEvent = kind === 'event';

  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [when, setWhen] = useState(() => { const d = new Date(); d.setSeconds(0, 0); d.setMinutes(0); d.setHours(d.getHours() + 1); return d; });
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { if (isEvent && member && !member.is_leader) router.replace('/'); }, [isEvent, member]);

  function setDate(d: Date) { const n = new Date(when); n.setFullYear(d.getFullYear(), d.getMonth(), d.getDate()); setWhen(n); }
  function setTime(d: Date) { const n = new Date(when); n.setHours(d.getHours(), d.getMinutes(), 0, 0); setWhen(n); }

  async function save() {
    if (!title.trim()) { setErr('Give it a name.'); return; }
    if (!member?.group_id || !member?.id) return;
    setBusy(true); setErr(null);
    const res = await repo.addEvent({ kind: isEvent ? 'event' : 'meetup', groupId: member.group_id, memberId: member.id, title, place, startsAt: when.toISOString(), note });
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    qc.invalidateQueries({ queryKey: ['schedule'] });
    router.back();
  }

  const label = (t: string) => <T variant="kicker" color={c.text2} style={{ marginBottom: 8, marginTop: 18 }}>{t}</T>;
  const field = (v: string, set: (s: string) => void, ph: string, multi = false) => (
    <View style={{ borderRadius: 16, backgroundColor: c.surface2, paddingHorizontal: 16, paddingVertical: multi ? 14 : 0, minHeight: multi ? 84 : 54, justifyContent: 'center' }}>
      <TextInput value={v} onChangeText={set} placeholder={ph} placeholderTextColor={c.text2} multiline={multi}
        style={{ color: c.text, fontSize: 16, textAlignVertical: multi ? 'top' : 'center' }} />
    </View>
  );
  const prettyWhen = when.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ' · ' + when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="t3">{isEvent ? 'Add a group event' : 'Suggest a meet-up'}</T>
        <View style={{ width: 52 }} />
      </Row>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {label('What')}{field(title, setTitle, isEvent ? 'e.g. Serve night at the food bank' : 'e.g. Bible study at the park')}
        {label('Where')}{field(place, setPlace, 'e.g. Kiwanis Park — ramada 3')}

        {label('When')}
        <View style={{ borderRadius: 16, backgroundColor: c.surface2, paddingHorizontal: 14, paddingVertical: 14 }}>
          <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>{prettyWhen}</T>
          {Platform.OS === 'web' ? (
            <T variant="body" color={c.text2} style={{ fontSize: 13, marginTop: 8 }}>Pick the day and time on the app.</T>
          ) : (
            <View style={{ marginTop: 6 }}>
              <View style={{ alignItems: 'center' }}>
                <DateTimePicker value={when} mode="date" display="inline" onChange={(_e, d) => d && setDate(d)} themeVariant="dark" accentColor={c.accent} />
              </View>
              <View style={{ alignItems: 'center' }}>
                <DateTimePicker value={when} mode="time" display="spinner" onChange={(_e, d) => d && setTime(d)} themeVariant="dark" />
              </View>
            </View>
          )}
        </View>

        {label('A note (optional)')}{field(note, setNote, isEvent ? 'Details, cost, what to bring…' : 'Bring a blanket — kids welcome.', true)}
        {err ? <T variant="body" color={c.clay} style={{ marginTop: 14 }}>{err}</T> : null}
        <View style={{ marginTop: 22 }}><Button label={busy ? 'Sending…' : (isEvent ? 'Add to the schedule' : 'Send to Philia')} onPress={save} /></View>
        <T variant="body" color={c.text2} style={{ marginTop: 12, textAlign: 'center' }}>Everyone in the group will see it.</T>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
