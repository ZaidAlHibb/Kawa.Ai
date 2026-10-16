import React from 'react';
import { View } from 'react-native';

const PAL = {
  g: '#3DDC84', G: '#1E8E4F', r: '#F0524F', p: '#A56BFF', o: '#FF9F43', y: '#FFD93D',
  w: '#FFFFFF', k: '#14121F',
};

export const SPRITES = {
  slime: [
    '...gggg...', '..gggggg..', '.gwkggwkg.', '.gggggggg.', 'gggGGGGggg', 'gggggggggg', '.GGGGGGGG.',
  ],
  ghost: [
    'p........p', 'pp.pppp.pp', 'pppppppppp', 'ppwkppwkpp', '.pppppppp.', '..pwwwwp..', '...p..p...',
  ],
  demon: [
    'r........r', 'rr......rr', '.rrrrrrrr.', 'rrwkrrwkrr', 'rrrrrrrrrr', '.rrwwwwrr.', '..rrrrrr..',
  ],
  dragon: [
    '..oo..oo..', '.oooooooo.', 'oowkooowko', 'oooooooooo', 'oyyyyyyyyo', '.oyyyyyyo.', '..oooooo..',
  ],
};
export const SPRITE_ORDER = ['slime', 'ghost', 'demon', 'dragon'];

export default function PixelSprite({ name = 'slime', size = 14, flip }) {
  const rows = SPRITES[name] || SPRITES.slime;
  return (
    <View style={{ transform: [{ scaleX: flip ? -1 : 1 }] }}>
      {rows.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.split('').map((c, x) => (
            <View key={x} style={{ width: size, height: size, backgroundColor: PAL[c] || 'transparent' }} />
          ))}
        </View>
      ))}
    </View>
  );
}
