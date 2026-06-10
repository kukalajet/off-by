import { COIN_REWARDS, createSeededRng } from '@offby/core';

import { useStats } from '@/features/stats/store';
import { useWallet } from '@/features/wallet/store';

import { createRoundStore, type RoundSink } from '../store';

const stamp = (ms: number) => ({ ms, source: 'clock' as const });

describe('round store', () => {
  beforeEach(() => {
    useStats.getState().reset();
    useWallet.getState().reset();
  });

  it('walks Ready → Run → Reveal, scoring through @offby/core', () => {
    const store = createRoundStore(createSeededRng(42));
    const target = store.getState().targetCs;

    store.getState().start(stamp(10_000));
    expect(store.getState().phase).toBe('running');

    // Stop 40ms late → +0.04s → Great (the calibration anchor).
    store.getState().stop(stamp(10_000 + target * 10 + 40));
    const s = store.getState();
    expect(s.phase).toBe('reveal');
    expect(s.result).toEqual({
      kind: 'scored',
      elapsedCs: target + 4,
      deltaCs: 4,
      tier: 'great',
    });
    expect(s.coinsEarned).toBe(COIN_REWARDS.great);
    expect(useWallet.getState().coins).toBe(COIN_REWARDS.great);
    expect(useStats.getState().roundsPlayed).toBe(1);
    expect(useStats.getState().biasSumCs).toBe(4);
  });

  it('discards a misfire: back to Ready, same target, nothing scored or paid', () => {
    const store = createRoundStore(createSeededRng(7));
    const target = store.getState().targetCs;

    store.getState().start(stamp(500));
    store.getState().stop(stamp(550));

    const s = store.getState();
    expect(s.phase).toBe('ready');
    expect(s.misfired).toBe(true);
    expect(s.targetCs).toBe(target);
    expect(s.result).toBeNull();
    expect(useWallet.getState().coins).toBe(0);
    expect(useStats.getState().roundsPlayed).toBe(0);
  });

  it('auto-resolves the 30s ceiling as a paid Miss without a stop tap', () => {
    jest.useFakeTimers();
    try {
      const store = createRoundStore(createSeededRng(9));
      store.getState().start(stamp(1_000));
      jest.advanceTimersByTime(30_000);

      expect(store.getState().phase).toBe('reveal');
      expect(store.getState().result).toEqual({ kind: 'ceiling' });
      expect(store.getState().coinsEarned).toBe(COIN_REWARDS.miss);
      // No honest delta exists, so the ceiling never pollutes bias/best stats.
      expect(useStats.getState().roundsPlayed).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it('retry lands on Ready with a fresh roll and a cleared result', () => {
    const store = createRoundStore(createSeededRng(123));
    const first = store.getState().targetCs;

    store.getState().start(stamp(0));
    store.getState().stop(stamp(5_000));
    store.getState().retry();

    const s = store.getState();
    expect(s.phase).toBe('ready');
    expect(s.result).toBeNull();
    expect(s.coinsEarned).toBe(0);
    // Deterministic seed — if these two draws ever collide, change the seed.
    expect(s.targetCs).not.toBe(first);
  });

  it('a sink returning nextTargetCs chains straight into the next Ready (Gauntlet survive)', () => {
    const chainSink: RoundSink = () => ({ nextTargetCs: 444 });
    const store = createRoundStore(createSeededRng(11), chainSink);
    const target = store.getState().targetCs;

    store.getState().start(stamp(0));
    store.getState().stop(stamp(target * 10)); // dead-on, resolved

    const s = store.getState();
    expect(s.phase).toBe('ready'); // no Reveal stop — chained
    expect(s.targetCs).toBe(444);
    expect(s.result).toBeNull();
    expect(useWallet.getState().coins).toBe(0); // sink paid nothing
  });

  it('ignores a start while running and a stop while ready', () => {
    const store = createRoundStore(createSeededRng(1));
    store.getState().stop(stamp(100));
    expect(store.getState().phase).toBe('ready');

    store.getState().start(stamp(200));
    const startStamp = store.getState().startStamp;
    store.getState().start(stamp(300));
    expect(store.getState().startStamp).toEqual(startStamp);

    store.getState().reset(); // clear the pending ceiling timer
  });
});
