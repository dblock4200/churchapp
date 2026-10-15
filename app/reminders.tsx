import React, { useEffect, useState } from 'react';
import { View, Pressable, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Row } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { useColors } from '../src/theme/ThemeProvider';

const KEY = 'reminder:v1';
const TIMES = [
  { label: 'Tue 9:00am', hour: 9, minute: 0 },
  { label: 'Tue 12:00pm', hour: 12, minute: 0 },
  { label: 'Tue 5:00pm', hour: 17, minute: 0 },
  { label: 'Tue 6:30pm', hour: 18, minute: 30 },
];
const WEEKDAY = 3; // Expo weekday: 1=Sun … 3=Tue

// A gentle weekly local reminder before the Tuesday gathering. On-device only.
export default function Reminders() {
  const c = useColors();
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [idx, setIdx] = useState(2);

  useEffect(() => {
    (async () => {
      try { const raw = await AsyncStorage.getItem(KEY); if (raw) { const v = JSON.parse(raw); setEnabled(!!v.enabled); setIdx(typeof v.idx === 'number' ? v.idx : 2); } } catch { /* first run */ }
    })();
  }, []);

  async function apply(nextEnabled: boolean, nextIdx: number) {
    setEnabled(nextEnabled); setIdx(nextIdx);
    try { await AsyncStorage.setItem(KEY, JSON.stringify({ enabled: nextEnabled, idx: nextIdx })); } catch { /* best effort */ }
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (nextEnabled) {
        const perm = await Notifications.getPermissionsAsync();
        if (!perm.granted && !(await Notifications.requestPermissionsAsync()).granted) return;
        const t = TIMES[nextIdx];
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Philia', body: 'Tuesday Night is coming up — see what the group shared.' },
          trigger: { weekday: WEEKDAY, hour: t.hour, minute: t.minute, repeats: true } as any,
        });
      }
    } catch { /* ignore */ }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <View style={{ width: 52 }} />
        <T variant="t3">Reminders</T>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Done</T></Pressable>
      </Row>
      <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
        <T variant="body" color={c.text2} style={{ fontSize: 16, lineHeight: 24 }}>
          A gentle nudge each week before Tuesday Night — just on your phone, no one else sees it.
        </T>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <T variant="body" style={{ fontWeight: '600', fontSize: 16 }}>Weekly reminder</T>
          <Switch value={enabled} onValueChange={(v) => apply(v, idx)} trackColor={{ true: c.accent, false: c.surface2 }} />
        </Row>
        {enabled ? (
          <>
            <T variant="kicker" color={c.text2} style={{ marginTop: 24 }}>When</T>
            <Row gap={9} style={{ marginTop: 10, flexWrap: 'wrap' }}>
              {TIMES.map((t, i) => {
                const on = i === idx;
                return (
                  <Pressable key={t.label} onPress={() => apply(true, i)}
                    style={{ height: 40, borderRadius: 20, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface2 }}>
                    <T variant="body" color={on ? c.onAccent : c.text} style={{ fontWeight: '700', fontSize: 14 }}>{t.label}</T>
                  </Pressable>
                );
              })}
            </Row>
            {Platform.OS === 'web' ? (
              <T variant="body" color={c.text2} style={{ marginTop: 18, fontSize: 13 }}>Reminders fire on the installed app, not the web preview.</T>
            ) : null}
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
