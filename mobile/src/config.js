import { Platform } from 'react-native';

export const API_URL = Platform.OS === 'web' ? '' : process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const LEVELS = ['SD', 'SMP', 'SMA/SMK'];

export const ABK_OPTIONS = [
  { value: 'none', label: 'Standar', desc: 'Tampilan standar' },
  { value: 'disleksia', label: 'Baca nyaman · Disleksia', desc: 'Huruf lebih lega, latar krem, teks besar' },
  { value: 'adhd', label: 'Lebih fokus · ADHD', desc: 'Kontras tinggi, tanpa animasi, jawaban singkat' },
  { value: 'autisme', label: 'Suasana tenang · Autisme', desc: 'Warna lembut, tanpa animasi, bahasa literal' },
];

export const CURRICULA = [
  'Kurikulum Merdeka',
  'Kurikulum 2013 (K13)',
  'Kurikulum Madrasah (KMA)',
  'Kurikulum Cambridge',
  'Lainnya',
];

export const PERSONA_PRESETS = [
  { label: 'Standar', value: '' },
  { label: 'Santai dan lucu', value: 'Santai dan lucu, pakai bahasa gaul yang sopan' },
  { label: 'Sabar dan banyak contoh', value: 'Sabar, jelaskan pelan-pelan dengan banyak contoh sehari-hari' },
  { label: 'Game master', value: 'Seperti game master: belajar adalah misi dan setiap jawaban benar adalah level up' },
  { label: 'Singkat dan jelas', value: 'Singkat, padat, dan langsung ke inti' },
  { label: 'Kakak mentor', value: 'Seperti kakak mentor yang hangat dan menyemangati' },
];

export const ANIM_OPTIONS = [
  { value: 'auto', label: 'Otomatis (ikut mode tampilan)' },
  { value: 'on', label: 'Transisi ringan' },
  { value: 'off', label: 'Mati' },
];
