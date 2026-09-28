import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { Row } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';
import { useWeek } from '../src/data/hooks';
import { repo } from '../src/data/repo';

function mmss(s: number) { const m = Math.floor(s / 60); const r = s % 60; return `${m}:${r < 10 ? '0' : ''}${r}`; }

export default function RecordTalk() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { data: w } = useWeek();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [phase, setPhase] = useState<'idle' | 'recording' | 'saving'>('idle');
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function start() {
    setErr(null);
    if (Platform.OS === 'web') { setErr('Recording works on the phone app, not the web preview.'); return; }
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) { setErr('Microphone permission is needed to record.'); return; }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setPhase('recording'); setSecs(0);
    timer.current = setInterval(() => setSecs(s => s + 1), 1000);
  }

  async function stop() {
    if (timer.current) clearInterval(timer.current);
    setPhase('saving');
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri || !member?.group_id || !member?.id) { setErr('Could not save the recording.'); setPhase('idle'); return; }
    const res = await repo.startTalk(member.group_id, (w as any)?.id ?? null, member.id, uri, secs);
    if (res.error) { setErr(res.error); setPhase('idle'); return; }
    qc.invalidateQueries({ queryKey: ['talk'] });
    router.replace('/talk');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="kicker" color={c.text2}>{phase === 'recording' ? 'Recording' : 'Record the talk'}</T>
        <View style={{ width: 52 }} />
      </Row>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        {phase === 'recording' ? (
          <Row gap={8}><View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.clay }} /><T variant="kicker" color={c.clay}>Live</T></Row>
        ) : null}
        <T style={{ fontFamily: undefined, fontSize: 56, fontWeight: '700', marginTop: 14 }}>{mmss(secs)}</T>
        <T variant="t3" style={{ marginTop: 18 }}>{w ? (w as any).passageRef : 'This week'}</T>
        <T variant="body" color={c.text2} style={{ marginTop: 2 }}>Recording for the group</T>

        <View style={{ marginTop: 40 }}>
          {phase === 'saving' ? <ActivityIndicator color={c.accent} /> :
            <Pressable onPress={phase === 'recording' ? stop : start}
              style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: phase === 'recording' ? c.surface2 : c.accent, alignItems: 'center', justifyContent: 'center' }}>
              {phase === 'recording'
                ? <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: c.clay }} />
                : <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.onAccent }} />}
            </Pressable>}
        </View>
        {err ? <T variant="body" color={c.clay} style={{ marginTop: 20, textAlign: 'center' }}>{err}</T> : null}
        <T variant="body" color={c.text2} style={{ marginTop: 24, textAlign: 'center', fontSize: 13.5 }}>
          Everyone gets the notes afterward. AI writes a summary of the talk — not Scripture.
        </T>
      </View>
    </SafeAreaView>
  );
}
