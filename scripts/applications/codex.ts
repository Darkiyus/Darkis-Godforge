import type { DeityService } from "../core/deity-service";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { currentViewerContext } from "../foundry/permissions";
import { redactForViewer } from "../core/visibility-service";
import { safeImageUrl } from "../core/sanitize";
import type { DeityDefinition } from "../core/types";
import type { ViewerContext } from "../core/visibility-service";
import type { GodForgeActor, GodForgeApi } from "../api";
import type { SocketRouter } from "../foundry/socket-router";
import { reportActionError } from "../foundry/error-reporting";
import { hasGrantChoices } from "../core/grant-choice-service";
import { GodForgeGrantChoiceDialog } from "./grant-choice-dialog";
import { getFoundryGame } from "../foundry/runtime";

export class GodForgeCodex extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true }, position: { width: 1000, height: 760 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/codex.hbs" } };
  private searchTerm = "";
  private selectedDomain = "";
  constructor(private readonly deityService: DeityService, private readonly preview?: { deity: DeityDefinition; viewer: ViewerContext }, private readonly api?: GodForgeApi, private readonly socketRouter?: SocketRouter, private readonly actor?: GodForgeActor, private readonly viewerOverride?: ViewerContext) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { const viewer = this.preview?.viewer ?? this.viewerOverride ?? currentViewerContext(true); const source = this.preview ? [{ ...this.preview.deity, status: "published" as const }] : this.deityService.list(); const selectedId = (this.actor?.flags?.["darkis-godforge"] as { deityId?: string } | undefined)?.deityId; const user = getFoundryGame()?.user; const ownsActor = Boolean(this.actor && user && this.actor.testUserPermission?.(user, "OWNER") === true); const decorate = <T extends { image?: string; imagePresentation?: DeityDefinition["imagePresentation"] }>(deity: T) => ({ ...deity, image: safeImageUrl(deity.image), imageFit: deity.imagePresentation?.image?.fit === "contain" ? "contain" : "cover", imagePosition: `${deity.imagePresentation?.image?.focusX ?? 50}% ${deity.imagePresentation?.image?.focusY ?? 25}%` }); const visible = source.flatMap((deity) => { const requiresChoices = hasGrantChoices(deity.grantGroups); if (viewer.isGM) return [{ ...decorate(deity), selected: deity.id === selectedId, canSelect: false, requiresChoices }]; const redacted = redactForViewer(deity, viewer); return redacted ? [{ ...decorate(redacted), selected: deity.id === selectedId, canSelect: Boolean(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && (viewer.ownsActor || ownsActor)), requiresChoices }] : []; }); const deities = visible.filter((deity) => (!this.searchTerm || `${deity.name} ${deity.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || deity.domains?.includes(this.selectedDomain))); return { ui: uiText(), deities, domains: [...new Set(visible.flatMap((deity) => deity.domains ?? []))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain, isGM: viewer.isGM, isPreview: Boolean(this.preview || this.viewerOverride) }; }
  _onRender(): void { const root = this.element; if (!root) return; const search = root.querySelector<HTMLInputElement>("[data-search]"); const filter = root.querySelector<HTMLSelectElement>("[data-filter]"); if (search) search.value = this.searchTerm; if (filter) filter.value = this.selectedDomain; search?.addEventListener("input", (event) => { this.searchTerm = (event.target as HTMLInputElement).value.toLocaleLowerCase(); void this.render(true); }); filter?.addEventListener("change", (event) => { this.selectedDomain = (event.target as HTMLSelectElement).value; void this.render(true); }); root.querySelectorAll<HTMLElement>("[data-select-deity]").forEach((button) => button.addEventListener("click", () => { if (!this.actor || !this.socketRouter) return; const deity = this.deityService.get(button.dataset.selectDeity ?? ""); if (!deity) return; if (hasGrantChoices(deity.grantGroups)) { void new GodForgeGrantChoiceDialog(deity, this.actor, this.socketRouter, () => void this.render(true)).render(true); return; } void this.socketRouter.assign({ actorId: this.actor.id, deityId: deity.id, choices: {} }).then(() => this.render(true)).catch((error: unknown) => reportActionError("Deity assignment failed.", error)); })); }
}
