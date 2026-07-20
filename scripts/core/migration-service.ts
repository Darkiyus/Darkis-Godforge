import { DEFAULT_VISIBILITY, type DeityDefinition, type VisibilityConfiguration, type VisibilityLevel } from "./types";

export const CURRENT_SCHEMA_VERSION = 2;

export interface MigrationResult { definition: DeityDefinition; migrated: boolean; warnings: string[]; }

export function migrateDefinition(input: unknown): MigrationResult {
  if (!input || typeof input !== "object") throw new Error("Invalid deity definition.");
  const source = structuredClone(input) as Record<string, unknown>;
  const schemaVersion = typeof source.schemaVersion === "number" ? source.schemaVersion : 0;
  if (schemaVersion > CURRENT_SCHEMA_VERSION) throw new Error(`Unsupported deity schema ${schemaVersion}.`);

  const warnings: string[] = [];
  const legacyVisibility = source.visibility && typeof source.visibility === "object"
    ? source.visibility as Record<string, unknown>
    : {};
  const visibility = normalizeVisibility(legacyVisibility);
  const status = normalizeStatus(source.status, legacyVisibility.players);
  const definition = {
    ...source,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision: Math.max(1, typeof source.revision === "number" ? source.revision : 0) + (schemaVersion < CURRENT_SCHEMA_VERSION ? 1 : 0),
    createdAt: typeof source.createdAt === "string" ? source.createdAt : new Date().toISOString(),
    updatedAt: schemaVersion < CURRENT_SCHEMA_VERSION ? new Date().toISOString() : String(source.updatedAt ?? new Date().toISOString()),
    checksum: typeof source.checksum === "string" ? source.checksum : "pending",
    status,
    visibility,
    passiveBonuses: Array.isArray(source.passiveBonuses) ? source.passiveBonuses.map(normalizeBonus) : [],
    abilities: Array.isArray(source.abilities) ? source.abilities.map(normalizeAbility) : [],
    grantGroups: Array.isArray(source.grantGroups) ? source.grantGroups : [],
    replacement: source.replacement && typeof source.replacement === "object" ? source.replacement : { sourceUuid: "", mode: "none", contexts: [] },
    domains: Array.isArray(source.domains) ? source.domains : []
  } as unknown as DeityDefinition;

  if (schemaVersion < CURRENT_SCHEMA_VERSION) warnings.push(`Legacy definition migrated to schema version ${CURRENT_SCHEMA_VERSION}.`);
  return { definition, migrated: schemaVersion < CURRENT_SCHEMA_VERSION, warnings };
}

function normalizeVisibility(value: Record<string, unknown>): VisibilityConfiguration {
  if (typeof value.deity === "string" && value.fields && typeof value.fields === "object") {
    const fields = value.fields as Record<string, unknown>;
    return {
      deity: visibilityLevel(value.deity, DEFAULT_VISIBILITY.deity),
      fields: Object.fromEntries(Object.entries(DEFAULT_VISIBILITY.fields).map(([key, fallback]) => [key, visibilityLevel(fields[key], fallback)])) as unknown as VisibilityConfiguration["fields"]
    };
  }
  const visibleToPlayers = value.players !== false;
  const deity: VisibilityLevel = value.library === false || !visibleToPlayers ? "gm" : "public";
  const followerOnly: VisibilityLevel = value.characterSheet === false ? "gm" : "followers";
  return { ...structuredClone(DEFAULT_VISIBILITY), deity, fields: { ...structuredClone(DEFAULT_VISIBILITY.fields), bonuses: followerOnly, abilities: followerOnly } };
}

function normalizeStatus(value: unknown, legacyPlayers: unknown): DeityDefinition["status"] {
  return value === "draft" || value === "test" || value === "published" || value === "disabled" || value === "archived"
    ? value
    : legacyPlayers === false ? "draft" : "published";
}

function normalizeBonus(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const bonus = value as Record<string, unknown>;
  return { ...bonus, enabled: bonus.enabled !== false, visibility: visibilityLevel(bonus.visibility, bonus.visible === false ? "gm" : "followers") };
}

function normalizeAbility(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const ability = value as Record<string, unknown>;
  return { ...ability, enabled: ability.enabled !== false, visibility: visibilityLevel(ability.visibility, "followers") };
}

function visibilityLevel(value: unknown, fallback: VisibilityLevel): VisibilityLevel {
  return value === "public" || value === "selection" || value === "followers" || value === "owner" || value === "trusted" || value === "gm" || value === "hidden-until-selected" ? value : fallback;
}
