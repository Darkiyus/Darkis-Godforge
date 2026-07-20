import type { Condition } from "./condition-service";

export type GrantGroupMode = "all" | "any";
export type ModifierType = "item" | "status" | "circumstance" | "untyped";
export type ResetType = "ten-minute-rest" | "refocus" | "daily-preparations" | "encounter-end" | "scene-change" | "calendar-day" | "calendar-week" | "calendar-month" | "calendar-year" | "custom-rest" | "manual" | "daily" | "weekly" | "encounter";
export interface AbilityTiming { actionCost: { type: "automatic" | "free" | "reaction" | "actions" | "exploration" | "downtime" | "custom"; actions?: number; customLabel?: string }; usage: { max: number | null; period: "turn" | "round" | "encounter" | "scene" | "reset" | "unlimited" }; reset: { event: ResetType; elapsedDays?: number; resetTime?: string }; cooldown: { value: number; unit: "rounds" | "minutes" | "hours" | "days" } | null; duration: { value: number; unit: "instant" | "rounds" | "minutes" | "hours" | "encounter" | "scene" | "until-reset" }; }

export interface PassiveBonusDefinition {
  id: string;
  name: string;
  selector: string;
  value: number | string;
  modifierType: ModifierType;
  condition?: string;
  visible: boolean;
}

export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  actionCost?: number;
  uses?: { max: number; reset: ResetType };
  duration?: number;
  trigger?: string;
  condition?: Condition;
  timing?: AbilityTiming;
  effects: EffectNode[];
}

export type EffectNode =
  | { type: "heal" | "damage"; formula: string; target: "self" | "target" }
  | { type: "modifier"; selector: string; value: number | string; modifierType: ModifierType; duration?: number }
  | { type: "condition"; condition: string; target: "self" | "target" }
  | { type: "branch"; condition: Condition; then: EffectNode[]; otherwise?: EffectNode[] }
  | { type: "message"; text: string };

export interface AbilityOverride { name?: string; description?: string; }
export type GrantMember = { type: "bonus" | "ability"; ref: string; overrides?: AbilityOverride } | GrantGroup;
export interface GrantGroup {
  id: string;
  mode: GrantGroupMode;
  pick?: number;
  label: string;
  grants: GrantMember[];
}

export interface ReplacementConfiguration {
  sourceUuid: string;
  mode: "replace" | "hide" | "none";
  contexts: string[];
}

export interface DeityDefinition {
  id: string;
  schemaVersion: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  checksum: string;
  name: string;
  title: string;
  description: string;
  image?: string;
  alignment?: string;
  sanctification?: string;
  domains: string[];
  favoredWeapon?: string;
  font?: string;
  skill?: string;
  cause?: string;
  passiveBonuses: PassiveBonusDefinition[];
  abilities: AbilityDefinition[];
  grantGroups: GrantGroup[];
  replacement: ReplacementConfiguration;
  visibility: { library: boolean; players: boolean; characterSheet: boolean };
}

export interface SelectionContext { actor?: unknown; user?: unknown; classId?: string; level?: number; region?: string; pantheonFilter?: string; systemId?: string; catalogContext?: string; }
export interface DeitySummary { id: string; name: string; title: string; image?: string; domains: string[]; alignment?: string; sourceUuid?: string; official?: boolean; }
export interface GrantChoiceMap { [groupId: string]: string[]; }
export interface ActorGodForgeState { deityId: string; grants: string[]; usages: Record<string, { used: number; max: number; lastResetAt: number; reset: ResetType }>; }
