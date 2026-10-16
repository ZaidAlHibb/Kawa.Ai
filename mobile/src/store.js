import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pintar_state_v1';

const initial = {
  loaded: false,
  onboarded: false,
  name: '',
  level: '',
  abk: 'none',
  persona: '',
  drawRooms: [],
  activeDrawRoomId: null,
  quizzes: [],
  activeQuizId: null,
  rooms: [],
  activeRoomId: null,
  curricula: [],
  activeCurriculumId: null,
  canvasH: null,
  pixelMode: false,
  comfort: { fontChoice: 'auto', textSize: 'default', relaxedSpacing: false, focusMode: false },
  animPref: 'auto',
  voiceOn: false,
  voiceAuto: false,
  voiceRate: 'normal',
  voiceId: null,
};

const Ctx = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(initial);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
        .then((raw) => {
        const saved = raw ? JSON.parse(raw) : {};
        if (saved.chat && saved.chat.length && !saved.rooms) {
          const first = saved.chat.find((m) => m.role === 'user');
          saved.rooms = [{ id: 'lama', title: first ? first.content.slice(0, 32) : 'Obrolan lama', messages: saved.chat, updatedAt: Date.now() }];
          saved.activeRoomId = 'lama';
        }
        if (saved.drawMsgs && saved.drawMsgs.length && !saved.drawRooms) {
          const t = saved.drawMsgs.find((m) => m.role === 'user');
          saved.drawRooms = [{ id: 'gambar-lama', title: t ? String(t.content).slice(0, 32) : 'Gambar lama', messages: saved.drawMsgs, updatedAt: Date.now() }];
        }
        delete saved.drawMsgs;
        delete saved.chat;
        setState((s) => ({ ...s, ...saved, loaded: true }));
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  useEffect(() => {
    if (state.loaded) AsyncStorage.setItem(KEY, JSON.stringify(state, (k, v) => (k === 'image' ? undefined : v))).catch(() => {});
  }, [state]);

  const update = useCallback(
    (patch) => setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })),
    []
  );
  const reset = useCallback(() => setState({ ...initial, loaded: true }), []);

  return <Ctx.Provider value={{ state, update, reset }}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
