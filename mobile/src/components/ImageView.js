import React, { useEffect, useState } from 'react';
import { View, Text, Image, Modal, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
import { T } from '../theme';
import { loadImage, toDataUri } from '../imageStore';
import { downloadImage } from '../imageDownload';

export function Lightbox({ th, uri, dataUri, onClose, onDelete, caption }) {
  const { width, height } = useWindowDimensions();
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { setMsg(''); setConfirm(false); }, [uri]);
  if (!uri) return null;

  async function save() {
    const r = await downloadImage(dataUri || uri, 'kawa');
    setMsg(r.msg);
  }
  const btn = { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 14, marginHorizontal: 6 };
  return (
    <Modal transparent visible animationType={th.anim ? 'fade' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center', padding: 14 }}>
        <Pressable onPress={onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <Image source={{ uri }} style={{ width: Math.min(width - 28, 900), height: Math.round(height * 0.66), backgroundColor: '#fff', borderRadius: 12 }} resizeMode="contain" />
        {!!caption && <Text numberOfLines={2} style={T(th, { size: th.size - 2, color: '#fff', marginTop: 10, textAlign: 'center' })}>{caption}</Text>}
        {!!msg && <Text style={T(th, { size: th.size - 2, color: '#FFD93D', marginTop: 10, textAlign: 'center' })}>{msg}</Text>}
        <View style={{ flexDirection: 'row', marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
          <TouchableOpacity onPress={save} style={[btn, { backgroundColor: th.primary }]}>
            <Text style={T(th, { color: th.onPrimary, fontWeight: '700' })}>⬇ Unduh</Text>
          </TouchableOpacity>
          {!!onDelete && (confirm
            ? <TouchableOpacity onPress={onDelete} style={[btn, { backgroundColor: th.danger }]}><Text style={T(th, { color: '#fff', fontWeight: '700' })}>Ya, hapus</Text></TouchableOpacity>
            : <TouchableOpacity onPress={() => setConfirm(true)} style={[btn, { backgroundColor: '#fff' }]}><Text style={T(th, { color: th.danger, fontWeight: '700' })}> Hapus</Text></TouchableOpacity>)}
          <TouchableOpacity onPress={onClose} style={[btn, { backgroundColor: '#fff' }]}>
            <Text style={T(th, { color: '#17302A', fontWeight: '700' })}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function MsgImage({ th, item, width = 210, height = 160, resizeMode = 'cover' }) {
  const live = item.image && item.image.uri ? item.image.uri : null;
  const [stored, setStored] = useState(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dead = false;
    if (!live && item.imageId) loadImage(item.imageId).then((u) => { if (!dead) { setStored(u); setFailed(!u); } });
    return () => { dead = true; };
  }, [live, item.imageId]);

  const uri = live || stored;
  const base = { width, height, borderRadius: 12, marginBottom: 8, backgroundColor: '#fff' };
  if (!uri) {
    return (
      <View style={[base, { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: th.border }]}>
        <Text style={T(th, { size: th.size - 3, color: th.sub, textAlign: 'center', padding: 8 })}>{failed ? ' Gambar sudah tidak tersimpan' : 'Memuat gambar...'}</Text>
      </View>
    );
  }
  return (
    <>
      <TouchableOpacity activeOpacity={0.85} onPress={() => setOpen(true)} accessibilityLabel="Buka gambar">
        <Image source={{ uri }} style={base} resizeMode={resizeMode} />
        <Text style={T(th, { size: th.size - 4, color: th.sub, marginTop: -4, marginBottom: 6 })}> Ketuk untuk memperbesar / unduh</Text>
      </TouchableOpacity>
      {open && <Lightbox th={th} uri={uri} dataUri={toDataUri(item.image) || stored} onClose={() => setOpen(false)} />}
    </>
  );
}
