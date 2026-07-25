import { filterCatalog } from "./core/catalog-service";
import type { DeityService } from "./core/deity-service";
import type { DeityDefinition, SelectionContext } from "./core/types";
import type { AdapterRegistry } from "./adapters/adapter-registry";
import type { MaterializationContext } from "./adapters/adapter.interface";
import type { ActorGodForgeState, GrantChoiceMap } from "./core/types";
import { resolveGrantGroup } from "./core/grant-service";
import { canUse, consume, reset } from "./core/usage-service";
import { executeAbility, type EffectContext, type EffectTarget } from "./core/effect-engine";
import { buildExecutionOperations, type PreparedAbility } from "./core/execution-plan";
import { resolveClassGrants, type ClassGrantResult } from "./core/class-coupling";
import { buildCharacterWidgetData, type CharacterWidgetData } from "./core/character-widget";
import { exportDefinitions, importDefinitions } from "./core/import-export-service";
import { drawWeighted, type RandomDraw } from "./core/random-service";
import { getFoundryGame, getFoundryRuntime } from "./foundry/runtime";
import { currentViewerContext, requireGM } from "./foundry/permissions";
import { discoveryForViewer, isDeityVisible, redactForViewer, type PlayerDeityView, type ViewerContext } from "./core/visibility-service";
import { synchronizePassiveBonusItems } from "./foundry/effect-applier";
import { executeAbilityGraph, type ResolvedGraphRoll } from "./core/graph-execution";
import { validateAbilityGraph } from "./core/ability-graph";
import { collectGrantChoiceGroups, type GrantChoiceGroupView } from "./core/grant-choice-service";

export interface GodForgeEmbeddedItem { id: string; uuid?: string; name?: string; type?: string; system?: Record<string, unknown>; flags?: Record<string, unknown>; toObject?(): Record<string, unknown>; update?(data: Record<string, unknown>): Promise<unknown>; }
export interface GodForgeActorUpdate { flags?: { "darkis-godforge": ActorGodForgeState | null }; [path: string]: unknown; }
export interface GodForgeActor {
  id: string;
  uuid?: string;
  name?: string;
  system?: Record<string, unknown>;
  flags?: { [namespace: string]: unknown };
  items?: { contents?: GodForgeEmbeddedItem[] };
  update(data: GodForgeActorUpdate, options?: Record<string, unknown>): Promise<unknown>;
  unsetFlag?(namespace: string, key: string): Promise<unknown>;
  testUserPermission?(user: unknown, permission: string): boolean;
  createEmbeddedDocuments?(type: "Item", data: Record<string, unknown>[]): Promise<GodForgeEmbeddedItem[]>;
  deleteEmbeddedDocuments?(type: "Item", ids: string[]): Promise<unknown>;
  getStatistic?(slug: string): { check?: { roll?(options?: Record<string, unknown>): Promise<unknown> }; roll?(options?: Record<string, unknown>): Promise<unknown> } | null;
}
export interface ActivationOptions {
  targetActor?: GodForgeActor;
  allies?: GodForgeActor[];
  enemies?: GodForgeActor[];
  facts?: EffectContext["facts"];
  rollDice?: EffectContext["rollDice"];
  triggerEvent?: string;
}

export interface CodexSnapshotEntry extends PlayerDeityView {
  discovery: "rumor" | "revealed";
  rumorName?: string;
  rumorText?: string;
  choiceGroups: GrantChoiceGroupView[];
  lore?: boolean;
}

export class GodForgeApi {
  private catalogCache: { key: string; result: ReturnType<typeof filterCatalog> } | null = null;
  constructor(private readonly deities: DeityService, private readonly adapters: AdapterRegistry) {}
  async getSelectableDeities(context: SelectionContext) { const source = this.deities.list(); const systemId = context.systemId ?? getFoundryGame()?.system?.id ?? ""; const viewer = currentViewerContext(true); const primitiveContext = { classId: context.classId, level: context.level, region: context.region, pantheonFilter: context.pantheonFilter, systemId, catalogContext: context.catalogContext, viewer }; const key = JSON.stringify([source.map((deity) => [deity.id, deity.revision]), primitiveContext]); if (this.catalogCache?.key === key) return this.catalogCache.result; const official = await (this.adapters.tryGet(systemId)?.listOfficialDeities() ?? Promise.resolve([])); const contextName = context.catalogContext ?? "characterBuilder"; const hiddenSources = new Set(source.filter((deity) => deity.replacement.sourceUuid && (deity.replacement.mode === "hide" || deity.replacement.mode === "replace") && (!deity.replacement.contexts.length || deity.replacement.contexts.includes(contextName))).map((deity) => deity.replacement.sourceUuid)); const homebrew = filterCatalog(source, context, new Set(), viewer); const visibleOfficial = official.filter((deity) => !deity.sourceUuid || !hiddenSources.has(deity.sourceUuid)); const result = [...homebrew, ...visibleOfficial]; this.catalogCache = { key, result }; return result; }
  exportDeities(now?: string) { requireGM(); return exportDefinitions(this.deities.list(), now); }
  async importDeities(value: unknown): Promise<number> { requireGM(); const imported = importDefinitions(value); for (const deity of imported) this.deities.save(deity); await this.deities.flushPersistence(); this.catalogCache = null; return imported.length; }
  drawRandomDeity(random: () => number): RandomDraw { const viewer = currentViewerContext(true); return drawWeighted(this.deities.list().filter((deity) => deity.kind !== "lore" && isDeityVisible(deity, viewer) && discoveryForViewer(deity, viewer) === "revealed").map((deity) => ({ id: deity.id, label: deity.name, weight: 1 })), random); }
  getAdapterCapabilities(systemId: string) { return this.adapters.get(systemId).capabilities; }
  isDeitySelectableByPlayer(deityId: string, viewer: ViewerContext = { ...currentViewerContext(true), isGM: false }): boolean { const deity = this.deities.get(deityId); return Boolean(deity && deity.kind !== "lore" && isDeityVisible(deity, viewer) && discoveryForViewer(deity, viewer) === "revealed"); }
  async materializeDeity(deityId: string, systemId: string, context?: MaterializationContext): Promise<string | null> { requireGM(); const deity = this.deities.get(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return this.adapters.get(systemId).materialize(deity, context); }
  getDeity(id: string): DeityDefinition | PlayerDeityView | null { const deity = this.deities.get(id); if (!deity) return null; const viewer = currentViewerContext(); return viewer.isGM ? deity : discoveryForViewer(deity, viewer) === "revealed" ? redactForViewer(deity, viewer) : null; }
  getActorDeity(actor: GodForgeActor): DeityDefinition | PlayerDeityView | null { this.requireActorOwner(actor); const state = actor.flags?.["darkis-godforge"]; if (!state || typeof state !== "object" || !("deityId" in state) || typeof state.deityId !== "string") return null; const deity = this.deities.get(state.deityId); if (!deity) return null; const viewer = { ...currentViewerContext(), actorDeityId: state.deityId, ownsActor: true }; return viewer.isGM ? deity : redactForViewer(deity, viewer); }
  getCharacterWidgetData(actor: GodForgeActor): CharacterWidgetData { this.requireActorOwner(actor); const value = actor.flags?.["darkis-godforge"]; const state = value && typeof value === "object" && "deityId" in value && "grants" in value && "usages" in value ? value as ActorGodForgeState : null; const deity = state ? this.deities.get(state.deityId) : null; if (!deity || !state) return buildCharacterWidgetData(null, null); const viewer = currentViewerContext(); if (viewer.isGM) return buildCharacterWidgetData(deity, state); const visible = redactForViewer(deity, { ...viewer, actorDeityId: deity.id, ownsActor: true }); return buildCharacterWidgetData(visible, { ...state, grants: [] }); }
  getCharacterWidgetDataForViewer(actor: GodForgeActor, viewer: ViewerContext): CharacterWidgetData {
    const value = actor.flags?.["darkis-godforge"];
    const state = value && typeof value === "object" && "deityId" in value && "grants" in value && "usages" in value ? value as ActorGodForgeState : null;
    const deity = state ? this.deities.get(state.deityId) : null;
    if (!deity || !state) return buildCharacterWidgetData(null, null);
    const visible = redactForViewer(deity, { ...viewer, actorDeityId: deity.id, actorId: actor.id, ownsActor: true });
    return buildCharacterWidgetData(visible, { ...state, grants: [] });
  }
  getCodexSnapshot(viewer: ViewerContext): CodexSnapshotEntry[] {
    return this.deities.list().flatMap((deity): CodexSnapshotEntry[] => {
      if (!isDeityVisible(deity, viewer)) return [];
      const discovery = discoveryForViewer(deity, viewer);
      if (discovery === "hidden") return [];
      if (discovery === "rumor") return [{ id: deity.id, name: "", discovery, rumorName: deity.discovery?.rumorName, rumorText: deity.discovery?.rumorText, choiceGroups: [] }];
      const visible = redactForViewer(deity, viewer);
      if (!visible) return [];
      return [{ ...visible, discovery, lore: deity.kind === "lore", choiceGroups: deity.kind === "lore" ? [] : deity.grantGroups.flatMap((group) => collectGrantChoiceGroups(group)) }];
    });
  }
  getGrantChoices(deityId: string, _context: SelectionContext) { requireGM(); return this.deities.get(deityId)?.grantGroups ?? null; }
  getClassGrants(deityId: string, classId: string, selections: { groupId: string; refs: string[] }[] = []): ClassGrantResult { requireGM(); const deity = this.deities.get(deityId); if (!deity) throw new Error(`Unknown deity: ${deityId}`); return resolveClassGrants(deity, classId, selections); }
  buildClassCoupling(deityId: string, classId: string, systemId: string, selections: { groupId: string; refs: string[] }[] = []): object | null { return this.adapters.get(systemId).buildClassCoupling(this.getClassGrants(deityId, classId, selections)); }
  async assignDeity(actor: GodForgeActor, deityId: string, choices: GrantChoiceMap = {}): Promise<void> {
    this.requireActorOwner(actor); const deity = this.deities.get(deityId); if (!deity || deity.kind === "lore" || !isDeityVisible(deity, currentViewerContext(true))) throw new Error("Deity is not available for assignment.");
    const selections = Object.entries(choices).map(([groupId, refs]) => ({ groupId, refs }));
    const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, selections));
    const usages = Object.fromEntries(deity.abilities.filter((ability) => ability.uses).map((ability) => [ability.id, { used: 0, max: ability.uses!.max, lastResetAt: Date.now(), reset: ability.uses!.reset }]));
    await actor.update({ flags: { "darkis-godforge": { deityId, grants, usages } } });
    await this.synchronizeActorDeityItem(actor, deity);
    getFoundryRuntime()?.Hooks.callAll("godforge.trigger", "deity-assigned", actor);
  }
  async removeDeity(actor: GodForgeActor): Promise<void> { this.requireActorOwner(actor); if (actor.unsetFlag) await Promise.all(["deityId", "grants", "usages"].map((key) => actor.unsetFlag!("darkis-godforge", key))); else await actor.update({ flags: { "darkis-godforge": null } }); await this.removeActorDeityItems(actor); getFoundryRuntime()?.Hooks.callAll("godforge.trigger", "deity-removed", actor); }
  async resetActorUsages(actor: GodForgeActor, resetType: string): Promise<void> {
    this.requireActorOwner(actor); const state = this.readState(actor); const now = Date.now(); const usages = Object.fromEntries(Object.entries(state.usages).map(([id, usage]) => usage.reset === resetType ? [id, reset(usage, now)] : [id, usage])); await actor.update({ flags: { "darkis-godforge": { ...state, usages } } });
  }
  async prepareAbility(actor: GodForgeActor, abilityId: string, options: ActivationOptions = {}): Promise<PreparedAbility> {
    requireGM();
    const state = this.readState(actor);
    const deity = this.deities.get(state.deityId);
    const ability = deity?.abilities.find((item) => item.id === abilityId);
    if (!ability) throw new Error("Ability is not available for this actor.");
    const existing = state.usages[abilityId];
    if (existing && !canUse(existing, Date.now())) throw new Error("No uses remaining.");
    const actorTargets = [actor, options.targetActor, ...(options.allies ?? []), ...(options.enemies ?? [])].filter((entry): entry is GodForgeActor => Boolean(entry));
    const actorDocuments = new Map(actorTargets.map((entry) => [entry.id, entry]));
    const targets = Object.fromEntries(actorTargets.map((entry) => [entry.id, this.effectTarget(entry)]));
    const before = structuredClone(targets);
    const facts = options.facts ?? this.formulaFacts(actor, options.targetActor);
    const executionContext = {
      actor: targets[actor.id]!,
      target: options.targetActor ? targets[options.targetActor.id] : undefined,
      allies: options.allies?.map((entry) => targets[entry.id]!),
      enemies: options.enemies?.map((entry) => targets[entry.id]!),
      facts,
      conditionFacts: {
        always: true,
        "actor.level": facts.actor.level,
        "actor.hpPercent": facts.actor.hpPercent,
        "target.hpPercent": facts.target.hpPercent,
        "random.percent": Math.floor(Math.random() * 100) + 1
      },
      rollDice: options.rollDice ?? this.foundryRoll
    };
    const result = ability.graph && validateAbilityGraph(ability.graph).valid
      ? await executeAbilityGraph(ability.graph, { ...executionContext, triggerEvent: this.requireGraphTrigger(ability.graph, options.triggerEvent ?? "manual"), rollStatistic: (actorId, selector, dc) => this.rollStatistic(actorDocuments.get(actorId), selector, dc) })
      : await executeAbility(ability, executionContext);
    const operations = buildExecutionOperations(before, targets, result, actor.id);
    if (existing) operations.push({ kind: "actor-update", targetId: actor.id, path: "flags.darkis-godforge", before: structuredClone(state), after: { ...structuredClone(state), usages: { ...structuredClone(state.usages), [abilityId]: consume(existing, Date.now()) } } });
    return {
      id: crypto.randomUUID(),
      actorId: actor.id,
      deityId: deity!.id,
      abilityId,
      abilityName: ability.name,
      createdAt: Date.now(),
      operations,
      result,
      updatedTargets: targets
    };
  }
  async commitPreparedAbility(actor: GodForgeActor, prepared: PreparedAbility, apply: (prepared: PreparedAbility, actors: Map<string, GodForgeActor>) => Promise<void>, options: ActivationOptions = {}): Promise<void> {
    requireGM();
    if (prepared.actorId !== actor.id || Date.now() - prepared.createdAt > 5 * 60_000) throw new Error("Ability preview is stale or belongs to another actor.");
    const state = this.readState(actor);
    const deity = this.deities.get(state.deityId);
    const ability = deity?.abilities.find((item) => item.id === prepared.abilityId);
    if (!ability || prepared.deityId !== deity?.id) throw new Error("Ability changed after the preview was created.");
    const stateOperation = prepared.operations.find((operation) => operation.kind === "actor-update" && operation.targetId === actor.id && operation.path === "flags.darkis-godforge");
    if (stateOperation?.kind === "actor-update" && JSON.stringify(stateOperation.before) !== JSON.stringify(state)) throw new Error("Ability usage changed while the preview was waiting for approval.");
    const actors = new Map([actor, options.targetActor, ...(options.allies ?? []), ...(options.enemies ?? [])].filter((entry): entry is GodForgeActor => Boolean(entry)).map((entry) => [entry.id, entry]));
    await apply(prepared, actors);
  }
  async activateAbility(actor: GodForgeActor, abilityId: string, options: ActivationOptions = {}): Promise<void> {
    const prepared = await this.prepareAbility(actor, abilityId, options);
    await this.commitPreparedAbility(actor, prepared, async (plan, actors) => {
      for (const operation of plan.operations.filter((entry) => entry.kind === "actor-update")) {
        const target = actors.get(operation.targetId);
        if (target) await target.update({ [operation.path]: operation.after });
      }
    }, options);
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
    if (adapter.capabilities.passiveBonuses) await synchronizePassiveBonusItems(actor, deity.id, deity.name, deity.passiveBonuses);
  }
  private async removeActorDeityItems(actor: GodForgeActor): Promise<void> {
    const ids = (actor.items?.contents ?? []).filter((item) => {
      const flag = item.flags?.["darkis-godforge"];
      return Boolean(flag && typeof flag === "object" && ("definitionUuid" in flag || "passiveBonusItem" in flag || "abilityId" in flag));
    }).map((item) => item.id);
    if (ids.length && actor.deleteEmbeddedDocuments) await actor.deleteEmbeddedDocuments("Item", ids);
  }
  private actorDeityItems(actor: GodForgeActor): GodForgeEmbeddedItem[] { return (actor.items?.contents ?? []).filter((item) => { const flag = item.flags?.["darkis-godforge"]; return Boolean(flag && typeof flag === "object" && "definitionUuid" in flag); }); }
  private readState(actor: GodForgeActor): ActorGodForgeState { const value = actor.flags?.["darkis-godforge"]; if (!value || typeof value !== "object" || !("deityId" in value) || typeof value.deityId !== "string" || !("usages" in value) || typeof value.usages !== "object") throw new Error("Actor has no assigned deity."); return value as ActorGodForgeState; }
  private effectTarget(actor: GodForgeActor): EffectTarget {
    const system = actor.system ?? {};
    const attributes = record(system.attributes);
    const hp = record(attributes.hp);
    const currency = record(system.currency);
    return {
      id: actor.id,
      hp: finite(hp.value),
      maxHp: finite(hp.max),
      gold: finite(currency.gp),
      modifiers: {},
      conditions: (actor.items?.contents ?? []).filter((item) => item.type === "condition").map((item) => String(record(item.system).slug ?? item.name ?? item.id))
    };
  }
  private formulaFacts(actor: GodForgeActor, target?: GodForgeActor): EffectContext["facts"] {
    const actorSystem = actor.system ?? {};
    const targetSystem = target?.system ?? {};
    return {
      actor: { level: finite(record(actorSystem.details).level) ?? finite(actorSystem.level) ?? 0, hpPercent: hpPercent(actorSystem) },
      target: { hpPercent: hpPercent(targetSystem) }
    };
  }
  private readonly foundryRoll: EffectContext["rollDice"] = async (formula) => {
    const RollClass = (globalThis as unknown as { Roll?: new (formula: string) => { evaluate(options?: { async?: boolean }): Promise<{ total?: number }> } }).Roll;
    if (!RollClass) throw new Error("Foundry Roll is unavailable.");
    const roll = await new RollClass(formula).evaluate({ async: true });
    return Number(roll.total ?? 0);
  };
  private async rollStatistic(actor: GodForgeActor | undefined, selector: string, dc?: number): Promise<ResolvedGraphRoll> {
    if (!actor) throw new Error("The roll target actor is unavailable.");
    const statistic = actor.getStatistic?.(selector);
    const roller = statistic?.check?.roll ?? statistic?.roll;
    if (!roller) throw new Error(`System statistic is unavailable: ${selector}`);
    const raw = await roller.call(statistic?.check ?? statistic, { createMessage: false, skipDialog: true, ...(dc === undefined ? {} : { dc: { value: dc } }) });
    const result = record(raw);
    const roll = record(result.roll);
    const total = finite(result.total) ?? finite(roll.total);
    if (total === undefined) throw new Error(`The ${selector} roll did not return a total.`);
    const degreeValue = result.degreeOfSuccess ?? record(result.options).degreeOfSuccess ?? roll.degreeOfSuccess;
    if (degreeValue === undefined && dc === undefined) throw new Error(`The ${selector} roll needs a DC or a system-provided degree of success.`);
    return { total, degree: degreeName(degreeValue, total, dc) };
  }
  private requireGraphTrigger(graph: NonNullable<DeityDefinition["abilities"][number]["graph"]>, event: string): string {
    const matches = graph.nodes.some((node) => node.category === "trigger" && (node.type === event || node.type === "custom" && (node.config.event ?? node.config.selector) === event));
    if (!matches) throw new Error(`This ability has no ${event} trigger.`);
    return event;
  }
  private requireActorOwner(actor: GodForgeActor): void { const game = getFoundryGame(); if (game?.user?.isGM === true) return; if (game?.user && actor.testUserPermission?.(game.user, "OWNER") === true) return; throw new Error("GodForge: Actor owner or GM required."); }
}

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function finite(value: unknown): number | undefined { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; }
function hpPercent(system: Record<string, unknown>): number | undefined { const hp = record(record(system.attributes).hp); const value = finite(hp.value); const max = finite(hp.max); return value === undefined || !max ? undefined : value / max * 100; }
function degreeName(value: unknown, total: number, dc?: number): ResolvedGraphRoll["degree"] { if (value === 3 || value === "criticalSuccess" || value === "critical-success") return "critical-success"; if (value === 2 || value === "success") return "success"; if (value === 1 || value === "failure") return "failure"; if (value === 0 || value === "criticalFailure" || value === "critical-failure") return "critical-failure"; return dc === undefined || total >= dc ? "success" : "failure"; }
