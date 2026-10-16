import AsyncStorage from '@react-native-async-storage/async-storage';

const IDX = 'kawa_gallery_v1';
const key = (id) => `kawa_img_${id}`;
const MAX_ITEMS = 40;
const MAX_ONE = 1200000;
const MAX_TOTAL = 4200000;

const cache = new Map();
let chain = Promise.resolve();
const enqueue = (fn) => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };

export function toDataUri(img) {
  if (!img) return null;
  if (img.uri && String(img.uri).startsWith('data:')) return img.uri;
  if (img.data) return `data:${img.mime || 'image/jpeg'};base64,${img.data}`;
  return null;
}

async function readIndex() {
  try {
    const raw = await AsyncStorage.getItem(IDX);
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a : [];
  } catch (e) { return []; }
}

const total = (idx) => idx.reduce((s, x) => s + (x.size || 0), 0);

export function saveImage(id, img, meta = {}) {
  const du = toDataUri(img);
  if (!id || !du || du.length > MAX_ONE) return Promise.resolve(false);
  cache.set(id, du);
  return enqueue(async () => {
    const idx = (await readIndex()).filter((x) => x.id !== id);
    idx.unshift({ id, ts: Date.now(), w: img.w || 0, h: img.h || 0, size: du.length, src: meta.src || 'chat', note: String(meta.note || '').slice(0, 80) });
    const dropOldest = async () => {
      const old = idx.pop();
      if (old) { cache.delete(old.id); await AsyncStorage.removeItem(key(old.id)).catch(() => {}); }
    };
    while (idx.length > 1 && (idx.length > MAX_ITEMS || total(idx) > MAX_TOTAL)) await dropOldest();
    for (let tries = 0; tries < 12; tries++) {
      try {
        await AsyncStorage.setItem(key(id), du);
        await AsyncStorage.setItem(IDX, JSON.stringify(idx));
        return true;
      } catch (e) {
        if (idx.length <= 1) break;
        await dropOldest();
      }
    }
    return false;
  });
}

export async function loadImage(id) {
  if (!id) return null;
  if (cache.has(id)) return cache.get(id);
  try {
    const v = await AsyncStorage.getItem(key(id));
    if (v) cache.set(id, v);
    return v || null;
  } catch (e) { return null; }
}

export const listGallery = () => readIndex();

export function removeImage(id) {
  cache.delete(id);
  return enqueue(async () => {
    const idx = (await readIndex()).filter((x) => x.id !== id);
    await AsyncStorage.removeItem(key(id)).catch(() => {});
    await AsyncStorage.setItem(IDX, JSON.stringify(idx)).catch(() => {});
  });
}
