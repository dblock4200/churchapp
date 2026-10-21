import { Platform, Alert, Linking } from 'react-native';
import * as Calendar from 'expo-calendar';

// Add a schedule item to the phone's own calendar (Apple, Google, Samsung —
// whatever the device syncs). Writes to the default/first writable calendar.
export async function addToDeviceCalendar(item: { title: string; startsAt?: string; place?: string; durationMin?: number }): Promise<void> {
  if (!item.startsAt) { Alert.alert('No time set', 'This item doesn’t have a time yet.'); return; }
  if (Platform.OS === 'web') { Alert.alert('On your phone', 'Adding to your calendar works in the Philia app on your phone.'); return; }

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Calendar is off', 'To add this to your calendar, turn on calendar access for Philia in Settings.',
      [{ text: 'Not now', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }]);
    return;
  }

  const calId = await writableCalendarId();
  if (!calId) { Alert.alert('No calendar found', 'Couldn’t find a calendar to add this to.'); return; }

  const start = new Date(item.startsAt);
  const end = new Date(start.getTime() + (item.durationMin ?? 90) * 60 * 1000);
  try {
    await Calendar.createEventAsync(calId, {
      title: item.title, startDate: start, endDate: end, location: item.place || undefined,
      notes: 'Added from Philia', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    Alert.alert('Added', `“${item.title}” is on your calendar.`);
  } catch {
    Alert.alert('Couldn’t add it', 'Something went wrong adding this to your calendar.');
  }
}

async function writableCalendarId(): Promise<string | null> {
  if (Platform.OS === 'ios') {
    try { const def = await Calendar.getDefaultCalendarAsync(); if (def?.id) return def.id; } catch { /* fall through */ }
  }
  const cals = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = cals.find(c => c.allowsModifications && (c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.CONTRIBUTOR))
    ?? cals.find(c => c.allowsModifications);
  return writable?.id ?? null;
}
