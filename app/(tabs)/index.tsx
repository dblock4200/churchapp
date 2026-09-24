import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Kicker, Row, Stack, Button, Avatar } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useWeek, useAnswerState } from '../../src/data/hooks';

export default function ThisWeek() {
  const c = useColors();
  const router = useRouter();
  const { data: w } = useWeek();
  const { data: answerState } = useAnswerState();
  const youAnswered = answerState?.answered ?? false;
  if (!w) return <Screen><View /></Screen>;

  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', minHeight: 46, marginTop: 8 }}>
        <T variant="t1">{w.groupName}</T>
        <T variant="kicker" color={c.text2}>Tomorrow</T>
      </Row>

      <Stack gap={12} style={{ marginTop: 8 }}>
        {/* Passage — the current focus, on the accent tint */}
        <Card tint="pill" pad={14}>
          <Kicker color={c.accent}>This week</Kicker>
          <T variant="t1" style={{ fontSize: 24, marginTop: 6 }}>{w.passageRef}</T>
          <Row gap={8} style={{ marginTop: 12 }}>
            <Icon name="book" size={20} color={c.accent} strokeWidth={2} />
            <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Read the passage</T>
          </Row>
        </Card>

        {/* The question + one primary action */}
        <Card pad={14}>
          <Kicker>The question</Kicker>
          <T variant="t2" style={{ marginTop: 8 }}>{w.question}</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8 }}>
            {youAnswered ? 'You’ve written yours.' : 'You haven’t written yours yet.'}
          </T>
          <View style={{ marginTop: 12 }}>
            <Button label={youAnswered ? 'See everyone’s answers' : 'Write your answer'}
              onPress={() => router.push('/question')} />
          </View>
        </Card>

        {/* Who's hosting */}
        <Card pad={14}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <Kicker>{w.hostWhen}</Kicker>
              <T variant="t2" style={{ marginTop: 8 }}>{w.hostName}’s house</T>
              <T variant="body" color={c.text2} style={{ marginTop: 2 }}>{w.comingCount} coming</T>
            </View>
            <Row>
              {w.coming.map((n, i) => (
                <View key={n} style={{ marginLeft: i === 0 ? 0 : -10, borderRadius: 20,
                  borderWidth: 3, borderColor: c.surface }}>
                  <Avatar name={n} size={34} />
                </View>
              ))}
            </Row>
          </Row>
        </Card>

        {/* Memory verse — scripture, set apart */}
        <Card tint="sage" pad={14}>
          <Kicker>Memory verse · {w.memoryVerseRef}</Kicker>
          <T variant="scripture" style={{ fontSize: 16, lineHeight: 27, marginTop: 8 }}>{w.memoryVerseText}</T>
        </Card>
      </Stack>
    </Screen>
  );
}
