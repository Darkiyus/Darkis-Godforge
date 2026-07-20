import type { GodForgeActor, GodForgeApi } from "../api";
import type { SocketRouter } from "../foundry/socket-router";
import { safeImageUrl } from "../core/sanitize";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { reportActionError } from "../foundry/error-reporting";

export class GodForgeHub extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-hub", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.HUB", resizable: true }, position: { width: 520, height: 650 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/hub.hbs" } };
  constructor(private readonly actor: GodForgeActor, private readonly api: GodForgeApi, private readonly socketRouter: SocketRouter, private readonly openCodex: () => void) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { const data = this.api.getCharacterWidgetData(this.actor); return { ui: uiText(), actorId: this.actor.id, ...data, deity: data.deity ? { ...data.deity, image: safeImageUrl(data.deity.image) } : null, abilities: data.abilities.map((ability) => ({ ...ability, remaining: ability.uses ? Math.max(0, ability.uses.max - ability.uses.used) : null, available: !ability.uses || ability.uses.used < ability.uses.max })) }; }
  _onRender(): void { const root = this.element; root?.querySelector<HTMLElement>("[data-action='codex']")?.addEventListener("click", this.openCodex); root?.querySelectorAll<HTMLElement>("[data-ability]").forEach((button) => button.addEventListener("click", () => void this.socketRouter.activate({ actorId: this.actor.id, abilityId: button.dataset.ability ?? "", options: {} }).then(() => this.render(true)).catch((error: unknown) => reportActionError("Ability activation failed.", error)))); }
}
