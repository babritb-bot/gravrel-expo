import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api';
import { METRO } from '../theme';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async () => {
    if (!name || !email || password.length < 6) {
      setError('Fill all fields — password needs 6+ characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      navigation.replace('Login');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.brand}>gravrel</Text>
          <Text style={styles.tagline}>Create your account</Text>
          <Text style={styles.sub}>India's DPDP-native cloud, from ₹199/month</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={METRO.textMuted} value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={METRO.textMuted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={METRO.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={styles.button} onPress={register} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>CREATE ACCOUNT</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 24 }}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 },
  brand: { fontSize: 40, fontWeight: '300', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 20, color: '#fff', fontWeight: '600', marginTop: 16, marginBottom: 4 },
  sub: { fontSize: 13, color: METRO.textSecondary, marginBottom: 28 },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 12 },
  input: { borderBottomWidth: 2, borderBottomColor: METRO.accents.green, color: '#fff', fontSize: 17, paddingVertical: 10, marginBottom: 18 },
  button: { backgroundColor: METRO.accents.green, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  link: { color: METRO.accents.green, fontSize: 14, textAlign: 'center' },
});
