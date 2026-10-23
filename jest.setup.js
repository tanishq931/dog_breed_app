/* eslint-env jest */

const storageCache = new Map();

const mockAsyncStorage = {
  getItem: jest.fn(async (key) => storageCache.get(key) ?? null),
  setItem: jest.fn(async (key, value) => {
    storageCache.set(key, String(value));
  }),
  removeItem: jest.fn(async (key) => {
    storageCache.delete(key);
  }),
  clear: jest.fn(async () => {
    storageCache.clear();
  }),
  getAllKeys: jest.fn(async () => Array.from(storageCache.keys())),
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(async () => ({
      isConnected: true,
      isInternetReachable: true,
    })),
  },
}));
