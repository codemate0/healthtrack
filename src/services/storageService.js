import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  meals: '@healthtrack:meals',
  activity: '@healthtrack:activity',
  mood: '@healthtrack:mood',
  settings: '@healthtrack:settings',
  cache: '@healthtrack:cache',
};

export const DEFAULT_SETTINGS = {
  dailyCalorieGoal: 2000,
  dailyWaterGoalMl: 2500,
  dailyActivityGoalMinutes: 30,
};

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function getCollection(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // A corrupt value should not take the screen down with it.
    return [];
  }
}

export async function saveCollection(key, records) {
  await AsyncStorage.setItem(key, JSON.stringify(records));
  return records;
}

export async function createRecord(key, fields) {
  const record = { id: newId(), timestamp: new Date().toISOString(), ...fields };
  const records = await getCollection(key);
  records.unshift(record);
  await saveCollection(key, records);
  return record;
}

export async function updateRecord(key, id, changes) {
  const records = await getCollection(key);
  const i = records.findIndex((r) => r.id === id);
  if (i === -1) return null;
  records[i] = { ...records[i], ...changes, id };
  await saveCollection(key, records);
  return records[i];
}

export async function deleteRecord(key, id) {
  const records = await getCollection(key);
  const remaining = records.filter((r) => r.id !== id);
  if (remaining.length === records.length) return false;
  await saveCollection(key, remaining);
  return true;
}

export async function getSettings() {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(merged));
  return merged;
}

export function dayKey(iso) {
  return iso.slice(0, 10);
}

export function lastSevenDayKeys(today = new Date()) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// UC-5. One read across three collections, bucketed by the ISO date every
// record carries. Returns one entry per day so the chart can map straight over it.
export async function getWeeklySummary(today = new Date()) {
  const [meals, activity, mood] = await Promise.all([
    getCollection(KEYS.meals),
    getCollection(KEYS.activity),
    getCollection(KEYS.mood),
  ]);

  const days = lastSevenDayKeys(today);
  const blank = () => ({ calories: 0, waterMl: 0, activeMinutes: 0, moodScores: [] });
  const buckets = {};
  days.forEach((d) => { buckets[d] = blank(); });

  meals.forEach((m) => {
    const b = buckets[dayKey(m.timestamp)];
    if (b) b.calories += Number(m.calories) || 0;
  });

  activity.forEach((a) => {
    const b = buckets[dayKey(a.timestamp)];
    if (!b) return;
    if (a.type === 'water') b.waterMl += Number(a.volumeMl) || 0;
    else b.activeMinutes += Number(a.durationMinutes) || 0;
  });

  mood.forEach((m) => {
    const b = buckets[dayKey(m.timestamp)];
    if (b && m.score != null) b.moodScores.push(Number(m.score));
  });

  return days.map((date) => {
    const b = buckets[date];
    const mean = b.moodScores.length
      ? b.moodScores.reduce((s, n) => s + n, 0) / b.moodScores.length
      : null;
    return {
      date,
      calories: b.calories,
      waterMl: b.waterMl,
      activeMinutes: b.activeMinutes,
      mood: mean,
      entries: b.moodScores.length,
    };
  });
}

export async function clearAll() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
