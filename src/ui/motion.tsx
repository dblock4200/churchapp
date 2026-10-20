import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

// Warm, gentle motion built on RN's Animated (no worklets/babel needed; works on web too).

// A pressable that springs in slightly when touched — warm tactile feedback.
export function Tap({ children, onPress, disabled, style, scaleTo = 0.95, hitSlop }: {
  children: React.ReactNode; onPress?: () => void; disabled?: boolean;
  style?: StyleProp<ViewStyle>; scaleTo?: number; hitSlop?: number;
}) {
  const s = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress} disabled={disabled} hitSlop={hitSlop}
      onPressIn={() => Animated.spring(s, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 0 }).start()}
      onPressOut={() => Animated.spring(s, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 11 }).start()}
    >
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Content that eases up + fades in on mount, with an optional stagger by index — the "arrival" moment.
export function Appear({ children, index = 0, delay, rise = 14, style }: {
  children: React.ReactNode; index?: number; delay?: number; rise?: number; style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(v, { toValue: 1, useNativeDriver: true, delay: delay ?? index * 65, tension: 90, friction: 11 }).start();
  }, []);
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [rise, 0] });
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

// A soft, continuous pulse ring — used behind the record button.
export function PulseRing({ size, color }: { size: number; color: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1800, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, []);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const opacity = v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', width: size, height: size, borderRadius: size / 2,
      borderWidth: 2, borderColor: color, opacity, transform: [{ scale }],
    }} />
  );
}
