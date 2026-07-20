import type { GodForgeActor, GodForgeApi } from "../api";
import type { DeityService } from "../core/deity-service";
import type { GrantGroup } from "../core/types";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryGame } from "../foundry/runtime";
import { reportActionError } from "../foundry/error-reporting";

export class GodForgeCharacterManager extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-character-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHARACTERS", resizable: true }, position: { width: 900, height: 700 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/character-manager.hbs" } };
  constructor(private readonly deities: DeityService, private readonly api: GodForgeApi) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> { requireGM(); const actors = (getFoundryGame()?.actors?.contents ?? []).flatMap((value) => { const actor = value as GodForgeActor & { name?: string; type?: string }; if (actor.type && actor.type !== "character") return []; const state = actor.flags?.["darkis-godforge"] as { deityId?: string } | undefined; return [{ id: actor.id, name: actor.name ?? actor.id, deityName: this.deities.get(state?.deityId ?? "")?.name ?? "—" }]; }); const deities = this.deities.list().filter((deity) => deity.status !== "archived").map((deity) => ({ id: deity.id, name: deity.name, choiceGroups: deity.grantGroups.flatMap(collectChoiceGroups) })); return { ui: uiText(), actors, deities }; }
  _onRender(): void { requireGM(); const root = this.element; const deitySelect = root?.querySelector<HTMLSelectElement>("[name='deityId']"); const updateChoices = () => root?.querySelectorAll<HTMLElement>("[data-deity-choices]").forEach((section) => { section.hidden = section.dataset.deityChoices !== deitySelect?.value; }); deitySelect?.addEventListener("change", updateChoices); updateChoices(); root?.querySelector<HTMLFormElement>("form")?.addEventListener("submit", (event) => { event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const data = new FormData(form); const actor = getFoundryGame()?.actors?.get(String(data.get("actorId") ?? "")) as GodForgeActor | undefined; const deityId = String(data.get("deityId") ?? ""); if (!actor || !deityId) return; const choices: Record<string, string[]> = {}; root.querySelectorAll<HTMLInputElement>(`[data-deity-choices='${cssEscape(deityId)}'] input[data-group]:checked`).forEach((input) => { (choices[input.dataset.group ?? ""] ??= []).push(input.value); }); void this.api.assignDeity(actor, deityId, choices).then(() => this.render(true)).catch((error: unknown) => reportActionError("Character assignment failed.", error)); }); }
}

function collectChoiceGroups(group: GrantGroup): Array<{ id: string; label: string; pick: number; options: Array<{ id: string; label: string }> }> { const nested = group.grants.flatMap((grant) => "mode" in grant ? collectChoiceGroups(grant) : []); if (group.mode !== "any") return nested; const options = group.grants.map((grant) => "mode" in grant ? { id: grant.id, label: grant.label || grant.id } : { id: grant.ref, label: grant.overrides?.name || grant.ref }); return [{ id: group.id, label: group.label || group.id, pick: group.pick ?? 1, options }, ...nested]; }
function cssEscape(value: string): string { return typeof CSS !== "undefined" ? CSS.escape(value) : value.replace(/["'\\]/g, "\\$&"); }
