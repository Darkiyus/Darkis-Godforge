import type { RandomContentService, RandomEntry } from "../core/random-service";
import type { VisibilityLevel } from "../core/types";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { reportActionError } from "../foundry/error-reporting";

export class GodForgeRandomManager extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-random-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.RANDOM_TABLES", resizable: true }, position: { width: 1100, height: 800 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/random-manager.hbs" } };
  private result: { label: string; description?: string; category?: string } | null = null;
  private error = "";
  constructor(private readonly randomContent: RandomContentService, private readonly mode: "tables" | "wheels" | "test" = "tables") { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    const tables = this.randomContent.listTables();
    const ui = uiText();
    return {
      ui,
      tables,
      wheels: this.randomContent.listWheels().map((wheel) => ({ ...wheel, tableName: tables.find((table) => table.id === wheel.tableId)?.name ?? "—" })),
      result: this.result,
      error: this.error,
      showTableEditor: this.mode === "tables",
      showWheelEditor: this.mode === "wheels",
      showTables: this.mode !== "wheels",
      showWheels: this.mode !== "tables",
      isTestLab: this.mode === "test",
      managerTitle: this.mode === "tables" ? ui.RANDOM_TABLES : this.mode === "wheels" ? ui.FORTUNE_WHEELS : ui.TEST_LAB
    };
  }

  _onRender(): void {
    requireGM();
    const root = this.element;
    root?.querySelector<HTMLElement>("[data-action='add-entry']")?.addEventListener("click", () => { const template = root.querySelector<HTMLTemplateElement>("[data-template='random-entry']"); const list = root.querySelector<HTMLElement>("[data-entry-list]"); if (template && list) list.append(template.content.cloneNode(true)); });
    root?.addEventListener("click", (event) => { const button = (event.target as HTMLElement).closest<HTMLElement>("[data-action='remove-entry']"); button?.closest("[data-entry-row]")?.remove(); });
    root?.querySelector<HTMLFormElement>("[data-table-form]")?.addEventListener("submit", (event) => { event.preventDefault(); this.createTable(event.currentTarget as HTMLFormElement); });
    root?.querySelector<HTMLFormElement>("[data-wheel-form]")?.addEventListener("submit", (event) => { event.preventDefault(); this.createWheel(event.currentTarget as HTMLFormElement); });
    root?.querySelectorAll<HTMLElement>("[data-test-table]").forEach((button) => button.addEventListener("click", () => this.runAction(() => { const draw = this.randomContent.drawTable(button.dataset.testTable ?? "", Math.random); this.result = draw.entry; })));
    root?.querySelectorAll<HTMLElement>("[data-test-wheel]").forEach((button) => button.addEventListener("click", () => this.runAction(() => { const draw = this.randomContent.spinWheel(button.dataset.testWheel ?? "", Math.random).draw; this.result = draw.entry; })));
  }

  private createTable(form: HTMLFormElement): void {
    requireGM();
    const data = new FormData(form);
    const entries: RandomEntry[] = [...form.querySelectorAll<HTMLElement>("[data-entry-row]")].flatMap((row) => {
      const label = this.input(row, "entry.label"); if (!label) return [];
      return [{ id: crypto.randomUUID(), label, weight: Math.max(0, Number(this.input(row, "entry.weight") || 1)), category: this.category(this.input(row, "entry.category")), description: this.input(row, "entry.description") || undefined, visibleToPlayers: true }];
    });
    this.runAction(() => { this.randomContent.createTable({ name: String(data.get("table.name") ?? "").trim(), formula: String(data.get("table.formula") ?? "1d100").trim(), visibility: this.visibility(data.get("table.visibility")), entries }); });
  }

  private createWheel(form: HTMLFormElement): void {
    requireGM();
    const data = new FormData(form);
    this.runAction(() => { this.randomContent.createWheel({ name: String(data.get("wheel.name") ?? "").trim(), tableId: String(data.get("wheel.tableId") ?? ""), visibility: this.visibility(data.get("wheel.visibility")), duration: Math.max(1, Number(data.get("wheel.duration") ?? 6)), minimumSpins: Math.max(1, Number(data.get("wheel.minimumSpins") ?? 5)) }); });
  }

  private input(root: HTMLElement, name: string): string { return root.querySelector<HTMLInputElement | HTMLSelectElement>(`[name='${name}']`)?.value.trim() ?? ""; }
  private visibility(value: FormDataEntryValue | null): VisibilityLevel { const text = String(value ?? ""); return text === "gm" || text === "owner" || text === "followers" ? text : "public"; }
  private category(value: string): RandomEntry["category"] { return value === "positive" || value === "negative" || value === "catastrophic" || value === "jackpot" ? value : "neutral"; }
  private runAction(action: () => void): void { try { action(); this.error = ""; void this.render(true); } catch (error) { this.error = error instanceof Error ? error.message : String(error); reportActionError("Random content action failed.", error); void this.render(true); } }
}
