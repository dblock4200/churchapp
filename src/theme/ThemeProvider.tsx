import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { light, dark, Palette } from './tokens';

type Scheme = 'light' | 'dark';
type ThemeValue = { scheme: Scheme; c: Palette };

const ThemeCtx = createContext<ThemeValue>({ scheme: 'dark', c: dark });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const scheme: Scheme = system === 'light' ? 'light' : 'dark'; // default dark (people read at 11pm)
  const value: ThemeValue = { scheme, c: scheme === 'light' ? light : dark };
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
export const useColors = () => useContext(ThemeCtx).c;

// Font family resolution. When custom fonts are loaded (see app/_layout),
// these names exist; otherwise RN falls back to the platform default.
export const fonts = {
  display: 'Fredoka_600SemiBold',
  displayMed: 'Fredoka_500Medium',
  ui: 'Nunito_400Regular',
  uiSemi: 'Nunito_600SemiBold',
  uiBold: 'Nunito_700Bold',
  scripture: 'Literata_400Regular',
};
