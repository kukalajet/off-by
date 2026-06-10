import { type Centiseconds, generateTarget, type StopResult, systemRng } from '@offby/core';
import { create } from 'zustand';

import { createRoundStore, type RoundSink } from '@/features/round/store';
import { logEvent } from '@/lib/analytics';

/**
 * Pass & Play (PRD F-17): local multiplayer, ONE shared target per game so
 * turns are comparable (§7). Session-scoped — a party game has no business
 * persisting. Results stay hidden until the standings ("no peeking").
 */
interface PnpGame {
  players: string[];
  targetCs: Centiseconds;
  /** Index of the player whose turn is next (== players.length when done). */
  turn: number;
  results: (StopResult | null)[];
  setup: (players: string[]) => void;
  /** Same players, fresh shared target. */
  rematch: () => void;
}

export const usePnp = create<PnpGame>()((set, get) => ({
  players: [],
  targetCs: 0,
  turn: 0,
  results: [],
  setup: (players) =>
    set({
      players,
      targetCs: generateTarget(systemRng),
      turn: 0,
      results: players.map(() => null),
    }),
  rematch: () => get().setup(get().players),
}));

const pnpSink: RoundSink = (result) => {
  const game = usePnp.getState();
  const results = [...game.results];
  results[game.turn] = result;
  usePnp.setState({ results, turn: game.turn + 1 });
  return {}; // no coins, no lifetime stats — bragging rights only
};

export const usePnpRound = createRoundStore(systemRng, pnpSink);

export interface Standing {
  name: string;
  result: StopResult | null;
  rank: number | null;
}

/** Standings: closest |delta| wins; ceilings trail; unplayed turns unranked. */
export function standings(game: Pick<PnpGame, 'players' | 'results'>): Standing[] {
  const entries = game.players.map((name, i) => ({ name, result: game.results[i] ?? null }));
  const sortKey = (r: StopResult | null) =>
    r === null ? Infinity : r.kind === 'scored' ? Math.abs(r.deltaCs) : 1_000_000;
  const sorted = [...entries].sort((a, b) => sortKey(a.result) - sortKey(b.result));
  return sorted.map((e, i) => ({ ...e, rank: e.result === null ? null : i + 1 }));
}

export function logPnpCompleted() {
  const game = usePnp.getState();
  logEvent('pnp_game_completed', {
    players: game.players.length,
    target_cs: game.targetCs,
    played: game.results.filter(Boolean).length,
  });
}
