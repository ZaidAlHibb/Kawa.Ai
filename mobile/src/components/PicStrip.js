import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { T } from '../theme';
import { Lightbox } from './ImageView';

export default function PicStrip({ th, pics }) {
  const [open, setOpen] = useState(null);
  if (!pics || !pics.length) return null;
  return (
    <View style={{ marginTop: 10 }}>
      {pics.map((p, i) => (
        <View key={p.url + i} style={{ marginBottom: 10 }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => setOpen(p)} accessibilityRole="button" accessibilityLabel={`Perbesar gambar: ${p.title}`}>
            <Image source={{ uri: p.url }} accessibilityLabel={p.title} style={{ width: 240, height: 170, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: th.border }} resizeMode="contain" />
          </TouchableOpacity>
          <Text onPress={() => p.page && Linking.openURL(p.page)} style={T(th, { size: th.size - 4, color: th.sub, marginTop: 4, maxWidth: 240 })}>
             Sumber: {p.source} – {p.title}{p.page ? ' (ketuk untuk membuka)' : ''}
          </Text>
        </View>
      ))}
      {open && <Lightbox th={th} uri={open.url} onClose={() => setOpen(null)} caption={`${open.title} · Sumber: ${open.source}`} />}
    </View>
  );
}
