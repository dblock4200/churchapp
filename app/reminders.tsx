import React, { useEffect, useState } from 'react';
import { View, Pressable, Platform, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Row } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { useColors } from '../src/theme/ThemeProvider';

const KEY = 'reminder:v2';
const WEEKDAY = 3; // Expo weekday: 1=Sun … 3=Tue

function atTime(hour: number, minute: number) { const d = new Date(); d.setHours(hour, minute, 0, 0); return d; }
function prettyTime(d: Date) { return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }

// A gentle weekly local reminder before the Tuesday gathering, at any time you pick.
// On-device only — nobody else sees it.
export default function Reminders() {
  const c = useColors();
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(() => atTime(17, 0)); // default 5:00pm
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) { const v = JSON.parse(raw); setEnabled(!!v.enabled); if (typeof v.hour === 'number') setTime(atTime(v.hour, v.minute ?? 0)); }
      } catch { /* first run */ }
    })();
  }, []);

  async function apply(nextEnabled: boolean, nextTime: Date) {
    setEnabled(nextEnabled); setTime(nextTime);
    const hour = nextTime.getHours(), minute = nextTime.getMinutes();
    try { await AsyncStorage.setItem(KEY, JSON.stringify({ enabled: nextEnabled, hour, minute })); } catch { /* best effort */ }
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (nextEnabled) {
        const perm = await Notifications.getPermissionsAsync();
        if (!perm.granted && !(await Notifications.requestPermissionsAsync()).granted) { setEnabled(false); return; }
        await Notifications.scheduleNotificationAsync({
          content: { title: 'Philia', body: 'Tuesday Night is coming up — see what the group shared.' },
          trigger: { weekday: WEEKDAY, hour, minute, repeats: true } as any,
        });
      }
    } catch { /* ignore */ }
  }

  function onPicked(_e: any, picked?: Date) {
    // Android closes the dialog itself; iOS uses the inline spinner.
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (picked) apply(enabled, picked);
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
          A gentle nudge each week before Tuesday Night — at whatever time you like. Just on your phone, no one else sees it.
        </T>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <T variant="body" style={{ fontWeight: '600', fontSize: 16 }}>Weekly reminder</T>
          <Switch value={enabled} onValueChange={(v) => apply(v, time)} trackColor={{ true: c.accent, false: c.surface2 }} />
        </Row>

        {enabled ? (
          <>
            <T variant="kicker" color={c.text2} style={{ marginTop: 24 }}>What time on Tuesday</T>

            {Platform.OS === 'ios' ? (
              <View style={{ marginTop: 8, borderRadius: 18, backgroundColor: c.surface, alignItems: 'center', paddingVertical: 6 }}>
                <DateTimePicker
                  value={time} mode="time" display="spinner"
                  onChange={(_e, picked) => { if (picked) apply(true, picked); }}
                  themeVariant="dark" accentColor={c.accent} textColor={c.text as any}
                  style={{ height: 180, alignSelf: 'stretch' }}
                />
              </View>
            ) : Platform.OS === 'web' ? (
              <T variant="body" color={c.text2} style={{ marginTop: 14, fontSize: 14 }}>
                Currently set for {prettyTime(time)}. Pick the exact time on the phone app — reminders fire there, not in the web preview.
              </T>
            ) : (
              <>
                <Pressable onPress={() => setShowPicker(true)}
                  style={{ marginTop: 10, height: 54, borderRadius: 16, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }}>
                  <T variant="body" style={{ fontSize: 17, fontWeight: '600' }}>{prettyTime(time)}</T>
                  <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Change</T>
                </Pressable>
                {showPicker ? <DateTimePicker value={time} mode="time" is24Hour={false} onChange={onPicked} /> : null}
              </>
            )}

            <T variant="body" color={c.text2} style={{ marginTop: 16, fontSize: 13.5 }}>
              You’ll be reminded every Tuesday at {prettyTime(time)}.
            </T>
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
