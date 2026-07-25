import type { DeityService } from "../core/deity-service";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { currentViewerContext } from "../foundry/permissions";
import { discoveryForViewer, isDeityVisible, redactForViewer, type ViewerContext } from "../core/visibility-service";
import { safeImageUrl } from "../core/sanitize";
import type { DeityDefinition } from "../core/types";
import type { CodexSnapshotEntry, GodForgeActor, GodForgeApi } from "../api";
import type { SocketRouter } from "../foundry/socket-router";
import { reportActionError } from "../foundry/error-reporting";
import { collectGrantChoiceGroups, hasGrantChoices } from "../core/grant-choice-service";
import { GodForgeGrantChoiceDialog } from "./grant-choice-dialog";
import { getFoundryGame, getFoundryRuntime } from "../foundry/runtime";
import { imagePresentationStyle } from "../core/image-presentation";

const UNKNOWN_DEITY_IMAGE = "modules/darkis-godforge/assets/unknown-deity.svg";

interface CodexEntry {
  id: string;
  name: string;
  title?: string;
  image?: string;
  imageFit?: string;
  imagePosition?: string;
  rumor?: boolean;
  rumorText?: string;
  lore?: boolean;
  selected?: boolean;
  canSelect?: boolean;
  canReveal?: boolean;
  requiresChoices?: boolean;
  [key: string]: unknown;
}

export class GodForgeCodex extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true }, position: { width: 1120, height: 790 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/codex.hbs" } };
  private searchTerm = "";
  private selectedDomain = "";
  private spread = 0;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly remoteChoices = new Map<string, CodexSnapshotEntry>();

  constructor(
    private readonly deityService: DeityService,
    private readonly preview?: { deity: DeityDefinition; viewer: ViewerContext },
    private readonly api?: GodForgeApi,
    private readonly socketRouter?: SocketRouter,
    private readonly actor?: GodForgeActor,
    private readonly viewerOverride?: ViewerContext
  ) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    const viewer = this.preview?.viewer ?? this.viewerOverride ?? currentViewerContext(true);
    const remote = !viewer.isGM && !this.preview && !this.viewerOverride && this.socketRouter ? await this.socketRouter.codexSnapshot(this.actor?.id) : null;
    this.remoteChoices.clear();
    for (const entry of remote ?? []) this.remoteChoices.set(entry.id, entry);
    const source = this.preview ? [{ ...this.preview.deity, status: "published" as const }] : remote ?? this.deityService.list();
    const selectedId = (this.actor?.flags?.["darkis-godforge"] as { deityId?: string } | undefined)?.deityId;
    const user = getFoundryGame()?.user;
    const ownsActor = Boolean(this.actor && user && this.actor.testUserPermission?.(user, "OWNER") === true);
    const visible = source.flatMap((deity): CodexEntry[] => {
      if ("discovery" in deity && typeof deity.discovery === "string") {
        if (deity.discovery === "rumor") return [{ id: deity.id, name: deity.rumorName?.trim() || uiText().UNKNOWN_DEITY || "Unknown deity", title: uiText().UNREVEALED || "Not yet discovered", image: UNKNOWN_DEITY_IMAGE, imageFit: "cover", imagePosition: "50% 35%", rumor: true, rumorText: deity.rumorText?.trim() || uiText().UNKNOWN_DEITY_HINT }];
        return [{ ...deity, image: safeImageUrl(deity.image), ...imagePresentationStyle(deity.imagePresentation?.image), lore: deity.lore, selected: deity.id === selectedId, canSelect: !deity.lore && Boolean(this.actor && this.socketRouter), requiresChoices: deity.choiceGroups.length > 0 }];
      }
      if (!isDeityVisible(deity, viewer)) return [];
      const discovery = discoveryForViewer(deity, viewer);
      if (discovery === "hidden") return [];
      if (discovery === "rumor") {
        return [{
          id: deity.id,
          name: deity.discovery?.rumorName?.trim() || uiText().UNKNOWN_DEITY || "Unknown deity",
          title: uiText().UNREVEALED || "Not yet discovered",
          image: UNKNOWN_DEITY_IMAGE,
          imageFit: "cover",
          imagePosition: "50% 35%",
          rumor: true,
          rumorText: deity.discovery?.rumorText?.trim() || uiText().UNKNOWN_DEITY_HINT
        }];
      }
      const requiresChoices = hasGrantChoices(deity.grantGroups);
      const lore = deity.kind === "lore";
      const raw = viewer.isGM ? deity : redactForViewer(deity, viewer);
      if (!raw) return [];
      return [{
        ...raw,
        image: safeImageUrl(raw.image),
        ...imagePresentationStyle(raw.imagePresentation?.image),
        lore,
        selected: deity.id === selectedId,
        canSelect: !lore && Boolean(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && (viewer.ownsActor || ownsActor)),
        canReveal: viewer.isGM && deity.discovery?.enabled === true,
        requiresChoices
      }];
    }).sort((a, b) => Number(b.lore) - Number(a.lore) || a.name.localeCompare(b.name));
    const deities = visible.filter((deity) =>
      (!this.searchTerm || `${deity.name} ${deity.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) &&
      (!this.selectedDomain || (deity.domains as string[] | undefined)?.includes(this.selectedDomain))
    );
    const spreadCount = Math.max(1, Math.ceil(deities.length / 2));
    this.spread = Math.max(0, Math.min(this.spread, spreadCount - 1));
    const left = deities[this.spread * 2];
    const right = deities[this.spread * 2 + 1];
    return {
      ui: uiText(),
      left,
      right,
      hasEntries: deities.length > 0,
      domains: [...new Set(visible.flatMap((deity) => (deity.domains as string[] | undefined) ?? []))].sort(),
      searchTerm: this.searchTerm,
      selectedDomain: this.selectedDomain,
      spreadNumber: this.spread + 1,
      spreadCount,
      canPrevious: this.spread > 0,
      canNext: this.spread < spreadCount - 1,
      isGM: viewer.isGM,
      isPreview: Boolean(this.preview || this.viewerOverride)
    };
  }

  _onRender(): void {
    const root = this.element;
    if (!root) return;
    const search = root.querySelector<HTMLInputElement>("[data-search]");
    const filter = root.querySelector<HTMLSelectElement>("[data-filter]");
    if (search) search.value = this.searchTerm;
    if (filter) filter.value = this.selectedDomain;
    search?.addEventListener("input", (event) => { this.searchTerm = (event.target as HTMLInputElement).value.toLocaleLowerCase(); this.spread = 0; if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => void this.render(true), 160); });
    filter?.addEventListener("change", (event) => { this.selectedDomain = (event.target as HTMLSelectElement).value; this.spread = 0; void this.render(true); });
    root.querySelector<HTMLElement>("[data-page='previous']")?.addEventListener("click", () => { this.spread -= 1; void this.render(true); });
    root.querySelector<HTMLElement>("[data-page='next']")?.addEventListener("click", () => { this.spread += 1; void this.render(true); });
    root.querySelectorAll<HTMLElement>("[data-reveal-deity]").forEach((button) => button.addEventListener("click", () => {
      const deity = this.deityService.get(button.dataset.revealDeity ?? "");
      if (!deity || !getFoundryGame()?.user?.isGM) return;
      this.deityService.update(deity.id, { discovery: { ...deity.discovery, enabled: false, defaultState: "revealed" } });
      void this.deityService.flushPersistence().then(() => { getFoundryRuntime()?.Hooks.callAll("godforge.trigger", "deity-revealed", this.actor); return this.render(true); }).catch((error: unknown) => reportActionError("Deity reveal failed.", error));
    }));
    root.addEventListener("keydown", (event) => {
      if ((event.target as HTMLElement).matches("input, select")) return;
      if (event.key === "ArrowLeft" && this.spread > 0) { this.spread -= 1; void this.render(true); }
      if (event.key === "ArrowRight") { this.spread += 1; void this.render(true); }
    });
    root.querySelectorAll<HTMLElement>("[data-select-deity]").forEach((button) => button.addEventListener("click", () => {
      if (!this.actor || !this.socketRouter) return;
      const deityId = button.dataset.selectDeity ?? "";
      const deity = this.deityService.get(deityId) ?? this.remoteChoices.get(deityId);
      if (!deity) return;
      const choices = "choiceGroups" in deity ? deity.choiceGroups : deity.grantGroups.flatMap((group) => collectGrantChoiceGroups(group));
      if (choices.length) {
        void new GodForgeGrantChoiceDialog("choiceGroups" in deity ? { id: deity.id, name: deity.name, choiceGroups: choices } : deity, this.actor, this.socketRouter, () => void this.render(true)).render(true);
        return;
      }
      void this.socketRouter.assign({ actorId: this.actor.id, deityId: deity.id, choices: {} })
        .then(() => this.render(true))
        .catch((error: unknown) => reportActionError("Deity assignment failed.", error));
    }));
  }
  _onClose(): void { if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = null; }
}
