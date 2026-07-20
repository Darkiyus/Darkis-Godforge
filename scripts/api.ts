import { filterCatalog } from "./core/catalog-service";
import type { DeityService } from "./core/deity-service";
import type { DeityDefinition, SelectionContext } from "./core/types";
import type { AdapterRegistry } from "./adapters/adapter-registry";
import type { MaterializationContext } from "./adapters/adapter.interface";
import type { ActorGodForgeState, GrantChoiceMap } from "./core/types";
import { resolveGrantGroup } from "./core/grant-service";
import { canUse, consume, reset } from "./core/usage-service";
import { executeAbility, type EffectContext, type EffectTarget } from "./core/effect-engine";

export interface GodForgeActor { id: string; uuid?: string; flags?: { [namespace: string]: unknown }; update(data: { flags: { "darkis-godforge": ActorGodForgeState | null } }): Promise<unknown>; }
export interface ActivationOptions { target?: EffectTarget; facts?: EffectContext["facts"]; rollDice?: EffectContext["rollDice"]; }

export class GodForgeApi {
  constructor(private readonly deities: DeityService, private readonly adapters: AdapterRegistry) {}
  getSelectableDeities(context: SelectionContext) { return filterCatalog(this.deities.list(), context, new Set()); }
  getAdapterCapabilities(systemId: string) { return this.adapters.get(systemId).capabilities; }
  async materializeDeity(deityId: string, systemId: string, context?: MaterializationContext): Promise<string | null> { const deity = this.getDeity(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return this.adapters.get(systemId).materialize(deity, context); }
  getDeity(id: string): DeityDefinition | null { return this.deities.get(id); }
  getActorDeity(actor: GodForgeActor): DeityDefinition | null { const state = actor.flags?.["darkis-godforge"]; if (!state || typeof state !== "object" || !("deityId" in state) || typeof state.deityId !== "string") return null; return this.getDeity(state.deityId); }
  getGrantChoices(deityId: string, _context: SelectionContext) { return this.getDeity(deityId)?.grantGroups ?? null; }
  async assignDeity(actor: GodForgeActor, deityId: string, choices: GrantChoiceMap = {}): Promise<void> {
    const deity = this.getDeity(deityId); if (!deity || !deity.visibility.players) throw new Error("Deity is not available for assignment.");
    const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, { groupId: group.id, refs: choices[group.id] ?? [] }));
    const usages = Object.fromEntries(deity.abilities.filter((ability) => ability.uses).map((ability) => [ability.id, { used: 0, max: ability.uses!.max, lastResetAt: Date.now(), reset: ability.uses!.reset }]));
    await actor.update({ flags: { "darkis-godforge": { deityId, grants, usages } } });
  }
  async removeDeity(actor: GodForgeActor): Promise<void> { await actor.update({ flags: { "darkis-godforge": null } }); }
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
