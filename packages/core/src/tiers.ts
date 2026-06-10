/**
 * Tier thresholds in |delta| centiseconds — strawman from PLAN §1, calibrated
 * so the Figma reference round (+0.04 s on 7.30 s) reads Great. Data, not code:
 * tuning ships as a constant change.
 */
export const TIER_THRESHOLDS = [
  { tier: 'bullseye', maxAbsCs: 0 },
  { tier: 'insane', maxAbsCs: 2 },
  { tier: 'great', maxAbsCs: 10 },
  { tier: 'good', maxAbsCs: 25 },
  { tier: 'close', maxAbsCs: 60 },
] as const;

export type Tier = (typeof TIER_THRESHOLDS)[number]['tier'] | 'miss';

export function tierForDelta(deltaCs: number): Tier {
  const abs = Math.abs(deltaCs);
  for (const { tier, maxAbsCs } of TIER_THRESHOLDS) {
    if (abs <= maxAbsCs) return tier;
  }
  return 'miss';
}
