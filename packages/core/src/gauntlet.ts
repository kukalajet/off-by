import { type Rng, systemRng } from './rng';
import type { Centiseconds } from './units';

/**
 * Gauntlet rules (PRD F-12, Figma §04): escalating pressure comes from the
 * tolerance band tightening each round, not from longer targets — targets
 * stay short and snappy. Three lives; landing outside the band costs one.
 * All data, all tunable. Calibrated against the Figma reference frames:
 * round 3 shows "Target 1.20s · ±0.15s", a 9-round run scores 740.
 */
export const GAUNTLET_RULES = {
  lives: 3,
  /** Band starts at ±0.20s and decays ~12% per round, floored at ±0.06s. */
  bandStartCs: 20,
  bandDecay: 0.88,
  bandMinCs: 6,
  /** Per-round target range — short on purpose (0.80–3.00s). */
  targetMinCs: 80,
  targetMaxCs: 300,
  /** A dead-center hit is worth this much; band-edge hits approach 0. */
  roundScoreMax: 100,
} as const;

/** Tolerance band for a 1-indexed round number. */
export function gauntletBandCs(round: number): Centiseconds {
  const decayed = GAUNTLET_RULES.bandStartCs * GAUNTLET_RULES.bandDecay ** (round - 1);
  return Math.max(GAUNTLET_RULES.bandMinCs, Math.round(decayed));
}

/** Gauntlet sets its own target contract (PRD §7) — uniform, no clean-ending bias. */
export function rollGauntletTarget(rng: Rng = systemRng): Centiseconds {
  const span = GAUNTLET_RULES.targetMaxCs - GAUNTLET_RULES.targetMinCs + 1;
  return GAUNTLET_RULES.targetMinCs + Math.floor(rng.next() * span);
}

export function isGauntletHit(deltaCs: number, bandCs: Centiseconds): boolean {
  return Math.abs(deltaCs) <= bandCs;
}

/** Score for a surviving round: linear in closeness, 0 at the band edge. */
export function gauntletRoundScore(deltaCs: number, bandCs: Centiseconds): number {
  if (!isGauntletHit(deltaCs, bandCs)) return 0;
  return Math.round(GAUNTLET_RULES.roundScoreMax * (1 - Math.abs(deltaCs) / bandCs));
}
