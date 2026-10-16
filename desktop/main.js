const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

process.env.PORT = process.env.PORT || '3456';
// File .env: di samping .exe (setelah dibuild) atau server/.env (saat development)
const exeDir = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath('exe'));
process.env.ENV_FILE = app.isPackaged ? path.join(exeDir, '.env') : path.join(__dirname, '..', 'server', '.env');

app.whenReady().then(() => {
  if (!fs.existsSync(process.env.ENV_FILE)) {
    dialog.showErrorBox('File .env tidak ditemukan', `Buat file .env berisi AI_API_KEY di:\n${process.env.ENV_FILE}`);
  }
  require('./server/index.js'); // menjalankan server lokal (website + API)

  const win = new BrowserWindow({ width: 440, height: 860, autoHideMenuBar: true, title: 'Kawa.Ai' });
  const url = `http://localhost:${process.env.PORT}`;
  win.webContents.on('did-fail-load', () => setTimeout(() => win.loadURL(url), 500)); // tunggu server siap
  win.loadURL(url);
});

app.on('window-all-closed', () => app.quit());
