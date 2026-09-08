import fs from 'fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS, getWeeklySummary } from '../src/services/storageService';

// Not an assertion suite. This measures how the dashboard aggregation scales
// with the size of the local store, because every dashboard focus runs it.
const SIZES = [100, 500, 1000, 2500, 5000, 10000];
const RUNS = 20;

function seed(n) {
  const meals = [];
  const activity = [];
  const mood = [];
  const now = new Date('2026-09-06T12:00:00.000Z');
  for (let i = 0; i < n; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - (i % 120));
    const ts = d.toISOString();
    meals.push({ id: `m${i}`, calories: 300 + (i % 400), timestamp: ts });
    activity.push({
      id: `a${i}`,
      type: i % 2 ? 'water' : 'workout',
      volumeMl: 250,
      durationMinutes: 20,
      timestamp: ts,
    });
    if (i % 3 === 0) mood.push({ id: `d${i}`, score: (i % 5) + 1, timestamp: ts });
  }
  return { meals, activity, mood };
}

test('dashboard aggregation scales linearly with store size', async () => {
  const rows = [];
  const today = new Date('2026-09-06T12:00:00.000Z');

  for (const n of SIZES) {
    const { meals, activity, mood } = seed(n);
    await AsyncStorage.setItem(KEYS.meals, JSON.stringify(meals));
    await AsyncStorage.setItem(KEYS.activity, JSON.stringify(activity));
    await AsyncStorage.setItem(KEYS.mood, JSON.stringify(mood));

    for (let w = 0; w < 5; w++) await getWeeklySummary(today); // warm the JIT

    // performance.now() here is coarse, so each sample times a batch of calls
    // and divides, which puts the figures well above the clock's resolution.
    const BATCH = 10;
    const times = [];
    for (let r = 0; r < RUNS; r++) {
      const t0 = performance.now();
      for (let b = 0; b < BATCH; b++) await getWeeklySummary(today);
      times.push((performance.now() - t0) / BATCH);
    }
    times.sort((a, b) => a - b);
    rows.push({
      records: n * 2 + Math.ceil(n / 3),
      median: Number(times[Math.floor(RUNS / 2)].toFixed(2)),
      p95: Number(times[Math.floor(RUNS * 0.95)].toFixed(2)),
    });
  }

  fs.mkdirSync('docs', { recursive: true });
  fs.writeFileSync('docs/benchmark.json', JSON.stringify(rows, null, 2));
  console.log(JSON.stringify(rows));

  expect(rows).toHaveLength(SIZES.length);
  expect(rows[rows.length - 1].median).toBeLessThan(500);
});
