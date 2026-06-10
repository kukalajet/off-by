import { type Tier, tierForDelta } from './tiers';
import { type Centiseconds, msToCs } from './units';

/** PRD §6/§11.1: stops under 100 ms are accidental double-taps — discarded, never scored. */
export const MISFIRE_MAX_MS = 100;

/** PRD §6: a run that reaches 30 s auto-misses (pocket / walked away). */
export const ROUND_CEILING_MS = 30_000;

export type StopResult =
  | { kind: 'misfire' }
  | { kind: 'ceiling' }
  | { kind: 'scored'; elapsedCs: Centiseconds; deltaCs: number; tier: Tier };

/**
 * Score a stop. `elapsedMs` must come from monotonic input-event timestamps
 * (PRD §11.1) — capturing it is the app's job; the rule math lives here so the
 * Phase 4 server can validate with the identical code (PRD §11.3).
 */
export function resolveStop(targetCs: Centiseconds, elapsedMs: number): StopResult {
  if (elapsedMs < MISFIRE_MAX_MS) return { kind: 'misfire' };
  if (elapsedMs >= ROUND_CEILING_MS) return { kind: 'ceiling' };
  const elapsedCs = msToCs(elapsedMs);
  const deltaCs = elapsedCs - targetCs;
  return { kind: 'scored', elapsedCs, deltaCs, tier: tierForDelta(deltaCs) };
}
