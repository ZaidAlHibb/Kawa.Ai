import Brand from '../components/Brand';
import VoiceButton from '../components/VoiceButton';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { getTheme, T } from '../theme';
import { AiBubble, Btn, Option, SmallLink } from '../components/UI';
import { Pop } from '../components/Anim';
import { ABK_OPTIONS, LEVELS } from '../config';
import { checkPersona } from '../api';
import { makeWelcomeRoom, onboardingText } from '../welcome';
import { speak, stopSpeaking, voiceOpts } from '../speech';

const STEPS = ['name', 'level', 'abkAsk', 'abkType', 'persona'];
const PERSONA_IDEAS = ['Santai dan lucu', 'Sabar dengan banyak contoh', 'Seperti game master', 'Singkat dan jelas'];

export default function Onboarding() {
  const { state, update } = useStore();
  const th = getTheme(state.abk, state.animPref, state.level);
  const [step, setStep] = useState('name');
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const go = (s) => { setErr(''); setStep(s); };
  const idx = STEPS.indexOf(step);

  function openFirstRoom(persona) {
    stopSpeaking();
    const room = makeWelcomeRoom({ ...state, persona });
    update({ persona, onboarded: true, rooms: [room], activeRoomId: room.id });
  }

  async function finish() {
    setBusy(true); setErr('');
    let cleaned = persona.trim().slice(0, 150);
    if (cleaned) {
      try {
        const r = await checkPersona(cleaned);
        if (!r.ok) { setErr(r.reason || 'Permintaan ini tidak bisa dipakai. Coba yang lain.'); setBusy(false); return; }
      } catch (e) {}
    }
    openFirstRoom(cleaned);
  }

  const Q = new Proxy({}, { get: (_, step) => onboardingText(step, state) });

  useEffect(() => {
    if (state.voiceOn) speak(Q[step], voiceOpts(state));
  }, [step]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: th.bg }}>
      <View style={{ width: '100%', maxWidth: 680, alignSelf: 'center', flex: 1 }}><View style={{ padding: 20 }}><Brand th={th} /></View><Text style={T(th, { color: th.sub, paddingHorizontal: 20 })}>Langkah {idx + 1} dari {STEPS.length}</Text>
      <View style={{ height: 8, backgroundColor: th.border, margin: 16, borderRadius: 4 }}>
        <View style={{ height: 8, width: `${((idx + 1) / STEPS.length) * 100}%`, backgroundColor: th.primary, borderRadius: 4 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4 }} keyboardShouldPersistTaps="handled">
        <AiBubble th={th} text={Q[step]} />
        <View style={{ flexDirection: 'row', marginBottom: 12, marginLeft: 54 }}>
          <VoiceButton th={th} label="Dengarkan pertanyaan" onPress={() => speak(Q[step], voiceOpts(state))} />
        </View>
        <Pop key={step} anim={th.anim}>

        {step === 'name' && (
          <>
            <TextInput
              value={name} onChangeText={setName} accessibilityLabel="Nama panggilan" maxLength={30} placeholder="Nama panggilanmu" placeholderTextColor={th.sub}
              style={[T(th), { borderWidth: 2, borderColor: th.border, backgroundColor: th.card, borderRadius: 12, padding: 14, marginBottom: 14 }]}
            />
            <Btn th={th} title="Lanjut" disabled={!name.trim()} onPress={() => { update({ name: name.trim() }); go('level'); }} />
          </>
        )}

        {step === 'level' && LEVELS.map((l) => (
          <Option key={l} th={th} label={l} selected={state.level === l} onPress={() => { update({ level: l }); go('abkAsk'); }} />
        ))}

        {step === 'abkAsk' && (
          <>
            <Option th={th} label="Ya, sesuaikan kenyamanan" onPress={() => go('abkType')} />
            <Option th={th} label="Gunakan tampilan standar" onPress={() => { update({ abk: 'none' }); go('persona'); }} />
          </>
        )}

        {step === 'abkType' && (
          <>
            {ABK_OPTIONS.filter((o) => o.value !== 'none').map((o) => (
              <Option key={o.value} th={th} label={o.label} desc={o.desc} selected={state.abk === o.value} onPress={() => update({ abk: o.value })} />
            ))}
            <Btn th={th} title="Lanjut" disabled={state.abk === 'none'} onPress={() => go('persona')} style={{ marginTop: 6 }} />
          </>
        )}

        {step === 'persona' && (
          <>
            <TextInput
              value={persona} onChangeText={setPersona} multiline maxLength={150}
              placeholder="Contoh: jelaskan seperti kakak yang lucu, pakai contoh sepak bola"
              placeholderTextColor={th.sub}
              style={[T(th), { minHeight: 90, textAlignVertical: 'top', borderWidth: 2, borderColor: th.border, backgroundColor: th.card, borderRadius: 12, padding: 14, marginBottom: 10 }]}
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
              {PERSONA_IDEAS.map((p) => (
                <Text key={p} onPress={() => setPersona(p)} style={[T(th, { size: th.size - 2 }), { backgroundColor: th.card, borderWidth: 1, borderColor: th.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }]}>{p}</Text>
              ))}
            </View>
            {!!err && <Text style={T(th, { color: th.danger, marginBottom: 10 })}>{err}</Text>}
            {busy ? <ActivityIndicator color={th.primary} /> : <Btn th={th} title="Mulai belajar" onPress={finish} />}
          </>
        )}
        </Pop>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {idx > 0 ? <SmallLink th={th} title="Sebelumnya" onPress={() => go(STEPS[idx - 1])} /> : <View />}
          {step === 'persona' && <SmallLink th={th} title="Lewati" onPress={() => { setPersona(''); openFirstRoom(''); }} />}
        </View>
      </ScrollView></View>
    </SafeAreaView>
  );
}
