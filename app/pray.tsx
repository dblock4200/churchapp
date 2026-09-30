import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Row, Button } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';
import { repo } from '../src/data/repo';

export default function Pray() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [text, setText] = useState('');
  const [forOther, setForOther] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!member?.group_id || !member?.id || !text.trim()) return;
    setBusy(true); setErr(null);
    const res = await repo.addPrayer(member.group_id, member.id, text, forOther ? name : undefined);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    qc.invalidateQueries({ queryKey: ['prayers'] });
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="t3">Ask for prayer</T>
        <View style={{ width: 52 }} />
      </Row>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
        <T variant="t1" style={{ fontSize: 25 }}>What can the group pray for?</T>
        <TextInput
          value={text} onChangeText={setText} multiline autoFocus
          placeholder="Say as much or as little as you want…" placeholderTextColor={c.text2}
          style={{ flex: 1, marginTop: 16, color: c.text, fontSize: 18, lineHeight: 27, textAlignVertical: 'top' }}
        />

        <Pressable onPress={() => setForOther(v => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
          <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: forOther ? c.accent : c.text2,
            backgroundColor: forOther ? c.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {forOther ? <Icon name="check" size={16} color={c.onAccent} strokeWidth={2.6} /> : null}
          </View>
          <T variant="body">This is for someone outside the group</T>
        </Pressable>
        {forOther ? (
          <View style={{ height: 52, borderRadius: 20, backgroundColor: c.surface2, justifyContent: 'center', paddingHorizontal: 18, marginTop: 4 }}>
            <TextInput value={name} onChangeText={setName} placeholder="Their name (optional)" placeholderTextColor={c.text2}
              style={{ color: c.text, fontSize: 16 }} />
          </View>
        ) : null}

        {err ? <T variant="body" color={c.clay} style={{ marginTop: 10 }}>{err}</T> : null}
        <View style={{ marginTop: 14, opacity: text.trim() && !busy ? 1 : 0.5 }} pointerEvents={text.trim() && !busy ? 'auto' : 'none'}>
          <Button label={busy ? 'Sharing…' : 'Ask the group to pray'} onPress={submit} />
        </View>
        <T variant="body" color={c.text2} style={{ marginTop: 12, marginBottom: 8, textAlign: 'center' }}>Only Philia sees this.</T>
      </View>
    </SafeAreaView>
  );
}
