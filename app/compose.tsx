import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Row, Button } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { composePrompts } from '../src/data/mock';

export default function Compose() {
  const c = useColors();
  const router = useRouter();
  const [prompt, setPrompt] = useState(composePrompts[2]); // C by default

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}>
          <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T>
        </Pressable>
        <T variant="t3">Something you noticed</T>
        <View style={{ width: 52 }} />
      </Row>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
        <T variant="t1" style={{ fontSize: 25 }}>{prompt.text}</T>
        <View style={{ width: 2, height: 26, backgroundColor: c.accent, marginTop: 16 }} />

        {/* Prompt wording — the only thing shaping what gets written */}
        <Row gap={8} style={{ marginTop: 22, flexWrap: 'wrap' }}>
          {composePrompts.map(p => {
            const on = p.key === prompt.key;
            return (
              <Pressable key={p.key} onPress={() => setPrompt(p)} style={{ height: 34, borderRadius: 17,
                paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center',
                backgroundColor: on ? c.accent : c.surface2 }}>
                <T variant="body" color={on ? c.onAccent : c.text2} style={{ fontSize: 13, fontWeight: '700' }}>{p.label}</T>
              </Pressable>
            );
          })}
        </Row>

        <View style={{ flex: 1 }} />

        <View style={{ borderRadius: 20, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="camera" size={20} color={c.text2} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="body" style={{ fontWeight: '600' }}>Add a photo</T>
            <T variant="body" color={c.text2} style={{ fontSize: 14 }}>Optional</T>
          </View>
        </View>

        <View style={{ marginTop: 14 }}><Button label="Post to Tuesday Night" onPress={() => router.back()} /></View>
        <T variant="body" color={c.text2} style={{ marginTop: 12, marginBottom: 8, textAlign: 'center' }}>Nine people. No one else.</T>
      </View>
    </SafeAreaView>
  );
}
