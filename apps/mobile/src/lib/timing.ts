import type { GestureResponderEvent } from 'react-native';

/**
 * Stop-time honesty (PRD §11.1): timestamp the *input event*, never the render
 * frame. RN touch events carry `nativeEvent.timestamp` — milliseconds on the
 * platform's monotonic input clock, the earliest stamp visible from JS.
 * Start and stop stamps come from the same clock, so the fixed share of input
 * latency cancels in the delta; the /spike screen measures the residual
 * per-device jitter.
 */
export interface InputStamp {
  ms: number;
  /** 'event' = native input timestamp · 'clock' = performance.now() fallback. */
  source: 'event' | 'clock';
}

export function stampFromEvent(event: GestureResponderEvent): InputStamp {
  const ts = event.nativeEvent?.timestamp;
  if (typeof ts === 'number' && Number.isFinite(ts)) {
    return { ms: ts, source: 'event' };
  }
  return { ms: performance.now(), source: 'clock' };
}

/**
 * Delta between two stamps. Stamps from different sources don't share a zero
 * point — the round store never mixes them in practice (both taps land on the
 * same surface), so this only warns in dev rather than guessing a correction.
 */
export function elapsedMsBetween(start: InputStamp, stop: InputStamp): number {
  if (__DEV__ && start.source !== stop.source) {
    console.warn(`[timing] mixed stamp sources: ${start.source} → ${stop.source}`);
  }
  return stop.ms - start.ms;
}
