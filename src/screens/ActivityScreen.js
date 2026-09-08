import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import GoalProgress from '../components/GoalProgress';
import { colors, spacing, card } from '../theme';
import {
  KEYS,
  createRecord,
  deleteRecord,
  getCollection,
  getSettings,
} from '../services/storageService';

const WATER = [
  { label: '+250 ml', volumeMl: 250 },
  { label: '+500 ml', volumeMl: 500 },
  { label: '+750 ml', volumeMl: 750 },
];

const WORKOUTS = [
  { label: 'Walk 20', durationMinutes: 20 },
  { label: 'Run 30', durationMinutes: 30 },
  { label: 'Gym 45', durationMinutes: 45 },
];

// UC-3. Quick-add buttons keep water logging at two taps: open the tab,
// press the amount.
export default function ActivityScreen() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(null);

  const load = useCallback(async () => {
    const [rows, s] = await Promise.all([getCollection(KEYS.activity), getSettings()]);
    setEntries(rows);
    setSettings(s);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function add(fields) {
    await createRecord(KEYS.activity, fields);
    load();
  }

  async function remove(id) {
    await deleteRecord(KEYS.activity, id);
    load();
  }

  const today = new Date().toISOString().slice(0, 10);
  const todays = entries.filter((e) => e.timestamp.slice(0, 10) === today);
  const water = todays.filter((e) => e.type === 'water').reduce((s, e) => s + (e.volumeMl || 0), 0);
  const minutes = todays
    .filter((e) => e.type === 'workout')
    .reduce((s, e) => s + (e.durationMinutes || 0), 0);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={card}>
        <Text style={styles.heading}>Today's goals</Text>
        <View style={{ marginTop: spacing.md }}>
          <GoalProgress
            label="Water"
            value={water}
            goal={settings ? settings.dailyWaterGoalMl : 0}
            unit="ml"
            tint={colors.water}
          />
          <GoalProgress
            label="Active minutes"
            value={minutes}
            goal={settings ? settings.dailyActivityGoalMinutes : 0}
            unit="min"
            tint={colors.activity}
          />
        </View>
      </View>

      <View style={card}>
        <Text style={styles.heading}>Water</Text>
        <View style={styles.row}>
          {WATER.map((w) => (
            <Pressable
              key={w.label}
              style={[styles.quick, { borderColor: colors.water }]}
              onPress={() => add({ type: 'water', label: w.label, volumeMl: w.volumeMl, durationMinutes: 0 })}
            >
              <Text style={[styles.quickText, { color: colors.water }]}>{w.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={card}>
        <Text style={styles.heading}>Workout</Text>
        <View style={styles.row}>
          {WORKOUTS.map((w) => (
            <Pressable
              key={w.label}
              style={[styles.quick, { borderColor: colors.activity }]}
              onPress={() => add({
                type: 'workout',
                label: w.label,
                durationMinutes: w.durationMinutes,
                volumeMl: 0,
              })}
            >
              <Text style={[styles.quickText, { color: colors.activity }]}>{w.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={card}>
        <Text style={styles.heading}>Today's entries</Text>
        {todays.length === 0 && <Text style={styles.empty}>Nothing logged yet today.</Text>}
        {todays.map((e) => (
          <View key={e.id} style={styles.entry}>
            <Text style={styles.entryText}>
              {e.type === 'water' ? `${e.volumeMl} ml water` : `${e.label} · ${e.durationMinutes} min`}
            </Text>
            <Pressable onPress={() => remove(e.id)}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  quick: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  quickText: { fontSize: 13, fontWeight: '600' },
  empty: { fontSize: 12, color: colors.muted, marginTop: spacing.sm },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  entryText: { fontSize: 13, color: colors.text },
  remove: { fontSize: 12, color: colors.danger, fontWeight: '600' },
});
