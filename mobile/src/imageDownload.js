export async function canDownload() { return false; }

export async function downloadImage() {
  return { ok: false, msg: 'Unduh gambar saat ini tersedia di versi website. Di aplikasi, gambar tetap tersimpan di Galeri.' };
}
