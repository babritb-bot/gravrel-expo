import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MetroTile from '../components/MetroTile';
import { METRO } from '../theme';
import { vmsApi, databasesApi, k8sApi, storageApi } from '../api';

// The real Metro Start Screen. Tiles carry live backLabel content
// (real running status, real counts) so the auto-flip genuinely
// shows useful information — not decoration for its own sake.

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({ vms: 0, vmsRunning: 0, dbs: 0, k8s: 0, storage: 0 });

  const loadCounts = async () => {
    try {
      const [vms, dbs, k8s, storage] = await Promise.all([
        vmsApi.list().catch(() => ({ data: { data: [] } })),
        databasesApi.list().catch(() => ({ data: { data: [] } })),
        k8sApi.list().catch(() => ({ data: { data: [] } })),
        storageApi.buckets().catch(() => ({ data: { data: [] } })),
      ]);
      const vmList = vms.data.data || [];
      setCounts({
        vms: vmList.length,
        vmsRunning: vmList.filter((v: any) => v.status === 'RUNNING').length,
        dbs: dbs.data.data?.length || 0,
        k8s: k8s.data.data?.length || 0,
        storage: storage.data.data?.length || 0,
      });
    } catch { /* silent — tiles just show 0 */ }
  };

  useEffect(() => { loadCounts(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={METRO.accents.green} />}
      >
        <Text style={styles.greeting}>gravrel</Text>

        <View style={styles.row}>
          <MetroTile
            label="Cloud VMs"
            icon="▣"
            accent={METRO.accents.green}
            size="large"
            count={counts.vms}
            backLabel={`${counts.vmsRunning} running now`}
            flipDelay={0}
            onPress={() => navigation.navigate('VMs')}
          />
          <View style={styles.col}>
            <MetroTile
              label="Databases"
              icon="◈"
              accent={METRO.accents.blue}
              size="medium"
              count={counts.dbs}
              backLabel="Tap to manage"
              flipDelay={800}
              onPress={() => navigation.navigate('Databases')}
            />
            <MetroTile
              label="Kubernetes"
              icon="⬡"
              accent={METRO.accents.purple}
              size="medium"
              count={counts.k8s}
              backLabel="Real DOKS clusters"
              flipDelay={1600}
              onPress={() => navigation.navigate('Kubernetes')}
            />
          </View>
        </View>

        <View style={styles.row}>
          <MetroTile
            label="Object Storage"
            icon="▦"
            accent={METRO.accents.amber}
            size="medium"
            count={counts.storage}
            backLabel="S3-compatible"
            flipDelay={2400}
            onPress={() => navigation.navigate('Storage')}
          />
          <MetroTile
            label="Best Answer"
            icon="✶"
            accent={METRO.accents.teal}
            size="medium"
            backLabel="One question, best AI"
            flipDelay={3200}
            onPress={() => navigation.navigate('BestAnswer')}
          />
        </View>

        <View style={styles.row}>
          <MetroTile
            label="Billing"
            icon="₹"
            accent={METRO.accents.magenta}
            size="wide"
            backLabel="Live Razorpay billing"
            flipDelay={4000}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
        <View style={styles.row}>
          <MetroTile
            label="Settings"
            accent={METRO.accents.gray}
            size="small"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <Text style={styles.footer}>solar-powered · DPDP compliant · Bhubaneswar, India</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  scrollContent: { padding: METRO.spacing.lg },
  greeting: { fontSize: METRO.fontSizes.heading, fontWeight: '300', color: METRO.textPrimary, marginBottom: METRO.spacing.lg, letterSpacing: -1 },
  row: { flexDirection: 'row', marginBottom: 0 },
  col: { flexDirection: 'column' },
  footer: { fontSize: METRO.fontSizes.caption, color: METRO.textMuted, marginTop: METRO.spacing.xl, textAlign: 'center' },
});
