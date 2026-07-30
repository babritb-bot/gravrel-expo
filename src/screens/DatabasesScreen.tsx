import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databasesApi } from '../api';
import { METRO } from '../theme';

const STATUS_COLOR: Record<string, string> = {
  RUNNING: METRO.accents.blue, PROVISIONING: METRO.accents.amber,
  FAILED: '#EF4444', DELETED: METRO.textMuted,
};

export default function DatabasesScreen() {
  const [dbs, setDbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const { data } = await databasesApi.list();
      setDbs(data.data.filter((d: any) => d.status !== 'DELETED'));
    } catch { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const createDb = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await databasesApi.create({ name: name.trim(), engine: 'POSTGRESQL', plan: 'STARTER' });
      setShowCreate(false);
      setName('');
      load();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create database');
    }
    setCreating(false);
  };

  const reveal = async (id: string) => {
    const { data } = await databasesApi.get(id);
    setRevealed((prev) => ({ ...prev, [id]: data.data.connectionString }));
  };

  const confirmDelete = (id: string, dbName: string) => {
    Alert.alert('Delete database?', `This will permanently delete "${dbName}" and all its data.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await databasesApi.delete(id); load(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>databases</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={METRO.accents.blue} />
      ) : (
        <FlatList
          data={dbs}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={METRO.accents.blue} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No databases yet</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
                <Text style={styles.emptyBtnText}>CREATE DATABASE</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.statusStrip, { backgroundColor: STATUS_COLOR[item.status] || METRO.textMuted }]} />
              <View style={styles.rowContent}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.engine} · {item.plan}</Text>
                <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
                {item.host && !revealed[item.id] && (
                  <TouchableOpacity onPress={() => reveal(item.id)}>
                    <Text style={styles.revealLink}>Show connection string</Text>
                  </TouchableOpacity>
                )}
                {revealed[item.id] && (
                  <TouchableOpacity onPress={() => Clipboard.setString(revealed[item.id])}>
                    <Text style={styles.connString} numberOfLines={2}>{revealed[item.id]} (tap to copy)</Text>
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
            <Text style={styles.modalTitle}>New Database</Text>
            <TextInput style={styles.modalInput} placeholder="db-name" placeholderTextColor={METRO.textMuted} value={name} onChangeText={setName} autoCapitalize="none" />
            <TouchableOpacity style={styles.modalBtn} onPress={createDb} disabled={creating}>
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
  addBtn: { width: 40, height: 40, backgroundColor: METRO.accents.blue, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  row: { flexDirection: 'row', backgroundColor: METRO.surface, marginBottom: 8 },
  statusStrip: { width: 5 },
  rowContent: { flex: 1, padding: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  meta: { color: METRO.textSecondary, fontSize: 12, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '700', marginTop: 4, letterSpacing: 0.5 },
  revealLink: { color: METRO.accents.blue, fontSize: 12, marginTop: 6, fontWeight: '600' },
  connString: { color: METRO.accents.green, fontSize: 10, marginTop: 6, fontFamily: 'monospace' },
  actionBtn: { justifyContent: 'center', paddingHorizontal: 14 },
  deleteBtn: { backgroundColor: 'rgba(239,68,68,0.15)' },
  actionText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: METRO.textSecondary, fontSize: 15, marginBottom: 20 },
  emptyBtn: { backgroundColor: METRO.accents.blue, paddingVertical: 14, paddingHorizontal: 24 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: METRO.surface, padding: 24, paddingBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '300', marginBottom: 20 },
  modalInput: { borderBottomWidth: 2, borderBottomColor: METRO.accents.blue, color: '#fff', fontSize: 17, paddingVertical: 10, marginBottom: 20 },
  modalBtn: { backgroundColor: METRO.accents.blue, paddingVertical: 16, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  cancelText: { color: METRO.textSecondary, textAlign: 'center', fontSize: 14 },
});
