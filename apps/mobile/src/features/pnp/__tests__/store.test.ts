import { standings, usePnp, usePnpRound } from '../store';

const stamp = (ms: number) => ({ ms, source: 'clock' as const });

describe('pass & play', () => {
  it('holds ONE shared target for the whole game (PRD §7)', () => {
    usePnp.getState().setup(['Alex', 'Sam']);
    const target = usePnp.getState().targetCs;

    // Alex plays.
    usePnpRound.getState().begin(target);
    usePnpRound.getState().start(stamp(0));
    usePnpRound.getState().stop(stamp(target * 10 + 20));

    expect(usePnp.getState().turn).toBe(1);
    expect(usePnp.getState().targetCs).toBe(target); // unchanged for Sam

    // Sam plays the same target.
    usePnpRound.getState().begin(target);
    usePnpRound.getState().start(stamp(50_000));
    usePnpRound.getState().stop(stamp(50_000 + target * 10 - 50));

    expect(usePnp.getState().turn).toBe(2);
    const results = usePnp.getState().results;
    expect(results).toHaveLength(2);
    expect(results.every((r) => r?.kind === 'scored')).toBe(true);
  });

  it('ranks standings by closeness, unplayed turns unranked', () => {
    const board = standings({
      players: ['Alex', 'Sam', 'Maya'],
      results: [
        { kind: 'scored', elapsedCs: 252, deltaCs: 2, tier: 'insane' },
        { kind: 'scored', elapsedCs: 261, deltaCs: 11, tier: 'good' },
        null,
      ],
    });
    expect(board.map((s) => s.name)).toEqual(['Alex', 'Sam', 'Maya']);
    expect(board[0]!.rank).toBe(1);
    expect(board[2]!.rank).toBeNull();
  });

  it('a rematch keeps the players and re-rolls the shared target', () => {
    usePnp.getState().setup(['Alex', 'Sam']);
    usePnp.setState({ targetCs: 123 }); // pin to detect the re-roll
    usePnp.getState().rematch();
    const game = usePnp.getState();
    expect(game.players).toEqual(['Alex', 'Sam']);
    expect(game.turn).toBe(0);
    expect(game.results).toEqual([null, null]);
    expect(game.targetCs).not.toBe(123);
  });
});
