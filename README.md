# Darkis GodForge

Foundry VTT v14 module for configurable homebrew deities in Pathfinder 2e and Starfinder 1e/2e. Canonical definitions stay system-neutral while each supported game system is isolated in its own adapter.

## Development

```bash
npm install
npm run check
```

The build writes `scripts/main.js`, which is the module entry declared by `module.json`. Install the module in a Foundry v14 world with the selected supported game system and socketlib enabled.

## Current scope

The module includes a strict TypeScript/Vite foundation, adapter registry, canonical deity model, catalog/replacement API, safe formula and condition evaluators, usage/reset and grant-group logic, localized strings, and an ApplicationV2-compatible dashboard shell.
