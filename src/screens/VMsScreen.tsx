import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vmsApi } from '../api';
import { METRO } from '../theme';

// Real VM management — list, create, start/stop, delete. Same
// backend as the web console. Metro-styled list rows (flat,
// sharp-edged, accent-colored status strip) instead of Material cards.

const STATUS_COLOR: Record<string, string> = {
  RUNNING: METRO.accents.green,
  STOPPED: METRO.textMuted,
  PROVISIONING: METRO.accents.amber,
  FAILED: '#EF4444',
  DELETED: METRO.textMuted,
};

export default function VMsScreen() {
  const [vms, setVms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await vmsApi.list();
      setVms(data.data.filter((v: any) => v.status !== 'DELETED'));
    } catch { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const createVm = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await vmsApi.create({ name: name.trim(), plan: 'STARTER', os: 'ubuntu-24.04' });
      setShowCreate(false);
      setName('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create VM');
    }
    setCreating(false);
  };

  const confirmDelete = (id: string, vmName: string) => {
    Alert.alert('Delete VM?', `This will permanently delete "${vmName}" and all its data.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await vmsApi.delete(id); load(); } },
    ]);
  };

  const toggleAction = async (vm: any) => {
    if (vm.status === 'RUNNING') await vmsApi.stop(vm.id);
    else if (vm.status === 'STOPPED') await vmsApi.start(vm.id);
    load();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>vms</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={METRO.accents.green} />
      ) : (
        <FlatList
          data={vms}
          keyExtractor={(v) => v.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={METRO.accents.green} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No VMs yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
                <Text style={styles.emptyBtnText}>DEPLOY YOUR FIRST VM</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.statusStrip, { backgroundColor: STATUS_COLOR[item.status] || METRO.textMuted }]} />
              <View style={styles.rowContent}>
                <Text style={styles.vmName}>{item.name}</Text>
                <Text style={styles.vmMeta}>{item.vcpus} vCPU · {(item.ramMb / 1024).toFixed(0)}GB RAM{item.ipv4 ? ` · ${item.ipv4}` : ''}</Text>
                <Text style={[styles.vmStatus, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
              </View>
              <View style={styles.actions}>
                {(item.status === 'RUNNING' || item.status === 'STOPPED') && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleAction(item)}>
                    <Text style={styles.actionText}>{item.status === 'RUNNING' ? 'STOP' : 'START'}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmDelete(item.id, item.name)}>
                  <Text style={styles.actionText}>DEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New VM</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="vm-name"
              placeholderTextColor={METRO.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.modalBtn} onPress={createVm} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>DEPLOY</Text>}
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
  addBtn: { width: 40, height: 40, backgroundColor: METRO.accents.green, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  row: { flexDirection: 'row', backgroundColor: METRO.surface, marginBottom: 8, minHeight: 76 },
  statusStrip: { width: 5 },
  rowContent: { flex: 1, padding: 12, justifyContent: 'center' },
  vmName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  vmMeta: { color: METRO.textSecondary, fontSize: 12, marginTop: 2 },
  vmStatus: { fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  actions: { justifyContent: 'center', paddingRight: 12, gap: 6 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 6, paddingHorizontal: 10 },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)' },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: METRO.textSecondary, fontSize: 15, marginBottom: 20 },
  emptyBtn: { backgroundColor: METRO.accents.green, paddingVertical: 14, paddingHorizontal: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: METRO.surface, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 20 },
  modalInput: { borderBottomWidth: 2, borderBottomColor: METRO.accents.green, color: '#fff', fontSize: 17, paddingVertical: 10, marginBottom: 20 },
  modalBtn: { backgroundColor: METRO.accents.green, paddingVertical: 16, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  cancelText: { color: METRO.textSecondary, textAlign: 'center', fontSize: 14 },
});
