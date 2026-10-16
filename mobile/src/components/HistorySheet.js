import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import { T } from '../theme';

export default function HistorySheet({ th, visible, onClose, heading, newLabel, emptyText, items, activeId, onOpen, onNew, onRename, onDelete }) {
  const [renaming, setRenaming] = useState(null);
  const [renameText, setRenameText] = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  const saveRename = () => {
    const t = renameText.trim();
    if (t) onRename(renaming, t.slice(0, 40));
    setRenaming(null);
  };
  const close = () => { setRenaming(null); setConfirmDel(null); onClose(); };

  return (
    <Modal transparent visible={visible} animationType={th.anim ? 'slide' : 'none'} onRequestClose={close}>
      <Pressable onPress={close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={{ backgroundColor: th.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 16 }}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Tutup riwayat" onPress={close} style={{ alignSelf: 'flex-end', minHeight: 44, padding: 10 }}><Text style={T(th, { color: th.primaryDark })}>Tutup</Text></TouchableOpacity>
          <Text style={T(th, { size: th.size + 3, fontWeight: '800', marginBottom: 10 })}>{heading}</Text>
          <TouchableOpacity onPress={onNew} style={{ padding: 14, borderRadius: 14, backgroundColor: th.primary, alignItems: 'center', marginBottom: 12 }}>
            <Text style={T(th, { color: th.onPrimary, fontWeight: '700' })}>{newLabel}</Text>
          </TouchableOpacity>
          {items.length === 0 && <Text style={T(th, { color: th.sub, textAlign: 'center', padding: 16 })}>{emptyText}</Text>}
          <FlatList
            data={items}
            keyExtractor={(r) => r.id}
            renderItem={({ item }) => {
              const active = item.id === activeId;
              return (
                <View style={{ padding: 12, marginBottom: 8, borderRadius: 14, backgroundColor: th.card, borderWidth: 2, borderColor: active ? th.primary : th.border }}>
                  {renaming === item.id ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TextInput value={renameText} onChangeText={setRenameText} autoFocus maxLength={40} onSubmitEditing={saveRename}
                        style={[T(th), { flex: 1, borderWidth: 1, borderColor: th.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 }]} />
                      <Text onPress={saveRename} style={T(th, { fontWeight: '700', color: th.primaryDark, marginLeft: 10 })}>Simpan</Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => onOpen(item.id)}>
                      <Text numberOfLines={1} style={T(th, { fontWeight: '700' })}>{item.title}</Text>
                      <Text style={T(th, { size: th.size - 3, color: th.sub })}>{item.sub}</Text>
                    </TouchableOpacity>
                  )}
                  {renaming !== item.id && (
                    <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
                      {confirmDel === item.id ? (
                        <>
                          <Text style={T(th, { size: th.size - 2, color: th.danger, flex: 1 })}>Hapus ini?</Text>
                          <Text onPress={() => { onDelete(item.id); setConfirmDel(null); }} style={T(th, { size: th.size - 2, fontWeight: '700', color: th.danger, marginRight: 16 })}>Ya, hapus</Text>
                          <Text onPress={() => setConfirmDel(null)} style={T(th, { size: th.size - 2, color: th.sub })}>Batal</Text>
                        </>
                      ) : (
                        <>
                          <Text onPress={() => { setRenaming(item.id); setRenameText(item.title); }} style={T(th, { size: th.size - 2, color: th.primaryDark, marginRight: 16 })}>Ubah nama</Text>
                          <Text onPress={() => setConfirmDel(item.id)} style={T(th, { size: th.size - 2, color: th.danger })}>Hapus</Text>
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
