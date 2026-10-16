import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import Icon from './Icon';
import { T } from '../theme';
import { PressScale, Bounce, Typewriter } from './Anim';

export function Btn({ th, title, onPress, kind = 'primary', disabled, style }) {
  const filled = kind === 'primary';
  return (
    <PressScale
      anim={th.anim} onPress={onPress} disabled={disabled}
      style={[{
        paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center',
        backgroundColor: filled ? th.primary : th.card,
        minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: filled ? th.primary : th.border,
        borderBottomWidth: 1, opacity: disabled ? 0.45 : 1,
      }, style]}
    >
      <Text style={T(th, { fontWeight: '700', color: filled ? th.onPrimary : th.text })}>{title}</Text>
    </PressScale>
  );
}

export function Option({ th, label, desc, selected, onPress }) {
  return (
    <PressScale
      anim={th.anim} onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: !!selected, checked: !!selected }}
      style={{ padding: 14, borderRadius: 14, marginBottom: 10, backgroundColor: selected ? th.soft : th.card, borderWidth: selected ? 2 : 1, borderColor: selected ? th.primary : th.border, minHeight: 58 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Text style={T(th, { fontWeight: '700', flex: 1 })}>{label}</Text>{selected && <Icon name="check" color={th.primary} size={20} />}</View>
      {!!desc && <Text style={T(th, { size: th.size - 2, color: th.sub })}>{desc}</Text>}
    </PressScale>
  );
}

export function SmallLink({ th, title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignSelf: 'center', padding: 12 }}>
      <Text style={T(th, { size: th.size - 3, color: th.sub, textDecorationLine: 'underline' })}>{title}</Text>
    </TouchableOpacity>
  );
}

export function AiBubble({ th, text }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
      <Bounce anim={th.anim} amplitude={7} duration={600}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: th.primary, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Icon name="spark" color={th.onPrimary} />
        </View>
      </Bounce>
      <View style={{ flex: 1, backgroundColor: th.card, borderRadius: 16, borderTopLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: th.border }}>
        <Typewriter text={text} anim={th.anim} style={T(th)} />
      </View>
    </View>
  );
}

export function Dropdown({ th, label, value, options, onChange, placeholder = 'Pilih...' }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);
  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && <Text style={T(th, { size: th.size - 2, color: th.sub, marginBottom: 6 })}>{label}</Text>}
      <TouchableOpacity
        accessibilityRole="button" accessibilityLabel={label || placeholder} accessibilityState={{ expanded: open }} onPress={() => setOpen(true)}
        style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: th.border, backgroundColor: th.card, flexDirection: 'row', justifyContent: 'space-between' }}
      >
        <Text style={T(th, { flex: 1 })} numberOfLines={1}>{current ? current.label : placeholder}</Text>
        <Icon name="chevron" color={th.sub} size={20} />
      </TouchableOpacity>
      <Modal transparent visible={open} animationType={th.anim ? 'fade' : 'none'} onRequestClose={() => setOpen(false)}>
        <Pressable onPress={() => setOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 }}>
          <Pressable style={{ backgroundColor: th.card, borderRadius: 16, maxHeight: '60%', padding: 8 }}>
            <FlatList
              data={options}
              keyExtractor={(o) => String(o.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onChange(item.value); setOpen(false); }}
                  style={{ padding: 14, borderRadius: 10, backgroundColor: item.value === value ? th.bg : 'transparent' }}
                >
                  <Text style={T(th, { fontWeight: item.value === value ? '700' : '400' })}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity accessibilityRole="button" onPress={() => setOpen(false)} style={{ minHeight: 44, padding: 12 }}><Text style={T(th, { color: th.primaryDark })}>Batal</Text></TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
