import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Row, Stack, Button } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useSchedule } from '../../src/data/hooks';
import { useAuth } from '../../src/auth/AuthProvider';
import { addToDeviceCalendar } from '../../src/calendar';

type Mode = 'Upcoming' | 'Week' | 'Month';

const TAG: Record<string, { label: string; tint: 'pill' | 'sage' | 'peach'; ink: string }> = {
  gathering: { label: 'Gathering', tint: 'pill', ink: 'accent' },
  meetup: { label: 'Meet-up', tint: 'sage', ink: 'sageInk' },
  event: { label: 'Group event', tint: 'peach', ink: 'peachInk' },
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const itemDate = (it: any): Date | null => (it.startsAt ? new Date(it.startsAt) : null);
const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
function startOfWeek(d: Date) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - x.getDay()); return x; }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default function Schedule() {
  const c = useColors();
  const router = useRouter();
  const { member } = useAuth();
  const { data, isLoading } = useSchedule();
  const items = (data ?? []) as any[];
  const [view, setView] = useState<Mode>('Upcoming');
  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const byDay = useMemo(() => {
    const m: Record<string, any[]> = {};
    items.forEach(it => { const d = itemDate(it); if (d) (m[dayKey(d)] ||= []).push(it); });
    return m;
  }, [items]);

  return (
    <Screen scroll={false} pad={false}>
      <Row style={{ paddingHorizontal: 20, paddingTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
        <T variant="t1">Schedule</T>
        {member?.is_leader ? (
          <Pressable onPress={() => router.push('/new-event?kind=event')}
            style={{ height: 34, borderRadius: 17, backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12 }}>
            <Icon name="plus" size={15} color={c.accent} strokeWidth={2.4} />
            <T variant="body" color={c.accent} style={{ fontWeight: '700', fontSize: 13 }}>Event</T>
          </Pressable>
        ) : null}
      </Row>

      {/* View switch */}
      <Row gap={8} style={{ paddingHorizontal: 20, marginTop: 12 }}>
        {(['Upcoming', 'Week', 'Month'] as Mode[]).map(v => {
          const on = v === view;
          return (
            <Pressable key={v} onPress={() => setView(v)} style={{ flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface2 }}>
              <T variant="body" color={on ? c.onAccent : c.text2} style={{ fontWeight: '700', fontSize: 14 }}>{v}</T>
            </Pressable>
          );
        })}
      </Row>

      <View style={{ flex: 1, minHeight: 0, marginTop: 10 }}>
        {isLoading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
        ) : view === 'Upcoming' ? (
          <UpcomingView items={items} />
        ) : view === 'Week' ? (
          <WeekView anchor={anchor} setAnchor={setAnchor} byDay={byDay} />
        ) : (
          <MonthView anchor={anchor} setAnchor={setAnchor} selected={selected} setSelected={setSelected} byDay={byDay} />
        )}
        <View style={{ paddingHorizontal: 20, paddingBottom: 12, paddingTop: 4 }}>
          <Button label="Suggest a meet-up" onPress={() => router.push('/new-event?kind=meetup')} />
        </View>
      </View>
    </Screen>
  );
}

function ScheduleCard({ it }: { it: any }) {
  const c = useColors();
  const router = useRouter();
  const tag = TAG[it.kind] ?? TAG.event;
  const onPress = it.kind === 'gathering' ? () => router.push('/') : () => router.push(`/event/${it.id}`);
  return (
    <Pressable onPress={onPress}>
      <Card tint={it.kind === 'gathering' ? 'pill' : 'surface'} pad={13}>
        <Row gap={12} style={{ alignItems: 'center' }}>
          <View style={{ width: 52, height: 56, borderRadius: 14, backgroundColor: it.kind === 'gathering' ? c.accent : c.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <T variant="kicker" color={it.kind === 'gathering' ? c.onAccent : c.text2} style={{ fontSize: 11 }}>{it.box.dow}</T>
            <T variant="t2" color={it.kind === 'gathering' ? c.onAccent : c.text} style={{ fontSize: 20 }}>{it.box.day}</T>
          </View>
          <View style={{ flex: 1 }}>
            <T variant="t3">{it.title}</T>
            <T variant="body" color={c.text2} style={{ fontSize: 13.5, marginTop: 2 }}>{it.meta}</T>
            <View style={{ alignSelf: 'flex-start', marginTop: 8, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: (c as any)[tag.tint] }}>
              <T variant="kicker" color={(c as any)[tag.ink]} style={{ fontSize: 10.5 }}>{tag.label}</T>
            </View>
          </View>
          <Pressable onPress={() => addToDeviceCalendar(it)} hitSlop={10}
            style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={18} color={c.accent} strokeWidth={2} />
          </Pressable>
        </Row>
      </Card>
    </Pressable>
  );
}

function Empty({ line }: { line: string }) {
  const c = useColors();
  return <T variant="body" color={c.text2} style={{ marginTop: 30, textAlign: 'center', fontSize: 16, lineHeight: 24, paddingHorizontal: 20 }}>{line}</T>;
}

function UpcomingView({ items }: { items: any[] }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
      {items.length === 0 ? (
        <Empty line="Nothing on the calendar yet. Suggest a meet-up below, or your leader can add an event." />
      ) : (
        <Stack gap={10}>{items.map(it => <ScheduleCard key={it.key} it={it} />)}</Stack>
      )}
    </ScrollView>
  );
}

function PeriodHeader({ label, onPrev, onNext }: { label: string; onPrev: () => void; onNext: () => void }) {
  const c = useColors();
  return (
    <Row style={{ paddingHorizontal: 20, justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <Pressable onPress={onPrev} hitSlop={10} style={{ padding: 6 }}><Icon name="chevron-left" size={22} color={c.accent} strokeWidth={2.2} /></Pressable>
      <T variant="t3">{label}</T>
      <Pressable onPress={onNext} hitSlop={10} style={{ padding: 6 }}><Icon name="chevron-right" size={22} color={c.accent} strokeWidth={2.2} /></Pressable>
    </Row>
  );
}

function WeekView({ anchor, setAnchor, byDay }: { anchor: Date; setAnchor: (d: Date) => void; byDay: Record<string, any[]> }) {
  const c = useColors();
  const wkStart = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(wkStart, i));
  const end = days[6];
  const label = `${MONTHS[wkStart.getMonth()].slice(0, 3)} ${wkStart.getDate()} – ${wkStart.getMonth() === end.getMonth() ? end.getDate() : MONTHS[end.getMonth()].slice(0, 3) + ' ' + end.getDate()}`;
  const today = new Date();
  return (
    <View style={{ flex: 1 }}>
      <PeriodHeader label={label} onPrev={() => setAnchor(addDays(wkStart, -7))} onNext={() => setAnchor(addDays(wkStart, 7))} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <Stack gap={10}>
          {days.map(d => {
            const evs = byDay[dayKey(d)] ?? [];
            const isToday = sameDay(d, today);
            return (
              <Row key={dayKey(d)} gap={12} style={{ alignItems: 'flex-start' }}>
                <View style={{ width: 46, alignItems: 'center', paddingTop: 2 }}>
                  <T variant="kicker" color={isToday ? c.accent : c.text2} style={{ fontSize: 11 }}>{DOW[d.getDay()]}</T>
                  <View style={{ width: 32, height: 32, borderRadius: 16, marginTop: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: isToday ? c.accent : 'transparent' }}>
                    <T variant="t3" color={isToday ? c.onAccent : c.text} style={{ fontSize: 16 }}>{d.getDate()}</T>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  {evs.length === 0 ? (
                    <View style={{ minHeight: 38, justifyContent: 'center' }}><T variant="body" color={c.text2} style={{ fontSize: 14, opacity: 0.5 }}>—</T></View>
                  ) : (
                    <Stack gap={8}>{evs.map(it => <ScheduleCard key={it.key} it={it} />)}</Stack>
                  )}
                </View>
              </Row>
            );
          })}
        </Stack>
      </ScrollView>
    </View>
  );
}

function MonthView({ anchor, setAnchor, selected, setSelected, byDay }: { anchor: Date; setAnchor: (d: Date) => void; selected: Date; setSelected: (d: Date) => void; byDay: Record<string, any[]> }) {
  const c = useColors();
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const today = new Date();
  const selEvents = byDay[dayKey(selected)] ?? [];
  return (
    <View style={{ flex: 1 }}>
      <PeriodHeader label={`${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`}
        onPrev={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
        onNext={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))} />
      <View style={{ paddingHorizontal: 16 }}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          {DOW.map(d => <View key={d} style={{ flex: 1, alignItems: 'center' }}><T variant="kicker" color={c.text2} style={{ fontSize: 10.5 }}>{d[0]}</T></View>)}
        </Row>
        {Array.from({ length: 6 }, (_, w) => (
          <Row key={w} style={{ justifyContent: 'space-between' }}>
            {cells.slice(w * 7, w * 7 + 7).map(d => {
              const inMonth = d.getMonth() === anchor.getMonth();
              const isToday = sameDay(d, today);
              const isSel = sameDay(d, selected);
              const has = (byDay[dayKey(d)] ?? []).length > 0;
              return (
                <Pressable key={dayKey(d)} onPress={() => setSelected(new Date(d))} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? c.accent : isToday ? c.surface2 : 'transparent' }}>
                    <T variant="body" color={isSel ? c.onAccent : inMonth ? c.text : c.text2} style={{ fontSize: 15, fontWeight: isToday || isSel ? '700' : '400', opacity: inMonth ? 1 : 0.4 }}>{d.getDate()}</T>
                  </View>
                  <View style={{ width: 5, height: 5, borderRadius: 3, marginTop: 2, backgroundColor: has && !isSel ? c.clay : 'transparent' }} />
                </Pressable>
              );
            })}
          </Row>
        ))}
      </View>
      <ScrollView style={{ flex: 1, marginTop: 8 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
        <T variant="kicker" style={{ marginBottom: 10 }}>{DOW[selected.getDay()]} · {MONTHS[selected.getMonth()].slice(0, 3)} {selected.getDate()}</T>
        {selEvents.length === 0 ? (
          <T variant="body" color={c.text2} style={{ fontSize: 15 }}>Nothing on this day.</T>
        ) : (
          <Stack gap={10}>{selEvents.map(it => <ScheduleCard key={it.key} it={it} />)}</Stack>
        )}
      </ScrollView>
    </View>
  );
}
