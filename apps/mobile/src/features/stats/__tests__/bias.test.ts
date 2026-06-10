import { BIAS_FULL_SCALE_CS, biasLean, biasRead } from '../bias';

describe('bias scale', () => {
  it('maps mean bias linearly onto the track, full scale at ±0.30s', () => {
    expect(biasLean(0)).toBe(0);
    expect(biasLean(15)).toBeCloseTo(0.5);
    expect(biasLean(-15)).toBeCloseTo(-0.5);
    expect(biasLean(BIAS_FULL_SCALE_CS)).toBe(1);
  });

  it('pins past the rail instead of overflowing', () => {
    expect(biasLean(90)).toBe(1);
    expect(biasLean(-90)).toBe(-1);
  });

  it('reads plainly in each direction', () => {
    expect(biasRead(null)).toMatch(/play a few rounds/);
    expect(biasRead(1)).toMatch(/dead centered/);
    expect(biasRead(8)).toMatch(/late/);
    expect(biasRead(-8)).toMatch(/early/);
  });
});
