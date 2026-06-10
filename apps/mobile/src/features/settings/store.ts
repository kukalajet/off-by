import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

interface SettingsState {
  haptics: boolean;
  sound: boolean;
  /** Distraction-mode interference (PRD §7) — stored now, takes effect in P2+. */
  distraction: boolean;
  /** First-run flag (F-8): false until the guided round is done or skipped. */
  onboarded: boolean;
  setHaptics: (on: boolean) => void;
  setSound: (on: boolean) => void;
  setDistraction: (on: boolean) => void;
  setOnboarded: (done: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      haptics: true,
      sound: true,
      distraction: false,
      onboarded: false,
      setHaptics: (haptics) => set({ haptics }),
      setSound: (sound) => set({ sound }),
      setDistraction: (distraction) => set({ distraction }),
      setOnboarded: (onboarded) => set({ onboarded }),
    }),
    {
      name: 'settings',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
