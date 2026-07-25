import type { GodForgeActor } from "../api";
import type { DeityService } from "../core/deity-service";
import { TriggerRegistry } from "../core/trigger-registry";
import type { SocketRouter } from "./socket-router";
import { getFoundryGame, type FoundryHooks } from "./runtime";

interface ActorState { deityId?: string }

export class FoundryTriggerBridge {
  readonly registry = new TriggerRegistry();
  private readonly recent = new Map<string, number>();
  private readonly previousHp = new Map<string, number>();
  constructor(private readonly hooks: FoundryHooks, private readonly deities: DeityService, private readonly socketRouter: SocketRouter) {}
  register(): void {
    this.registry.rebuild(this.deities.list());
    this.deities.subscribe(() => this.registry.rebuild(this.deities.list()));
    this.hooks.on("combatStart", (combat: unknown) => this.dispatchCombat("combat-start", combat));
    this.hooks.on("deleteCombat", (combat: unknown) => this.dispatchCombat("combat-end", combat));
    this.hooks.on("combatRound", (combat: unknown) => this.dispatchCombat("round-start", combat));
    this.hooks.on("pf2e.startTurn", (actor: unknown) => this.dispatch("turn-start", actor));
    this.hooks.on("pf2e.endTurn", (actor: unknown) => this.dispatch("turn-end", actor));
    this.hooks.on("preUpdateActor", (actor: unknown, changes: unknown) => {
      if (numberAt(changes, ["system", "attributes", "hp", "value"]) === undefined) return;
      const candidate = actor as GodForgeActor;
      const current = numberAt(candidate.system ?? {}, ["attributes", "hp", "value"]);
      if (current !== undefined) this.previousHp.set(candidate.id, current);
    });
    this.hooks.on("updateActor", (actor: unknown, changes: unknown, options: unknown) => this.dispatchActorUpdate(actor, changes, options));
    this.hooks.on("createItem", (item: unknown, options: unknown) => this.dispatchItem("condition-added", item, options));
    this.hooks.on("deleteItem", (item: unknown, options: unknown) => this.dispatchItem("condition-removed", item, options));
    this.hooks.on("createChatMessage", (message: unknown, options: unknown) => this.dispatchRollMessage(message, options));
    this.hooks.on("updateToken", (token: unknown, changes: unknown, options: unknown) => {
      const record = object(changes); if ("x" in record || "y" in record || "elevation" in record) this.dispatch("token-move", object(token).actor);
      void options;
    });
    this.hooks.on("canvasReady", () => this.dispatchAll("scene-change"));
    this.hooks.on("updateWorldTime", () => this.dispatchAll("world-time"));
    this.hooks.on("pf2e.restForTheNight", (actor: unknown) => this.dispatch("daily-preparations", actor));
    this.hooks.on("godforge.trigger", (event: unknown, actor: unknown) => { if (typeof event === "string" && event.length <= 128) this.dispatch(event, actor); });
  }
  private dispatchActorUpdate(actorValue: unknown, changesValue: unknown, optionsValue: unknown): void {
    const options = object(optionsValue);
    if (options.darkisGodForge === true) return;
    const changes = object(changesValue);
    const hp = numberAt(changes, ["system", "attributes", "hp", "value"]);
    if (hp !== undefined) {
      const actor = actorValue as GodForgeActor;
      const previous = this.previousHp.get(actor.id);
      this.previousHp.delete(actor.id);
      if (previous !== undefined && hp < previous) this.dispatch("damage-taken", actor);
      else if (previous !== undefined && hp > previous) this.dispatch("healing-received", actor);
      const maxHp = numberAt(actor.system ?? {}, ["attributes", "hp", "max"]);
      this.dispatch("hp-threshold", actor, { hpPercent: maxHp ? hp / maxHp * 100 : undefined });
    }
  }
  private dispatchItem(event: string, itemValue: unknown, optionsValue: unknown): void {
    if (object(optionsValue).darkisGodForge === true) return;
    const item = object(itemValue);
    if (item.type === "condition") this.dispatch(event, item.parent);
  }
  private dispatchRollMessage(messageValue: unknown, optionsValue: unknown): void {
    if (object(optionsValue).darkisGodForge === true) return;
    const message = object(messageValue);
    const flags = object(object(message.flags).pf2e);
    const context = object(flags.context);
    const actor = message.actor ?? object(message.token).actor;
    if (!actor) return;
    const type = String(context.type ?? context.rollType ?? "").toLocaleLowerCase();
    const domains = Array.isArray(context.domains) ? context.domains.map(String) : [];
    const options = Array.isArray(context.options) ? context.options.map(String) : [];
    const selector = String(context.statistic ?? context.slug ?? domains.find((domain) => !domain.includes(":")) ?? "");
    if (!message.rolls && !message.roll) return;
    this.dispatch("roll-complete", actor, { selector });
    if (type.includes("damage")) this.dispatch("damage-roll", actor, { selector });
    else if (type.includes("attack") || domains.some((domain) => domain.includes("attack"))) this.dispatch("attack-roll", actor, { selector });
    else if (type.includes("saving") || domains.some((domain) => domain.includes("saving-throw"))) this.dispatch("saving-throw", actor, { selector });
    else if (type.includes("skill") || domains.some((domain) => PF2E_SKILLS.has(domain))) this.dispatch("skill-check", actor, { selector });
    if (type.includes("spell") || domains.some((domain) => domain.includes("spell")) || options.some((option) => option.includes("spell"))) this.dispatch("spell-cast", actor);
    if (context.item || flags.origin || type.includes("action")) this.dispatch("item-used", actor);
  }
  private dispatchCombat(event: string, combatValue: unknown): void {
    const turns = object(combatValue).turns;
    if (!Array.isArray(turns)) return;
    for (const turn of turns) this.dispatch(event, object(turn).actor);
  }
  private dispatchAll(event: string): void { for (const actor of (getFoundryGame()?.actors?.contents ?? []) as GodForgeActor[]) this.dispatch(event, actor); }
  private dispatch(event: string, actorValue: unknown, payload: Record<string, unknown> = {}): void {
    if (getFoundryGame()?.user?.isGM !== true || !this.registry.hasEvent(event) || !actorValue || typeof actorValue !== "object") return;
    const actor = actorValue as GodForgeActor;
    const state = actor.flags?.["darkis-godforge"] as ActorState | undefined;
    if (!state?.deityId) return;
    const now = Date.now();
    for (const entry of this.registry.forActor(event, state.deityId)) {
      if (ROLL_EVENTS.has(event)) {
        const configuredSelector = String(entry.config.selector ?? "").trim().toLocaleLowerCase();
        const actualSelector = String(payload.selector ?? "").trim().toLocaleLowerCase();
        if (configuredSelector && configuredSelector !== actualSelector) continue;
      }
      if (event === "hp-threshold") {
        const threshold = Number(entry.config.threshold);
        const hpPercent = Number(payload.hpPercent);
        if (Number.isFinite(threshold) && (!Number.isFinite(hpPercent) || hpPercent > threshold)) continue;
      }
      const key = `${event}:${actor.id}:${entry.abilityId}`;
      if (now - (this.recent.get(key) ?? 0) < 500) continue;
      this.recent.set(key, now);
      void this.socketRouter.activate({ actorId: actor.id, abilityId: entry.abilityId, options: { triggerEvent: event } }).catch((error: unknown) => console.error("Darkis GodForge | Automatic trigger failed.", { event, actorId: actor.id, abilityId: entry.abilityId, error }));
    }
    if (this.recent.size > 1_000) for (const [key, timestamp] of this.recent) if (now - timestamp > 60_000) this.recent.delete(key);
  }
}

function object(value: unknown): Record<string, unknown> { return value && typeof value === "object" ? value as Record<string, unknown> : {}; }
function numberAt(value: unknown, path: string[]): number | undefined { let current: unknown = value; for (const key of path) current = object(current)[key]; const parsed = Number(current); return Number.isFinite(parsed) ? parsed : undefined; }
const ROLL_EVENTS = new Set(["roll-complete", "skill-check", "attack-roll", "damage-roll", "saving-throw"]);
const PF2E_SKILLS = new Set(["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"]);
