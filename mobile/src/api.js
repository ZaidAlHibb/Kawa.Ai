import { Platform } from 'react-native';
import { API_URL } from './config';
import { relevantText } from './retrieval';

function friendly(e) {
  if (e && e.name === 'AbortError') return e;
  if (e && /Network request failed|Failed to fetch|Load failed|fetch/i.test(e.message || '')) {
    return new Error('Tidak bisa terhubung ke server. Pastikan server menyala dan alamatnya benar.');
  }
  return e;
}

async function post(path, body, timeout = 60000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(API_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Server ${res.status}`);
    return json;
  } catch (e) {
    throw friendly(e);
  } finally {
    clearTimeout(id);
  }
}

const profileOf = (s) => ({
  name: s.name, level: s.level, abk: s.abk, persona: s.persona,
});

function activeCurriculum(s, query = '') {
  const c = s.curricula.find((x) => x.id === s.activeCurriculumId);
  if (!c) return null;
  return { label: c.label, text: relevantText(c.text, query, 6000) };
}

export const styleKey = (s) => `${s.persona}|${s.abk}|${s.level}`;

const abkOfKey = (key) => {
  if (typeof key !== 'string') return null;
  const parts = key.split('|');
  if (parts.length < 3) return null;
  parts.pop();
  return parts.pop() || 'none';
};

export function chatApi(s, messages, opts = {}) {
  const cur = styleKey(s);
  const curAbk = s.abk || 'none';

  let dropped = false;
  let switchedFrom = null;
  const kept = [];
  for (const m of messages.slice(-12)) {
    if (m.role === 'assistant' && m.style !== cur) {
      dropped = true;
      const a = abkOfKey(m.style);
      if (a && a !== curAbk) switchedFrom = a;
      continue;
    }
    kept.push(m);
  }
  const history = [];
  for (const m of kept) {
    const last = history[history.length - 1];
    if (last && last.role === 'user' && m.role === 'user') {
      history[history.length - 1] = {
        ...last,
        content: `${last.content}\n\n${m.content}`,
        image: m.image || last.image,
        hadImage: !!(m.hadImage || last.hadImage),
      };
    } else {
      history.push(m);
    }
  }

  const lastIdx = history.length - 1;
  const payload = history.map((m, i) => {
    let content = m.content;
    if ((m.image || m.hadImage) && i !== lastIdx) content += ' [siswa melampirkan foto]';
    const out = { role: m.role, content };
    if (m.image && m.image.data && i === lastIdx) out.image = { mime: m.image.mime, data: m.image.data };
    return out;
  });
  return post('/api/chat', {
    profile: { ...profileOf(s), fresh: dropped, switchedFrom },
    messages: payload,
    mode: opts.mode,
    curriculum: activeCurriculum(s, messages.filter((m) => m.role === 'user').slice(-2).map((m) => m.content).join(' ')),
  }, 90000);
}

export const quizApi = (s, topic, useCurriculum, count = 5) =>
  post('/api/quiz', {
    profile: profileOf(s),
    topic,
    count,
    curriculum: useCurriculum ? activeCurriculum(s, topic) : null,
  });

export const checkPersona = (text) => post('/api/persona', { text }, 20000);

export async function uploadPdf(file) {
  const fd = new FormData();
  if (file.file) fd.append('file', file.file, file.name || 'materi.pdf');
  else fd.append('file', { uri: file.uri, name: file.name || 'materi.pdf', type: 'application/pdf' });
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), 120000);
  try {
    const res = await fetch(API_URL + '/api/upload', { method: 'POST', body: fd, signal: ctrl.signal });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || `Upload gagal (server ${res.status})`);
    return json;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Upload terlalu lama. Coba PDF yang lebih kecil.');
    throw friendly(e);
  } finally {
    clearTimeout(id);
  }
}

