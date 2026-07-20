import type { DeityDefinition } from "./types";

export interface MigrationResult { definition: DeityDefinition; migrated: boolean; warnings: string[]; }
export function migrateDefinition(input: DeityDefinition): MigrationResult { const warnings: string[] = []; if (input.schemaVersion > 1) throw new Error(`Unsupported deity schema ${input.schemaVersion}.`); if (input.schemaVersion === 1) return { definition: structuredClone(input), migrated: false, warnings }; const migrated = { ...structuredClone(input), schemaVersion: 1, revision: input.revision + 1, updatedAt: new Date().toISOString() }; warnings.push("Legacy definition normalized to schema version 1."); return { definition: migrated, migrated: true, warnings }; }
