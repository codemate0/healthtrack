import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import SearchBar from '../components/SearchBar';
import NutritionForm from '../components/NutritionForm';
import { colors, spacing } from '../theme';
import { KEYS, createRecord, updateRecord } from '../services/storageService';
import { searchProduct } from '../services/offApi';

const BLANK = {
  name: '', servingSize: '', calories: '', protein: '', carbs: '', fat: '',
  barcode: '', source: 'manual',
};

// UC-1. Search is debounced rather than fired per keystroke, because the
// provider allows only ten searches a minute.
const DEBOUNCE_MS = 600;

export default function MealDetailScreen({ route, navigation }) {
  const editing = route.params && route.params.meal;
  const [draft, setDraft] = useState(editing ? { ...editing } : { ...BLANK });
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const timer = useRef(null);

  const runSearch = useCallback(async (q) => {
    if (q.trim().length < 3) { setResults([]); return; }
    setBusy(true);
    try {
      const hits = await searchProduct(q);
      setResults(hits);
      setNote(hits.length ? '' : 'Nothing found. You can still enter it by hand.');
    } catch (e) {
      setResults([]);
      setNote(`Search unavailable (${e.message}). Enter it by hand.`);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runSearch(term), DEBOUNCE_MS);
    return () => clearTimeout(timer.current);
  }, [term, runSearch]);

  function choose(hit) {
    setDraft({ ...hit });
    setResults([]);
    setTerm('');
  }

  function change(key, value) {
    setDraft((d) => ({ ...d, [key]: value, source: key === 'name' && !editing ? d.source : d.source }));
  }

  async function submit() {
    const payload = {
      name: draft.name.trim(),
      barcode: draft.barcode || '',
      servingSize: draft.servingSize || '',
      calories: Number(draft.calories) || 0,
      protein: Number(draft.protein) || 0,
      carbs: Number(draft.carbs) || 0,
      fat: Number(draft.fat) || 0,
      source: draft.source || 'manual',
    };
    if (editing) await updateRecord(KEYS.meals, editing.id, payload);
    else await createRecord(KEYS.meals, payload);
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {!editing && (
        <View style={styles.block}>
          <Text style={styles.heading}>Search the food database</Text>
          <View style={{ marginTop: spacing.sm }}>
            <SearchBar
              value={term}
              onChange={setTerm}
              busy={busy}
              placeholder="e.g. oatmeal"
            />
          </View>
          {note ? <Text style={styles.note}>{note}</Text> : null}
          {results.map((r) => (
            <Pressable key={r.barcode || r.name} style={styles.hit} onPress={() => choose(r)}>
              <Text style={styles.hitName} numberOfLines={1}>{r.name}</Text>
              <Text style={styles.hitMeta}>
                {r.brands ? `${r.brands} · ` : ''}{r.calories} kcal
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.block}>
        <Text style={styles.heading}>{editing ? 'Edit entry' : 'Nutrition'}</Text>
        <Text style={styles.sub}>
          {draft.source === 'api' ? 'Filled from the database. You can correct anything.' : 'Manual entry.'}
        </Text>
        <View style={{ marginTop: spacing.md }}>
          <NutritionForm
            draft={draft}
            onChange={change}
            onSubmit={submit}
            submitLabel={editing ? 'Save changes' : 'Add to log'}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  block: { marginBottom: spacing.xl },
  heading: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  note: { fontSize: 12, color: colors.muted, marginTop: spacing.sm },
  hit: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  hitName: { fontSize: 13, fontWeight: '600', color: colors.text },
  hitMeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
});
