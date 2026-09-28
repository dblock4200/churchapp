import 'react-native-gesture-handler';
import { useFonts, Fredoka_500Medium, Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Literata_400Regular, Literata_500Medium } from '@expo-google-fonts/literata';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { AuthProvider, useAuth } from '../src/auth/AuthProvider';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

// Route guard: no session -> sign-in; session but no group membership -> join; else the app.
function useGuard() {
  const { ready, session, member } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    const top = segments[0];
    if (!session) {
      if (top !== 'sign-in') router.replace('/sign-in');
    } else if (!member) {
      if (top !== 'join') router.replace('/join');
    } else if (top === 'sign-in' || top === 'join') {
      router.replace('/');
    }
  }, [ready, session, member, segments]);
}

function RootStack() {
  const { scheme, c } = useTheme();
  const { ready } = useAuth();
  useGuard();
  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: c.ground, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={c.accent} />
    </View>;
  }
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.ground } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="join" />
        <Stack.Screen name="question" />
        <Stack.Screen name="set-week" options={{ presentation: 'modal' }} />
        <Stack.Screen name="post/[id]" />
        <Stack.Screen name="compose" options={{ presentation: 'modal' }} />
        <Stack.Screen name="pray" options={{ presentation: 'modal' }} />
        <Stack.Screen name="event/[id]" />
        <Stack.Screen name="new-event" options={{ presentation: 'modal' }} />
        <Stack.Screen name="partner" />
        <Stack.Screen name="new-challenge" options={{ presentation: 'modal' }} />
        <Stack.Screen name="record-talk" options={{ presentation: 'modal' }} />
        <Stack.Screen name="talk" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium, Fredoka_600SemiBold,
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold,
    Literata_400Regular, Literata_500Medium,
  });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <RootStack />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
