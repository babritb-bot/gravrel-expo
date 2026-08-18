import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import MetroTile from '../components/MetroTile';
import FleetChart from '../components/FleetChart';
import { METRO } from '../theme';
import { vmsApi, databasesApi, k8sApi, storageApi } from '../api';

// Real, verified, copyright-free Unsplash photos (free tier, no
// attribution required) — used as subtle backdrops on the actual
// functional tiles, not as decoration in a separate section.
const IMAGES = {
  vms: 'https://images.unsplash.com/photo-1695668548342-c0c1ad479aee?w=600&q=70&fit=crop&auto=format',
  kubernetes: 'https://images.unsplash.com/photo-1667264501379-c1537934c7ab?w=600&q=70&fit=crop&auto=format',
  storage: 'https://images.unsplash.com/photo-1683322499436-f4383dd59f5a?w=600&q=70&fit=crop&auto=format',
  settings: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=70&fit=crop&auto=format',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({ vms: 0, vmsRunning: 0, vmsStopped: 0, vmsProvisioning: 0, dbs: 0, k8s: 0, storage: 0 });

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
        vmsStopped: vmList.filter((v: any) => v.status === 'STOPPED').length,
        vmsProvisioning: vmList.filter((v: any) => v.status === 'PROVISIONING').length,
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

        <View style={styles.chartCard}>
          <FleetChart
            segments={[
              { label: 'Running', count: counts.vmsRunning, color: METRO.accents.green },
              { label: 'Stopped', count: counts.vmsStopped, color: METRO.textMuted },
              { label: 'Provisioning', count: counts.vmsProvisioning, color: METRO.accents.amber },
            ]}
          />
        </View>

        <View style={styles.row}>
          <MetroTile
            label="Cloud VMs"
            icon="▣"
            accent={METRO.accents.green}
            size="large"
            count={counts.vms}
            backLabel={`${counts.vmsRunning} running now`}
            backgroundImage={IMAGES.vms}
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
              backgroundImage={IMAGES.kubernetes}
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
            backgroundImage={IMAGES.storage}
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
            label="Voice Agent"
            icon="📞"
            accent={METRO.accents.magenta}
            size="medium"
            backLabel="Real AI phone support"
            flipDelay={4000}
            onPress={() => navigation.navigate('VoiceAgent')}
          />
          <MetroTile
            label="Platform Pulse"
            icon="⚡"
            accent="#00F0FF"
            size="medium"
            backLabel="Live platform activity"
            flipDelay={4800}
            onPress={() => navigation.navigate('PlatformPulse')}
          />
        </View>

        <View style={styles.row}>
          <MetroTile
            label="Billing"
            icon="₹"
            accent={METRO.accents.magenta}
            size="wide"
            backLabel="Live Razorpay billing"
            flipDelay={5600}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
        <View style={styles.row}>
          <MetroTile
            label="Settings"
            accent={METRO.accents.gray}
            size="small"
            backgroundImage={IMAGES.settings}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <Text style={styles.footer}>DPDP compliant · Bhubaneswar, India</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  scrollContent: { padding: METRO.spacing.lg },
  greeting: { fontSize: METRO.fontSizes.heading, fontWeight: '300', color: METRO.textPrimary, marginBottom: METRO.spacing.md, letterSpacing: -1 },
  chartCard: { backgroundColor: METRO.surface, borderRadius: 0, padding: 16, marginBottom: METRO.spacing.lg },
  row: { flexDirection: 'row', marginBottom: 0 },
  col: { flexDirection: 'column' },
  footer: { fontSize: METRO.fontSizes.caption, color: METRO.textMuted, marginTop: METRO.spacing.xl, textAlign: 'center' },
});
