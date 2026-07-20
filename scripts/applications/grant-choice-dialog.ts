import type { GodForgeActor } from "../api";
import { collectGrantChoiceGroups } from "../core/grant-choice-service";
import type { DeityDefinition, GrantChoiceMap } from "../core/types";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { reportActionError } from "../foundry/error-reporting";
import { uiText } from "../foundry/i18n";
import type { SocketRouter } from "../foundry/socket-router";

interface DialogGroup {
  id: string;
  label: string;
  pick: number;
  inputType: "radio" | "checkbox";
  options: Array<{ token: string; label: string }>;
  requirements: Array<{ name: string; token: string }>;
}

export class GodForgeGrantChoiceDialog extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-grant-choices", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHOOSE_GRANTS", resizable: true }, position: { width: 620, height: 680 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/grant-choice-dialog.hbs" } };
  private groups: DialogGroup[] = [];
  private readonly tokens = new Map<string, string>();
  private error = "";

  constructor(private readonly deity: DeityDefinition, private readonly actor: GodForgeActor, private readonly socketRouter: SocketRouter, private readonly onAssigned: () => void) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    this.tokens.clear();
    const sourceGroups = this.deity.grantGroups.flatMap((group) => collectGrantChoiceGroups(group));
    const optionTokens = new Map<string, string>();
    const options = sourceGroups.map((group, groupIndex) => group.options.map((option, optionIndex) => {
        const token = `${groupIndex}-${optionIndex}-${crypto.randomUUID()}`;
        this.tokens.set(token, option.id);
        optionTokens.set(`${group.id}\u0000${option.id}`, token);
        return { token, label: option.label };
      }));
    this.groups = sourceGroups.map((group, groupIndex) => ({
      id: group.id,
      label: group.label,
      pick: group.pick,
      inputType: group.pick === 1 ? "radio" : "checkbox",
      options: options[groupIndex] ?? [],
      requirements: group.requirements.flatMap((requirement) => {
        const parentIndex = sourceGroups.findIndex((candidate) => candidate.id === requirement.groupId);
        const token = optionTokens.get(`${requirement.groupId}\u0000${requirement.optionId}`);
        return parentIndex >= 0 && token ? [{ name: `choice-${parentIndex}`, token }] : [];
      })
    }));
    return { ui: uiText(), deityName: this.deity.name, groups: this.groups, error: this.error };
  }

  _onRender(): void {
    this.element?.querySelector<HTMLFormElement>("form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget as HTMLFormElement;
      const choices: GrantChoiceMap = {};
      for (const [index, group] of this.groups.entries()) {
        if (form.querySelector<HTMLElement>(`[data-choice-group='${index}']`)?.hidden) continue;
        const selected = [...form.querySelectorAll<HTMLInputElement>(`[name='choice-${index}']:checked`)].flatMap((input) => {
          const value = this.tokens.get(input.value);
          return value ? [value] : [];
        });
        if (selected.length !== group.pick) { this.error = `${group.label}: ${(uiText().PICK_EXACTLY ?? "Choose exactly {count} option(s).").replace("{count}", String(group.pick))}`; void this.render(true); return; }
        choices[group.id] = selected;
      }
      void this.socketRouter.assign({ actorId: this.actor.id, deityId: this.deity.id, choices })
        .then(() => { this.onAssigned(); void this.close?.(); })
        .catch((error: unknown) => { this.error = uiText().ASSIGNMENT_FAILED ?? "The deity could not be assigned."; reportActionError("Grant choice assignment failed.", error); void this.render(true); });
    });
    const updateGroups = (): void => {
      this.element?.querySelectorAll<HTMLElement>("[data-choice-group]").forEach((fieldset) => {
        const requirements = [...fieldset.querySelectorAll<HTMLElement>("[data-choice-requirement]")];
        const active = requirements.every((requirement) => {
          const name = requirement.dataset.name ?? "";
          const token = requirement.dataset.token ?? "";
          return this.element?.querySelector<HTMLInputElement>(`[name='${name}'][value='${token}']`)?.checked === true;
        });
        fieldset.hidden = !active;
        fieldset.querySelectorAll<HTMLInputElement>("input").forEach((input) => { input.disabled = !active; if (!active) input.checked = false; });
      });
    };
    this.element?.querySelector<HTMLFormElement>("form")?.addEventListener("change", updateGroups);
    updateGroups();
    this.element?.querySelector<HTMLElement>("[data-action='cancel']")?.addEventListener("click", () => void this.close?.());
  }
}
