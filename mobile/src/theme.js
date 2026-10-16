import { Platform } from 'react-native';

export const fontState = { ok: false };
export const comfortState = { prefs: {}, reduceMotion: false };

const base = {
  bg: '#F5F7F6', card: '#FFFFFF', text: '#203C37', sub: '#526A65', border: '#DCE5E1',
  primary: '#176B60', primaryDark: '#12564D', onPrimary: '#FFFFFF',
  accent: '#FFB020', danger: '#D6393F', good: '#176B60',
  font: Platform.OS === 'web' ? 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' : undefined, fontBold: undefined, letter: 0, line: 1.6, size: 16, anim: true,
};

const LEVEL_LOOK = {
  'SD': { bg: '#F3FBF3', border: '#BFE3C8', size: 18, line: 1.55 },
  'SMP': {},
  'SMA/SMK': { bg: '#F2F6F8', border: '#CBDAE2', size: 16, line: 1.65 },
};

export function getTheme(abk, animPref = 'auto', level = '') {
  let th;
  switch (abk) {
    case 'disleksia':
      th = {
        ...base, bg: '#FFF4D6', card: '#FFFBEF', text: '#2B2620', sub: '#5C5446', border: '#E8D49B',
        primary: '#2A6F9E', primaryDark: '#1D5379',
        font: fontState.ok ? 'OpenDyslexic' : Platform.select({ ios: 'Verdana', android: 'sans-serif', default: 'Verdana, Tahoma, sans-serif' }),
        fontBold: fontState.ok ? 'OpenDyslexic-Bold' : undefined,
        letter: fontState.ok ? 0.4 : 1.1, line: 1.8, size: fontState.ok ? 17 : 19,
      };
      break;
    case 'adhd':
      th = { ...base, bg: '#FFFFFF', card: '#F5F7FA', text: '#0B1220', sub: '#3D4A5C', border: '#C5CEDA',
        primary: '#1F4FD8', primaryDark: '#173BA3', line: 1.55, size: 17, anim: false };
      break;
    case 'autisme':
      th = { ...base, bg: '#EDF2F6', card: '#F8FAFC', text: '#243240', sub: '#566676', border: '#CBD6E0',
        primary: '#366681', primaryDark: '#2B536B', line: 1.6, size: 17, anim: false };
      break;
    default:
      th = { ...base, ...(LEVEL_LOOK[level] || {}) };
  }
  th.level = level;
  th.abk = abk || 'none';
  if (animPref === 'on') th.anim = true;
  if (animPref === 'off') th.anim = false;
  const prefs = comfortState.prefs;
  if (prefs.fontChoice === 'system') { th.font = base.font; th.fontBold = undefined; }
  if (prefs.fontChoice === 'dyslexic' && fontState.ok) { th.font = 'OpenDyslexic'; th.fontBold = 'OpenDyslexic-Bold'; }
  th.scale = prefs.textSize === 'large' ? 1.15 : 1;
  th.size *= th.scale;
  if (prefs.relaxedSpacing) { th.line = Math.max(th.line, 1.85); th.letter = Math.max(th.letter, 0.6); }
  th.focus = !!prefs.focusMode;
  if (th.focus || comfortState.reduceMotion) th.anim = false;
  th.soft = abk === 'disleksia' ? '#F4EACF' : abk === 'autisme' ? '#E4EDF3' : '#E8F2EE';
  return th;
}

export function T(th, o = {}) {
  const { size, ...rest } = o;
  const s = size ? Math.max(14, size) : th.size;
  const style = { color: th.text, fontFamily: th.font, letterSpacing: th.letter, fontSize: s, lineHeight: s * th.line, ...rest };
  const w = style.fontWeight;
  if (th.fontBold && (w === '700' || w === '800' || w === 'bold')) {
    style.fontFamily = th.fontBold;
    style.fontWeight = 'normal';
  }
  return style;
}
