import { systemRng } from '@offby/core';
import { create } from 'zustand';

import { createRoundStore, type RoundSink } from '@/features/round/store';
import { logEvent } from '@/lib/analytics';

/**
 * Practice (PRD F-10b): the unscored loop. Session-scoped rep history —
 * deliberately not persisted; a practice session is a sitting, and the
 * feedback reads from THIS sitting's reps.
 */
interface PracticeSession {
  deltasCs: number[];
  record: (deltaCs: number) => void;
  clear: () => void;
}

export const usePractice = create<PracticeSession>()((set) => ({
  deltasCs: [],
  record: (deltaCs) => set((s) => ({ deltasCs: [...s.deltasCs, deltaCs] })),
  clear: () => set({ deltasCs: [] }),
}));

/** No coins, no lifetime stats — the feedback is the reward (PRD §7). */
const practiceSink: RoundSink = (result, targetCs) => {
  if (result.kind === 'scored') {
    usePractice.getState().record(result.deltaCs);
    logEvent('practice_round_completed', {
      target_cs: targetCs,
      delta_cs: result.deltaCs,
      tier: result.tier,
    });
  }
  return {};
};

export const usePracticeRound = createRoundStore(systemRng, practiceSink);
