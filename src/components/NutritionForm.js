import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

const FIELDS = [
  { key: 'name', label: 'Food name', numeric: false },
  { key: 'servingSize', label: 'Serving size', numeric: false },
  { key: 'calories', label: 'Calories (kcal)', numeric: true },
  { key: 'protein', label: 'Protein (g)', numeric: true },
  { key: 'carbs', label: 'Carbs (g)', numeric: true },
  { key: 'fat', label: 'Fat (g)', numeric: true },
];

export default function NutritionForm({ draft, onChange, onSubmit, submitLabel }) {
  const valid = String(draft.name || '').trim().length > 0;

  return (
    <View>
      {FIELDS.map((f) => (
        <View key={f.key} style={styles.field}>
          <Text style={styles.label}>{f.label}</Text>
          <TextInput
            value={String(draft[f.key] ?? '')}
            onChangeText={(t) => onChange(f.key, f.numeric ? t.replace(/[^0-9.]/g, '') : t)}
            keyboardType={f.numeric ? 'numeric' : 'default'}
            style={styles.input}
            accessibilityLabel={f.label}
          />
        </View>
      ))}
      <Pressable
        onPress={onSubmit}
        disabled={!valid}
        style={[styles.submit, !valid && styles.submitOff]}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { fontSize: 12, color: colors.muted, marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  submit: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitOff: { opacity: 0.4 },
  submitText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
