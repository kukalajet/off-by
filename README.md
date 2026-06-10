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

The app uses Unistyles 3 (C++/Nitro) and so **does not run in Expo Go** — use a development build (`eas build --profile development` or the local run commands above). In-app routes `/tokens` (design-token gallery vs Figma) and `/spike` (Phase 0 timing harness) are dev utilities.

## EAS

Project: `@jetonatssg/off-by`. Build profiles `development` / `preview` / `production` map 1:1 to update channels; `runtimeVersion` uses the fingerprint policy, so JS-only changes ship over the air and native changes fence themselves automatically (see [SCAFFOLD §4](docs/SCAFFOLD.md)).
