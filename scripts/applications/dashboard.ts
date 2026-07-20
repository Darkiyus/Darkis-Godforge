import { AdapterRegistry } from "../adapters/adapter-registry";
import { GodForgeApi } from "../api";
import type { DeityService } from "../core/deity-service";
import { safeImageUrl } from "../core/sanitize";
import { validateDeity } from "../core/validation-service";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryGame } from "../foundry/runtime";
import { GodForgeCodex } from "./codex";
import { GodForgeDeityDetail } from "./deity-detail";
import { GodForgeDeityEditor } from "./deity-editor";
import { GodForgeReplacementManager } from "./replacement-manager";
import { GodForgeDataManager } from "./data-manager";
import { RandomContentService } from "../core/random-service";
import { GodForgeRandomManager } from "./random-manager";
import { GodForgeCharacterManager } from "./character-manager";

export class GodForgeDashboard extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: true }, position: { width: 1440, height: 900 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } };
  private searchTerm = "";
  private sectionFilter: "overview" | "deities" | "pantheons" | "abilities" | "bonuses" = "overview";
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly deityService: DeityService, private readonly adapters = new AdapterRegistry(), private readonly api = new GodForgeApi(deityService, adapters), private readonly randomContent = new RandomContentService()) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    const ui = uiText();
    const allDeities = this.deityService.list().map((deity) => {
      const errors = validateDeity(deity).filter((issue) => issue.level === "error").length;
      return {
        ...deity,
        image: safeImageUrl(deity.image),
        errors,
        statusLabel: ui[`STATUS_${deity.status.toUpperCase()}`] ?? deity.status,
        updatedLabel: formatDate(deity.updatedAt)
      };
    });
    const query = this.searchTerm.toLocaleLowerCase();
    const deities = allDeities.filter((deity) => this.matchesSection(deity) && (!query || `${deity.name} ${deity.title} ${deity.domains.join(" ")}`.toLocaleLowerCase().includes(query)));
    const assignedActors = getFoundryGame()?.actors?.contents?.filter(hasAssignedDeity).length ?? 0;
    const game = getFoundryGame();
    const moduleVersion = game?.modules?.get("darkis-godforge")?.version ?? "0.2.0";
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
        schema: 2
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
    root.querySelectorAll<HTMLElement>("[data-manager='data']").forEach((button) => button.addEventListener("click", () => void new GodForgeDataManager(this.deityService, this.api, this.randomContent).render(true)));
    root.querySelectorAll<HTMLElement>("[data-manager='random']").forEach((button) => button.addEventListener("click", () => void new GodForgeRandomManager(this.randomContent).render(true)));
    root.querySelector<HTMLElement>("[data-manager='characters']")?.addEventListener("click", () => void new GodForgeCharacterManager(this.deityService, this.api).render(true));
    root.querySelector<HTMLElement>("[data-action='toggle-context']")?.addEventListener("click", () => root.querySelector<HTMLElement>(".dg-app-shell")?.classList.toggle("context-open"));
    root.querySelectorAll<HTMLElement>("[data-scroll]").forEach((button) => button.addEventListener("click", () => root.querySelector<HTMLElement>(`[data-section-target='${button.dataset.scroll ?? ""}']`)?.scrollIntoView({ behavior: "smooth", block: "start" })));
    root.querySelectorAll<HTMLElement>("[data-deity]").forEach((card) => card.addEventListener("click", () => { const deity = this.deityService.get(card.dataset.deity ?? ""); if (deity) void new GodForgeDeityDetail(deity, this.deityService, this.adapters).render(true); }));
    const search = root.querySelector<HTMLInputElement>("[data-search]");
    if (search) search.value = this.searchTerm;
    search?.addEventListener("input", () => {
      this.searchTerm = search.value;
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => void this.render(true), 140);
    });
    root.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === "k") { event.preventDefault(); search?.focus(); search?.select(); }
    });
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
