import { dyslexicCss } from './canvasFont';
import { fontState } from './theme';

export function canvasTheme(th) {
  const dys = th.font === 'OpenDyslexic';
  const ff = dys ? "'KawaDyslexic', Verdana, Tahoma, sans-serif" : (th.font || 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif');
  return {
    vars: {
      ff, ls: (th.letter || 0) + 'px', card: th.card, bar: th.bg, border: th.border, text: th.text, sub: th.sub,
      primary: th.primary, onp: th.onPrimary, soft: `color-mix(in srgb, ${th.primary} 18%, ${th.card})`, track: th.border,
    },
    face: dys ? dyslexicCss : '',
  };
}
export const canvasThemeKey = (th) => [th.font, th.card, th.bg, th.primary, th.text, fontState.ok].join('|');
