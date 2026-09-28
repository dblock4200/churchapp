import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Row, Stack } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useEvent } from '../../src/data/hooks';
import { useAuth } from '../../src/auth/AuthProvider';
import { repo } from '../../src/data/repo';

export default function EventDetail() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eid = String(id);
  const { data: e, isLoading } = useEvent(eid);
  const [mine, setMine] = React.useState<'yes' | 'no' | null>(null);
  React.useEffect(() => { repo.myEventRsvp(eid, member?.id).then(setMine); }, [eid, member?.id]);

  async function rsvp(going: boolean) {
    if (!member?.id) return;
    setMine(going ? 'yes' : 'no');
    await repo.setEventRsvp(eid, member.id, going);
    qc.invalidateQueries({ queryKey: ['event', eid] });
    qc.invalidateQueries({ queryKey: ['schedule'] });
  }

  const tag = e?.kind === 'event' ? { label: 'Group event', tint: c.peach, ink: c.peachInk } : { label: 'Meet-up', tint: c.sage, ink: c.sageInk };

  return (
    <Screen scroll={true}>
      <Row style={{ height: 44 }}>
        <Pressable onPress={() => router.back()}>
          <Row gap={5}><Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} /><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Schedule</T></Row>
        </Pressable>
      </Row>

      {isLoading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
      ) : !e ? (
        <T variant="body" color={c.text2} style={{ marginTop: 40, textAlign: 'center' }}>This isn’t on the schedule anymore.</T>
      ) : (
        <>
          <View style={{ alignSelf: 'flex-start', marginTop: 10, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 3, backgroundColor: tag.tint }}>
            <T variant="kicker" color={tag.ink}>{tag.label}</T>
          </View>
          <T variant="t1" style={{ marginTop: 10 }}>{e.title}</T>
          <T variant="body" color={c.text2} style={{ marginTop: 6, fontSize: 17 }}>{e.dateLabel} · {e.timeLabel}</T>
          {e.place ? <T variant="body" color={c.text2} style={{ marginTop: 2, fontSize: 17 }}>{e.place}</T> : null}
          {e.by ? <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 14 }}>{e.by} suggested this</T> : null}
          {e.note ? <T variant="body" style={{ marginTop: 14, fontSize: 16, lineHeight: 24 }}>{e.note}</T> : null}

          <Row gap={10} style={{ marginTop: 18 }}>
            <RsvpChip label="I’m going" active={mine === 'yes'} onPress={() => rsvp(true)} />
            <RsvpChip label="Can’t make it" active={mine === 'no'} onPress={() => rsvp(false)} muted />
          </Row>

          {e.going.length > 0 ? (
            <>
              <T variant="kicker" style={{ marginTop: 22 }}>Going · {e.going.length}</T>
              <Stack gap={10} style={{ marginTop: 10 }}>
                {e.going.map((n: string, i: number) => (<Row key={n + i} gap={10}><Dot name={n} /><T variant="body">{n}</T></Row>))}
              </Stack>
            </>
          ) : null}
          {e.cant.length > 0 ? (
            <>
              <T variant="kicker" color={c.text2} style={{ marginTop: 18 }}>Can’t make it · {e.cant.length}</T>
              <Stack gap={10} style={{ marginTop: 10 }}>
                {e.cant.map((n: string, i: number) => (<Row key={n + i} gap={10}><Dot name={n} muted /><T variant="body" color={c.text2}>{n}</T></Row>))}
              </Stack>
            </>
          ) : null}
        </>
      )}
    </Screen>
  );
}

function RsvpChip({ label, active, onPress, muted }: { label: string; active?: boolean; onPress: () => void; muted?: boolean }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} style={{ flex: 1, height: 46, borderRadius: 23, backgroundColor: active ? c.accent : c.surface2, alignItems: 'center', justifyContent: 'center' }}>
      <T variant="body" color={active ? c.onAccent : (muted ? c.text2 : c.text)} style={{ fontWeight: '700', fontSize: 15 }}>{label}</T>
    </Pressable>
  );
}
function Dot({ name, muted }: { name: string; muted?: boolean }) {
  const c = useColors();
  return (
    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: muted ? c.surface2 : c.pill, alignItems: 'center', justifyContent: 'center' }}>
      <T variant="body" color={muted ? c.text2 : c.accent} style={{ fontWeight: '700', fontSize: 13 }}>{name[0]}</T>
    </View>
  );
}
