import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeProvider';
import { type } from '../theme/tokens';

const FAM = {
  fredoka500: 'Fredoka_500Medium', fredoka600: 'Fredoka_600SemiBold',
  nunito400: 'Nunito_400Regular', nunito600: 'Nunito_600SemiBold', nunito700: 'Nunito_700Bold',
  literata400: 'Literata_400Regular', literata500: 'Literata_500Medium',
};

function familyFor(variant: Variant, weight: number): string {
  if (variant === 'scripture') return weight >= 500 ? FAM.literata500 : FAM.literata400;
  if (variant === 't1' || variant === 't2' || variant === 't3') return weight >= 600 ? FAM.fredoka600 : FAM.fredoka500;
  if (weight >= 700) return FAM.nunito700;
  if (weight >= 600) return FAM.nunito600;
  return FAM.nunito400;
}

type Variant = keyof typeof type;
type Props = TextProps & { variant?: Variant; color?: string; children: React.ReactNode };

// One text component drives the whole type scale and maps each (variant, weight)
// to a specific bundled font, since RN can't synthesize weight from one face.
export function T({ variant = 'body', color, style, children, ...rest }: Props) {
  const c = useColors();
  const t = type[variant];
  const flat = StyleSheet.flatten(style) || {};
  const weight = parseInt(String((flat as any).fontWeight ?? t.weight), 10) || 400;
  const base: any = {
    fontSize: t.size,
    lineHeight: t.lineHeight,
    color: color ?? c.text,
    fontFamily: familyFor(variant, weight),
  };
  if (variant === 'kicker') { base.letterSpacing = 0.8; base.textTransform = 'uppercase'; base.color = color ?? c.text2; }
  // fontWeight is redundant with the picked family; drop it so it never overrides the face
  const merged = { ...base, ...flat };
  delete (merged as any).fontWeight;
  merged.fontFamily = familyFor(variant, weight);
  return <RNText style={merged} {...rest}>{children}</RNText>;
}
