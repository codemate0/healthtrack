import { useCallback, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, card } from '../theme';
import {
  DEFAULT_SETTINGS,
  clearAll,
  getSettings,
  saveSettings,
} from '../services/storageService';

const GOALS = [
  { key: 'dailyCalorieGoal', label: 'Daily calories (kcal)' },
  { key: 'dailyWaterGoalMl', label: 'Daily water (ml)' },
  { key: 'dailyActivityGoalMinutes', label: 'Daily active minutes' },
];

export default function SettingsScreen() {
  const [form, setForm] = useState(DEFAULT_SETTINGS);
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    setForm(await getSettings());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function persist() {
    const clean = {};
    GOALS.forEach((g) => { clean[g.key] = Number(form[g.key]) || DEFAULT_SETTINGS[g.key]; });
    await saveSettings(clean);
    setForm(clean);
    setStatus('Goals saved.');
  }

  async function wipe() {
    await clearAll();
    setForm(DEFAULT_SETTINGS);
    setStatus('All local data cleared.');
  }

  // Clearing is the one action here that cannot be undone, so it asks first.
  function confirmWipe() {
    const message =
      'Every meal, activity and mood record on this device is removed. This cannot be undone.';
    if (Platform.OS === 'web') {
      // Alert is not implemented in the web build.
      if (window.confirm(`Clear all data?\n\n${message}`)) wipe();
      return;
    }
    Alert.alert('Clear all data?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: wipe },
    ]);
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={card}>
        <Text style={styles.heading}>Daily goals</Text>
        <Text style={styles.sub}>Used by the progress bars and the dashboard charts.</Text>
        <View style={{ marginTop: spacing.md }}>
          {GOALS.map((g) => (
            <View key={g.key} style={styles.field}>
              <Text style={styles.label}>{g.label}</Text>
              <TextInput
                value={String(form[g.key] ?? '')}
                onChangeText={(t) => setForm((f) => ({ ...f, [g.key]: t.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
                style={styles.input}
                accessibilityLabel={g.label}
              />
            </View>
          ))}
          <Pressable style={styles.save} onPress={persist}>
            <Text style={styles.saveText}>Save goals</Text>
          </Pressable>
        </View>
      </View>

      <View style={card}>
        <Text style={styles.heading}>Your data</Text>
        <Text style={styles.sub}>
          Everything stays on this device. There is no account and nothing is uploaded.
        </Text>
        <Pressable style={styles.clear} onPress={confirmWipe}>
          <Text style={styles.clearText}>Clear all data</Text>
        </Pressable>
      </View>

      {status ? <Text style={styles.status}>{status}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.muted, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  save: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  clear: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  clearText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  status: { fontSize: 12, color: colors.accent, textAlign: 'center' },
});
