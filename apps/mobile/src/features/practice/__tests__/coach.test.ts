import { practiceRead } from '../coach';

describe('practiceRead', () => {
  it('withholds judgment until there are enough reps', () => {
    expect(practiceRead([5]).coach).toMatch(/few more reps/);
    expect(practiceRead([5]).spreadCs).toBeNull();
  });

  it('nudges the dominant bias first — it is the fastest felt improvement', () => {
    expect(practiceRead([-8, -5, -6]).coach).toMatch(/releasing early/);
    expect(practiceRead([8, 5, 6]).coach).toMatch(/running long/);
  });

  it('nudges consistency when bias is centered but spread is wide', () => {
    expect(practiceRead([-12, 12, -10, 10]).coach).toMatch(/consistency first/);
  });

  it('compliments a locked-in session', () => {
    expect(practiceRead([1, -1, 2, 0]).coach).toMatch(/Locked in/);
  });

  it('reads the spread trend across the session', () => {
    // Wild first half, tight second half → tightening.
    const tightening = practiceRead([-20, 18, -15, 2, -1, 1]);
    expect(tightening.trend).toBe('tightening');

    const loosening = practiceRead([1, -1, 2, -20, 18, -15]);
    expect(loosening.trend).toBe('loosening');
  });
});
