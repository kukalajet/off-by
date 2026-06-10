import {
  gauntletBandCs,
  gauntletRoundScore,
  GAUNTLET_RULES,
  isGauntletHit,
  rollGauntletTarget,
  systemRng,
} from '@offby/core';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createRoundStore, type RoundSink } from '@/features/round/store';
import { logEvent } from '@/lib/analytics';
import { zustandStorage } from '@/lib/storage';

/**
 * Gauntlet (PRD F-12): an escalating run on the shared round surface.
 * Survive = land inside the round's tolerance band; each survival chains
 * straight into the next Ready via the sink (no per-round Reveal — the HUD
 * is the feedback). Three lives; a miss costs one but the run rolls on.
 */
interface GauntletRun {
  round: number;
  lives: number;
  score: number;
  cleared: number;
  tightestAbsCs: number | null;
  over: boolean;
  startRun: () => void;
  /** Voluntary "End run" — keeps the score, ends the sequence. */
  endRun: () => void;
}

export const useGauntletRun = create<GauntletRun>()((set, get) => ({
  round: 1,
  lives: GAUNTLET_RULES.lives,
  score: 0,
  cleared: 0,
  tightestAbsCs: null,
  over: false,
  startRun: () =>
    set({
      round: 1,
      lives: GAUNTLET_RULES.lives,
      score: 0,
      cleared: 0,
      tightestAbsCs: null,
      over: false,
    }),
  endRun: () => {
    if (get().over) return;
    finishRun();
  },
}));

/** Per-device high score (F-12: per-mode high scores). */
interface GauntletBest {
  bestScore: number;
  record: (score: number) => void;
}

export const useGauntletBest = create<GauntletBest>()(
  persist(
    (set) => ({
      bestScore: 0,
      record: (score) => set((s) => ({ bestScore: Math.max(s.bestScore, score) })),
    }),
    {
      name: 'gauntlet-best',
      version: 0,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);

function finishRun() {
  const run = useGauntletRun.getState();
  useGauntletRun.setState({ over: true });
  useGauntletBest.getState().record(run.score);
  logEvent('gauntlet_run_ended', { score: run.score, cleared: run.cleared });
}

const gauntletSink: RoundSink = (result) => {
  const run = useGauntletRun.getState();
  if (run.over) return {};

  const bandCs = gauntletBandCs(run.round);

  if (result.kind === 'scored' && isGauntletHit(result.deltaCs, bandCs)) {
    const absDelta = Math.abs(result.deltaCs);
    useGauntletRun.setState({
      round: run.round + 1,
      score: run.score + gauntletRoundScore(result.deltaCs, bandCs),
      cleared: run.cleared + 1,
      tightestAbsCs: Math.min(absDelta, run.tightestAbsCs ?? Infinity),
    });
    return { nextTargetCs: rollGauntletTarget(systemRng) };
  }

  // Outside the band (or the 30s ceiling): one life gone, the run rolls on.
  if (run.lives > 1) {
    useGauntletRun.setState({ lives: run.lives - 1, round: run.round + 1 });
    return { nextTargetCs: rollGauntletTarget(systemRng) };
  }

  useGauntletRun.setState({ lives: 0 });
  finishRun();
  return {};
};

export const useGauntletRound = createRoundStore(systemRng, gauntletSink);
