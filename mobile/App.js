import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, useWindowDimensions, AccessibilityInfo, Platform, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { useFonts } from 'expo-font';
import { getTheme, T, fontState, comfortState } from './src/theme';
import Icon from './src/components/Icon';
import Brand from './src/components/Brand';
import Sidebar from './src/components/Sidebar';
import Onboarding from './src/screens/Onboarding';
import Chat from './src/screens/Chat';
import Draw from './src/screens/Draw';
import Quiz from './src/screens/Quiz';
import Profile from './src/screens/Profile';

const TABS = [
  { key: 'chat', label: 'Chat AI', icon: 'chat', Screen: Chat },
  { key: 'draw', label: 'Gambar', icon: 'draw', Screen: Draw },
  { key: 'quiz', label: 'Kuis', icon: 'quiz', Screen: Quiz },
  { key: 'user', label: 'Profil', icon: 'user', Screen: Profile },
];

function Root() {
  const { state } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(v => { if (active) setReduceMotion(v); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  comfortState.prefs = state.comfort || {};
  comfortState.reduceMotion = reduceMotion;
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    document.documentElement.lang = 'id';
    document.title = 'Kawa — Ruang belajarmu';
    const css = document.createElement('style');
    css.textContent = ':focus-visible{outline:3px solid #176B60!important;outline-offset:3px!important} textarea:focus-visible,textarea:focus{outline:none!important} *{box-sizing:border-box}';
    document.head.appendChild(css);
    return () => css.remove();
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    LexendDeca: require('./assets/fonts/LexendDeca-SemiBold.ttf'),
    OpenDyslexic: require('./assets/fonts/OpenDyslexic-Regular.otf'),
    'OpenDyslexic-Bold': require('./assets/fonts/OpenDyslexic-Bold.otf'),
  });
  fontState.ok = fontsLoaded && !fontError;
  const th = getTheme(state.abk, state.animPref, state.level);
  const [tab, setTab] = useState('chat');
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarRequest, setSidebarRequest] = useState(null);
  const openHistory = (key, id) => { setTab(key); setSidebarRequest({ tab: key, id, token: Date.now() + Math.random() }); setMenuOpen(false); };
  useEffect(() => { if (state.onboarded) setTab('chat'); }, [state.onboarded]);

  if (!state.loaded || (!fontsLoaded && !fontError)) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }
  if (!state.onboarded) return <Onboarding />;

  const Active = TABS.find((t) => t.key === tab).Screen;
  const nav = <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, padding: 8, backgroundColor: th.card, borderTopWidth: 1, borderColor: th.border }}>
    {TABS.map(t => {
      const on = tab === t.key;
      return <TouchableOpacity key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} onPress={() => setTab(t.key)} style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10, borderRadius: 14, backgroundColor: on ? th.soft : 'transparent', borderWidth: 1, borderColor: on ? th.primary : 'transparent' }}>
        <Icon name={t.icon} size={22} color={on ? th.primaryDark : th.sub} />
        <Text style={T(th, { size: 14, fontWeight: on ? '700' : '400', color: on ? th.primaryDark : th.sub })}>{t.label}</Text>
      </TouchableOpacity>;
    })}
  </View>;
  const sidebar = <Sidebar th={th} tab={tab} onOpen={openHistory} onClose={wide ? null : () => setMenuOpen(false)} />;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg, flexDirection: 'row' }}>
      <StatusBar style="dark" />
      {wide && <View style={{ width: 280, borderRightWidth: 1, borderColor: th.border }}>{sidebar}</View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ paddingHorizontal: wide ? 28 : 12, minHeight: 64, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: th.border, gap: 12 }}>
          {!wide && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Buka riwayat" accessibilityState={{ expanded: menuOpen }} onPress={() => setMenuOpen(true)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="menu" color={th.primary} /></TouchableOpacity>}
          {wide ? <Text accessibilityRole="header" style={T(th, { fontWeight: '700' })}>{TABS.find(t => t.key === tab).label}</Text> : <Brand th={th} size={24} />}
        </View>
        <View style={{ flex: 1, width: '100%', maxWidth: tab === 'draw' ? 1100 : 920, alignSelf: 'center', minHeight: 0 }}><Active sidebarRequest={sidebarRequest} onSidebarHandled={() => setSidebarRequest(null)} /></View>
        {nav}
      </View>
      {!wide && <Modal visible={menuOpen} transparent animationType={th.anim ? 'fade' : 'none'} onRequestClose={() => setMenuOpen(false)}>
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(15,30,28,0.35)' }}>
          <SafeAreaView style={{ width: Math.min(320, width - 40), backgroundColor: th.card }}>{sidebar}</SafeAreaView>
          <Pressable accessibilityRole="button" accessibilityLabel="Tutup sidebar" onPress={() => setMenuOpen(false)} style={{ flex: 1 }} />
        </View>
      </Modal>}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
