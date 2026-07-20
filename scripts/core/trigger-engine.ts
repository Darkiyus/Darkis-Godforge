import type { AbilityDefinition } from "./types";

export type TriggerEvent = "combat-start" | "daily-preparations" | "damage-taken" | "skill-check" | "manual";
export interface RegisteredAbility { deityId: string; ability: AbilityDefinition; }

export class TriggerEngine {
  private readonly index = new Map<TriggerEvent, Set<string>>();
  private readonly abilities = new Map<string, RegisteredAbility>();
  register(deityId: string, ability: AbilityDefinition): void { const key = `${deityId}:${ability.id}`; this.abilities.set(key, { deityId, ability }); if (!ability.trigger) return; const event = ability.trigger as TriggerEvent; const entries = this.index.get(event) ?? new Set<string>(); entries.add(key); this.index.set(event, entries); }
  unregister(deityId: string, abilityId: string): void { const key = `${deityId}:${abilityId}`; this.abilities.delete(key); for (const keys of this.index.values()) keys.delete(key); }
  forEvent(event: TriggerEvent): RegisteredAbility[] { return [...(this.index.get(event) ?? [])].map((key) => this.abilities.get(key)).filter((entry): entry is RegisteredAbility => entry !== undefined); }
}
