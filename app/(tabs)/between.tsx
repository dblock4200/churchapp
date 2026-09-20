import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Kicker, Row, Stack, Button, PersonLine, Hairline } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { usePresence, usePrayers, useVerses } from '../../src/data/hooks';

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

function PresenceFeed() {
  const c = useColors();
  const router = useRouter();
  const { data } = usePresence();
  if (!data) return null;
  const today = data.filter(p => p.day === 'Today');
  const earlier = data.filter(p => p.day !== 'Today');
  return (
    <Feed primary="Something you noticed" onPrimary={() => router.push('/compose')}>
      <Stack gap={12}>
        <Kicker>Today</Kicker>
        {today.map(p => (
          <Pressable key={p.id} onPress={() => router.push(`/post/${p.id}`)}>
            <Card pad={16}>
              <PersonLine name={p.author} meta={p.when} />
              <T variant="body" style={{ fontSize: 17, lineHeight: 26, marginTop: 10 }}>{p.text}</T>
              {p.hasPhoto ? <PhotoBlock height={128} /> : null}
            </Card>
          </Pressable>
        ))}
        {earlier.map(p => (
          <View key={p.id}>
            <View style={{ marginTop: 4, marginBottom: 8 }}><Kicker>{p.day}</Kicker></View>
            <Pressable onPress={() => router.push(`/post/${p.id}`)}>
              <Card pad={16}>
                <PersonLine name={p.author} meta={p.when} />
                <T variant="body" style={{ fontSize: 17, lineHeight: 26, marginTop: 10 }}>{p.text}</T>
              </Card>
            </Pressable>
          </View>
        ))}
      </Stack>
    </Feed>
  );
}

function PrayerWall() {
  const c = useColors();
  const { data } = usePrayers();
  if (!data) return null;
  return (
    <Feed primary="Ask the group to pray">
      <Stack gap={10}>
        {data.map(p => (
          <Card key={p.id} pad={15}>
            <PersonLine name={p.author} meta={p.when} />
            <T variant="body" style={{ fontSize: 16, lineHeight: 24, marginTop: 8 }}>{p.text}</T>
            {p.onBehalfOf ? <T variant="kicker" color={c.text2} style={{ marginTop: 8 }}>On behalf of {p.onBehalfOf}</T> : null}
            {p.followUp ? (
              <View style={{ marginTop: 12, borderRadius: 16, backgroundColor: c.surface2, padding: 13, borderLeftWidth: 3, borderLeftColor: c.clay }}>
                <T variant="kicker" color={c.clay}>Checking back</T>
                <T variant="body" style={{ marginTop: 6 }}>{p.followUp.prompt}</T>
                <Row gap={10} style={{ marginTop: 10 }}>
                  <Pill label="Add an update" color={c.accent} bg={c.surface} />
                  <Pill label="Still waiting" color={c.text2} bg={c.surface} />
                </Row>
              </View>
            ) : null}
          </Card>
        ))}
      </Stack>
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

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <View style={{ flex: 1, height: 40, borderRadius: 20, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T variant="body" color={color} style={{ fontSize: 15, fontWeight: '700' }}>{label}</T>
    </View>
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
