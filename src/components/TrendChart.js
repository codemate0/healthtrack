import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

// Bars are plain views sized by percentage. TP02 ruled out a charting
// library so the build keeps one fewer native module.
export default function TrendChart({ title, data, valueKey, unit, tint, goal }) {
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const peak = Math.max(...values, goal || 0, 1);
  const total = values.reduce((s, n) => s + n, 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.total}>{total.toLocaleString()} {unit}</Text>
      </View>

      <View style={styles.plot}>
        {data.map((d, i) => {
          const pct = Math.round((values[i] / peak) * 100);
          return (
            <View key={d.date} style={styles.col}>
              <View style={styles.track}>
                <View
                  style={[styles.bar, { height: `${Math.max(pct, 2)}%`, backgroundColor: tint }]}
                />
              </View>
              <Text style={styles.tick}>{weekday(d.date)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function weekday(iso) {
  const names = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  return names[new Date(`${iso}T00:00:00`).getDay()];
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontSize: 13, fontWeight: '600', color: colors.text },
  total: { fontSize: 12, color: colors.muted },
  plot: { flexDirection: 'row', height: 92, marginTop: spacing.sm },
  col: { flex: 1, alignItems: 'center' },
  track: { flex: 1, width: 18, justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: 4 },
  tick: { fontSize: 10, color: colors.muted, marginTop: spacing.xs },
});
