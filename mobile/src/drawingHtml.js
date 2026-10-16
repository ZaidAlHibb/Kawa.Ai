export default `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{--ff:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;--ls:0;--lh:normal;--card:#fff;--bar:#eef6f1;--border:#cfe5da;--text:#17302a;--sub:#58706a;--primary:#0e9f6e;--soft:#d9f5e6;--track:#e3efe9;--onp:#fff}
  *{box-sizing:border-box}
  button,input{font-family:inherit;letter-spacing:inherit}
  html,body{margin:0;height:100%;overflow:hidden;background:var(--card);font-family:var(--ff);letter-spacing:var(--ls);color:var(--text);
    -webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent}
  input{-webkit-user-select:text;user-select:text;font-family:inherit}
  body{display:flex;flex-direction:column}
  :root{--danger:#d6393f}
  #bar{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px;background:var(--bar);border-bottom:1px solid var(--border);flex:0 0 auto}
  @media (min-width:460px){#bar{grid-template-columns:repeat(6,1fr)}}
  .b{min-width:0;min-height:52px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text);cursor:pointer;padding:4px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:22px;line-height:1}
  .b>span:first-child{height:28px;display:flex;align-items:center;justify-content:center}
  .b i{font-style:normal;font-size:12px;font-weight:700;line-height:1.1;white-space:nowrap}
  .b.on{border-color:var(--primary);background:var(--soft)}
  .b.warn{border-color:var(--danger);background:var(--danger);color:#fff}
  .b:focus-visible,.tile:focus-visible,.lnk:focus-visible,.done:focus-visible,.chip:focus-visible,.sw:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}
  .cdot{display:inline-block;width:26px;height:26px;border-radius:50%;border:3px solid var(--card);box-shadow:0 0 0 2px var(--text);background:#111}
  .lnp{display:inline-block;width:34px;border-radius:6px;background:var(--text);height:6px}
  #wrap{flex:1 1 auto;position:relative;min-height:0}
  canvas#cv{position:absolute;left:0;top:0;touch-action:none;background:#fff;cursor:crosshair}
  #hint{position:absolute;left:0;right:0;top:36%;text-align:center;color:#6b8478;font-size:17px;pointer-events:none;padding:0 20px}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  #panel{display:none;position:fixed;left:0;right:0;top:0;bottom:0;background:var(--card);z-index:5;overflow-y:auto;padding:8px 10px 12px;-webkit-overflow-scrolling:touch}
  #panel.open{display:block}
  .ph{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px}
  .ph b{font-size:16px}
  .done{border:0;background:var(--primary);color:var(--onp);font-weight:700;border-radius:12px;min-height:44px;padding:8px 18px;font-size:15px;cursor:pointer}
  #prev{width:100%;height:48px;border:1px solid var(--border);border-radius:12px;background:#fff;display:block;margin-bottom:8px}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
  .tile{min-width:0;min-height:64px;border:1px solid var(--border);border-radius:12px;background:var(--card);color:var(--text);cursor:pointer;padding:6px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:12px;font-weight:700;line-height:1.1}
  .tile.on{border-color:var(--primary);background:var(--soft)}
  .tile .tdot{width:30px;height:30px;border-radius:50%;box-shadow:0 0 0 2px var(--border);display:block}
  .tile .tline{width:74%;border-radius:8px;background:var(--text);display:block}
  .tile .chk{visibility:hidden}.tile.on .chk{visibility:visible}
  .lnk{width:100%;min-height:44px;margin-top:8px;border:2px dashed var(--border);border-radius:12px;background:transparent;color:var(--text);font-size:14px;font-weight:700;cursor:pointer}
  .adv{display:none;margin-top:8px}.adv.open{display:block}
  .mode{font-size:12px;color:var(--sub);margin:6px 0 0}
  .sec{font-weight:700;font-size:14px;margin:10px 0 4px}
  .row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .row label{flex:0 0 22px;font-size:13px;color:var(--sub)}
  .row .val{flex:0 0 36px;text-align:right;font-size:13px;color:var(--sub)}
  input[type=range]{-webkit-appearance:none;appearance:none;flex:1 1 auto;height:18px;border-radius:9px;margin:0;outline:none;background:var(--track)}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;border-radius:50%;background:#fff;border:3px solid var(--primary);box-shadow:0 1px 3px rgba(0,0,0,.3)}
  input[type=range]::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid var(--primary)}
  input:focus-visible{outline:3px solid #1d4ed8;outline-offset:2px}
  .num{background:var(--card);color:var(--text);width:84px;height:44px;border:1px solid var(--border);border-radius:10px;padding:0 8px;font-size:16px;text-align:center}
  .hex{background:var(--card);color:var(--text);width:120px;height:44px;border:1px solid var(--border);border-radius:10px;padding:0 8px;font-size:16px;text-align:center;text-transform:uppercase}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
  .sw{flex:0 0 auto;width:40px;height:40px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px var(--border);cursor:pointer}
  .sw.on{box-shadow:0 0 0 3px var(--primary)}
</style><style id="ff"></style></head>
<body>
<div id="bar" role="toolbar" aria-label="Alat menggambar">
  <button class="b on" id="pen" aria-pressed="true" aria-label="Pena"><span><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m4 16 12-12a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3L8 20l-5 1 1-5Z M14 6l4 4 M4 16l4 4"/></svg></span><i>Pena</i></button>
  <button class="b" id="era" aria-pressed="false" aria-label="Penghapus"><span><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 9-9 8 8-9 10H8l-4-4a3 3 0 0 1 0-5Z M8 8l9 9 M12 21h9"/></svg></span><i>Hapus</i></button>
  <button class="b" id="bcol" aria-haspopup="dialog" aria-expanded="false" aria-label="Pilih warna"><span class="cdot" id="curdot"></span><i>Warna</i></button>
  <button class="b" id="bsz" aria-haspopup="dialog" aria-expanded="false" aria-label="Pilih tebal garis"><span class="lnp" id="curline"></span><i>Garis</i></button>
  <button class="b" id="undo" aria-label="Urungkan coretan terakhir"><span><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4v7h7 M3 11q9-12 17 0 5 10-12 9"/></svg></span><i>Urungkan</i></button>
  <button class="b" id="clr" aria-label="Hapus semua gambar"><span><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18 M8 6V3h8v3 M5 6l1 15h12l1-15 M10 10v7M14 10v7"/></svg></span><i>Bersihkan</i></button>
</div>
<div id="wrap">
  <canvas id="cv"></canvas><div id="hint">Tulis, hitung, atau gambar di sini dengan jari atau mouse. Lalu tekan tombol panah untuk mengirim.</div>
  <div class="sr" id="live" role="status" aria-live="polite"></div>
</div>
<div id="panel" role="dialog" aria-labelledby="ptitle">
  <div class="ph"><b id="ptitle"></b><button class="done" id="done">Selesai</button></div>
  <canvas id="prev" aria-hidden="true"></canvas>
  <div id="secColor">
    <div class="grid4" id="cg"></div>
    <button class="lnk" id="moreC" aria-expanded="false">Warna lainnya &#9662;</button>
    <div class="adv" id="advC">
      <div class="row"><label>H</label><input type="range" id="rh" min="0" max="360" step="1" aria-label="Corak warna"><span class="val" id="vh"></span></div>
      <div class="row"><label>S</label><input type="range" id="rs" min="0" max="100" step="1" aria-label="Kepekatan warna"><span class="val" id="vs"></span></div>
      <div class="row"><label>L</label><input type="range" id="rl" min="0" max="100" step="1" aria-label="Terang gelap warna"><span class="val" id="vl"></span></div>
      <div class="row"><label style="flex-basis:auto">Kode</label><input class="hex" id="hex" maxlength="7" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="#RRGGBB" aria-label="Kode warna hex"></div>
      <div class="chips" id="swp"></div>
    </div>
  </div>
  <div id="secSize">
    <div class="grid4" id="sg"></div>
    <button class="lnk" id="moreS" aria-expanded="false">Atur sendiri &#9662;</button>
    <div class="adv" id="advS">
      <div class="row"><input type="range" id="rz" min="1" max="100" step="1" aria-label="Tebal garis"><input class="num" id="num" type="number" inputmode="decimal" min="0.5" max="300" step="0.5" aria-label="Tebal garis dalam piksel"><span class="val" style="flex-basis:24px;text-align:left">px</span></div>
    </div>
  </div>
  <div class="mode" id="modeTxt"></div>
</div>
<script>
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('cv'), ctx = cv.getContext('2d'), wrap = $('wrap'), hint = $('hint');
  var dpr = window.devicePixelRatio || 1, strokes = [], cur = null, eraser = false;
  var pen = { color: '#111111', size: 4 }, era = { size: 30 };
  var MINS = 0.5, MAXS = 300;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { var c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return Math.round(255 * c); };
    return '#' + [f(0), f(8), f(4)].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }
  function hexToHsl(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0, d = mx - mn;
    if (d) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function normHex(v) {
    v = String(v || '').trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(v)) v = v.split('').map(function (c) { return c + c; }).join('');
    return /^[0-9a-fA-F]{6}$/.test(v) ? '#' + v.toLowerCase() : null;
  }

  function fit() {
    var w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    redraw();
  }
  function clearBg() { ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width / dpr, cv.height / dpr); }
  function drawStroke(s, c) {
    c = c || ctx;
    var p = s.pts; if (!p.length) return;
    c.strokeStyle = s.color; c.fillStyle = s.color; c.lineWidth = s.size; c.lineCap = 'round'; c.lineJoin = 'round';
    if (p.length === 1) { c.beginPath(); c.arc(p[0].x, p[0].y, s.size / 2, 0, Math.PI * 2); c.fill(); return; }
    c.beginPath(); c.moveTo(p[0].x, p[0].y);
    for (var i = 1; i < p.length - 1; i++) {
      var mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2;
      c.quadraticCurveTo(p[i].x, p[i].y, mx, my);
    }
    c.lineTo(p[p.length - 1].x, p[p.length - 1].y); c.stroke();
  }
  function redraw() { clearBg(); for (var i = 0; i < strokes.length; i++) drawStroke(strokes[i]); hint.style.display = strokes.length ? 'none' : 'block'; }
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  cv.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    cur = { color: eraser ? '#ffffff' : pen.color, size: eraser ? era.size : pen.size, eraser: eraser, pts: [pos(e)] };
    strokes.push(cur); hint.style.display = 'none'; redraw();
  });
  cv.addEventListener('pointermove', function (e) {
    if (!cur) return; e.preventDefault();
    cur.pts.push(pos(e)); redraw();
  });
  function end() { cur = null; }
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end); cv.addEventListener('pointerleave', end);

  var panel = $('panel'), prev = $('prev');
  var NAMED = [['Hitam', '#111111'], ['Biru', '#1d4ed8'], ['Merah', '#dc2626'], ['Hijau', '#15803d'], ['Oranye', '#f59e0b'], ['Ungu', '#9333ea'], ['Cokelat', '#7c2d12'], ['Pink', '#db2777']];
  var QN = ['Tipis', 'Sedang', 'Tebal', 'Sangat tebal'];
  var QS = { pen: [3, 6, 12, 24], era: [12, 30, 60, 120] };
  pen.size = 6;
  function colorName(hex) { for (var i = 0; i < NAMED.length; i++) if (NAMED[i][1] === hex) return NAMED[i][0]; return 'Warna sendiri'; }
  function curSize() { return eraser ? era.size : pen.size; }
  function say(t) { $('live').textContent = t; }
  function status() { return eraser ? 'Penghapus, tebal ' + curSize() : 'Pena, ' + colorName(pen.color) + ', tebal ' + curSize(); }
  function setTool(isEraser) {
    eraser = isEraser;
    $('pen').classList.toggle('on', !eraser); $('era').classList.toggle('on', eraser);
    $('pen').setAttribute('aria-pressed', String(!eraser)); $('era').setAttribute('aria-pressed', String(eraser));
    sync(); say(status());
  }
  function setColor(hex) { pen.color = hex; if (eraser) setTool(false); else { sync(); say(status()); } }
  function setSize(v) {
    v = parseFloat(v); if (!(v > 0)) return;
    v = clamp(Math.round(v * 2) / 2, MINS, MAXS);
    if (eraser) era.size = v; else pen.size = v;
    sync(); say(status());
  }

  function track(el, stops) { el.style.background = 'linear-gradient(to right,' + stops.join(',') + ')'; }
  function drawPreview() {
    var w = prev.clientWidth || 300, h = prev.clientHeight || 48, d = window.devicePixelRatio || 1;
    prev.width = Math.round(w * d); prev.height = Math.round(h * d);
    var c = prev.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0);
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    var s = { color: eraser ? '#c9d6d0' : pen.color, size: Math.min(curSize(), h - 6), pts: [] };
    for (var x = 24; x <= w - 24; x += 6) s.pts.push({ x: x, y: h / 2 + Math.sin(x / 26) * Math.min(10, (h - s.size) / 2 - 2) });
    drawStroke(s, c);
  }

  function mkColorTile(name, hex) {
    var b = document.createElement('button'); b.className = 'tile'; b.setAttribute('data-c', hex); b.setAttribute('aria-label', 'Warna ' + name);
    b.innerHTML = '<span class="tdot" style="background:' + hex + '"></span><span>' + name + '</span><span class="chk">&#10003;</span>';
    b.onclick = function () { setColor(hex); closePanel(); };
    $('cg').appendChild(b);
  }
  NAMED.forEach(function (n) { mkColorTile(n[0], n[1]); });
  var PAL = ['#000000', '#6b7280', '#ffffff', '#f97316', '#eab308', '#84cc16', '#0d9488', '#06b6d4', '#4f46e5', '#fb7185', '#a16207', '#0f172a'];
  PAL.forEach(function (c) {
    var s = document.createElement('button'); s.className = 'sw'; s.setAttribute('data-c', c); s.setAttribute('aria-label', 'Warna ' + c); s.style.background = c;
    if (c === '#ffffff') s.style.boxShadow = '0 0 0 2px #9bb3a9';
    s.onclick = function () { setColor(c); }; $('swp').appendChild(s);
  });
  var sizeTiles = [];
  function buildSizeTiles() {
    $('sg').innerHTML = ''; sizeTiles = [];
    QN.forEach(function (name, n) {
      var b = document.createElement('button'); b.className = 'tile'; b.setAttribute('aria-label', 'Garis ' + name.toLowerCase());
      b.innerHTML = '<span class="tline" data-n="' + n + '"></span><span>' + name + '</span><span class="chk">&#10003;</span>';
      b.onclick = function () { setSize(QS[eraser ? 'era' : 'pen'][n]); closePanel(); };
      $('sg').appendChild(b); sizeTiles.push(b);
    });
  }
  buildSizeTiles();

  function sync() {
    var sz = curSize(), hsl = hexToHsl(pen.color), qs = QS[eraser ? 'era' : 'pen'];
    $('curdot').style.background = pen.color;
    $('curline').style.height = Math.max(3, Math.min(16, sz)) + 'px';
    $('bcol').setAttribute('aria-label', 'Pilih warna, sekarang ' + colorName(pen.color));
    $('bsz').setAttribute('aria-label', 'Pilih tebal garis, sekarang ' + sz);
    $('modeTxt').textContent = eraser ? 'Mengatur penghapus. Memilih warna otomatis kembali ke pena.' : 'Mengatur pena: ' + colorName(pen.color) + ', tebal ' + sz + '.';
    var ct = document.querySelectorAll('#cg .tile');
    for (var i = 0; i < ct.length; i++) ct[i].classList.toggle('on', !eraser && ct[i].getAttribute('data-c') === pen.color);
    var pcs = document.querySelectorAll('#swp .sw');
    for (var k = 0; k < pcs.length; k++) pcs[k].classList.toggle('on', !eraser && pcs[k].getAttribute('data-c') === pen.color);
    sizeTiles.forEach(function (b, n) {
      b.classList.toggle('on', qs[n] === sz);
      b.querySelector('.tline').style.height = Math.max(3, Math.min(20, qs[n] * (eraser ? 0.25 : 1))) + 'px';
    });
    $('rh').value = hsl.h; $('rs').value = hsl.s; $('rl').value = hsl.l;
    $('vh').textContent = hsl.h; $('vs').textContent = hsl.s; $('vl').textContent = hsl.l;
    track($('rh'), ['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#f00']);
    track($('rs'), [hslToHex(hsl.h, 0, hsl.l), hslToHex(hsl.h, 100, hsl.l)]);
    track($('rl'), ['#000', hslToHex(hsl.h, hsl.s, 50), '#fff']);
    if (document.activeElement !== $('hex')) $('hex').value = pen.color.toUpperCase();
    $('rz').value = Math.min(100, sz);
    if (document.activeElement !== $('num')) $('num').value = sz;
    if (panel.classList.contains('open')) drawPreview();
  }

  var mode = null;
  function openPanel(which) {
    mode = which; panel.classList.add('open');
    $('secColor').style.display = which === 'color' ? 'block' : 'none';
    $('secSize').style.display = which === 'size' ? 'block' : 'none';
    $('ptitle').textContent = which === 'color' ? 'Pilih warna' : (eraser ? 'Pilih tebal penghapus' : 'Pilih tebal garis');
    $('bcol').setAttribute('aria-expanded', String(which === 'color')); $('bsz').setAttribute('aria-expanded', String(which === 'size'));
    sync(); drawPreview(); $('done').focus();
  }
  function closePanel() {
    var was = mode; mode = null; panel.classList.remove('open');
    $('bcol').setAttribute('aria-expanded', 'false'); $('bsz').setAttribute('aria-expanded', 'false');
    ['advC', 'advS'].forEach(function (id) { $(id).classList.remove('open'); });
    $('moreC').setAttribute('aria-expanded', 'false'); $('moreS').setAttribute('aria-expanded', 'false');
    if (was) { var t = $(was === 'color' ? 'bcol' : 'bsz'); try { t.focus(); } catch (e) {} }
  }
  function toggleAdv(btn, box) { var o = !box.classList.contains('open'); box.classList.toggle('open', o); btn.setAttribute('aria-expanded', String(o)); sync(); }
  $('bcol').onclick = function () { openPanel('color'); };
  $('bsz').onclick = function () { openPanel('size'); };
  $('moreC').onclick = function () { toggleAdv($('moreC'), $('advC')); };
  $('moreS').onclick = function () { toggleAdv($('moreS'), $('advS')); };
  $('done').onclick = closePanel;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mode) closePanel(); });

  $('pen').onclick = function () { setTool(false); };
  $('era').onclick = function () { setTool(true); };
  $('undo').onclick = function () { strokes.pop(); redraw(); say('Coretan terakhir diurungkan'); };
  var clrTimer = null;
  function clrReset() { clearTimeout(clrTimer); clrTimer = null; $('clr').classList.remove('warn'); $('clr').querySelector('i').textContent = 'Bersihkan'; $('clr').querySelector('span').innerHTML = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18 M8 6V3h8v3 M5 6l1 15h12l1-15 M10 10v7M14 10v7"/></svg>'; }
  $('clr').onclick = function () {
    if (!strokes.length) { say('Kanvas sudah kosong'); return; }
    if (clrTimer) { strokes = []; redraw(); clrReset(); say('Semua gambar dibersihkan'); return; }
    $('clr').classList.add('warn'); $('clr').querySelector('i').textContent = 'Yakin?'; $('clr').querySelector('span').innerHTML = '&#10071;';
    say('Tekan sekali lagi untuk membersihkan semua gambar');
    clrTimer = setTimeout(clrReset, 3500);
  };

  function onH() { setColor(hslToHex(+$('rh').value, +$('rs').value, +$('rl').value)); }
  $('rh').oninput = onH; $('rs').oninput = onH; $('rl').oninput = onH;
  $('hex').oninput = function () { var h = normHex(this.value); if (h) { pen.color = h; if (eraser) setTool(false); else { sync(); say(status()); } } };
  $('hex').onblur = function () { this.value = pen.color.toUpperCase(); };
  $('rz').oninput = function () { setSize(this.value); };
  $('num').oninput = function () { var v = parseFloat(this.value); if (v > 0) setSize(v); };
  $('num').onblur = function () { this.value = curSize(); };

  function exportImg(max, q) {
    max = max || 1024; q = q || 0.85;
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, any = false;
    for (var i = 0; i < strokes.length; i++) {
      var s = strokes[i]; if (s.eraser) continue;
      for (var k = 0; k < s.pts.length; k++) {
        var p = s.pts[k], r = s.size / 2;
        if (p.x - r < minX) minX = p.x - r; if (p.y - r < minY) minY = p.y - r;
        if (p.x + r > maxX) maxX = p.x + r; if (p.y + r > maxY) maxY = p.y + r; any = true;
      }
    }
    if (!any) return { empty: true };
    var pad = 24, W = cv.width / dpr, H = cv.height / dpr;
    minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W, maxX + pad); maxY = Math.min(H, maxY + pad);
    var w = Math.max(60, maxX - minX), h = Math.max(60, maxY - minY);
    var sc = Math.min(1, max / (Math.max(w, h) * dpr)) * dpr;
    sc = Math.max(sc, Math.min(320, max) / Math.max(w, h));
    var out = document.createElement('canvas'); out.width = Math.max(1, Math.round(w * sc)); out.height = Math.max(1, Math.round(h * sc));
    var x = out.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, out.width, out.height);
    x.drawImage(cv, minX * dpr, minY * dpr, w * dpr, h * dpr, 0, 0, out.width, out.height);
    var d = x.getImageData(0, 0, out.width, out.height).data, ink = 0;
    for (var t = 0; t < d.length; t += 16) { if (d[t] < 235 || d[t + 1] < 235 || d[t + 2] < 235) { ink++; if (ink > 12) break; } }
    if (ink <= 12) return { empty: true };
    var url = out.toDataURL('image/jpeg', q);
    return { empty: false, mime: 'image/jpeg', data: url.split(',')[1], uri: url, w: out.width, h: out.height };
  }

  function send(m) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(m));
  }
  window.__cmd = function (c) {
    if (c.cmd === 'get') { var r = exportImg(c.max, c.q); r.type = 'image'; r.id = c.id; send(r); return r; }
    if (c.cmd === 'clear') { strokes = []; redraw(); clrReset(); closePanel(); return true; }
    if (c.cmd === 'theme') {
      var r = document.documentElement.style;
      for (var k in c.vars) r.setProperty('--' + k, c.vars[k]);
      document.getElementById('ff').textContent = c.face || '';
      fit(); sync(); if (panel.classList.contains('open')) drawPreview();
      return true;
    }
    return null;
  };

  window.addEventListener('resize', function () { fit(); if (panel.classList.contains('open')) drawPreview(); });
  if (window.ResizeObserver) new ResizeObserver(fit).observe(wrap);
  fit(); sync();
})();
</script></body></html>`;
