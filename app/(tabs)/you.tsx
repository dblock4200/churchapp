import React from 'react';
import { View } from 'react-native';
import { Screen, Card, Kicker, Row, Stack, Avatar, Hairline } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon, IconName } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { hasSupabase } from '../../src/lib/supabase';

// The You tab wasn't in the mockup set — this is a first honest pass so the
// third tab isn't empty: identity, the week-admin note, and quiet settings.
export default function You() {
  const c = useColors();
  return (
    <Screen>
      <Row style={{ minHeight: 46, marginTop: 8 }}><T variant="t1">You</T></Row>

      <Card pad={16} style={{ marginTop: 8 }}>
        <Row gap={16}>
          <Avatar name="Renee" size={64} />
          <View style={{ flex: 1 }}>
            <T variant="t2">Renee</T>
            <T variant="body" color={c.text2} style={{ marginTop: 2 }}>Leads Tuesday Night · 9 in the group</T>
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

      <T variant="body" color={c.text2} style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
        {hasSupabase ? 'Signed in' : 'Running on sample data — connect Supabase to go live'}
      </T>
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
