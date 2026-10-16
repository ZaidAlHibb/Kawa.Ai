export async function canDownload() { return true; }

export async function downloadImage(dataUri, baseName = 'kawa') {
  if (!dataUri) return { ok: false, msg: 'Gambar belum siap diunduh.' };
  try {
    const blob = await (await fetch(dataUri)).blob();
    const ext = (blob.type || 'image/jpeg').includes('png') ? 'png' : 'jpg';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return { ok: true, msg: 'Gambar diunduh.' };
  } catch (e) {
    return { ok: false, msg: 'Gambar tidak bisa diunduh. Coba lagi.' };
  }
}
