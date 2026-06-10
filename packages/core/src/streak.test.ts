import { describe, expect, it } from 'vitest';

import { advanceStreak, dayKey, INITIAL_STREAK, weekKey } from './streak';

describe('advanceStreak', () => {
  it('starts at 1 on the first play and is idempotent within a day', () => {
    const s1 = advanceStreak(INITIAL_STREAK, '2026-06-10');
    expect(s1).toMatchObject({ days: 1, lastDayKey: '2026-06-10' });
    expect(advanceStreak(s1, '2026-06-10')).toBe(s1);
  });

  it('grows on consecutive days', () => {
    let s = advanceStreak(INITIAL_STREAK, '2026-06-10');
    s = advanceStreak(s, '2026-06-11');
    expect(s.days).toBe(2);
  });

  it('a freeze forgives exactly one missed day', () => {
    let s = advanceStreak(INITIAL_STREAK, '2026-06-10'); // freezes: 1
    s = advanceStreak(s, '2026-06-12'); // missed the 11th
    expect(s.days).toBe(2);
    expect(s.freezes).toBe(0);
    // No freeze left — the next gap resets.
    s = advanceStreak(s, '2026-06-14');
    expect(s.days).toBe(1);
  });

  it('two missed days break the streak even with a freeze', () => {
    let s = advanceStreak(INITIAL_STREAK, '2026-06-10');
    s = advanceStreak(s, '2026-06-13');
    expect(s.days).toBe(1);
    expect(s.freezes).toBe(1); // not spent on a lost cause
  });

  it('earns a freeze back at the 7-day milestone', () => {
    let s = advanceStreak(INITIAL_STREAK, '2026-06-01');
    s = advanceStreak(s, '2026-06-03'); // spend the freeze (skipped the 2nd)
    expect(s.freezes).toBe(0);
    for (const day of ['2026-06-04', '2026-06-05', '2026-06-06', '2026-06-07', '2026-06-08']) {
      s = advanceStreak(s, day);
    }
    expect(s.days).toBe(7);
    expect(s.freezes).toBe(1);
  });

  it('handles month boundaries', () => {
    let s = advanceStreak(INITIAL_STREAK, '2026-06-30');
    s = advanceStreak(s, '2026-07-01');
    expect(s.days).toBe(2);
  });
});

describe('day/week keys', () => {
  it('formats local calendar days', () => {
    expect(dayKey(new Date(2026, 5, 10))).toBe('2026-06-10');
  });

  it('weekKey is the Monday of the week, stable across the week', () => {
    // 2026-06-10 is a Wednesday; its week starts Monday 2026-06-08.
    expect(weekKey(new Date(2026, 5, 10))).toBe('2026-06-08');
    expect(weekKey(new Date(2026, 5, 8))).toBe('2026-06-08');
    expect(weekKey(new Date(2026, 5, 14))).toBe('2026-06-08'); // Sunday
    expect(weekKey(new Date(2026, 5, 15))).toBe('2026-06-15'); // next Monday
  });
});
