import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Stack, Button } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { useAuth } from '../src/auth/AuthProvider';
import { usePartnership } from '../src/data/hooks';
import { repo } from '../src/data/repo';

function Header({ label }: { label: string }) {
  const c = useColors(); const router = useRouter();
  return (
    <Row style={{ height: 52, paddingHorizontal: 20 }}>
      <Pressable onPress={() => router.back()}>
        <Row gap={5}><Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} /><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>{label}</T></Row>
      </Pressable>
    </Row>
  );
}

export default function Partner() {
  const c = useColors();
  const { member } = useAuth();
  const { data: p, isLoading } = usePartnership();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Header label="You" />
      {isLoading ? <View style={{ paddingTop: 60, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
        : !p ? <Intro />
        : p.status === 'pending' ? <Pending p={p} />
        : <Space p={p} myId={member!.id} />}
    </SafeAreaView>
  );
}

function Intro() {
  const c = useColors(); const { member } = useAuth(); const qc = useQueryClient();
  const [choosing, setChoosing] = useState(false);
  const { data: cands } = useQuery({ queryKey: ['partnerCands', member?.id], enabled: choosing, queryFn: () => repo.partnerCandidates(member?.id) });
  async function ask(id: string) {
    if (!member?.group_id || !member?.id) return;
    await repo.askPartner(member.group_id, member.id, id);
    qc.invalidateQueries({ queryKey: ['partnership'] });
  }
  if (!choosing) return (
    <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
      <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.lilac, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
        <Icon name="users" size={30} color={c.lilacInk} strokeWidth={1.8} />
      </View>
      <View style={{ alignSelf: 'center', marginTop: 16, backgroundColor: c.surface2, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 }}>
        <T variant="kicker" color={c.text2}>Optional</T>
      </View>
      <T variant="t1" style={{ fontSize: 27, textAlign: 'center', marginTop: 12 }}>An accountability partner</T>
      <T variant="body" color={c.text2} style={{ fontSize: 17, lineHeight: 25, textAlign: 'center', marginTop: 10 }}>
        Pair with one person to check in between Tuesdays — pray for each other, and be honest about what you’re carrying. Just the two of you.
      </T>
      <View style={{ marginTop: 24 }}><Button label="Find a partner" onPress={() => setChoosing(true)} /></View>
      <T variant="body" color={c.text2} style={{ fontSize: 13.5, textAlign: 'center', marginTop: 12 }}>Only you and your partner ever see this. You can end it anytime.</T>
    </View>
  );
  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <T variant="t1" style={{ fontSize: 27 }}>Ask someone to partner</T>
      <T variant="body" color={c.text2} style={{ marginTop: 8 }}>They get to say yes. When you both agree, your space opens — nobody else in the group sees it.</T>
      <Stack gap={0} style={{ marginTop: 16 }}>
        {(cands ?? []).map((m, i) => (
          <View key={m.id}>
            {i > 0 ? <View style={{ height: 1, backgroundColor: c.surface2 }} /> : null}
            <Row style={{ justifyContent: 'space-between', height: 60 }}>
              <T variant="body" style={{ fontWeight: '600' }}>{m.name}</T>
              <Pressable onPress={() => ask(m.id)} style={{ height: 38, borderRadius: 19, backgroundColor: c.surface2, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }}>
                <T variant="body" color={c.accent} style={{ fontWeight: '700', fontSize: 14 }}>Ask</T>
              </Pressable>
            </Row>
          </View>
        ))}
        {(cands ?? []).length === 0 ? <T variant="body" color={c.text2} style={{ marginTop: 10 }}>No one else has joined yet.</T> : null}
      </Stack>
    </ScrollView>
  );
}

function Pending({ p }: { p: any }) {
  const c = useColors(); const qc = useQueryClient();
  async function respond(accept: boolean) { await repo.respondPartner(p.id, accept); qc.invalidateQueries({ queryKey: ['partnership'] }); }
  async function cancel() { await repo.endPartnership(p.id); qc.invalidateQueries({ queryKey: ['partnership'] }); }
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
      {p.iRequested ? (
        <>
          <T variant="t1" style={{ fontSize: 26, textAlign: 'center' }}>Waiting for {p.partnerName}</T>
          <T variant="body" color={c.text2} style={{ textAlign: 'center', marginTop: 10, fontSize: 17 }}>They’ll see your ask next time they open the app. Your space opens when they say yes.</T>
          <View style={{ marginTop: 22, alignItems: 'center' }}><T variant="body" color={c.clay} onPress={cancel} style={{ fontWeight: '700' }}>Cancel the ask</T></View>
        </>
      ) : (
        <>
          <T variant="t1" style={{ fontSize: 26, textAlign: 'center' }}>{p.partnerName} asked to be your partner</T>
          <T variant="body" color={c.text2} style={{ textAlign: 'center', marginTop: 10, fontSize: 17 }}>Just the two of you — check in, pray, be honest. You can end it anytime.</T>
          <View style={{ marginTop: 22 }}><Button label={`Yes, partner with ${p.partnerName}`} onPress={() => respond(true)} /></View>
          <View style={{ marginTop: 14, alignItems: 'center' }}><T variant="body" color={c.text2} onPress={() => respond(false)} style={{ fontWeight: '700' }}>Not right now</T></View>
        </>
      )}
    </View>
  );
}

function Space({ p, myId }: { p: any; myId: string }) {
  const c = useColors(); const router = useRouter(); const qc = useQueryClient();
  const { data: focus } = useQuery({ queryKey: ['focus', p.id], queryFn: () => repo.getFocus(p.id) });
  const { data: msgs } = useQuery({ queryKey: ['pmsgs', p.id], queryFn: () => repo.getPartnerMessages(p.id) });
  const { data: challenge } = useQuery({ queryKey: ['challenge', p.id], queryFn: () => repo.getActiveChallenge(p.id) });
  const [mine, setMine] = useState(''); const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState('');
  useEffect(() => { if (focus && !dirty) setMine(focus[myId] ?? ''); }, [focus]);

  async function saveFocus() { await repo.setFocus(p.id, myId, mine); setDirty(false); qc.invalidateQueries({ queryKey: ['focus', p.id] }); }
  async function send() { if (!msg.trim()) return; await repo.addPartnerMessage(p.id, myId, msg); setMsg(''); qc.invalidateQueries({ queryKey: ['pmsgs', p.id] }); }
  async function end() { await repo.endPartnership(p.id); qc.invalidateQueries({ queryKey: ['partnership'] }); router.back(); }

  const partnerFocus = focus ? Object.entries(focus).find(([k]) => k !== myId)?.[1] : undefined;

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <T variant="t1" style={{ fontSize: 26 }}>You &amp; {p.partnerName}</T>
      <T variant="body" color={c.text2} style={{ fontSize: 14, marginTop: 2 }}>Private to you two</T>

      {/* Challenge */}
      {challenge ? (
        <Card pad={16} style={{ marginTop: 16 }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <T variant="kicker" color={c.text2}>Together right now</T>
              <T variant="t2" style={{ marginTop: 6 }}>{challenge.title}</T>
              <T variant="body" color={c.text2} style={{ marginTop: 2 }}>Day {challenge.dayNum} of {challenge.days}</T>
            </View>
            <Row gap={5}>
              {Array.from({ length: challenge.days }).map((_, i) => (
                <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < challenge.dayNum ? c.accent : 'transparent', borderWidth: i < challenge.dayNum ? 0 : 1.5, borderColor: c.accent }} />
              ))}
            </Row>
          </Row>
          {challenge.kind === 'fasting' ? (
            <Row gap={8} style={{ marginTop: 12, alignItems: 'flex-start', backgroundColor: c.sage, borderRadius: 14, padding: 12 }}>
              <Icon name="info" size={16} color={c.sageInk} strokeWidth={2} />
              <T variant="body" style={{ flex: 1, fontSize: 13.5, lineHeight: 20 }}>Fasting is spiritual, not a diet. Drink water, use wisdom, and stop if your body needs you to.</T>
            </Row>
          ) : null}
        </Card>
      ) : (
        <View style={{ marginTop: 16 }}><Button label="Start a challenge together" onPress={() => router.push('/new-challenge')} /></View>
      )}

      {/* Praying for each other */}
      <T variant="kicker" style={{ marginTop: 22 }}>Praying for each other</T>
      <Card pad={14} style={{ marginTop: 10 }}>
        <T variant="kicker" color={c.text2}>You</T>
        <TextInput value={mine} onChangeText={(t) => { setMine(t); setDirty(true); }} multiline
          placeholder="What are you carrying right now?" placeholderTextColor={c.text2}
          style={{ color: c.text, fontSize: 16, lineHeight: 23, marginTop: 6, minHeight: 24 }} />
        {dirty ? <Pressable onPress={saveFocus} style={{ alignSelf: 'flex-start', marginTop: 8 }}><T variant="body" color={c.accent} style={{ fontWeight: '700', fontSize: 14 }}>Save</T></Pressable> : null}
      </Card>
      <Card pad={14} style={{ marginTop: 10 }}>
        <T variant="kicker" color={c.text2}>{p.partnerName}</T>
        <T variant="body" color={partnerFocus ? c.text : c.text2} style={{ marginTop: 6, fontSize: 16, lineHeight: 23 }}>{partnerFocus || 'Nothing yet.'}</T>
      </Card>

      {/* Thread */}
      <T variant="kicker" style={{ marginTop: 22 }}>Between you</T>
      <T variant="body" color={c.text2} style={{ fontSize: 14, marginTop: 4 }}>How are you, really?</T>
      <Stack gap={14} style={{ marginTop: 12 }}>
        {(msgs ?? []).map((m: any) => (
          <Row key={m.id} gap={10} style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: m.memberId === myId ? c.pill : c.lilac, alignItems: 'center', justifyContent: 'center' }}>
              <T variant="body" color={m.memberId === myId ? c.accent : c.lilacInk} style={{ fontWeight: '700', fontSize: 12 }}>{m.author[0]}</T>
            </View>
            <T variant="body" style={{ flex: 1 }}>{m.text}</T>
          </Row>
        ))}
      </Stack>
      <Row gap={10} style={{ marginTop: 16 }}>
        <View style={{ flex: 1, minHeight: 48, borderRadius: 24, backgroundColor: c.surface2, justifyContent: 'center', paddingHorizontal: 18 }}>
          <TextInput value={msg} onChangeText={setMsg} placeholder={`Say something to ${p.partnerName}`} placeholderTextColor={c.text2} multiline style={{ color: c.text, fontSize: 16, paddingVertical: 12 }} />
        </View>
        <Pressable onPress={send} disabled={!msg.trim()} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', opacity: msg.trim() ? 1 : 0.5 }}>
          <Icon name="send" size={20} color={c.onAccent} strokeWidth={1.8} />
        </Pressable>
      </Row>

      <View style={{ marginTop: 24, alignItems: 'center' }}>
        <T variant="body" color={c.text2} onPress={end} style={{ fontSize: 13.5 }}>End partnership</T>
      </View>
    </ScrollView>
  );
}
