import { formatSeconds } from '@offby/core';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { usePnp, usePnpRound } from '@/features/pnp/store';
import { RoundSurface } from '@/features/round/round-surface';

/**
 * PnP — Round (the fifth re-dress of the same surface): the shared target,
 * one player's turn. No per-turn reveal — results stay sealed until the
 * standings ("no peeking"), so a resolved stop routes straight onward.
 */
export default function PnpRunScreen() {
  const router = useRouter();
  const players = usePnp((s) => s.players);
  const turn = usePnp((s) => s.turn);
  const phase = usePnpRound((s) => s.phase);

  // The sink advanced `turn` before phase hit 'reveal'.
  useEffect(() => {
    if (phase !== 'reveal') return;
    if (usePnp.getState().turn >= players.length) router.replace('/pnp/winner');
    else router.replace('/pnp/handoff');
  }, [phase, players.length, router]);

  const name = players[Math.min(turn, players.length - 1)] ?? '';

  return (
    <RoundSurface
      useStore={usePnpRound}
      revealGlow={false}
      context={(t) => ({
        label: `TURN ${Math.min(turn + 1, players.length)} OF ${players.length}`,
        value: `${name} · aim for ${formatSeconds(t)}`,
        subline: `${name} — tap to lock it in`,
      })}
      beginOnMount={() => usePnpRound.getState().begin(usePnp.getState().targetCs)}
      renderReveal={() => null}
    />
  );
}
