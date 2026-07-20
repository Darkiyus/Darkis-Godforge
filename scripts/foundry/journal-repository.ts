import type { DeityDefinition } from "../core/types";
import type { FoundryJournalCollection } from "./runtime";
import { isDeityDefinition } from "./runtime";

const namespace = "darkis-godforge";
export class JournalDeityRepository {
  constructor(private readonly collection: FoundryJournalCollection) {}
  load(): DeityDefinition[] { return this.collection.contents.flatMap((journal) => { const value = journal.flags?.[namespace]; return value && typeof value === "object" && "deity" in value && isDeityDefinition(value.deity) ? [value.deity] : []; }); }
  async save(deity: DeityDefinition): Promise<string | null> {
    const existing = this.collection.contents.find((journal) => { const value = journal.flags?.[namespace]; return value && typeof value === "object" && "deity" in value && isDeityDefinition(value.deity) && value.deity.id === deity.id; });
    const flags = { [namespace]: { schemaVersion: deity.schemaVersion, deity } };
    if (existing) { await existing.update({ flags }); return existing.uuid; }
    if (!this.collection.create) return null;
    const created = await this.collection.create({ name: deity.name, flags }); return created.uuid;
  }
}
