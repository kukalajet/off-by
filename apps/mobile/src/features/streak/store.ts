import { advanceStreak, dayKey, INITIAL_STREAK, type StreakState } from '@offby/core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

/**
 * Local streak (PRD F-11): advanced by any resolved round in any mode —
 * the round machine calls `recordPlay` so modes can't forget to. Pure math
 * lives in @offby/core (freeze rules included).
 */
interface StreakStore extends StreakState {
  recordPlay: () => void;
}

export const useStreak = create<StreakStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_STREAK,
      recordPlay: () => {
        const { days, freezes, lastDayKey } = get();
        set(advanceStreak({ days, freezes, lastDayKey }, dayKey(new Date())));
      },
    }),
    {
      name: 'streak',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
