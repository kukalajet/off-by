/** Small stat helpers shared by Practice feedback and (later) Stats trends. */

export function mean(xs: readonly number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Population standard deviation; null below two samples (no spread yet). */
export function stddev(xs: readonly number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs)!;
  const variance = xs.reduce((acc, x) => acc + (x - m) * (x - m), 0) / xs.length;
  return Math.sqrt(variance);
}
