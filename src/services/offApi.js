import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './storageService';

// Product reads go to the v3 API. Full text search is not part of v3, so the
// search field talks to Search-a-licious instead. Rate limits are 15 product
// reads and 10 searches a minute per IP, which is why every response is cached.
const PRODUCT_BASE = 'https://world.openfoodfacts.org/api/v3/product';
const SEARCH_BASE = 'https://search.openfoodfacts.org/search';
const USER_AGENT = 'HealthTrack/1.0 (katakammanasteja1@cityuniversity.edu)';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Browsers refuse to let script set User-Agent, so the header goes out on
// native builds only. The provider asks for it to identify the client.
const headers = () => (Platform.OS === 'web' ? {} : { 'User-Agent': USER_AGENT });

const PRODUCT_FIELDS = 'code,product_name,brands,serving_size,nutriments';

async function readCache() {
  const raw = await AsyncStorage.getItem(KEYS.cache);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export async function getCached(query, now = Date.now()) {
  const entries = await readCache();
  const hit = entries.find((e) => e.query === query);
  if (!hit) return null;
  if (now - new Date(hit.fetchedAt).getTime() > CACHE_TTL_MS) return null;
  return hit.payload;
}

export async function setCached(query, payload) {
  const entries = await readCache();
  const next = entries.filter((e) => e.query !== query);
  next.unshift({ query, payload, fetchedAt: new Date().toISOString() });
  await AsyncStorage.setItem(KEYS.cache, JSON.stringify(next.slice(0, 50)));
  return payload;
}

// Nutriment keys vary by product. Prefer the per-serving figure when the
// contributor supplied one, otherwise fall back to the per-100g value.
export function parseNutriments(product) {
  const n = (product && product.nutriments) || {};
  const pick = (base) => {
    const serving = n[`${base}_serving`];
    if (serving != null && serving !== '') return Number(serving);
    const per100 = n[`${base}_100g`];
    return per100 != null && per100 !== '' ? Number(per100) : 0;
  };
  return {
    name: product.product_name || 'Unnamed product',
    barcode: product.code || '',
    brands: product.brands || '',
    servingSize: product.serving_size || '100 g',
    calories: Math.round(pick('energy-kcal')),
    protein: Number(pick('proteins').toFixed(1)),
    carbs: Number(pick('carbohydrates').toFixed(1)),
    fat: Number(pick('fat').toFixed(1)),
    source: 'api',
  };
}

export async function fetchProductByBarcode(barcode) {
  const key = `product:${barcode}`;
  const cached = await getCached(key);
  if (cached) return { ...cached, cached: true };

  const url = `${PRODUCT_BASE}/${encodeURIComponent(barcode)}.json?fields=${PRODUCT_FIELDS}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Open Food Facts returned ${res.status}`);

  const body = await res.json();
  if (!body.product) throw new Error('No product found for that barcode');

  const parsed = parseNutriments(body.product);
  await setCached(key, parsed);
  return { ...parsed, cached: false };
}

export async function searchProduct(term, pageSize = 12) {
  const query = term.trim();
  if (query.length < 3) return [];

  const key = `search:${query.toLowerCase()}`;
  const cached = await getCached(key);
  if (cached) return cached;

  const url = `${SEARCH_BASE}?q=${encodeURIComponent(query)}&page_size=${pageSize}` +
    `&fields=code,product_name,brands,nutriments,serving_size`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Search returned ${res.status}`);

  const body = await res.json();
  const hits = (body.hits || [])
    .filter((h) => h.product_name)
    .map((h) => parseNutriments({
      ...h,
      brands: Array.isArray(h.brands) ? h.brands.join(', ') : h.brands,
    }));

  await setCached(key, hits);
  return hits;
}
