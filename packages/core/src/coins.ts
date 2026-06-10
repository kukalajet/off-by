import type { StopResult } from './round';
import type { Tier } from './tiers';

/**
 * Coin earn per scored round, keyed by tier (PRD §9.2 — "more for tighter
 * tiers"). Data, not code: OTA-tunable like TIER_THRESHOLDS. Anchors: PRD's
 * illustrative Bullseye 100 / Close 5 / Miss 1, and the Figma Reveal reference
 * frame (9:2) showing +25 on a Great.
 */
export const COIN_REWARDS: Readonly<Record<Tier, number>> = {
  bullseye: 100,
  insane: 50,
  great: 25,
  good: 10,
  close: 5,
  miss: 1,
};

/**
 * Coins for a resolved stop. A misfire is discarded — not scored, not paid
 * (PRD §6). The 30s ceiling auto-resolves as a Miss, so it pays the miss rate.
 */
export function coinsForResult(result: StopResult): number {
  switch (result.kind) {
    case 'misfire':
      return 0;
    case 'ceiling':
      return COIN_REWARDS.miss;
    case 'scored':
      return COIN_REWARDS[result.tier];
  }
}
