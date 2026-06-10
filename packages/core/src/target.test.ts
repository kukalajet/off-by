import { describe, expect, it } from 'vitest';
import { createSeededRng, seedFromString } from './rng';
import { TARGET_RULES, generateTarget, isCleanTarget } from './target';

describe('generateTarget', () => {
  it('stays in [1.00s, 15.00s] at centisecond granularity', () => {
    const rng = createSeededRng(42);
    for (let i = 0; i < 10_000; i++) {
      const cs = generateTarget(rng);
      expect(Number.isInteger(cs)).toBe(true);
      expect(cs).toBeGreaterThanOrEqual(TARGET_RULES.minCs);
      expect(cs).toBeLessThanOrEqual(TARGET_RULES.maxCs);
    }
  });

  it('is biased away from clean x.00 / x.50 endings', () => {
    const rng = createSeededRng(7);
    const draws = 20_000;
    let clean = 0;
    for (let i = 0; i < draws; i++) {
      if (isCleanTarget(generateTarget(rng))) clean++;
    }
    // uniform baseline is ~2% clean endings; the re-roll bias should push it well under 1%
    expect(clean / draws).toBeLessThan(0.01);
  });

  it('still covers the range broadly (the bias must not collapse variety)', () => {
    const rng = createSeededRng(1234);
    const seen = new Set<number>();
    for (let i = 0; i < 50_000; i++) seen.add(generateTarget(rng));
    // 1401 possible values; expect the overwhelming majority to appear
    expect(seen.size).toBeGreaterThan(1200);
  });

  it('is deterministic per seed — the Daily / Challenge shared-target contract', () => {
    const a = createSeededRng(20_260_610);
    const b = createSeededRng(20_260_610);
    const seqA = Array.from({ length: 50 }, () => generateTarget(a));
    const seqB = Array.from({ length: 50 }, () => generateTarget(b));
    expect(seqA).toEqual(seqB);
  });
});

describe('seedFromString', () => {
  it('is stable for the same input and distinct across days', () => {
    expect(seedFromString('2026-06-10')).toBe(seedFromString('2026-06-10'));
    expect(seedFromString('2026-06-10')).not.toBe(seedFromString('2026-06-11'));
  });
});
