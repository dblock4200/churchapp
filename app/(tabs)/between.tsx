import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Kicker, Row, Stack, Button, PersonLine, Hairline } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { usePresence, usePrayers, useVerses } from '../../src/data/hooks';
import { repo } from '../../src/data/repo';

type Seg = 'Presence' | 'Prayer' | 'Verses';

export default function Between() {
  const c = useColors();
  const [seg, setSeg] = useState<Seg>('Presence');
  return (
    <Screen scroll={false} pad={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <T variant="t1">Between</T>
        <Row gap={26} style={{ marginTop: 16 }}>
          {(['Presence', 'Prayer', 'Verses'] as Seg[]).map((s) => {
            const on = s === seg;
            return (
              <Pressable key={s} onPress={() => setSeg(s)} style={{ paddingBottom: 10,
                borderBottomWidth: 2.5, borderBottomColor: on ? c.accent : 'transparent' }}>
                <T variant="kicker" color={on ? c.accent : c.text2} style={{ fontWeight: on ? '700' : '600' }}>{s}</T>
              </Pressable>
            );
          })}
        </Row>
      </View>
      <Hairline />
      {seg === 'Presence' && <PresenceFeed />}
      {seg === 'Prayer' && <PrayerWall />}
      {seg === 'Verses' && <VerseFinder />}
    </Screen>
  );
}

function Feed({ children, primary, onPrimary }: { children: React.ReactNode; primary?: string; onPrimary?: () => void }) {
  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>{children}</ScrollView>
      {primary ? <View style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 4 }}><Button label={primary} onPress={onPrimary} /></View> : null}
    </View>
  );
}

function Empty({ line }: { line: string }) {
  const c = useColors();
  return <T variant="body" color={c.text2} style={{ marginTop: 30, textAlign: 'center', fontSize: 16, lineHeight: 24 }}>{line}</T>;
}

function PresenceFeed() {
  const router = useRouter();
  const { data, isLoading } = usePresence();
  const posts = (data ?? []) as any[];
  let lastDay = '';
  return (
    <Feed primary="Something you noticed" onPrimary={() => router.push('/compose')}>
      {isLoading ? null : posts.length === 0 ? (
        <Empty line="Nothing yet. When someone notices God in their week — a song, a small answer — it shows up here." />
      ) : (
        <Stack gap={12}>
          {posts.map(p => {
            const header = p.day !== lastDay ? p.day : null; lastDay = p.day;
            return (
              <View key={p.id}>
                {header ? <View style={{ marginBottom: 8, marginTop: header && posts.indexOf(p) ? 6 : 0 }}><Kicker>{header}</Kicker></View> : null}
                <Pressable onPress={() => router.push(`/post/${p.id}`)}>
                  <Card pad={16}>
                    <PersonLine name={p.author} meta={p.when} />
                    <T variant="body" style={{ fontSize: 17, lineHeight: 26, marginTop: 10 }}>{p.text}</T>
                    {p.hasPhoto ? <PhotoBlock height={128} /> : null}
                  </Card>
                </Pressable>
              </View>
            );
          })}
        </Stack>
      )}
    </Feed>
  );
}

function PrayerWall() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = usePrayers();
  const prayers = (data ?? []) as any[];
  async function markAnswered(id: string) { await repo.markPrayerAnswered(id); qc.invalidateQueries({ queryKey: ['prayers'] }); }
  return (
    <Feed primary="Ask the group to pray" onPrimary={() => router.push('/pray')}>
      {isLoading ? null : prayers.length === 0 ? (
        <Empty line="No requests yet. When someone needs prayer — for themselves or someone outside the group — it’ll be here." />
      ) : (
        <Stack gap={10}>
          {prayers.map(p => (
            <Card key={p.id} pad={15}>
              <PersonLine name={p.author} meta={p.when} metaColor={p.answered ? c.green : c.text2} />
              <T variant="body" style={{ fontSize: 16, lineHeight: 24, marginTop: 8 }}>{p.text}</T>
              {p.onBehalfOf ? <T variant="kicker" color={c.text2} style={{ marginTop: 8 }}>On behalf of {p.onBehalfOf}</T> : null}
              <Row style={{ marginTop: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                {p.answered
                  ? <Row gap={6}><Icon name="check" size={16} color={c.green} strokeWidth={2.4} /><T variant="kicker" color={c.green}>Answered</T></Row>
                  : <View />}
                {!p.answered ? <Pressable onPress={() => markAnswered(p.id)}><T variant="body" color={c.accent} style={{ fontSize: 14, fontWeight: '700' }}>Mark answered</T></Pressable> : <View />}
              </Row>
            </Card>
          ))}
        </Stack>
      )}
    </Feed>
  );
}

function VerseFinder() {
  const c = useColors();
  const { data } = useVerses();
  if (!data) return null;
  return (
    <Feed>
      <View style={{ height: 56, borderRadius: 28, backgroundColor: c.surface, flexDirection: 'row',
        alignItems: 'center', gap: 12, paddingHorizontal: 20 }}>
        <Icon name="search" size={22} color={c.accent} strokeWidth={2} />
        <T variant="body">{data.query}</T>
      </View>
      <Row gap={9} style={{ marginTop: 14, alignItems: 'flex-start', borderRadius: 16, backgroundColor: c.sage, padding: 13 }}>
        <Icon name="info" size={18} color={c.sageInk} strokeWidth={2} />
        <T variant="body" style={{ flex: 1, fontSize: 14.5, lineHeight: 21 }}>
          These are passages found in Scripture, shown as they’re written. Tuesday Night never writes a verse for you.{'  '}
          <T variant="body" color={c.text2} style={{ fontSize: 14.5 }}>{data.source}</T>
        </T>
      </Row>
      <Stack gap={10} style={{ marginTop: 16 }}>
        {data.results.map(v => (
          <Card key={v.ref} pad={14}>
            <Kicker color={c.accent}>{v.ref}</Kicker>
            <T variant="scripture" style={{ fontSize: 15.5, lineHeight: 25, marginTop: 8 }}>{v.text}</T>
          </Card>
        ))}
      </Stack>
    </Feed>
  );
}

function PhotoBlock({ height }: { height: number }) {
  const c = useColors();
  return (
    <View style={{ height, borderRadius: 16, backgroundColor: c.surface2, marginTop: 12, alignItems: 'center', justifyContent: 'center', opacity: 0.85 }}>
      <Icon name="camera" size={24} color={c.text2} strokeWidth={1.6} />
    </View>
  );
}
