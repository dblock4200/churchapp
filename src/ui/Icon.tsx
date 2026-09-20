import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useColors } from '../theme/ThemeProvider';

export type IconName =
  | 'calendar' | 'bookmark' | 'person' | 'chevron-left' | 'chevron-right'
  | 'book' | 'send' | 'camera' | 'search' | 'info' | 'bell' | 'pencil'
  | 'users' | 'close' | 'plus' | 'check' | 'heart' | 'sparkle' | 'speaker';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

export function Icon({ name, size = 23, color, strokeWidth = 1.9 }: Props) {
  const c = useColors();
  const stroke = color ?? c.text;
  const common = { stroke, strokeWidth, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {render(name, common, stroke)}
    </Svg>
  );
}

function render(name: IconName, p: any, stroke: string) {
  switch (name) {
    case 'calendar': return <>
      <Rect x="3.6" y="5" width="16.8" height="15.4" rx="3.2" {...p} />
      <Path d="M3.6 9.6h16.8M8 3.4v3.4M16 3.4v3.4" {...p} /></>;
    case 'bookmark': return <Path d="M6.4 4.6A1.6 1.6 0 0 1 8 3h8a1.6 1.6 0 0 1 1.6 1.6V20l-5.6-3.4L6.4 20z" {...p} />;
    case 'person': return <>
      <Circle cx="12" cy="8.6" r="3.7" {...p} />
      <Path d="M5.2 19.8c0-3.3 3-5.4 6.8-5.4s6.8 2.1 6.8 5.4" {...p} /></>;
    case 'chevron-left': return <Path d="M14.5 5.5 8 12l6.5 6.5" {...p} />;
    case 'chevron-right': return <Path d="M9.5 5.5 16 12l-6.5 6.5" {...p} />;
    case 'book': return <>
      <Path d="M4.4 5.4A1.8 1.8 0 0 1 6.2 3.7h5.8v14.4H6.2a1.8 1.8 0 0 0-1.8 1.7z" {...p} />
      <Path d="M19.6 5.4a1.8 1.8 0 0 0-1.8-1.7H12v14.4h5.8a1.8 1.8 0 0 1 1.8 1.7z" {...p} /></>;
    case 'send': return <Path d="M12 19V5M6 11l6-6 6 6" {...p} />;
    case 'camera': return <>
      <Rect x="3" y="6.4" width="18" height="13.2" rx="3.2" {...p} />
      <Circle cx="12" cy="13" r="3.4" {...p} />
      <Path d="M8.6 6.4 10 4h4l1.4 2.4" {...p} /></>;
    case 'search': return <><Circle cx="11" cy="11" r="6.6" {...p} /><Path d="M15.9 15.9 20 20" {...p} /></>;
    case 'info': return <><Circle cx="12" cy="12" r="8.2" {...p} /><Path d="M12 11v5.2" {...p} /><Circle cx="12" cy="7.9" r="0.3" {...p} fill={stroke} /></>;
    case 'bell': return <>
      <Path d="M6.6 10.2a5.4 5.4 0 0 1 10.8 0c0 4 1.6 5.2 1.6 5.2H5s1.6-1.2 1.6-5.2z" {...p} />
      <Path d="M10.2 18.4a2 2 0 0 0 3.6 0" {...p} /></>;
    case 'pencil': return <><Path d="M5 19.2 5.9 15 16.2 4.7a2.2 2.2 0 0 1 3.1 3.1L9 18.1Z" {...p} /><Path d="M14.6 6.4 17.6 9.4" {...p} /></>;
    case 'users': return <>
      <Circle cx="9" cy="9" r="3.2" {...p} />
      <Path d="M3.4 19.2c0-3 2.5-4.9 5.6-4.9s5.6 1.9 5.6 4.9" {...p} />
      <Path d="M16 6.2a3.2 3.2 0 0 1 0 6.1" {...p} />
      <Path d="M17.4 14.6c2.2.5 3.8 2.1 3.8 4.6" {...p} /></>;
    case 'close': return <Path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" {...p} />;
    case 'plus': return <Path d="M12 5.5v13M5.5 12h13" {...p} />;
    case 'check': return <Path d="M5.5 12.5 10 17l8.5-9.5" {...p} />;
    case 'heart': return <Path d="M12 20.2c-.4 0-.7-.1-1-.4C8.2 17.3 4.4 14.1 4.4 10.4 4.4 8 6.2 6.2 8.5 6.2c1.4 0 2.6.6 3.5 1.7.9-1.1 2.1-1.7 3.5-1.7 2.3 0 4.1 1.8 4.1 4.2 0 3.7-3.8 6.9-6.6 9.4-.3.3-.6.4-1 .4Z" {...p} />;
    case 'sparkle': return <Path d="M12 4.2c.4 3.4 1.8 4.8 5.2 5.2-3.4.4-4.8 1.8-5.2 5.2-.4-3.4-1.8-4.8-5.2-5.2 3.4-.4 4.8-1.8 5.2-5.2z" {...p} />;
    case 'speaker': return <>
      <Path d="M11 5.6 6.9 9H4.4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.5l4.1 3.4a.6.6 0 0 0 1-.5V6.1a.6.6 0 0 0-1-.5z" {...p} />
      <Path d="M15.6 9.4a3.6 3.6 0 0 1 0 5.2" {...p} /></>;
  }
}
