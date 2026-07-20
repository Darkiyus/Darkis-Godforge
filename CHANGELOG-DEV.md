# Development changelog

## 0.1.0

- Implemented tickets A0–A5 foundations: strict TypeScript/Vite build, v14 manifest, localized resources, adapter registry, canonical deity model, catalog/replacement API, and ApplicationV2-compatible dashboard shell.
- Implemented pure service foundations for B1, B4 and grant/condition evaluation with Vitest coverage; formula evaluation never executes imported code.
- Kept all PF2e-specific strings and Rule Element generation under `scripts/adapters/pf2e/`.
- `TODO(verify)`: confirm exact Foundry v14 ApplicationV2 rendering API and the installed PF2e `deity` item schema before enabling document materialization.
- Manual Foundry verification remains required; see `MANUAL-TESTPLAN.md`.
