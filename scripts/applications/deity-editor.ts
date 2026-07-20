import type { DeityService } from "../core/deity-service";
import type { DeityDefinition } from "../core/types";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";

export class GodForgeDeityEditor extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: true } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } };
  constructor(private readonly deityService: DeityService, private readonly onSaved: (deity: DeityDefinition) => void) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { return { ui: uiText() }; }
  _onRender(): void { const root = this.element; root?.querySelector<HTMLElement>("[data-action='close']")?.addEventListener("click", () => { void this.close?.(); }); const form = root?.querySelector<HTMLFormElement>("form"); form?.addEventListener("submit", (event) => { event.preventDefault(); const data = new FormData(form); const deity = this.deityService.create({ name: String(data.get("name") ?? "").trim(), title: String(data.get("title") ?? "").trim(), description: String(data.get("description") ?? "").trim(), domains: String(data.get("domains") ?? "").split(",").map((domain) => domain.trim()).filter(Boolean), alignment: String(data.get("alignment") ?? "").trim() || undefined, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: true, players: true, characterSheet: true } }); this.onSaved(deity); void this.close?.(); }); }
}
