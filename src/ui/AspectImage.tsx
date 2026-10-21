import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { useColors } from '../theme/ThemeProvider';

// Instagram-style photo sizing: respect the picture's real shape instead of
// forcing one height. Clamp so a very tall portrait or very wide panorama still
// sits politely in the feed — portrait no taller than 4:5, landscape no wider
// than 1.91:1 (the same bounds Instagram uses). Anything in between shows uncropped.
const MIN_RATIO = 4 / 5;   // 0.8  — tallest allowed (portrait)
const MAX_RATIO = 1.91;    //       — widest allowed (landscape)

export function AspectImage({ uri, radius = 16, marginTop = 12 }: { uri?: string | null; radius?: number; marginTop?: number }) {
  const c = useColors();
  const [ratio, setRatio] = useState<number | null>(null);

  useEffect(() => {
    if (!uri) { setRatio(null); return; }
    let live = true;
    Image.getSize(
      uri,
      (w, h) => { if (live && w > 0 && h > 0) setRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, w / h))); },
      () => { if (live) setRatio(1); }, // fall back to a square if the size can't be read
    );
    return () => { live = false; };
  }, [uri]);

  if (!uri) return <View style={{ width: '100%', aspectRatio: 1.4, borderRadius: radius, backgroundColor: c.surface2, marginTop }} />;
  return (
    <Image
      source={{ uri }}
      style={{ width: '100%', aspectRatio: ratio ?? 1.4, borderRadius: radius, marginTop, backgroundColor: c.surface2 }}
      resizeMode="cover"
    />
  );
}
