/**
 * All round math runs in integer centiseconds (1 cs = 10 ms).
 * Two decimals is the product's honesty contract (PRD §10) — integers keep it exact.
 */
export type Centiseconds = number;

export const MS_PER_CS = 10;

export function msToCs(ms: number): Centiseconds {
  return Math.round(ms / MS_PER_CS);
}
