import { createSeededRng, seedFromString } from './rng';

/**
 * Light, refreshable goals (PRD F-11b): achievement-style counts, never
 * XP/levels. Each day deals two daily goals plus the week's standing goal,
 * picked deterministically from the pool by date seed — same goals all day,
 * fresh at midnight, no server (F-7).
 */
export type GoalMetric = 'rounds' | 'greats' | 'bullseyes' | 'days';

export interface GoalDef {
  id: string;
  label: string;
  metric: GoalMetric;
  target: number;
  period: 'daily' | 'weekly';
}

export const GOAL_POOL: readonly GoalDef[] = [
  { id: 'rounds-10', label: 'Play 10 rounds', metric: 'rounds', target: 10, period: 'daily' },
  { id: 'rounds-25', label: 'Play 25 rounds', metric: 'rounds', target: 25, period: 'daily' },
  { id: 'greats-3', label: 'Land 3 Greats', metric: 'greats', target: 3, period: 'daily' },
  { id: 'greats-7', label: 'Land 7 Greats', metric: 'greats', target: 7, period: 'daily' },
  { id: 'bullseye-1', label: 'Hit a perfect 0.00', metric: 'bullseyes', target: 1, period: 'daily' },
  { id: 'days-4', label: 'Play 4 days this week', metric: 'days', target: 4, period: 'weekly' },
  { id: 'days-7', label: 'Play every day this week', metric: 'days', target: 7, period: 'weekly' },
];

const DAILY_COUNT = 2;

/** The day's deal: two seeded daily goals + the week's goal. */
export function goalsFor(dayKey: string, weekKey: string): GoalDef[] {
  const dailies = GOAL_POOL.filter((g) => g.period === 'daily');
  const weeklies = GOAL_POOL.filter((g) => g.period === 'weekly');

  const dayRng = createSeededRng(seedFromString(`goals:${dayKey}`));
  const picked: GoalDef[] = [];
  const pool = [...dailies];
  for (let i = 0; i < DAILY_COUNT && pool.length > 0; i++) {
    const idx = Math.floor(dayRng.next() * pool.length);
    picked.push(...pool.splice(idx, 1));
  }

  const weekRng = createSeededRng(seedFromString(`goals:${weekKey}`));
  const weekly = weeklies[Math.floor(weekRng.next() * weeklies.length)];
  if (weekly) picked.push(weekly);

  return picked;
}
