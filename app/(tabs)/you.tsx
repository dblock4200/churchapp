import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Row, Avatar, Hairline } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon, IconName } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthProvider';
import { usePartnership } from '../../src/data/hooks';

export default function You() {
  const c = useColors();
  const router = useRouter();
  const { member, signOut } = useAuth();
  const { data: partnership } = usePartnership();
  const name = member?.display_name ?? 'You';

  const partnerValue = partnership?.status === 'active' ? `with ${partnership.partnerName}`
    : partnership?.status === 'pending' ? 'Pending' : 'Optional · not set up';

  return (
    <Screen>
      <Row style={{ minHeight: 46, marginTop: 8 }}><T variant="t1">You</T></Row>

      <Card pad={16} style={{ marginTop: 8 }}>
        <Row gap={16}>
          <Avatar name={name} size={64} />
          <View style={{ flex: 1 }}>
            <T variant="t2">{name}</T>
            <T variant="body" color={c.text2} style={{ marginTop: 2 }}>{member?.is_leader ? 'Leads' : 'Part of'} {member?.group_name ?? 'Philia'}</T>
          </View>
        </Row>
      </Card>

      <View style={{ marginTop: 22 }}>
        <SettingsGroup rows={[
          ...(member?.is_leader ? [{ icon: 'calendar' as IconName, tint: c.pill, ink: c.accent, label: 'Set this week', onPress: () => router.push('/set-week') }] : []),
          { icon: 'users', tint: c.lilac, ink: c.lilacInk, label: 'Accountability partner', value: partnerValue, onPress: () => router.push('/partner') },
          { icon: 'bell', tint: c.butter, ink: c.butterInk, label: 'Reminders', value: 'Tue 5pm' },
        ]} />
      </View>
      <View style={{ marginTop: 14 }}>
        <SettingsGroup rows={[{ icon: 'info', tint: c.sage, ink: c.sageInk, label: 'About Philia' }]} />
      </View>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <T variant="body" color={c.text2} onPress={signOut} style={{ fontSize: 15, fontWeight: '600' }}>Sign out</T>
      </View>
    </Screen>
  );
}

type Rowt = { icon: IconName; tint: string; ink: string; label: string; value?: string; onPress?: () => void };
function SettingsGroup({ rows }: { rows: Rowt[] }) {
  const c = useColors();
  return (
    <Card pad={0}>
      {rows.map((r, i) => (
        <View key={r.label}>
          {i > 0 ? <Hairline /> : null}
          <Pressable onPress={r.onPress} disabled={!r.onPress}>
            <Row gap={14} style={{ minHeight: 62, paddingHorizontal: 16, paddingVertical: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: r.tint, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={r.icon} size={20} color={r.ink} strokeWidth={2} />
              </View>
              <T variant="body" style={{ flex: 1, fontWeight: '600' }}>{r.label}</T>
              {r.value ? <T variant="body" color={c.text2} style={{ fontSize: 14 }}>{r.value}</T> : null}
              {r.onPress ? <Icon name="chevron-right" size={18} color={c.text2} strokeWidth={2.2} /> : null}
            </Row>
          </Pressable>
        </View>
      ))}
    </Card>
  );
}
