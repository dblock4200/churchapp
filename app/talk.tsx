import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Kicker, Row, Stack } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useTalk } from '../src/data/hooks';
import { repo } from '../src/data/repo';

export default function Talk() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: t, isLoading } = useTalk();

  return (
    <Screen>
      <Row style={{ height: 44 }}>
        <Pressable onPress={() => router.back()}>
          <Row gap={5}><Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} /><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>This Week</T></Row>
        </Pressable>
      </Row>

      {isLoading || !t ? (
        <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
      ) : t.status === 'processing' ? (
        <View style={{ paddingTop: 60, alignItems: 'center', paddingHorizontal: 24 }}>
          <ActivityIndicator color={c.accent} />
          <T variant="t2" style={{ marginTop: 18 }}>Writing the notes…</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8, textAlign: 'center' }}>This takes a minute or two after a talk. You can leave — it’ll be here when it’s done.</T>
        </View>
      ) : t.status === 'failed' ? (
        <View style={{ paddingTop: 60, alignItems: 'center', paddingHorizontal: 24 }}>
          <T variant="t2">The notes didn’t come through</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8, textAlign: 'center' }}>The recording is saved. You can try making the notes again.</T>
          <Pressable onPress={() => { repo.retryTalk(t.id); qc.invalidateQueries({ queryKey: ['talk'] }); }} style={{ marginTop: 18 }}>
            <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Try again</T>
          </Pressable>
        </View>
      ) : (
        <>
          <T variant="t1" style={{ marginTop: 8 }}>This week’s talk</T>
          <T variant="body" color={c.text2} style={{ marginTop: 4 }}>
            {t.by ? `${t.by} · ` : ''}{Math.max(1, Math.round(t.durationSeconds / 60))} min
          </T>

          <Row gap={9} style={{ marginTop: 16, alignItems: 'flex-start', backgroundColor: c.sage, borderRadius: 14, padding: 13 }}>
            <Icon name="info" size={18} color={c.sageInk} strokeWidth={2} />
            <T variant="body" style={{ flex: 1, fontSize: 14.5, lineHeight: 21 }}>
              Notes written by AI from the recording — a summary of the talk, not Scripture. Skim and fix anything off.
            </T>
          </Row>

          <Kicker style={{ marginTop: 22 }}>Summary</Kicker>
          <T variant="body" style={{ marginTop: 8, fontSize: 16, lineHeight: 24 }}>{t.summary}</T>

          {t.keyPoints.length > 0 ? (
            <>
              <Kicker style={{ marginTop: 18 }}>Key points</Kicker>
              <Stack gap={8} style={{ marginTop: 8 }}>
                {t.keyPoints.map((k, i) => <T key={i} variant="body" style={{ fontSize: 16, lineHeight: 24 }}>•  {k}</T>)}
              </Stack>
            </>
          ) : null}

          {t.passages.length > 0 ? (
            <>
              <Kicker style={{ marginTop: 18 }}>Passages mentioned</Kicker>
              <T variant="body" color={c.text2} style={{ fontSize: 13, marginTop: 4 }}>Tap to read</T>
              <Row gap={8} style={{ marginTop: 8, flexWrap: 'wrap' }}>
                {t.passages.map((pRef, i) => (
                  <Pressable key={i} onPress={() => router.push(`/verse?ref=${encodeURIComponent(pRef)}`)}
                    style={{ backgroundColor: c.sage, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <T variant="body" color={c.sageInk} style={{ fontSize: 14, fontWeight: '700' }}>{pRef}</T>
                    <Icon name="book" size={13} color={c.sageInk} strokeWidth={2} />
                  </Pressable>
                ))}
              </Row>
            </>
          ) : null}
          <View style={{ height: 20 }} />
        </>
      )}
    </Screen>
  );
}
