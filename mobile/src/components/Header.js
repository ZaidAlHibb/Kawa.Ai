import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { T } from '../theme';
import Icon from './Icon';
export default function Header({ th, title, onHistory, onNew, right, sub }) {
  const control = { minHeight: 44, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: th.soft };
  return <View style={{ backgroundColor: th.card, borderBottomWidth: 1, borderColor: th.border, padding: 16, gap: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text accessibilityRole="header" numberOfLines={2} style={T(th, { fontWeight: '700', size: th.size + 3, flex: 1 })}>{title}</Text>
      {right}

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mulai baru" onPress={onNew} style={control}><Icon name="plus" size={18} color={th.primaryDark} /><Text style={T(th, { size: 14, color: th.primaryDark, fontWeight: '700' })}>Baru</Text></TouchableOpacity>
    </View>
    {!th.focus && !!sub && <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{sub}</View>}
  </View>;
}
