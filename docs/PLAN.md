# Off By — Build Plan

| | |
|---|---|
| **Companion to** | [PRD](./PRD.md) (what/why) · [DESIGN](./DESIGN.md) (structure) · [Figma](https://www.figma.com/design/IF3p3StFTA7FJniCWh7jaL/) (pixel truth, components, wired prototype) |
| **This doc** | Build order: phases, exit criteria, and the Figma→code map. The *"what first, and why."* |
| **Stack** | Expo / React Native (TypeScript) in a pnpm + Turborepo **monorepo** (backend joins the same repo in Phase 4) — see [SCAFFOLD](./SCAFFOLD.md). Native module only if the Phase 0 timing spike demands it. |
| **Status** | Draft v0.1 |
| **Last updated** | 2026-06-10 |

---

## 0. How to read this plan

The Figma file's **"Off By — Screens"** page is organized into 9 sections ordered by flow, P0 first — and that ordering *is* the build order, with one exception: before any screen gets built, we prove the clock. Every screen below names its Figma section so design lookup is one click.

**Build order = risk order.** The product's one hard technical claim is timing honesty ([PRD §11](./PRD.md)). Everything else is a known quantity: the screens are fully designed, the prototype is wired, the component library exists.

Guiding principles:

1. **De-risk the clock first.** Stop-time captured at the input event on a monotonic clock (PRD §11.1) is the foundation. Spike it on real devices before building UI on top of it.
2. **One Round surface, parameterized.** Per [DESIGN §2](./DESIGN.md), Classic / Daily / Gauntlet / Pass-and-Play / Practice / Challenge are the same Round + Reveal re-dressed. Build it once behind a round-config object; modes become data, not screens.
3. **Offline-first ordering.** Everything through Phase 3 requires zero backend (F-7). The first server dependency is the Daily seed — all account/cloud work waits until then.
4. **Juice is product, not polish.** Reveal is the showpiece (PRD §10). Scaled haptics/sound ship *inside* the MVP phase, not after it.
5. **Match the file, not the vibe.** Tokens, components, copy, and transitions are already decided in Figma — port them 1:1 (§3 map). Don't redesign in code.

---

## 1. Phases

### Phase 0 — Foundations + the timing spike *(gate for everything)*

- Repo + Expo scaffold per [SCAFFOLD.md](./SCAFFOLD.md): pnpm/Turborepo monorepo (`apps/mobile` now, `apps/api` reserved for Phase 4, shared `packages/core` game rules), Expo SDK 54+ on the New Architecture, expo-router, **expo-dev-client + EAS Update** (channels per build profile, fingerprint runtime policy), CI.
- **Timing spike — the actual point of this phase.** On at least one real iOS + one mid-tier Android device:
  - Measure tap→timestamp fidelity (gesture event `timeStamp` vs `performance.now()` at JS handler) and haptic trigger latency.
  - Decide: JS-side capture good enough, or JSI/native module needed.
  - Encode round rules from PRD §6: capture at input event · `< 100 ms` = misfire, discarded · `30 s` ceiling = auto-miss.
- Design-token port from Figma variables → the **Unistyles 3 theme** ([SCAFFOLD §3](./SCAFFOLD.md)): color (incl. the 6-step tier ramp), spacing, radii (incl. `radius/card` 20, pill), full type ramp (`Overline` → `Hero/Delta` 92 → `Display/*`).
- Local persistence (MMKV; stats schema v0) + settings store (Zustand with MMKV persistence).

**Exit:** committed spike note with measured per-device noise and the chosen capture path · token-gallery screen renders the theme · cold open to a blank Home < 2 s.

### Phase 1 — Core loop vertical slice *(Figma §01 · Core loop)*

Screens: **Home** (launchpad: mystery `?.??s` + START; status pills render static), **Round — Ready**, **Round — Run**, **Reveal**.

- Target generator: uniform 0.10–7.00 s (range decided 2026-06-10; floor = the misfire cutoff), 2 dp, odd-value bias, **re-rolled every round including instant Retry** (PRD §7).
- Loop state machine **Ready → Run → Guess → Reveal** (PRD §6). Whole screen is the tap target in Ready and Run.
- Tier mapping + signed delta. Strawman thresholds (tune later; calibrated so Figma's `+0.04s` reads **Great**): `0.00` bullseye · `≤ 0.02` insane · `≤ 0.10` great · `≤ 0.25` good · `≤ 0.60` close · else miss.
- Transitions from the prototype: forward push-left / back push-right (300 ms) · **the recede beat** — Ready's solid target sinks to Run's 9 % ghost (150 ms ease-out) · Retry dissolve (120 ms). Reduce-motion variants from day one.
- Run screen contract: dim target reminder + ghost watermark + LIVE mark + layered ambient glow. **Nothing temporal, nothing rhythmic.**
- Juice v1: tier-scaled haptic + mint bloom on Reveal (animation only; sound in Phase 2).
- Coins: earn-on-reveal, local wallet, no spend yet.

**Exit:** a 20-round unguided playtest by someone new · rounds-per-session counted locally · no dropped frames through the retry beat.

### Phase 2 — P0 frame: the shippable MVP *(Figma §01–02)*

- **Onboarding**: one guided round (tap-pad teaches tap-tap), Skip, first-run flag (F-8).
- **Stats**: best (closest hit) hero + signed-bias visualizer, persistence-backed (F-7, F-10).
- **Settings**: working haptics/sound/distraction toggles · reset stats behind a confirm dialog (apply the reserved `color/danger` token here) · notifications + restore rows as stubs.
- Accessibility pass (PRD §10): tiers never color-only, system reduce-motion, silent-mode respect, tap-target sizes.
- Reveal juice v2: sound pack, scaled animation, quiet failure for Miss.
- App identity: icon, splash, internal-distribution build.

**Exit:** TestFlight / internal-track build = **PRD P0 complete (F-1…F-8)**. This is the soft-launch candidate.

### Phase 3 — Offline modes *(Figma §03 hub · §06 · §04 · §05)*

Build order inside the phase = cheapest-to-deepest reuse of the round config:

1. **Modes hub** (§03).
2. **Practice** (§06): unscored loop, feedback card (plain-language read, coach nudge, running bias/spread — reuses the Stats math) (F-10b).
3. **Gauntlet** (§04): escalating sequence + tolerance band, 3 lives, score, HUD strip, end screen (F-12).
4. **Pass & Play** (§05): setup (2–4 players), hand-off turn manager, one shared target per game, winner standings (F-17).
5. **Goals & streak sheet** on Home (F-11/F-11b): local streak, freezes, refreshable goals.

**Exit:** every screen in Figma §03–06 reachable and functional with the network off.

### Phase 4 — Daily Challenge + Leaderboards *(Figma §03 daily trio · §07)* — first backend

- Backend-lite choice at phase start (Supabase / Firebase / Workers+KV): daily seed, score submit, percentile banding, all-time closest-hit board. Anonymous device identity, upgradeable later (PRD §11.4).
- Daily flow: prompt (seed + reset countdown) → one scored attempt → percentile result (F-9) · unlimited practice entry · streak + freeze integration.
- Leaderboards: daily **banded → percentile** + all-time vanity wall, tab morph (F-16; banding rules PRD §11.2–11.3).
- Anti-cheat v1: server-side plausibility checks — automation, not cognition (PRD §11.3).
- Daily push notification, opt-in (F-13).

**Exit:** two physical devices get the same daily target and consistent percentiles.

### Phase 5 — Share & Challenge-a-friend *(Figma §08)*

- Share card: off-screen render of the artifact (Figma `Share` screen), system share sheet, save image (F-14).
- Challenge links: universal/app links carrying seed + challenger result → received prompt → one-shot round → head-to-head compare → rematch (F-15). Decide: stateless signed payload in the link vs server-stored round.

**Exit:** full send → receive → beat → rematch loop between two phones.

### Phase 6 — Economy: Shop, Store, ads *(Figma §09)*

- Shop: wallet, cosmetic skins (tap-pad/run-field recolor), themes/haptics/sound packs, equip flow (F-20 — cosmetics only, never pay-to-win).
- Store: remove-ads IAP, coin packs, starter bundle, restore (RevenueCat vs raw StoreKit/Billing — decide at phase start) (F-21).
- Ads: count-gated interstitials — **never between a near miss and its Retry** (PRD §6/§9.3, write a test for the gate) — plus opt-in rewarded.

**Exit:** earn → spend → equip closes locally; purchases restore; the gating rule has a passing test.

### Phase 7 — P2 & beyond

Distraction mode (the interference system that doubles as a fair-play tool), Blindfold, stats trends, friends, live events (PRD §14).

---

## 2. Figma → code component map

The library on the **"Off By — Components"** page ports 1:1. "First needed" tells you when to build it.

| Figma component | Code component | Props (from Figma) | First needed |
|---|---|---|---|
| Button/Primary | `<PrimaryButton>` | label, icon | P1 (Home START) |
| Button/Secondary | `<SecondaryButton>` | tone: outline/surface · label · showIcon | P1 (Reveal) |
| Live Mark | `<LiveMark>` | — | P1 (Run) |
| Pill | `<StatusPill>` | tone: mint/dark · label · showDot | P1 (Home, static) |
| icons (chevrons, play, retry, share, flame) | icon set | — | P1 |
| Back Button | `<BackButton>` | — | P2 (Stats) |
| Toggle | `<Toggle>` | on/off | P2 (Settings) |
| List Row | `<ListRow>` | type: link/toggle · label · subtitle | P2 (Settings) |
| Stat Row | `<StatRow>` | value tone: default/mint · label · value | P3 (Gauntlet end) |
| Wallet | `<WalletPill>` | balance | P6 (Shop) |
| Tab | `<Tab>` | state · label | P4 (Leaderboards) |

Patterns that are deliberately *not* Figma components but recur (build as code primitives): screen scaffold (393×852 design frame → safe-area + 64/40/24 padding), card shell (surface + `radius/card`), **glow primitive** (stacked blurred discs — used by Run's 3-layer field, heroes, START), Target Hero (solid/ghost states), bias visualizer, PnP segmented control, tap-pad.

---

## 3. Cross-cutting workstreams

- **Analytics from Phase 1**: north star = rounds/session; funnel target install → first round ≥ 90 % (PRD §4).
- **Perf budget**: cold open < 2 s mid-tier Android · Reveal→next Ready < 200 ms end-to-end · 60 fps through run/reveal.
- **Timing QA**: per-device noise log, started by the Phase 0 spike, grown every time a new device class appears.
- **Tests**: unit — target-gen distribution (range, bias, re-roll), tier mapping, misfire/ceiling rules, ad-gate rule; e2e — the core loop happy path (Maestro).

---

## 4. Decisions already made — don't relitigate

- Classic target is **random, re-rolled every round including instant Retry**; Daily/Challenge/PnP/Gauntlet keep their own target contracts (PRD §6–7, decided 2026-06-10).
- Run screen shows nothing temporal and nothing rhythmic; ghost + dim reminder + LIVE mark only.
- Hub-and-spoke, **no persistent tab bar**; Ready/Run/Reveal full-bleed (DESIGN §1).
- Two decimals everywhere; a "perfect" is a displayed `0.00s` (PRD §10).
- Mint is the *earned* color: invitation on Home, live action during Run, bloom at Reveal.

## 5. Open questions, pinned to phases

- **P0**: does timestamp capture need a native module? (spike answers)
- **P1**: tier thresholds — strawman above, tune against feel.
- **P4**: backend pick · percentile cold-start strategy · **the 2 dp vs 3 dp conflict**: PRD §10 forbids a third decimal, but the all-time board design shows 3 dp to break ties (flagged in PRD §13) — resolve before building Leaderboards.
- **P5**: stateless signed challenge links vs server-stored rounds.
- **P6**: ad network · RevenueCat vs native IAP · real price points (Figma prices are placeholders).
