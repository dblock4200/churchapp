import React from 'react';
import { Text as RNText, TextProps, Platform } from 'react-native';
import { useColors } from '../theme/ThemeProvider';
import { type } from '../theme/tokens';

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

type Variant = keyof typeof type;
type Props = TextProps & { variant?: Variant; color?: string; children: React.ReactNode };

// One text component drives the whole type scale. Fonts fall back to the
// platform system face until the Google fonts are bundled (see README next-steps).
export function T({ variant = 'body', color, style, children, ...rest }: Props) {
  const c = useColors();
  const t = type[variant];
  const base: any = {
    fontSize: t.size,
    lineHeight: t.lineHeight,
    fontWeight: t.weight,
    color: color ?? c.text,
  };
  if (t.family === 'scripture') base.fontFamily = serif;
  if (variant === 'kicker') { base.letterSpacing = 0.8; base.textTransform = 'uppercase'; base.color = color ?? c.text2; }
  return <RNText style={[base, style]} {...rest}>{children}</RNText>;
}
