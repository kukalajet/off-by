/**
 * Token color + alpha → rgba string. The file's translucent fills (status
 * pills, tier badge, coins chip, the run-field ghost) are literal
 * `token @ alpha` paints in Figma — derive them so the hex lives only in
 * tokens.ts.
 */
export function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
