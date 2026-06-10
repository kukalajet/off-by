import { type Rng, systemRng } from './rng';
import type { Centiseconds } from './units';

/**
 * Target generation rules (PRD §7): uniform 0.10–7.00 s at 2 dp, biased away
 * from "clean" endings (x.00 / x.50) that read as countable rhythms.
 * Expressed as data so feel-tuning is a constant change (OTA-able).
 * Range decided 2026-06-10; the floor sits at the misfire cutoff (§6) — the
 * lowest value a stop can legally score.
 */
export const TARGET_RULES = {
  minCs: 10,
  maxCs: 700,
  cleanEndings: [0, 50] as readonly number[],
  cleanRerollChance: 0.85,
  maxRerolls: 2,
} as const;

export function isCleanTarget(cs: Centiseconds): boolean {
  return TARGET_RULES.cleanEndings.includes(cs % 100);
}

/**
 * Roll a fresh target. Classic re-rolls on every round — including instant
 * Retry (PRD §6). Seeded modes (Daily, Challenge) pass their own Rng.
 */
export function generateTarget(rng: Rng = systemRng): Centiseconds {
  const span = TARGET_RULES.maxCs - TARGET_RULES.minCs + 1;
  const roll = () => TARGET_RULES.minCs + Math.floor(rng.next() * span);
  let cs = roll();
  for (let i = 0; i < TARGET_RULES.maxRerolls; i++) {
    if (!isCleanTarget(cs) || rng.next() >= TARGET_RULES.cleanRerollChance) break;
    cs = roll();
  }
  return cs;
}
