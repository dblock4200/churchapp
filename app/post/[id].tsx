import React, { useState } from 'react';
import { View, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Screen, Card, Row, Stack, PersonLine } from '../../src/ui/primitives';
import { T } from '../../src/ui/Text';
import { Icon } from '../../src/ui/Icon';
import { useColors } from '../../src/theme/ThemeProvider';
import { usePost, usePhotoUrl } from '../../src/data/hooks';
import { SongCard } from '../../src/ui/SongCard';
import { AspectImage } from '../../src/ui/AspectImage';
import { useAuth } from '../../src/auth/AuthProvider';
import { repo } from '../../src/data/repo';

export default function PostDetail() {
  const c = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { member } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const pid = String(id);
  const { data: p, isLoading } = usePost(pid);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const refresh = () => { qc.invalidateQueries({ queryKey: ['post', pid] }); qc.invalidateQueries({ queryKey: ['presence'] }); };
  const mine = !!p && !!member?.id && (p as any).authorMemberId === member.id;

  async function send() {
    if (!member?.id || !reply.trim()) return;
    setBusy(true);
    const res = await repo.addReply(pid, member.id, reply);
    setBusy(false);
    if (!res.error) { setReply(''); refresh(); }
  }
  async function saveEdit() {
    const body = draft.trim(); if (!body) return;
    setEditing(false);
    qc.setQueryData(['post', pid], (old: any) => (old ? { ...old, text: body } : old)); // instant
    const res = await repo.editPost(pid, body);
    if (res?.error) { refresh(); return; }       // on failure, fall back to server truth
    qc.invalidateQueries({ queryKey: ['presence'] });
  }
  function confirmDelete() {
    Alert.alert('Delete this post?', 'It will be removed for everyone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        qc.setQueryData(['presence'], (old: any) => (Array.isArray(old) ? old.filter((x: any) => x.id !== pid) : old));
        router.back();
        await repo.deletePost(pid);
        qc.invalidateQueries({ queryKey: ['presence'] });
      } },
    ]);
  }

  return (
    <Screen scroll={true}>
      <Row style={{ height: 44 }}>
        <Pressable onPress={() => router.back()}>
          <Row gap={5}><Icon name="chevron-left" size={20} color={c.accent} strokeWidth={2.1} /><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Between</T></Row>
        </Pressable>
      </Row>

      {isLoading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}><ActivityIndicator color={c.accent} /></View>
      ) : p ? (
        <>
          <Card pad={16} style={{ marginTop: 4 }}>
            <PersonLine name={p.author} meta={`${(p as any).day} · ${p.when}`} />
            {editing ? (
              <>
                <View style={{ borderRadius: 14, backgroundColor: c.surface2, padding: 12, marginTop: 10 }}>
                  <TextInput value={draft} onChangeText={setDraft} multiline autoFocus style={{ color: c.text, fontSize: 17, lineHeight: 25, minHeight: 80, textAlignVertical: 'top' }} />
                </View>
                <Row gap={16} style={{ marginTop: 10, justifyContent: 'flex-end' }}>
                  <Pressable onPress={() => setEditing(false)}><T variant="body" color={c.text2} style={{ fontWeight: '700' }}>Cancel</T></Pressable>
                  <Pressable onPress={saveEdit}><T variant="body" color={c.accent} style={{ fontWeight: '700' }}>Save</T></Pressable>
                </Row>
              </>
            ) : (
              <T variant="body" style={{ fontSize: 17, lineHeight: 26, marginTop: 10 }}>{p.text}</T>
            )}
            {(p as any).photoPath ? <DetailPhoto path={(p as any).photoPath} /> : null}
            {(p as any).song ? <SongCard song={(p as any).song} /> : null}
            {mine && !editing ? (
              <Row gap={18} style={{ marginTop: 14 }}>
                <Pressable onPress={() => { setDraft(p.text); setEditing(true); }}><T variant="body" color={c.text2} style={{ fontSize: 14, fontWeight: '700' }}>Edit</T></Pressable>
                <Pressable onPress={confirmDelete}><T variant="body" color={c.clay} style={{ fontSize: 14, fontWeight: '700' }}>Delete</T></Pressable>
              </Row>
            ) : null}
          </Card>

          {p.replies.length > 0 ? (
            <Stack gap={18} style={{ marginTop: 18 }}>
              {p.replies.map(r => <ReplyRow key={r.id} pid={pid} r={r} mine={!!member?.id && (r as any).memberId === member.id} onChanged={refresh} />)}
            </Stack>
          ) : (
            <T variant="body" color={c.text2} style={{ marginTop: 20 }}>No replies yet. Be the first to say something.</T>
          )}

          <Row gap={10} style={{ marginTop: 20, marginBottom: 8 }}>
            <View style={{ flex: 1, minHeight: 50, borderRadius: 25, backgroundColor: c.surface2, justifyContent: 'center', paddingHorizontal: 20 }}>
              <TextInput value={reply} onChangeText={setReply} placeholder={`Say something to ${p.author}`} placeholderTextColor={c.text2} multiline style={{ color: c.text, fontSize: 16, paddingVertical: 14 }} />
            </View>
            <Pressable onPress={send} disabled={!reply.trim() || busy} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', opacity: reply.trim() && !busy ? 1 : 0.5 }}>
              <Icon name="send" size={22} color={c.onAccent} strokeWidth={1.8} />
            </Pressable>
          </Row>
        </>
      ) : (
        <T variant="body" color={c.text2} style={{ marginTop: 40, textAlign: 'center' }}>This post isn’t here anymore.</T>
      )}
    </Screen>
  );
}

function ReplyRow({ pid, r, mine, onChanged }: { pid: string; r: any; mine: boolean; onChanged: () => void }) {
  const c = useColors();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(r.text);
  async function save() {
    const body = draft.trim(); if (!body) return;
    setEditing(false);
    qc.setQueryData(['post', pid], (old: any) => (old ? { ...old, replies: old.replies.map((x: any) => (x.id === r.id ? { ...x, text: body } : x)) } : old));
    const res = await repo.editReply(r.id, body);
    if (res?.error) onChanged();
  }
  function confirmDelete() {
    Alert.alert('Delete this reply?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        qc.setQueryData(['post', pid], (old: any) => (old ? { ...old, replies: old.replies.filter((x: any) => x.id !== r.id) } : old));
        await repo.deleteReply(r.id);
      } },
    ]);
  }
  return (
    <View>
      <PersonLine name={r.author} meta={r.when} />
      {editing ? (
        <>
          <View style={{ borderRadius: 12, backgroundColor: c.surface2, padding: 10, marginTop: 7 }}>
            <TextInput value={draft} onChangeText={setDraft} multiline autoFocus style={{ color: c.text, fontSize: 16, lineHeight: 23, minHeight: 44, textAlignVertical: 'top' }} />
          </View>
          <Row gap={16} style={{ marginTop: 8, justifyContent: 'flex-end' }}>
            <Pressable onPress={() => setEditing(false)}><T variant="body" color={c.text2} style={{ fontWeight: '700', fontSize: 14 }}>Cancel</T></Pressable>
            <Pressable onPress={save}><T variant="body" color={c.accent} style={{ fontWeight: '700', fontSize: 14 }}>Save</T></Pressable>
          </Row>
        </>
      ) : (
        <T variant="body" style={{ marginTop: 7 }}>{r.text}</T>
      )}
      {mine && !editing ? (
        <Row gap={16} style={{ marginTop: 6 }}>
          <Pressable onPress={() => { setDraft(r.text); setEditing(true); }}><T variant="body" color={c.text2} style={{ fontSize: 13, fontWeight: '700' }}>Edit</T></Pressable>
          <Pressable onPress={confirmDelete}><T variant="body" color={c.clay} style={{ fontSize: 13, fontWeight: '700' }}>Delete</T></Pressable>
        </Row>
      ) : null}
    </View>
  );
}

function DetailPhoto({ path }: { path: string }) {
  const { data: url } = usePhotoUrl(path);
  return <AspectImage uri={url} />;
}
