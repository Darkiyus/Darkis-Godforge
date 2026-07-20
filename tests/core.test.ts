import { describe, expect, it } from "vitest";
import { evaluateCondition } from "../scripts/core/condition-service";
import { evaluateFormula, validateFormula } from "../scripts/core/formula-service";
import { resolveGrantGroup } from "../scripts/core/grant-service";
import { canUse, consume, shouldReset } from "../scripts/core/usage-service";
import { filterCatalog } from "../scripts/core/catalog-service";
import { AdapterRegistry } from "../scripts/adapters/adapter-registry";
import { DeityService } from "../scripts/core/deity-service";
import { GodForgeApi, type GodForgeActor } from "../scripts/api";
import { JournalDeityRepository } from "../scripts/foundry/journal-repository";
import type { DeityDefinition } from "../scripts/core/types";

const deity: DeityDefinition = { id: "a", schemaVersion: 1, revision: 1, createdAt: "", updatedAt: "", checksum: "", name: "A", title: "T", description: "D", domains: ["shadow"], passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: true, players: true, characterSheet: true } };

describe("formula service", () => { it("evaluates whitelisted facts", () => expect(evaluateFormula("3 + @actor.level", { actor: { level: 4 }, target: {} })).toBe(7)); it("rejects code", () => expect(validateFormula("window.alert(1)")).toBe(false)); });
describe("conditions and grants", () => { it("evaluates nested boolean conditions", () => expect(evaluateCondition({ type: "and", children: [{ type: "fact", key: "level", equals: 5 }, { type: "not", child: { type: "fact", key: "dead", equals: true } }] }, { level: 5, dead: false })).toBe(true)); it("requires an exact pick", () => expect(resolveGrantGroup({ id: "g", mode: "any", pick: 1, label: "", grants: [{ type: "bonus", ref: "a" }] }, { groupId: "g", refs: ["a"] })).toEqual(["a"])); });
describe("usage", () => { it("consumes and resets daily uses", () => { const state = { used: 0, max: 1, lastResetAt: 0, reset: "daily" as const }; expect(canUse(state, 0)).toBe(true); expect(consume(state, 0).used).toBe(1); expect(shouldReset({ ...state, used: 1 }, 86400000)).toBe(true); }); });
describe("catalog", () => { it("filters hidden and pantheon entries", () => expect(filterCatalog([deity, { ...deity, id: "b", domains: ["fire"] }], { pantheonFilter: "shadow" }, new Set(["a"]))).toEqual([])); });
describe("system adapters", () => { it("supports Pathfinder and Starfinder only", () => { const registry = new AdapterRegistry(); expect(registry.supports("pf2e")).toBe(true); expect(registry.supports("sf2e")).toBe(true); expect(registry.supports("sfrpg")).toBe(true); expect(registry.supports("dnd5e")).toBe(false); expect(() => registry.get("dnd5e")).toThrow(); }); });
describe("public API", () => { it("assigns, reads and removes an actor deity", async () => { const service = new DeityService(); service.save(deity); const actor: GodForgeActor = { id: "actor", flags: {}, update: async (data) => { actor.flags = data.flags; } }; const api = new GodForgeApi(service, new AdapterRegistry()); await api.assignDeity(actor, "a"); expect(api.getActorDeity(actor)?.id).toBe("a"); await api.removeDeity(actor); expect(api.getActorDeity(actor)).toBeNull(); }); });
describe("Foundry journal persistence", () => { it("loads and updates canonical deity flags", async () => { const journal = { id: "j", uuid: "Journal.j", name: "A", flags: { "darkis-godforge": { schemaVersion: 1, deity } }, update: async (data: Record<string, unknown>) => { journal.flags = data.flags as typeof journal.flags; } }; const repository = new JournalDeityRepository({ contents: [journal] }); expect(repository.load()[0]?.id).toBe("a"); await repository.save({ ...deity, revision: 2 }); expect(repository.load()[0]?.revision).toBe(2); }); });
