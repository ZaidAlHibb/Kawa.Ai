// Dijalankan otomatis oleh `npm install` di folder server.
// Memasang dependensi aplikasi (mobile/) lalu membangun website ke server/public,
// sehingga cukup satu perintah (`npm install` di server) dan semua fitur tersedia.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const mobile = path.join(__dirname, '..', '..', 'mobile');
const skip =
  process.env.SKIP_WEB_BUILD || process.env.RENDER || process.env.CI ||
  !fs.existsSync(path.join(mobile, 'package.json'));

if (skip) {
  const has = fs.existsSync(path.join(__dirname, '..', 'public', 'index.html'));
  console.log(has ? '[web] Build website dilewati (memakai server/public yang sudah ada).' : '[web] PERINGATAN: build dilewati dan server/public belum ada, jadi halaman website belum bisa dibuka. Jalankan: npm run build:web');
  process.exit(0);
}

const env = { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' };
function run(args) {
  return spawnSync('npm', args, { cwd: mobile, stdio: 'inherit', shell: true, env }).status === 0;
}

console.log('[web] Memasang dependensi aplikasi (sekali saja, beberapa menit)...');
if (!run(['install', '--no-audit', '--no-fund'])) {
  console.warn('[web] GAGAL memasang dependensi aplikasi (cek internet dan Node.js 20+). Website belum diperbarui. Coba lagi: npm run build:web');
  process.exit(0);
}
console.log('[web] Membangun website...');
if (!run(['run', 'build:web'])) {
  console.warn('[web] GAGAL membangun website (lihat pesan error di atas). Website belum diperbarui. Coba lagi: npm run build:web');
  process.exit(0);
}
console.log('[web] Website siap. Jalankan: npm start');
