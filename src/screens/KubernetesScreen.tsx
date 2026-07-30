import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { k8sApi, api } from '../api';
import { METRO } from '../theme';

const STATUS_COLOR: Record<string, string> = {
  RUNNING: METRO.accents.purple, PROVISIONING: METRO.accents.amber,
  FAILED: '#EF4444', DELETED: METRO.textMuted,
};

export default function KubernetesScreen() {
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await k8sApi.list();
      setClusters(data.data.filter((c: any) => c.status !== 'DELETED'));
    } catch { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const createCluster = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await k8sApi.create({ name: name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'), plan: 'STARTER' });
      setShowCreate(false);
      setName('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create cluster');
    }
    setCreating(false);
  };

  const shareKubeconfig = async (id: string, clusterName: string) => {
    try {
      const res = await api.get(`/kubernetes/${id}/kubeconfig`);
      await Share.share({ message: res.data, title: `${clusterName}-kubeconfig.yaml` });
    } catch {
      Alert.alert('Not ready yet', 'Kubeconfig is not available until the cluster finishes provisioning.');
    }
  };

  const confirmDelete = (id: string, clusterName: string) => {
    Alert.alert('Delete cluster?', `This will permanently delete "${clusterName}".`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await k8sApi.delete(id); load(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>kubernetes</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={METRO.accents.purple} />
      ) : (
        <FlatList
          data={clusters}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={METRO.accents.purple} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No clusters yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
                <Text style={styles.emptyBtnText}>CREATE CLUSTER</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.statusStrip, { backgroundColor: STATUS_COLOR[item.status] || METRO.textMuted }]} />
              <View style={styles.rowContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.nodeCount} node{item.nodeCount !== 1 ? 's' : ''} · {item.plan}</Text>
                <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                {item.status === 'RUNNING' && (
                  <TouchableOpacity onPress={() => shareKubeconfig(item.id, item.name)}>
                    <Text style={styles.revealLink}>Share kubeconfig</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmDelete(item.id, item.name)}>
                <Text style={styles.actionText}>DEL</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New Cluster</Text>
            <Text style={styles.modalNote}>Clusters take 10-15 minutes to become ready.</Text>
            <TextInput style={styles.modalInput} placeholder="cluster-name" placeholderTextColor={METRO.textMuted} value={name} onChangeText={setName} autoCapitalize="none" />
            <TouchableOpacity style={styles.modalBtn} onPress={createCluster} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>CREATE</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowCreate(false)} style={{ marginTop: 12 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: METRO.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  title: { fontSize: 34, fontWeight: '300', color: '#fff', letterSpacing: -0.5 },
  addBtn: { width: 40, height: 40, backgroundColor: METRO.accents.purple, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  row: { flexDirection: 'row', backgroundColor: METRO.surface, marginBottom: 8 },
  statusStrip: { width: 5 },
  rowContent: { flex: 1, padding: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  meta: { color: METRO.textSecondary, fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  revealLink: { color: METRO.accents.purple, fontSize: 12, marginTop: 6, fontWeight: '600' },
  actionBtn: { justifyContent: 'center', paddingHorizontal: 14 },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)' },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: METRO.textSecondary, fontSize: 15, marginBottom: 20 },
  emptyBtn: { backgroundColor: METRO.accents.purple, paddingVertical: 14, paddingHorizontal: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: METRO.surface, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 8 },
  modalNote: { color: METRO.textSecondary, fontSize: 12, marginBottom: 20 },
  modalInput: { borderBottomWidth: 2, borderBottomColor: METRO.accents.purple, color: '#fff', fontSize: 17, paddingVertical: 10, marginBottom: 20 },
  modalBtn: { backgroundColor: METRO.accents.purple, paddingVertical: 16, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  cancelText: { color: METRO.textSecondary, textAlign: 'center', fontSize: 14 },
});
