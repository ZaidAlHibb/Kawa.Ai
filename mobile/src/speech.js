import * as Speech from 'expo-speech';

const RATE = { lambat: 0.8, normal: 1.0, cepat: 1.2 };
export const RATE_OPTIONS = [
  { value: 'lambat', label: 'Lambat' },
  { value: 'normal', label: 'Normal' },
  { value: 'cepat', label: 'Cepat' },
];

const EMOJI = /\p{Extended_Pictographic}/u;
let token = 0;

export function cleanForSpeech(t = '') {
  return t
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>~|]/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const voiceOpts = (s) => ({ abk: s.abk, rate: s.voiceRate, voice: s.voiceId, name: s.name });

export async function getIndonesianVoices() {
  try {
    const all = await Speech.getAvailableVoicesAsync();
    return all.filter((v) => /^(id|in)[-_]/i.test(v.language || ''));
  } catch (e) {
    return [];
  }
}

export function stopSpeaking() {
  token++;
  try { Speech.stop(); } catch (e) {}
}

export function speak(text, { abk = 'none', rate = 'normal', voice } = {}, onDone) {
  stopSpeaking();
  const my = token;
  const done = () => { if (my === token && onDone) onDone(); };
  const pre = String(text || '')
    .slice(0, 1500)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/(\p{Extended_Pictographic}+)\s*/gu, '$1. ');
  const parts = (pre.match(/(?:[^.!?\n]|\.(?=\d))+[.!?]*/g) || [])
    .map((raw) => ({ raw, clean: cleanForSpeech(raw).replace(/\s+([.!?])/g, '$1') }))
    .filter((p) => p.clean.length > 1);
  if (!parts.length) { done(); return; }

  const base = RATE[rate] || 1;
  const baseRate = abk === 'disleksia' || abk === 'autisme' ? base * 0.9 : base;
  parts.forEach((p, i) => {
    let pitch = 1;
    let r = baseRate;
    if (abk !== 'autisme') {
      if (/!/.test(p.raw) || EMOJI.test(p.raw)) { pitch = 1.15; r = baseRate * 1.05; }
      else if (/\?/.test(p.raw)) pitch = 1.08;
    }
    const last = i === parts.length - 1;
    Speech.speak(p.clean, {
      language: 'id-ID',
      voice: voice || undefined,
      rate: r,
      pitch,
      onDone: last ? done : undefined,
      onStopped: last ? done : undefined,
      onError: last ? done : undefined,
    });
  });
}
