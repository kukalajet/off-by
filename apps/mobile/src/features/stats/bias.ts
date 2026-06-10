/**
 * Bias-scale geometry (Figma 89:5): the marker's offset from the center
 * tick, as a fraction of the half-track. Full scale is ±0.30s — the Close
 * tier boundary; anything past it pins to the rail.
 */
export const BIAS_FULL_SCALE_CS = 30;

export function biasLean(meanCs: number): number {
  const lean = meanCs / BIAS_FULL_SCALE_CS;
  return Math.max(-1, Math.min(1, lean));
}

/** Plain-language read under the scale (the design's "a touch late" line). */
export function biasRead(meanCs: number | null): string {
  if (meanCs === null) return 'play a few rounds to see your lean';
  if (Math.abs(meanCs) < 2) return 'no lean to speak of — dead centered';
  return meanCs > 0 ? 'you tend to stop a touch late' : 'you tend to stop a touch early';
}
