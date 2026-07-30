import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { METRO } from '../theme';

// Real animated intro — logo scales in with a spring bounce, glows,
// and a genuine diagonal light-sweep passes across it once. While
// it plays, we REAL-verify any stored session with the actual
// backend (not just check that a token exists) — a stale or
// expired token now correctly routes to Login instead of silently
// landing on an empty Home screen.

export default function SplashScreen({ navigation }: any) {
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const shineX = useRef(new Animated.Value(-160)).current;
  const brandOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(shineX, {
        toValue: 160,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(brandOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();

    // Real session verification — not just "does a token exist,"
    // but "does the backend actually accept it right now."
    const verifySessionAndNavigate = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      let destination = 'Login';

      if (token) {
        try {
          await api.get('/auth/me'); // real authenticated call — throws on invalid/expired token
          destination = 'Home';
        } catch {
          // Stale or expired token — clear it so we don't repeat this mistake
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
          destination = 'Login';
        }
      }

      setTimeout(() => navigation.replace(destination), 2100);
    };
    verifySessionAndNavigate();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoStage}>
        <Animated.View style={[styles.glow, { opacity: glow }]} />

        <Animated.View style={[styles.logoClip, { opacity, transform: [{ scale }] }]}>
          <Image source={require('../../assets/gravrel-logo.jpg')} style={styles.logo} resizeMode="cover" />

          <Animated.View style={[styles.shineWrap, { transform: [{ translateX: shineX }, { rotate: '20deg' }] }]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shine}
            />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.Text style={[styles.brand, { opacity: brandOpacity }]}>gravrel</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: brandOpacity }]}>solar-powered · DPDP-native cloud</Animated.Text>
    </View>
  );
}

const LOGO_SIZE = 120;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background, alignItems: 'center', justifyContent: 'center' },
  logoStage: { width: LOGO_SIZE, height: LOGO_SIZE, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: LOGO_SIZE * 1.8, height: LOGO_SIZE * 1.8, borderRadius: LOGO_SIZE, backgroundColor: METRO.accents.green, opacity: 0.3 },
  logoClip: { width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 24, overflow: 'hidden' },
  logo: { width: '100%', height: '100%' },
  shineWrap: { position: 'absolute', top: -40, left: -20, width: 60, height: LOGO_SIZE + 80 },
  shine: { width: 60, height: '100%' },
  brand: { fontSize: 40, fontWeight: '300', color: '#fff', letterSpacing: -1, marginTop: 24 },
  tagline: { fontSize: 12, color: METRO.textSecondary, marginTop: 4, letterSpacing: 0.5 },
});
