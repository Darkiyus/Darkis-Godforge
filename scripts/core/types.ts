export type GrantGroupMode = "all" | "any";
export type ModifierType = "item" | "status" | "circumstance" | "untyped";
export type ResetType = "daily" | "weekly" | "encounter" | "manual";

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
  effects: EffectNode[];
}

export type EffectNode =
  | { type: "heal" | "damage"; formula: string; target: "self" | "target" }
  | { type: "modifier"; selector: string; value: number | string; modifierType: ModifierType; duration?: number }
  | { type: "condition"; condition: string; target: "self" | "target" }
  | { type: "message"; text: string };

export interface GrantGroup {
  id: string;
  mode: GrantGroupMode;
  pick?: number;
  label: string;
  grants: Array<{ type: "bonus" | "ability"; ref: string }>;
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
  passiveBonuses: PassiveBonusDefinition[];
  abilities: AbilityDefinition[];
  grantGroups: GrantGroup[];
  replacement: ReplacementConfiguration;
  visibility: { library: boolean; players: boolean; characterSheet: boolean };
}

export interface SelectionContext { actor?: unknown; user?: unknown; classId?: string; level?: number; region?: string; pantheonFilter?: string; }
export interface DeitySummary { id: string; name: string; title: string; image?: string; domains: string[]; alignment?: string; }
