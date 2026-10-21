import React from 'react';
import { View, Pressable, Image, Linking } from 'react-native';
import { T } from './Text';
import { Icon } from './Icon';
import { useColors } from '../theme/ThemeProvider';

export type Song = { platform: string; url: string; title: string; artist: string; artwork: string; embedUrl?: string };

const LABEL: Record<string, string> = { spotify: 'Spotify', apple: 'Apple Music', youtube: 'YouTube' };

// A calm link card — cover art, title, who it's by — that opens the track in the
// person's own music app. No in-app player, no autoplay; just a warm pointer.
export function SongCard({ song }: { song: Song | null | undefined }) {
  const c = useColors();
  if (!song?.url) return null;
  const label = LABEL[song.platform] ?? 'Music';
  const sub = song.artist?.trim() ? song.artist : label;
  return (
    <Pressable
      onPress={() => Linking.openURL(song.url)}
      style={{ marginTop: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: c.surface2, flexDirection: 'row', alignItems: 'center' }}>
      {song.artwork ? (
        <Image source={{ uri: song.artwork }} style={{ width: 66, height: 66, backgroundColor: c.surface }} resizeMode="cover" />
      ) : (
        <View style={{ width: 66, height: 66, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface }}>
          <Icon name="speaker" size={24} color={c.text2} strokeWidth={1.8} />
        </View>
      )}
      <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 8 }}>
        <T variant="body" numberOfLines={1} style={{ fontWeight: '700', fontSize: 15 }}>{song.title}</T>
        <T variant="body" color={c.text2} numberOfLines={1} style={{ fontSize: 13, marginTop: 2 }}>{sub}</T>
      </View>
      <View style={{ paddingRight: 13, paddingLeft: 6, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <T variant="body" color={c.accent} style={{ fontSize: 12.5, fontWeight: '700' }}>Open in {label}</T>
        <Icon name="send" size={13} color={c.accent} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
