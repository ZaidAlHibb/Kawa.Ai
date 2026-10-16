import React from 'react';
import { Image } from 'react-native';
const icons = {
  menu: require('../../assets/icons/menu.png'),
  mute: require('../../assets/icons/mute.png'),
  chat: require('../../assets/icons/chat.png'),
  draw: require('../../assets/icons/draw.png'),
  quiz: require('../../assets/icons/quiz.png'),
  user: require('../../assets/icons/user.png'),
  plus: require('../../assets/icons/plus.png'),
  history: require('../../assets/icons/history.png'),
  settings: require('../../assets/icons/settings.png'),
  image: require('../../assets/icons/image.png'),
  mic: require('../../assets/icons/mic.png'),
  stop: require('../../assets/icons/stop.png'),
  send: require('../../assets/icons/send.png'),
  camera: require('../../assets/icons/camera.png'),
  check: require('../../assets/icons/check.png'),
  chevron: require('../../assets/icons/chevron.png'),
  spark: require('../../assets/icons/spark.png'),
  book: require('../../assets/icons/book.png'),
  volume: require('../../assets/icons/volume.png'),
  close: require('../../assets/icons/close.png'),
  award: require('../../assets/icons/award.png'),
  heart: require('../../assets/icons/heart.png'),
  erase: require('../../assets/icons/erase.png'),
  undo: require('../../assets/icons/undo.png'),
  trash: require('../../assets/icons/trash.png'),
};
export default function Icon({ name = 'spark', size = 22, color = '#176B60', style }) {
  return <Image accessible={false} accessibilityElementsHidden importantForAccessibility="no" source={icons[name] || icons.spark} style={[{ width: size, height: size, tintColor: color, resizeMode: 'contain' }, style]} />;
}
