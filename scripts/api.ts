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
import { currentViewerContext, requireGM } from "./foundry/permissions";
import { isDeityVisible, redactForViewer, type PlayerDeityView } from "./core/visibility-service";

export interface GodForgeEmbeddedItem { id: string; uuid?: string; flags?: Record<string, unknown>; update?(data: Record<string, unknown>): Promise<unknown>; }
export interface GodForgeActor { id: string; uuid?: string; flags?: { [namespace: string]: unknown }; items?: { contents?: GodForgeEmbeddedItem[] }; update(data: { flags: { "darkis-godforge": ActorGodForgeState | null } }): Promise<unknown>; unsetFlag?(namespace: string, key: string): Promise<unknown>; testUserPermission?(user: unknown, permission: string): boolean; createEmbeddedDocuments?(type: "Item", data: Record<string, unknown>[]): Promise<GodForgeEmbeddedItem[]>; deleteEmbeddedDocuments?(type: "Item", ids: string[]): Promise<unknown>; }
export interface ActivationOptions { target?: EffectTarget; facts?: EffectContext["facts"]; rollDice?: EffectContext["rollDice"]; }

export class GodForgeApi {
  private catalogCache: { key: string; result: ReturnType<typeof filterCatalog> } | null = null;
  constructor(private readonly deities: DeityService, private readonly adapters: AdapterRegistry) {}
  async getSelectableDeities(context: SelectionContext) { const source = this.deities.list(); const systemId = context.systemId ?? getFoundryGame()?.system?.id ?? ""; const viewer = currentViewerContext(true); const primitiveContext = { classId: context.classId, level: context.level, region: context.region, pantheonFilter: context.pantheonFilter, systemId, catalogContext: context.catalogContext, viewer }; const key = JSON.stringify([source.map((deity) => [deity.id, deity.revision]), primitiveContext]); if (this.catalogCache?.key === key) return this.catalogCache.result; const official = await (this.adapters.tryGet(systemId)?.listOfficialDeities() ?? Promise.resolve([])); const contextName = context.catalogContext ?? "characterBuilder"; const hiddenSources = new Set(source.filter((deity) => deity.replacement.sourceUuid && (deity.replacement.mode === "hide" || deity.replacement.mode === "replace") && (!deity.replacement.contexts.length || deity.replacement.contexts.includes(contextName))).map((deity) => deity.replacement.sourceUuid)); const homebrew = filterCatalog(source, context, new Set(), viewer); const visibleOfficial = official.filter((deity) => !deity.sourceUuid || !hiddenSources.has(deity.sourceUuid)); const result = [...homebrew, ...visibleOfficial]; this.catalogCache = { key, result }; return result; }
  exportDeities(now?: string) { requireGM(); return exportDefinitions(this.deities.list(), now); }
  importDeities(value: unknown): number { requireGM(); const imported = importDefinitions(value); for (const deity of imported) this.deities.save(deity); this.catalogCache = null; return imported.length; }
  drawRandomDeity(random: () => number): RandomDraw { const viewer = currentViewerContext(true); return drawWeighted(this.deities.list().filter((deity) => isDeityVisible(deity, viewer)).map((deity) => ({ id: deity.id, label: deity.name, weight: 1 })), random); }
  getAdapterCapabilities(systemId: string) { return this.adapters.get(systemId).capabilities; }
  isDeitySelectableByPlayer(deityId: string): boolean { const deity = this.deities.get(deityId); return Boolean(deity && isDeityVisible(deity, { isGM: false, selection: true })); }
  async materializeDeity(deityId: string, systemId: string, context?: MaterializationContext): Promise<string | null> { requireGM(); const deity = this.deities.get(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return this.adapters.get(systemId).materialize(deity, context); }
  getDeity(id: string): DeityDefinition | PlayerDeityView | null { const deity = this.deities.get(id); if (!deity) return null; const viewer = currentViewerContext(); return viewer.isGM ? deity : redactForViewer(deity, viewer); }
  getActorDeity(actor: GodForgeActor): DeityDefinition | PlayerDeityView | null { this.requireActorOwner(actor); const state = actor.flags?.["darkis-godforge"]; if (!state || typeof state !== "object" || !("deityId" in state) || typeof state.deityId !== "string") return null; const deity = this.deities.get(state.deityId); if (!deity) return null; const viewer = { ...currentViewerContext(), actorDeityId: state.deityId, ownsActor: true }; return viewer.isGM ? deity : redactForViewer(deity, viewer); }
  getCharacterWidgetData(actor: GodForgeActor): CharacterWidgetData { this.requireActorOwner(actor); const value = actor.flags?.["darkis-godforge"]; const state = value && typeof value === "object" && "deityId" in value && "grants" in value && "usages" in value ? value as ActorGodForgeState : null; const deity = state ? this.deities.get(state.deityId) : null; if (!deity || !state) return buildCharacterWidgetData(null, null); const viewer = currentViewerContext(); if (viewer.isGM) return buildCharacterWidgetData(deity, state); const visible = redactForViewer(deity, { ...viewer, actorDeityId: deity.id, ownsActor: true }); return buildCharacterWidgetData(visible, { ...state, grants: [] }); }
  getGrantChoices(deityId: string, _context: SelectionContext) { requireGM(); return this.deities.get(deityId)?.grantGroups ?? null; }
  getClassGrants(deityId: string, classId: string, selections: { groupId: string; refs: string[] }[] = []): ClassGrantResult { requireGM(); const deity = this.deities.get(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return resolveClassGrants(deity, classId, selections); }
  buildClassCoupling(deityId: string, classId: string, systemId: string, selections: { groupId: string; refs: string[] }[] = []): object | null { return this.adapters.get(systemId).buildClassCoupling(this.getClassGrants(deityId, classId, selections)); }
  async assignDeity(actor: GodForgeActor, deityId: string, choices: GrantChoiceMap = {}): Promise<void> {
    this.requireActorOwner(actor); const deity = this.deities.get(deityId); if (!deity || !isDeityVisible(deity, currentViewerContext(true))) throw new Error("Deity is not available for assignment.");
    const selections = Object.entries(choices).map(([groupId, refs]) => ({ groupId, refs }));
    const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, selections));
    const usages = Object.fromEntries(deity.abilities.filter((ability) => ability.uses).map((ability) => [ability.id, { used: 0, max: ability.uses!.max, lastResetAt: Date.now(), reset: ability.uses!.reset }]));
    await actor.update({ flags: { "darkis-godforge": { deityId, grants, usages } } });
    await this.synchronizeActorDeityItem(actor, deity);
  }
  async removeDeity(actor: GodForgeActor): Promise<void> { this.requireActorOwner(actor); if (actor.unsetFlag) await Promise.all(["deityId", "grants", "usages"].map((key) => actor.unsetFlag!("darkis-godforge", key))); else await actor.update({ flags: { "darkis-godforge": null } }); await this.removeActorDeityItems(actor); }
  async resetActorUsages(actor: GodForgeActor, resetType: string): Promise<void> {
    requireGM(); const state = this.readState(actor); const now = Date.now(); const usages = Object.fromEntries(Object.entries(state.usages).map(([id, usage]) => usage.reset === resetType ? [id, reset(usage, now)] : [id, usage])); await actor.update({ flags: { "darkis-godforge": { ...state, usages } } });
  }
  async activateAbility(actor: GodForgeActor, abilityId: string, options: ActivationOptions = {}): Promise<void> {
    requireGM(); const state = this.readState(actor); const deity = this.deities.get(state.deityId); const ability = deity?.abilities.find((item) => item.id === abilityId); if (!ability) throw new Error("Ability is not available for this actor.");
    const existing = state.usages[abilityId]; if (existing && !canUse(existing, Date.now())) throw new Error("No uses remaining.");
    const updatedUsages = existing ? { ...state.usages, [abilityId]: consume(existing, Date.now()) } : state.usages;
    const subject: EffectTarget = { id: actor.id, modifiers: {}, conditions: [] }; await executeAbility(ability, { actor: subject, target: options.target, facts: options.facts ?? { actor: { level: 0 }, target: {} }, rollDice: options.rollDice });
    await actor.update({ flags: { "darkis-godforge": { ...state, usages: updatedUsages } } });
  }
  getReplacementFor(sourceUuid: string): DeityDefinition | null { requireGM(); return this.deities.list().find((deity) => deity.replacement.sourceUuid === sourceUuid && deity.replacement.mode === "replace") ?? null; }
  isSourceHidden(sourceUuid: string, context: string): boolean { requireGM(); return this.deities.list().some((deity) => deity.replacement.sourceUuid === sourceUuid && deity.replacement.mode === "hide" && deity.replacement.contexts.includes(context)); }
  registerAdapter(adapter: Parameters<AdapterRegistry["register"]>[0]): void { requireGM(); this.adapters.register(adapter); }
  private async synchronizeActorDeityItem(actor: GodForgeActor, deity: DeityDefinition): Promise<void> {
    const systemId = getFoundryGame()?.system?.id;
    const adapter = systemId ? this.adapters.tryGet(systemId) : null;
    if (!adapter || !actor.createEmbeddedDocuments) return;
    const existing = this.actorDeityItems(actor);
    const primary = existing[0];
    const uuid = await adapter.materialize(deity, { createItem: async (data) => {
      if (primary?.update) { await primary.update(data); return { uuid: primary.uuid ?? `Actor.${actor.id}.Item.${primary.id}` }; }
      const [created] = await actor.createEmbeddedDocuments!("Item", [data]);
      if (!created) throw new Error("The system did not create the deity item.");
      return { uuid: created.uuid ?? `Actor.${actor.id}.Item.${created.id}` };
    } });
    if (uuid && existing.length > 1 && actor.deleteEmbeddedDocuments) await actor.deleteEmbeddedDocuments("Item", existing.slice(1).map((item) => item.id));
  }
  private async removeActorDeityItems(actor: GodForgeActor): Promise<void> { const ids = this.actorDeityItems(actor).map((item) => item.id); if (ids.length && actor.deleteEmbeddedDocuments) await actor.deleteEmbeddedDocuments("Item", ids); }
  private actorDeityItems(actor: GodForgeActor): GodForgeEmbeddedItem[] { return (actor.items?.contents ?? []).filter((item) => { const flag = item.flags?.["darkis-godforge"]; return Boolean(flag && typeof flag === "object" && "definitionUuid" in flag); }); }
  private readState(actor: GodForgeActor): ActorGodForgeState { const value = actor.flags?.["darkis-godforge"]; if (!value || typeof value !== "object" || !("deityId" in value) || typeof value.deityId !== "string" || !("usages" in value) || typeof value.usages !== "object") throw new Error("Actor has no assigned deity."); return value as ActorGodForgeState; }
  private requireActorOwner(actor: GodForgeActor): void { const game = getFoundryGame(); if (!game || game.user?.isGM === true) return; if (actor.testUserPermission?.(game.user, "OWNER") === true) return; throw new Error("GodForge: Actor owner or GM required."); }
}
