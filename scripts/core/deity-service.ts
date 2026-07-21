import { CURRENT_SCHEMA_VERSION, migrateDefinition } from "./migration-service";
import type { DeityDefinition } from "./types";

export class DeityService {
  private readonly definitions = new Map<string, DeityDefinition>();
  private persistDefinition?: (definition: DeityDefinition) => Promise<unknown>;
  private persistenceQueue: Promise<void> = Promise.resolve();
  private persistenceError: unknown = null;
  setPersistence(handler: (definition: DeityDefinition) => Promise<unknown>): void { this.persistDefinition = handler; }
  list(): DeityDefinition[] { return [...this.definitions.values()]; }
  get(id: string): DeityDefinition | null { return this.definitions.get(id) ?? null; }
  save(definition: DeityDefinition): DeityDefinition { const normalized = migrateDefinition(definition).definition; this.definitions.set(normalized.id, structuredClone(normalized)); if (this.persistDefinition) { const persist = this.persistDefinition; this.persistenceQueue = this.persistenceQueue.then(async () => { try { await persist(structuredClone(normalized)); } catch (error) { this.persistenceError ??= error; console.error("Darkis GodForge | Could not persist deity.", error); } }); } return normalized; }
  async flushPersistence(): Promise<void> { await this.persistenceQueue; if (this.persistenceError) { const error = this.persistenceError; this.persistenceError = null; throw error; } }
  create(input: Omit<DeityDefinition, "id" | "schemaVersion" | "revision" | "createdAt" | "updatedAt" | "checksum">): DeityDefinition {
    const now = new Date().toISOString();
    const definition: DeityDefinition = { ...structuredClone(input), id: crypto.randomUUID(), schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1, createdAt: now, updatedAt: now, checksum: "pending" };
    definition.checksum = this.checksum(definition);
    return this.save(definition);
  }
  update(id: string, patch: Partial<DeityDefinition>): DeityDefinition {
    const current = this.get(id); if (!current) throw new Error(`Unknown deity: ${id}`);
    const updated = { ...current, ...structuredClone(patch), id, revision: current.revision + 1, updatedAt: new Date().toISOString() };
    updated.checksum = this.checksum(updated); return this.save(updated);
  }
  delete(id: string): boolean { return this.definitions.delete(id); }
  private checksum(definition: DeityDefinition): string { const payload = JSON.stringify({ ...definition, checksum: undefined }); let hash = 2166136261; for (let index = 0; index < payload.length; index += 1) hash = Math.imul(hash ^ payload.charCodeAt(index), 16777619); return (hash >>> 0).toString(16); }
}
