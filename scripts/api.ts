import { filterCatalog } from "./core/catalog-service";
import type { DeityService } from "./core/deity-service";
import type { DeityDefinition, SelectionContext } from "./core/types";
import type { AdapterRegistry } from "./adapters/adapter-registry";
import type { MaterializationContext } from "./adapters/adapter.interface";
import type { ActorGodForgeState, GrantChoiceMap } from "./core/types";
import { resolveGrantGroup } from "./core/grant-service";
import { canUse, consume, reset } from "./core/usage-service";
import { executeAbility, type EffectContext, type EffectTarget } from "./core/effect-engine";
import { resolveClassGrants, type ClassGrantResult } from "./core/class-coupling";
import { buildCharacterWidgetData, type CharacterWidgetData } from "./core/character-widget";
import { exportDefinitions, importDefinitions } from "./core/import-export-service";
import { drawWeighted, type RandomDraw } from "./core/random-service";
import { getFoundryGame } from "./foundry/runtime";

export interface GodForgeActor { id: string; uuid?: string; flags?: { [namespace: string]: unknown }; update(data: { flags: { "darkis-godforge": ActorGodForgeState | null } }): Promise<unknown>; unsetFlag?(namespace: string, key: string): Promise<unknown>; }
export interface ActivationOptions { target?: EffectTarget; facts?: EffectContext["facts"]; rollDice?: EffectContext["rollDice"]; }

export class GodForgeApi {
  private catalogCache: { key: string; result: ReturnType<typeof filterCatalog> } | null = null;
  constructor(private readonly deities: DeityService, private readonly adapters: AdapterRegistry) {}
  async getSelectableDeities(context: SelectionContext) { const source = this.deities.list(); const systemId = context.systemId ?? getFoundryGame()?.system?.id ?? ""; const primitiveContext = { classId: context.classId, level: context.level, region: context.region, pantheonFilter: context.pantheonFilter, systemId, catalogContext: context.catalogContext }; const key = JSON.stringify([source.map((deity) => [deity.id, deity.revision]), primitiveContext]); if (this.catalogCache?.key === key) return this.catalogCache.result; const official = await (this.adapters.tryGet(systemId)?.listOfficialDeities() ?? Promise.resolve([])); const contextName = context.catalogContext ?? "characterBuilder"; const hiddenSources = new Set(source.filter((deity) => deity.replacement.sourceUuid && (deity.replacement.mode === "hide" || deity.replacement.mode === "replace") && (!deity.replacement.contexts.length || deity.replacement.contexts.includes(contextName))).map((deity) => deity.replacement.sourceUuid)); const homebrew = filterCatalog(source, context, new Set()); const visibleOfficial = official.filter((deity) => !deity.sourceUuid || !hiddenSources.has(deity.sourceUuid)); const result = [...homebrew, ...visibleOfficial]; this.catalogCache = { key, result }; return result; }
  exportDeities(now?: string) { return exportDefinitions(this.deities.list(), now); }
  importDeities(value: unknown): number { const imported = importDefinitions(value); for (const deity of imported) this.deities.save(deity); this.catalogCache = null; return imported.length; }
  drawRandomDeity(random: () => number): RandomDraw { return drawWeighted(this.deities.list().map((deity) => ({ id: deity.id, label: deity.name, weight: 1 })), random); }
  getAdapterCapabilities(systemId: string) { return this.adapters.get(systemId).capabilities; }
  async materializeDeity(deityId: string, systemId: string, context?: MaterializationContext): Promise<string | null> { const deity = this.getDeity(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return this.adapters.get(systemId).materialize(deity, context); }
  getDeity(id: string): DeityDefinition | null { return this.deities.get(id); }
  getActorDeity(actor: GodForgeActor): DeityDefinition | null { const state = actor.flags?.["darkis-godforge"]; if (!state || typeof state !== "object" || !("deityId" in state) || typeof state.deityId !== "string") return null; return this.getDeity(state.deityId); }
  getCharacterWidgetData(actor: GodForgeActor): CharacterWidgetData { const value = actor.flags?.["darkis-godforge"]; const state = value && typeof value === "object" && "deityId" in value && "grants" in value && "usages" in value ? value as ActorGodForgeState : null; return buildCharacterWidgetData(this.getActorDeity(actor), state); }
  getGrantChoices(deityId: string, _context: SelectionContext) { return this.getDeity(deityId)?.grantGroups ?? null; }
  getClassGrants(deityId: string, classId: string, selections: { groupId: string; refs: string[] }[] = []): ClassGrantResult { const deity = this.getDeity(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return resolveClassGrants(deity, classId, selections); }
  buildClassCoupling(deityId: string, classId: string, systemId: string, selections: { groupId: string; refs: string[] }[] = []): object | null { return this.adapters.get(systemId).buildClassCoupling(this.getClassGrants(deityId, classId, selections)); }
  async assignDeity(actor: GodForgeActor, deityId: string, choices: GrantChoiceMap = {}): Promise<void> {
    const deity = this.getDeity(deityId); if (!deity || !deity.visibility.players) throw new Error("Deity is not available for assignment.");
    const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, { groupId: group.id, refs: choices[group.id] ?? [] }));
    const usages = Object.fromEntries(deity.abilities.filter((ability) => ability.uses).map((ability) => [ability.id, { used: 0, max: ability.uses!.max, lastResetAt: Date.now(), reset: ability.uses!.reset }]));
    await actor.update({ flags: { "darkis-godforge": { deityId, grants, usages } } });
  }
  async removeDeity(actor: GodForgeActor): Promise<void> { if (actor.unsetFlag) { await Promise.all(["deityId", "grants", "usages"].map((key) => actor.unsetFlag!("darkis-godforge", key))); return; } await actor.update({ flags: { "darkis-godforge": null } }); }
  async resetActorUsages(actor: GodForgeActor, resetType: string): Promise<void> {
    const state = this.readState(actor); const now = Date.now(); const usages = Object.fromEntries(Object.entries(state.usages).map(([id, usage]) => usage.reset === resetType ? [id, reset(usage, now)] : [id, usage])); await actor.update({ flags: { "darkis-godforge": { ...state, usages } } });
  }
  async activateAbility(actor: GodForgeActor, abilityId: string, options: ActivationOptions = {}): Promise<void> {
    const state = this.readState(actor); const deity = this.getDeity(state.deityId); const ability = deity?.abilities.find((item) => item.id === abilityId); if (!ability) throw new Error("Ability is not available for this actor.");
    const existing = state.usages[abilityId]; if (existing && !canUse(existing, Date.now())) throw new Error("No uses remaining.");
    const updatedUsages = existing ? { ...state.usages, [abilityId]: consume(existing, Date.now()) } : state.usages;
    const subject: EffectTarget = { id: actor.id, modifiers: {}, conditions: [] }; await executeAbility(ability, { actor: subject, target: options.target, facts: options.facts ?? { actor: { level: 0 }, target: {} }, rollDice: options.rollDice });
    await actor.update({ flags: { "darkis-godforge": { ...state, usages: updatedUsages } } });
  }
  getReplacementFor(sourceUuid: string): DeityDefinition | null { return this.deities.list().find((deity) => deity.replacement.sourceUuid === sourceUuid && deity.replacement.mode === "replace") ?? null; }
  isSourceHidden(sourceUuid: string, context: string): boolean { return this.deities.list().some((deity) => deity.replacement.sourceUuid === sourceUuid && deity.replacement.mode === "hide" && deity.replacement.contexts.includes(context)); }
  registerAdapter(adapter: Parameters<AdapterRegistry["register"]>[0]): void { this.adapters.register(adapter); }
  private readState(actor: GodForgeActor): ActorGodForgeState { const value = actor.flags?.["darkis-godforge"]; if (!value || typeof value !== "object" || !("deityId" in value) || typeof value.deityId !== "string" || !("usages" in value) || typeof value.usages !== "object") throw new Error("Actor has no assigned deity."); return value as ActorGodForgeState; }
}
