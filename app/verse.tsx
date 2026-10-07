import React from 'react';
import { View, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Row, Kicker } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { useColors } from '../src/theme/ThemeProvider';
import { usePassage } from '../src/data/hooks';

// Opened from a talk's "Passages mentioned" — shows the real verse text
// (ESV when live, World English Bible now). Scripture is never generated.
export default function Verse() {
  const c = useColors();
  const router = useRouter();
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const { data, isLoading } = usePassage(ref);
  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Done</T></Pressable>
        <T variant="t3" numberOfLines={1} style={{ maxWidth: 220 }}>{ref}</T>
        <View style={{ width: 44 }} />
      </Row>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 30 }}>
        {isLoading ? (
          <View style={{ paddingTop: 50, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
        ) : !data ? (
          <T variant="body" color={c.text2} style={{ marginTop: 24, fontSize: 16, lineHeight: 24 }}>
            Couldn’t find “{ref}”. It may be written in a way the lookup didn’t recognize.
          </T>
        ) : (
          <>
            <Kicker color={c.accent}>{data.ref}</Kicker>
            <T variant="scripture" style={{ fontSize: 19, lineHeight: 31, marginTop: 14 }}>{data.text}</T>
            <T variant="body" color={c.text2} style={{ marginTop: 20, fontSize: 13, lineHeight: 19 }}>
              {data.translation} · shown as written, never generated
            </T>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
