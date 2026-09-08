import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TrendChart from '../components/TrendChart';
import MoodPicker from '../components/MoodPicker';
import { colors, spacing, card } from '../theme';
import {
  KEYS,
  createRecord,
  getCollection,
  getSettings,
  getWeeklySummary,
  dayKey,
} from '../services/storageService';

export default function DashboardScreen() {
  const [week, setWeek] = useState([]);
  const [settings, setSettings] = useState(null);
  const [todayMood, setTodayMood] = useState(null);

  const load = useCallback(async () => {
    const [summary, s, moods] = await Promise.all([
      getWeeklySummary(),
      getSettings(),
      getCollection(KEYS.mood),
    ]);
    setWeek(summary);
    setSettings(s);
    const today = new Date().toISOString().slice(0, 10);
    const entry = moods.find((m) => dayKey(m.timestamp) === today);
    setTodayMood(entry ? entry.score : null);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function pickMood(score) {
    setTodayMood(score);
    await createRecord(KEYS.mood, { score, note: '' });
    load();
  }

  const today = week[week.length - 1] || { calories: 0, waterMl: 0, activeMinutes: 0 };
  const logged = week.filter((d) => d.entries > 0).length;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={card}>
        <Text style={styles.heading}>How are you today?</Text>
        <Text style={styles.sub}>One tap. You can change it any time.</Text>
        <View style={{ marginTop: spacing.md }}>
          <MoodPicker selected={todayMood} onSelect={pickMood} />
        </View>
        <Text style={styles.footnote}>
          {logged} of the last 7 days have a mood entry
        </Text>
      </View>

      <View style={card}>
        <Text style={styles.heading}>Today</Text>
        <View style={styles.tiles}>
          <Tile label="Calories" value={today.calories} unit="kcal" />
          <Tile label="Water" value={today.waterMl} unit="ml" />
          <Tile label="Active" value={today.activeMinutes} unit="min" />
        </View>
      </View>

      <View style={card}>
        <Text style={styles.heading}>Last seven days</Text>
        {week.length > 0 && (
          <View style={{ marginTop: spacing.md }}>
            <TrendChart
              title="Calories"
              data={week}
              valueKey="calories"
              unit="kcal"
              tint={colors.accent}
              goal={settings ? settings.dailyCalorieGoal : 0}
            />
            <TrendChart
              title="Water"
              data={week}
              valueKey="waterMl"
              unit="ml"
              tint={colors.water}
              goal={settings ? settings.dailyWaterGoalMl : 0}
            />
            <TrendChart
              title="Active minutes"
              data={week}
              valueKey="activeMinutes"
              unit="min"
              tint={colors.activity}
              goal={settings ? settings.dailyActivityGoalMinutes : 0}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Tile({ label, value, unit }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileValue}>{value.toLocaleString()}</Text>
      <Text style={styles.tileUnit}>{unit}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  footnote: { fontSize: 11, color: colors.muted, marginTop: spacing.md },
  tiles: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  tile: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tileValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  tileUnit: { fontSize: 10, color: colors.muted },
  tileLabel: { fontSize: 11, color: colors.muted, marginTop: spacing.xs },
});
