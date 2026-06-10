import { mean, stddev } from '@offby/core';

/**
 * The practice read (PRD F-10b): running bias, spread, spread trend, and a
 * one-line coaching nudge. Copy rules favor the *fastest felt improvement*:
 * bias first (correctable in minutes), then consistency, then polish.
 */
export interface PracticeRead {
  repCount: number;
  biasCs: number | null;
  spreadCs: number | null;
  trend: 'tightening' | 'steady' | 'loosening' | null;
  coach: string;
}

const BIAS_NUDGE_CS = 4;
const SPREAD_NUDGE_CS = 8;

export function practiceRead(deltasCs: readonly number[]): PracticeRead {
  const repCount = deltasCs.length;
  const biasCs = mean([...deltasCs]);
  const spreadCs = stddev([...deltasCs]);

  let trend: PracticeRead['trend'] = null;
  if (repCount >= 6) {
    const half = Math.floor(repCount / 2);
    const early = stddev(deltasCs.slice(0, half));
    const late = stddev(deltasCs.slice(half));
    if (early !== null && late !== null) {
      if (late < early * 0.9) trend = 'tightening';
      else if (late > early * 1.1) trend = 'loosening';
      else trend = 'steady';
    }
  }

  return { repCount, biasCs, spreadCs, trend, coach: coachLine(repCount, biasCs, spreadCs) };
}

function coachLine(repCount: number, biasCs: number | null, spreadCs: number | null): string {
  if (repCount < 3 || biasCs === null) {
    return 'A few more reps and I’ll have a read on you.';
  }
  if (Math.abs(biasCs) >= BIAS_NUDGE_CS) {
    return biasCs < 0
      ? 'Hold one more beat — you’re releasing early.'
      : 'Let go a touch sooner — you’re running long.';
  }
  if (spreadCs !== null && spreadCs >= SPREAD_NUDGE_CS) {
    return 'Same rhythm every rep — consistency first, precision follows.';
  }
  return 'Locked in. Tighten by a hair and it’s a Great every time.';
}
