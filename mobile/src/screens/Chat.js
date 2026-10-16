import VoiceButton from '../components/VoiceButton';
import Icon from '../components/Icon';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Platform, ActivityIndicator, Modal, Pressable, Image, ScrollView } from 'react-native';
import { useStore } from '../store';
import { getTheme, T } from '../theme';
import { chatApi, styleKey } from '../api';
import { pickImage } from '../pickImage';
import { startListening } from '../voiceInput';
import StylePicker from '../components/StylePicker';
import { speak, stopSpeaking, voiceOpts } from '../speech';
import { Pop, PressScale, TypingDots, Bounce } from '../components/Anim';
import Header from '../components/Header';
import HistorySheet from '../components/HistorySheet';
import { MsgImage } from '../components/ImageView';
import { saveImage } from '../imageStore';
import Composer from '../components/Composer';
import RichText from '../components/RichText';
import PicStrip from '../components/PicStrip';
import { helloText, quickPrompts } from '../welcome';

const newId = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);
const makeTitle = (msg) => (msg.length > 32 ? msg.slice(0, 32) + '…' : msg);
const fmtDate = (t) => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const isFresh = (id) => Date.now() - Number(String(id).slice(0, 13)) < 4000;

export default function Chat({ sidebarRequest, onSidebarHandled }) {
  const { state, update } = useStore();
  const th = getTheme(state.abk, state.animPref, state.level);
  const [text, setText] = useState('');
  const [busyRoom, setBusyRoom] = useState(null);
  const [showList, setShowList] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [attachErr, setAttachErr] = useState('');
  const [styleOpen, setStyleOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const stopListenRef = useRef(null);
  const listRef = useRef(null);

  const activeCur = state.curricula.find((c) => c.id === state.activeCurriculumId);
  const room = state.rooms.find((r) => r.id === state.activeRoomId) || null;
  const started = !!room?.messages.some(m => m.role === 'user');
  const hasMsgs = !!(room && room.messages.length);
  const messages = hasMsgs ? room.messages : [{ id: 'hello', role: 'assistant', content: helloText(state) }];
  const busy = busyRoom !== null;
  const sorted = [...state.rooms].sort((a, b) => b.updatedAt - a.updatedAt);

  useEffect(() => {
    if (state.voiceOn && state.voiceAuto && room && room.messages.length === 1) {
      const m = room.messages[0];
      if (String(m.id).endsWith('w') && Date.now() - Number(String(m.id).slice(0, 13)) < 8000) {
        setSpeakingId(m.id);
        speak(m.content, voiceOpts(state), () => setSpeakingId(null));
      }
    }
  }, []);

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { if (!state.voiceOn) { stopSpeaking(); setSpeakingId(null); } }, [state.voiceOn]);

  function addAssistant(roomId, content, error, style, pics) {
    const id = newId();
    update((s) => ({
      rooms: s.rooms.map((r) =>
        r.id === roomId ? { ...r, messages: [...r.messages, { id, role: 'assistant', content, error, style, ...(pics && pics.length ? { pics } : {}) }].slice(-50), updatedAt: Date.now() } : r
      ),
    }));
    return id;
  }

  function toggleSpeak(item) {
    if (speakingId === item.id) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(item.id);
    speak(item.content, voiceOpts(state), () => setSpeakingId(null));
  }

  async function takePhoto(source) {
    setAttachErr('');
    try {
      const img = await pickImage(source);
      if (img) setAttachment(img);
    } catch (e) {
      setAttachErr(e.message || (source === 'camera' ? 'Kamera tidak bisa dibuka di perangkat ini.' : 'Galeri tidak bisa dibuka.'));
    }
  }

  async function toggleMic() {
    if (listening) { if (stopListenRef.current) stopListenRef.current(); return; }
    setAttachErr('');
    stopSpeaking(); setSpeakingId(null);
    const base = text.trim() ? text.trim() + ' ' : '';
    setListening(true);
    stopListenRef.current = await startListening({
      onText: (t) => setText(base + t),
      onEnd: () => { setListening(false); stopListenRef.current = null; },
      onError: (m) => setAttachErr(m),
    });
  }
  useEffect(() => () => { if (stopListenRef.current) stopListenRef.current(); }, []);

  async function send(content) {
    const typed = (content ?? text).trim();
    if ((!typed && !attachment) || busy) return;
    const msg = typed;
    setText(''); setAttachErr('');
    stopSpeaking(); setSpeakingId(null);
    const imageId = attachment ? newId() : null;
    if (attachment) saveImage(imageId, attachment, { src: 'chat', note: msg });
    const userMsg = { id: newId(), role: 'user', content: msg, ...(attachment ? { image: attachment, imageId, hadImage: true } : {}) };
    setAttachment(null);
    const roomId = room ? room.id : newId();
    const prev = (room ? room.messages : []).map((m) => (m.image ? { ...m, image: { uri: m.image.uri, mime: m.image.mime, w: m.image.w, h: m.image.h } } : m));
    const history = [...prev, userMsg].slice(-50);
    update((s) => {
      const old = s.rooms.find((r) => r.id === roomId);
      const updated = { id: roomId, title: old ? old.title : makeTitle(typed || 'Foto soal'), messages: history, updatedAt: Date.now() };
      return { rooms: old ? s.rooms.map((r) => (r.id === roomId ? updated : r)) : [updated, ...s.rooms], activeRoomId: roomId };
    });
    setBusyRoom(roomId);
    try {
      const { reply, images } = await chatApi(state, history.filter((m) => !m.error));
      const mid = addAssistant(roomId, reply, false, styleKey(state), images);
      if (state.voiceOn && state.voiceAuto) { setSpeakingId(mid); speak(reply, voiceOpts(state), () => setSpeakingId(null)); }
    } catch (e) {
      const detail = e.name === 'AbortError' ? 'Server terlalu lama menjawab.' : e.message;
      addAssistant(roomId, `Maaf, ada masalah: ${detail}\n\n(Lihat juga pesan di terminal server.)`, true);
    } finally {
      setBusyRoom(null);
    }
  }

  const openRoom = (id) => { stopSpeaking(); setSpeakingId(null); update({ activeRoomId: id }); setShowList(false); };
  const newRoom = () => { stopSpeaking(); setSpeakingId(null); update({ activeRoomId: null }); setShowList(false); };
  const renameRoom = (id, t) => update((s) => ({ rooms: s.rooms.map((r) => (r.id === id ? { ...r, title: t } : r)) }));
  const delRoom = (id) => update((s) => ({ rooms: s.rooms.filter((r) => r.id !== id), activeRoomId: s.activeRoomId === id ? null : s.activeRoomId }));

  useEffect(() => { if (sidebarRequest?.tab === 'chat') { sidebarRequest.id == null ? newRoom() : openRoom(sidebarRequest.id); onSidebarHandled?.(); } }, [sidebarRequest]);

  const pill = [T(th, { size: th.size - 2 }), { backgroundColor: th.card, borderWidth: 1, borderColor: th.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }];
  const personaShort = state.persona ? (state.persona.length > 24 ? state.persona.slice(0, 24) + '…' : state.persona) : 'Standar';
  const canSend = !busy && (text.trim() || attachment);

  return (
    <View style={{ flex: 1 }}>
      <Header th={th} title={room ? room.title : 'Obrolan baru'} onHistory={() => setShowList(true)} onNew={newRoom}
        right={<TouchableOpacity onPress={() => setStyleOpen(true)} accessibilityRole="button" accessibilityLabel="Atur gaya belajar" style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="settings" size={24} color={th.primary} /></TouchableOpacity>}
        sub={<>
          <Text onPress={() => setStyleOpen(true)} style={T(th, { size: th.size - 3, color: th.sub, marginRight: 12 })}> Gaya: {personaShort}</Text>
          {!!activeCur && <Text numberOfLines={1} style={T(th, { size: th.size - 3, color: th.sub })}> {activeCur.label} ({activeCur.name})</Text>}
        </>} />

      <FlatList
        ref={listRef}
        data={started ? messages : []}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 20, flexGrow: 1 }}
        ListHeaderComponent={!started ? <View style={{ paddingVertical: 28, maxWidth: 620, width: '100%', alignSelf: 'center' }}>
          <View style={{ width: 60, height: 60, backgroundColor: th.soft, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}><Icon name="spark" size={30} color={th.primary} /></View>
          <Text style={T(th, { size: 14, color: th.primaryDark, fontWeight: '700', marginBottom: 10 })}>RUANG BELAJARMU</Text>
          <Text accessibilityRole="header" style={T(th, { size: th.size + 15, lineHeight: (th.size + 15) * 1.35, fontWeight: '700', marginBottom: 16 })}>Halo, {state.name || 'teman'}.
Mau belajar apa hari ini?</Text>
          <Text style={T(th, { color: th.sub, marginBottom: 24 })}>Tulis pertanyaan atau kirim foto soal. Kita bahas satu langkah setiap kali.</Text>
          {!th.focus && <View style={{ gap: 10 }}>{quickPrompts(state.level).map((q, i) => <TouchableOpacity key={q} accessibilityRole="button" onPress={() => send(q)} disabled={busy} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, minHeight: 64, borderWidth: 1, borderColor: th.border, borderRadius: 16, backgroundColor: th.card }}><Icon name={['book','quiz','chat'][i]} color={th.primary} /><Text style={T(th, { flex: 1 })}>{q}</Text><Icon name="send" size={17} color={th.sub} /></TouchableOpacity>)}</View>}
        </View> : null}
        onContentSizeChange={() => { if (started) listRef.current?.scrollToEnd({ animated: th.anim }); }}
        renderItem={({ item }) => {
          const mine = item.role === 'user';
          return (
            <Pop anim={th.anim && isFresh(item.id)} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '94%', marginBottom: 10 }}>
              <View style={{ padding: mine ? 18 : 4, borderRadius: 18, backgroundColor: mine ? th.primary : 'transparent', borderWidth: 0, borderColor: th.border }}>
                {(!!item.image || !!item.imageId)
                  ? <MsgImage th={th} item={item} width={210} height={160} resizeMode="cover" />
                  : !!item.hadImage && <Text style={T(th, { size: th.size - 3, color: mine ? th.onPrimary : th.sub, marginBottom: 6 })}> Foto (tidak tersimpan)</Text>}
                {mine
                  ? (!!item.content && <Text selectable style={T(th, { color: th.onPrimary })}>{item.content}</Text>)
                  : <RichText th={th} text={item.content} />}
                {!mine && <PicStrip th={th} pics={item.pics} />}
                {!mine && !item.error && (
                  <VoiceButton th={th} playing={speakingId === item.id} onPress={() => toggleSpeak(item)} />
                )}
              </View>
            </Pop>
          );
        }}
        ListFooterComponent={busyRoom && busyRoom === (room && room.id)
          ? (th.anim
            ? <TypingDots color={th.sub} style={{ alignSelf: 'flex-start', backgroundColor: th.card, borderRadius: 16, borderWidth: 1, borderColor: th.border, marginTop: 4 }} />
            : <Text accessibilityLiveRegion="polite" style={T(th, { color: th.sub, padding: 12 })}>Kawa sedang menyiapkan jawaban…</Text>)
          : null}
      />

      <Composer
        th={th} value={text} onChange={setText} busy={busy} canSend={!!canSend} onSend={() => send()}
        placeholder={attachment ? 'Pertanyaan tentang foto (boleh kosong)' : 'Tanya apa saja soal belajar...'}
        onMic={toggleMic} listening={listening}
        onPickCamera={() => takePhoto('camera')} onPickGallery={() => takePhoto('gallery')}
        top={<>
          {listening && <Text style={T(th, { size: th.size - 2, color: th.danger, paddingBottom: 4, fontWeight: '700' })}> Mendengarkan... silakan bicara. Ketuk ⏹ untuk berhenti.</Text>}
          {!!attachErr && <Text style={T(th, { size: th.size - 2, color: th.danger, paddingBottom: 4 })}>{attachErr}</Text>}
          {!!attachment && (
            <Pop anim={th.anim} style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 8 }}>
              <Image source={{ uri: attachment.uri }} style={{ width: 64, height: 64, borderRadius: 10 }} />
              <TouchableOpacity onPress={() => setAttachment(null)} accessibilityRole="button" accessibilityLabel="Hapus foto" style={{ marginLeft: 12, padding: 10 }}>
                <Text style={T(th, { size: th.size - 2, color: th.danger, fontWeight: '700' })}> Hapus foto</Text>
              </TouchableOpacity>
            </Pop>
          )}
        </>}
      />

      <Modal transparent visible={styleOpen} animationType={th.anim ? 'slide' : 'none'} onRequestClose={() => setStyleOpen(false)}>
        <Pressable onPress={() => setStyleOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <Pressable style={{ backgroundColor: th.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '88%' }}>
            <Text style={T(th, { size: th.size + 3, fontWeight: '800', marginBottom: 6 })}>Gaya belajar</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <StylePicker th={th} state={state} update={update} onApplied={() => setStyleOpen(false)} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <HistorySheet th={th} visible={showList} onClose={() => setShowList(false)} heading="Riwayat obrolan" newLabel="＋ Obrolan baru"
        emptyText="Belum ada obrolan. Mulai dengan mengirim pesan."
        items={sorted.map((r) => ({ id: r.id, title: r.title, sub: `${r.messages.length} pesan · ${fmtDate(r.updatedAt)}` }))}
        activeId={state.activeRoomId} onOpen={openRoom} onNew={newRoom} onRename={renameRoom} onDelete={delRoom} />
    </View>
  );
}
