// AsyncStorage is replaced by an in-memory map so the service tests run
// without a device and without touching real storage.
const mockStore = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k) => Promise.resolve(mockStore.has(k) ? mockStore.get(k) : null)),
  setItem: jest.fn((k, v) => { mockStore.set(k, v); return Promise.resolve(); }),
  removeItem: jest.fn((k) => { mockStore.delete(k); return Promise.resolve(); }),
  multiRemove: jest.fn((keys) => { keys.forEach((k) => mockStore.delete(k)); return Promise.resolve(); }),
  clear: jest.fn(() => { mockStore.clear(); return Promise.resolve(); }),
}));

global.__mockStore = mockStore;
