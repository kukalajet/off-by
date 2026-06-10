import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

export const storage = createMMKV({ id: 'offby' });

/** Zustand persist adapter over MMKV (synchronous — no hydration flash). */
export const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => {
    storage.remove(name);
  },
};
