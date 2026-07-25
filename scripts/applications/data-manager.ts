import type { GodForgeActor, GodForgeApi } from "../api";
import type { DeityService } from "../core/deity-service";
import { importDefinitions } from "../core/import-export-service";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryGame, getFoundryUi } from "../foundry/runtime";
import { validateRandomContentSnapshot, type RandomContentService, type RandomContentSnapshot } from "../core/random-service";
import { CURRENT_SCHEMA_VERSION } from "../core/migration-service";

interface ActorBackup { id: string; state: unknown; items: Record<string, unknown>[]; }

export class GodForgeDataManager extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: true }, position: { width: 900, height: 700 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } };
  private pendingImport: unknown;
  private preview: { total: number; created: number; updated: number; tables: number; wheels: number } | null = null;
  private error = "";
  constructor(private readonly deities: DeityService, private readonly api: GodForgeApi, private readonly randomContent: RandomContentService, private readonly mode: "transfer" | "migration" = "transfer") { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> { requireGM(); const definitions = this.deities.list(); return { ui: uiText(), preview: this.preview, error: this.error, deityCount: definitions.length, isTransfer: this.mode === "transfer", isMigration: this.mode === "migration", currentSchema: CURRENT_SCHEMA_VERSION, pendingMigrations: definitions.filter((deity) => deity.schemaVersion < CURRENT_SCHEMA_VERSION).length }; }

  _onRender(): void {
    requireGM();
    const root = this.element;
    root?.querySelector<HTMLElement>("[data-action='export']")?.addEventListener("click", () => this.downloadExport());
    root?.querySelector<HTMLElement>("[data-action='clear-all-data']")?.addEventListener("click", () => void this.clearAllData());
    root?.querySelector<HTMLInputElement>("[data-import-file]")?.addEventListener("change", (event) => void this.previewFile((event.target as HTMLInputElement).files?.[0]));
    root?.querySelector<HTMLElement>("[data-action='apply-import']")?.addEventListener("click", async () => {
      requireGM();
      if (!this.pendingImport) return;
      try {
        const random = this.readRandomContent(this.pendingImport);
        const count = await this.api.importDeities(this.pendingImport);
        if (random) await this.randomContent.replacePersistent(random);
        await this.restoreActors(this.readActorBackups(this.pendingImport));
        this.pendingImport = undefined; this.preview = null; this.error = "";
        getFoundryUi()?.notifications?.info?.(`${count} ${uiText().IMPORTED}`);
      } catch (error) {
        console.error("Darkis GodForge | Import failed.", error);
        this.error = uiText().IMPORT_FAILED ?? "Import failed.";
      }
      void this.render(true);
    });
  }

  private downloadExport(): void {
    requireGM();
    const content = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot(), actors: this.actorBackups() }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `darkis-godforge-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    URL.revokeObjectURL(url);
  }

  private async clearAllData(): Promise<void> {
    requireGM();
    const ui = uiText();
    if (!globalThis.confirm(ui.CLEAR_CONFIRM_FIRST ?? "Create one backup and delete all GodForge content?")) return;
    const typed = globalThis.prompt(ui.CLEAR_CONFIRM_TYPE ?? "Type LÖSCHUNG to confirm.", "");
    if (typed !== "LÖSCHUNG") {
      getFoundryUi()?.notifications?.warn?.(ui.CLEAR_CANCELLED ?? "Deletion cancelled.");
      return;
    }
    const actors = (getFoundryGame()?.actors?.contents ?? []) as GodForgeActor[];
    const assigned = actors.filter((actor) => Boolean(actor.flags?.["darkis-godforge"]));
    try {
      this.downloadExport();
      for (const actor of assigned) await this.api.removeDeity(actor);
      await this.randomContent.replacePersistent({ tables: [], wheels: [] });
      const count = await this.deities.clearPersistent();
      getFoundryUi()?.notifications?.info?.(`${count} ${ui.CLEAR_COMPLETE ?? "GodForge records deleted."}`);
      void this.render(true);
    } catch (error) {
      console.error("Darkis GodForge | Deletion failed.", error);
      this.error = ui.CLEAR_FAILED ?? "Deletion failed.";
      getFoundryUi()?.notifications?.error?.(ui.CLEAR_FAILED ?? "Deletion stopped. The downloaded backup can restore the data.");
      void this.render(true);
    }
  }

  private async previewFile(file: File | undefined): Promise<void> {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text()) as unknown;
      const definitions = importDefinitions(raw);
      const existing = new Set(this.deities.list().map((deity) => deity.id));
      this.pendingImport = raw;
      const random = this.readRandomContent(raw);
      this.preview = { total: definitions.length, created: definitions.filter((deity) => !existing.has(deity.id)).length, updated: definitions.filter((deity) => existing.has(deity.id)).length, tables: random?.tables?.length ?? 0, wheels: random?.wheels?.length ?? 0 };
      this.error = "";
    } catch (error) {
      console.error("Darkis GodForge | Import preview failed.", error);
      this.pendingImport = undefined; this.preview = null; this.error = uiText().IMPORT_INVALID ?? "The selected import is invalid.";
    }
    void this.render(true);
  }
  private readRandomContent(value: unknown): Partial<RandomContentSnapshot> | null { if (!value || typeof value !== "object" || !("randomContent" in value)) return null; const random = (value as { randomContent?: unknown }).randomContent; if (!validateRandomContentSnapshot(random)) throw new Error(uiText().INVALID_RANDOM_CONTENT ?? "Invalid random content."); return random; }
  private actorBackups(): ActorBackup[] {
    return ((getFoundryGame()?.actors?.contents ?? []) as GodForgeActor[]).flatMap((actor) => {
      const state = actor.flags?.["darkis-godforge"];
      const items = (actor.items?.contents ?? []).filter((item) => Boolean(item.flags?.["darkis-godforge"])).map((item) => {
        const data = item.toObject?.();
        if (!data) throw new Error((uiText().BACKUP_ITEM_FAILED ?? "Item {id} cannot be backed up.").replace("{id}", item.id));
        return structuredClone(data);
      });
      return state || items.length ? [{ id: actor.id, state: structuredClone(state ?? null), items }] : [];
    });
  }
  private readActorBackups(value: unknown): ActorBackup[] {
    if (!value || typeof value !== "object" || !("actors" in value)) return [];
    const actors = (value as { actors?: unknown }).actors;
    if (!Array.isArray(actors)) throw new Error(uiText().INVALID_ACTOR_BACKUP ?? "Invalid actor backup.");
    return actors.map((entry) => {
      if (!entry || typeof entry !== "object") throw new Error(uiText().INVALID_ACTOR_BACKUP ?? "Invalid actor backup.");
      const candidate = entry as { id?: unknown; state?: unknown; items?: unknown };
      if (typeof candidate.id !== "string" || !Array.isArray(candidate.items)) throw new Error(uiText().INVALID_ACTOR_BACKUP ?? "Invalid actor backup.");
      return { id: candidate.id, state: structuredClone(candidate.state ?? null), items: candidate.items.filter((item: unknown): item is Record<string, unknown> => Boolean(item && typeof item === "object")).map((item: Record<string, unknown>) => structuredClone(item)) };
    });
  }
  private async restoreActors(backups: ActorBackup[]): Promise<void> {
    const actors = (getFoundryGame()?.actors?.contents ?? []) as GodForgeActor[];
    for (const backup of backups) {
      const actor = actors.find((candidate) => candidate.id === backup.id);
      if (!actor) continue;
      if (actor.flags?.["darkis-godforge"]) await this.api.removeDeity(actor);
      await actor.update({ flags: { "darkis-godforge": backup.state as never } });
      if (backup.items.length) {
        if (!actor.createEmbeddedDocuments) throw new Error((uiText().RESTORE_ACTOR_FAILED ?? "Actor {id} cannot restore embedded items.").replace("{id}", actor.id));
        const items = backup.items.map((item) => { const copy = structuredClone(item); delete copy._id; return copy; });
        await actor.createEmbeddedDocuments("Item", items);
      }
    }
  }
}
