import React from 'react';
import { View, Pressable, ViewStyle, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useColors } from '../theme/ThemeProvider';
import { radius, shadow, space } from '../theme/tokens';
import { T } from './Text';

export function Screen({ children, scroll = true, pad = true, bg }:
  { children: React.ReactNode; scroll?: boolean; pad?: boolean; bg?: keyof ReturnType<typeof useColors> }) {
  const c = useColors();
  const background = bg ? (c as any)[bg] : c.ground;
  const inner = <View style={{ paddingHorizontal: pad ? 20 : 0, flex: 1, minHeight: 0 }}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: background }}>
      {scroll
        ? <ScrollView contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>{inner}</ScrollView>
        : inner}
    </SafeAreaView>
  );
}

type Tint = 'surface' | 'pill' | 'peach' | 'butter' | 'sage' | 'lilac' | 'surface2';
export function Card({ children, tint = 'surface', pad = 16, style }:
  { children: React.ReactNode; tint?: Tint; pad?: number; style?: ViewStyle }) {
  const { scheme, c } = useTheme();
  const isSurface = tint === 'surface';
  return (
    <View style={[{
      backgroundColor: (c as any)[tint], borderRadius: radius.lg, padding: pad,
      ...(isSurface ? shadow(scheme, 'card') : null),
    }, style]}>{children}</View>
  );
}

export function Kicker({ children, color, style }: { children: React.ReactNode; color?: string; style?: any }) {
  return <T variant="kicker" color={color} style={style}>{children}</T>;
}

export function Row({ children, style, gap = 0 }: { children: React.ReactNode; style?: ViewStyle; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}
export function Stack({ children, gap = 12, style }: { children: React.ReactNode; gap?: number; style?: ViewStyle }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function Button({ label, onPress, kind = 'primary' }:
  { label: string; onPress?: () => void; kind?: 'primary' | 'quiet' }) {
  const c = useColors();
  const primary = kind === 'primary';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      height: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
      backgroundColor: primary ? c.accent : c.surface2, opacity: pressed ? 0.85 : 1,
    })}>
      <T variant="body" style={{ fontWeight: '700', fontSize: 17 }} color={primary ? c.onAccent : c.text}>{label}</T>
    </Pressable>
  );
}

export function IconBadge({ children, tint, size = 44, radiusv = 15 }:
  { children: React.ReactNode; tint: string; size?: number; radiusv?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radiusv, backgroundColor: tint,
      alignItems: 'center', justifyContent: 'center' }}>{children}</View>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const c = useColors();
  const map: Record<string, [string, string]> = {
    Renee: [c.peach, c.peachInk], Marcus: [c.sage, c.sageInk], Tom: [c.lilac, c.lilacInk],
    Maria: [c.butter, c.butterInk], Andre: [c.peach, c.peachInk], Dana: [c.sage, c.sageInk],
    You: [c.pill, c.accent],
  };
  const [bg, ink] = map[name] ?? [c.surface2, c.text2];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg,
      alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ fontWeight: '700', fontSize: size * 0.4 }} color={ink}>{name[0]}</T>
    </View>
  );
}

export function PersonLine({ name, meta, metaColor }: { name: string; meta: string; metaColor?: string }) {
  const c = useColors();
  return (
    <Row gap={11}>
      <Avatar name={name} size={36} />
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <T style={{ fontWeight: '700' }}>{name}</T>
        <T variant="kicker" color={metaColor ?? c.text2}>{meta}</T>
      </View>
    </Row>
  );
}

export function Hairline({ inset = 0 }: { inset?: number }) {
  const c = useColors();
  return <View style={{ height: 1, backgroundColor: c.surface2, marginHorizontal: inset }} />;
}
