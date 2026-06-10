import { describe, expect, it } from 'vitest';
import { formatSeconds, formatSignedDelta } from './format';

describe('formatSeconds', () => {
  it('always renders two decimals with the s suffix', () => {
    expect(formatSeconds(730)).toBe('7.30s');
    expect(formatSeconds(105)).toBe('1.05s');
    expect(formatSeconds(1500)).toBe('15.00s');
    expect(formatSeconds(100)).toBe('1.00s');
  });
});

describe('formatSignedDelta', () => {
  it('signs late and early, and shows a perfect as a plain 0.00s', () => {
    expect(formatSignedDelta(4)).toBe('+0.04s');
    expect(formatSignedDelta(-12)).toBe('-0.12s');
    expect(formatSignedDelta(0)).toBe('0.00s');
    expect(formatSignedDelta(-60)).toBe('-0.60s');
    expect(formatSignedDelta(234)).toBe('+2.34s');
  });
});
