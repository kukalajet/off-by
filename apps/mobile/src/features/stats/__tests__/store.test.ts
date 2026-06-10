import { meanBiasCs, useStats } from '../store';

describe('stats store (v1)', () => {
  beforeEach(() => {
    useStats.getState().reset();
  });

  it('keeps the SIGNED delta of the closest hit — the Stats hero is "+0.01s", not "0.01s"', () => {
    const record = (d: number) => useStats.getState().recordRound(d);
    record(8);
    expect(useStats.getState().bestDeltaCs).toBe(8);
    record(-3); // closer, early side — best becomes signed -3
    expect(useStats.getState().bestDeltaCs).toBe(-3);
    record(5); // farther — best unchanged
    expect(useStats.getState().bestDeltaCs).toBe(-3);
  });

  it('accumulates rounds and signed bias', () => {
    useStats.getState().recordRound(10);
    useStats.getState().recordRound(-4);
    const s = useStats.getState();
    expect(s.roundsPlayed).toBe(2);
    expect(s.biasSumCs).toBe(6);
    expect(meanBiasCs(s)).toBe(3);
  });

  it('reports no bias before the first scored round', () => {
    expect(meanBiasCs(useStats.getState())).toBeNull();
  });

  it('reset clears everything', () => {
    useStats.getState().recordRound(2);
    useStats.getState().reset();
    const s = useStats.getState();
    expect(s.roundsPlayed).toBe(0);
    expect(s.bestDeltaCs).toBeNull();
    expect(s.biasSumCs).toBe(0);
  });
});
