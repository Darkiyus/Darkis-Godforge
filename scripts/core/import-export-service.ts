import type { DeityDefinition } from "./types";
import { CURRENT_SCHEMA_VERSION, migrateDefinition } from "./migration-service";
import { validateAbilityGraph } from "./ability-graph";

export interface GodForgeExport { format: "darkis-godforge"; schemaVersion: number; exportedAt: string; deities: DeityDefinition[]; }
export function exportDefinitions(deities: DeityDefinition[], now = new Date().toISOString()): GodForgeExport { return { format: "darkis-godforge", schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: now, deities: structuredClone(deities) }; }
export function validateExport(value: unknown): value is GodForgeExport {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GodForgeExport>;
  if (candidate.format !== "darkis-godforge" || typeof candidate.schemaVersion !== "number" || candidate.schemaVersion < 1 || candidate.schemaVersion > CURRENT_SCHEMA_VERSION || !Array.isArray(candidate.deities) || candidate.deities.length > 5_000) return false;
  return candidate.deities.every((deity) => {
    if (typeof deity !== "object" || deity === null || typeof deity.id !== "string" || deity.id.length > 128 || typeof deity.name !== "string" || deity.name.length > 256 || typeof deity.schemaVersion !== "number" || !Array.isArray(deity.domains) || !Array.isArray(deity.abilities) || deity.abilities.length > 500) return false;
    return deity.abilities.every((ability) => !ability.graph || validateAbilityGraph(ability.graph).valid);
  });
}
export function importDefinitions(value: unknown): DeityDefinition[] { if (!validateExport(value)) throw new Error("Invalid GodForge export: expected a valid deity export."); return value.deities.map((deity) => migrateDefinition(deity).definition); }
