import * as ImagePicker from 'expo-image-picker';

export async function pickImage(source) {
  const opts = { mediaTypes: ['images'], quality: 0.55, base64: true, exif: false };
  let r;
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Izin kamera ditolak. Aktifkan izin kamera untuk aplikasi ini di pengaturan perangkat.');
    r = await ImagePicker.launchCameraAsync(opts);
  } else {
    r = await ImagePicker.launchImageLibraryAsync(opts);
  }
  if (r.canceled) return null;
  const a = r.assets[0];
  if (!a.base64) throw new Error('Foto tidak bisa dibaca. Coba foto lain.');
  if (a.base64.length > 6000000) throw new Error('Foto terlalu besar. Coba ambil ulang atau pilih foto lain.');
  return { uri: a.uri, mime: a.mimeType || 'image/jpeg', data: a.base64 };
}
