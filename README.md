# Darkis GodForge

Foundry VTT v14 module for configurable homebrew deities. The project follows the implementation plan in `Darkis_GodForge_Codex_Implementierungsplan.md` and keeps canonical definitions system-neutral while isolating PF2e materialization in `scripts/adapters/pf2e/`.

## Development

```bash
npm install
npm run check
```

The build writes `scripts/main.js`, which is the module entry declared by `module.json`. Foundry itself is not included in CI; use the manual checklist in `MANUAL-TESTPLAN.md` inside a Foundry v14 world with PF2e and socketlib installed.

## Current scope

The initial release includes the strict TypeScript/Vite module foundation, adapter registry, canonical deity model and service, catalog/replacement API, safe formula and condition evaluators, usage/reset and grant-group logic, PF2e Rule Element generation boundary, localized strings, and an ApplicationV2-compatible dashboard shell styled after the supplied GodForge mockups.

PF2e document materialization and Foundry ApplicationV2 signatures contain explicit `TODO(verify)` markers because they must be checked against the exact installed Foundry/PF2e versions.
