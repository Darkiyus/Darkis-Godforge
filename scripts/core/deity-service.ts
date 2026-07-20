import type { DeityDefinition } from "./types";

export class DeityService {
  private readonly definitions = new Map<string, DeityDefinition>();
  list(): DeityDefinition[] { return [...this.definitions.values()]; }
  get(id: string): DeityDefinition | null { return this.definitions.get(id) ?? null; }
  save(definition: DeityDefinition): DeityDefinition { this.definitions.set(definition.id, structuredClone(definition)); return definition; }
  create(input: Omit<DeityDefinition, "id" | "schemaVersion" | "revision" | "createdAt" | "updatedAt" | "checksum">): DeityDefinition {
    const now = new Date().toISOString();
    const definition: DeityDefinition = { ...structuredClone(input), id: crypto.randomUUID(), schemaVersion: 1, revision: 1, createdAt: now, updatedAt: now, checksum: "pending" };
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
