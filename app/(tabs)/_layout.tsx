import React from 'react';
import { View, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../src/theme/ThemeProvider';
import { shadow } from '../../src/theme/tokens';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Icon, IconName } from '../../src/ui/Icon';
import { T } from '../../src/ui/Text';

const TABS: { name: string; label: string; icon: IconName }[] = [
  { name: 'index', label: 'This Week', icon: 'calendar' },
  { name: 'between', label: 'Between', icon: 'bookmark' },
  { name: 'you', label: 'You', icon: 'person' },
];

function TabBar({ state, navigation }: any) {
  const { scheme, c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      flexDirection: 'row', backgroundColor: c.bar,
      borderTopLeftRadius: 26, borderTopRightRadius: 26,
      paddingTop: 8, paddingHorizontal: 10, paddingBottom: Math.max(insets.bottom, 12),
      ...shadow(scheme, 'bar'),
    }}>
      {state.routes
        .filter((r: any) => TABS.some(t => t.name === r.name))
        .map((route: any) => {
          const meta = TABS.find(t => t.name === route.name)!;
          const focused = state.routes[state.index].name === route.name;
          const color = focused ? c.accent : c.text2;
          return (
            <Pressable key={route.key} onPress={() => navigation.navigate(route.name)}
              style={{ flex: 1, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 3,
                backgroundColor: focused ? c.pill : 'transparent' }}>
              <Icon name={meta.icon} size={23} color={color} strokeWidth={focused ? 2.1 : 1.9} />
              <T variant="kicker" color={color} style={{ letterSpacing: 0.3 }}>{meta.label}</T>
            </Pressable>
          );
        })}
    </View>
  );
}

export default function TabsLayout() {
  const c = useColors();
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.ground } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="between" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
