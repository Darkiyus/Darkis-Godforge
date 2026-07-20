import { describe, expect, it } from "vitest";
import { evaluateCondition } from "../scripts/core/condition-service";
import { evaluateFormula, validateFormula } from "../scripts/core/formula-service";
import { resolveGrantGroup } from "../scripts/core/grant-service";
import { canUse, consume, shouldReset } from "../scripts/core/usage-service";
import { filterCatalog } from "../scripts/core/catalog-service";
import type { DeityDefinition } from "../scripts/core/types";

const deity: DeityDefinition = { id: "a", schemaVersion: 1, revision: 1, createdAt: "", updatedAt: "", checksum: "", name: "A", title: "T", description: "D", domains: ["shadow"], passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: true, players: true, characterSheet: true } };

describe("formula service", () => { it("evaluates whitelisted facts", () => expect(evaluateFormula("3 + @actor.level", { actor: { level: 4 }, target: {} })).toBe(7)); it("rejects code", () => expect(validateFormula("window.alert(1)")).toBe(false)); });
describe("conditions and grants", () => { it("evaluates nested boolean conditions", () => expect(evaluateCondition({ type: "and", children: [{ type: "fact", key: "level", equals: 5 }, { type: "not", child: { type: "fact", key: "dead", equals: true } }] }, { level: 5, dead: false })).toBe(true)); it("requires an exact pick", () => expect(resolveGrantGroup({ id: "g", mode: "any", pick: 1, label: "", grants: [{ type: "bonus", ref: "a" }] }, { groupId: "g", refs: ["a"] })).toEqual(["a"])); });
describe("usage", () => { it("consumes and resets daily uses", () => { const state = { used: 0, max: 1, lastResetAt: 0, reset: "daily" as const }; expect(canUse(state, 0)).toBe(true); expect(consume(state, 0).used).toBe(1); expect(shouldReset({ ...state, used: 1 }, 86400000)).toBe(true); }); });
describe("catalog", () => { it("filters hidden and pantheon entries", () => expect(filterCatalog([deity, { ...deity, id: "b", domains: ["fire"] }], { pantheonFilter: "shadow" }, new Set(["a"]))).toEqual([])); });
