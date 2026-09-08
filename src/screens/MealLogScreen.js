import { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MealRow from '../components/MealRow';
import { colors, spacing } from '../theme';
import { KEYS, getCollection, deleteRecord } from '../services/storageService';

// UC-2. Nothing here touches the network, so the list and both edit and
// delete keep working with no connection.
export default function MealLogScreen({ navigation }) {
  const [meals, setMeals] = useState([]);

  const load = useCallback(async () => {
    setMeals(await getCollection(KEYS.meals));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function remove(meal) {
    await deleteRecord(KEYS.meals, meal.id);
    load();
  }

  const dayTotal = meals
    .filter((m) => m.timestamp.slice(0, 10) === new Date().toISOString().slice(0, 10))
    .reduce((s, m) => s + (Number(m.calories) || 0), 0);

  return (
    <View style={styles.page}>
      <View style={styles.bar}>
        <Text style={styles.barText}>{dayTotal.toLocaleString()} kcal logged today</Text>
        <Pressable style={styles.add} onPress={() => navigation.navigate('MealDetail', {})}>
          <Text style={styles.addText}>Add meal</Text>
        </Pressable>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MealRow
            meal={item}
            onEdit={(m) => navigation.navigate('MealDetail', { meal: m })}
            onDelete={remove}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No meals yet</Text>
            <Text style={styles.emptyBody}>
              Search the food database, or type the numbers in yourself.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  barText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  add: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  list: { padding: spacing.lg },
  empty: { alignItems: 'center', paddingTop: spacing.xl * 2 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  emptyBody: { fontSize: 12, color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
});
