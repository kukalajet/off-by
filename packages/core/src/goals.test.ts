import { describe, expect, it } from 'vitest';

import { GOAL_POOL, goalsFor } from './goals';
import { mean, stddev } from './math';

describe('goalsFor', () => {
  it('deals two distinct dailies plus the weekly, deterministically', () => {
    const a = goalsFor('2026-06-10', '2026-06-08');
    const b = goalsFor('2026-06-10', '2026-06-08');
    expect(a).toEqual(b);
    expect(a).toHaveLength(3);
    expect(a.filter((g) => g.period === 'daily')).toHaveLength(2);
    expect(a.filter((g) => g.period === 'weekly')).toHaveLength(1);
    expect(new Set(a.map((g) => g.id)).size).toBe(3);
  });

  it('re-deals across days but keeps the week goal stable within a week', () => {
    const days = ['2026-06-08', '2026-06-09', '2026-06-10', '2026-06-11', '2026-06-12'];
    const deals = days.map((d) => goalsFor(d, '2026-06-08'));
    const weekly = new Set(deals.map((g) => g.find((x) => x.period === 'weekly')!.id));
    expect(weekly.size).toBe(1);
    const dailySignatures = new Set(
      deals.map((g) =>
        g
          .filter((x) => x.period === 'daily')
          .map((x) => x.id)
          .join('+'),
      ),
    );
    expect(dailySignatures.size).toBeGreaterThan(1); // dailies actually rotate
  });

  it('every pool entry is reachable and well-formed', () => {
    for (const g of GOAL_POOL) {
      expect(g.target).toBeGreaterThan(0);
      expect(g.label.length).toBeGreaterThan(0);
    }
  });
});

describe('math helpers', () => {
  it('mean and stddev behave on the basics', () => {
    expect(mean([])).toBeNull();
    expect(mean([4, 6])).toBe(5);
    expect(stddev([4])).toBeNull();
    expect(stddev([2, 2, 2])).toBe(0);
    expect(stddev([2, 4])).toBe(1);
  });
});
