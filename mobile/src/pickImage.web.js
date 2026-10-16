export function pickImage(source) {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    if (source === 'camera') input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    document.body.appendChild(input);
    let settled = false;
    const done = (fn, v) => { if (settled) return; settled = true; input.remove(); fn(v); };
    input.onchange = async () => {
      const f = input.files && input.files[0];
      if (!f) return done(resolve, null);
      try { done(resolve, await compress(f)); } catch (e) { done(reject, e); }
    };
    input.oncancel = () => done(resolve, null);
    input.click();
  });
}

async function compress(file) {
  const max = 1280;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error('File itu bukan gambar yang valid.'));
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.65);
    return { uri: dataUrl, mime: 'image/jpeg', data: dataUrl.split(',')[1] };
  } finally {
    URL.revokeObjectURL(url);
  }
}
