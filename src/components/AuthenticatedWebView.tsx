import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { METRO } from '../theme';

// Real, authenticated embed of the actual live web console.
// react-native-webview only works on real iOS/Android — it cannot
// run inside a browser preview at all. Rather than show a raw
// library error during `expo start --web` testing, we show an
// honest, clear message instead. On a real device or built APK,
// this renders the genuine WebView normally.

interface Props {
  path: string;
  title: string;
  navigation: any;
}

export default function AuthenticatedWebView({ path, title, navigation }: Props) {
  const [injectionScript, setInjectionScript] = useState<string | null>(null);

  useEffect(() => {
    const buildInjection = async () => {
      const [accessToken, refreshToken, userRaw] = await AsyncStorage.multiGet([
        'accessToken', 'refreshToken', 'user',
      ]).then((pairs) => pairs.map((p) => p[1]));

      const user = userRaw ? JSON.parse(userRaw) : null;
      const authState = { state: { user, accessToken, refreshToken, isAuthenticated: !!accessToken }, version: 0 };

      setInjectionScript(`
        (function() {
          try { window.localStorage.setItem('auth-storage', ${JSON.stringify(JSON.stringify(authState))}); } catch (e) {}
          true;
        })();
      `);
    };
    buildInjection();
  }, []);

  // Honest fallback for the web-preview testing environment —
  // this feature is real, it just needs a real device to test.
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.webFallback}>
          <Text style={styles.fallbackIcon}>📱</Text>
          <Text style={styles.fallbackTitle}>Real device required</Text>
          <Text style={styles.fallbackDesc}>
            This feature uses a real embedded browser and only works on an actual Android device or built APK — not the web preview.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { WebView } = require('react-native-webview');
  const [loading, setLoading] = useState(true);

  if (!injectionScript) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator color={METRO.accents.green} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator color={METRO.accents.green} />
        </View>
      )}

      <WebView
        source={{ uri: `https://console.gravrelaetherops.com${path}` }}
        injectedJavaScriptBeforeContentLoaded={injectionScript}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
        startInLoadingState={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  loadingContainer: { flex: 1, backgroundColor: METRO.background, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: METRO.surface },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  backText: { color: '#fff', fontSize: 22 },
  title: { color: '#fff', fontSize: 17, fontWeight: '600' },
  webview: { flex: 1, backgroundColor: METRO.background },
  overlay: { position: 'absolute', top: 60, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  fallbackIcon: { fontSize: 48, marginBottom: 16 },
  fallbackTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  fallbackDesc: { color: METRO.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
