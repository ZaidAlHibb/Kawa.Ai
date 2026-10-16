import VoiceButton from '../components/VoiceButton';
import Icon from '../components/Icon';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Platform, ActivityIndicator, useWindowDimensions, PanResponder } from 'react-native';
import { useStore } from '../store';
import { getTheme, T } from '../theme';
import { chatApi, styleKey } from '../api';
import { speak, stopSpeaking, voiceOpts } from '../speech';
import { Pop, PressScale, TypingDots } from '../components/Anim';
import Header from '../components/Header';
import HistorySheet from '../components/HistorySheet';
import Gallery from '../components/Gallery';
import { MsgImage } from '../components/ImageView';
import { saveImage } from '../imageStore';
import DrawingCanvas from '../DrawingCanvas';
import Composer from '../components/Composer';
import RichText from '../components/RichText';
import PicStrip from '../components/PicStrip';
import { startListening } from '../voiceInput';

const newId = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);
const isFresh = (id) => Date.now() - Number(String(id).slice(0, 13)) < 4000;
const makeTitle = (msg) => (msg.length > 32 ? msg.slice(0, 32) + '…' : msg);
const fmtDate = (t) => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const IDEAS = ['Apa yang aku tulis?', 'Selesaikan soal ini', 'Ini gambar apa?', 'Periksa tulisanku'];

export default function Draw({ sidebarRequest, onSidebarHandled }) {
  const { state, update } = useStore();
  const th = getTheme(state.abk, state.animPref, state.level);
  const { height: screenH } = useWindowDimensions();
  const canvas = useRef(null);
  const listRef = useRef(null);
  const [note, setNote] = useState('');
  const [busyRoom, setBusyRoom] = useState(null);
  const [notice, setNotice] = useState('');
  const [speakingId, setSpeakingId] = useState(null);
  const [showList, setShowList] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [listening, setListening] = useState(false);
  const stopListenRef = useRef(null);
  const [dragH, setDragH] = useState(null);
  const startH = useRef(0);

  const rooms = state.drawRooms || [];
  const room = rooms.find((r) => r.id === state.activeDrawRoomId) || null;
  const msgs = room ? room.messages : [];
  const busy = busyRoom !== null;
  const sorted = [...rooms].sort((a, b) => b.updatedAt - a.updatedAt);
  const MIN_H = 240;
  const MAX_H = Math.max(320, Math.round(screenH * 0.66));
  const defaultH = Math.max(320, Math.min(420, Math.round(screenH * 0.46)));
  const clampH = (h) => Math.max(MIN_H, Math.min(MAX_H, Math.round(h)));
  const canvasH = clampH(dragH != null ? dragH : (state.canvasH || defaultH));
    const curH = useRef(canvasH); curH.current = canvasH;
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startH.current = curH.current; },
    onPanResponderMove: (_, g) => setDragH(startH.current - g.dy),
    onPanResponderRelease: (_, g) => { const h = startH.current - g.dy; setDragH(null); update({ canvasH: Math.max(MIN_H, Math.min(MAX_H, Math.round(h))) }); },
    onPanResponderTerminate: () => setDragH(null),
  })).current;
  const personaShort = state.persona ? (state.persona.length > 24 ? state.persona.slice(0, 24) + '…' : state.persona) : 'Standar';

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { if (!state.voiceOn) { stopSpeaking(); setSpeakingId(null); } }, [state.voiceOn]);

  const addAssistant = (roomId, content, error, pics) => {
    const id = newId();
    update((s) => ({
      drawRooms: (s.drawRooms || []).map((r) =>
        r.id === roomId ? { ...r, messages: [...r.messages, { id, role: 'assistant', content, error, style: styleKey(state), ...(pics && pics.length ? { pics } : {}) }].slice(-30), updatedAt: Date.now() } : r
      ),
    }));
    return id;
  };

  async function send() {
    if (busy) return;
    setNotice('');
    let img;
    try {
      img = await canvas.current.getImage({ max: 1024, q: 0.85 });
    } catch (e) {
      setNotice(e.message || 'Gambar belum bisa diambil. Coba lagi.');
      return;
    }
    if (!img || img.empty) { setNotice('Kanvasnya masih kosong. Tulis atau gambar sesuatu dulu, ya.'); return; }

    stopSpeaking(); setSpeakingId(null);
    const content = note.trim();
    const imageId = newId();
    saveImage(imageId, img, { src: 'draw', note: note.trim() });
    const userMsg = { id: newId(), role: 'user', content, image: { uri: img.uri, mime: img.mime, data: img.data, w: img.w, h: img.h }, imageId, hadImage: true };
    const roomId = room ? room.id : newId();
    const prev = msgs.map((m) => (m.image ? { ...m, image: { uri: m.image.uri, mime: m.image.mime, w: m.image.w, h: m.image.h } } : m));
    const history = [...prev, userMsg].slice(-30);
    update((s) => {
      const list = s.drawRooms || [];
      const old = list.find((r) => r.id === roomId);
      const updated = { id: roomId, title: old ? old.title : makeTitle(note.trim() || 'Gambar baru'), messages: history, updatedAt: Date.now() };
      return { drawRooms: old ? list.map((r) => (r.id === roomId ? updated : r)) : [updated, ...list], activeDrawRoomId: roomId };
    });
    setNote('');
    canvas.current.clear();
    setBusyRoom(roomId);
    try {
      const { reply, images } = await chatApi(state, history.filter((m) => !m.error), { mode: 'draw' });
      const mid = addAssistant(roomId, reply, false, images);
      if (state.voiceOn && state.voiceAuto) { setSpeakingId(mid); speak(reply, voiceOpts(state), () => setSpeakingId(null)); }
    } catch (e) {
      addAssistant(roomId, `Maaf, ada masalah: ${e.name === 'AbortError' ? 'Server terlalu lama menjawab.' : e.message}`, true);
    } finally {
      setBusyRoom(null);
    }
  }

  async function toggleMic() {
    if (listening) { if (stopListenRef.current) stopListenRef.current(); return; }
    setNotice(''); stopSpeaking(); setSpeakingId(null);
    const base = note.trim() ? note.trim() + ' ' : '';
    setListening(true);
    stopListenRef.current = await startListening({
      onText: (t) => setNote(base + t),
      onEnd: () => { setListening(false); stopListenRef.current = null; },
      onError: (m) => setNotice(m),
    });
  }
  useEffect(() => () => { if (stopListenRef.current) stopListenRef.current(); }, []);

  function toggleSpeak(item) {
    if (speakingId === item.id) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(item.id);
    speak(item.content, voiceOpts(state), () => setSpeakingId(null));
  }

  const openRoom = (id) => { stopSpeaking(); setSpeakingId(null); update({ activeDrawRoomId: id }); setShowList(false); };
  const newRoom = () => { stopSpeaking(); setSpeakingId(null); update({ activeDrawRoomId: null }); setShowList(false); };
  const renameRoom = (id, t) => update((s) => ({ drawRooms: (s.drawRooms || []).map((r) => (r.id === id ? { ...r, title: t } : r)) }));
  const delRoom = (id) => update((s) => ({ drawRooms: (s.drawRooms || []).filter((r) => r.id !== id), activeDrawRoomId: s.activeDrawRoomId === id ? null : s.activeDrawRoomId }));

  useEffect(() => { if (sidebarRequest?.tab === 'draw') { sidebarRequest.id == null ? newRoom() : openRoom(sidebarRequest.id); onSidebarHandled?.(); } }, [sidebarRequest]);

  const pill = [T(th, { size: th.size - 2 }), { backgroundColor: th.card, borderWidth: 1, borderColor: th.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8, overflow: 'hidden' }];

  return (
    <View style={{ flex: 1 }}>
      <Header th={th} title={room ? room.title : 'Gambar baru'} onHistory={() => setShowList(true)} onNew={newRoom}
        right={<TouchableOpacity onPress={() => setShowGallery(true)} accessibilityLabel="Galeri" accessibilityRole="button" style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="image" size={24} color={th.primary} /></TouchableOpacity>}
        sub={<Text style={T(th, { size: th.size - 3, color: th.sub })}> Gaya: {personaShort}</Text>} />

      <FlatList
        ref={listRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        onContentSizeChange={() => { if (msgs.length) listRef.current?.scrollToEnd({ animated: false }); }}
        ListEmptyComponent={
          <View style={{ padding: 16, borderRadius: 16, backgroundColor: th.card, borderWidth: 1, borderColor: th.border }}>
            <Text style={T(th, { fontWeight: '700', marginBottom: 6 })}>Tulis atau gambar, Kawa yang membaca</Text>
            <Text style={T(th, { size: th.size - 2, color: th.sub })}>
              Tulis atau gambar di kanvas, lalu tekan tombol kirim di bawah kanvas dan Kawa akan membantu menjelaskan.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const mine = item.role === 'user';
          const iw = 220;
          const ih = item.image && item.image.w ? Math.max(80, Math.min(240, Math.round((iw * item.image.h) / item.image.w))) : 150;
          return (
            <Pop anim={false} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%', marginBottom: 10 }}>
              <View style={{ padding: mine ? 12 : 4, borderRadius: 16, backgroundColor: mine ? th.primary : 'transparent', borderWidth: 0, borderColor: th.border }}>
                {(!!item.image || !!item.imageId)
                  ? <MsgImage th={th} item={item} width={iw} height={ih} resizeMode="contain" />
                  : !!item.hadImage && <Text style={T(th, { size: th.size - 3, color: mine ? th.onPrimary : th.sub, marginBottom: 6 })}> Gambar (tidak tersimpan)</Text>}
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
        ListFooterComponent={<>
          {busy && <Text accessibilityLiveRegion="polite" style={T(th, { padding: 12, color: th.sub })}>Kawa sedang membaca gambarmu…</Text>}
      <View style={{ borderTopWidth: 1, borderColor: th.border, backgroundColor: th.bg }}>
        <View style={{ paddingHorizontal: 10, paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {!th.focus && IDEAS.map((q) => <Text key={q} onPress={() => setNote(q)} style={pill}>{q}</Text>)}
          </View>
          <View {...pan.panHandlers} accessibilityLabel="Tarik ke atas untuk memperbesar kanvas, ke bawah untuk memperkecil" accessibilityRole="adjustable"
            style={[{ height: 28, alignItems: 'center', justifyContent: 'center' }, Platform.OS === 'web' ? { cursor: 'ns-resize', touchAction: 'none', userSelect: 'none' } : null]}>
            <View style={{ width: 56, height: 5, borderRadius: 3, backgroundColor: th.sub, opacity: 0.55 }} />
          </View>
          <DrawingCanvas ref={canvas} height={canvasH} th={th} />
        </View>
        <Composer
          th={th} value={note} onChange={setNote} busy={busy} canSend={!busy} onSend={send}
          placeholder="Pertanyaan tentang gambarmu (boleh kosong)"
          onMic={toggleMic} listening={listening}
          top={<>
            {listening && <Text style={T(th, { size: th.size - 2, color: th.danger, paddingBottom: 4, fontWeight: '700' })}> Mendengarkan... silakan bicara. Ketuk tombol berhenti untuk selesai.</Text>}
            {!!notice && <Text style={T(th, { size: th.size - 2, color: th.danger, paddingBottom: 6 })}>{notice}</Text>}
          </>}
        />
      </View>
        </>}

      />

      <HistorySheet th={th} visible={showList} onClose={() => setShowList(false)} heading="Riwayat gambar" newLabel="＋ Gambar baru"
        emptyText="Belum ada riwayat. Gambar sesuatu lalu tekan Kirim."
        items={sorted.map((r) => ({ id: r.id, title: r.title, sub: `${r.messages.length} pesan · ${fmtDate(r.updatedAt)}` }))}
        activeId={state.activeDrawRoomId} onOpen={openRoom} onNew={newRoom} onRename={renameRoom} onDelete={delRoom} />
      <Gallery th={th} visible={showGallery} onClose={() => setShowGallery(false)} />
    </View>
  );
}
