import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from './Icon';
export default function VoiceButton({ th, playing = false, onPress, label, icon, style }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label || (playing ? 'Berhenti membacakan' : 'Dengarkan jawaban')} accessibilityState={{ selected: playing }} onPress={onPress} style={[{ width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: playing ? th.soft : 'transparent' }, style]}><Icon name={icon || (playing ? 'stop' : 'volume')} color={th.primaryDark} size={24} /></TouchableOpacity>;
}
