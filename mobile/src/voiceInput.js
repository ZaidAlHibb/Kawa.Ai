let Mod = null;
try {
  // eslint-disable-next-line global-require
  Mod = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch (e) {
  Mod = null;
}

const explain = (code, message) => {
  switch (code) {
    case 'not-allowed': return 'Izin mikrofon ditolak, atau halaman ini tidak aman. Mikrofon di browser butuh alamat https atau localhost, dan izin mikrofon harus diizinkan.';
    case 'service-not-allowed': return 'Layanan pengenalan suara tidak diizinkan di perangkat ini.';
    case 'no-speech': return 'Tidak terdengar suara. Coba bicara lebih dekat ke mikrofon.';
    case 'audio-capture': return 'Mikrofon tidak terdeteksi.';
    case 'network': return 'Pengenalan suara butuh koneksi internet.';
    case 'language-not-supported': return 'Bahasa Indonesia belum didukung oleh layanan suara di perangkat ini.';
    case 'aborted': return '';
    default: return message || 'Mikrofon tidak bisa dipakai saat ini.';
  }
};

export const voiceInputAvailable = () => !!Mod;

export async function startListening({ onText, onEnd, onError }) {
  if (!Mod) {
    onError('Mikrofon belum tersedia di Expo Go. Gunakan versi website di Chrome atau APK, atau pakai ikon mikrofon pada keyboard HP.');
    onEnd();
    return () => {};
  }
  let ended = false;
  const subs = [];
  const finish = () => { if (ended) return; ended = true; subs.forEach((s) => s && s.remove && s.remove()); onEnd(); };
  try {
    const perm = await Mod.requestPermissionsAsync();
    if (!perm.granted) { onError(explain('not-allowed')); finish(); return () => {}; }
    subs.push(Mod.addListener('result', (ev) => onText((ev.results && ev.results[0] && ev.results[0].transcript) || '', !!ev.isFinal)));
    subs.push(Mod.addListener('error', (ev) => { const m = explain(ev.error, ev.message); if (m) onError(m); finish(); }));
    subs.push(Mod.addListener('end', finish));
    Mod.start({ lang: 'id-ID', interimResults: true, continuous: false });
  } catch (e) {
    onError(explain('', e.message));
    finish();
  }
  return () => { try { Mod.stop(); } catch (e) {} };
}
