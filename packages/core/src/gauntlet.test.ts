import { describe, expect, it } from 'vitest';

import { GAUNTLET_RULES, gauntletBandCs, gauntletRoundScore, isGauntletHit, rollGauntletTarget } from './gauntlet';
import { createSeededRng } from './rng';

describe('gauntletBandCs', () => {
  it('starts at ±0.20s and tightens every round', () => {
    expect(gauntletBandCs(1)).toBe(20);
    for (let r = 2; r <= 12; r++) {
      expect(gauntletBandCs(r)).toBeLessThanOrEqual(gauntletBandCs(r - 1));
    }
  });

  it('matches the Figma reference: round 3 is ±0.15s', () => {
    expect(gauntletBandCs(3)).toBe(15);
  });

  it('never tightens past the floor', () => {
    expect(gauntletBandCs(50)).toBe(GAUNTLET_RULES.bandMinCs);
  });
});

describe('rollGauntletTarget', () => {
  it('stays inside the snappy 0.80–3.00s range', () => {
    const rng = createSeededRng(5);
    for (let i = 0; i < 5_000; i++) {
      const cs = rollGauntletTarget(rng);
      expect(cs).toBeGreaterThanOrEqual(GAUNTLET_RULES.targetMinCs);
      expect(cs).toBeLessThanOrEqual(GAUNTLET_RULES.targetMaxCs);
    }
  });
});

describe('scoring', () => {
  it('pays max for dead center, zero at the band edge, zero outside', () => {
    expect(gauntletRoundScore(0, 20)).toBe(GAUNTLET_RULES.roundScoreMax);
    expect(gauntletRoundScore(20, 20)).toBe(0);
    expect(gauntletRoundScore(-21, 20)).toBe(0);
    expect(isGauntletHit(20, 20)).toBe(true);
    expect(isGauntletHit(21, 20)).toBe(false);
  });

  it('lands in the Figma score ballpark: ~9 decent rounds ≈ 740', () => {
    // Nine rounds at ~2.5cs off in early bands averages out near the
    // reference "FINAL SCORE 740 · Rounds cleared 9".
    let total = 0;
    for (let r = 1; r <= 9; r++) total += gauntletRoundScore(3, gauntletBandCs(r));
    expect(total).toBeGreaterThan(600);
    expect(total).toBeLessThan(800);
  });
});
