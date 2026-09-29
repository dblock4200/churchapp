import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { T } from './Text';
import { Icon } from './Icon';
import { useColors } from '../theme/ThemeProvider';
import { SongPlayer } from './SongPlayer';

export type Song = { platform: string; url: string; title: string; artist: string; artwork: string; embedUrl: string };

const LABEL: Record<string, string> = { spotify: 'Spotify', apple: 'Apple Music', youtube: 'YouTube' };
// Each service's embed has its own natural height.
const HEIGHT: Record<string, number> = { spotify: 152, apple: 175, youtube: 200 };

export function SongCard({ song }: { song: Song | null | undefined }) {
  const c = useColors();
  if (!song?.embedUrl) return null;
  return (
    <View style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: c.surface2 }}>
      <SongPlayer embedUrl={song.embedUrl} height={HEIGHT[song.platform] ?? 160} />
      <Pressable
        onPress={() => Linking.openURL(song.url)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 10 }}>
        <Icon name="speaker" size={15} color={c.text2} strokeWidth={2} />
        <T variant="body" color={c.text2} style={{ fontSize: 13, flex: 1, fontWeight: '600' }} numberOfLines={1}>
          Open in {LABEL[song.platform] ?? 'app'}
        </T>
        <Icon name="send" size={14} color={c.text2} strokeWidth={2} />
      </Pressable>
    </View>
  );
}
