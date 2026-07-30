import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, api } from '../api';
import { METRO } from '../theme';

// Real OTP login flow, matching the web console exactly —
// same backend, same two-step verification.

export default function LoginScreen({ navigation }: any) {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async () => {
    if (!email || !password || phone.length < 10) {
      setError('Fill in all fields with a valid 10-digit number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/otp/send', { phone });
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.verifyLogin(email, password, phone, otp);
      await AsyncStorage.multiSet([
        ['accessToken', data.data.accessToken],
        ['refreshToken', data.data.refreshToken],
        ['user', JSON.stringify(data.data.user)],
      ]);
      navigation.replace('Home');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.content}>
          <View style={styles.logoWrap}>
            <View style={styles.logoGlow} />
            <Image source={require('../../assets/gravrel-logo.jpg')} style={styles.logoImage} resizeMode="cover" />
          </View>
          <Text style={styles.brand}>gravrel</Text>
          <Text style={styles.tagline}>{step === 'credentials' ? 'Sign in' : `Enter code sent to +91 ${phone}`}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {step === 'credentials' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={METRO.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={METRO.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <View style={styles.phoneRow}>
                <Text style={styles.phonePrefix}>+91</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="Mobile number"
                  placeholderTextColor={METRO.textMuted}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
              <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>SEND CODE</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="------"
                placeholderTextColor={METRO.textMuted}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
              <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>VERIFY & SIGN IN</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStep('credentials')} style={{ marginTop: 16 }}>
                <Text style={styles.link}>← Back</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 24 }}>
            <Text style={styles.link}>Don't have an account? Create one</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoGlow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: METRO.accents.green, opacity: 0.25 },
  logoImage: { width: 96, height: 96, borderRadius: 20 },
  brand: { fontSize: 44, fontWeight: '300', color: '#fff', letterSpacing: -1, marginBottom: 4, textAlign: 'center' },
  tagline: { fontSize: 15, color: METRO.textSecondary, marginBottom: 28, textAlign: 'center' },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 12 },
  input: {
    borderBottomWidth: 2, borderBottomColor: METRO.accents.green,
    color: '#fff', fontSize: 17, paddingVertical: 10, marginBottom: 18,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-end' },
  phonePrefix: { color: METRO.textSecondary, fontSize: 17, paddingBottom: 10, marginRight: 8 },
  phoneInput: { flex: 1 },
  otpInput: { fontSize: 32, letterSpacing: 12, textAlign: 'center' },
  button: { backgroundColor: METRO.accents.green, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  link: { color: METRO.accents.green, fontSize: 14, textAlign: 'center' },
});
