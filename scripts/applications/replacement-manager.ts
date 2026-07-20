import type { AdapterRegistry } from "../adapters/adapter-registry";
import type { DeityService } from "../core/deity-service";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryGame } from "../foundry/runtime";

export class GodForgeReplacementManager extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-replacements", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.REPLACEMENTS", resizable: true }, position: { width: 1100, height: 760 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/replacement-manager.hbs" } };
  constructor(private readonly deities: DeityService, private readonly adapters: AdapterRegistry) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    const systemId = getFoundryGame()?.system?.id ?? "";
    const official = await (this.adapters.tryGet(systemId)?.listOfficialDeities() ?? Promise.resolve([]));
    const homebrew = this.deities.list();
    const rows = official.map((source) => {
      const mapping = homebrew.find((deity) => deity.replacement.sourceUuid === source.sourceUuid && deity.replacement.mode !== "none");
      return { ...source, mappingMode: mapping?.replacement.mode ?? "none", inheritedCount: Object.values(mapping?.replacement.inherit ?? {}).filter(Boolean).length, options: homebrew.map((deity) => ({ id: deity.id, name: deity.name, selected: deity.id === mapping?.id })) };
    });
    return { ui: uiText(), rows, systemId };
  }

  _onRender(): void {
    requireGM();
    const form = this.element?.querySelector<HTMLFormElement>("form");
    form?.querySelectorAll<HTMLElement>("[data-source-row]").forEach((row) => { const mode = row.querySelector<HTMLSelectElement>("[name='replacement.mode']"); if (mode) mode.value = row.dataset.mode ?? "none"; });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      requireGM();
      for (const row of form.querySelectorAll<HTMLElement>("[data-source-row]")) {
        const sourceUuid = row.dataset.sourceUuid ?? "";
        const deityId = row.querySelector<HTMLSelectElement>("[name='replacement.deity']")?.value ?? "";
        const modeValue = row.querySelector<HTMLSelectElement>("[name='replacement.mode']")?.value ?? "none";
        const mode = modeValue === "hide" || modeValue === "replace" ? modeValue : "none";
        for (const deity of this.deities.list().filter((item) => item.replacement.sourceUuid === sourceUuid && item.id !== deityId)) this.deities.update(deity.id, { replacement: { sourceUuid: "", mode: "none", contexts: [] } });
        if (deityId) { const current = this.deities.get(deityId); this.deities.update(deityId, { replacement: { ...current?.replacement, sourceUuid, mode, contexts: ["characterBuilder", "compendium", "actorSheet", "searches", "leveler"] } }); }
      }
      void this.render(true);
    });
  }
}
