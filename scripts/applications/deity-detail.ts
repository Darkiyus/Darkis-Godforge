import type { DeityDefinition } from "../core/types";
import { safeImageUrl } from "../core/sanitize";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";

export class GodForgeDeityDetail extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } };
  constructor(private readonly deity: DeityDefinition) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { return { ui: uiText(), deity: { ...this.deity, image: safeImageUrl(this.deity.image) } }; }
}
