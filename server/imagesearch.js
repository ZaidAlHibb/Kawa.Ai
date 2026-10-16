// Pencarian gambar pembelajaran dari banyak sumber asli (bukan buatan AI).
// Tanpa key: Wikimedia Commons, Openverse, NASA, Met Museum, Cleveland Museum of Art, Art Institute of Chicago.
// Opsional (isi key di .env): Pexels, Pixabay, Unsplash.
// Semua sumber dicari bersamaan. Kandidat dinilai kecocokannya dengan kueri, lalu dipilih dari sumber yang BERBEDA
// supaya hasilnya tidak melulu Wikipedia.
const UA = 'KawaAi/1.0 (edukasi; tutor AI inklusif)';

async function fetchJson(url, { ms = 6000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'user-agent': UA, ...headers } });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; } finally { clearTimeout(t); }
}

const STOP = new Set(['a', 'an', 'the', 'of', 'in', 'on', 'and', 'with', 'for', 'to', 'photo', 'picture', 'image']);
const stem = (w) => w.replace(/(ies)$/, 'y').replace(/(es|s)$/, '');
const toks = (t) => String(t || '').toLowerCase().replace(/<[^>]*>/g, ' ').normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);
function relevance(query, text) {
  const q = [...new Set(toks(query))];
  if (!q.length) return 0;
  const have = new Set(toks(text));
  return q.filter((w) => have.has(w)).length / q.length;
}
const okMime = (m) => !m || /^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(m);
const BAD_IMG = /(\.svg$|logo|icon|flag_of|wikimedia-logo|commons-logo)/i;
// Judul berisi kata ini dilewati agar tidak ada gambar yang tidak pantas untuk siswa
const BAD_CONTENT = /(nude|naked|nudity|nsfw|porn|erotic|\bsex|genital|topless|lingerie|fetish|gore|corpse|autopsy|execution|massacre|swastika|nazi)/i;
const strip = (h) => String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const enc = encodeURIComponent;

// ---------- Sumber tanpa key ----------
async function commons(q, { fj }) {
  const d = await fj(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${enc(q)}&gsrlimit=10&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=640&format=json&origin=*`);
  const pages = Object.values((d && d.query && d.query.pages) || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages.map((p) => {
    const ii = p.imageinfo && p.imageinfo[0];
    if (!ii || !ii.thumburl || !okMime(ii.mime)) return null;
    const m = ii.extmetadata || {};
    const title = (p.title || '').replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, '').replace(/_/g, ' ');
    const text = [title, m.ImageDescription && m.ImageDescription.value, m.Categories && m.Categories.value].join(' ');
    return { url: ii.thumburl, title, page: ii.descriptionurl, source: 'Wikimedia Commons', score: relevance(q, text) };
  }).filter(Boolean);
}

async function openverse(q, { fj }) {
  const d = await fj(`https://api.openverse.org/v1/images/?q=${enc(q)}&page_size=12&mature=false&category=photograph,illustration,digitized_artwork`);
  return ((d && d.results) || []).map((r) => {
    const url = r.thumbnail || r.url;
    if (!url) return null;
    const text = [r.title, (r.tags || []).map((t) => t.name).join(' ')].join(' ');
    return { url, title: r.title || q, page: r.foreign_landing_url, source: `Openverse${r.source ? ' / ' + r.source : ''}`, score: relevance(q, text) };
  }).filter(Boolean);
}

async function nasa(q, { fj }) {
  const d = await fj(`https://images-api.nasa.gov/search?q=${enc(q)}&media_type=image&page_size=10`);
  return (((d && d.collection && d.collection.items) || [])).map((it) => {
    const data = (it.data && it.data[0]) || {};
    const link = (it.links || []).find((l) => l.render === 'image' || l.rel === 'preview') || (it.links || [])[0];
    if (!link || !link.href || !data.nasa_id) return null;
    const text = [data.title, strip(data.description).slice(0, 300), (data.keywords || []).join(' ')].join(' ');
    return { url: link.href, title: strip(data.title) || q, page: `https://images.nasa.gov/details/${enc(data.nasa_id)}`, source: 'NASA', score: relevance(q, text) };
  }).filter(Boolean);
}

async function met(q, { fj }) {
  const s = await fj(`https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${enc(q)}`);
  const ids = ((s && s.objectIDs) || []).slice(0, 5);
  const objs = await Promise.all(ids.map((id) => fj(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)));
  return objs.map((o) => {
    if (!o || !o.primaryImageSmall || !o.isPublicDomain) return null;
    const text = [o.title, o.objectName, o.culture, o.period, (o.tags || []).map((t) => t.term).join(' ')].join(' ');
    return { url: o.primaryImageSmall, title: o.title || q, page: o.objectURL, source: 'The Met Museum', score: relevance(q, text) };
  }).filter(Boolean);
}

async function cleveland(q, { fj }) {
  const d = await fj(`https://openaccess-api.clevelandart.org/api/artworks/?q=${enc(q)}&has_image=1&cc0=1&limit=8`);
  return ((d && d.data) || []).map((a) => {
    const url = a.images && a.images.web && a.images.web.url;
    if (!url) return null;
    const text = [a.title, a.type, a.culture && a.culture.join(' '), a.technique].join(' ');
    return { url, title: a.title || q, page: a.url, source: 'Cleveland Museum of Art', score: relevance(q, text) };
  }).filter(Boolean);
}

async function artic(q, { fj }) {
  const d = await fj(`https://api.artic.edu/api/v1/artworks/search?q=${enc(q)}&limit=8&fields=id,title,image_id,is_public_domain,thumbnail`);
  const iiif = (d && d.config && d.config.iiif_url) || 'https://www.artic.edu/iiif/2';
  return ((d && d.data) || []).map((a) => {
    if (!a.image_id || !a.is_public_domain) return null;
    const text = [a.title, a.thumbnail && a.thumbnail.alt_text].join(' ');
    return { url: `${iiif}/${a.image_id}/full/600,/0/default.jpg`, title: a.title || q, page: `https://www.artic.edu/artworks/${a.id}`, source: 'Art Institute of Chicago', score: relevance(q, text) };
  }).filter(Boolean);
}

// ---------- Sumber opsional (butuh key gratis) ----------
async function pexels(q, { fj, keys }) {
  if (!keys.pexels) return [];
  const d = await fj(`https://api.pexels.com/v1/search?query=${enc(q)}&per_page=8&orientation=landscape`, { headers: { Authorization: keys.pexels } });
  return ((d && d.photos) || []).map((p) => ({ url: p.src && p.src.medium, title: p.alt || q, page: p.url, source: 'Pexels', score: relevance(q, p.alt) })).filter((c) => c.url);
}
async function pixabay(q, { fj, keys }) {
  if (!keys.pixabay) return [];
  const d = await fj(`https://pixabay.com/api/?key=${enc(keys.pixabay)}&q=${enc(q)}&image_type=photo&safesearch=true&per_page=8`);
  return ((d && d.hits) || []).map((h) => ({ url: h.webformatURL, title: h.tags || q, page: h.pageURL, source: 'Pixabay', score: relevance(q, h.tags) })).filter((c) => c.url);
}
async function unsplash(q, { fj, keys }) {
  if (!keys.unsplash) return [];
  const d = await fj(`https://api.unsplash.com/search/photos?query=${enc(q)}&per_page=8&content_filter=high`, { headers: { Authorization: `Client-ID ${keys.unsplash}` } });
  return ((d && d.results) || []).map((r) => {
    const t = r.alt_description || r.description || q;
    return { url: r.urls && r.urls.small, title: t, page: r.links && r.links.html, source: 'Unsplash', score: relevance(q, t) };
  }).filter((c) => c.url);
}

const SOURCES = [commons, openverse, nasa, met, cleveland, artic, pexels, pixabay, unsplash];
const family = (c) => (/wikimedia|wikipedia|commons/i.test(c.source) ? 'wikimedia' : String(c.source).split(' / ')[0].toLowerCase());

// Mencari gambar untuk satu kueri. Mengembalikan paling banyak `max` gambar dari sumber berbeda.
async function findImages(query, { fj = fetchJson, keys = {}, max = 2 } = {}) {
  const ctx = { fj, keys };
  const lists = await Promise.all(SOURCES.map((s) => s(query, ctx).catch(() => [])));
  const cands = lists.flat().filter((c) => c && /^https?:\/\//.test(c.url || '') && c.score >= 0.5 && !BAD_IMG.test(c.title) && !BAD_CONTENT.test(c.title));
  // satu kandidat terbaik per sumber; sumber selain Wikimedia sedikit didahulukan agar hasil beragam
  const rank = (c) => c.score + (family(c) === 'wikimedia' ? 0 : 0.15);
  const best = new Map();
  for (const c of cands.sort((a, b) => rank(b) - rank(a))) if (!best.has(family(c))) best.set(family(c), c);
  return [...best.values()].sort((a, b) => rank(b) - rank(a)).slice(0, max)
    .map((c) => ({ url: c.url, title: String(c.title).slice(0, 90), page: c.page, source: c.source }));
}

module.exports = { findImages, relevance, SOURCES };
