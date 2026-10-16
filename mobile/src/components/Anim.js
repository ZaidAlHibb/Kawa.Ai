import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
const ND = Platform.OS !== 'web';
export function Pop({ children, anim, style, delay = 0 }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    opacity.stopAnimation();
    if (!anim) { opacity.setValue(1); return; }
    opacity.setValue(0);
    const transition = Animated.timing(opacity, { toValue: 1, duration: 180, delay, useNativeDriver: ND });
    transition.start(); return () => transition.stop();
  }, [anim]);
  return <Animated.View style={[style, { opacity }]}>{children}</Animated.View>;
}
export function PressScale({ children, anim, onPress, disabled, style, ...props }) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (value) => Animated.timing(scale, { toValue: anim ? value : 1, duration: 120, useNativeDriver: ND }).start();
  useEffect(() => { scale.stopAnimation(); scale.setValue(1); }, [anim]);
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} {...props} disabled={disabled} onPress={onPress} onPressIn={() => to(0.985)} onPressOut={() => to(1)} style={style}>
    <Animated.View style={{ transform: [{ scale }], alignItems: 'stretch' }}>{children}</Animated.View>
  </Pressable>;
}
export function Bounce({ children, style }) { return <View style={style}>{children}</View>; }
export function Typewriter({ text, style }) { return <Text style={style}>{text}</Text>; }
export function TypingDots({ color, style }) { return <View accessibilityLiveRegion="polite" style={[{ padding: 14 }, style]}><Text style={{ color, fontSize: 14 }}>Kawa sedang menyiapkan jawaban…</Text></View>; }
export function Confetti() { return null; }
