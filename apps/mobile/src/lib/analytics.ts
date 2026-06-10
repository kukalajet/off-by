/**
 * Thin local event facade (PLAN §3 — instrument from Phase 1, vendor picked
 * later). Event names follow PRD §12. The only derived number anyone reads
 * today is rounds-this-session: the north-star metric's local counter.
 */
type EventName =
  | 'round_started'
  | 'round_completed'
  | 'round_misfired'
  | 'retry_tapped'
  | 'share_tapped';

type EventProps = Record<string, string | number | boolean>;

let roundsThisSession = 0;

export function logEvent(name: EventName, props?: EventProps) {
  if (name === 'round_completed') roundsThisSession += 1;
  if (__DEV__ && process.env.NODE_ENV !== 'test') {
    console.log(`[analytics] ${name}`, props ?? {});
  }
}

export function getRoundsThisSession(): number {
  return roundsThisSession;
}
