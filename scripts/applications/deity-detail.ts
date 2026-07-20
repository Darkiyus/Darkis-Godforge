import type { DeityDefinition } from "../core/types";
import { safeImageUrl } from "../core/sanitize";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import type { DeityService } from "../core/deity-service";
import type { AdapterRegistry } from "../adapters/adapter-registry";
import { GodForgeDeityEditor } from "./deity-editor";

export class GodForgeDeityDetail extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true }, position: { width: 1200, height: 820 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } };
  constructor(private deity: DeityDefinition, private readonly deityService?: DeityService, private readonly adapters?: AdapterRegistry) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { requireGM(); return { ui: uiText(), deity: { ...this.deity, image: safeImageUrl(this.deity.image) } }; }
  _onRender(): void { this.element?.querySelector<HTMLElement>("[data-action='edit']")?.addEventListener("click", () => { if (!this.deityService) return; void new GodForgeDeityEditor(this.deityService, (deity) => { this.deity = deity; void this.render(true); }, this.adapters, this.deity).render(true); }); }
}
