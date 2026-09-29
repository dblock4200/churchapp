import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, ScrollView } from 'react-native';
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
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // events are leader-only
  useEffect(() => { if (isEvent && member && !member.is_leader) router.replace('/'); }, [isEvent, member]);

  function parseStartsAt(): string | null {
    const m = date.trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    const t = time.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
    if (!m || !t) return null;
    let h = parseInt(t[1], 10); const min = parseInt(t[2], 10);
    const ap = (t[3] || '').toLowerCase();
    if (ap === 'pm' && h < 12) h += 12; if (ap === 'am' && h === 12) h = 0;
    const d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]), h, min);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  async function save() {
    if (!title.trim()) { setErr('Give it a name.'); return; }
    const startsAt = parseStartsAt();
    if (!startsAt) { setErr('Add a date (YYYY-MM-DD) and time (e.g. 10:00am).'); return; }
    if (!member?.group_id || !member?.id) return;
    setBusy(true); setErr(null);
    const res = await repo.addEvent({ kind: isEvent ? 'event' : 'meetup', groupId: member.group_id, memberId: member.id, title, place, startsAt, note });
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    qc.invalidateQueries({ queryKey: ['schedule'] });
    router.back();
  }

  const label = (t: string) => <T variant="kicker" color={c.text2} style={{ marginBottom: 8, marginTop: 18 }}>{t}</T>;
  const field = (v: string, set: (s: string) => void, ph: string, multi = false, opts: any = {}) => (
    <View style={{ borderRadius: 16, backgroundColor: c.surface2, paddingHorizontal: 16, paddingVertical: multi ? 14 : 0, minHeight: multi ? 84 : 54, justifyContent: 'center' }}>
      <TextInput value={v} onChangeText={set} placeholder={ph} placeholderTextColor={c.text2} multiline={multi}
        style={{ color: c.text, fontSize: 16, textAlignVertical: multi ? 'top' : 'center' }} {...opts} />
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="t3">{isEvent ? 'Add a group event' : 'Suggest a meet-up'}</T>
        <View style={{ width: 52 }} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {label('What')}{field(title, setTitle, isEvent ? 'e.g. Serve night at the food bank' : 'e.g. Bible study at the park')}
        {label('Where')}{field(place, setPlace, 'e.g. Kiwanis Park — ramada 3')}
        <Row gap={12}>
          <View style={{ flex: 1 }}>{label('Date')}{field(date, setDate, '2026-10-04', false, { autoCapitalize: 'none' })}</View>
          <View style={{ flex: 1 }}>{label('Time')}{field(time, setTime, '10:00am', false, { autoCapitalize: 'none' })}</View>
        </Row>
        {label('A note (optional)')}{field(note, setNote, isEvent ? 'Details, cost, what to bring…' : 'Bring a blanket — kids welcome.', true)}
        {err ? <T variant="body" color={c.clay} style={{ marginTop: 14 }}>{err}</T> : null}
        <View style={{ marginTop: 22 }}><Button label={busy ? 'Sending…' : (isEvent ? 'Add to the schedule' : 'Send to In Between')} onPress={save} /></View>
        <T variant="body" color={c.text2} style={{ marginTop: 12, textAlign: 'center' }}>Everyone in the group will see it.</T>
      </ScrollView>
    </SafeAreaView>
  );
}
