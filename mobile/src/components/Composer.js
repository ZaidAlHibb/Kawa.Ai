import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, Modal, Pressable } from 'react-native';
import Icon from './Icon';
import { T } from '../theme';
import { Bounce } from './Anim';

const fine = () => Platform.OS === 'web' && typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer:fine)').matches;

export default function Composer({ th, value, onChange, placeholder, onSend, canSend, busy, onMic, listening, onPickCamera, onPickGallery, top }) {
  const [menu, setMenu] = useState(false);
  const hasAttach = !!(onPickCamera || onPickGallery);
  const round = { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' };
  const bigBtn = { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: th.card, borderWidth: 1, borderColor: th.border, marginBottom: 10 };
  return (
    <View style={{ paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10, backgroundColor: th.bg }}>
      {top}
      <View style={{ backgroundColor: th.card, borderWidth: 1, borderColor: th.border, borderRadius: 20, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 6 }}>
        <TextInput
          value={value} onChangeText={onChange} multiline placeholder={placeholder} placeholderTextColor={th.sub}
          accessibilityLabel="Tulis pesan"
          onKeyPress={(e) => {
            const ne = e.nativeEvent || {};
            if (fine() && ne.key === 'Enter' && !ne.shiftKey) { e.preventDefault && e.preventDefault(); if (canSend) onSend(); }
          }}
          style={[T(th), { minHeight: 44, maxHeight: 140, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6, borderWidth: 0 }, Platform.OS === 'web' ? { outlineOffset: 2 } : null]}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {hasAttach
            ? <TouchableOpacity onPress={() => setMenu(true)} accessibilityRole="button" accessibilityLabel="Tambah foto" style={[round, { borderWidth: 1, borderColor: th.border }]}>
                <Icon name="plus" color={th.text} />
              </TouchableOpacity>
            : <View style={{ width: 44 }} />}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!!onMic && (
              <TouchableOpacity onPress={onMic} accessibilityRole="button" accessibilityLabel={listening ? 'Berhenti mendengarkan' : 'Bicara lewat mikrofon'} style={[round, { marginRight: 6, backgroundColor: listening ? th.danger : 'transparent' }]}>
                <Bounce anim={th.anim && listening} amplitude={3} duration={350}>
                  <Icon name={listening ? "stop" : "mic"} color={listening ? "#fff" : th.text} />
                </Bounce>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onSend} disabled={!canSend} accessibilityRole="button" accessibilityLabel="Kirim pesan" accessibilityState={{ disabled: !canSend, busy: !!busy }}
              style={[round, { backgroundColor: canSend ? th.primary : th.border }]}>
              <Icon name={busy ? "history" : "send"} color={canSend ? th.onPrimary : th.sub} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal transparent visible={menu} animationType={th.anim ? 'slide' : 'none'} onRequestClose={() => setMenu(false)}>
        <Pressable onPress={() => setMenu(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
          <Pressable style={{ backgroundColor: th.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
            <Text style={T(th, { size: th.size + 2, fontWeight: '800', marginBottom: 12 })}>Kirim foto</Text>
            {!!onPickCamera && (
              <TouchableOpacity onPress={() => { setMenu(false); onPickCamera(); }} style={bigBtn} accessibilityRole="button">
                <Icon name="camera" size={26} color={th.primary} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}><Text style={T(th, { fontWeight: '700' })}>Foto sekarang</Text><Text style={T(th, { size: th.size - 2, color: th.sub })}>Buka kamera</Text></View>
              </TouchableOpacity>
            )}
            {!!onPickGallery && (
              <TouchableOpacity onPress={() => { setMenu(false); onPickGallery(); }} style={bigBtn} accessibilityRole="button">
                <Icon name="image" size={26} color={th.primary} style={{ marginRight: 14 }} />
                <View style={{ flex: 1 }}><Text style={T(th, { fontWeight: '700' })}>Pilih dari galeri</Text><Text style={T(th, { size: th.size - 2, color: th.sub })}>Ambil foto yang sudah ada</Text></View>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setMenu(false)} style={{ padding: 14, alignItems: 'center' }}><Text style={T(th, { color: th.sub, fontWeight: '700' })}>Batal</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
