import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storageApi } from '../api';
import { METRO } from '../theme';

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export default function StorageScreen() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await storageApi.buckets();
      setBuckets(data.data);
    } catch { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const createBucket = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await storageApi.create({ name: name.trim().toLowerCase(), plan: 'STARTER' });
      setShowCreate(false);
      setName('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create bucket');
    }
    setCreating(false);
  };

  const confirmDelete = (bucketName: string) => {
    Alert.alert('Delete bucket?', `This will permanently delete "${bucketName}" and all files in it.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await storageApi.delete(bucketName); load(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>storage</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={METRO.accents.amber} />
      ) : (
        <FlatList
          data={buckets}
          keyExtractor={(b) => b.name}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={METRO.accents.amber} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No storage buckets yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
                <Text style={styles.emptyBtnText}>CREATE BUCKET</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const used = Number(item.usedBytes || 0);
            const limit = Number(item.limitBytes || 1);
            const pct = Math.min((used / limit) * 100, 100);
            return (
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>{formatBytes(used)} used · {item.plan}</Text>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: pct > 90 ? '#EF4444' : METRO.accents.amber }]} />
                  </View>
                </View>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => confirmDelete(item.name)}>
                  <Text style={styles.actionText}>DEL</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New Bucket</Text>
            <TextInput style={styles.modalInput} placeholder="bucket-name" placeholderTextColor={METRO.textMuted} value={name} onChangeText={setName} autoCapitalize="none" />
            <TouchableOpacity style={styles.modalBtn} onPress={createBucket} disabled={creating}>
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
  addBtn: { width: 40, height: 40, backgroundColor: METRO.accents.amber, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  row: { flexDirection: 'row', backgroundColor: METRO.surface, marginBottom: 8 },
  rowContent: { flex: 1, padding: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  meta: { color: METRO.textSecondary, fontSize: 12, marginTop: 2, marginBottom: 8 },
  barBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  barFill: { height: 4 },
  actionBtn: { justifyContent: 'center', paddingHorizontal: 14 },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)' },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: METRO.textSecondary, fontSize: 15, marginBottom: 20 },
  emptyBtn: { backgroundColor: METRO.accents.amber, paddingVertical: 14, paddingHorizontal: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: METRO.surface, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 20 },
  modalInput: { borderBottomWidth: 2, borderBottomColor: METRO.accents.amber, color: '#fff', fontSize: 17, paddingVertical: 10, marginBottom: 20 },
  modalBtn: { backgroundColor: METRO.accents.amber, paddingVertical: 16, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  cancelText: { color: METRO.textSecondary, textAlign: 'center', fontSize: 14 },
});
