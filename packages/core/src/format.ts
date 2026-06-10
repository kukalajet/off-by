import type { Centiseconds } from './units';

/** Home's hero before a round is teed up — never a stale target (DESIGN §1). */
export const MYSTERY_DISPLAY = '?.??s';

/** 730 → "7.30s" — two decimals, always (PRD §10). */
export function formatSeconds(cs: Centiseconds): string {
  const abs = Math.abs(Math.round(cs));
  return `${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}s`;
}

/** +4 → "+0.04s" · −12 → "-0.12s" · 0 → "0.00s" (a perfect is a displayed 0.00s). */
export function formatSignedDelta(deltaCs: number): string {
  const rounded = Math.round(deltaCs);
  const sign = rounded > 0 ? '+' : rounded < 0 ? '-' : '';
  return sign + formatSeconds(Math.abs(rounded));
}
