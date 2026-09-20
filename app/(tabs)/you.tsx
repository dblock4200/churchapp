import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Kicker, Row, Stack, Avatar, Hairline } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon, IconName } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthProvider';

// The You tab wasn't in the mockup set — this is a first honest pass so the
// third tab isn't empty: identity, the week-admin note, and quiet settings.
export default function You() {
  const c = useColors();
  const { member, signOut } = useAuth();
  const name = member?.display_name ?? 'You';
  return (
    <Screen>
      <Row style={{ minHeight: 46, marginTop: 8 }}><T variant="t1">You</T></Row>

      <Card pad={16} style={{ marginTop: 8 }}>
        <Row gap={16}>
          <Avatar name={name} size={64} />
          <View style={{ flex: 1 }}>
            <T variant="t2">{name}</T>
            <T variant="body" color={c.text2} style={{ marginTop: 2 }}>{member?.is_leader ? 'Leads' : 'Part of'} {member?.group_name ?? 'Tuesday Night'}</T>
          </View>
        </Row>
      </Card>

      <View style={{ marginTop: 22 }}>
        <SettingsGroup rows={[
          { icon: 'calendar', tint: c.pill, ink: c.accent, label: 'Set this week', value: 'Leader' },
          { icon: 'bell', tint: c.butter, ink: c.butterInk, label: 'Reminders', value: 'Tue 5pm' },
          { icon: 'person', tint: c.sage, ink: c.sageInk, label: 'Your name & photo' },
        ]} />
      </View>
      <View style={{ marginTop: 14 }}>
        <SettingsGroup rows={[
          { icon: 'info', tint: c.lilac, ink: c.lilacInk, label: 'About Tuesday Night' },
        ]} />
      </View>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <T variant="body" color={c.text2} onPress={signOut} style={{ fontSize: 15, fontWeight: '600' }}>Sign out</T>
      </View>
    </Screen>
  );
}

function SettingsGroup({ rows }: { rows: { icon: IconName; tint: string; ink: string; label: string; value?: string }[] }) {
  const c = useColors();
  return (
    <Card pad={0}>
      {rows.map((r, i) => (
        <View key={r.label}>
          {i > 0 ? <Hairline /> : null}
          <Row gap={14} style={{ height: 62, paddingHorizontal: 16 }}>
            <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: r.tint, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={r.icon} size={20} color={r.ink} strokeWidth={2} />
            </View>
            <T variant="body" style={{ flex: 1, fontWeight: '600' }}>{r.label}</T>
            {r.value ? <T variant="body" color={c.text2}>{r.value}</T> : null}
            <Icon name="chevron-right" size={18} color={c.text2} strokeWidth={2.2} />
          </Row>
        </View>
      ))}
    </Card>
  );
}
