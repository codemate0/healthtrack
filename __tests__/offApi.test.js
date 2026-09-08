import fixture from './fixtures/product.json';
import {
  fetchProductByBarcode,
  getCached,
  parseNutriments,
  searchProduct,
  setCached,
} from '../src/services/offApi';

function mockOk(body) {
  return jest.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(body) }));
}

beforeEach(() => {
  global.__mockStore.clear();
  global.fetch = mockOk(fixture);
});

describe('parseNutriments', () => {
  test('prefers the per-serving figure when the contributor gave one', () => {
    const parsed = parseNutriments(fixture.product);
    expect(parsed.calories).toBe(200);
    expect(parsed.protein).toBe(4);
    expect(parsed.source).toBe('api');
  });

  test('falls back to per-100g when there is no serving value', () => {
    const product = {
      product_name: 'Test',
      nutriments: { 'energy-kcal_100g': 120, proteins_100g: 3 },
    };
    const parsed = parseNutriments(product);
    expect(parsed.calories).toBe(120);
    expect(parsed.protein).toBe(3);
  });

  test('a product with no nutriments yields zeros rather than NaN', () => {
    const parsed = parseNutriments({ product_name: 'Bare' });
    expect(parsed.calories).toBe(0);
    expect(parsed.carbs).toBe(0);
    expect(Number.isNaN(parsed.fat)).toBe(false);
  });
});

describe('fetchProductByBarcode', () => {
  test('calls the v3 endpoint with the required User-Agent', async () => {
    await fetchProductByBarcode('0737628064502');
    const [url, opts] = global.fetch.mock.calls[0];
    expect(url).toContain('/api/v3/product/0737628064502.json');
    expect(opts.headers['User-Agent']).toMatch(/^HealthTrack\/1\.0 \(.+@.+\)$/);
  });

  test('a second lookup is served from cache and makes no request', async () => {
    const first = await fetchProductByBarcode('0737628064502');
    expect(first.cached).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const second = await fetchProductByBarcode('0737628064502');
    expect(second.cached).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('a non-200 response raises with the status attached', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 429, json: () => ({}) }));
    await expect(fetchProductByBarcode('123')).rejects.toThrow('429');
  });

  test('a barcode with no product raises a readable error', async () => {
    global.fetch = mockOk({ code: '123', errors: [], product: null });
    await expect(fetchProductByBarcode('123')).rejects.toThrow('No product found');
  });
});

describe('searchProduct', () => {
  const hits = {
    hits: [
      { code: '1', product_name: 'Instant oatmeal', brands: ['Quaker'], nutriments: { 'energy-kcal_100g': 370 } },
      { code: '2', product_name: '', brands: [], nutriments: {} },
    ],
  };

  test('a term under three characters makes no request', async () => {
    global.fetch = mockOk(hits);
    expect(await searchProduct('oa')).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('search goes to Search-a-licious, not the v3 product API', async () => {
    global.fetch = mockOk(hits);
    await searchProduct('oatmeal');
    expect(global.fetch.mock.calls[0][0]).toContain('search.openfoodfacts.org/search');
  });

  test('hits with no product name are dropped', async () => {
    global.fetch = mockOk(hits);
    const results = await searchProduct('oatmeal');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Instant oatmeal');
    expect(results[0].brands).toBe('Quaker');
  });

  test('a repeated search is served from cache', async () => {
    global.fetch = mockOk(hits);
    await searchProduct('oatmeal');
    await searchProduct('oatmeal');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('cache expiry', () => {
  test('an entry older than 24 hours is treated as a miss', async () => {
    await setCached('product:1', { name: 'Old' });
    const future = Date.now() + 25 * 60 * 60 * 1000;
    expect(await getCached('product:1', future)).toBeNull();
    expect(await getCached('product:1')).not.toBeNull();
  });
});
