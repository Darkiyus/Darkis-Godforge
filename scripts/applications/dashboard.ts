import type { DeityService } from "../core/deity-service";
import { safeImageUrl } from "../core/sanitize";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { GodForgeCodex } from "./codex";
import { GodForgeDeityEditor } from "./deity-editor";
import { GodForgeDeityDetail } from "./deity-detail";

export class GodForgeDashboard extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } };
  constructor(private readonly deityService: DeityService) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { const ui = uiText(); const deities = this.deityService.list().map((deity) => ({ ...deity, image: safeImageUrl(deity.image) })); return { ui, deities, stats: { deities: deities.length, sanctuaries: 0, bonuses: deities.reduce((sum, deity) => sum + deity.passiveBonuses.length, 0), abilities: deities.reduce((sum, deity) => sum + deity.abilities.length, 0) } }; }
  _onRender(): void { const root = this.element; if (!root) return; root.querySelectorAll<HTMLElement>("[data-action='create']").forEach((button) => button.addEventListener("click", () => new GodForgeDeityEditor(this.deityService, () => void this.render(true)).render(true))); root.querySelector<HTMLElement>("[data-action='codex']")?.addEventListener("click", () => new GodForgeCodex(this.deityService).render(true)); root.querySelectorAll<HTMLElement>("[data-deity]").forEach((card) => card.addEventListener("click", () => { const deity = this.deityService.get(card.dataset.deity ?? ""); if (deity) void new GodForgeDeityDetail(deity).render(true); })); }
}
