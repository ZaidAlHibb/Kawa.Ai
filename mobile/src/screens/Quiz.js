import VoiceButton from '../components/VoiceButton';
import Icon from '../components/Icon';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, Animated, Platform, TouchableOpacity } from 'react-native';
import { useStore } from '../store';
import { getTheme, T } from '../theme';
import { Btn, Option } from '../components/UI';
import Header from '../components/Header';
import HistorySheet from '../components/HistorySheet';
import PixelSprite, { SPRITE_ORDER } from '../components/PixelSprite';
import { Pop, Bounce, PressScale, Confetti } from '../components/Anim';
import { quizApi, chatApi } from '../api';
import RichText from '../components/RichText';
import { speak, stopSpeaking, voiceOpts } from '../speech';

const newId = () => String(Date.now()) + Math.random().toString(36).slice(2, 6);
const makeTitle = (t) => (t.length > 32 ? t.slice(0, 32) + '…' : t);
const fmtDate = (t) => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' });
const MAX_HP = 3;

const LETTER = 'ABCD';
const verdict = (pct) => (pct >= 90 ? 'Luar biasa! ' : pct >= 70 ? 'Bagus sekali! ' : pct >= 50 ? 'Lumayan, terus berlatih ' : 'Jangan menyerah, ayo coba lagi ');

function Conclusion({ th, questions, answers, score }) {
  const total = questions.length;
  const done = questions.map((q, k) => ({ q, a: answers[k] })).filter((x) => x.a != null);
  const right = done.filter((x) => x.a === x.q.answer);
  const wrong = done.filter((x) => x.a !== x.q.answer);
  const skipped = total - done.length;
  const pct = total ? Math.round((score / total) * 100) : 0;
  const short = (t) => (t.length > 70 ? t.slice(0, 70) + '…' : t);
  return (
    <View style={{ padding: 14, borderRadius: 16, backgroundColor: th.card, borderWidth: 2, borderColor: th.border, marginBottom: 14 }}>
      <Text style={T(th, { size: th.size + 2, fontWeight: '800', marginBottom: 4 })}>Kesimpulan</Text>
      <Text style={T(th, { marginBottom: 8 })}>Benar {score} dari {total} soal ({pct}%). {verdict(pct)}</Text>
      <View style={{ height: 10, backgroundColor: th.border, borderRadius: 5, marginBottom: 10 }}>
        <View style={{ height: 10, width: `${pct}%`, backgroundColor: th.good, borderRadius: 5 }} />
      </View>
      {right.length > 0 && <>
        <Text style={T(th, { fontWeight: '700', color: th.good, marginTop: 4 })}> Sudah kamu kuasai ({right.length})</Text>
        {right.map((x, k) => <Text key={k} style={T(th, { size: th.size - 2, color: th.sub })}>• {short(x.q.q)}</Text>)}
      </>}
      {wrong.length > 0 && <>
        <Text style={T(th, { fontWeight: '700', color: th.danger, marginTop: 8 })}> Perlu diulang ({wrong.length})</Text>
        {wrong.map((x, k) => <Text key={k} style={T(th, { size: th.size - 2, color: th.sub })}>• {short(x.q.q)}</Text>)}
      </>}
      {skipped > 0 && <Text style={T(th, { size: th.size - 2, color: th.sub, marginTop: 8 })}>{skipped} soal belum sempat dijawab.</Text>}
    </View>
  );
}

function Review({ th, questions, answers }) {
  return (
    <View>
      <Text style={T(th, { size: th.size + 1, fontWeight: '800', marginBottom: 8 })}>Cek jawabanmu</Text>
      {questions.map((q, k) => {
        const a = answers[k];
        const none = a == null;
        const ok = !none && a === q.answer;
        return (
          <View key={k} style={{ padding: 12, borderRadius: 14, marginBottom: 10, backgroundColor: th.card, borderWidth: 2, borderColor: none ? th.border : ok ? th.good : th.danger }}>
            <Text style={T(th, { fontWeight: '700', color: none ? th.sub : ok ? th.good : th.danger, marginBottom: 4 })}>{none ? `Soal ${k + 1} · belum dijawab` : ok ? `Soal ${k + 1} · Benar ` : `Soal ${k + 1} · Salah `}</Text>
            <RichText th={th} text={q.q} style={{ marginBottom: 6 }} />
            {!none && !ok && <Text style={T(th, { size: th.size - 1, color: th.danger })}>Jawabanmu: {LETTER[a]}. {q.options[a]}</Text>}
            <Text style={T(th, { size: th.size - 1, color: th.good, fontWeight: '700' })}>Jawaban benar: {LETTER[q.answer]}. {q.options[q.answer]}</Text>
            {!!q.explanation && <RichText th={th} text={q.explanation} color={th.sub} style={{ marginTop: 6, fontSize: th.size - 1 }} />}
          </View>
        );
      })}
    </View>
  );
}

export default function Quiz({ sidebarRequest, onSidebarHandled }) {
  const { state, update } = useStore();
  const th = getTheme(state.abk, state.animPref, state.level);
  const hasMaterial = !!state.curricula.find((c) => c.id === state.activeCurriculumId);

  const quizzes = state.quizzes || [];
  const active = quizzes.find((q) => q.id === state.activeQuizId) || null;
  const [phase, setPhase] = useState(active ? 'detail' : 'setup');
  const [showList, setShowList] = useState(false);
  const [topic, setTopic] = useState('');
  const [fromMaterial, setFromMaterial] = useState(hasMaterial);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [qs, setQs] = useState([]);
  const [i, setI] = useState(0);
  const [hp, setHp] = useState(MAX_HP);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [reviewAtt, setReviewAtt] = useState(null);
  const [aiSum, setAiSum] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const defeat = useRef(new Animated.Value(0)).current;
  const lunge = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const ND = Platform.OS !== 'web';
  const pixel = state.pixelMode;
  useEffect(() => () => stopSpeaking(), []);

  function begin(questions) {
    stopSpeaking();
    defeat.setValue(0); lunge.setValue(0); flash.setValue(0);
    setQs(questions); setI(0); setHp(MAX_HP); setScore(0); setPicked(null); setAnswers([]); setAiSum(''); setPhase('play');
  }

  async function start() {
    stopSpeaking();
    setLoading(true); setNote('');
    let questions = null;
    try {
      const r = await quizApi(state, topic || 'materi umum', fromMaterial, 5);
      questions = r.questions;
    } catch (e) {
      setNote('Soal belum bisa dibuat. Cek koneksi ke server lalu coba lagi. Kuis yang sudah pernah dibuat tetap bisa diulang lewat Riwayat.');
    }
    setLoading(false);
    if (!questions || !questions.length) return;
    const now = Date.now();
    const quiz = { id: newId(), title: makeTitle(topic.trim() || 'Kuis dari materi'), topic: topic.trim(), fromMaterial, questions, attempts: [], createdAt: now, updatedAt: now };
    update((s) => ({ quizzes: [quiz, ...(s.quizzes || [])].slice(0, 30), activeQuizId: quiz.id }));
    begin(questions);
  }

  const replay = () => { if (active) begin(active.questions); };

  const openQuiz = (id) => { stopSpeaking(); update({ activeQuizId: id }); setPhase('detail'); setShowList(false); };
  const newQuiz = () => { stopSpeaking(); setReviewAtt(null); update({ activeQuizId: null }); setTopic(''); setNote(''); setPhase('setup'); setShowList(false); };
  const renameQuiz = (id, t) => update((s) => ({ quizzes: (s.quizzes || []).map((q) => (q.id === id ? { ...q, title: t } : q)) }));
  const delQuiz = (id) => {
    update((s) => ({ quizzes: (s.quizzes || []).filter((q) => q.id !== id), activeQuizId: s.activeQuizId === id ? null : s.activeQuizId }));
    if (state.activeQuizId === id) setPhase('setup');
  };

  useEffect(() => { if (sidebarRequest?.tab === 'quiz') { sidebarRequest.id == null ? newQuiz() : openQuiz(sidebarRequest.id); onSidebarHandled?.(); } }, [sidebarRequest]);

  function hit() {}

  function choose(n) {
    if (picked !== null) return;
    setPicked(n);
    setAnswers((a) => { const c = [...a]; c[i] = n; return c; });
    const right = n === qs[i].answer;
    if (right) {
      setScore((s) => s + 1);
      if (th.anim) Animated.timing(defeat, { toValue: 1, duration: 550, useNativeDriver: ND }).start();
    } else if (pixel) {
      setHp((h) => h - 1);
      hit();
      if (th.anim) {
        Animated.sequence([
          Animated.timing(lunge, { toValue: 1, duration: 140, useNativeDriver: ND }),
          Animated.timing(lunge, { toValue: 0, duration: 300, useNativeDriver: ND }),
        ]).start();

      }
    }
    if (state.voiceOn && state.voiceAuto) {
      speak(right ? 'Benar! Hebat sekali!' : pixel ? 'Aduh, monster menyerang! Jangan menyerah, ya!' : 'Belum tepat. Jangan menyerah, ya!', voiceOpts(state));
    }
  }

  function next() {
    stopSpeaking();
    defeat.setValue(0); lunge.setValue(0);
    const dead = pixel && hp <= 0;
    if (dead || i + 1 >= qs.length) {
      const won = !pixel || hp > 0;
      const att = { ts: Date.now(), score, total: qs.length, won, pixel, answers };
      update((s) => ({ quizzes: (s.quizzes || []).map((q) => (q.id === s.activeQuizId ? { ...q, attempts: [att, ...(q.attempts || [])].slice(0, 20), updatedAt: Date.now() } : q)) }));
      setPhase('end');
      return;
    }
    setI(i + 1); setPicked(null);
  }

  async function askSummary(questions, ans, sc) {
    if (aiBusy) return;
    setAiBusy(true); setAiSum('');
    const lines = questions.map((q, k) => `${k + 1}. ${q.q} | jawaban siswa: ${ans[k] == null ? 'kosong' : q.options[ans[k]]} | jawaban benar: ${q.options[q.answer]}`).join('\n');
    try {
      const { reply } = await chatApi(state, [{ role: 'user', content: `Aku selesai mengerjakan kuis. Skorku ${sc} dari ${questions.length}.\n${lines}\n\nTolong buat kesimpulan singkat: apa yang sudah kukuasai, bagian mana yang perlu kupelajari lagi, dan satu saran belajar. Maksimal 6 kalimat.` }]);
      setAiSum(reply);
    } catch (e) { setAiSum('Kawa belum bisa membuat kesimpulan sekarang. Cek koneksi lalu coba lagi.'); }
    setAiBusy(false);
  }
  const AiSummary = ({ questions, ans, sc }) => (
    <View style={{ marginBottom: 14 }}>
      {!!aiSum && <View style={{ padding: 14, borderRadius: 16, backgroundColor: th.card, borderWidth: 2, borderColor: th.primary, marginBottom: 10 }}>
        <Text style={T(th, { fontWeight: '800', marginBottom: 4 })}>Catatan dari Kawa</Text>
        <RichText th={th} text={aiSum} />
      </View>}
      {aiBusy ? <ActivityIndicator color={th.primary} style={{ margin: 8 }} /> : <Btn th={th} kind="ghost" title={aiSum ? ' Minta kesimpulan lagi dari Kawa' : ' Minta Kawa menyimpulkan'} onPress={() => askSummary(questions, ans, sc)} />}
    </View>
  );

  const bestOf = (q) => (q.attempts || []).reduce((m, x) => Math.max(m, x.score), -1);
  const subText = (q) => {
    const n = (q.attempts || []).length;
    return `${q.questions.length} soal · ${n ? `terbaik ${bestOf(q)}/${q.questions.length} · ${n}× dimainkan` : 'belum dimainkan'} · ${fmtDate(q.updatedAt)}`;
  };
  const header = (
    <>
      <Header th={th} title={phase === 'setup' || !active ? 'Kuis baru' : active.title} onHistory={() => setShowList(true)} onNew={newQuiz}
        sub={<Text style={T(th, { size: th.size - 3, color: th.sub })}> {pixel ? 'Tampilan pixel: lawan monster' : 'Tampilan kuis biasa'}</Text>} />
      <HistorySheet th={th} visible={showList} onClose={() => setShowList(false)} heading="Riwayat kuis" newLabel="＋ Kuis baru"
        emptyText="Belum ada kuis. Buat kuis pertamamu, nanti bisa diulang dari sini."
        items={[...quizzes].sort((a, b) => b.updatedAt - a.updatedAt).map((q) => ({ id: q.id, title: q.title, sub: subText(q) }))}
        activeId={state.activeQuizId} onOpen={openQuiz} onNew={newQuiz} onRename={renameQuiz} onDelete={delQuiz} />
    </>
  );
  const modeToggle = (
    <>
      <Option th={th} label="Tampilan pixel: lawan monster" desc="Benar mengalahkan monster, salah kehilangan nyawa" selected={pixel} onPress={() => update({ pixelMode: true })} />
      <Option th={th} label="Tampilan kuis biasa" selected={!pixel} onPress={() => update({ pixelMode: false })} />
    </>
  );

  if (phase === 'setup' || (phase === 'detail' && !active)) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
          <Text accessibilityRole="header" style={T(th, { size: th.size + 10, fontWeight: '700', marginBottom: 12 })}>Sedikit latihan, banyak kemajuan.</Text>
          <Text style={T(th, { color: th.sub, marginBottom: 16 })}>Tulis topiknya, lalu Kawa membuatkan soal untukmu. Kuisnya tersimpan di Riwayat dan bisa diulang kapan saja.</Text>
          <TextInput
            accessibilityLabel="Topik kuis" value={topic} onChangeText={setTopic} placeholder="Contoh: pecahan, fotosintesis, Pancasila" placeholderTextColor={th.sub}
            style={[T(th), { borderWidth: 2, borderColor: th.border, backgroundColor: th.card, borderRadius: 12, padding: 14, marginBottom: 12 }]}
          />
          {hasMaterial && (
            <Option th={th} label="Ambil soal dari materi yang diupload" desc="Soal mengikuti kurikulum aktif di tab Profil" selected={fromMaterial} onPress={() => setFromMaterial(!fromMaterial)} />
          )}
          {modeToggle}
          {!!note && <Text style={T(th, { color: th.danger, marginBottom: 10 })}>{note}</Text>}
          {loading ? <ActivityIndicator color={th.primary} style={{ margin: 12 }} /> : <Btn th={th} title="Mulai kuis" onPress={start} disabled={!topic.trim() && !fromMaterial} />}
        </ScrollView>
      </View>
    );
  }

  if (phase === 'detail') {
    const atts = active.attempts || [];
    return (
      <View style={{ flex: 1 }}>
        {header}
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={T(th, { size: th.size + 4, fontWeight: '800', marginBottom: 4 })}>{active.title}</Text>
          <Text style={T(th, { color: th.sub, marginBottom: 16 })}>{active.questions.length} soal · dibuat {fmtDate(active.createdAt)}{atts.length ? ` · skor terbaik ${bestOf(active)}/${active.questions.length}` : ''}</Text>
          <Btn th={th} title={atts.length ? ' Ulangi kuis ini' : '▶ Mulai kuis ini'} onPress={replay} style={{ marginBottom: 12 }} />
          <Btn th={th} kind="ghost" title="＋ Buat kuis baru" onPress={newQuiz} style={{ marginBottom: 18 }} />
          {modeToggle}
          <Text style={T(th, { fontWeight: '800', marginTop: 12, marginBottom: 8 })}>Hasil sebelumnya</Text>
          {atts.length === 0
            ? <Text style={T(th, { color: th.sub })}>Belum pernah dimainkan.</Text>
            : atts.slice(0, 8).map((a, k) => (
              <TouchableOpacity key={a.ts + '-' + k} accessibilityRole="button" accessibilityLabel={`Lihat jawaban percobaan ${fmtDate(a.ts)}, skor ${a.score} dari ${a.total}`}
                onPress={() => { setReviewAtt(a); setAiSum(''); setPhase('review'); }}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48, padding: 12, marginBottom: 6, borderRadius: 12, backgroundColor: th.card, borderWidth: 1, borderColor: th.border }}>
                <View style={{ flex: 1 }}>
                  <Text style={T(th)}>{fmtDate(a.ts)}{a.pixel ? ' · pixel' : ''}</Text>
                  <Text style={T(th, { size: th.size - 3, color: th.primaryDark, fontWeight: '700' })}> Lihat jawaban & kesimpulan</Text>
                </View>
                <Text style={T(th, { fontWeight: '700', color: a.won ? th.good : th.danger })}>{a.score}/{a.total} {a.won ? 'Selesai' : 'Latihan'}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    );
  }

  if (phase === 'review' && active && reviewAtt) {
    const ans = reviewAtt.answers || [];
    return (
      <View style={{ flex: 1 }}>
        {header}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Btn th={th} kind="ghost" title="← Kembali ke ringkasan" onPress={() => setPhase('detail')} style={{ marginBottom: 12 }} />
          <Text style={T(th, { color: th.sub, marginBottom: 10 })}>Percobaan {fmtDate(reviewAtt.ts)}{reviewAtt.pixel ? ' · tampilan pixel' : ''}</Text>
          {reviewAtt.answers
            ? <>
                <Conclusion th={th} questions={active.questions} answers={ans} score={reviewAtt.score} />
                <AiSummary questions={active.questions} ans={ans} sc={reviewAtt.score} />
                <Review th={th} questions={active.questions} answers={ans} />
              </>
            : <Text style={T(th, { color: th.sub })}>Percobaan ini dimainkan sebelum fitur cek jawaban ada, jadi jawabannya tidak tersimpan. Ulangi kuis untuk melihat kesimpulan dan jawabanmu.</Text>}
          <Btn th={th} title=" Ulangi kuis ini" onPress={replay} style={{ marginTop: 6 }} />
        </ScrollView>
      </View>
    );
  }

  if (phase === 'end') {
    const won = !pixel || hp > 0;
    return (
      <View style={{ flex: 1 }}>
        {header}
        <Confetti anim={th.anim && won} />
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Bounce anim={th.anim} amplitude={12} duration={500}><View style={{ alignItems: 'center', marginBottom: 16 }}><Icon name="award" size={48} color={th.primary} /></View></Bounce>
          <Text style={T(th, { size: th.size + 8, fontWeight: '800', textAlign: 'center', marginBottom: 6 })}>
            {pixel ? (won ? 'Semua monster kalah!' : 'Kamu kehabisan nyawa') : 'Kuis selesai'}
          </Text>
          <Text style={T(th, { textAlign: 'center', color: th.sub, marginBottom: 16 })}>
            Skor kamu {score} dari {qs.length}. {won ? 'Kerja bagus!' : 'Coba lagi, kamu pasti bisa.'}
          </Text>
          <Conclusion th={th} questions={qs} answers={answers} score={score} />
          <AiSummary questions={qs} ans={answers} sc={score} />
          <Review th={th} questions={qs} answers={answers} />
          <Btn th={th} title=" Ulangi kuis ini" onPress={replay} style={{ marginTop: 6, marginBottom: 10 }} />
          <Btn th={th} kind="ghost" title="Lihat ringkasan dan riwayat hasil" onPress={() => setPhase('detail')} style={{ marginBottom: 10 }} />
          <Btn th={th} kind="ghost" title="＋ Kuis baru" onPress={newQuiz} />
        </ScrollView>
      </View>
    );
  }

  const q = qs[i];
  const answered = picked !== null;
  const defeated = answered && picked === q.answer;
  const sprite = SPRITE_ORDER[i % SPRITE_ORDER.length];

  return (
    <View style={{ flex: 1 }}>
    {header}
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {pixel ? (
        <Animated.View style={{ transform: [{ translateX: shake }], backgroundColor: '#1B1830', borderRadius: 4, borderWidth: 4, borderColor: '#0E0C1B', padding: 14, marginBottom: 14, overflow: 'hidden' }}>
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#F0524F', opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.45] }) }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#FFD93D', fontFamily: MONO, fontWeight: '700' }}>Monster {i + 1}/{qs.length}</Text>
            <Pop key={hp} anim={th.anim}><Text style={{ fontSize: 16, color: '#FFFFFF' }}>{`Kesempatan: ${hp} dari ${MAX_HP}`}</Text></Pop>
          </View>
          <View style={{ alignItems: 'center', paddingVertical: 14 }}>
            <Bounce anim={th.anim && !answered} amplitude={5} duration={700}>
              <Animated.View style={th.anim
                ? { opacity: defeat.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }), transform: [
                    { scale: defeat.interpolate({ inputRange: [0, 1], outputRange: [1, 0.1] }) },
                    { rotate: defeat.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '200deg'] }) },
                    { translateY: lunge.interpolate({ inputRange: [0, 1], outputRange: [0, 28] }) } ] }
                : { opacity: defeated ? 0.25 : 1 }}>
                <PixelSprite name={sprite} size={14} flip={answered && !defeated} />
              </Animated.View>
            </Bounce>
            {defeated && th.anim && <Pop anim style={{ position: 'absolute', top: 6 }}><Icon name="spark" size={24} color={th.primary} /></Pop>}
          </View>
          <View style={{ height: 10, backgroundColor: '#0E0C1B' }}>
            <View style={{ height: 10, width: defeated ? '0%' : '100%', backgroundColor: '#F0524F' }} />
          </View>
          <Text style={{ color: '#fff', fontFamily: MONO, marginTop: 8, textAlign: 'center' }}>
            {!answered ? 'Jawab dengan benar untuk menyerang!' : defeated ? 'Serangan kena! Monster kalah.' : 'Monster menyerang! Nyawamu berkurang.'}
          </Text>
        </Animated.View>
      ) : (
        <View style={{ height: 8, backgroundColor: th.border, borderRadius: 4, marginBottom: 14 }}>
          <View style={{ height: 8, width: `${(i / qs.length) * 100}%`, backgroundColor: th.primary, borderRadius: 4 }} />
        </View>
      )}

      <RichText th={th} text={q.q} style={{ marginBottom: 12, fontWeight: '700' }} />
      {state.voiceOn && (
        <VoiceButton th={th} label="Bacakan soal" onPress={() => speak(`${q.q}. ${q.options.map((o, k) => `Pilihan ${'ABCD'[k]}, ${o}.`).join(' ')}`, voiceOpts(state))} />
      )}
      {q.options.map((o, n) => {
        const isRight = answered && n === q.answer;
        const isWrong = answered && n === picked && n !== q.answer;
        return (
          <PressScale key={n} anim={th.anim} onPress={() => choose(n)}
            style={{ padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 2, borderBottomWidth: 2,
              backgroundColor: isRight ? '#D9F5E6' : isWrong ? '#FBDADC' : th.card,
              borderColor: isRight ? th.good : isWrong ? th.danger : th.border }}>
            <Text style={T(th, { color: isRight || isWrong ? '#17302A' : th.text })}>{String.fromCharCode(65 + n)}. {o}{isRight ? ' — Benar' : isWrong ? ' — Coba pelajari lagi' : ''}</Text>
          </PressScale>
        );
      })}
      {answered && (
        <View style={{ marginTop: 6 }}>
          {!!q.explanation && <RichText th={th} text={q.explanation} color={th.sub} style={{ marginBottom: 12 }} />}
          <Btn th={th} title={i + 1 >= qs.length || (pixel && hp <= 0) ? 'Lihat hasil' : 'Lanjut'} onPress={next} />
        </View>
      )}
    </ScrollView>
    </View>
  );
}
