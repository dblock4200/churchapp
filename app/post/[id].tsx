import React, { useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Row, Stack, PersonLine } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { usePost } from '../../src/data/hooks';
import { useAuth } from '../../src/auth/AuthProvider';
import { repo } from '../../src/data/repo';

export default function PostDetail() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pid = String(id);
  const { data: p, isLoading } = usePost(pid);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!member?.id || !reply.trim()) return;
    setBusy(true);
    const res = await repo.addReply(pid, member.id, reply);
    setBusy(false);
    if (!res.error) { setReply(''); qc.invalidateQueries({ queryKey: ['post', pid] }); }
  }

  return (
    <Screen scroll={true}>
      <Row style={{ height: 44 }}>
        <Pressable onPress={() => router.back()}>
          <Row gap={5}>
            <Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} />
            <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Between</T>
          </Row>
        </Pressable>
      </Row>

      {isLoading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
      ) : p ? (
        <>
          <Card pad={16} style={{ marginTop: 4 }}>
            <PersonLine name={p.author} meta={`${(p as any).day} · ${p.when}`} />
            <T variant="body" style={{ fontSize: 17, lineHeight: 26, marginTop: 10 }}>{p.text}</T>
            {p.hasPhoto ? (
              <View style={{ height: 150, borderRadius: 16, backgroundColor: c.surface2, marginTop: 12, alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
                <Icon name="camera" size={26} color={c.text2} strokeWidth={1.5} />
              </View>
            ) : null}
          </Card>

          {p.replies.length > 0 ? (
            <Stack gap={18} style={{ marginTop: 18 }}>
              {p.replies.map(r => (
                <View key={r.id}>
                  <PersonLine name={r.author} meta={r.when} />
                  <T variant="body" style={{ marginTop: 7 }}>{r.text}</T>
                </View>
              ))}
            </Stack>
          ) : (
            <T variant="body" color={c.text2} style={{ marginTop: 20 }}>No replies yet. Be the first to say something.</T>
          )}

          <Row gap={10} style={{ marginTop: 20, marginBottom: 8 }}>
            <View style={{ flex: 1, minHeight: 50, borderRadius: 25, backgroundColor: c.surface2, justifyContent: 'center', paddingHorizontal: 20 }}>
              <TextInput value={reply} onChangeText={setReply} placeholder={`Say something to ${p.author}`} placeholderTextColor={c.text2}
                multiline style={{ color: c.text, fontSize: 16, paddingVertical: 14 }} />
            </View>
            <Pressable onPress={send} disabled={!reply.trim() || busy}
              style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', opacity: reply.trim() && !busy ? 1 : 0.5 }}>
              <Icon name="send" size={22} color={c.onAccent} strokeWidth={1.8} />
            </Pressable>
          </Row>
        </>
      ) : (
        <T variant="body" color={c.text2} style={{ marginTop: 40, textAlign: 'center' }}>This post isn’t here anymore.</T>
      )}
    </Screen>
  );
}
