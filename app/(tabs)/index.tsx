import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Kicker, Row, Stack, Button, Avatar } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useWeek, useAnswerState, useRsvps, useTalk } from '../../src/data/hooks';
import { useAuth } from '../../src/auth/AuthProvider';
import { repo } from '../../src/data/repo';

export default function ThisWeek() {
  const c = useColors();
  const router = useRouter();
  const { member } = useAuth();
  const { data: w, isLoading } = useWeek();
  const { data: answerState } = useAnswerState();
  const { data: rsvps } = useRsvps();
  const { data: talk } = useTalk();
  const qc = useQueryClient();
  const youAnswered = answerState?.answered ?? false;
  const isLeader = member?.is_leader ?? false;

  async function rsvp(coming: boolean) {
    if (!w?.id || !member?.id) return;
    await repo.setMyRsvp(w.id, member.id, coming);
    qc.invalidateQueries({ queryKey: ['rsvps'] });
  }

  // Loading
  if (isLoading) return <Screen><View style={{ paddingTop: 60, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View></Screen>;

  // Empty state — no week set yet
  if (!w) {
    return (
      <Screen>
        <Row style={{ minHeight: 46, marginTop: 8 }}><T variant="t1">{member?.group_name ?? 'Tuesday Night'}</T></Row>
        <Card tint="peach" pad={20} style={{ marginTop: 12 }}>
          <T variant="t2">{isLeader ? 'Your first Tuesday' : 'Nothing set yet'}</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8, fontSize: 17, lineHeight: 24 }}>
            {isLeader
              ? 'Set where the group is reading and the question for the night — everything gathers here after.'
              : 'Your leader hasn’t set this week yet. It’ll show up here — the passage, the question, and who’s hosting.'}
          </T>
          {isLeader ? <View style={{ marginTop: 16 }}><Button label="Set this week" onPress={() => router.push('/set-week')} /></View> : null}
        </Card>
      </Screen>
    );
  }

  const coming = rsvps?.coming ?? [];
  return (
    <Screen>
      <Row style={{ justifyContent: 'space-between', minHeight: 46, marginTop: 8 }}>
        <T variant="t1">{w.groupName}</T>
        {isLeader
          ? <Pressable onPress={() => router.push('/set-week')}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Edit</T></Pressable>
          : <T variant="kicker" color={c.text2}>This week</T>}
      </Row>

      <Stack gap={12} style={{ marginTop: 8 }}>
        <Card tint="pill" pad={14}>
          <Kicker color={c.accent}>This week</Kicker>
          <T variant="t1" style={{ fontSize: 24, marginTop: 6 }}>{w.passageRef}</T>
          <Row gap={8} style={{ marginTop: 12 }}>
            <Icon name="book" size={20} color={c.accent} strokeWidth={2} />
            <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Read the passage</T>
          </Row>
        </Card>

        <Pressable onPress={() => router.push(talk ? '/talk' : '/record-talk')}>
          <Card pad={14}>
            <Kicker color={c.text2}>This week’s talk</Kicker>
            {!talk ? (
              <>
                <T variant="t3" style={{ marginTop: 6 }}>Not recorded yet</T>
                <Row gap={8} style={{ marginTop: 10 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.onAccent }} />
                  </View>
                  <T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Record the talk</T>
                </Row>
              </>
            ) : talk.status === 'processing' ? (
              <Row gap={8} style={{ marginTop: 8, alignItems: 'center' }}>
                <ActivityIndicator color={c.accent} size="small" />
                <T variant="body" color={c.text2}>Writing the notes…</T>
              </Row>
            ) : talk.status === 'failed' ? (
              <T variant="body" color={c.accent} style={{ marginTop: 8, fontWeight: '700' }}>Notes didn’t finish — tap to retry</T>
            ) : (
              <>
                <T variant="body" style={{ marginTop: 8, fontSize: 16, lineHeight: 23 }} numberOfLines={2}>{talk.summary}</T>
                <T variant="body" color={c.accent} style={{ marginTop: 8, fontWeight: '700' }}>Read the notes</T>
              </>
            )}
          </Card>
        </Pressable>

        <Card pad={14}>
          <Kicker>The question</Kicker>
          <T variant="t2" style={{ marginTop: 8 }}>{w.question}</T>
          <T variant="body" color={c.text2} style={{ marginTop: 8 }}>
            {youAnswered ? 'You’ve written yours.' : 'You haven’t written yours yet.'}
          </T>
          <View style={{ marginTop: 12 }}>
            <Button label={youAnswered ? 'See everyone’s answers' : 'Write your answer'} onPress={() => router.push('/question')} />
          </View>
        </Card>

        {/* Who's hosting + your RSVP */}
        <Card pad={14}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              {w.hostWhen ? <Kicker>{w.hostWhen}</Kicker> : null}
              <T variant="t2" style={{ marginTop: 8 }}>{w.hostName ? `${w.hostName}’s house` : 'Host to be set'}</T>
              <T variant="body" color={c.text2} style={{ marginTop: 2 }}>
                {coming.length === 0 ? 'No one’s said yet' : `${coming.length} coming`}
              </T>
            </View>
            <Row>
              {coming.slice(0, 5).map((n, i) => (
                <View key={n + i} style={{ marginLeft: i === 0 ? 0 : -10, borderRadius: 20, borderWidth: 3, borderColor: c.surface }}>
                  <Avatar name={n} size={34} />
                </View>
              ))}
            </Row>
          </Row>
          <Row gap={10} style={{ marginTop: 14 }}>
            <RsvpChip label="I’m coming" active={rsvps?.mine === 'yes'} onPress={() => rsvp(true)} />
            <RsvpChip label="Can’t make it" active={rsvps?.mine === 'no'} onPress={() => rsvp(false)} muted />
          </Row>
        </Card>

        <Card tint="sage" pad={14}>
          <Kicker>Memory verse · {w.memoryVerseRef}</Kicker>
          <T variant="scripture" style={{ fontSize: 16, lineHeight: 27, marginTop: 8 }}>{w.memoryVerseText}</T>
        </Card>
      </Stack>
    </Screen>
  );
}

function RsvpChip({ label, active, onPress, muted }: { label: string; active?: boolean; onPress: () => void; muted?: boolean }) {
  const c = useColors();
  const bg = active ? c.accent : c.surface2;
  const fg = active ? c.onAccent : (muted ? c.text2 : c.text);
  return (
    <Pressable onPress={onPress} style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <T variant="body" color={fg} style={{ fontWeight: '700', fontSize: 15 }}>{label}</T>
    </Pressable>
  );
}
