# Off By — Product Requirements Document

| | |
|---|---|
| **Working title** | Off By *(placeholder — confirm App Store / Google Play availability and run a trademark check before locking)* |
| **Product** | Hyper-casual mobile timing game |
| **Platforms** | iOS, Android (portrait, one-handed) |
| **Document status** | Draft v0.2 |
| **Owner** | _TBD_ |
| **Last updated** | 2026-06-09 |

---

## 1. Summary

Off By is a hyper-casual mobile game that tests a player's internal sense of time. The player is given a target (e.g. *5.00 seconds*), starts a hidden timer, and taps again when they believe the time has elapsed. The game reveals the result to the hundredth of a second — and tells them exactly how far off they were.

The entire product is built around a single emotional beat: the **near miss**. "Off by 0.03s" stings just enough to trigger an immediate retry. Everything else in this document — modes, progression, social features, monetization — exists to extend and re-trigger that beat over days and weeks rather than minutes.

**One-line pitch:** *How good is your internal clock? Tap to find out — then try to beat it.*

---

## 2. Opportunity & Positioning

The "guess the time" / "stop the timer at exactly X" format has repeatedly gone viral as a party challenge and short-form video format. It travels well because the rules need no explanation, the failure is funny, and the result is inherently shareable. No incumbent owns it as a polished, retention-engineered mobile product.

**Positioning:** the most *satisfying* and *fair* version of the timing challenge — fast to play, honest about your score, and built to be shared.

**Why it fits hyper-casual economics:**
- Near-zero learning curve → high install-to-first-play conversion.
- Sub-15-second sessions → high session frequency, dense ad inventory.
- Built-in "one more try" loop → strong rewarded-ad surface.
- Shareable results → organic install assist, lower effective CPI.

---

## 3. Goals & Non-Goals

### Product goals
1. Deliver a core loop that feels instant, precise, and *fair*.
2. Make the reveal moment maximally satisfying (visual + haptic + audio "juice").
3. Convert the near-miss frustration into voluntary repeat plays — never coerced ones.
4. Give players a low-friction reason to return tomorrow and a reason to share today.

### Business goals
1. Validate retention (D1) and unit economics (LTV ≥ CPI) before scaling paid UA.
2. Monetize primarily through ads, with light cosmetic IAP as upside.

### Non-goals (explicitly out of scope for v1)
- Real-money wagering or skill-based cash competition.
- Accounts/login as a requirement to play (play must start instantly; auth is optional and only for cloud features).
- Deep meta-progression, narrative, or RPG systems — XP, levels, skill trees, persistent power. *(Light, refreshable goals and achievements **are** in scope per §8.2; the boundary is no persistent power/level economy.)*
- Cross-platform real-time multiplayer (pass-and-play covers social in v1).
- Treating the global "perfect hit" board as a true competitive ranking — see §11.2 for why.

---

## 4. Success Metrics

Targets below are initial benchmarks for a hyper-casual title; tune against live data.

| Metric | Target (v1) | Why it matters |
|---|---|---|
| Install → first round played | ≥ 90% | Validates the "instant play" promise |
| D1 retention | ≥ 35% | Core hyper-casual viability gate |
| D7 retention | ≥ 12% | Indicates the meta loop is working |
| Avg sessions / DAU / day | ≥ 4 | Confirms the snackable loop |
| Avg session length | 20–90 s | Healthy for the format |
| Rounds per session | ≥ 5 | Direct read on the "one more try" hook |
| Rewarded-ad engagement (DAU) | ≥ 25% | Primary revenue lever |
| Ad ARPDAU | track | Core monetization KPI |
| Share rate (rounds → shares) | ≥ 2% | Virality / organic assist |
| LTV vs CPI | LTV ≥ CPI | Go/no-go for paid scaling |

**North-star metric:** rounds played per daily active user. It captures the loop's health more directly than retention alone.

---

## 5. Target Audience

| Segment | Description | What they want |
|---|---|---|
| **Casual time-killers** | Commuters, queue-waiters, the bored. Primary volume. | A quick, self-contained challenge with no commitment |
| **Self-improvers** | Players who want to *master* their internal clock and beat a personal best | A *visible* skill curve: bias (early/late tendency), consistency trend, and a Practice mode that coaches real improvement |
| **Social sharers** | Players who play to compare and to post | Shareable results, friend challenges, leaderboards |
| **Party players** | Groups using pass-and-play as a real-life game | Fast turn-taking, clear winner, light trash-talk fuel |

---

## 6. Core Gameplay Loop

The loop is four states. Latency and clarity at each transition are what make the game feel good.

1. **Prompt** — A target time is shown clearly (e.g. `5.00s`) with a single primary action: **Start**.
2. **Run** — On tap-down the timer begins and the on-screen number **immediately hides** (the screen may show neutral/ambient feedback but never the elapsed count). The same button now reads **Stop** (or the whole screen is tappable).
3. **Guess** — Player taps again to stop. The exact elapsed time is captured at the input event (see §11.1).
4. **Reveal** — The game animates the result: the player's time, the target, and the signed delta ("**Off by +0.03s**" / "**−0.12s**"), plus an accuracy tier, coins earned, and a haptic/audio flourish scaled to how close they were.

From Reveal the player can: **Retry** (same or new target), **Share**, or return to menu. The default, most prominent action is the next attempt.

**Critical loop principle:** the time from Reveal to the next Run must be near-instantaneous. Any friction here (a forced interstitial, a slow animation, a confirmation tap) directly suppresses rounds-per-session, the north-star metric. Interstitials are gated on round *count*, never inserted between a near miss and its retry.

**Round bounds & misfires.** A round auto-resolves as a Miss after a generous hard ceiling (e.g. 30s) so a forgotten Stop can't hang the session. A stop faster than human intent allows (e.g. < 100ms) is treated as a misfire — discarded, not scored — protecting both the player's stats and ranked integrity (§11.3).

---

## 7. Game Modes

| Mode | Description | Priority |
|---|---|---|
| **Classic** | Single round against a fixed or random target. The default. | **P0** |
| **Practice** | Unscored, no-stakes loop with richer per-round feedback — your running bias, consistency, and a coaching nudge ("you stopped 0.06s early; hold one more beat"). The self-improver's home and the best Daily Challenge on-ramp. No coins, no leaderboard: the feedback *is* the reward. | **P1** |
| **Gauntlet** | Consecutive rounds with escalating targets; one "miss" (outside a tolerance band) ends the run. Produces a score = rounds survived / cumulative accuracy. | **P1** |
| **Daily Challenge** | One shared target (and modifier) per day via a global seed, so every player faces the same test — ideal for comparison and sharing. One scored attempt; unlimited practice. | **P1** |
| **Distraction** | Core loop with deliberate sensory interference during the Run state (flashing visuals, audio, decoy countdowns) to break the player's internal count. Doubles as a fair-play tool — external rhythm sources (a metronome, a song's tempo) are blunted along with the player's own count (§11.3). | **P1** |
| **Blindfold** | Maximal sensory deprivation: blank screen, no ambient cues, optional silence. Pure internal-clock test. | **P2** |
| **Pass-and-Play** | Local multiplayer: 2+ players take turns on the same device against a shared target; the app tracks turns and declares a winner. No network needed. | **P1** |

**Target generation:** Classic/Gauntlet draw from a tuned range (proposed 1.00–15.00s; sub-~1s targets are reaction-dominated rather than internal-clock tests, so keep the floor sensible). Avoid only "round" targets — odd targets (e.g. 7.30s) are harder, feel fresher, *and* make a pre-set external metronome useless, since the player must still track the fractional remainder internally (§11.3). Daily Challenge uses a date-seeded RNG so the value is identical for all players that day.

---

## 8. Features & Requirements

Prioritization: **P0** = MVP / must-ship. **P1** = fast-follow for retention & virality. **P2** = later.

### 8.1 Core (P0)
- **F-1** Display a target time clearly before the round.
- **F-2** Start timer on tap-down; hide the elapsed count for the duration of the Run state.
- **F-3** Capture stop time at the input event using a high-resolution monotonic clock (§11.1).
- **F-4** Reveal: player time, target, signed delta (two decimals — see §10, §11.2), and accuracy tier.
- **F-5** Scaled feedback on reveal — haptics + sound + animation whose intensity maps to accuracy.
- **F-6** Instant **Retry** with minimal friction.
- **F-7** Local persistence of best result and basic stats (offline-first; no login required).
- **F-8** First-run experience teaches the loop in one guided round, no text walls.

### 8.2 Retention (P1)
- **F-9** Daily Challenge with shared seed + a return reason (streak), surfaced as a **percentile** ("you beat 78% of today's players") rather than a demoralizing global rank.
- **F-10** Personal stats decomposed into the three things a player can actually improve: **closeness** (best / average absolute error), **bias** (signed early-vs-late tendency), and **consistency** (spread of your error), each trended over time. Bias and consistency — not raw closeness — are what make the skill curve *visible*.
- **F-10b** **Practice mode**: unscored loop with live bias/consistency feedback and a coaching nudge; the self-improver's home and the best Daily Challenge on-ramp. No coins, no leaderboard.
- **F-11** Streaks (consecutive days played) with light reward and a **streak freeze** (one forgiven miss per period) so a single off-day doesn't trigger loss-aversion churn.
- **F-11b** Light, refreshable **goals** (daily/weekly — "land 3 Greats," "tighten your spread below 0.08s"). Achievement-style only; explicitly *not* XP/levels/RPG (§3).
- **F-12** Gauntlet mode and per-mode high scores.
- **F-13** Optional push notification for the daily challenge (opt-in; respectful frequency; personalized hook — "today's target is 7.30s; beat yesterday's 0.04s").

### 8.3 Social & Virality (P1 / P2)
- **F-14** Shareable result card — an auto-generated image of "Your time vs target, off by X" suitable for stories/feeds. *(P1)*
- **F-15** Challenge-a-friend link: shares the exact target/seed so a friend plays the same round, then compares. *(P1)*
- **F-16** Leaderboards, framed for fairness: the Daily Challenge ranks by accuracy **banded into tiers and surfaced as a percentile**, not raw milliseconds (§11.2); the all-time "closest hit" board is explicitly **celebratory vanity, not a ranking** (§11.2). Requires lightweight account/cloud (§11.4). *(P1)*
- **F-17** Pass-and-play turn manager and winner screen. *(P1)*
- **F-18** Friends/social graph. *(P2)*

### 8.4 Progression & Cosmetics (P1)
- **F-19** Soft currency ("coins") awarded per round, scaled by accuracy (§9).
- **F-20** Cosmetics shop: button skins, color themes, haptic patterns, sound packs.
- **F-21** Rewarded-ad and IAP paths to currency/cosmetics (§9).
- **F-22** No cosmetic affects timing, fairness, or measurement — purely aesthetic.

---

## 9. Progression, Economy & Monetization

### 9.1 Accuracy tiers (proposed defaults — tune to device noise floor)
Tiers drive both feedback intensity and coin rewards. **Each tier is computed from the same rounded, two-decimal value the player sees** (§10, §11.2), so the displayed result and the tier can never disagree — and every threshold lands on the 0.01s lattice for the same reason. Per §11.2, the tightest band sits near or below input-latency noise on many devices, so a Bullseye is partly hardware and luck — which is exactly why we treat it as celebration, not ranking.

| Tier | Absolute error (rounded, as shown) | Feel |
|---|---|---|
| Bullseye | reads **0.00s** (≤ 0.005 s) | Maximum celebration — the rare "perfect" |
| Insane | ≤ 0.02 s | Big payoff |
| Great | ≤ 0.05 s | Strong positive |
| Good | ≤ 0.15 s | Satisfying |
| Close | ≤ 0.30 s | The near-miss sting |
| Miss | > 0.30 s | Light, non-punishing |

### 9.2 Currency
Coins are earned every round, more for tighter tiers (e.g. Bullseye 100 → Close 5, Miss 1). Daily Challenge and Gauntlet award bonuses. Coins are **soft currency only**: they buy cosmetics. Practice mode awards **no coins** — its payoff is the feedback, which keeps it a training ground rather than a currency grind. Tunable; values above are illustrative.

### 9.3 Monetization model
Primary revenue is advertising, standard for hyper-casual, with cosmetic IAP as upside.

| Surface | Mechanic | Notes |
|---|---|---|
| **Interstitial ads** | Shown every *N* rounds or on menu transitions | **Frequency-capped**; never between a near miss and its immediate retry (protects the core loop) |
| **Rewarded video** | Opt-in: double coins, retry a Gauntlet, or unlock-trial a cosmetic | The main lever; pairs naturally with the "one more try" urge |
| **Remove Ads (IAP)** | One-time purchase removes interstitials | Keep rewarded video available by player choice |
| **Coin packs (IAP)** | Optional currency purchase | Low-emphasis; cosmetics-only sink keeps it non-pay-to-win |
| **Cosmetic bundles (IAP)** | Themed skin/sound/haptic packs | Direct cosmetic purchase path |

**Monetization principles:** the game is never harder, less fair, or less accurate for non-payers. Ads serve the loop's rhythm rather than interrupting its emotional peak. Per Anthropic-independent app norms and platform policy, ad placement respects store guidelines and avoids dark patterns.

---

## 10. UX & UI Principles

- **Instant play.** App-open to first playable round in the fewest possible taps; no login, no menu maze.
- **One-handed, thumb-first.** Primary action reachable in the lower-center; the whole screen is a valid tap target during a round to remove aiming error.
- **Reveal is the showpiece.** The result screen gets the most design love — animation, haptics, and sound calibrated to accuracy. This is the moment players screenshot and share.
- **Honest and legible — we show only what we can actually measure.** Every time is shown to two decimals (hundredths, 0.01s) and the signed delta is the hero number. We deliberately do *not* show a third decimal: on consumer phones the measurement noise floor is tens of milliseconds (§11.2), so a millisecond digit would imply a precision the hardware doesn't have — the exact dishonesty this product exists to avoid. A "perfect" hit is simply when the displayed result reads **0.00s**. Never fudge a result to be kinder — the honesty *is* the product.
- **Quiet failure.** Misses are lightly handled, never mocking or punishing, to keep the retry inviting.
- **Accessibility.** Colorblind-safe accuracy cues (not color-only); haptics and sound each independently toggleable; respects system reduce-motion and silent-mode; sufficient contrast and tap-target sizing.
- **Settings.** Toggle haptics, sound, distraction effects; reset stats; manage notifications; restore purchases.

---

## 11. Technical Requirements

> **The hardest and most important engineering problem in this game is honest, fair time measurement.** A game whose entire premise is millisecond precision lives or dies on whether that precision is real. Treat §11.1–11.2 as foundational, not detail.

### 11.1 Timing & input measurement
- **Use a high-resolution monotonic clock** (e.g. `CLOCK_MONOTONIC` / `mach_absolute_time` on iOS, `System.nanoTime` / `SystemClock.elapsedRealtimeNanos` on Android). Never wall-clock time, which can jump.
- **Timestamp the input event, not the render frame.** Measure the delta between the *touch-down events* of start and stop, captured as early in the input pipeline as the platform allows — decoupled from the display refresh and animation loop. Measuring at frame boundaries injects up to one refresh interval (~16.7ms at 60Hz) of error.
- **Account for, and where possible characterize, input latency.** Touchscreen sampling, OS event delivery, and engine overhead add tens of milliseconds of largely fixed-plus-jittery delay that varies by device. The *start* and *stop* taps share most of this fixed latency, so it partially cancels in the delta — but jitter does not. Document the assumption and, if feasible, run a one-time/implicit latency estimate per device.
- **Minimize work in the input path.** Keep the start/stop handlers lean so measurement isn't delayed by animation or audio dispatch.

### 11.2 The precision problem (and what "perfect" can honestly mean)
On consumer phones the realistic measurement noise floor is on the order of tens of milliseconds and **varies by device and refresh rate**. Implications the team must accept and design around:

- A "Bullseye" band of ≤10ms may be at or below the noise floor on many devices — meaning the tightest hits are partly hardware and luck, not pure skill.
- A global **"closest hit ever"** board therefore is **not a fair cross-device competition**; it will tend to reward whoever has the lowest-latency hardware and the most attempts.

**Measurement → display pipeline.** Measure at full clock resolution, then round **once** — to two decimals — at the moment of display, and derive the accuracy tier from that same rounded value. The player sees exactly one number, and it is the number everything downstream is computed from. We never store, rank, or reward a precision finer than what we show (§10). This is why "perfect" is defined as a displayed **0.00s**, not an un-showable sub-millisecond claim.

**Design responses (decide before building leaderboards):**
1. **Frame perfect hits as celebratory vanity, not ranked competition.** Keep the "off by 0.00" moment as a delightful rare event; don't treat the all-time board as a serious ranking.
2. **Anchor real competition in same-device, same-session comparison** — personal bests, Gauntlet runs, pass-and-play — where latency is shared and cancels.
3. **Make the Daily Challenge the fairest competitive surface**: everyone faces the same target the same day; rank by accuracy distribution, and consider banding scores (tiers) rather than raw milliseconds so sub-noise differences don't dominate the ladder.
4. **Anti-cheat targets *automation*, not cognition (§11.3).** Where leaderboards are involved, scores are server-validatable; reject physically implausible deltas and statistically inhuman input patterns. Counting in your head is skill; a macro is not.

This is a genuine product tension, not a bug to be fixed — surfacing it honestly is part of being the "fair" version of the genre.

### 11.3 Fair play: what counts as your "internal clock"

The game tests your *internal* sense of time — but a phone can't see inside your head, and the honest design accepts that rather than pretending to police it.

- **Cognitive strategies are skill, not cheating.** Subvocal counting ("one-Mississippi"), holding a remembered tempo, rhythmic anticipation — these *are* the game. We never detect or discourage them; for many players, learning to count well *is* the skill curve.
- **Solo play is unpoliced by design.** If someone uses a wall clock or a stopwatch in Classic or Practice, they're only cheating themselves — there's nothing to win but their own number. We spend zero engineering trying to stop it.
- **Ranked surfaces are defended by design and low stakes, not surveillance.** For the Daily Challenge and leaderboards fairness matters — but we *still* can't detect someone glancing at a clock, so we don't build on that fantasy. Instead:
  - **Make external references useless.** Odd targets (7.30s, not 5.00s) and per-day modifiers mean a pre-set metronome or a known song's tempo doesn't map to the answer; Distraction-style interference (§7) blunts external rhythm sources further. The fractional remainder still has to be tracked internally.
  - **Keep the stakes vanity-only.** Coins are cosmetics; there is no cash prize and no skill-for-cash mode (§3). Low reward for cheating is itself a defense — nobody rigs a ladder that pays out bragging rights.
  - **Detect automation, which *is* detectable.** Input injection, macros, and bots produce statistically inhuman consistency and inter-tap distributions; those are server-flaggable and bannable (§11.2). The enforceable line is human-vs-machine, not strategy-vs-no-strategy.

This is the same honesty stance as the precision problem: name the limit out loud, design within it, and don't sell a fairness we can't deliver.

### 11.4 Platform, engine & architecture
- **Offline-first.** The full single-player game works with no connectivity; cloud features layer on top.
- **Engine choice is a real tradeoff for a timing game.** Unity is the hyper-casual standard (fast dev, mature ad-mediation SDKs) but carries more input-to-measurement overhead; native (Swift/Kotlin) or a lean framework gives tighter control of the input path. **Recommendation:** prototype the input-timing path on the candidate engine *first* and let measured latency/jitter decide, rather than defaulting to Unity on momentum.
- **Ads:** integrate a mediation layer (e.g. an industry ad-mediation SDK) for interstitial + rewarded inventory.
- **Backend (only for cloud features):** lightweight, anonymous-by-default identity; leaderboard + daily-seed service; server-validatable scores. Keep it minimal — most of the game needs no server.
- **Daily seed:** deterministic, date-based, identical for all players; generated/validated server-side so the day's target can't be trivially spoofed for the ranked attempt.

### 11.5 Performance & quality bars
- Cold start to first playable round: target < 3s on mid-tier devices.
- Consistent frame rate during the loop; no GC hitches in the input/measurement path.
- Crash-free sessions ≥ 99.5%.
- Respect device silent mode, reduce-motion, and battery/thermal behavior.

---

## 12. Analytics & Instrumentation

Instrument from day one — UA scaling decisions depend on it.

- **Core loop:** round_started, round_completed (target, player_time, signed_error, tier, mode), retry_tapped, share_tapped, share_completed.
- **Monetization:** interstitial_shown/clicked, rewarded_offered/started/completed/rewarded, iap_viewed/purchased, remove_ads_purchased.
- **Retention:** session_start/end, daily_challenge_played, practice_round_completed, streak_extended/broken/frozen, goal_assigned/completed, notification_received/opened.
- **Progression:** coins_earned/spent, cosmetic_unlocked/equipped.
- **Quality:** measured_input_latency (if estimated), crash/ANR, frame-drop events.
- **Derived:** D1/D7/D30, rounds/DAU, session length, ARPDAU, share rate, LTV; per-player **signed bias** (mean signed error), **consistency** (error spread), and accuracy **percentile** — the skill-curve signals that should predict self-improver retention.

Comply with platform privacy requirements (ATT prompt on iOS, consent where required); analytics respect opt-out.

---

## 13. Risks & Open Questions

| # | Risk / question | Impact | Mitigation / decision needed |
|---|---|---|---|
| R-1 | Input-latency noise undermines the "precision" promise and fair leaderboards | High | §11.1–11.2; prototype the timing path before committing the engine; frame perfect-hit board as vanity |
| R-2 | Core loop too thin → poor D7 retention | High | Make the game *improvable and visibly so*: bias/consistency feedback + Practice mode (the strongest D7 lever for self-improvers); percentile not global rank; streak freeze to dodge the loss-aversion cliff; light goals. Cosmetics are a *late* lever — don't lean on them for D7. Validate D1 before scaling |
| R-3 | Ads inserted at the emotional peak suppress rounds/session | Med-High | Count-gate interstitials; never between near miss and retry |
| R-4 | Name "Off By" unavailable or conflicts | Med | Confirm store availability + trademark search before launch; alternates exist |
| R-5 | Genre is easily cloned | Med | Win on feel, fairness, and the share card; move fast |
| R-6 | Cross-device fairness for global ranking | Med | Anchor competition in same-device/daily-seed surfaces; band scores |
| R-7 | Low IAP propensity in hyper-casual | Low-Med | Don't depend on IAP; ads are primary; cosmetics are upside |
| R-8 | Players use external timing aids (stopwatch, metronome) on ranked surfaces | Low-Med | §11.3: don't police cognition; defeat external references by design (odd targets, per-day modifiers, Distraction); keep stakes vanity-only; detect automation, not strategy |

**Open questions:** final name; target range tuning; exact tier thresholds vs measured noise floor; interstitial cadence; which engine wins the timing prototype; backend build-vs-buy for leaderboards; confirm two-decimal display against prototype jitter (vs a three-decimal "precision" alternative); Practice-mode coaching heuristics and copy; streak-freeze and goal tuning; percentile vs banded-tier presentation for the daily ladder.

---

## 14. Release Plan

| Phase | Scope | Goal |
|---|---|---|
| **Prototype** | Timing/input path on candidate engine(s); measure real latency/jitter | De-risk the core premise; pick the engine |
| **MVP (P0)** | Classic mode, reveal + juice, instant retry, local stats *(incl. signed bias on the stats screen)*, onboarding, basic ads | Validate the loop, the skill-curve hypothesis, and D1 retention |
| **V1 (P1)** | Daily Challenge, streaks + streak freeze, Practice mode, bias/consistency stats, light goals, Gauntlet, share card + friend challenge, currency + cosmetics, rewarded ads, basic leaderboard | Validate retention + virality + monetization; ready paid UA |
| **V2 (P2)** | Distraction & Blindfold modes, friends graph, expanded cosmetics, live events | Deepen retention and social |

**Go/no-go to scale paid UA:** D1 ≥ target and early LTV signal ≥ CPI.

---

## 15. Appendix — Glossary

- **Signed delta / "off by":** player_time − target, shown to two decimals. Positive = late, negative = early. The hero number on the reveal.
- **Tier:** accuracy band (Bullseye → Miss) driving feedback intensity and coin reward.
- **Daily seed:** date-derived value producing an identical target/modifier for all players that day.
- **Noise floor:** the practical lower bound of measurement accuracy given input latency and jitter on a given device.
- **Soft currency (coins):** earned in-game, spent only on cosmetics; never grants competitive advantage.
- **Juice:** the layered visual/audio/haptic feedback that makes an action feel satisfying.
- **Bias:** mean *signed* error across rounds — your systematic tendency to stop early (−) or late (+). Usually correctable within minutes; the fastest *felt* improvement.
- **Consistency (spread):** the spread (e.g. standard deviation) of your signed error — how *repeatable* you are, independent of bias. The true long-run skill, and the headline of the visible skill curve.
- **Practice mode:** unscored loop with live bias/consistency coaching; no coins, no leaderboard.
- **Fair-play boundary:** the line between skill and cheating — cognitive strategies (counting, holding a tempo) are skill; external time *sources* and automated input are not (§11.3).

---

## 16. Changelog

- **v0.2 (2026-06-09)** — Resolved the precision-honesty contradiction: two-decimal display everywhere, "perfect" redefined as a displayed **0.00s**, tiers re-gridded to the 0.01s lattice and computed from the shown value (§9.1, §10, §11.2). Added an explicit fair-play stance on external timing aids and re-scoped anti-cheat to automation, not cognition (§11.3). Added the skill-curve layer — signed **bias** and **consistency** stats plus a **Practice mode** — to serve self-improvers and harden D7 retention (§5, §7, §8.2, §12, §14). Pressure-tested the meta loop and strengthened R-2 (percentile framing, streak freeze, light goals; cosmetics flagged as a late lever).
- **v0.1** — Initial draft.
