import { describe, expect, it } from 'vitest';
import { tierForDelta } from './tiers';

describe('tierForDelta', () => {
  it('maps the strawman thresholds (PLAN §1)', () => {
    expect(tierForDelta(0)).toBe('bullseye');
    expect(tierForDelta(1)).toBe('insane');
    expect(tierForDelta(2)).toBe('insane');
    expect(tierForDelta(3)).toBe('great');
    expect(tierForDelta(10)).toBe('great');
    expect(tierForDelta(11)).toBe('good');
    expect(tierForDelta(25)).toBe('good');
    expect(tierForDelta(26)).toBe('close');
    expect(tierForDelta(60)).toBe('close');
    expect(tierForDelta(61)).toBe('miss');
  });

  it('reads the Figma reference round (+0.04s) as Great — the calibration anchor', () => {
    expect(tierForDelta(4)).toBe('great');
  });

  it('is symmetric for early and late stops', () => {
    for (const cs of [0, 2, 4, 10, 25, 60, 61, 500]) {
      expect(tierForDelta(-cs)).toBe(tierForDelta(cs));
    }
  });
});
