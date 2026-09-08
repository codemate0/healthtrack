import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const SCALE = [
  { score: 1, label: 'Low' },
  { score: 2, label: 'Down' },
  { score: 3, label: 'Okay' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Great' },
];

// UC-4. One tap writes the record. There is no confirm step and no note
// field in the way, because the research on attrition says every extra
// step costs entries.
export default function MoodPicker({ selected, onSelect }) {
  return (
    <View style={styles.row}>
      {SCALE.map((m) => {
        const on = selected === m.score;
        return (
          <Pressable
            key={m.score}
            onPress={() => onSelect(m.score)}
            style={[styles.item, on && styles.itemOn]}
            accessibilityRole="button"
            accessibilityLabel={`Mood ${m.label}`}
          >
            <Text style={[styles.score, on && styles.scoreOn]}>{m.score}</Text>
            <Text style={[styles.label, on && styles.labelOn]}>{m.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  itemOn: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  score: { fontSize: 17, fontWeight: '600', color: colors.text },
  scoreOn: { color: colors.accent },
  label: { fontSize: 10, color: colors.muted, marginTop: 2 },
  labelOn: { color: colors.accent },
});
