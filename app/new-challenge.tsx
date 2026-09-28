import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Row } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon, IconName } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';
import { usePartnership } from '../src/data/hooks';
import { repo } from '../src/data/repo';

const OPTIONS: { kind: string; title: string; sub: string; days: number; dur: string; icon: IconName; tint: string; ink: string }[] = [
  { kind: 'fasting', title: 'Fasting', sub: 'Skip a meal or a day, and pray in the space.', days: 3, dur: '3 days', icon: 'moon' as any, tint: 'peach', ink: 'peachInk' },
  { kind: 'prayer', title: 'Daily prayer', sub: 'Pray at the same time each day.', days: 14, dur: '2 weeks', icon: 'heart', tint: 'lilac', ink: 'lilacInk' },
  { kind: 'passage', title: 'A passage a day', sub: 'Read a chapter, share one line.', days: 7, dur: '7 days', icon: 'book', tint: 'sage', ink: 'sageInk' },
  { kind: 'sabbath', title: 'Digital sabbath', sub: 'One day a week, phones down.', days: 28, dur: '4 weeks', icon: 'moon', tint: 'butter', ink: 'butterInk' },
  { kind: 'gratitude', title: 'Gratitude', sub: 'Three things you’re thankful for, daily.', days: 7, dur: '1 week', icon: 'sparkle', tint: 'peach', ink: 'peachInk' },
];

export default function NewChallenge() {
  const c = useColors(); const router = useRouter(); const qc = useQueryClient();
  const { member } = useAuth(); const { data: p } = usePartnership();

  async function start(o: typeof OPTIONS[number]) {
    if (!p?.id || !member?.id) return;
    await repo.startChallenge(p.id, member.id, o.kind, o.title, o.days);
    qc.invalidateQueries({ queryKey: ['challenge', p.id] });
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="t3">A challenge</T><View style={{ width: 52 }} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <T variant="t1" style={{ fontSize: 25 }}>A challenge, together</T>
        <T variant="body" color={c.text2} style={{ marginTop: 8 }}>Take something on with {p?.partnerName ?? 'your partner'} for a set stretch — you’ll check in with each other.</T>
        <View style={{ gap: 12, marginTop: 16 }}>
          {OPTIONS.map(o => {
            const icon: IconName = (['heart', 'book', 'sparkle'].includes(o.icon as string) ? o.icon : 'moon') as IconName;
            return (
              <Pressable key={o.kind + o.title} onPress={() => start(o)}>
                <Card pad={13}>
                  <Row gap={12}>
                    <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: (c as any)[o.tint], alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={icon} size={20} color={(c as any)[o.ink]} strokeWidth={2} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <T variant="body" style={{ fontWeight: '700' }}>{o.title}</T>
                      <T variant="body" color={c.text2} style={{ fontSize: 13.5, marginTop: 2 }}>{o.sub}</T>
                    </View>
                    <View style={{ backgroundColor: c.surface2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <T variant="kicker" color={c.text2} style={{ fontSize: 10.5 }}>{o.dur}</T>
                    </View>
                  </Row>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
