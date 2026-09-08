import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function MealRow({ meal, onEdit, onDelete }) {
  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
        <Text style={styles.meta}>
          {meal.calories} kcal · P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
        </Text>
        <Text style={styles.stamp}>
          {new Date(meal.timestamp).toLocaleDateString()} · {meal.source === 'api' ? 'database' : 'manual'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={() => onEdit(meal)} style={styles.btn} accessibilityLabel={`Edit ${meal.name}`}>
          <Text style={styles.btnText}>Edit</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(meal)} style={styles.btn} accessibilityLabel={`Delete ${meal.name}`}>
          <Text style={[styles.btnText, { color: colors.danger }]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  main: { flex: 1, paddingRight: spacing.sm },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  stamp: { fontSize: 11, color: colors.muted, marginTop: 2 },
  actions: { alignItems: 'flex-end', gap: spacing.xs },
  btn: { paddingVertical: 4, paddingHorizontal: spacing.sm },
  btnText: { fontSize: 12, fontWeight: '600', color: colors.accent },
});
