import type { DeityService } from "../core/deity-service";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";

export class GodForgeCodex extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/codex.hbs" } };
  private searchTerm = "";
  private selectedDomain = "";
  constructor(private readonly deityService: DeityService) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { const deities = this.deityService.list().filter((deity) => (!this.searchTerm || `${deity.name} ${deity.title}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || deity.domains.includes(this.selectedDomain))); return { ui: uiText(), deities, domains: [...new Set(this.deityService.list().flatMap((deity) => deity.domains))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain }; }
  _onRender(): void { const root = this.element; if (!root) return; const search = root.querySelector<HTMLInputElement>("[data-search]"); const filter = root.querySelector<HTMLSelectElement>("[data-filter]"); if (search) search.value = this.searchTerm; if (filter) filter.value = this.selectedDomain; search?.addEventListener("input", (event) => { this.searchTerm = (event.target as HTMLInputElement).value.toLocaleLowerCase(); void this.render(true); }); filter?.addEventListener("change", (event) => { this.selectedDomain = (event.target as HTMLSelectElement).value; void this.render(true); }); }
}
