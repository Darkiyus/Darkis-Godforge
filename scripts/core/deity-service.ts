import type { DeityDefinition } from "./types";

export class DeityService {
  private readonly definitions = new Map<string, DeityDefinition>();
  list(): DeityDefinition[] { return [...this.definitions.values()]; }
  get(id: string): DeityDefinition | null { return this.definitions.get(id) ?? null; }
  save(definition: DeityDefinition): DeityDefinition { this.definitions.set(definition.id, structuredClone(definition)); return definition; }
  delete(id: string): boolean { return this.definitions.delete(id); }
}
