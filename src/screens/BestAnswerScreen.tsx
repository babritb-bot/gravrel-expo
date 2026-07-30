import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bestAnswerApi } from '../api';
import { METRO } from '../theme';

// Real single-chatbox comparison — every enabled model compared
// entirely behind the scenes, only one clean answer shown.

export default function BestAnswerScreen() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const ask = async () => {
    const text = prompt.trim();
    if (!text || loading) return;
    setLoading(true);
    setAnswer(null);
    try {
      const { data } = await bestAnswerApi.ask(text);
      if (data.ok) setAnswer(data.response);
    } catch {
      setAnswer('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const enhance = async () => {
    if (!answer || enhancing) return;
    setEnhancing(true);
    try {
      const { data } = await bestAnswerApi.ask(prompt.trim() + '\n\nPrevious answer:\n' + answer, true);
      if (data.ok) setAnswer(data.response);
    } catch { /* keep prior answer */ }
    setEnhancing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Text style={styles.title}>best answer</Text>

        <ScrollView style={styles.answerScroll} contentContainerStyle={{ padding: 20 }}>
          {answer ? (
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          ) : !loading ? (
            <Text style={styles.hint}>Real answer, real comparison — nothing shown but the result.</Text>
          ) : null}
          {loading && <ActivityIndicator color={METRO.accents.teal} style={{ marginTop: 20 }} />}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor={METRO.textMuted}
            value={prompt}
            onChangeText={setPrompt}
            multiline
          />
          <View style={styles.btnRow}>
            {answer && (
              <TouchableOpacity style={styles.enhanceBtn} onPress={enhance} disabled={enhancing || loading}>
                {enhancing ? <ActivityIndicator size="small" color={METRO.accents.amber} /> : <Text style={styles.enhanceIcon}>✶✶</Text>}
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.sendBtn} onPress={ask} disabled={!prompt.trim() || loading}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendIcon}>➤</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  title: { fontSize: 34, fontWeight: '300', color: '#fff', letterSpacing: -0.5, paddingHorizontal: 20, paddingTop: 12 },
  answerScroll: { flex: 1 },
  hint: { color: METRO.textMuted, fontSize: 13, textAlign: 'center', marginTop: 60 },
  answerBox: { backgroundColor: METRO.surface, padding: 16 },
  answerText: { color: '#E2E4EF', fontSize: 15, lineHeight: 22 },
  inputBar: { backgroundColor: METRO.surface, padding: 16, borderTopWidth: 2, borderTopColor: METRO.accents.teal },
  input: { color: '#fff', fontSize: 15, minHeight: 44, maxHeight: 100 },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 10 },
  enhanceBtn: { width: 44, height: 44, backgroundColor: 'rgba(240,163,10,0.15)', borderWidth: 1, borderColor: 'rgba(240,163,10,0.4)', alignItems: 'center', justifyContent: 'center' },
  enhanceIcon: { color: METRO.accents.amber, fontSize: 14 },
  sendBtn: { width: 44, height: 44, backgroundColor: METRO.accents.teal, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 18 },
});
