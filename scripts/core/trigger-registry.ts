import { validateAbilityGraph } from "./ability-graph";
import type { AbilityDefinition, DeityDefinition } from "./types";

export interface TriggerEntry { deityId: string; abilityId: string; ability: AbilityDefinition; event: string; config: Record<string, unknown>; }

export class TriggerRegistry {
  private readonly byEvent = new Map<string, Map<string, TriggerEntry[]>>();
  rebuild(deities: DeityDefinition[]): void {
    this.byEvent.clear();
    for (const deity of deities) {
      if (deity.status !== "published" || deity.kind === "lore") continue;
      for (const ability of deity.abilities.filter((entry) => entry.enabled !== false)) {
        const triggers = ability.graph && validateAbilityGraph(ability.graph).valid
          ? ability.graph.nodes.filter((node) => node.category === "trigger").map((node) => ({ event: node.type === "custom" ? String(node.config.event ?? node.config.selector ?? "custom") : node.type, config: node.config }))
          : ability.trigger ? [{ event: ability.trigger, config: {} }] : [];
        for (const trigger of triggers) {
          const deityMap = this.byEvent.get(trigger.event) ?? new Map<string, TriggerEntry[]>();
          const entries = deityMap.get(deity.id) ?? [];
          entries.push({ deityId: deity.id, abilityId: ability.id, ability, event: trigger.event, config: structuredClone(trigger.config) });
          deityMap.set(deity.id, entries);
          this.byEvent.set(trigger.event, deityMap);
        }
      }
    }
  }
  hasEvent(event: string): boolean { return this.byEvent.has(event); }
  forActor(event: string, deityId: string): TriggerEntry[] { return this.byEvent.get(event)?.get(deityId) ?? []; }
  events(): string[] { return [...this.byEvent.keys()].sort(); }
  size(event?: string): number {
    const maps = event ? [this.byEvent.get(event)].filter((entry): entry is Map<string, TriggerEntry[]> => Boolean(entry)) : [...this.byEvent.values()];
    return maps.reduce((total, deityMap) => total + [...deityMap.values()].reduce((sum, entries) => sum + entries.length, 0), 0);
  }
}
