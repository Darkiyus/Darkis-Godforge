import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { evaluateCondition } from "../scripts/core/condition-service";
import { evaluateFormula, evaluateFormulaWithDice, validateFormula } from "../scripts/core/formula-service";
import { previewGrantGroup, resolveGrantGroup } from "../scripts/core/grant-service";
import english from "../lang/en.json";
import german from "../lang/de.json";
import moduleManifest from "../module.json";
import { canUse, consume, shouldReset } from "../scripts/core/usage-service";
import { filterCatalog } from "../scripts/core/catalog-service";
import { AdapterRegistry } from "../scripts/adapters/adapter-registry";
import { DeityService } from "../scripts/core/deity-service";
import { GodForgeApi, type GodForgeActor } from "../scripts/api";
import { JournalDeityRepository } from "../scripts/foundry/journal-repository";
import { escapeHtml, safeImageUrl } from "../scripts/core/sanitize";
import { SocketRouter, type AuthorityContext, type SocketTransport } from "../scripts/foundry/socket-router";
import { executeAbility, type EffectTarget } from "../scripts/core/effect-engine";
import { resolveTargets } from "../scripts/core/target-service";
import { TriggerEngine } from "../scripts/core/trigger-engine";
import { resolveClassGrants } from "../scripts/core/class-coupling";
import { buildCharacterWidgetData } from "../scripts/core/character-widget";
import { drawWeighted, RandomContentService, resolveWheel, validateRandomContentSnapshot } from "../scripts/core/random-service";
import { createSocketlibTransport } from "../scripts/foundry/socketlib-transport";
import { DEFAULT_VISIBILITY, type DeityDefinition } from "../scripts/core/types";
import { addDashboardSceneControl, createDashboardSettingsMenu, registerFoundryBootstrap } from "../scripts/foundry/bootstrap";
import { migrateDefinition } from "../scripts/core/migration-service";
import { redactForViewer } from "../scripts/core/visibility-service";
import { currentViewerContext, requireGM } from "../scripts/foundry/permissions";
import { buildPf2eDeityData } from "../scripts/adapters/pf2e/deity-materializer";
import { Starfinder1eAdapter } from "../scripts/adapters/starfinder/starfinder1e-adapter";
import { Starfinder2eAdapter } from "../scripts/adapters/starfinder/starfinder2e-adapter";
import { collectGrantChoiceGroups, hasGrantChoices } from "../scripts/core/grant-choice-service";

const deity: DeityDefinition = { id: "a", schemaVersion: 2, revision: 1, createdAt: "", updatedAt: "", checksum: "", status: "published", kind: "selectable", name: "A", title: "T", description: "D", domains: ["shadow"], passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: structuredClone(DEFAULT_VISIBILITY) };

beforeEach(() => vi.stubGlobal("game", { user: { id: "gm", isGM: true } }));
afterEach(() => vi.unstubAllGlobals());

function localizationLeafKeys(value: unknown, prefix = ""): string[] { if (!value || typeof value !== "object") return [prefix]; return Object.entries(value).flatMap(([key, child]) => localizationLeafKeys(child, prefix ? `${prefix}.${key}` : key)).sort(); }

describe("formula service", () => { it("evaluates whitelisted facts", () => expect(evaluateFormula("3 + @actor.level", { actor: { level: 4 }, target: {} })).toBe(7)); it("rejects code", () => expect(validateFormula("window.alert(1)")).toBe(false)); });
describe("conditions and grants", () => { it("evaluates nested boolean conditions", () => expect(evaluateCondition({ type: "and", children: [{ type: "fact", key: "level", equals: 5 }, { type: "not", child: { type: "fact", key: "dead", equals: true } }] }, { level: 5, dead: false })).toBe(true)); it("requires an exact pick", () => expect(resolveGrantGroup({ id: "g", mode: "any", pick: 1, label: "", grants: [{ type: "bonus", ref: "a" }] }, { groupId: "g", refs: ["a"] })).toEqual(["a"])); });
describe("nested grants", () => { it("previews nested AND/OR groups and preserves overrides", () => { const group = { id: "root", mode: "all" as const, label: "", grants: [{ type: "ability" as const, ref: "a", overrides: { name: "Renamed" } }, { id: "choice", mode: "any" as const, pick: 1, label: "", grants: [{ type: "bonus" as const, ref: "b" }, { type: "bonus" as const, ref: "c" }] }] }; expect(previewGrantGroup(group)).toEqual(["a", "b", "c"]); }); });
describe("nested grant resolution", () => { it("resolves a selected AND subgroup inside an OR group", () => { const group = { id: "root", mode: "any" as const, pick: 1, label: "", grants: [{ id: "combined", mode: "all" as const, label: "", grants: [{ type: "ability" as const, ref: "a" }, { type: "bonus" as const, ref: "b" }] }, { type: "ability" as const, ref: "c" }] }; expect(resolveGrantGroup(group, [{ groupId: "root", refs: ["combined"] }])).toEqual(["a", "b"]); }); });
describe("grant choice views", () => { it("finds nested OR groups below AND groups", () => { const group = { id: "root", mode: "all" as const, label: "Root", grants: [{ id: "nested", mode: "any" as const, pick: 1, label: "Nested", grants: [{ type: "ability" as const, ref: "a" }] }] }; expect(hasGrantChoices([group])).toBe(true); expect(collectGrantChoiceGroups(group)).toEqual([{ id: "nested", label: "Nested", pick: 1, options: [{ id: "a", label: "a" }], requirements: [] }]); }); it("marks choices in unselected OR branches as conditional", () => { const group = { id: "root", mode: "any" as const, pick: 1, label: "Root", grants: [{ id: "branch", mode: "any" as const, pick: 1, label: "Branch", grants: [{ type: "ability" as const, ref: "a" }] }, { type: "ability" as const, ref: "b" }] }; expect(collectGrantChoiceGroups(group)[1]?.requirements).toEqual([{ groupId: "root", optionId: "branch" }]); }); });
describe("usage", () => {
  it("consumes and resets legacy daily uses by elapsed time", () => { const state = { used: 0, max: 1, lastResetAt: 0, reset: "daily" as const }; expect(canUse(state, 0)).toBe(true); expect(consume(state, 0).used).toBe(1); expect(shouldReset({ ...state, used: 1 }, 86400000)).toBe(true); });
  it("does not time-reset event-based usages", () => { for (const reset of ["daily-preparations", "ten-minute-rest", "refocus", "encounter-end", "scene-change", "custom-rest", "manual"] as const) expect(shouldReset({ used: 1, max: 1, lastResetAt: 0, reset }, 365 * 86400000)).toBe(false); });
  it("uses explicit calendar periods only for calendar resets", () => { expect(shouldReset({ used: 1, max: 1, lastResetAt: 0, reset: "calendar-month" }, 29 * 86400000)).toBe(false); expect(shouldReset({ used: 1, max: 1, lastResetAt: 0, reset: "calendar-month" }, 30 * 86400000)).toBe(true); });
});
describe("catalog", () => { it("filters hidden and pantheon entries", () => expect(filterCatalog([deity, { ...deity, id: "b", domains: ["fire"] }], { pantheonFilter: "shadow" }, new Set(["a"]))).toEqual([])); });
describe("visibility model", () => {
  it("migrates legacy visibility and publication state", () => {
    const legacy = { ...deity, schemaVersion: 1, status: undefined, visibility: { library: true, players: true, characterSheet: true } };
    const result = migrateDefinition(legacy);
    expect(result.migrated).toBe(true);
    expect(result.definition.schemaVersion).toBe(3);
    expect(result.definition.status).toBe("published");
    expect(result.definition.visibility.fields.gmNotes).toBe("gm");
    expect(result.definition.visibility.fields.spells).toBe("followers");
  });

  it("repairs source replacements and normalizes portrait focus during schema 3 migration", () => { const result = migrateDefinition({ ...deity, schemaVersion: 2, replacement: { sourceUuid: "Compendium.pf2e.deities.Item.test", mode: "none", contexts: [] }, imagePresentation: { image: { fit: "cover", focusX: 200, focusY: -10 } } }); expect(result.definition.replacement.mode).toBe("replace"); expect(result.definition.imagePresentation?.image).toMatchObject({ focusX: 100, focusY: 0, fit: "cover" }); });

  it("removes unauthorized fields before player rendering", () => {
    const hidden = { ...deity, gmNotes: "secret", passiveBonuses: [{ id: "b", name: "Secret bonus", selector: "stealth", value: 2, modifierType: "status" as const, visibility: "gm" as const }], visibility: { ...structuredClone(DEFAULT_VISIBILITY), fields: { ...structuredClone(DEFAULT_VISIBILITY.fields), description: "gm" as const, bonuses: "public" as const } } };
    const view = redactForViewer(hidden, { isGM: false, selection: true });
    expect(view).not.toHaveProperty("gmNotes");
    expect(view).not.toHaveProperty("description");
    expect(view?.passiveBonuses).toEqual([]);
    expect(JSON.stringify(view)).not.toContain("secret");
    expect(JSON.stringify(view)).not.toContain("Secret bonus");
  });

  it("does not expose drafts through the public API", () => {
    vi.stubGlobal("game", { user: { id: "player", isGM: false }, system: { id: "pf2e" } });
    const service = new DeityService();
    service.save({ ...deity, status: "draft" });
    expect(new GodForgeApi(service, new AdapterRegistry()).getDeity("a")).toBeNull();
    vi.unstubAllGlobals();
  });

  it("rejects GM-only access for players", () => {
    vi.stubGlobal("game", { user: { id: "player", isGM: false } });
    vi.stubGlobal("ui", { notifications: { warn: vi.fn() } });
    expect(() => requireGM()).toThrow("GM only");
    vi.unstubAllGlobals();
  });
});
describe("system adapters", () => { it("supports Pathfinder and Starfinder only", () => { const registry = new AdapterRegistry(); expect(registry.supports("pf2e")).toBe(true); expect(registry.supports("sf2e")).toBe(true); expect(registry.supports("sfrpg")).toBe(true); expect(registry.supports("dnd5e")).toBe(false); expect(() => registry.get("dnd5e")).toThrow(); }); });
describe("public API", () => { it("assigns, reads and removes an actor deity", async () => { vi.stubGlobal("game", { user: { id: "gm", isGM: true } }); const service = new DeityService(); service.save(deity); const actor: GodForgeActor = { id: "actor", flags: {}, update: async (data) => { actor.flags = data.flags; } }; const api = new GodForgeApi(service, new AdapterRegistry()); await api.assignDeity(actor, "a"); expect(api.getActorDeity(actor)?.id).toBe("a"); await api.removeDeity(actor); expect(api.getActorDeity(actor)).toBeNull(); vi.unstubAllGlobals(); }); });
describe("lore-only deities", () => {
  it("normalizes lore entries without mechanics or replacement data", () => {
    const result = migrateDefinition({ ...deity, kind: "lore", passiveBonuses: [{ id: "bonus" }], abilities: [{ id: "ability" }], grantGroups: [{ id: "grant" }], replacement: { sourceUuid: "Compendium.pf2e.deities.Item.test", mode: "replace", contexts: [] } }).definition;
    expect(result).toMatchObject({ kind: "lore", passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] } });
  });
  it("shows lore in storage but excludes and rejects it for character selection", async () => {
    const service = new DeityService(); service.save({ ...deity, id: "lore", kind: "lore" });
    const api = new GodForgeApi(service, new AdapterRegistry());
    expect(await api.getSelectableDeities({ systemId: "" })).toEqual([]);
    expect(api.isDeitySelectableByPlayer("lore")).toBe(false);
    const actor: GodForgeActor = { id: "actor", flags: {}, update: vi.fn() };
    await expect(api.assignDeity(actor, "lore")).rejects.toThrow("not available");
  });
});
describe("Foundry journal persistence", () => {
  it("loads and updates canonical deity flags", async () => { const journal = { id: "j", uuid: "Journal.j", name: "A", flags: { "darkis-godforge": { schemaVersion: 1, deity } }, update: async (data: Record<string, unknown>) => { journal.flags = data.flags as typeof journal.flags; } }; const repository = new JournalDeityRepository({ contents: [journal] }); expect(repository.load()[0]?.id).toBe("a"); await repository.save({ ...deity, revision: 2 }); expect(repository.load()[0]?.revision).toBe(2); });
  it("creates new entries through the Foundry document class and survives a repository reload", async () => {
    const contents: Array<{ id: string; uuid: string; name: string; flags?: Record<string, unknown>; update(data: Record<string, unknown>): Promise<void> }> = [];
    const documentClass = { create: vi.fn(async (data: Record<string, unknown>) => { const journal = { id: "new", uuid: "Journal.new", name: String(data.name), flags: data.flags as Record<string, unknown>, update: async (patch: Record<string, unknown>) => { journal.flags = patch.flags as Record<string, unknown>; } }; contents.push(journal); return journal; }) };
    const repository = new JournalDeityRepository({ contents, documentClass });
    expect(await repository.save(deity)).toBe("Journal.new");
    expect(documentClass.create).toHaveBeenCalledOnce();
    expect(new JournalDeityRepository({ contents, documentClass }).load()).toEqual([deity]);
  });
});
describe("GM authority", () => { it("rejects a duplicate activation request", async () => { const service = new DeityService(); service.save({ ...deity, abilities: [{ id: "a1", name: "A", description: "", effects: [{ type: "message", text: "ok" }] }] }); const actor: GodForgeActor = { id: "actor", flags: { "darkis-godforge": { deityId: "a", grants: [], usages: {} } }, update: async () => undefined }; const authority: AuthorityContext = { currentUserId: "gm", isGM: true, isGMUser: (userId) => userId === "gm", ownsActor: (_actor, userId) => userId === "player", resolveActor: () => actor }; const handlers = new Map<string, (payload: unknown, senderId: string) => Promise<unknown>>(); const transport: SocketTransport = { register: (name, callback) => { handlers.set(name, callback); }, executeAsGM: async () => undefined }; const router = new SocketRouter(new GodForgeApi(service, new AdapterRegistry()), authority, transport); router.register(); const payload = { activationId: "fixed", actorId: "actor", userId: "forged", abilityId: "a1", options: {} }; await handlers.get("activateAbility")?.(payload, "player"); await expect(handlers.get("activateAbility")?.(payload, "player")).rejects.toThrow("already been processed"); expect(router.status("fixed")).toBe("completed"); }); it("ignores a forged payload user id and authorizes only the authenticated sender", async () => { const service = new DeityService(); service.save({ ...deity, abilities: [{ id: "a1", name: "A", description: "", effects: [] }] }); const actor: GodForgeActor = { id: "actor", flags: { "darkis-godforge": { deityId: "a", grants: [], usages: {} } }, update: async () => undefined }; const authority: AuthorityContext = { currentUserId: "gm", isGM: true, isGMUser: (userId) => userId === "gm", ownsActor: (_actor, userId) => userId === "owner", resolveActor: () => actor }; const handlers = new Map<string, (payload: unknown, senderId: string) => Promise<unknown>>(); const transport: SocketTransport = { register: (name, callback) => { handlers.set(name, callback); }, executeAsGM: async () => undefined }; const router = new SocketRouter(new GodForgeApi(service, new AdapterRegistry()), authority, transport); router.register(); await expect(handlers.get("activateAbility")?.({ activationId: "spoof", actorId: "actor", userId: "owner", abilityId: "a1", options: {} }, "attacker")).rejects.toThrow("not allowed"); }); });
describe("GM-authoritative deity assignment", () => { it("allows an owning player to select published content and rejects drafts", async () => { const service = new DeityService(); service.save(deity); service.save({ ...deity, id: "draft", status: "draft" }); const actor: GodForgeActor = { id: "actor", flags: {}, update: async (data) => { actor.flags = data.flags; } }; const authority: AuthorityContext = { currentUserId: "gm", isGM: true, isGMUser: (userId) => userId === "gm", ownsActor: (_actor, userId) => userId === "player", resolveActor: () => actor }; const handlers = new Map<string, (payload: unknown, senderId: string) => Promise<unknown>>(); const transport: SocketTransport = { register: (name, callback) => { handlers.set(name, callback); }, executeAsGM: async () => undefined }; const router = new SocketRouter(new GodForgeApi(service, new AdapterRegistry()), authority, transport); router.register(); await handlers.get("assignDeity")?.({ activationId: "assign-ok", actorId: "actor", deityId: "a", choices: {} }, "player"); expect((actor.flags?.["darkis-godforge"] as { deityId: string }).deityId).toBe("a"); await expect(handlers.get("assignDeity")?.({ activationId: "assign-draft", actorId: "actor", deityId: "draft", choices: {} }, "player")).rejects.toThrow("not available"); }); });
describe("trigger and target automation", () => { it("dispatches only indexed triggers", async () => { const engine = new TriggerEngine(); const ability = { id: "a", name: "", description: "", trigger: "manual", effects: [] as [] }; engine.register("d", ability); let count = 0; expect(await engine.dispatch("manual", { facts: {}, execute: async () => { count += 1; } })).toBe(1); expect(count).toBe(1); }); it("resolves area targets and evaluates effect branches", async () => { const actor: EffectTarget = { id: "a", hp: 10, maxHp: 10, modifiers: {}, conditions: [] }; const target: EffectTarget = { id: "b", hp: 10, maxHp: 10, modifiers: {}, conditions: [] }; const result = await executeAbility({ id: "x", name: "", description: "", effects: [{ type: "branch", condition: { type: "fact", key: "level", equals: 5 }, then: [{ type: "message", text: "yes" }] }] }, { actor, target, facts: { actor: { level: 5 }, target: {} }, conditionFacts: { level: 5 } }); expect(result.messages).toEqual(["yes"]); expect(resolveTargets(actor, [actor, target], { mode: "area" })).toEqual([target]); }); });
describe("extended effect library", () => { it("executes group modifiers, movement, conditions, counters, resources and choices", async () => { const actor: EffectTarget = { id: "a", hp: 5, maxHp: 10, gold: 0, modifiers: {}, conditions: [], counters: {} }; const ally: EffectTarget = { id: "b", modifiers: {}, conditions: ["frightened"] }; const result = await executeAbility({ id: "extended", name: "", description: "", effects: [{ type: "modifier", selector: "damage", value: 1, modifierType: "status", target: "allies" }, { type: "movement", mode: "teleport", distance: "10", target: "self" }, { type: "condition", condition: "frightened", operation: "suppress", target: "allies" }, { type: "counter", key: "kills", operation: "add", value: 3 }, { type: "resource", resource: "gold", operation: "add", formula: "@actor.level", target: "self" }, { type: "choice", prompt: "Choose", options: [{ id: "one", label: "One", effects: [{ type: "message", text: "picked" }] }] }] }, { actor, allies: [ally], facts: { actor: { level: 4 }, target: {} } }); expect(ally.modifiers.damage).toBe(1); expect(ally.conditions).toContain("suppressed:frightened"); expect(actor.counters?.kills).toBe(3); expect(actor.gold).toBe(4); expect(result.movements[0]).toMatchObject({ mode: "teleport", distance: 10 }); expect(result.messages).toContain("picked"); }); });
describe("class coupling", () => { it("keeps the core system-neutral while resolving values", () => { const result = resolveClassGrants({ ...deity, domains: ["shadow", "secrets"], font: "harm", favoredWeapon: "sickle", skill: "stealth", sanctification: "unholy" }, "cleric"); expect(result.systemValues).toMatchObject({ domains: ["shadow", "secrets"], font: "harm", favoredWeapon: "sickle" }); expect(() => resolveClassGrants(deity, "")).toThrow(); }); });
describe("PF2e deity materialization", () => { it("uses the current nested PF2e deity schema", () => { const data = buildPf2eDeityData({ ...deity, domains: ["darkness"], font: "heal,harm", favoredWeapon: "sickle", skill: "religion", sanctification: "holy" }, "Journal.a"); expect(data.system).toMatchObject({ category: "deity", domains: { primary: ["darkness"], alternate: [] }, font: ["heal", "harm"], weapons: ["sickle"], skill: ["religion"], sanctification: { modal: "can", what: ["holy"] } }); expect(data.system.description).toEqual({ value: "D" }); }); });
describe("Starfinder materialization", () => { it("uses the shared PF2e/SF2e deity schema for Starfinder 2e", async () => { let created: Record<string, unknown> | null = null; const uuid = await new Starfinder2eAdapter().materialize(deity, { createItem: async (data) => { created = data; return { uuid: "Item.sf2e" }; } }); expect(uuid).toBe("Item.sf2e"); expect(created).toMatchObject({ type: "deity", system: { category: "deity", domains: { primary: ["shadow"], alternate: [] } } }); }); it("keeps Starfinder 1e module-native because SFRPG has no deity item document", async () => { const createItem = vi.fn(); expect(await new Starfinder1eAdapter().materialize(deity, { createItem })).toBeNull(); expect(createItem).not.toHaveBeenCalled(); }); });
describe("actor deity integration", () => { it("creates a native PF2e deity item when assigning a GodForge deity", async () => { vi.stubGlobal("game", { user: { id: "gm", isGM: true }, system: { id: "pf2e" } }); const service = new DeityService(); service.save({ ...deity, alternateDomains: ["secrets"], divineAttributes: ["wis"], spells: { "1": "Compendium.pf2e.spells-srd.Item.test" } }); let created: Record<string, unknown> | undefined; const actor: GodForgeActor = { id: "actor", flags: {}, items: { contents: [] }, update: async (data) => { actor.flags = data.flags; }, createEmbeddedDocuments: async (_type, data) => { created = data[0]; return [{ id: "deity-item", uuid: "Actor.actor.Item.deity-item", flags: (data[0]?.flags ?? {}) as Record<string, unknown> }]; } }; await new GodForgeApi(service, new AdapterRegistry()).assignDeity(actor, "a"); expect(created).toMatchObject({ type: "deity", system: { domains: { primary: ["shadow"], alternate: ["secrets"] }, attribute: ["wis"], spells: { "1": "Compendium.pf2e.spells-srd.Item.test" } } }); vi.unstubAllGlobals(); }); });
describe("character widget", () => { it("exposes assigned deity and remaining uses", () => { const definition = { ...deity, abilities: [{ id: "a", name: "Whisper", description: "", uses: { max: 1, reset: "daily" as const }, effects: [] }] }; const data = buildCharacterWidgetData(definition, { deityId: "a", grants: ["shadow"], usages: { a: { used: 1, max: 1, lastResetAt: 0, reset: "daily" } } }); expect(data.deity?.id).toBe("a"); expect(data.abilities[0]?.uses).toEqual({ used: 1, max: 1 }); }); });
describe("character widget security", () => { it("omits GM-only abilities and internal grant references for players", () => { const actor: GodForgeActor = { id: "actor", flags: { "darkis-godforge": { deityId: "a", grants: ["secret-grant"], usages: {} } }, testUserPermission: () => true, update: async () => undefined }; vi.stubGlobal("game", { user: { id: "player", isGM: false, character: actor }, system: { id: "pf2e" } }); const service = new DeityService(); service.save({ ...deity, abilities: [{ id: "hidden", name: "Hidden", description: "secret", visibility: "gm", effects: [] }], visibility: { ...structuredClone(DEFAULT_VISIBILITY), fields: { ...structuredClone(DEFAULT_VISIBILITY.fields), abilities: "public" } } }); const data = new GodForgeApi(service, new AdapterRegistry()).getCharacterWidgetData(actor); expect(data.abilities).toEqual([]); expect(data.grants).toEqual([]); expect(JSON.stringify(data)).not.toContain("secret"); vi.unstubAllGlobals(); }); });
describe("formulas and random systems", () => { it("respects precedence and resolves mixed dice formulas", async () => { expect(evaluateFormula("2 + 3 * 4", { actor: { level: 0 }, target: {} })).toBe(14); expect(evaluateFormula("clamp(@actor.level, 1, 5)", { actor: { level: 8 }, target: {} })).toBe(5); expect(await evaluateFormulaWithDice("3d8 + @actor.level", { actor: { level: 4 }, target: {} }, async () => 12)).toBe(16); expect(validateFormula("globalThis.alert(1)")).toBe(false); }); it("draws weighted entries and resolves a wheel", () => { const entries = [{ id: "a", label: "A", weight: 1 }, { id: "b", label: "B", weight: 3 }]; expect(drawWeighted(entries, () => 0.1).entry.id).toBe("a"); expect(resolveWheel(entries, () => 0.9).status).toBe("resolved"); }); });
describe("random content management", () => { it("creates persistent table and wheel definitions before resolving results", () => { const service = new RandomContentService(); const table = service.createTable({ name: "Fate", formula: "1d100", visibility: "public", entries: [{ id: "one", label: "One", weight: 1 }] }); const wheel = service.createWheel({ name: "Wheel", tableId: table.id, visibility: "gm", duration: 6, minimumSpins: 5 }); expect(service.snapshot()).toMatchObject({ tables: [{ name: "Fate" }], wheels: [{ name: "Wheel" }] }); expect(service.spinWheel(wheel.id, () => 0).draw.entry.id).toBe("one"); }); it("rejects malformed imported random data before replacing content", () => { const service = new RandomContentService(); const table = service.createTable({ name: "Safe", formula: "1d20", visibility: "public", entries: [{ id: "one", label: "One", weight: 1 }] }); const invalid = { tables: [{ ...table, entries: [{ id: "bad", label: "Bad", weight: -1 }] }], wheels: [] }; expect(validateRandomContentSnapshot(invalid)).toBe(false); expect(() => service.replace(invalid)).toThrow("Invalid"); expect(service.listTables()[0]?.name).toBe("Safe"); }); });
describe("API data workflows", () => { it("exports the current schema, imports deity data and caches catalog reads", async () => { const service = new DeityService(); service.save(deity); const api = new GodForgeApi(service, new AdapterRegistry()); const first = await api.getSelectableDeities({}); expect(await api.getSelectableDeities({})).toBe(first); const exported = api.exportDeities("2026-07-20T00:00:00.000Z"); expect(exported.schemaVersion).toBe(3); expect(await api.importDeities(exported)).toBe(1); expect(api.drawRandomDeity(() => 0).entry.id).toBe("a"); }); });
describe("security and replacement regressions", () => { it("allows Foundry image paths and blocks unsafe schemes", () => { expect(escapeHtml(`<img src=x onerror=alert(1)>`)).toContain("&lt;img"); expect(safeImageUrl("worlds/noclaris/gods/tenebris.webp")).toBe("worlds/noclaris/gods/tenebris.webp"); expect(safeImageUrl("modules/darkis-godforge/assets/a.png")).toBe("modules/darkis-godforge/assets/a.png"); expect(safeImageUrl("assets/a.png")).toBe("assets/a.png"); expect(safeImageUrl("https://x.com/a&b.png")).toBe("https://x.com/a&b.png"); expect(safeImageUrl("javascript:alert(1)")).toBe("icons/svg/eye.svg"); }); it("hides an official Compendium UUID only in the configured context", async () => { const sourceUuid = "Compendium.pf2e.deities.Item.abc123"; vi.stubGlobal("game", { system: { id: "pf2e" }, packs: { contents: [{ collection: "pf2e.deities", documentName: "Item", metadata: { system: "pf2e" }, getIndex: async () => [{ _id: "abc123", name: "Official", type: "deity", system: { domains: ["sun"] } }] }] } }); const service = new DeityService(); service.save({ ...deity, id: "homebrew", replacement: { sourceUuid, mode: "hide", contexts: ["characterBuilder"] } }); const api = new GodForgeApi(service, new AdapterRegistry()); expect((await api.getSelectableDeities({ systemId: "pf2e", catalogContext: "characterBuilder" })).map((entry) => entry.sourceUuid)).not.toContain(sourceUuid); expect((await api.getSelectableDeities({ systemId: "pf2e", catalogContext: "compendium" })).map((entry) => entry.sourceUuid)).toContain(sourceUuid); vi.unstubAllGlobals(); }); });
describe("socketlib bridge", () => { it("forwards Socketlib's authenticated sender instead of payload identity", async () => { let registered = ""; let socketHandler: ((this: { socketdata?: { userId?: string } }, payload: unknown) => Promise<unknown>) | undefined; const transport = createSocketlibTransport({ registerModule: () => ({ register: (name: string, handler: typeof socketHandler) => { registered = name; socketHandler = handler; }, executeAsGM: async () => "ok" }) }); expect(transport).not.toBeNull(); const receiver = vi.fn(); transport?.register("activateAbility", receiver); expect(registered).toBe("activateAbility"); await socketHandler?.call({ socketdata: { userId: "authenticated-player" } }, { userId: "forged-gm" }); expect(receiver).toHaveBeenCalledWith({ userId: "forged-gm" }, "authenticated-player"); }); });
describe("localization catalogs", () => { it("keeps every English and German localization key in parity", () => { expect(localizationLeafKeys(german)).toEqual(localizationLeafKeys(english)); }); });
describe("permission defaults", () => {
  it("fails closed when Foundry has not provided a user", () => {
    vi.unstubAllGlobals();
    expect(() => requireGM()).toThrow("GM only");
  });

  it("does not infer actor ownership from the presence of a character", () => {
    vi.stubGlobal("game", { user: { id: "player", isGM: false, character: { id: "actor" } } });
    expect(currentViewerContext().ownsActor).toBe(false);
  });
});

describe("dashboard markup regressions", () => {
  it("wires each enabled dashboard route to an implemented handler", () => {
    const template = readFileSync("templates/dashboard.hbs", "utf8");
    const implementation = readFileSync("scripts/applications/dashboard.ts", "utf8");
    const actions = [...template.matchAll(/data-action="([^"]+)"/g)].map((match) => match[1] ?? "");
    const managers = [...template.matchAll(/data-manager="([^"]+)"/g)].map((match) => match[1] ?? "");
    for (const action of new Set(actions)) expect(implementation, `missing data-action handler for ${action}`).toContain(`data-action='${action}'`);
    for (const manager of new Set(managers)) expect(implementation, `missing data-manager handler for ${manager}`).toContain(`data-manager='${manager}'`);
    expect([...template.matchAll(/data-manager="random" data-manager-mode="([^"]+)"/g)].map((match) => match[1])).toEqual(["tables", "wheels", "test"]);
    expect([...template.matchAll(/data-manager="data" data-manager-mode="([^"]+)"/g)].map((match) => match[1])).toEqual(["transfer", "migration", "transfer"]);
  });

  it("does not repeat the same rail heading as eyebrow and h2", () => {
    const template = readFileSync("templates/dashboard.hbs", "utf8");
    expect(template).not.toMatch(/<p class="eyebrow">{{ui\.([A-Z_]+)}}<\/p><h2>{{ui\.\1}}<\/h2>/);
  });

  it("keeps the dashboard branding compact and quick actions structurally separate", () => {
    const template = readFileSync("templates/dashboard.hbs", "utf8");
    expect(template).not.toContain("dg-hero-logo");
    expect(template).not.toContain("<span>{{ui.TITLE}}</span>");
    expect(template).toContain("class=\"dg-quick-list\"");
  });

  it("keeps interactive typography below Foundry's window content", () => {
    const css = readFileSync("styles/godforge.css", "utf8");
    expect(css).not.toMatch(/\.darkis-godforge\s+:where\(/);
    expect(css).not.toMatch(/\.darkis-godforge\s+button\s*{/);
    expect(css).toContain(".darkis-godforge .window-content :where(button, input, select, textarea)");
  });

  it("provides a picker and preview for every deity image field", () => {
    const template = readFileSync("templates/deity-editor.hbs", "utf8");
    const implementation = readFileSync("scripts/applications/deity-editor.ts", "utf8");
    for (const field of ["image", "icon", "symbol", "banner"]) {
      expect(template).toContain(`data-image-field="${field}"`);
      expect(template).toContain(`data-target="${field}" data-type="image"`);
      expect(template).toContain(`data-image-preview="${field}"`);
    }
    expect(implementation).toContain("foundry?.applications?.apps?.FilePicker");
    expect(implementation).toContain("FilePicker.fromButton");
  });

  it("uses a real deity wizard without fragment links or hidden required fields", () => {
    const template = readFileSync("templates/deity-editor.hbs", "utf8");
    const implementation = readFileSync("scripts/applications/deity-editor.ts", "utf8");
    expect(template).not.toMatch(/href="#dg-/);
    expect([...template.matchAll(/data-wizard-step="(\d+)"/g)].map((match) => match[1])).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
    expect([...template.matchAll(/data-wizard-panel="(\d+)"/g)].map((match) => match[1])).toEqual(["0", "1", "2", "3", "4", "5", "6", "7"]);
    expect([...template.matchAll(/<[^>]+\srequired(?:\s|>)/g)]).toHaveLength(1);
    expect(template).toContain('<input type="hidden" name="replacement.sourceUuid"');
    expect(template).toContain('data-picker="official"');
    expect(template).toContain('data-picker="weapons"');
    expect(template).toContain('data-picker="spells"');
    expect(implementation).toContain("private setupWizard");
    expect(implementation).toContain("panel.hidden = panel !== activePanel");
  });

  it("uses a reusable filtered picker for known system values", () => {
    const template = readFileSync("templates/picker-dialog.hbs", "utf8");
    const implementation = readFileSync("scripts/applications/picker-dialog.ts", "utf8");
    for (const filter of ["search", "category", "rank", "trait", "source", "available", "remaster"]) expect(template).toContain(`data-picker-${filter}`);
    expect(template).toContain("data-picker-preview-name");
    expect(implementation).toContain('getData("text/plain")');
  });
});
describe("Foundry entry points", () => {
  it("renders every ApplicationV2 template part as one root element", () => {
    const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
    for (const file of readdirSync("templates").filter((name) => name.endsWith(".hbs"))) {
      const source = readFileSync(`templates/${file}`, "utf8").replace(/{{[\s\S]*?}}/g, "");
      let depth = 0;
      let roots = 0;
      for (const match of source.matchAll(/<\/?([a-z][\w-]*)(?:\s[^>]*)?>/gi)) {
        const closing = match[0].startsWith("</");
        const name = match[1]?.toLowerCase() ?? "";
        if (closing) depth -= 1;
        else if (!voidElements.has(name)) { if (depth === 0) roots += 1; depth += 1; }
      }
      expect(roots, `${file} must contain exactly one top-level element`).toBe(1);
      expect(depth, `${file} must contain balanced elements`).toBe(0);
    }
  });

  it("keeps optional integrations and empty packs from blocking activation", () => {
    expect(moduleManifest.socket).toBe(true);
    expect(moduleManifest.compatibility).not.toHaveProperty("maximum");
    expect(moduleManifest).not.toHaveProperty("packs");
    expect(moduleManifest.relationships).not.toHaveProperty("requires");
    expect(moduleManifest.relationships.recommends.map((entry) => entry.id)).toContain("socketlib");
  });

  it("registers a dedicated v13/v14 GodForge control that opens the dashboard", () => {
    const openDashboard = vi.fn();
    const controls = { tokens: { name: "tokens", order: 0, tools: { select: { name: "select" } } } };
    addDashboardSceneControl(controls, openDashboard, vi.fn(), true);
    const control = controls["darkis-godforge" as keyof typeof controls] as unknown as { visible: boolean; tools: { dashboard: { visible: boolean; onChange: (event: Event, active: boolean) => void } } };
    expect(control.visible).toBe(true);
    expect(control.tools.dashboard.visible).toBe(true);
    control.tools.dashboard.onChange(new Event("click"), false);
    expect(openDashboard).toHaveBeenCalledOnce();
  });

  it("shows players only the Codex scene-control tool", () => {
    const controls = { tokens: { name: "tokens", order: 0, tools: {} } };
    addDashboardSceneControl(controls, vi.fn(), vi.fn(), false);
    const control = controls["darkis-godforge" as keyof typeof controls] as unknown as { visible: boolean; tools: { dashboard: { visible: boolean }; codex: { visible: boolean } } };
    expect(control.visible).toBe(true);
    expect(control.tools.codex.visible).toBe(true);
    expect(control.tools.dashboard.visible).toBe(false);
  });

  it("provides a no-argument ApplicationV2 settings menu type", () => {
    const Menu = createDashboardSettingsMenu(new DeityService());
    expect(new Menu()).toBeDefined();
  });

  it("resolves game during init instead of caching an undefined module-load snapshot", () => {
    const initCallbacks: Array<() => void> = [];
    const registerMenu = vi.fn();
    const moduleEntry: { api?: unknown; languages: never[] } = { languages: [] };
    vi.stubGlobal("Hooks", { once: (event: string, callback: () => void) => { if (event === "init") initCallbacks.push(callback); }, on: vi.fn(), callAll: vi.fn() });
    vi.stubGlobal("game", undefined);
    const service = new DeityService();
    registerFoundryBootstrap(new GodForgeApi(service, new AdapterRegistry()), service, vi.fn(), vi.fn());
    vi.stubGlobal("game", { user: { isGM: true }, settings: { register: vi.fn(), registerMenu }, keybindings: { register: vi.fn() }, modules: { get: () => moduleEntry } });
    initCallbacks[0]?.();
    expect(registerMenu).toHaveBeenCalledWith("darkis-godforge", "dashboard", expect.objectContaining({ restricted: true, icon: "fas fa-hammer" }));
    expect(moduleEntry.api).toEqual(expect.objectContaining({ openDashboard: expect.any(Function) }));
    vi.unstubAllGlobals();
  });
});
