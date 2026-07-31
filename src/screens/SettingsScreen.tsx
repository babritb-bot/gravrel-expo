import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import { METRO } from '../theme';

export default function SettingsScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => { if (raw) setUser(JSON.parse(raw)); });
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const logoutAll = () => {
    Alert.alert('Log out all devices?', 'This will sign you out everywhere, including this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out All', style: 'destructive',
        onPress: async () => {
          setLoggingOutAll(true);
          try { await authApi.logoutAll(); } catch { /* proceed to clear locally regardless */ }
          setLoggingOutAll(false);
          logout();
        },
      },
    ]);
  };

  const LINKS = [
    { label: 'Billing & Payments', screen: 'Billing', accent: METRO.accents.magenta },
    { label: 'Help Center', screen: 'Help', accent: METRO.accents.blue },
    { label: 'Referrals', screen: 'Referrals', accent: METRO.accents.teal },
    { label: 'Student Benefits', screen: 'Student', accent: METRO.accents.amber },
    { label: 'Support', screen: 'Support', accent: METRO.accents.purple },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>settings</Text>

        <View style={styles.profileTile}>
          <Text style={styles.avatar}>{(user?.name || 'U')[0].toUpperCase()}</Text>
          <View>
            <Text style={styles.userName}>{user?.name || 'GravRel User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Account & Support</Text>
        {LINKS.map((link) => (
          <TouchableOpacity
            key={link.screen}
            style={[styles.tile, { borderLeftWidth: 4, borderLeftColor: link.accent }]}
            onPress={() => navigation.navigate(link.screen)}
          >
            <Text style={styles.tileTitle}>{link.label}</Text>
            <Text style={styles.tileArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>Security</Text>
        <TouchableOpacity style={styles.dangerTile} onPress={logoutAll} disabled={loggingOutAll}>
          {loggingOutAll ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.dangerTitle}>Log Out All Devices</Text>
              <Text style={styles.dangerDesc}>Signs out every session, including this one</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Account</Text>
        <TouchableOpacity style={styles.tile} onPress={logout}>
          <Text style={styles.tileTitle}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>GravRel · Bhubaneswar, Odisha, India</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  title: { fontSize: 34, fontWeight: '300', color: '#fff', letterSpacing: -0.5, marginBottom: 24 },
  profileTile: { flexDirection: 'row', alignItems: 'center', backgroundColor: METRO.accents.gray, padding: 20, marginBottom: 28, gap: 16 },
  avatar: { width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', textAlignVertical: 'center', lineHeight: 56 },
  userName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  sectionLabel: { color: METRO.accents.green, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 10 },
  tile: { backgroundColor: METRO.surface, padding: 18, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  tileArrow: { color: METRO.textMuted, fontSize: 20 },
  dangerTile: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', padding: 18, marginBottom: 20, marginTop: 10 },
  dangerTitle: { color: '#EF4444', fontSize: 15, fontWeight: '700' },
  dangerDesc: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
  footer: { color: METRO.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20 },
});
