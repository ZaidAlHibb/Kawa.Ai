import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useStore } from '../store';
import { T } from '../theme';
import Icon from './Icon';
import Brand from './Brand';
const newLabels = { chat: 'Chat baru', draw: 'Gambar baru', quiz: 'Kuis baru' };
const collections = { chat: ['rooms', 'activeRoomId', 'Riwayat obrolan'], draw: ['drawRooms', 'activeDrawRoomId', 'Riwayat gambar'], quiz: ['quizzes', 'activeQuizId', 'Riwayat kuis'] };
export default function Sidebar({ th, tab, onOpen, onClose }) {
  const { state, update } = useStore();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [confirm, setConfirm] = useState(null);
  const category = tab === 'user' ? 'chat' : tab;
  const [collection, activeKey, heading] = collections[category];
  const items = [...(state[collection] || [])].sort((a,b) => b.updatedAt - a.updatedAt);
  const action = { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 };
  const save = id => { if (!draft.trim()) return; update(s => ({ [collection]: s[collection].map(r => r.id === id ? { ...r, title: draft.trim().slice(0,40) } : r) })); setEditing(null); };
  const remove = id => { update(s => ({ [collection]: s[collection].filter(r => r.id !== id), [activeKey]: s[activeKey] === id ? null : s[activeKey] })); setConfirm(null); if (state[activeKey] === id) onOpen(category, null); };
  return <View style={{ flex: 1, backgroundColor: th.card }}>
    <View style={{ padding: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }}><View style={{ backgroundColor: th.primary, padding: 9, borderRadius: 13 }}><Icon name="spark" color="#fff" size={24} /></View><Brand th={th} /><View style={{ flex: 1 }} />{onClose && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tutup menu" onPress={onClose} style={action}><Icon name="close" color={th.sub} /></TouchableOpacity>}</View>
    <ScrollView contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel={newLabels[category]} onPress={() => onOpen(category, null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: th.primary, padding: 12, borderRadius: 12, minHeight: 50, marginBottom: 22 }}><Icon name="plus" color="#fff" size={18} /><Text style={T(th, { size: 15, fontWeight: '700', color: '#fff' })}>{newLabels[category]}</Text></TouchableOpacity>
      <Text accessibilityRole="header" style={T(th, { size: 14, fontWeight: '700', color: th.sub, marginBottom: 10, paddingHorizontal: 4 })}>{heading}</Text>
      {!items.length && <Text style={T(th, { size: 14, color: th.sub, padding: 10 })}>Belum ada riwayat.</Text>}
      {items.map(item => <View key={item.id} style={{ borderRadius: 12, backgroundColor: state[activeKey] === item.id ? th.soft : 'transparent', padding: 8, marginBottom: 6 }}>
        {editing === item.id ? <View><TextInput autoFocus accessibilityLabel="Nama riwayat" maxLength={40} value={draft} onChangeText={setDraft} onSubmitEditing={() => save(item.id)} style={[T(th, { size: 14 }), { padding: 10, borderWidth: 1, borderColor: th.primary, borderRadius: 8, backgroundColor: th.card }]} /><View style={{ flexDirection: 'row' }}><TouchableOpacity accessibilityRole="button" onPress={() => save(item.id)} style={{ padding: 12 }}><Text style={T(th, { size: 14 })}>Simpan</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => setEditing(null)} style={{ padding: 12 }}><Text style={T(th, { size: 14 })}>Batal</Text></TouchableOpacity></View></View> : <TouchableOpacity accessibilityRole="button" accessibilityLabel={'Buka ' + item.title} accessibilityState={{ selected: state[activeKey] === item.id }} onPress={() => onOpen(category, item.id)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 }}><Text numberOfLines={2} style={T(th, { size: 14, fontWeight: state[activeKey] === item.id ? '700' : '400' })}>{item.title}</Text></TouchableOpacity>}
        {confirm === item.id ? <View><Text style={T(th, { size: 14 })}>Hapus riwayat ini?</Text><View style={{ flexDirection: 'row' }}><TouchableOpacity accessibilityRole="button" onPress={() => remove(item.id)} style={{ padding: 12 }}><Text style={T(th, { size: 14, color: th.danger })}>Ya, hapus</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => setConfirm(null)} style={{ padding: 12 }}><Text style={T(th, { size: 14 })}>Batal</Text></TouchableOpacity></View></View> : <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Ubah nama ' + item.title} onPress={() => { setEditing(item.id); setDraft(item.title); }} style={action}><Icon name="draw" size={16} color={th.sub} /></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={'Hapus ' + item.title} onPress={() => setConfirm(item.id)} style={action}><Icon name="trash" size={16} color={th.sub} /></TouchableOpacity></View>}
      </View>)}
    </ScrollView>
  </View>;
}
