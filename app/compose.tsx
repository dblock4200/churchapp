import React, { useState } from 'react';
import { View, Pressable, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Row, Button } from '../src/ui/primitives';
import { T } from '../src/ui/Text';
import { Icon } from '../src/ui/Icon';
import { useColors } from '../src/theme/ThemeProvider';
import { composePrompts } from '../src/data/mock';
import { useAuth } from '../src/auth/AuthProvider';
import { repo } from '../src/data/repo';
import * as ImagePicker from 'expo-image-picker';

export default function Compose() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const [prompt, setPrompt] = useState(composePrompts[2]);
  const [story, setStory] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState('');
  const [songOpen, setSongOpen] = useState(false);
  const songOk = /(?:open\.spotify\.com|spotify\.link|music\.apple\.com|(?:www\.|music\.)?youtube\.com|youtu\.be)/i.test(songUrl.trim());
  const songPlatformLabel = /spotify/i.test(songUrl) ? 'Spotify' : /apple/i.test(songUrl) ? 'Apple Music' : /youtu/i.test(songUrl) ? 'YouTube' : 'Song';

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled && res.assets?.[0]?.uri) setPhoto(res.assets[0].uri);
  }

  async function post() {
    if (!member?.group_id || !member?.id || !story.trim()) return;
    setBusy(true); setErr(null);
    const res = await repo.addPost(member.group_id, member.id, story, photo ?? undefined, songOk ? songUrl.trim() : undefined);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    qc.invalidateQueries({ queryKey: ['presence'] });
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: c.ground }}>
      <Row style={{ height: 52, paddingHorizontal: 20, justifyContent: 'space-between' }}>
        <Pressable onPress={() => router.back()}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
        <T variant="t3">Something you noticed</T>
        <View style={{ width: 52 }} />
      </Row>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
        <T variant="t1" style={{ fontSize: 25 }}>{prompt.text}</T>
        <Row gap={8} style={{ marginTop: 16, flexWrap: 'wrap' }}>
          {composePrompts.map(p => {
            const on = p.key === prompt.key;
            return (
              <Pressable key={p.key} onPress={() => setPrompt(p)} style={{ height: 34, borderRadius: 17,
                paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface2 }}>
                <T variant="body" color={on ? c.onAccent : c.text2} style={{ fontSize: 13, fontWeight: '700' }}>{p.label}</T>
              </Pressable>
            );
          })}
        </Row>

        <TextInput
          value={story} onChangeText={setStory} multiline autoFocus
          placeholder="Write it here…" placeholderTextColor={c.text2}
          style={{ flex: 1, marginTop: 18, color: c.text, fontSize: 18, lineHeight: 27, textAlignVertical: 'top' }}
        />

        {err ? <T variant="body" color={c.clay} style={{ marginBottom: 8 }}>{err}</T> : null}

        {photo ? (
          <View style={{ borderRadius: 20, overflow: 'hidden' }}>
            <Image source={{ uri: photo }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
            <Pressable onPress={() => setPhoto(null)} style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={18} color="#fff" strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={pickPhoto} style={{ borderRadius: 20, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
            <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="camera" size={20} color={c.text2} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <T variant="body" style={{ fontWeight: '600' }}>Add a photo</T>
              <T variant="body" color={c.text2} style={{ fontSize: 14 }}>Optional</T>
            </View>
          </Pressable>
        )}

        <View style={{ marginTop: 12 }}>
          {songOpen || songUrl ? (
            <View style={{ borderRadius: 20, backgroundColor: c.surface, padding: 14 }}>
              <Row gap={12} style={{ alignItems: 'center' }}>
                <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="speaker" size={20} color={c.text2} strokeWidth={1.8} />
                </View>
                <TextInput
                  value={songUrl} onChangeText={setSongUrl} autoCapitalize="none" autoCorrect={false}
                  placeholder="Paste a Spotify, Apple Music, or YouTube link" placeholderTextColor={c.text2}
                  style={{ flex: 1, color: c.text, fontSize: 15 }}
                />
                {songUrl ? (
                  <Pressable onPress={() => { setSongUrl(''); setSongOpen(false); }} hitSlop={8}>
                    <Icon name="close" size={18} color={c.text2} strokeWidth={2.2} />
                  </Pressable>
                ) : null}
              </Row>
              {songUrl && !songOk ? (
                <T variant="body" color={c.clay} style={{ fontSize: 13, marginTop: 8 }}>That doesn’t look like a Spotify, Apple Music, or YouTube link.</T>
              ) : songUrl && songOk ? (
                <T variant="body" color={c.text2} style={{ fontSize: 13, marginTop: 8 }}>{songPlatformLabel} link added — it’ll play right in the post.</T>
              ) : null}
            </View>
          ) : (
            <Pressable onPress={() => setSongOpen(true)} style={{ borderRadius: 20, backgroundColor: c.surface, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="speaker" size={20} color={c.text2} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <T variant="body" style={{ fontWeight: '600' }}>Add a song</T>
                <T variant="body" color={c.text2} style={{ fontSize: 14 }}>Optional · Spotify, Apple Music, or YouTube</T>
              </View>
            </Pressable>
          )}
        </View>

        <View style={{ marginTop: 14, opacity: story.trim() && !busy ? 1 : 0.5 }} pointerEvents={story.trim() && !busy ? 'auto' : 'none'}>
          <Button label={busy ? 'Posting…' : 'Post to Tuesday Night'} onPress={post} />
        </View>
        <T variant="body" color={c.text2} style={{ marginTop: 12, marginBottom: 8, textAlign: 'center' }}>Nine people. No one else.</T>
      </View>
    </SafeAreaView>
  );
}
