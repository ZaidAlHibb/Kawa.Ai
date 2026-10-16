import React from 'react';
import { Text } from 'react-native';
export default function Brand({ th, size = 28 }) {
  return <Text accessibilityLabel="Kawa" style={{ fontFamily: 'LexendDeca', fontSize: size, lineHeight: size * 1.4, color: th.text, letterSpacing: -0.5 }}>Kawa</Text>;
}
