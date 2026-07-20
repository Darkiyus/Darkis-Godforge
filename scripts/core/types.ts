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
  /** Show follower mechanics while browsing the selection codex. Defaults to false. */
  showMechanicsInSelection?: boolean;
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
    domains: "followers",
    spells: "followers",
    favoredWeapon: "followers",
    edicts: "public",
    anathema: "public",
    gmNotes: "gm"
  },
  showMechanicsInSelection: false
};

export interface ImagePresentation {
  fit: "cover" | "contain";
  focusX: number;
  focusY: number;
  zoom?: number;
  rotation?: number;
}

export interface PantheonDefinition {
  id: string;
  name: string;
  color: string;
  symbol?: string;
  order?: number;
}

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
  abilityType?: "standard" | "fortune-wheel";
  targetMode?: EffectTargetMode;
  animation?: { audience: "all" | "user" | "gm"; sound?: string; skippable?: boolean };
  effects: EffectNode[];
}

export type EffectTargetMode = "self" | "target" | "allies" | "enemies" | "group";
export type EffectNode =
  | { type: "heal" | "damage"; formula: string; target: EffectTargetMode }
  | { type: "modifier"; selector: string; value: number | string; modifierType: ModifierType; target?: EffectTargetMode; duration?: number; predicate?: string }
  | { type: "condition"; condition: string; target: EffectTargetMode; operation?: "add" | "remove" | "suppress"; duration?: number }
  | { type: "roll"; roll: "reroll" | "check" | "saving-throw" | "degree-of-success"; selector: string; dc?: number | string; keep?: "new" | "higher" | "lower"; target?: EffectTargetMode }
  | { type: "movement"; mode: "step" | "teleport" | "forced"; distance: number | string; target: EffectTargetMode }
  | { type: "action"; operation: "lose" | "repeat"; amount: number; target: EffectTargetMode }
  | { type: "control"; faction: "friendly" | "hostile" | "neutral"; target: EffectTargetMode; save?: string; bossImmune?: boolean }
  | { type: "resource"; resource: "hp" | "gold" | "item"; operation: "add" | "remove" | "transfer"; formula: string; target: EffectTargetMode; itemUuid?: string }
  | { type: "information"; mode: "gm-dialog" | "reveal" | "truth"; text?: string; questions?: number }
  | { type: "choice"; prompt: string; options: Array<{ id: string; label: string; effects: EffectNode[] }> }
  | { type: "counter"; key: string; operation: "add" | "set" | "require"; value: number | string }
  | { type: "random-wheel"; tableId: string; visibility: "public" | "user" | "gm" }
  | { type: "macro"; command: string }
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
  inherit?: { domains?: boolean; favoredWeapon?: boolean; spells?: boolean; sanctification?: boolean; skill?: boolean; font?: boolean; divineAttributes?: boolean; edicts?: boolean; anathema?: boolean };
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
  imagePresentation?: Partial<Record<"image" | "icon" | "symbol" | "banner", ImagePresentation>>;
  pantheonIds?: string[];
  pantheons?: PantheonDefinition[];
  tags?: string[];
  alignment?: string;
  sanctification?: string;
  domains: string[];
  alternateDomains?: string[];
  divineAttributes?: string[];
  spells?: Record<string, string>;
  favoredWeapon?: string;
  favoredWeaponUuid?: string;
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
