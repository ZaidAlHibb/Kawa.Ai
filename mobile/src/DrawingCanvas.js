import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import html from './drawingHtml';
import { canvasTheme, canvasThemeKey } from './canvasTheme';

const DrawingCanvas = forwardRef(function DrawingCanvas({ height = 260, th }, ref) {
  const web = useRef(null);
  const applyTheme = () => { if (th && web.current) web.current.injectJavaScript(`window.__cmd(${JSON.stringify({ cmd: 'theme', ...canvasTheme(th) })});true;`); };
  useEffect(applyTheme, [th && canvasThemeKey(th)]);
  const pending = useRef({});
  const counter = useRef(0);

  useImperativeHandle(ref, () => ({
    getImage: ({ max = 1024, q = 0.85 } = {}) => new Promise((resolve, reject) => {
      if (!web.current) { reject(new Error('Kanvas belum siap.')); return; }
      const id = ++counter.current;
      const t = setTimeout(() => { delete pending.current[id]; reject(new Error('Kanvas tidak merespons. Coba lagi.')); }, 10000);
      pending.current[id] = { resolve, t };
      web.current.injectJavaScript(`window.__cmd({cmd:'get',id:${id},max:${max},q:${q}});true;`);
    }),
    clear: () => { if (web.current) web.current.injectJavaScript("window.__cmd({cmd:'clear'});true;"); },
  }));

  const onMessage = (e) => {
    try {
      const m = JSON.parse(e.nativeEvent.data);
      const p = pending.current[m.id];
      if (m.type === 'image' && p) { clearTimeout(p.t); delete pending.current[m.id]; p.resolve(m); }
    } catch (err) {}
  };

  return (
    <View style={{ height, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: th ? th.border : '#CFE5DA', backgroundColor: th ? th.card : '#fff' }}>
      <WebView
        ref={web} originWhitelist={['*']} source={{ html }} onMessage={onMessage} onLoadEnd={applyTheme}
        javaScriptEnabled scrollEnabled={false} bounces={false} overScrollMode="never"
        showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} style={{ backgroundColor: '#fff' }}
      />
    </View>
  );
});

export default DrawingCanvas;
