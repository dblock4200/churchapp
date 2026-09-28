import React from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Row, Stack, Button } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useSchedule } from '../../src/data/hooks';
import { useAuth } from '../../src/auth/AuthProvider';

const TAG: Record<string, { label: string; tint: 'pill' | 'sage' | 'peach'; ink: string }> = {
  gathering: { label: 'Gathering', tint: 'pill', ink: 'accent' },
  meetup: { label: 'Meet-up', tint: 'sage', ink: 'sageInk' },
  event: { label: 'Group event', tint: 'peach', ink: 'peachInk' },
};

export default function Schedule() {
  const c = useColors();
  const router = useRouter();
  const { member } = useAuth();
  const { data, isLoading } = useSchedule();
  const items = (data ?? []) as any[];

  return (
    <Screen scroll={false} pad={false}>
      <Row style={{ paddingHorizontal: 20, paddingTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
        <T variant="t1">Schedule</T>
        {member?.is_leader ? (
          <Pressable onPress={() => router.push('/new-event?kind=event')}
            style={{ height: 34, borderRadius: 17, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12 }}>
            <Icon name="plus" size={15} color={c.accent} strokeWidth={2.4} />
            <T variant="body" color={c.accent} style={{ fontWeight: '700', fontSize: 13 }}>Event</T>
          </Pressable>
        ) : null}
      </Row>
      <T variant="body" color={c.text2} style={{ paddingHorizontal: 20, marginTop: 2, marginBottom: 8 }}>Tuesdays and everything in between.</T>

      <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
          ) : items.length === 0 ? (
            <T variant="body" color={c.text2} style={{ marginTop: 30, textAlign: 'center', fontSize: 16, lineHeight: 24 }}>
              Nothing on the calendar yet. Suggest a meet-up below, or your leader can add an event.
            </T>
          ) : (
            <Stack gap={10}>
              {items.map(it => {
                const tag = TAG[it.kind];
                const onPress = it.kind === 'gathering' ? () => router.push('/') : () => router.push(`/event/${it.id}`);
                return (
                  <Pressable key={it.key} onPress={onPress}>
                    <Card tint={it.kind === 'gathering' ? 'pill' : 'surface'} pad={13}>
                      <Row gap={12} style={{ alignItems: 'center' }}>
                        <View style={{ width: 52, height: 56, borderRadius: 14, backgroundColor: it.kind === 'gathering' ? c.accent : c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                          <T variant="kicker" color={it.kind === 'gathering' ? c.onAccent : c.text2} style={{ fontSize: 11 }}>{it.box.dow}</T>
                          <T variant="t2" color={it.kind === 'gathering' ? c.onAccent : c.text} style={{ fontSize: 20 }}>{it.box.day}</T>
                        </View>
                        <View style={{ flex: 1 }}>
                          <T variant="t3">{it.title}</T>
                          <T variant="body" color={c.text2} style={{ fontSize: 13.5, marginTop: 2 }}>{it.meta}</T>
                          <View style={{ alignSelf: 'flex-start', marginTop: 8, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: (c as any)[tag.tint] }}>
                            <T variant="kicker" color={(c as any)[tag.ink]} style={{ fontSize: 10.5 }}>{tag.label}</T>
                          </View>
                        </View>
                        {it.going > 0 ? <T variant="body" color={c.text2} style={{ fontSize: 13 }}>{it.going} going</T> : null}
                      </Row>
                    </Card>
                  </Pressable>
                );
              })}
            </Stack>
          )}
        </ScrollView>
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 4 }}>
          <Button label="Suggest a meet-up" onPress={() => router.push('/new-event?kind=meetup')} />
        </View>
      </View>
    </Screen>
  );
}
