import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

interface SettingsState {
  haptics: boolean;
  sound: boolean;
  setHaptics: (on: boolean) => void;
  setSound: (on: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      haptics: true,
      sound: true,
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
    }),
    {
      name: 'settings',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
