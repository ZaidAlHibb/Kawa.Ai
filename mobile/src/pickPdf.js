import * as DocumentPicker from 'expo-document-picker';

export async function pickPdf() {
  const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  if (r.canceled) return null;
  const f = r.assets[0];
  return { uri: f.uri, name: f.name || 'materi.pdf' };
}
