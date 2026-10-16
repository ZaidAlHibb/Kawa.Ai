import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { T } from '../theme';
import { Btn } from './UI';
import { PERSONA_PRESETS } from '../config';
import { checkPersona } from '../api';

export default function StylePicker({ th, state, update, onApplied }) {
  const isPreset = PERSONA_PRESETS.some((p) => p.value === state.persona);
  const [custom, setCustom] = useState(state.persona && !isPreset ? state.persona : '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');

  const currentLabel = (PERSONA_PRESETS.find((p) => p.value === state.persona) || {}).label || state.persona || 'Standar';

  function apply(value, label) {
    update({ persona: value });
    setErr('');
    setNote(`Gaya diterapkan: ${label}. Berlaku mulai jawaban berikutnya.`);
    if (onApplied) onApplied();
  }

  async function applyCustom() {
    const v = custom.trim().slice(0, 150);
    if (!v) { apply('', 'Standar'); return; }
    setBusy(true); setErr('');
    try {
      const r = await checkPersona(v);
      if (!r.ok) { setErr(r.reason || 'Gaya ini tidak bisa dipakai. Coba yang lain.'); setBusy(false); return; }
    } catch (e) {}
    setBusy(false);
    apply(v, v.length > 30 ? v.slice(0, 30) + '…' : v);
  }

  const chip = (on) => [T(th, { size: th.size - 2, fontWeight: on ? '700' : '400' }), {
    backgroundColor: on ? th.primary : th.card, color: on ? th.onPrimary : th.text,
    borderWidth: 2, borderColor: on ? th.primaryDark : th.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8, overflow: 'hidden',
  }];
  const label = (t) => <Text style={T(th, { size: th.size - 1, fontWeight: '700', marginTop: 14, marginBottom: 6 })}>{t}</Text>;

  return (
    <View>
      <Text style={T(th, { size: th.size - 2, color: th.sub, marginBottom: 4 })}>
        Gaya belajar mengatur cara AI berbicara dan menjelaskan, misalnya santai, sabar dengan banyak contoh, atau seperti game master. Isi pelajaran dan aturan keamanan tidak berubah. Kamu bisa menggantinya kapan saja.
      </Text>
      <Text style={T(th, { size: th.size - 1, fontWeight: '700', color: th.primaryDark })}>Gaya aktif: {currentLabel}</Text>
      {state.abk !== 'none' && (
        <Text style={T(th, { size: th.size - 2, color: th.sub, marginTop: 6 })}>
          Mode tampilan {state.abk === 'adhd' ? 'ADHD' : state.abk === 'autisme' ? 'Autisme' : 'Disleksia'} sedang aktif dan diprioritaskan. Gaya belajar tetap dipakai, tetapi disesuaikan supaya jawaban tetap {state.abk === 'adhd' ? 'singkat dan langsung ke inti' : state.abk === 'autisme' ? 'literal dan jelas' : 'mudah dibaca'}.
        </Text>
      )}

      {label('Pilihan cepat')}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {PERSONA_PRESETS.map((p) => (
          <Text key={p.label} onPress={() => apply(p.value, p.label)} style={chip(state.persona === p.value)}>{p.label}</Text>
        ))}
      </View>

      {label('Atau tulis sendiri')}
      <TextInput value={custom} onChangeText={setCustom} multiline maxLength={150}
        placeholder="Contoh: jelaskan seperti kakak yang lucu, pakai contoh sepak bola" placeholderTextColor={th.sub}
        style={[T(th), { minHeight: 70, textAlignVertical: 'top', borderWidth: 2, borderColor: th.border, backgroundColor: th.card, borderRadius: 12, padding: 12, marginBottom: 10 }]} />
      {busy ? <ActivityIndicator color={th.primary} /> : <Btn th={th} title="Terapkan gaya ini" onPress={applyCustom} disabled={!custom.trim()} />}
      {!!err && <Text style={T(th, { color: th.danger, marginTop: 10 })}>{err}</Text>}
      {!!note && <Text style={T(th, { color: th.primaryDark, marginTop: 10 })}>{note}</Text>}
    </View>
  );
}
