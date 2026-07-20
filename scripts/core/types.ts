import type { Condition } from "./condition-service";

export type GrantGroupMode = "all" | "any";
export type ModifierType = "item" | "status" | "circumstance" | "untyped";
export type PublicationStatus = "draft" | "test" | "published" | "disabled" | "archived";
export type VisibilityLevel = "public" | "selection" | "followers" | "owner" | "trusted" | "gm" | "hidden-until-selected";
export type ResetType = "ten-minute-rest" | "refocus" | "daily-preparations" | "encounter-end" | "scene-change" | "calendar-day" | "calendar-week" | "calendar-month" | "calendar-year" | "custom-rest" | "manual" | "daily" | "weekly" | "encounter";

export interface VisibilityFields {
  portrait: VisibilityLevel;
  description: VisibilityLevel;
  quote: VisibilityLevel;
  pantheon: VisibilityLevel;
  bonuses: VisibilityLevel;
  abilities: VisibilityLevel;
  numericValues: VisibilityLevel;
  domains: VisibilityLevel;
  spells: VisibilityLevel;
  favoredWeapon: VisibilityLevel;
  edicts: VisibilityLevel;
  anathema: VisibilityLevel;
  gmNotes: VisibilityLevel;
}

export interface VisibilityConfiguration {
  deity: VisibilityLevel;
  fields: VisibilityFields;
}

export const DEFAULT_VISIBILITY: VisibilityConfiguration = {
  deity: "public",
  fields: {
    portrait: "public",
    description: "public",
    quote: "public",
    pantheon: "public",
    bonuses: "followers",
    abilities: "followers",
    numericValues: "followers",
    domains: "public",
    spells: "selection",
    favoredWeapon: "public",
    edicts: "public",
    anathema: "public",
    gmNotes: "gm"
  }
};

export interface AbilityTiming {
  actionCost: { type: "automatic" | "free" | "reaction" | "actions" | "exploration" | "downtime" | "custom"; actions?: number; customLabel?: string };
  usage: { max: number | null; period: "turn" | "round" | "encounter" | "scene" | "reset" | "unlimited" };
  reset: { event: ResetType; elapsedDays?: number; resetTime?: string };
  cooldown: { value: number; unit: "rounds" | "minutes" | "hours" | "days" } | null;
  duration: { value: number; unit: "instant" | "rounds" | "minutes" | "hours" | "encounter" | "scene" | "until-reset" };
}

export interface PassiveBonusDefinition {
  id: string;
  name: string;
  selector: string;
  value: number | string;
  modifierType: ModifierType;
  appliesTo?: "checks" | "dc" | "both";
  condition?: string;
  visibility?: VisibilityLevel;
  enabled?: boolean;
  /** @deprecated Legacy schema-1 field. */
  visible?: boolean;
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
  visibility?: VisibilityLevel;
  enabled?: boolean;
  effects: EffectNode[];
}

export type EffectNode =
  | { type: "heal" | "damage"; formula: string; target: "self" | "target" }
  | { type: "modifier"; selector: string; value: number | string; modifierType: ModifierType; duration?: number }
  | { type: "condition"; condition: string; target: "self" | "target" }
  | { type: "branch"; condition: Condition; then: EffectNode[]; otherwise?: EffectNode[] }
  | { type: "message"; text: string };

export interface AbilityOverride { name?: string; description?: string; value?: number | string; }
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
  inherit?: { domains?: boolean; favoredWeapon?: boolean; spells?: boolean; sanctification?: boolean; skill?: boolean; edicts?: boolean; anathema?: boolean };
  overrides?: Record<string, unknown>;
  keepForExistingActors?: boolean;
}

export interface DeityDefinition {
  id: string;
  schemaVersion: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  checksum: string;
  status: PublicationStatus;
  name: string;
  title: string;
  description: string;
  quote?: string;
  image?: string;
  icon?: string;
  symbol?: string;
  banner?: string;
  pantheonIds?: string[];
  tags?: string[];
  alignment?: string;
  sanctification?: string;
  domains: string[];
  alternateDomains?: string[];
  divineAttributes?: string[];
  spells?: Record<string, string>;
  favoredWeapon?: string;
  font?: string;
  skill?: string;
  cause?: string;
  edicts?: string[];
  anathema?: string[];
  gmNotes?: string;
  passiveBonuses: PassiveBonusDefinition[];
  abilities: AbilityDefinition[];
  grantGroups: GrantGroup[];
  replacement: ReplacementConfiguration;
  visibility: VisibilityConfiguration;
}

export interface SelectionContext { actor?: unknown; user?: unknown; classId?: string; level?: number; region?: string; pantheonFilter?: string; systemId?: string; catalogContext?: string; }
export interface DeitySummary { id: string; name: string; title: string; image?: string; domains: string[]; alignment?: string; sourceUuid?: string; official?: boolean; }
export interface GrantChoiceMap { [groupId: string]: string[]; }
export interface ActorGodForgeState { deityId: string; grants: string[]; usages: Record<string, { used: number; max: number; lastResetAt: number; reset: ResetType }>; }
