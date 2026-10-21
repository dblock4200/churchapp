import React, { useState } from 'react';
import { View, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Row, Avatar, Hairline } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon, IconName } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/auth/AuthProvider';
import { usePartnership, usePhotoUrl } from '../../src/data/hooks';
import { repo } from '../../src/data/repo';
import * as ImagePicker from 'expo-image-picker';

export default function You() {
  const c = useColors();
  const router = useRouter();
  const { member, signOut, refreshMember } = useAuth();
  const { data: partnership } = usePartnership();
  const name = member?.display_name ?? 'You';
  const { data: avatarUrl } = usePhotoUrl(member?.avatar_path);
  const [busy, setBusy] = useState(false);

  async function changeAvatar(fromCamera: boolean) {
    if (!member) return;
    // Ask for the right permission first; if access is off for good, point to Settings.
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        fromCamera ? 'Camera is off' : 'Photos are off',
        `To ${fromCamera ? 'take a profile photo' : 'choose a photo'}, turn on access for Philia in Settings.`,
        [{ text: 'Not now', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
      );
      return;
    }
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]?.uri) return;
    setBusy(true);
    try {
      await repo.setMyAvatar(member.id, member.group_id, res.assets[0].uri);
      await refreshMember();
    } finally {
      setBusy(false);
    }
  }
  function onAvatarPress() {
    Alert.alert('Profile photo', undefined, [
      // Defer the picker until the alert has fully dismissed - launching a picker from
      // inside an alert callback silently no-ops on iOS because the alert is still on screen.
      { text: 'Take a photo', onPress: () => setTimeout(() => changeAvatar(true), 350) },
      { text: 'Choose from camera roll', onPress: () => setTimeout(() => changeAvatar(false), 350) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const partnerValue = partnership?.status === 'active' ? `with ${partnership.partnerName}`
    : partnership?.status === 'pending' ? 'Pending' : 'Optional · not set up';

  return (
    <Screen>
      <Row style={{ minHeight: 46, marginTop: 8 }}><T variant="t1">You</T></Row>

      <Card pad={16} style={{ marginTop: 8 }}>
        <Row gap={16}>
          <Pressable onPress={onAvatarPress}>
            <Avatar name={name} size={64} uri={avatarUrl} />
            <View style={{ position: 'absolute', right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.ground }}>
              {busy ? <ActivityIndicator size="small" color={c.onAccent} /> : <Icon name="camera" size={12} color={c.onAccent} strokeWidth={2.2} />}
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <T variant="t2">{name}</T>
            {member?.username ? <T variant="body" color={c.text2} style={{ marginTop: 2, fontWeight: '600' }}>@{member.username}</T> : null}
            <T variant="body" color={c.text2} style={{ marginTop: 2 }}>{member?.is_leader ? 'Leads' : 'Part of'} {member?.group_name ?? 'Philia'}</T>
          </View>
        </Row>
      </Card>

      <View style={{ marginTop: 22 }}>
        <SettingsGroup rows={[
          ...(member?.is_leader ? [{ icon: 'calendar' as IconName, tint: c.pill, ink: c.accent, label: 'Set this week', onPress: () => router.push('/set-week') }] : []),
          { icon: 'users', tint: c.lilac, ink: c.lilacInk, label: 'Accountability partner', value: partnerValue, onPress: () => router.push('/partner') },
          { icon: 'bell' as IconName, tint: c.butter, ink: c.butterInk, label: 'Reminders', onPress: () => router.push('/reminders') },
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
