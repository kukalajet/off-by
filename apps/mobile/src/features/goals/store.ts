import {
  dayKey,
  goalsFor,
  weekKey,
  type GoalDef,
  type StopResult,
  type Tier,
} from '@offby/core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';

/**
 * Goal progress (PRD F-11b): per-day counters + days-played-this-week,
 * rolled over lazily on write and read. Which goals are active comes from
 * the seeded deal in @offby/core — nothing here picks goals.
 */
interface GoalsState {
  day: string | null;
  week: string | null;
  rounds: number;
  greats: number;
  bullseyes: number;
  daysPlayedThisWeek: string[];
  recordResult: (result: StopResult) => void;
}

const GREAT_OR_TIGHTER: readonly Tier[] = ['bullseye', 'insane', 'great'];

export const useGoals = create<GoalsState>()(
  persist(
    (set, get) => ({
      day: null,
      week: null,
      rounds: 0,
      greats: 0,
      bullseyes: 0,
      daysPlayedThisWeek: [],
      recordResult: (result) => {
        if (result.kind === 'misfire') return;
        const now = new Date();
        const today = dayKey(now);
        const thisWeek = weekKey(now);
        const s = get();
        const sameDay = s.day === today;
        const sameWeek = s.week === thisWeek;
        const days = sameWeek ? s.daysPlayedThisWeek : [];
        const scoredTier = result.kind === 'scored' ? result.tier : null;
        set({
          day: today,
          week: thisWeek,
          rounds: (sameDay ? s.rounds : 0) + 1,
          greats:
            (sameDay ? s.greats : 0) +
            (scoredTier !== null && GREAT_OR_TIGHTER.includes(scoredTier) ? 1 : 0),
          bullseyes: (sameDay ? s.bullseyes : 0) + (scoredTier === 'bullseye' ? 1 : 0),
          daysPlayedThisWeek: days.includes(today) ? days : [...days, today],
        });
      },
    }),
    {
      name: 'goals',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

export interface GoalProgress {
  def: GoalDef;
  progress: number;
  done: boolean;
}

/** Today's deal with live progress (counters from a previous day read as 0). */
export function goalProgress(s: GoalsState, now = new Date()): GoalProgress[] {
  const today = dayKey(now);
  const thisWeek = weekKey(now);
  const sameDay = s.day === today;
  const sameWeek = s.week === thisWeek;
  const counters: Record<GoalDef['metric'], number> = {
    rounds: sameDay ? s.rounds : 0,
    greats: sameDay ? s.greats : 0,
    bullseyes: sameDay ? s.bullseyes : 0,
    days: sameWeek ? s.daysPlayedThisWeek.length : 0,
  };
  return goalsFor(today, thisWeek).map((def) => {
    const progress = Math.min(counters[def.metric], def.target);
    return { def, progress, done: progress >= def.target };
  });
}
