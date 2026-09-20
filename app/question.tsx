import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Kicker, Row, Stack, PersonLine, Hairline } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useWeek, useAnswers } from '../src/data/hooks';

function BackHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  const c = useColors();
  const router = useRouter();
  return (
    <Row style={{ height: 44, justifyContent: 'space-between' }}>
      <Pressable onPress={() => router.back()}>
        <Row gap={5}>
          <Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} />
          <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>{label}</T>
        </Row>
      </Pressable>
      {right}
    </Row>
  );
}

export default function Question() {
  const c = useColors();
  const { data: w } = useWeek();
  const { data: answers } = useAnswers();
  return (
    <Screen>
      <BackHeader label="This Week" right={<T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Edit</T>} />
      <Kicker style={{ marginTop: 10 }}>The question</Kicker>
      <T variant="t2" style={{ marginTop: 10 }}>{w?.question}</T>
      <View style={{ marginTop: 14 }}><Hairline /></View>
      <T variant="body" color={c.text2} style={{ marginTop: 14 }}>
        You answered Monday night. Everyone’s is below, in the order it was written.
      </T>
      <Stack gap={24} style={{ marginTop: 20 }}>
        {answers?.map(a => (
          <View key={a.id}>
            <PersonLine name={a.author} meta={a.when} />
            <T variant="scripture" style={{ fontSize: 17, lineHeight: 30, marginTop: 10 }}>{a.text}</T>
          </View>
        ))}
      </Stack>
    </Screen>
  );
}
