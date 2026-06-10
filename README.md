# Off By

A hyper-casual timing game: you're shown a target time, you tap to start, tap to stop, and the game tells you how far **off by** you were. Engineered around the near-miss → instant-retry beat.

## Layout

pnpm + Turborepo monorepo (see [docs/SCAFFOLD.md](docs/SCAFFOLD.md)):

- `apps/mobile` — the Expo app (SDK 56, expo-router, Unistyles 3, dev-client + EAS Update)
- `apps/api` — reserved; the backend joins in Phase 4 (Daily seed, percentiles, anti-cheat)
- `packages/core` — pure-TS game rules (target generation, tiers, round rules), shared with the future server for rule parity
- `packages/config` — shared tsconfig / eslint presets
- `docs/` — [PRD](docs/PRD.md) · [DESIGN](docs/DESIGN.md) · [PLAN](docs/PLAN.md) · [SCAFFOLD](docs/SCAFFOLD.md)

Design source of truth: the [Figma file](https://www.figma.com/design/IF3p3StFTA7FJniCWh7jaL/).

## Commands

```sh
pnpm install
pnpm check                    # turbo: lint + typecheck + test, all workspaces

pnpm --filter mobile start    # dev server (requires a development build, not Expo Go)
pnpm --filter mobile ios      # build + run the dev client locally
pnpm --filter mobile android
```

The app uses Unistyles 3 (C++/Nitro) and so **does not run in Expo Go** — use a development build (`eas build --profile development` or the local run commands above). In-app routes `/tokens` (design-token gallery vs Figma) and `/spike` (Phase 0 timing harness) are dev utilities — in dev builds, long-press the Home launcher's **Settings** for `/tokens` and **Stats** for `/spike`.

## Status

Phase 3 (offline modes) is implemented: the round surface is parameterized (one machine + one surface, modes are sinks + target contracts), and on top of it sit the Modes hub, Practice (unscored reps with live coach/bias/spread), Gauntlet (tightening tolerance band, 3 lives, per-device best), Pass & Play (2–4 players, one shared target, sealed results → standings), and the Goals & streak sheet (freeze-aware streak + seeded daily goals). Everything works with the network off. Earlier: Phase 1 core loop, Phase 2 P0 frame (onboarding, Stats, Settings, juice v2, app identity; sound pack still pending assets). Next per [PLAN](docs/PLAN.md): Phase 4 — Daily Challenge + Leaderboards, the first backend.

## EAS

Project: `@kukalajet/off-by`. Build profiles `development` / `preview` / `production` map 1:1 to update channels; `runtimeVersion` uses the fingerprint policy, so JS-only changes ship over the air and native changes fence themselves automatically (see [SCAFFOLD §4](docs/SCAFFOLD.md)).
