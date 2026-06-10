/**
 * Streak math (PRD F-11): consecutive days played, with a freeze — one
 * forgiven missed day — so a single off-day doesn't trigger the
 * loss-aversion cliff. Pure date-key arithmetic; the app supplies "today".
 */
export const STREAK_RULES = {
  maxFreezes: 1,
  /** Earn a freeze back at every Nth consecutive day. */
  freezeEveryDays: 7,
} as const;

export interface StreakState {
  days: number;
  freezes: number;
  lastDayKey: string | null;
}

export const INITIAL_STREAK: StreakState = {
  days: 0,
  freezes: STREAK_RULES.maxFreezes,
  lastDayKey: null,
};

/** Local-calendar day key, e.g. "2026-06-10". */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ISO-week-ish key for weekly goals: the Monday of the week, as a day key. */
export function weekKey(date: Date): string {
  const monday = new Date(date);
  const offset = (date.getDay() + 6) % 7; // Mon=0 … Sun=6
  monday.setDate(date.getDate() - offset);
  return dayKey(monday);
}

function daysBetween(fromKey: string, toKey: string): number {
  // Day keys are local-calendar dates; UTC parse keeps the diff exact.
  const from = Date.parse(`${fromKey}T00:00:00Z`);
  const to = Date.parse(`${toKey}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}

/** Advance the streak for a play on `today`. Idempotent within a day. */
export function advanceStreak(s: StreakState, today: string): StreakState {
  if (s.lastDayKey === null) {
    return { days: 1, freezes: s.freezes, lastDayKey: today };
  }
  const gap = daysBetween(s.lastDayKey, today);
  if (gap <= 0) return s; // same day (or clock weirdness) — no change

  if (gap === 1 || (gap === 2 && s.freezes > 0)) {
    const days = s.days + 1;
    const freezeSpent = gap === 2 ? 1 : 0;
    const freezeEarned = days % STREAK_RULES.freezeEveryDays === 0 ? 1 : 0;
    return {
      days,
      freezes: Math.min(STREAK_RULES.maxFreezes, s.freezes - freezeSpent + freezeEarned),
      lastDayKey: today,
    };
  }

  // Streak broken — start over (freezes are kept; they're earned, not reset).
  return { days: 1, freezes: s.freezes, lastDayKey: today };
}
