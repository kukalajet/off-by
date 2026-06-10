import { describe, expect, it } from 'vitest';

import { COIN_REWARDS, coinsForResult } from './coins';
import { resolveStop } from './round';

describe('COIN_REWARDS', () => {
  it('pays strictly more for tighter tiers', () => {
    const ladder = [
      COIN_REWARDS.miss,
      COIN_REWARDS.close,
      COIN_REWARDS.good,
      COIN_REWARDS.great,
      COIN_REWARDS.insane,
      COIN_REWARDS.bullseye,
    ];
    for (let i = 1; i < ladder.length; i++) {
      expect(ladder[i]).toBeGreaterThan(ladder[i - 1]!);
    }
  });

  it('matches the PRD anchors and the Figma Reveal reference (+25 on a Great)', () => {
    expect(COIN_REWARDS.bullseye).toBe(100);
    expect(COIN_REWARDS.close).toBe(5);
    expect(COIN_REWARDS.miss).toBe(1);
    expect(COIN_REWARDS.great).toBe(25);
  });
});

describe('coinsForResult', () => {
  it('pays the tier rate on a scored stop — the Figma reference round earns 25', () => {
    expect(coinsForResult(resolveStop(730, 7341))).toBe(25);
  });

  it('pays nothing for a misfire (discarded, not scored)', () => {
    expect(coinsForResult(resolveStop(730, 50))).toBe(0);
  });

  it('pays the miss rate when the 30s ceiling auto-resolves the round', () => {
    expect(coinsForResult(resolveStop(730, 31_000))).toBe(COIN_REWARDS.miss);
  });
});
