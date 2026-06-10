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

import { useStats } from '@/features/stats/store';
import { useWallet } from '@/features/wallet/store';
import { logEvent } from '@/lib/analytics';
import { elapsedMsBetween, type InputStamp } from '@/lib/timing';

/**
 * The loop state machine (PRD §6): Ready → Run → (Guess) → Reveal. Guess is
 * the stop tap itself — `stop()` resolves it synchronously, so it never
 * surfaces as a stored phase. Misfires bounce straight back to Ready with the
 * SAME target: a discarded round never happened, so it isn't re-rolled
 * (re-roll is per *round*, PRD §7).
 *
 * The store stays side-effect-pure on the sensory side: haptics/animation are
 * fired by the screen reacting to phase changes, so tests can drive the
 * machine headlessly with fake stamps.
 */
export type RoundPhase = 'ready' | 'running' | 'reveal';

interface RoundState {
  phase: RoundPhase;
  targetCs: Centiseconds;
  startStamp: InputStamp | null;
  result: StopResult | null;
  coinsEarned: number;
  /** True while Ready is showing the "too fast" notice after a misfire. */
  misfired: boolean;
  /** Roll a fresh target and arm Ready. Entry point and retry landing. */
  begin: () => void;
  start: (stamp: InputStamp) => void;
  stop: (stamp: InputStamp) => void;
  /** 30s ceiling fired without a stop tap — auto-resolve as a Miss (PRD §6). */
  expire: () => void;
  retry: () => void;
  /** Leave the surface mid-round: clear timers, disarm. */
  reset: () => void;
}

export function createRoundStore(rng: Rng = systemRng) {
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

    begin: () => {
      clearCeiling();
      set({
        phase: 'ready',
        targetCs: generateTarget(rng),
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

      const coinsEarned = coinsForResult(result);
      useWallet.getState().earn(coinsEarned);

      if (result.kind === 'scored') {
        useStats.getState().recordRound(result.deltaCs);
        logEvent('round_completed', {
          target_cs: targetCs,
          elapsed_cs: result.elapsedCs,
          delta_cs: result.deltaCs,
          tier: result.tier,
        });
      } else {
        // Ceiling: a Miss with no honest delta to record — coins only.
        logEvent('round_completed', { target_cs: targetCs, outcome: 'ceiling' });
      }

      set({ phase: 'reveal', result, coinsEarned });
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

export const useRound = createRoundStore();
