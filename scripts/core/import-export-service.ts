import type { DeityDefinition } from "./types";
import { migrateDefinition } from "./migration-service";

export interface GodForgeExport { format: "darkis-godforge"; schemaVersion: number; exportedAt: string; deities: DeityDefinition[]; }
export function exportDefinitions(deities: DeityDefinition[], now = new Date().toISOString()): GodForgeExport { return { format: "darkis-godforge", schemaVersion: 1, exportedAt: now, deities: structuredClone(deities) }; }
export function validateExport(value: unknown): value is GodForgeExport { if (!value || typeof value !== "object") return false; const candidate = value as Partial<GodForgeExport>; return candidate.format === "darkis-godforge" && typeof candidate.schemaVersion === "number" && candidate.schemaVersion <= 1 && Array.isArray(candidate.deities) && candidate.deities.every((deity) => typeof deity === "object" && deity !== null && typeof deity.id === "string" && typeof deity.name === "string" && typeof deity.schemaVersion === "number" && Array.isArray(deity.domains) && Array.isArray(deity.abilities)); }
export function importDefinitions(value: unknown): DeityDefinition[] { if (!validateExport(value)) throw new Error("Invalid GodForge export: expected a valid deity export."); return value.deities.map((deity) => migrateDefinition(deity).definition); }
