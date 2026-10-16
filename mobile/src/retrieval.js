const STOP = new Set(['yang','dan','di','ke','dari','untuk','pada','dengan','ini','itu','apa','bagaimana','jelaskan','tentang','adalah','saya','aku','kamu','bisa','tolong','materi','the','ada','atau','kenapa','mengapa','buatkan','soal']);

const stem = (w) => w.slice(0, 6);
const words = (t) => (t.toLowerCase().match(/[a-z0-9\u00C0-\u024F]{3,}/g) || []).filter((w) => !STOP.has(w)).map(stem);

function chunkText(text) {
  const chunks = [];
  let cur = '';
  for (const p of text.split(/\n{2,}/)) {
    if (cur && (cur + p).length > 900) { chunks.push(cur); cur = ''; }
    cur += (cur ? '\n\n' : '') + p;
  }
  if (cur) chunks.push(cur);
  const flat = [];
  for (const c of chunks) {
    if (c.length <= 1400) flat.push(c);
    else for (let i = 0; i < c.length; i += 1000) flat.push(c.slice(i, i + 1000));
  }
  return flat;
}

export function relevantText(text, query, max = 6000) {
  const flat = chunkText(text);
  const q = new Set(words(query));
  const scored = flat.map((c, i) => {
    const w = words(c);
    let hit = 0;
    for (const x of w) if (q.has(x)) hit++;
    return { i, c, s: hit / Math.sqrt(w.length + 1) };
  });
  scored.sort((a, b) => b.s - a.s);
  const picked = [];
  let len = 0;
  for (const x of scored) {
    if (x.s <= 0) break;
    if (len + x.c.length > max) continue;
    picked.push(x); len += x.c.length;
  }
  if (!picked.length) return flat.slice(0, Math.ceil(max / 900)).join('\n\n').slice(0, max);
  picked.sort((a, b) => a.i - b.i);
  return picked.map((x) => x.c).join('\n\n---\n\n');
}
