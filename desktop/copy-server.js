// Menyalin kode server + website ke folder desktop sebelum dijalankan/dibuild
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'server');
const dst = path.join(__dirname, 'server');
fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(dst, { recursive: true });
fs.copyFileSync(path.join(src, 'index.js'), path.join(dst, 'index.js'));
fs.copyFileSync(path.join(src, 'imagesearch.js'), path.join(dst, 'imagesearch.js'));
fs.cpSync(path.join(src, 'public'), path.join(dst, 'public'), { recursive: true });
console.log('Server + website disalin ke desktop/server');
