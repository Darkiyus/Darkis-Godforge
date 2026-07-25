import type { DeityDefinition } from "../core/types";
import type { FoundryJournalCollection } from "./runtime";
import { getFoundryJournalClass, isDeityDefinition } from "./runtime";

const namespace = "darkis-godforge";
export class JournalDeityRepository {
  constructor(private readonly collection: FoundryJournalCollection) {}
  load(): DeityDefinition[] { return this.collection.contents.flatMap((journal) => { const value = journal.flags?.[namespace]; return value && typeof value === "object" && "deity" in value && isDeityDefinition(value.deity) ? [value.deity] : []; }); }
  async save(deity: DeityDefinition): Promise<string | null> {
    const existing = this.collection.contents.find((journal) => { const value = journal.flags?.[namespace]; return value && typeof value === "object" && "deity" in value && isDeityDefinition(value.deity) && value.deity.id === deity.id; });
    const flags = { [namespace]: { schemaVersion: deity.schemaVersion, deity } };
    if (existing) {
      const ownership = Object.fromEntries(Object.keys(existing.ownership ?? {}).map((id) => [id, 0]));
      ownership.default = 0;
      await existing.update({ name: deity.name, flags, ownership });
      return existing.uuid;
    }
    const documentClass = getFoundryJournalClass(this.collection);
    if (!documentClass) throw new Error("Foundry JournalEntry document class is unavailable.");
    const created = await documentClass.create({ name: deity.name, flags, ownership: { default: 0 } });
    if (!created) throw new Error(`Foundry did not create a journal for deity ${deity.id}.`);
    return created.uuid;
  }
  async delete(id: string): Promise<boolean> {
    const existing = this.collection.contents.find((journal) => {
      const value = journal.flags?.[namespace];
      return value && typeof value === "object" && "deity" in value && isDeityDefinition(value.deity) && value.deity.id === id;
    });
    if (!existing) return false;
    if (!existing.delete) throw new Error("Foundry JournalEntry deletion is unavailable.");
    await existing.delete();
    return true;
  }
  async deleteAll(): Promise<number> {
    const owned = this.collection.contents.filter((journal) => {
      const value = journal.flags?.[namespace];
      return value && typeof value === "object" && "deity" in value;
    });
    for (const journal of owned) {
      if (!journal.delete) throw new Error("Foundry JournalEntry deletion is unavailable.");
      await journal.delete();
    }
    return owned.length;
  }
  async secureAll(): Promise<void> {
    for (const journal of this.collection.contents.filter((entry) => Boolean(entry.flags?.[namespace]))) {
      const ownership = Object.fromEntries(Object.keys(journal.ownership ?? {}).map((id) => [id, 0]));
      ownership.default = 0;
      if (Object.entries(journal.ownership ?? {}).some(([id, level]) => id === "default" ? level !== 0 : level > 0)) await journal.update({ ownership });
    }
  }
}
