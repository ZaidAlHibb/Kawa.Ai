import React from 'react';
import { Text } from 'react-native';
import { T } from '../theme';

function inline(th, line, color, keyPrefix) {
  const bold = T(th, { fontWeight: '700' });
  const out = [];
  const re = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|`[^`\n]+`|\*[^*\s][^*\n]*?\*)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**') || tok.startsWith('__')) {
      out.push(<Text key={keyPrefix + k++} style={{ fontFamily: bold.fontFamily, fontWeight: bold.fontWeight, color }}>{tok.slice(2, -2)}</Text>);
    } else if (tok.startsWith('`')) {
      out.push(<Text key={keyPrefix + k++} style={{ fontFamily: th.font, backgroundColor: 'rgba(0,0,0,0.08)' }}>{tok.slice(1, -1)}</Text>);
    } else {
      out.push(<Text key={keyPrefix + k++} style={{ fontStyle: 'italic' }}>{tok.slice(1, -1)}</Text>);
    }
    last = m.index + tok.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export default function RichText({ th, text = '', color, style, selectable = true }) {
  const c = color || th.text;
  const lines = String(text).replace(/\r/g, '').split('\n');
  const bold = T(th, { fontWeight: '700' });
  return (
    <Text selectable={selectable} style={[T(th, { color: c }), style]}>
      {lines.map((raw, i) => {
        const nl = i < lines.length - 1 ? '\n' : '';
        const head = raw.match(/^\s{0,3}#{1,4}\s+(.*)$/);
        if (head) return <Text key={i} style={{ fontFamily: bold.fontFamily, fontWeight: bold.fontWeight }}>{inline(th, head[1], c, i + 'h')}{nl}</Text>;
        const li = raw.match(/^\s*(?:[-•]|\*(?=\s))\s+(.*)$/);
        if (li) return <Text key={i}>{'•  '}{inline(th, li[1], c, i + 'l')}{nl}</Text>;
        return <Text key={i}>{inline(th, raw, c, i + 'p')}{nl}</Text>;
      })}
    </Text>
  );
}
