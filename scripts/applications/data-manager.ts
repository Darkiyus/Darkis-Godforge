import type { GodForgeApi } from "../api";
import type { DeityService } from "../core/deity-service";
import { importDefinitions } from "../core/import-export-service";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryUi } from "../foundry/runtime";
import { validateRandomContentSnapshot, type RandomContentService, type RandomContentSnapshot } from "../core/random-service";

export class GodForgeDataManager extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: true }, position: { width: 900, height: 700 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } };
  private pendingImport: unknown;
  private preview: { total: number; created: number; updated: number; tables: number; wheels: number } | null = null;
  private error = "";
  constructor(private readonly deities: DeityService, private readonly api: GodForgeApi, private readonly randomContent: RandomContentService) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> { requireGM(); return { ui: uiText(), preview: this.preview, error: this.error, deityCount: this.deities.list().length }; }

  _onRender(): void {
    requireGM();
    const root = this.element;
    root?.querySelector<HTMLElement>("[data-action='export']")?.addEventListener("click", () => this.downloadExport());
    root?.querySelector<HTMLInputElement>("[data-import-file]")?.addEventListener("change", (event) => void this.previewFile((event.target as HTMLInputElement).files?.[0]));
    root?.querySelector<HTMLElement>("[data-action='apply-import']")?.addEventListener("click", () => {
      requireGM();
      if (!this.pendingImport) return;
      try {
        const random = this.readRandomContent(this.pendingImport);
        const count = this.api.importDeities(this.pendingImport);
        if (random) this.randomContent.replace(random);
        this.pendingImport = undefined; this.preview = null; this.error = "";
        getFoundryUi()?.notifications?.info?.(`${count} ${uiText().IMPORTED}`);
      } catch (error) {
        this.error = error instanceof Error ? error.message : String(error);
      }
      void this.render(true);
    });
  }

  private downloadExport(): void {
    requireGM();
    const content = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot() }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `darkis-godforge-${new Date().toISOString().slice(0, 10)}.json`; anchor.click();
    URL.revokeObjectURL(url);
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
      this.pendingImport = undefined; this.preview = null; this.error = error instanceof Error ? error.message : String(error);
    }
    void this.render(true);
  }
  private readRandomContent(value: unknown): Partial<RandomContentSnapshot> | null { if (!value || typeof value !== "object" || !("randomContent" in value)) return null; const random = (value as { randomContent?: unknown }).randomContent; if (!validateRandomContentSnapshot(random)) throw new Error("Invalid GodForge random content."); return random; }
}
