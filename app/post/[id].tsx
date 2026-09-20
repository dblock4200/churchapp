import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen, Card, Row, Stack, PersonLine } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { usePost } from '../../src/data/hooks';

export default function PostDetail() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: p } = usePost(String(id));
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

      {p ? (
        <>
          <Card pad={16} style={{ marginTop: 4 }}>
            <PersonLine name={p.author} meta={`Today · ${p.when}`} />
            <T variant="body" style={{ fontSize: 17, lineHeight: 26, marginTop: 10 }}>{p.text}</T>
            {p.hasPhoto ? (
              <View style={{ height: 150, borderRadius: 16, backgroundColor: c.surface2, marginTop: 12,
                alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
                <Icon name="camera" size={26} color={c.text2} strokeWidth={1.5} />
              </View>
            ) : null}
          </Card>

          <Stack gap={18} style={{ marginTop: 18 }}>
            {p.replies.map(r => (
              <View key={r.id}>
                <PersonLine name={r.author} meta={r.when} />
                <T variant="body" style={{ marginTop: 7 }}>{r.text}</T>
              </View>
            ))}
          </Stack>

          <Row gap={10} style={{ marginTop: 20, marginBottom: 8 }}>
            <View style={{ flex: 1, height: 50, borderRadius: 25, backgroundColor: c.surface2,
              justifyContent: 'center', paddingHorizontal: 20 }}>
              <T variant="body" color={c.text2}>Say something to {p.author}</T>
            </View>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="send" size={22} color={c.onAccent} strokeWidth={1.8} />
            </View>
          </Row>
        </>
      ) : null}
    </Screen>
  );
}
