import assert from "node:assert/strict";

const state = { menu: false, language: false, keybinding: false, rendered: false };
const listeners = new Map();
const onceListeners = new Map();

globalThis.Hooks = {
  once(event, callback) {
    const callbacks = onceListeners.get(event) ?? [];
    callbacks.push(callback);
    onceListeners.set(event, callbacks);
  },
  on(event, callback) {
    const callbacks = listeners.get(event) ?? [];
    callbacks.push(callback);
    listeners.set(event, callbacks);
  },
  async callAll(event, ...args) {
    const callbacks = [...(listeners.get(event) ?? []), ...(onceListeners.get(event) ?? [])];
    onceListeners.delete(event);
    for (const callback of callbacks) await callback(...args);
  }
};
globalThis.foundry = { applications: { api: {
  ApplicationV2: class {
    async render() { state.rendered = true; return this; }
  },
  HandlebarsApplicationMixin: (Base) => Base
} } };
globalThis.ui = { notifications: { error: (message) => { throw new Error(message); }, warn: () => undefined } };
Reflect.deleteProperty(globalThis, "game");

assert.equal("game" in globalThis, false, "game must not exist while the module bundle is imported");
await import(`../scripts/main.js?foundry-smoke=${Date.now()}`);

const godForgeModule = { active: true, languages: [] };
globalThis.game = {
  user: { id: "gm", isGM: true },
  system: { id: "pf2e" },
  actors: { get: () => null },
  journal: { contents: [] },
  packs: { contents: [] },
  modules: { get: (id) => id === "darkis-godforge" ? godForgeModule : undefined },
  settings: {
    register: (_namespace, key) => { if (key === "language") state.language = true; },
    registerMenu: (_namespace, key) => { if (key === "dashboard") state.menu = true; },
    get: () => "auto"
  },
  keybindings: { register: () => { state.keybinding = true; } },
  i18n: { localize: (key) => key }
};

await globalThis.Hooks.callAll("init");
assert.equal(typeof godForgeModule.api?.openDashboard, "function", "public API must be exposed during init");
assert.equal(typeof godForgeModule.api?.openCodex, "function", "public codex API must be exposed during init");
assert.equal(state.menu, true, "dashboard settings menu must be registered");
assert.equal(state.language, true, "language setting must be registered");
assert.equal(state.keybinding, true, "dashboard keybinding must be registered");

const controls = { tokens: { name: "tokens", title: "Tokens", icon: "fas fa-user", order: 0, tools: {} } };
await globalThis.Hooks.callAll("getSceneControlButtons", controls);
assert.equal(typeof controls["darkis-godforge"]?.tools?.dashboard?.onChange, "function", "dedicated GodForge Scene Control must be registered");
assert.equal(typeof controls["darkis-godforge"]?.tools?.codex?.onChange, "function", "GodForge Codex Scene Control must be registered");

await globalThis.Hooks.callAll("ready");
assert.equal(typeof godForgeModule.api?.openDashboard, "function", "public API must remain exposed at ready");
let resetState = null;
const actor = {
  id: "actor-1",
  flags: { "darkis-godforge": { deityId: "deity-1", grants: [], usages: { wonder: { used: 1, max: 1, lastResetAt: 0, reset: "daily-preparations" } } } },
  async update(data) { resetState = data.flags["darkis-godforge"]; this.flags["darkis-godforge"] = resetState; }
};
await globalThis.Hooks.callAll("pf2e.restForTheNight", actor);
assert.equal(resetState.usages.wonder.used, 0, "PF2e rest hook must reset daily-preparation usages");
godForgeModule.api.openDashboard();
await Promise.resolve();
assert.equal(state.rendered, true, "openDashboard must render the ApplicationV2 dashboard");

console.log("Foundry bootstrap smoke test passed.");
