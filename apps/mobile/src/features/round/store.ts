import {
  type Centiseconds,
  coinsForResult,
  generateTarget,
  ROUND_CEILING_MS,
  type Rng,
  type StopResult,
  resolveStop,
  systemRng,
} from '@offby/core';
import { create } from 'zustand';

import { useGoals } from '@/features/goals/store';
import { useStats } from '@/features/stats/store';
import { useStreak } from '@/features/streak/store';
import { useWallet } from '@/features/wallet/store';
import { logEvent } from '@/lib/analytics';
import { elapsedMsBetween, type InputStamp } from '@/lib/timing';

/**
 * The loop state machine (PRD §6): Ready → Run → (Guess) → Reveal — ONE
 * machine for every mode ("one Round surface, parameterized", PLAN §0).
 * Modes differ only in their `RoundSink` (what a resolved stop does) and in
 * who supplies the target (`begin(targetCs?)` — Gauntlet's escalation and
 * Pass & Play's shared target pass one explicitly; Classic/Practice roll).
 *
 * Universal rules stay here: misfires bounce back to Ready with the SAME
 * target (a discarded round never happened, PRD §7), the 30s ceiling, and
 * day-level recording (streak + goal progress) that no mode may skip.
 *
 * Sensory side effects (haptics/animation) belong to the surface, not the
 * machine — tests drive it headlessly with fake stamps.
 */
export type RoundPhase = 'ready' | 'running' | 'reveal';

export interface RoundSinkOutcome {
  /** Coins to show on the reveal chip; omit for unscored modes. */
  coinsEarned?: number;
  /** Chain straight into the next Ready (Gauntlet survive) instead of Reveal. */
  nextTargetCs?: Centiseconds;
}

/** Handles a resolved (never misfired) stop. */
export type RoundSink = (result: StopResult, targetCs: Centiseconds) => RoundSinkOutcome | void;

/** Classic (PRD §8.1): pay coins by tier, feed lifetime stats. */
export const classicSink: RoundSink = (result, targetCs) => {
  const coinsEarned = coinsForResult(result);
  useWallet.getState().earn(coinsEarned);
  if (result.kind === 'scored') {
    logEvent('round_completed', {
      mode: 'classic',
      target_cs: targetCs,
      elapsed_cs: result.elapsedCs,
      delta_cs: result.deltaCs,
      tier: result.tier,
    });
    useStats.getState().recordRound(result.deltaCs);
  } else {
    logEvent('round_completed', { mode: 'classic', target_cs: targetCs, outcome: 'ceiling' });
  }
  return { coinsEarned };
};

interface RoundState {
  phase: RoundPhase;
  targetCs: Centiseconds;
  startStamp: InputStamp | null;
  result: StopResult | null;
  coinsEarned: number;
  /** True while Ready is showing the "too fast" notice after a misfire. */
  misfired: boolean;
  /** Arm Ready — with an explicit target, or a fresh roll. */
  begin: (targetCs?: Centiseconds) => void;
  start: (stamp: InputStamp) => void;
  stop: (stamp: InputStamp) => void;
  /** 30s ceiling fired without a stop tap — auto-resolve as a Miss (PRD §6). */
  expire: () => void;
  retry: () => void;
  /** Leave the surface mid-round: clear timers, disarm. */
  reset: () => void;
}

export function createRoundStore(rng: Rng = systemRng, sink: RoundSink = classicSink) {
  let ceilingTimer: ReturnType<typeof setTimeout> | null = null;

  const clearCeiling = () => {
    if (ceilingTimer !== null) {
      clearTimeout(ceilingTimer);
      ceilingTimer = null;
    }
  };

  return create<RoundState>()((set, get) => ({
    phase: 'ready',
    targetCs: generateTarget(rng),
    startStamp: null,
    result: null,
    coinsEarned: 0,
    misfired: false,

    begin: (targetCs) => {
      clearCeiling();
      set({
        phase: 'ready',
        targetCs: targetCs ?? generateTarget(rng),
        startStamp: null,
        result: null,
        coinsEarned: 0,
        misfired: false,
      });
    },

    start: (stamp) => {
      if (get().phase !== 'ready') return;
      set({ phase: 'running', startStamp: stamp, misfired: false });
      logEvent('round_started', { target_cs: get().targetCs });
      ceilingTimer = setTimeout(() => get().expire(), ROUND_CEILING_MS);
    },

    stop: (stamp) => {
      const { phase, startStamp, targetCs } = get();
      if (phase !== 'running' || startStamp === null) return;
      clearCeiling();

      const result = resolveStop(targetCs, elapsedMsBetween(startStamp, stamp));

      if (result.kind === 'misfire') {
        // Discarded, not scored (PRD §6) — back to Ready, same target.
        set({ phase: 'ready', startStamp: null, misfired: true });
        logEvent('round_misfired', { target_cs: targetCs });
        return;
      }

      const outcome = sink(result, targetCs) ?? {};

      // Day-level recording is universal: every resolved round in every mode
      // counts toward the streak and the day's goals.
      useStreak.getState().recordPlay();
      useGoals.getState().recordResult(result);

      if (outcome.nextTargetCs !== undefined) {
        set({
          phase: 'ready',
          targetCs: outcome.nextTargetCs,
          startStamp: null,
          result: null,
          coinsEarned: 0,
          misfired: false,
        });
      } else {
        set({ phase: 'reveal', result, coinsEarned: outcome.coinsEarned ?? 0 });
      }
    },

    expire: () => {
      const { phase, startStamp } = get();
      if (phase !== 'running' || startStamp === null) return;
      get().stop({ ms: startStamp.ms + ROUND_CEILING_MS, source: startStamp.source });
    },

    retry: () => {
      logEvent('retry_tapped');
      get().begin();
    },

    reset: () => {
      clearCeiling();
      set({ phase: 'ready', startStamp: null, result: null, coinsEarned: 0, misfired: false });
    },
  }));
}

export type RoundStore = ReturnType<typeof createRoundStore>;

export const useRound = createRoundStore();
