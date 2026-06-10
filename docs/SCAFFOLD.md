# Off By — Repo & Expo Scaffold

| | |
|---|---|
| **Refines** | [PLAN §Phase 0](./PLAN.md) — "Expo scaffold" |
| **This doc** | The repository shape and the mobile app's foundation: monorepo layout, Expo configuration, styling system, dev-client + OTA setup, core dependencies, and the scaffold checklist. |
| **Decided here** | pnpm + Turborepo monorepo · Expo SDK 54+ on the New Architecture · Unistyles 3 as the styling/token system · expo-dev-client + EAS Update · MMKV + Zustand · pure-TS `packages/core` for game rules |
| **Status** | Implemented 2026-06-10 on Expo SDK 56 / RN 0.85 (checklist §8 steps 1–5 + 8 done; 6–7 need physical devices) |
| **Last updated** | 2026-06-10 |

---

## 1. Monorepo layout

One repo, three kinds of code: apps, shared packages, and tooling. The backend lands later **in the same repo** without restructuring.

```
off-by/
├── apps/
│   ├── mobile/            # the Expo app (this doc)
│   └── api/               # added in Phase 4 (Daily seed, percentiles, anti-cheat)
├── packages/
│   ├── core/              # pure-TS game rules — no React, no RN (see §6)
│   └── config/            # shared tsconfig / eslint presets
├── docs/                  # PRD · DESIGN · PLAN · this doc
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

- **Package manager: pnpm** (workspace protocol, strict by default, the best-trodden path for Expo monorepos). Expo's Metro config auto-detects pnpm workspaces on SDK 52+; if module-resolution issues ever appear, the documented fallback is `node-linker=hoisted` in `.npmrc` — don't add it preemptively.
- **Task runner: Turborepo.** With one app it's nearly free; the payoff arrives with `apps/api` (shared `lint` / `typecheck` / `test` pipelines, remote caching in CI).
- **Workspace deps** use `workspace:*` so `apps/mobile` and (later) `apps/api` always consume the local `packages/core`.

**Why this matters beyond tidiness:** the PRD's anti-cheat stance (§11.3) wants the server to validate scores with *the same rules the client plays by* — misfire thresholds, target ranges, tier math. A shared `packages/core` makes rule parity a build-time guarantee instead of a documentation promise.

---

## 2. The Expo app (`apps/mobile`)

- **Expo SDK 54 or newer** (RN 0.81+), TypeScript, **expo-router** for navigation (file-based; hub-and-spoke per DESIGN §1 — no tab navigator anywhere).
- **New Architecture: on** (it's the SDK default, and three of our dependencies — Unistyles 3, Reanimated 4, MMKV 3 — hard-require it). SDK 54 is the last to even support the legacy arch, so this is also just the only forward path.
- **CNG / prebuild-managed:** no committed `ios/` or `android/` directories. All native configuration flows through `app.config.ts` + config plugins, which keeps native upgrades mechanical. If the Phase 0 timing spike ends up demanding a custom native module, it enters as a local Expo module (`modules/`) — still CNG-compatible.
- **Edge-to-edge + full-bleed:** edge-to-edge is the SDK 54+ Android default and our design requirement anyway (Ready/Run/Reveal are full-bleed). `react-native-safe-area-context` handles insets inside the screen scaffold primitive; `expo-navigation-bar` keeps Android system bars dark to match `bg/base`.

---

## 3. Styling: Unistyles 3 = the design-token system

Unistyles 3 isn't just the styling library — it's **where the Figma token port lives** (the Phase 0 "design-token port" task lands here).

- The single dark theme carries the file's variables 1:1: `colors` (incl. the six-step tier ramp), `space/4…64`, `radius/sm…pill` + `radius/card`, and the type ramp (`Overline` → `Body` → `Hero/Delta` 92 → the `Display/*` set) as text-style objects.
- **Variants** map to the component library's props: `Button/Secondary` `tone: outline | surface`, `Stat Row` `value: default | mint`, `Pill` `tone: mint | dark` — the Figma→code table in [PLAN §2](./PLAN.md) becomes Unistyles variants almost mechanically.
- Breakpoints: defined but minimal (phone-portrait product); they cost nothing and future-proof tablets/web.
- Wiring: `StyleSheet.configure({ themes, breakpoints, settings })` in a `unistyles.ts` imported at the app's entry **before anything renders**, TS module augmentation for typed themes, and the `react-native-unistyles/plugin` Babel plugin (scoped to the workspace root).
- **Consequences accepted:** Unistyles 3 is C++/Nitro-based (zero re-render style updates — good for the run surface) and therefore **does not run in Expo Go**. That's fine: we're a dev-client project anyway (§4). It also pins us to the New Architecture, already true above.

A `tokens gallery` debug screen (Phase 0 exit criterion in PLAN) renders the theme — every color, radius, space step, and text style — as the visual contract against Figma.

---

## 4. Dev client + OTA: expo-dev-client & expo-updates

**expo-dev-client** replaces Expo Go from day one (forced by Unistyles/Nitro, and we'd land there anyway the moment the spike adds a native module).

- Day-to-day: `npx expo start` against an installed development build; rebuild only when native deps change.
- Build flavors via **eas.json**:

| Profile | Distribution | `expo-updates` channel | Use |
|---|---|---|---|
| `development` | internal, dev client | `development` | daily work, spike builds |
| `preview` | internal | `preview` | playtests, design reviews |
| `production` | store | `production` | releases |

**expo-updates**, configured at scaffold time (not bolted on later):

- `runtimeVersion: { policy: "fingerprint" }` — the runtime version is a hash of the native project, so a JS-only change OTAs safely and any native change automatically fences itself into a new runtime. This is the correct policy for a CNG project that may grow native modules.
- Channels map 1:1 to the build profiles above; `eas update --channel preview` ships a playtest tweak in minutes.
- **What OTA is *for* here** (and the reason it's a requirement, per PLAN): tuning the *feel* without store round-trips — tier thresholds, juice curves, transition timings, copy. **What it's not for:** anything touching native code (new module, permission, SDK bump) — those need a rebuild and will refuse to OTA thanks to the fingerprint policy.
- Dev builds can load published updates from the dev menu — useful for reproducing a playtester's exact preview bundle.

---

## 5. Core dependencies and why each one is here

| Package | Why (tied to PLAN/PRD) |
|---|---|
| `react-native-unistyles` | §3 — styling + the token system |
| `expo-dev-client` / `expo-updates` | §4 — dev loop + feel-tuning OTA |
| `react-native-gesture-handler` | whole-screen tap capture; its event timestamps are a primary subject of the Phase 0 timing spike |
| `react-native-reanimated` (v4) + `react-native-worklets` | the recede beat, mint bloom, push/dissolve transitions — UI-thread animation for the perf budget (60 fps through run/reveal) |
| `react-native-mmkv` (v4, Nitro-based — `createMMKV()`) | local persistence (stats schema v0, settings, streak) — synchronous, fast |
| `zustand` (+ MMKV persist) | app state small enough to not need more; persist middleware writes through MMKV |
| `expo-haptics` | tier-scaled haptics (juice v1); spike measures its latency — if Android quality disappoints, a custom vibration-pattern module is the contingency |
| `expo-audio` | reveal sound pack (Phase 2); `expo-av` is deprecated for audio |
| `expo-font` + Inter (static weights) | the entire type ramp is Inter (Regular → Extra Bold), embedded at build time |
| `react-native-safe-area-context`, `expo-splash-screen`, `expo-status-bar`, `expo-navigation-bar` | screen scaffold primitive, dark cold-open (< 2 s budget), edge-to-edge chrome |
| `jest-expo` + `@testing-library/react-native` | component tests in the app |
| Maestro (CLI, not a dep) | e2e happy-path loop per PLAN §3 |

Deliberately **not** included at scaffold time: analytics SDK (a thin local event facade ships in Phase 1; vendor picked later), Sentry/crash reporting (add at Phase 2's internal distribution), anything backend (Phase 4).

---

## 6. `packages/core` — the game rules as a pure-TS library

Zero dependencies on React or React Native. This package owns:

- **Target generation**: uniform 1.00–15.00 s, 2 dp, odd-value bias, re-roll-on-retry (PRD §7) — with distribution tests.
- **Tier mapping**: the strawman thresholds from PLAN §1 (calibrated so `+0.04s` = Great), expressed as data so OTA tuning is a constant change.
- **Round rules**: `< 100 ms` misfire, `30 s` ceiling, signed-delta formatting (always 2 dp, honest rounding).
- Later: streak/freeze math, Gauntlet escalation, banding/percentile helpers — and in Phase 4, `apps/api` imports *this same package* for server-side plausibility checks.

Tested with **vitest** (fast, no RN runtime needed). The app's jest config stays for component-level tests; the split is intentional — rules get sub-second test runs.

---

## 7. Tooling & CI

- **TypeScript strict** everywhere; `packages/config` exports the base `tsconfig` and ESLint preset (`eslint-config-expo`, flat config) consumed by every workspace.
- **Prettier** at the root, one config.
- **Turbo tasks**: `lint`, `typecheck`, `test`, `build` — each package declares its own, turbo orchestrates and caches.
- **GitHub Actions** on PR: `pnpm install` → `turbo lint typecheck test` → `npx expo-doctor` in `apps/mobile`. EAS builds stay manual/on-tag for now (cost control); EAS workflows can take over later.
- **Conventions**: conventional commits; `apps/mobile/src/` with `app/` (router), `components/` (the Figma kit), `theme/` (unistyles + tokens), `features/` (loop, stats, settings…), `lib/` (mmkv, timing).

---

## 8. Scaffold checklist (ordered)

1. Root: `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json`, root `package.json`, Prettier, `.gitignore`.
2. `packages/config`: base tsconfig + eslint preset. `packages/core`: vitest, first rule (`generateTarget`) + first test.
3. `apps/mobile`: `create-expo-app` (default TS template) → wire into the workspace, strip to a blank router app.
4. Unistyles: install, Babel plugin, `unistyles.ts` with the token port (§3), tokens-gallery debug screen.
5. `expo install expo-dev-client expo-updates` → `eas init` → `eas update:configure` → `eas.json` with the three profiles (§4 table), fingerprint runtime policy.
6. First development builds (`eas build --profile development` or local `expo prebuild` + run) on one iOS + one Android device — these are also the **timing-spike devices**.
7. OTA round-trip test: `eas update --channel development`, confirm the dev build picks it up.
8. CI workflow (§7) green.

**Scaffold exit criteria** (feeding PLAN Phase 0's): dev build installs and hot-reloads on both platforms · tokens gallery matches Figma side-by-side · OTA round-trip verified · `turbo lint typecheck test` green in CI · `packages/core` consumed by the app (Home's START already calls `generateTarget()`).

---

## 9. Open questions

- **Dev builds: EAS cloud vs local prebuild** — start local (free, fast), adopt EAS cloud builds when a second person joins.
- **`apps/api` runtime** (Phase 4): Node vs Bun vs Workers — irrelevant to this scaffold beyond reserving the directory; `packages/core` stays runtime-agnostic TS so all three remain open.
- **Custom native module for timing** — the spike decides; the scaffold's CNG + fingerprint-policy setup is already shaped to absorb it.
