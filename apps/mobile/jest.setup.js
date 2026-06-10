// Reanimated's native worklets runtime doesn't exist under jest — use the
// official mock (animations resolve to their end values synchronously).
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// react-native-mmkv v4 is Nitro-based — there's no native runtime under jest,
// so back the stores with an in-memory Map that mirrors the MMKV surface.
jest.mock('react-native-mmkv', () => {
  class MemoryMMKV {
    constructor() {
      this.map = new Map();
    }
    set(key, value) {
      this.map.set(key, value);
    }
    getString(key) {
      const v = this.map.get(key);
      return typeof v === 'string' ? v : undefined;
    }
    getNumber(key) {
      const v = this.map.get(key);
      return typeof v === 'number' ? v : undefined;
    }
    getBoolean(key) {
      const v = this.map.get(key);
      return typeof v === 'boolean' ? v : undefined;
    }
    contains(key) {
      return this.map.has(key);
    }
    remove(key) {
      return this.map.delete(key);
    }
    getAllKeys() {
      return [...this.map.keys()];
    }
    clearAll() {
      this.map.clear();
    }
  }
  return { createMMKV: () => new MemoryMMKV() };
});

// Register the app's themes with the unistyles mocks (loaded just before this file).
require('./src/theme/unistyles');
