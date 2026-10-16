import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Modal, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { T } from '../theme';
import { listGallery, loadImage, removeImage } from '../imageStore';
import { Lightbox } from './ImageView';

const fmt = (t) => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

function Tile({ th, entry, size, onPress }) {
  const [uri, setUri] = useState(null);
  useEffect(() => { let dead = false; loadImage(entry.id).then((u) => { if (!dead) setUri(u); }); return () => { dead = true; }; }, [entry.id]);
  return (
    <TouchableOpacity onPress={() => uri && onPress(uri)} style={{ width: size, marginBottom: 10 }}>
      <View style={{ width: size, height: size, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: th.border }}>
        {uri ? <Image source={{ uri }} style={{ width: size, height: size }} resizeMode="cover" /> : null}
      </View>
      <Text numberOfLines={1} style={T(th, { size: th.size - 4, color: th.sub, marginTop: 3 })}>{entry.src === 'draw' ? 'Gambar ·' : 'Foto ·'} {fmt(entry.ts)}</Text>
    </TouchableOpacity>
  );
}

export default function Gallery({ th, visible, onClose }) {
  const { width } = useWindowDimensions();
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const refresh = useCallback(() => listGallery().then(setItems), []);
  useEffect(() => { if (visible) refresh(); }, [visible]);

  const pad = 16, gap = 10;
  const cols = width > 700 ? 4 : 3;
  const size = Math.floor((Math.min(width, 900) - pad * 2 - gap * (cols - 1)) / cols);

  return (
    <Modal visible={visible} animationType={th.anim ? 'slide' : 'none'} onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: th.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: th.border, backgroundColor: th.card }}>
          <Text style={[T(th, { fontWeight: '800' }), { flex: 1 }]}> Galeri foto dan gambar</Text>
          <Text onPress={onClose} style={T(th, { fontWeight: '700', color: th.primaryDark, padding: 6 })}>Tutup</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: pad }}>
          {items.length === 0 ? (
            <Text style={T(th, { color: th.sub, textAlign: 'center', padding: 24 })}>Belum ada gambar. Foto di Chat dan gambar dari tab Gambar yang kamu kirim akan tersimpan di sini.</Text>
          ) : (
            <>
              <Text style={T(th, { size: th.size - 3, color: th.sub, marginBottom: 12 })}>Disimpan di perangkat ini (maksimal 40 gambar terbaru, yang terlama dibuang otomatis).</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: gap }}>
                {items.map((e) => <Tile key={e.id} th={th} entry={e} size={size} onPress={(uri) => setSel({ entry: e, uri })} />)}
              </View>
            </>
          )}
        </ScrollView>
        {!!sel && (
          <Lightbox th={th} uri={sel.uri} dataUri={sel.uri} caption={sel.entry.note} onClose={() => setSel(null)}
            onDelete={async () => { await removeImage(sel.entry.id); setSel(null); refresh(); }} />
        )}
      </View>
    </Modal>
  );
}
