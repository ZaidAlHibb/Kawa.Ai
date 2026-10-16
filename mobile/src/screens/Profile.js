import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { pickPdf } from '../pickPdf';
import StylePicker from '../components/StylePicker';
import Gallery from '../components/Gallery';
import { useStore } from '../store';
import { getTheme, T } from '../theme';
import { Btn, Option, Dropdown } from '../components/UI';
import { ABK_OPTIONS, CURRICULA, ANIM_OPTIONS, LEVELS } from '../config';
import { uploadPdf } from '../api';
import { speak, stopSpeaking, voiceOpts, getIndonesianVoices, RATE_OPTIONS } from '../speech';

const switchColors = (th) => ({ trackColor: { false: '#D1D5DB', true: th.primary }, thumbColor: '#FFFFFF', activeThumbColor: '#FFFFFF', ios_backgroundColor: '#D1D5DB' });

export default function Profile() {
  const { state, update, reset } = useStore();
  const th = getTheme(state.abk, state.animPref, state.level);
  const [label, setLabel] = useState(CURRICULA[0]);
  const [uploading, setUploading] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.name);
  const [pdfMsg, setPdfMsg] = useState({ text: '', error: false });
  const [msg, setMsg] = useState('');
  const [voices, setVoices] = useState([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  useEffect(() => { getIndonesianVoices().then(setVoices); }, []);

  const comfort = state.comfort || {};
  const setComfort = (patch) => update({ comfort: { ...comfort, ...patch } });
  const H = ({ children }) => <Text style={T(th, { size: th.size + 2, fontWeight: '800', marginTop: 22, marginBottom: 10 })}>{children}</Text>;

  async function onPickPdf() {
    setPdfMsg({ text: '', error: false });
    setUploading(true);
    try {
      const f = await pickPdf();
      if (!f) { setUploading(false); return; }
      setPdfMsg({ text: `Mengunggah dan membaca ${f.name}...`, error: false });
      const out = await uploadPdf(f);
      const item = { id: String(Date.now()), label, name: f.name, text: out.text, pages: out.pages };
      update((s) => ({ curricula: [...s.curricula, item], activeCurriculumId: item.id }));
      setPdfMsg({ text: `Berhasil: ${f.name} (${out.pages} halaman) sekarang dipakai AI sebagai materi aktif.`, error: false });
    } catch (e) {
      setPdfMsg({ text: `Upload gagal: ${e.message || 'cek koneksi ke server.'}`, error: true });
    }
    setUploading(false);
  }

  function chooseAbk(o) {
    if (o.value === 'none') {
      update({ abk: 'none', animPref: 'auto' });
      setMsg('Mode Standar aktif. Tampilan dan bahasa AI kembali ke kondisi awal mulai jawaban berikutnya.');
    } else {
      update({ abk: o.value });
      setMsg(`Mode ${o.label} aktif. Tampilan berubah sekarang. Mode ini diprioritaskan di atas gaya belajar mulai jawaban berikutnya.`);
    }
  }

  function saveName() {
    const n = nameDraft.trim();
    if (!n) return;
    update({ name: n.slice(0, 30) });
    setMsg('Nama disimpan.');
  }

  const curOptions = [{ value: null, label: 'Tidak memakai materi' }, ...state.curricula.map((c) => ({ value: c.id, label: `${c.label}: ${c.name}` }))];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" style={T(th, { size: th.size + 12, fontWeight: '700', marginBottom: 6 })}>Ruang nyamanmu.</Text>
      <Text style={T(th, { color: th.sub, marginBottom: 24 })}>Atur cara membaca, fokus, dan belajar sesuai kebutuhanmu.</Text>
      <H>Tentang kamu</H>
      <Text style={T(th, { size: th.size - 2, color: th.sub, marginBottom: 6 })}>Nama</Text>
      <TextInput value={nameDraft} onChangeText={setNameDraft} maxLength={30} placeholder="Nama panggilanmu" placeholderTextColor={th.sub}
        style={[T(th), { borderWidth: 2, borderColor: th.border, backgroundColor: th.card, borderRadius: 12, padding: 12, marginBottom: 10 }]} />
      <Btn th={th} kind="ghost" title="Simpan nama" onPress={saveName} disabled={!nameDraft.trim() || nameDraft.trim() === state.name} style={{ marginBottom: 14 }} />
      <Text style={T(th, { size: th.size - 2, color: th.sub, marginBottom: 6 })}>Jenjang pendidikan</Text>
      {LEVELS.map((l) => (
        <Option key={l} th={th} label={l} selected={state.level === l} onPress={() => { update({ level: l }); setMsg(`Jenjang diubah ke ${l}. Jawaban dan rekomendasi AI menyesuaikan.`); }} />
      ))}

      <H>Tampilan</H>
      {ABK_OPTIONS.map((o) => (
        <Option key={o.value} th={th} label={o.label} desc={o.desc} selected={state.abk === o.value} onPress={() => chooseAbk(o)} />
      ))}
      <View style={{ marginTop: 14 }}>
        <Dropdown th={th} label="Animasi" value={state.animPref} options={ANIM_OPTIONS} onChange={(v) => update({ animPref: v })} />
      </View>

      <H>Kenyamanan pribadi</H>
      <Text style={T(th, { color: th.sub, marginBottom: 14 })}>Setiap orang punya preferensi berbeda. Pilih yang terasa nyaman; pilihan ini bisa digabung dengan mode di atas.</Text>
      <Dropdown th={th} label="Jenis huruf" value={comfort.fontChoice || 'auto'} options={[{ value: 'auto', label: 'Ikuti mode tampilan' }, { value: 'system', label: 'Huruf standar' }, { value: 'dyslexic', label: 'OpenDyslexic' }]} onChange={v => setComfort({ fontChoice: v })} />
      <Dropdown th={th} label="Ukuran teks" value={comfort.textSize || 'default'} options={[{ value: 'default', label: 'Standar' }, { value: 'large', label: 'Lebih besar' }]} onChange={v => setComfort({ textSize: v })} />
      {[{ key: 'relaxedSpacing', title: 'Jarak baca lebih lega', desc: 'Tambah jarak antarbaris dan huruf.' }, { key: 'focusMode', title: 'Mode fokus', desc: 'Sembunyikan saran tambahan dan nonaktifkan transisi.' }].map(o => <View key={o.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: th.card, padding: 16, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: th.border }}><View style={{ flex: 1 }}><Text style={T(th, { fontWeight: '700' })}>{o.title}</Text><Text style={T(th, { size: 14, color: th.sub })}>{o.desc}</Text></View><Switch accessibilityLabel={o.title} value={!!comfort[o.key]} onValueChange={v => setComfort({ [o.key]: v })} {...switchColors(th)} /></View>)}
      <View style={{ backgroundColor: th.soft, padding: 18, borderRadius: 16, marginTop: 8 }}><Text style={T(th, { fontWeight: '700', marginBottom: 6 })}>Pratinjau bacaan</Text><Text style={T(th)}>Belajar boleh pelan-pelan. Selesaikan satu langkah, lalu lanjutkan saat kamu siap.</Text></View>
      <H>Suara AI</H>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={T(th, { fontWeight: '700' })}>Aktifkan suara AI</Text>
          <Text style={T(th, { size: th.size - 2, color: th.sub })}>AI bisa membacakan jawaban dengan intonasi yang hidup. Bisa dimatikan kapan saja.</Text>
        </View>
        <Switch accessibilityLabel="Aktifkan suara AI" value={state.voiceOn} onValueChange={(v) => { if (!v) stopSpeaking(); update({ voiceOn: v }); }} {...switchColors(th)} />
      </View>
      {state.voiceOn && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={T(th, { flex: 1, paddingRight: 12 })}>Bacakan jawaban otomatis</Text>
            <Switch accessibilityLabel="Bacakan jawaban otomatis" value={state.voiceAuto} onValueChange={(v) => update({ voiceAuto: v })} {...switchColors(th)} />
          </View>
          <Dropdown th={th} label="Kecepatan bicara" value={state.voiceRate} options={RATE_OPTIONS} onChange={(v) => update({ voiceRate: v })} />
          <Dropdown th={th} label="Pilihan suara" value={state.voiceId} placeholder="Otomatis"
            options={[{ value: null, label: 'Otomatis (suara Indonesia)' }, ...voices.map((v) => ({ value: v.identifier, label: `${v.name || v.identifier} (${v.language})` }))]}
            onChange={(v) => update({ voiceId: v })} />
          <Btn th={th} kind="ghost" title="Tes suara" onPress={() => speak(`Halo ${state.name}! Aku Kawa, siap belajar bareng kamu. Yuk, kita mulai!`, voiceOpts(state))} />
          {voices.length === 0 && <Text style={T(th, { size: th.size - 3, color: th.sub, marginTop: 8 })}>Suara Indonesia belum terdeteksi. Di Android, pasang "Google Text-to-speech" dan unduh bahasa Indonesia. Di browser, gunakan Chrome.</Text>}
        </View>
      )}

      <H>Galeri foto dan gambar</H>
      <Text style={T(th, { size: th.size - 2, color: th.sub, marginBottom: 10 })}>Foto di Chat dan gambar dari tab Gambar yang kamu kirim tersimpan di sini. Ketuk gambar untuk memperbesar, mengunduh, atau menghapusnya.</Text>
      <Btn th={th} kind="ghost" title=" Buka galeri" onPress={() => setGalleryOpen(true)} />
      <Gallery th={th} visible={galleryOpen} onClose={() => setGalleryOpen(false)} />

      <H>Gaya belajar</H>
      <StylePicker th={th} state={state} update={update} />

      <H>Materi kurikulum</H>
      <Dropdown th={th} label="Jenis kurikulum file yang akan diupload" value={label} options={CURRICULA.map((c) => ({ value: c, label: c }))} onChange={setLabel} />
      {uploading ? <ActivityIndicator color={th.primary} style={{ margin: 10 }} /> : <Btn th={th} title="Pilih file PDF materi" onPress={onPickPdf} />}
      <Text style={T(th, { size: th.size - 3, color: th.sub, marginTop: 8 })}>Gunakan PDF yang teksnya bisa diseleksi (bukan hasil scan/foto). AI akan membaca bagian yang relevan dengan pertanyaanmu.</Text>
      {!!pdfMsg.text && <Text style={T(th, { color: pdfMsg.error ? th.danger : th.primaryDark, marginTop: 10, fontWeight: '700' })}>{pdfMsg.text}</Text>}
      {state.curricula.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <Dropdown th={th} label="Kurikulum yang dipakai AI" value={state.activeCurriculumId} options={curOptions} onChange={(v) => update({ activeCurriculumId: v })} />
          <Btn th={th} kind="ghost" title="Hapus materi yang dipilih" disabled={!state.activeCurriculumId}
            onPress={() => update((s) => ({ curricula: s.curricula.filter((c) => c.id !== s.activeCurriculumId), activeCurriculumId: null }))} />
        </View>
      )}
      {!!msg && <Text style={T(th, { color: th.sub, marginTop: 12 })}>{msg}</Text>}

      <H>Data</H>
      <Btn th={th} kind="ghost" title="Hapus semua data dan mulai ulang"
        onPress={() => {
          if (Platform.OS === 'web') { if (window.confirm('Semua data di perangkat ini akan dihapus. Lanjut?')) reset(); return; }
          Alert.alert('Mulai ulang?', 'Semua data di HP ini akan dihapus.', [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: reset }]);
        }} />
    </ScrollView>
  );
}