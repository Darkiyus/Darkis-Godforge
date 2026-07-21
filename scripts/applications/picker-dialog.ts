import type { SystemChoice } from "../adapters/adapter.interface";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";

export interface PickerSelection { values: string[]; items: SystemChoice[]; }

export class GodForgePickerDialog extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-picker", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.PICKER_TITLE", resizable: true }, position: { width: 980, height: 720 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/picker-dialog.hbs" } };
  private readonly selected = new Set<string>();

  constructor(private readonly title: string, private readonly choices: SystemChoice[], selected: string[], private readonly multiple: boolean, private readonly onChoose: (selection: PickerSelection) => void) {
    super();
    selected.forEach((value) => this.selected.add(value));
  }

  async _prepareContext(): Promise<Record<string, unknown>> {
    const items = this.choices.map((item, index) => ({ ...item, token: String(index), selected: this.selected.has(item.value), traitText: item.traits?.join(", ") ?? "", rankText: item.rank === undefined ? "" : String(item.rank), available: item.available !== false }));
    const unique = (values: Array<string | undefined>): string[] => [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
    return { ui: uiText(), title: this.title, items, multiple: this.multiple, categories: unique(items.map((item) => item.category)), groups: unique(items.map((item) => item.group)), sources: unique(items.map((item) => item.source)), ranks: [...new Set(items.flatMap((item) => item.rank === undefined ? [] : [item.rank]))].sort((a, b) => a - b), traits: unique(items.flatMap((item) => item.traits ?? [])) };
  }

  _onRender(): void {
    const root = this.element;
    if (!root) return;
    const cards = [...root.querySelectorAll<HTMLElement>("[data-picker-item]")];
    const refresh = (): void => {
      const query = root.querySelector<HTMLInputElement>("[data-picker-search]")?.value.trim().toLocaleLowerCase() ?? "";
      const category = root.querySelector<HTMLSelectElement>("[data-picker-category]")?.value ?? "";
      const group = root.querySelector<HTMLSelectElement>("[data-picker-group]")?.value ?? "";
      const source = root.querySelector<HTMLSelectElement>("[data-picker-source]")?.value ?? "";
      const rank = root.querySelector<HTMLSelectElement>("[data-picker-rank]")?.value ?? "";
      const trait = root.querySelector<HTMLSelectElement>("[data-picker-trait]")?.value ?? "";
      const onlyAvailable = root.querySelector<HTMLInputElement>("[data-picker-available]")?.checked === true;
      const onlyRemaster = root.querySelector<HTMLInputElement>("[data-picker-remaster]")?.checked === true;
      for (const card of cards) {
        const haystack = `${card.dataset.label ?? ""} ${card.dataset.traits ?? ""} ${card.dataset.category ?? ""} ${card.dataset.group ?? ""} ${card.dataset.source ?? ""}`.toLocaleLowerCase();
        card.hidden = Boolean((query && !haystack.includes(query)) || (category && card.dataset.category !== category) || (group && card.dataset.group !== group) || (source && card.dataset.source !== source) || (rank && card.dataset.rank !== rank) || (trait && !(card.dataset.traits ?? "").split("|").includes(trait)) || (onlyAvailable && card.dataset.available !== "true") || (onlyRemaster && card.dataset.remaster !== "true"));
      }
      const visible = cards.filter((card) => !card.hidden).length;
      const count = root.querySelector<HTMLElement>("[data-picker-count]");
      if (count) count.textContent = String(visible);
    };
    const preview = (card: HTMLElement): void => {
      cards.forEach((entry) => entry.classList.toggle("active", entry === card));
      const image = root.querySelector<HTMLImageElement>("[data-picker-preview-image]");
      if (image) { image.hidden = !card.dataset.img; if (card.dataset.img) image.src = card.dataset.img; }
      const set = (selector: string, value: string): void => { const element = root.querySelector<HTMLElement>(selector); if (element) element.textContent = value || "—"; };
      set("[data-picker-preview-name]", card.dataset.label ?? "");
      set("[data-picker-preview-category]", [card.dataset.category, card.dataset.group].filter(Boolean).join(" · "));
      set("[data-picker-preview-traits]", (card.dataset.traits ?? "").replaceAll("|", ", "));
      set("[data-picker-preview-source]", card.dataset.source ?? "");
      set("[data-picker-preview-rank]", card.dataset.rank ?? "");
    };
    const choose = (card: HTMLElement): void => {
      const item = this.choices[Number(card.dataset.pickerItem)];
      if (!item) return;
      if (!this.multiple) { this.onChoose({ values: [item.value], items: [item] }); void this.close?.(); return; }
      if (this.selected.has(item.value)) this.selected.delete(item.value); else this.selected.add(item.value);
      card.classList.toggle("selected", this.selected.has(item.value));
      const button = card.querySelector<HTMLElement>("[data-picker-choose]");
      if (button) button.setAttribute("aria-pressed", String(this.selected.has(item.value)));
    };
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-picker-filter]").forEach((field) => field.addEventListener("input", refresh));
    cards.forEach((card) => { card.addEventListener("click", (event) => { preview(card); if ((event.target as HTMLElement).closest("[data-picker-choose]")) choose(card); }); card.addEventListener("dblclick", () => choose(card)); });
    root.addEventListener("dragover", (event) => event.preventDefault());
    root.addEventListener("drop", (event) => { event.preventDefault(); const raw = event.dataTransfer?.getData("text/plain") ?? ""; let uuid = raw.trim(); try { const parsed = JSON.parse(raw) as { uuid?: unknown }; if (typeof parsed.uuid === "string") uuid = parsed.uuid; } catch { /* Foundry also supplies plain UUIDs. */ } const index = this.choices.findIndex((item) => item.value === uuid); if (index >= 0) choose(cards[index]!); });
    root.querySelector<HTMLElement>("[data-picker-confirm]")?.addEventListener("click", () => { const items = this.choices.filter((item) => this.selected.has(item.value)); this.onChoose({ values: items.map((item) => item.value), items }); void this.close?.(); });
    root.querySelector<HTMLElement>("[data-picker-clear]")?.addEventListener("click", () => { this.onChoose({ values: [], items: [] }); void this.close?.(); });
    root.querySelector<HTMLElement>("[data-picker-cancel]")?.addEventListener("click", () => void this.close?.());
    const initial = cards.find((card) => card.classList.contains("selected")) ?? cards[0]; if (initial) preview(initial);
    refresh();
  }
}
