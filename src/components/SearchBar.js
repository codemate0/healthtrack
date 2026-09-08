import { View, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function SearchBar({ value, onChange, busy, placeholder }) {
  return (
    <View style={styles.wrap}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoCorrect={false}
        accessibilityLabel="Search the food database"
      />
      {busy ? <ActivityIndicator size="small" color={colors.accent} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: 14, color: colors.text },
});
