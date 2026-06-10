import { GAUNTLET_RULES, gauntletBandCs } from '@offby/core';

import { useGauntletBest, useGauntletRound, useGauntletRun } from '../store';

const stamp = (ms: number) => ({ ms, source: 'clock' as const });

/** Play one round: land `deltaCs` away from whatever target is armed. */
function playRound(deltaCs: number, at = 0) {
  const target = useGauntletRound.getState().targetCs;
  useGauntletRound.getState().start(stamp(at));
  useGauntletRound.getState().stop(stamp(at + target * 10 + deltaCs * 10));
}

describe('gauntlet run', () => {
  beforeEach(() => {
    useGauntletBest.setState({ bestScore: 0 });
    useGauntletRun.getState().startRun();
    useGauntletRound.getState().begin(150);
  });

  it('a hit inside the band survives, scores, and chains into the next round', () => {
    playRound(2); // band r1 = ±20 → comfortable hit
    const run = useGauntletRun.getState();
    expect(run.round).toBe(2);
    expect(run.cleared).toBe(1);
    expect(run.score).toBeGreaterThan(0);
    expect(run.tightestAbsCs).toBe(2);
    expect(run.over).toBe(false);
    // Chained: machine is already armed on a fresh target, no Reveal stop.
    expect(useGauntletRound.getState().phase).toBe('ready');
    expect(useGauntletRound.getState().result).toBeNull();
  });

  it('a landing outside the band costs a life but the run rolls on', () => {
    playRound(gauntletBandCs(1) + 5);
    const run = useGauntletRun.getState();
    expect(run.lives).toBe(GAUNTLET_RULES.lives - 1);
    expect(run.round).toBe(2);
    expect(run.cleared).toBe(0);
    expect(run.over).toBe(false);
  });

  it('the third lost life ends the run and records the best score', () => {
    playRound(2, 0); // bank some score first
    playRound(99, 10_000);
    playRound(99, 20_000);
    playRound(99, 30_000);
    const run = useGauntletRun.getState();
    expect(run.lives).toBe(0);
    expect(run.over).toBe(true);
    expect(useGauntletRound.getState().phase).toBe('reveal'); // surface exits here
    expect(useGauntletBest.getState().bestScore).toBe(run.score);
  });

  it('voluntary End run keeps the score and finishes cleanly', () => {
    playRound(1);
    const scoreSoFar = useGauntletRun.getState().score;
    useGauntletRun.getState().endRun();
    expect(useGauntletRun.getState().over).toBe(true);
    expect(useGauntletBest.getState().bestScore).toBe(scoreSoFar);
  });
});
