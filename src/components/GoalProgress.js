import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function GoalProgress({ label, value, goal, unit, tint }) {
  const pct = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value.toLocaleString()} / {goal.toLocaleString()} {unit}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: tint }]} />
      </View>
      <Text style={styles.pct}>{pct}% of today's goal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  value: { fontSize: 12, color: colors.muted },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: { height: '100%' },
  pct: { fontSize: 11, color: colors.muted, marginTop: spacing.xs },
});
