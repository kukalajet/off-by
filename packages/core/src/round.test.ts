import { describe, expect, it } from 'vitest';
import { resolveStop } from './round';

describe('resolveStop', () => {
  it('discards stops under 100ms as misfires (PRD §6)', () => {
    expect(resolveStop(730, 0)).toEqual({ kind: 'misfire' });
    expect(resolveStop(730, 99)).toEqual({ kind: 'misfire' });
  });

  it('auto-misses at the 30s ceiling (PRD §6)', () => {
    expect(resolveStop(730, 30_000)).toEqual({ kind: 'ceiling' });
    expect(resolveStop(730, 45_123)).toEqual({ kind: 'ceiling' });
  });

  it('scores the Figma reference round: 7.34s on a 7.30s target → +0.04s, Great', () => {
    const result = resolveStop(730, 7_341);
    expect(result).toEqual({ kind: 'scored', elapsedCs: 734, deltaCs: 4, tier: 'great' });
  });

  it('rounds elapsed ms to the nearest centisecond — honest 2dp (PRD §10)', () => {
    expect(resolveStop(500, 4_994)).toMatchObject({ elapsedCs: 499, deltaCs: -1 });
    expect(resolveStop(500, 4_995)).toMatchObject({ elapsedCs: 500, deltaCs: 0, tier: 'bullseye' });
    expect(resolveStop(500, 5_004)).toMatchObject({ elapsedCs: 500, deltaCs: 0, tier: 'bullseye' });
    expect(resolveStop(500, 5_005)).toMatchObject({ elapsedCs: 501, deltaCs: 1, tier: 'insane' });
  });

  it('scores exactly at the misfire boundary (100ms is a real stop)', () => {
    expect(resolveStop(730, 100)).toMatchObject({ kind: 'scored', elapsedCs: 10 });
  });
});
