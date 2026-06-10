import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

/**
 * Stats schema v1: best is the SIGNED delta of the closest hit (the Stats
 * hero shows "+0.01s", not "0.01s" — Figma 88:4), plus the running signed
 * sum for bias (PRD F-10). Trends (closeness/consistency over time) are P1.
 */
interface StatsState {
  roundsPlayed: number;
  /** Signed delta of the closest |delta| ever. Null until the first scored round. */
  bestDeltaCs: number | null;
  /** Running signed sum of deltas — mean bias = biasSumCs / roundsPlayed. */
  biasSumCs: number;
  recordRound: (deltaCs: number) => void;
  reset: () => void;
}

const initial = {
  roundsPlayed: 0,
  bestDeltaCs: null,
  biasSumCs: 0,
} satisfies Partial<StatsState>;

export const useStats = create<StatsState>()(
  persist(
    (set) => ({
      ...initial,
      recordRound: (deltaCs) =>
        set((s) => ({
          roundsPlayed: s.roundsPlayed + 1,
          bestDeltaCs:
            s.bestDeltaCs === null || Math.abs(deltaCs) < Math.abs(s.bestDeltaCs)
              ? deltaCs
              : s.bestDeltaCs,
          biasSumCs: s.biasSumCs + deltaCs,
        })),
      reset: () => set(initial),
    }),
    {
      name: 'stats',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      migrate: (persisted, version) => {
        if (version === 0) {
          // v0 kept only |best| — carry it as a positive signed value.
          const v0 = persisted as { roundsPlayed: number; bestAbsDeltaCs: number | null; biasSumCs: number };
          return {
            roundsPlayed: v0.roundsPlayed,
            bestDeltaCs: v0.bestAbsDeltaCs,
            biasSumCs: v0.biasSumCs,
          };
        }
        return persisted as StatsState;
      },
    },
  ),
);

/** Mean signed bias in centiseconds; null before the first scored round. */
export function meanBiasCs(s: Pick<StatsState, 'roundsPlayed' | 'biasSumCs'>): number | null {
  return s.roundsPlayed === 0 ? null : s.biasSumCs / s.roundsPlayed;
}
