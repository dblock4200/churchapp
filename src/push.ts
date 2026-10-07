import { Platform } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { repo } from './data/repo';

// Show banners while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }),
});

// Ask permission, get this device's Expo push token, store it for the member.
// No-op on web (push tokens are native-only).
export async function registerForPush(memberId: string) {
  if (Platform.OS === 'web') return;
  try {
    const existing = await Notifications.getPermissionsAsync();
    let granted = existing.granted;
    if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return;
    const projectId = (Constants.expoConfig as any)?.extra?.eas?.projectId;
    const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;
    if (token) await repo.savePushToken(memberId, token, Platform.OS);
  } catch { /* permission denied or not a device — ignore */ }
}

// Tap a notification → open the screen it points at (data.url).
export function useNotificationRouting() {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const go = (url: unknown) => { if (typeof url === 'string' && url) router.push(url as any); };
    const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
      go(resp.notification.request.content.data?.url);
    });
    Notifications.getLastNotificationResponseAsync().then((resp) => go(resp?.notification.request.content.data?.url));
    return () => sub.remove();
  }, [router]);
}
