// Design tokens — the "friendly & warm" system, light + dark.
// Ported 1:1 from the approved Tuesday Night mockup.

export type Palette = {
  ground: string; surface: string; surface2: string;
  text: string; text2: string;
  accent: string; green: string; clay: string;
  peach: string; butter: string; sage: string; lilac: string;
  peachInk: string; butterInk: string; sageInk: string; lilacInk: string;
  bar: string; pill: string;
  onAccent: string;
};

export const light: Palette = {
  ground: '#FAF6F1', surface: '#FFFFFF', surface2: '#F1EAE2',
  text: '#2A2622', text2: '#7C7168',
  accent: '#3E7C86', green: '#5C7A49', clay: '#9C5836',
  peach: '#FBE6D8', butter: '#F7EBCE', sage: '#DEEBDD', lilac: '#E7E1F1',
  peachInk: '#B06A4A', butterInk: '#9A7A28', sageInk: '#5C7A49', lilacInk: '#6B5CA6',
  bar: '#FFFFFF', pill: '#D9EAEC', onAccent: '#FFFFFF',
};

export const dark: Palette = {
  ground: '#171512', surface: '#221F1B', surface2: '#2E2A25',
  text: '#ECE6DE', text2: '#A79C90',
  accent: '#6FB0BB', green: '#8FAE7C', clay: '#CE8E6E',
  peach: '#3A2E27', butter: '#35301F', sage: '#223026', lilac: '#2C2838',
  peachInk: '#D69B7C', butterInk: '#D9BE84', sageInk: '#9CBA86', lilacInk: '#BBAEE8',
  bar: '#241F19', pill: '#24373B', onAccent: '#FFFFFF',
};

export const radius = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const space = (n: number) => n * 4;

// Cross-platform soft shadow. react-native-web maps these to box-shadow.
export function shadow(scheme: 'light' | 'dark', level: 'card' | 'bar' = 'card') {
  const darkMode = scheme === 'dark';
  const opacity = darkMode ? (level === 'bar' ? 0.5 : 0.34) : (level === 'bar' ? 0.16 : 0.09);
  return {
    shadowColor: darkMode ? '#000000' : '#785A3C',
    shadowOpacity: opacity,
    shadowRadius: level === 'bar' ? 24 : 18,
    shadowOffset: { width: 0, height: level === 'bar' ? 10 : 8 },
    elevation: level === 'bar' ? 12 : 6,
  };
}

// Type scale — Fredoka (display), Nunito (UI), Literata (scripture).
// fontFamily is filled in by the theme once fonts load; falls back to system.
export const type = {
  t1: { size: 31, lineHeight: 36, weight: '600' as const, family: 'display' as const },
  t2: { size: 21, lineHeight: 27, weight: '500' as const, family: 'display' as const },
  t3: { size: 18, lineHeight: 24, weight: '500' as const, family: 'display' as const },
  body: { size: 16, lineHeight: 24, weight: '400' as const, family: 'ui' as const },
  kicker: { size: 12.5, lineHeight: 15, weight: '700' as const, family: 'ui' as const },
  scripture: { size: 18, lineHeight: 32, weight: '400' as const, family: 'scripture' as const },
};
