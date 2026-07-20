import { AdapterRegistry } from "../adapters/adapter-registry";
import { GodForgeApi } from "../api";
import type { DeityService } from "../core/deity-service";
import { safeImageUrl } from "../core/sanitize";
import { validateDeity } from "../core/validation-service";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryGame } from "../foundry/runtime";
import { GodForgeCodex } from "./codex";
import { GodForgeDeityDetail } from "./deity-detail";
import { GodForgeDeityEditor } from "./deity-editor";
import { GodForgeReplacementManager } from "./replacement-manager";
import { GodForgeDataManager } from "./data-manager";
import { RandomContentService } from "../core/random-service";
import { CURRENT_SCHEMA_VERSION } from "../core/migration-service";
import { GodForgeRandomManager } from "./random-manager";
import { GodForgeCharacterManager } from "./character-manager";

export class GodForgeDashboard extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true }, position: { width: 1440, height: 900 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } };
  private searchTerm = "";
  private sectionFilter: "overview" | "deities" | "pantheons" | "abilities" | "bonuses" = "overview";
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private keydownRoot: HTMLElement | null = null;
  private readonly handleRootKeydown = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      const search = this.element?.querySelector<HTMLInputElement>("[data-search]");
      search?.focus(); search?.select();
    }
  };

  constructor(private readonly deityService: DeityService, private readonly adapters = new AdapterRegistry(), private readonly api = new GodForgeApi(deityService, adapters), private readonly randomContent = new RandomContentService()) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    const ui = uiText();
    const allDeities = this.deityService.list().map((deity) => {
      const errors = validateDeity(deity).filter((issue) => issue.level === "error").length;
      return {
        ...deity,
        image: safeImageUrl(deity.image),
        imagePosition: `${deity.imagePresentation?.image?.focusX ?? 50}% ${deity.imagePresentation?.image?.focusY ?? 25}%`,
        imageFit: deity.imagePresentation?.image?.fit === "contain" ? "contain" : "cover",
        errors,
        statusLabel: ui[`STATUS_${deity.status.toUpperCase()}`] ?? deity.status,
        updatedLabel: formatDate(deity.updatedAt)
      };
    });
    const query = this.searchTerm.toLocaleLowerCase();
    const deities = allDeities.filter((deity) => this.matchesSection(deity) && (!query || `${deity.name} ${deity.title} ${deity.domains.join(" ")}`.toLocaleLowerCase().includes(query)));
    const assignedActors = getFoundryGame()?.actors?.contents?.filter(hasAssignedDeity).length ?? 0;
    const game = getFoundryGame();
    const moduleVersion = game?.modules?.get("darkis-godforge")?.version ?? "—";
    const systemId = game?.system?.id ?? "—";
    return {
      ui,
      deities,
      hasAnyDeities: allDeities.length > 0,
      searchTerm: this.searchTerm,
      nav: { [this.sectionFilter]: true },
      recent: [...allDeities].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)).slice(0, 6),
      stats: {
        deities: allDeities.length,
        pantheons: new Set(allDeities.flatMap((deity) => deity.pantheonIds ?? [])).size,
        published: allDeities.filter((deity) => deity.status === "published").length,
        bonuses: allDeities.reduce((sum, deity) => sum + deity.passiveBonuses.length, 0),
        abilities: allDeities.reduce((sum, deity) => sum + deity.abilities.length, 0),
        invalid: allDeities.filter((deity) => deity.errors > 0).length,
        assignedActors
      },
      systemInfo: {
        foundry: game?.version ?? "—",
        system: systemId,
        systemVersion: game?.system?.version ?? "—",
        moduleVersion,
        adapter: this.adapters.tryGet(systemId)?.id ?? "—",
        schema: CURRENT_SCHEMA_VERSION
      }
    };
  }

  _onRender(): void {
    requireGM();
    const root = this.element;
    if (!root) return;
    root.querySelectorAll<HTMLElement>("[data-action='create']").forEach((button) => button.addEventListener("click", () => new GodForgeDeityEditor(this.deityService, () => void this.render(true), this.adapters).render(true)));
    root.querySelectorAll<HTMLElement>("[data-action='codex']").forEach((button) => button.addEventListener("click", () => new GodForgeCodex(this.deityService).render(true)));
    root.querySelectorAll<HTMLElement>("[data-action='player-preview']").forEach((button) => button.addEventListener("click", () => new GodForgeCodex(this.deityService, undefined, undefined, undefined, undefined, { isGM: false, selection: true }).render(true)));
    root.querySelectorAll<HTMLElement>("[data-section]").forEach((button) => button.addEventListener("click", () => { const section = button.dataset.section; if (section === "overview" || section === "deities" || section === "pantheons" || section === "abilities" || section === "bonuses") { this.sectionFilter = section; void this.render(true); } }));
    root.querySelector<HTMLElement>("[data-manager='replacements']")?.addEventListener("click", () => void new GodForgeReplacementManager(this.deityService, this.adapters).render(true));
    root.querySelectorAll<HTMLElement>("[data-manager='data']").forEach((button) => button.addEventListener("click", () => { const mode = button.dataset.managerMode === "migration" ? "migration" : "transfer"; void new GodForgeDataManager(this.deityService, this.api, this.randomContent, mode).render(true); }));
    root.querySelectorAll<HTMLElement>("[data-manager='random']").forEach((button) => button.addEventListener("click", () => { const value = button.dataset.managerMode; const mode = value === "wheels" || value === "test" ? value : "tables"; void new GodForgeRandomManager(this.randomContent, mode).render(true); }));
    root.querySelector<HTMLElement>("[data-manager='characters']")?.addEventListener("click", () => void new GodForgeCharacterManager(this.deityService, this.api).render(true));
    root.querySelector<HTMLElement>("[data-action='toggle-context']")?.addEventListener("click", () => root.querySelector<HTMLElement>(".dg-app-shell")?.classList.toggle("context-open"));
    root.querySelector<HTMLElement>("[data-action='settings']")?.addEventListener("click", () => this.openSettings());
    root.querySelectorAll<HTMLElement>("[data-scroll]").forEach((button) => button.addEventListener("click", () => root.querySelector<HTMLElement>(`[data-section-target='${button.dataset.scroll ?? ""}']`)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll<HTMLElement>("[data-deity]").forEach((card) => card.addEventListener("click", () => { const deity = this.deityService.get(card.dataset.deity ?? ""); if (deity) void new GodForgeDeityDetail(deity, this.deityService, this.adapters).render(true); }));
    const search = root.querySelector<HTMLInputElement>("[data-search]");
    if (search) search.value = this.searchTerm;
    search?.addEventListener("input", () => {
      this.searchTerm = search.value;
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => void this.render(true), 140);
    });
    if (this.keydownRoot !== root) {
      this.keydownRoot?.removeEventListener("keydown", this.handleRootKeydown);
      root.addEventListener("keydown", this.handleRootKeydown);
      this.keydownRoot = root;
    }
  }

  _onClose(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.keydownRoot?.removeEventListener("keydown", this.handleRootKeydown);
    this.keydownRoot = null;
  }

  private openSettings(): void {
    type Renderable = { render(force?: boolean): Promise<unknown> };
    type SettingsConstructor = new (options?: Record<string, unknown>) => Renderable;
    const runtime = globalThis as unknown as { foundry?: { applications?: { settings?: { SettingsConfig?: SettingsConstructor } } }; SettingsConfig?: SettingsConstructor };
    const SettingsConfig = runtime.foundry?.applications?.settings?.SettingsConfig ?? runtime.SettingsConfig;
    if (SettingsConfig) { void new SettingsConfig({ initialCategory: "darkis-godforge" }).render(true); return; }
    const settingsSheet = (getFoundryGame()?.settings as { sheet?: Renderable } | undefined)?.sheet;
    if (settingsSheet) void settingsSheet.render(true);
  }

  private matchesSection(deity: { pantheonIds?: string[]; abilities: unknown[]; passiveBonuses: unknown[] }): boolean { if (this.sectionFilter === "pantheons") return Boolean(deity.pantheonIds?.length); if (this.sectionFilter === "abilities") return deity.abilities.length > 0; if (this.sectionFilter === "bonuses") return deity.passiveBonuses.length > 0; return true; }
}

function hasAssignedDeity(actor: unknown): boolean {
  const flags = (actor as { flags?: Record<string, unknown> }).flags?.["darkis-godforge"];
  return Boolean(flags && typeof flags === "object" && "deityId" in flags);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
