import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import html from './drawingHtml';
import { canvasTheme, canvasThemeKey } from './canvasTheme';

const DrawingCanvas = forwardRef(function DrawingCanvas({ height = 260, th }, ref) {
  const frame = useRef(null);
  const applyTheme = () => { const w = frame.current && frame.current.contentWindow; if (th && w && w.__cmd) w.__cmd({ cmd: 'theme', ...canvasTheme(th) }); };
  useEffect(applyTheme, [th && canvasThemeKey(th)]);
  const win = () => (frame.current && frame.current.contentWindow && frame.current.contentWindow.__cmd ? frame.current.contentWindow : null);

  useImperativeHandle(ref, () => ({
    getImage: async ({ max = 1024, q = 0.85 } = {}) => {
      const w = win();
      if (!w) throw new Error('Kanvas belum siap. Tunggu sebentar lalu coba lagi.');
      return w.__cmd({ cmd: 'get', max, q });
    },
    clear: () => { const w = win(); if (w) w.__cmd({ cmd: 'clear' }); },
  }));

  return React.createElement('iframe', {
    ref: frame, srcDoc: html, onLoad: applyTheme, title: 'Kanvas gambar',
    style: { width: '100%', height, border: `2px solid ${th ? th.border : '#CFE5DA'}`, borderRadius: 12, backgroundColor: th ? th.card : '#fff', display: 'block' },
  });
});

export default DrawingCanvas;
