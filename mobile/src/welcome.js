import { styleKey } from './api';

const lv = (s) => (s.level ? ` untuk jenjang ${s.level}` : '');

export function welcomeLines(s) {
  const n = s.name || 'teman';
  if (s.abk === 'autisme') {
    return [
      `Halo, ${n}. Nama saya Kawa. Saya tutor AI yang membantu kamu belajar${lv(s)}.`,
      'Kamu bisa melakukan tiga hal: mengetik pertanyaan, mengirim foto soal dengan tombol kamera, atau berbicara dengan tombol mikrofon.',
      ...(s.persona ? [`Gaya belajar yang kamu pilih: ${s.persona}. Gaya ini hanya mengubah nada bicara. Bahasa saya tetap literal.`] : []),
      'Langkah berikutnya: tulis pelajaran yang ingin kamu pelajari.',
    ];
  }
  if (s.abk === 'adhd') {
    return [
      `Hai ${n}! Aku Kawa, tutor belajarmu${lv(s)}.`,
      'Tanya, kirim foto soal, atau bicara. Aku jawab singkat.',
      'Mau mulai dari mana?',
    ];
  }
  if (s.level === 'SD') {
    return [
      `Hai ${n}! Aku Kawa, teman belajarmu. Aku akan membantu kamu belajar dengan cara yang asyik.`,
      'Kamu boleh bertanya, mengirim foto soal lewat tombol tambah foto, atau bicara lewat tombol mikrofon.',
      ...(s.persona ? [`Aku sudah memakai gaya belajar pilihanmu: ${s.persona}.`] : []),
      'Kamu mau belajar apa hari ini?',
    ];
  }
  if (s.level === 'SMA/SMK') {
    return [
      `Halo ${n}! Aku Kawa, tutor belajarmu untuk jenjang SMA/SMK.`,
      'Kamu bisa mengajukan pertanyaan materi, mengirim foto soal lewat tombol tambah foto, atau berdiskusi lewat tombol mikrofon.',
      ...(s.persona ? [`Gaya belajar yang kamu pilih sudah aktif: ${s.persona}.`] : []),
      'Topik atau soal apa yang ingin kita bahas?',
    ];
  }
  return [
    `Hai ${n}! Aku Kawa, teman belajarmu${lv(s)}.`,
    'Kamu bisa langsung bertanya, mengirim foto soal lewat tombol tambah foto, atau bicara lewat tombol mikrofon.',
    ...(s.persona ? [`Aku sudah memakai gaya belajar pilihanmu: ${s.persona}.`] : []),
    'Mau mulai dari mana hari ini?',
  ];
}

export function helloText(s) {
  const n = s.name || 'teman';
  if (s.abk === 'autisme') return `Halo, ${n}. Tulis pelajaran atau soal yang ingin kamu pelajari. Kamu juga bisa mengirim foto soal atau catatan.`;
  if (s.abk === 'adhd') return `Hai ${n}! Mau belajar apa? Tulis atau kirim foto soal.`;
  if (s.level === 'SD') return `Hai ${n}! Kamu mau belajar apa hari ini? Kamu juga boleh mengirim foto soal.`;
  if (s.level === 'SMA/SMK') return `Halo ${n}! Materi atau soal apa yang ingin dibahas? Kamu juga bisa mengirim foto soal atau catatan.`;
  return `Hai ${n}! Mau belajar apa hari ini? Kamu juga bisa mengirim foto soal atau catatan.`;
}

export function quickPrompts(level) {
  if (level === 'SD') return ['Ajari aku pelajaran hari ini', 'Bantu aku mengerjakan PR', 'Ajari aku cara belajar yang asyik'];
  if (level === 'SMA/SMK') return ['Jelaskan konsep materi hari ini', 'Bantu aku menganalisis soal latihan', 'Beri strategi belajar untuk ujian'];
  return ['Jelaskan materi hari ini', 'Bantu aku mengerjakan PR', 'Beri tips belajar'];
}

export function onboardingText(step, s) {
  const base = {
    name: 'Halo! Aku Kawa, teman belajarmu. Supaya aku bisa menyesuaikan diri denganmu, kenalan dulu ya. Siapa namamu?',
    level: `Senang bertemu denganmu, ${s.name}! Kamu sekolah di jenjang apa?`,
    abkAsk: 'Mau menyesuaikan tampilan agar lebih nyaman? Kamu bisa mencoba pilihan untuk membaca, fokus, atau suasana yang lebih tenang. Bisa diubah lagi di Profil.',
    abkType: 'Pilih salah satu. Tampilan akan langsung berubah supaya kamu bisa mencobanya.',
    persona: 'Terakhir. Kamu ingin belajar dengan cara seperti apa, atau ingin aku jadi karakter seperti apa?',
  };
  if (step === 'persona') {
    if (s.abk === 'autisme') return 'Pertanyaan terakhir. Pilih gaya bicara untuk AI. Contoh: santai atau sabar. Gaya ini hanya mengubah nada bicara. Bahasa AI tetap literal.';
    if (s.abk === 'adhd') return 'Terakhir. Pilih gaya belajar, misalnya santai. Jawaban AI tetap singkat.';
  }
  return base[step];
}

export function makeWelcomeRoom(s) {
  const now = Date.now();
  return {
    id: `r${now}`,
    title: 'Selamat datang',
    updatedAt: now,
    messages: [{ id: `${now}w`, role: 'assistant', content: welcomeLines(s).join('\n\n'), style: styleKey(s) }],
  };
}
