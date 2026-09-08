import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  KEYS,
  DEFAULT_SETTINGS,
  clearAll,
  createRecord,
  deleteRecord,
  getCollection,
  getSettings,
  getWeeklySummary,
  lastSevenDayKeys,
  saveSettings,
  updateRecord,
} from '../src/services/storageService';

beforeEach(async () => {
  global.__mockStore.clear();
});

describe('collection CRUD', () => {
  test('an empty key reads back as an empty array', async () => {
    expect(await getCollection(KEYS.meals)).toEqual([]);
  });

  test('createRecord stamps an id and an ISO-8601 timestamp', async () => {
    const rec = await createRecord(KEYS.meals, { name: 'Oatmeal', calories: 150 });
    expect(rec.id).toEqual(expect.any(String));
    expect(rec.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(await getCollection(KEYS.meals)).toHaveLength(1);
  });

  test('updateRecord changes fields and keeps the id', async () => {
    const rec = await createRecord(KEYS.meals, { name: 'Oatmeal', calories: 150 });
    const updated = await updateRecord(KEYS.meals, rec.id, { calories: 220 });
    expect(updated.id).toBe(rec.id);
    expect(updated.calories).toBe(220);
    expect(updated.name).toBe('Oatmeal');
  });

  test('updateRecord returns null for an id that is not there', async () => {
    expect(await updateRecord(KEYS.meals, 'missing', { calories: 1 })).toBeNull();
  });

  test('deleteRecord removes exactly one record', async () => {
    const a = await createRecord(KEYS.meals, { name: 'A' });
    await createRecord(KEYS.meals, { name: 'B' });
    expect(await deleteRecord(KEYS.meals, a.id)).toBe(true);
    const left = await getCollection(KEYS.meals);
    expect(left).toHaveLength(1);
    expect(left[0].name).toBe('B');
  });

  test('deleting an id that is not there reports false', async () => {
    expect(await deleteRecord(KEYS.meals, 'missing')).toBe(false);
  });

  test('a corrupt stored value reads back as empty rather than throwing', async () => {
    await AsyncStorage.setItem(KEYS.meals, '{not json');
    expect(await getCollection(KEYS.meals)).toEqual([]);
  });
});

describe('settings', () => {
  test('defaults apply before anything is saved', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  test('a partial save is merged over the defaults', async () => {
    await saveSettings({ dailyWaterGoalMl: 3000 });
    const s = await getSettings();
    expect(s.dailyWaterGoalMl).toBe(3000);
    expect(s.dailyCalorieGoal).toBe(DEFAULT_SETTINGS.dailyCalorieGoal);
  });
});

describe('getWeeklySummary', () => {
  const today = new Date('2026-09-06T12:00:00.000Z');

  test('returns exactly seven days ending today', async () => {
    const week = await getWeeklySummary(today);
    expect(week).toHaveLength(7);
    expect(week[6].date).toBe('2026-09-06');
    expect(week[0].date).toBe('2026-08-31');
  });

  test('buckets records into the right day and sums them', async () => {
    await AsyncStorage.setItem(KEYS.meals, JSON.stringify([
      { id: '1', calories: 400, timestamp: '2026-09-06T08:00:00.000Z' },
      { id: '2', calories: 350, timestamp: '2026-09-06T19:00:00.000Z' },
      { id: '3', calories: 900, timestamp: '2026-09-04T12:00:00.000Z' },
    ]));
    await AsyncStorage.setItem(KEYS.activity, JSON.stringify([
      { id: '4', type: 'water', volumeMl: 500, timestamp: '2026-09-06T09:00:00.000Z' },
      { id: '5', type: 'workout', durationMinutes: 30, timestamp: '2026-09-06T17:00:00.000Z' },
    ]));

    const week = await getWeeklySummary(today);
    const last = week[6];
    expect(last.calories).toBe(750);
    expect(last.waterMl).toBe(500);
    expect(last.activeMinutes).toBe(30);
    expect(week[4].calories).toBe(900);
  });

  test('mood is averaged per day and null when the day has no entry', async () => {
    await AsyncStorage.setItem(KEYS.mood, JSON.stringify([
      { id: '1', score: 4, timestamp: '2026-09-06T08:00:00.000Z' },
      { id: '2', score: 2, timestamp: '2026-09-06T20:00:00.000Z' },
    ]));
    const week = await getWeeklySummary(today);
    expect(week[6].mood).toBe(3);
    expect(week[6].entries).toBe(2);
    expect(week[5].mood).toBeNull();
  });

  test('records older than seven days are left out', async () => {
    await AsyncStorage.setItem(KEYS.meals, JSON.stringify([
      { id: '1', calories: 500, timestamp: '2026-01-01T08:00:00.000Z' },
    ]));
    const week = await getWeeklySummary(today);
    expect(week.reduce((s, d) => s + d.calories, 0)).toBe(0);
  });

  test('lastSevenDayKeys is ordered oldest to newest', async () => {
    const days = lastSevenDayKeys(today);
    expect(days).toEqual([...days].sort());
  });
});

describe('clearAll', () => {
  test('removes every collection', async () => {
    await createRecord(KEYS.meals, { name: 'A' });
    await createRecord(KEYS.mood, { score: 3 });
    await saveSettings({ dailyCalorieGoal: 1800 });
    await clearAll();
    expect(await getCollection(KEYS.meals)).toEqual([]);
    expect(await getCollection(KEYS.mood)).toEqual([]);
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
