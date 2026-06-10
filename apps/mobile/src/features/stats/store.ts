import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

/**
 * Stats schema v0 (PLAN §Phase 0): just enough for the P0 Stats screen —
 * best (closest hit) and signed bias (PRD F-10). Trends land in P1; bump
 * `version` with a migration when the shape grows.
 */
interface StatsState {
  roundsPlayed: number;
  /** Closest |delta| ever, in centiseconds. Null until the first scored round. */
  bestAbsDeltaCs: number | null;
  /** Running signed sum of deltas — mean bias = biasSumCs / roundsPlayed. */
  biasSumCs: number;
  recordRound: (deltaCs: number) => void;
  reset: () => void;
}

const initial = {
  roundsPlayed: 0,
  bestAbsDeltaCs: null,
  biasSumCs: 0,
} satisfies Partial<StatsState>;

export const useStats = create<StatsState>()(
  persist(
    (set) => ({
      ...initial,
      recordRound: (deltaCs) =>
        set((s) => ({
          roundsPlayed: s.roundsPlayed + 1,
          bestAbsDeltaCs: Math.min(Math.abs(deltaCs), s.bestAbsDeltaCs ?? Infinity),
          biasSumCs: s.biasSumCs + deltaCs,
        })),
      reset: () => set(initial),
    }),
    {
      name: 'stats',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
