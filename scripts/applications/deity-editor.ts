import { AdapterRegistry } from "../adapters/adapter-registry";
import type { DeityService } from "../core/deity-service";
import { DEFAULT_VISIBILITY, type AbilityDefinition, type DeityDefinition, type GrantGroup, type GrantMember, type PassiveBonusDefinition, type VisibilityFields, type VisibilityLevel } from "../core/types";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { getFoundryGame } from "../foundry/runtime";
import { GodForgeCodex } from "./codex";
import { safeImageUrl } from "../core/sanitize";
import { CURRENT_SCHEMA_VERSION } from "../core/migration-service";

const visibilityFields = Object.keys(DEFAULT_VISIBILITY.fields) as Array<keyof VisibilityFields>;

export class GodForgeDeityEditor extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: true }, position: { width: 980, height: 760 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } };

  constructor(
    private readonly deityService: DeityService,
    private readonly onSaved: (deity: DeityDefinition) => void,
    private readonly adapters = new AdapterRegistry(),
    private readonly existing?: DeityDefinition
  ) { super(); }

  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    const systemId = getFoundryGame()?.system?.id ?? "";
    const adapter = this.adapters.tryGet(systemId);
    const selectors = adapter?.listSkills() ?? [];
    let officialDeities: Awaited<ReturnType<NonNullable<typeof adapter>["listOfficialDeities"]>> = [];
    try { officialDeities = await (adapter?.listOfficialDeities() ?? Promise.resolve([])); }
    catch (error) { console.error("Darkis GodForge | Could not load official deities for the editor.", error); }
    const selectedSource = this.existing?.replacement.sourceUuid ?? "";
    const officialOptions = officialDeities.map((deity) => ({ ...deity, selected: deity.sourceUuid === selectedSource }));
    if (selectedSource && !officialOptions.some((deity) => deity.sourceUuid === selectedSource)) officialOptions.push({ id: selectedSource, sourceUuid: selectedSource, official: true, name: selectedSource, title: selectedSource, domains: [], selected: true });
    const ui = uiText();
    return {
      ui: { ...ui, NEW_DEITY: this.existing ? ui.EDIT_DEITY : ui.NEW_DEITY },
      selectors,
      officialDeities: officialOptions,
      visibilityFields: visibilityFields.map((key) => ({ key, label: ui[`VIS_FIELD_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? key })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((value) => ({ value, label: ui[`VIS_${value.replaceAll("-", "_").toUpperCase()}`] ?? value }))
    };
  }

  _onRender(): void {
    requireGM();
    const root = this.element;
    const form = root?.querySelector<HTMLFormElement>("form");
    if (root && form && this.existing) this.populateForm(root, form, this.existing);
    if (root && form) this.setupWizard(root, form);
    root?.querySelectorAll<HTMLButtonElement>("[data-action='browse-image']").forEach((button) => button.addEventListener("click", () => this.openFilePicker(root, button)));
    root?.querySelectorAll<HTMLElement>("[data-image-field]").forEach((field) => {
      field.addEventListener("dragover", (event) => { event.preventDefault(); event.dataTransfer!.dropEffect = "copy"; });
      field.addEventListener("drop", (event) => this.handleImageDrop(event, field));
    });
    root?.querySelector<HTMLElement>("[data-action='close']")?.addEventListener("click", () => void this.close?.());
    root?.querySelector<HTMLElement>("[data-action='add-bonus']")?.addEventListener("click", () => this.appendTemplate(root, "bonus", "[data-bonus-list]"));
    root?.querySelector<HTMLElement>("[data-action='add-ability']")?.addEventListener("click", () => this.appendTemplate(root, "ability", "[data-ability-list]"));
    root?.querySelector<HTMLElement>("[data-action='add-grant-group']")?.addEventListener("click", () => this.appendTemplate(root, "grant-group", "[data-grant-list]"));
    root?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      const card = button?.closest<HTMLElement>(".dg-editor-card");
      if (!button || !card) return;
      if (button.dataset.action === "add-grant-member") this.appendTemplate(card, "grant-member", ":scope > [data-grant-members]");
      if (button.dataset.action === "add-subgroup") this.appendTemplate(card, "grant-group", ":scope > [data-grant-members]");
      if (button.dataset.action === "remove-row") card.remove();
      if (button.dataset.action === "duplicate-row") card.after(card.cloneNode(true));
      if (button.dataset.action === "move-up" && card.previousElementSibling) card.parentElement?.insertBefore(card, card.previousElementSibling);
      if (button.dataset.action === "move-down" && card.nextElementSibling) card.parentElement?.insertBefore(card.nextElementSibling, card);
      this.updateStackingWarnings(root);
      if (form) this.updateWizardPreview(root, form);
    });
    root?.addEventListener("input", (event) => { this.updateStackingWarnings(root); const input = event.target as HTMLInputElement; if (input.matches("[data-image-input]")) this.updateImagePreview(root, input.name, input.value); if (form) this.updateWizardPreview(root, form); });
    root?.addEventListener("change", () => { if (form) this.updateWizardPreview(root, form); });
    root?.querySelectorAll<HTMLInputElement>("[data-image-input]").forEach((input) => this.updateImagePreview(root, input.name, input.value));
    root?.querySelectorAll<HTMLElement>("[data-action='preview-player']").forEach((button) => button.addEventListener("click", () => {
      const name = form?.elements.namedItem("name") as HTMLInputElement | null;
      if (!form || !name?.reportValidity()) return;
      const deity = this.previewDefinition(form);
      void new GodForgeCodex(this.deityService, { deity, viewer: { isGM: false, selection: true } }).render(true);
    }));
    root?.querySelector<HTMLElement>("[data-action='save-draft']")?.addEventListener("click", () => {
      const name = form?.elements.namedItem("name") as HTMLInputElement | null;
      if (!form || !name?.reportValidity()) return;
      this.saveDefinition(form, true);
    });
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.saveDefinition(form, false);
    });
  }

  private setupWizard(root: HTMLElement, form: HTMLFormElement): void {
    const panels = [...root.querySelectorAll<HTMLElement>("[data-wizard-panel]")];
    const steps = [...root.querySelectorAll<HTMLButtonElement>("[data-wizard-step]")];
    const previous = root.querySelector<HTMLButtonElement>("[data-action='previous-step']");
    const next = root.querySelector<HTMLButtonElement>("[data-action='next-step']");
    const finish = root.querySelector<HTMLButtonElement>("[data-action='finish']");
    const current = root.querySelector<HTMLElement>("[data-wizard-current]");
    let activeStep = 0;
    const showStep = (requested: number): void => {
      activeStep = Math.max(0, Math.min(panels.length - 1, requested));
      panels.forEach((panel, index) => { panel.hidden = index !== activeStep; });
      steps.forEach((step, index) => {
        if (index === activeStep) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      if (previous) previous.disabled = activeStep === 0;
      if (next) next.hidden = activeStep === panels.length - 1;
      if (finish) finish.hidden = activeStep !== panels.length - 1;
      if (current) current.textContent = String(activeStep + 1);
      this.updateWizardPreview(root, form);
    };
    steps.forEach((step) => step.addEventListener("click", () => showStep(Number(step.dataset.wizardStep ?? 0))));
    previous?.addEventListener("click", () => showStep(activeStep - 1));
    next?.addEventListener("click", () => showStep(activeStep + 1));
    showStep(0);
  }

  private updateWizardPreview(root: HTMLElement, form: HTMLFormElement): void {
    const ui = uiText();
    const value = (name: string): string => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)?.value.trim() ?? "";
    const setText = (selector: string, text: string): void => { const element = root.querySelector<HTMLElement>(selector); if (element) element.textContent = text; };
    setText("[data-wizard-preview-name]", value("name") || ui.NEW_DEITY_PLACEHOLDER || "New deity");
    setText("[data-wizard-preview-title]", value("title") || "—");
    setText("[data-wizard-preview-description]", value("description") || ui.PREVIEW_EMPTY_DESCRIPTION || "—");
    const quote = root.querySelector<HTMLElement>("[data-wizard-preview-quote]");
    if (quote) { quote.textContent = value("quote"); quote.hidden = !quote.textContent; }
    const status = form.elements.namedItem("status") as HTMLSelectElement | null;
    setText("[data-wizard-preview-status]", status?.selectedOptions[0]?.textContent ?? ui.STATUS_DRAFT ?? "Draft");
    const source = form.elements.namedItem("replacement.sourceUuid") as HTMLSelectElement | null;
    setText("[data-wizard-preview-source]", source?.value ? (source.selectedOptions[0]?.textContent ?? source.value) : "—");
    setText("[data-wizard-preview-bonuses]", String(form.querySelectorAll("[data-bonus-row]").length));
    setText("[data-wizard-preview-abilities]", String(form.querySelectorAll("[data-ability-row]").length));
    const image = root.querySelector<HTMLImageElement>("[data-wizard-preview-image]");
    if (image) image.src = value("image") ? safeImageUrl(value("image")) : "modules/darkis-godforge/assets/logo.png";
  }

  private saveDefinition(form: HTMLFormElement, asDraft: boolean): void {
    requireGM();
    const input = this.readInput(form);
    if (asDraft) input.status = "draft";
    const deity = this.existing ? this.deityService.update(this.existing.id, input) : this.deityService.create(input);
    this.onSaved(deity);
    void this.close?.();
  }

  private appendTemplate(root: HTMLElement | undefined, name: string, targetSelector: string): void {
    const template = this.element?.querySelector<HTMLTemplateElement>(`template[data-template='${name}']`) ?? root?.querySelector<HTMLTemplateElement>(`template[data-template='${name}']`);
    const target = root?.querySelector<HTMLElement>(targetSelector);
    if (!template || !target) return;
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    fragment.querySelector<HTMLSelectElement>("[name$='.visibility']")?.querySelector<HTMLOptionElement>("[value='followers']")?.setAttribute("selected", "selected");
    target.append(fragment);
    this.updateStackingWarnings(root);
    const form = root?.querySelector<HTMLFormElement>("form");
    if (root && form) this.updateWizardPreview(root, form);
  }

  private previewDefinition(form: HTMLFormElement): DeityDefinition {
    const now = new Date().toISOString();
    return { ...this.readInput(form), id: "preview", schemaVersion: CURRENT_SCHEMA_VERSION, revision: 1, createdAt: now, updatedAt: now, checksum: "preview" };
  }

  private populateForm(root: HTMLElement, form: HTMLFormElement, deity: DeityDefinition): void {
    const values: Record<string, string> = {
      name: deity.name, title: deity.title, status: deity.status, description: deity.description, quote: deity.quote ?? "", image: deity.image ?? "", icon: deity.icon ?? "", symbol: deity.symbol ?? "", banner: deity.banner ?? "",
      pantheons: (deity.pantheonIds ?? []).join(", "), domains: deity.domains.join(", "), alternateDomains: (deity.alternateDomains ?? []).join(", "), divineAttributes: (deity.divineAttributes ?? []).join(", "), spells: this.formatSpells(deity.spells), tags: (deity.tags ?? []).join(", "), alignment: deity.alignment ?? "", favoredWeapon: deity.favoredWeapon ?? "",
      font: deity.font ?? "", skill: deity.skill ?? "", sanctification: deity.sanctification ?? "", cause: deity.cause ?? "",
      edicts: (deity.edicts ?? []).join(", "), anathema: (deity.anathema ?? []).join(", "), gmNotes: deity.gmNotes ?? "", "replacement.mode": deity.replacement.mode,
      "replacement.sourceUuid": deity.replacement.sourceUuid, "replacement.contexts": deity.replacement.contexts.join(", "), "visibility.deity": deity.visibility.deity
    };
    for (const [field, level] of Object.entries(deity.visibility.fields)) values[`visibility.fields.${field}`] = level;
    for (const [name, value] of Object.entries(values)) this.setValue(form, name, value);
    for (const key of ["domains", "favoredWeapon", "spells", "sanctification", "skill", "edicts", "anathema"] as const) this.setChecked(form, `replacement.inherit.${key}`, deity.replacement.inherit?.[key] === true);
    this.setChecked(form, "replacement.keepForExistingActors", deity.replacement.keepForExistingActors !== false);
    for (const bonus of deity.passiveBonuses) {
      this.appendTemplate(root, "bonus", "[data-bonus-list]");
      const row = root.querySelector<HTMLElement>("[data-bonus-list] [data-bonus-row]:last-child");
      if (!row) continue;
      this.setValue(row, "bonus.name", bonus.name); this.setValue(row, "bonus.selector", bonus.selector); this.setValue(row, "bonus.value", String(bonus.value)); this.setValue(row, "bonus.modifierType", bonus.modifierType); this.setValue(row, "bonus.appliesTo", bonus.appliesTo ?? "checks"); this.setValue(row, "bonus.condition", bonus.condition ?? ""); this.setValue(row, "bonus.visibility", bonus.visibility ?? "followers");
    }
    for (const ability of deity.abilities) {
      this.appendTemplate(root, "ability", "[data-ability-list]");
      const row = root.querySelector<HTMLElement>("[data-ability-list] [data-ability-row]:last-child");
      if (!row) continue;
      const timing = ability.timing;
      const effect = ability.effects[0];
      this.setValue(row, "ability.name", ability.name); this.setValue(row, "ability.description", ability.description); this.setValue(row, "ability.visibility", ability.visibility ?? "followers");
      this.setValue(row, "ability.actionCost", timing?.actionCost.type ?? "actions"); this.setValue(row, "ability.actions", String(timing?.actionCost.actions ?? ability.actionCost ?? 1)); this.setValue(row, "ability.usageMax", String(timing?.usage.max ?? ability.uses?.max ?? "")); this.setValue(row, "ability.reset", timing?.reset.event ?? ability.uses?.reset ?? "daily-preparations");
      this.setValue(row, "ability.cooldownValue", String(timing?.cooldown?.value ?? 0)); this.setValue(row, "ability.cooldownUnit", timing?.cooldown?.unit ?? "rounds"); this.setValue(row, "ability.durationValue", String(timing?.duration.value ?? ability.duration ?? 0)); this.setValue(row, "ability.durationUnit", timing?.duration.unit ?? "instant");
      this.setValue(row, "ability.effectType", effect?.type === "heal" || effect?.type === "damage" || effect?.type === "modifier" ? effect.type : "message");
      this.setValue(row, "ability.formula", effect && "formula" in effect ? effect.formula : effect?.type === "modifier" ? String(effect.value) : "1"); this.setValue(row, "ability.selector", effect?.type === "modifier" ? effect.selector : "");
    }
    for (const group of deity.grantGroups) this.populateGrantGroup(root, root.querySelector<HTMLElement>("[data-grant-list]"), group);
    this.updateStackingWarnings(root);
  }

  private readInput(form: HTMLFormElement): Omit<DeityDefinition, "id" | "schemaVersion" | "revision" | "createdAt" | "updatedAt" | "checksum"> {
    const data = new FormData(form);
    const visibility = structuredClone(DEFAULT_VISIBILITY);
    visibility.deity = this.visibility(data.get("visibility.deity"), "public");
    for (const field of visibilityFields) visibility.fields[field] = this.visibility(data.get(`visibility.fields.${field}`), visibility.fields[field]);
    return {
      status: this.status(data.get("status")),
      name: this.text(data.get("name")),
      title: this.text(data.get("title")),
      description: this.text(data.get("description")),
      quote: this.optional(data.get("quote")),
      image: this.optional(data.get("image")),
      icon: this.optional(data.get("icon")),
      symbol: this.optional(data.get("symbol")),
      banner: this.optional(data.get("banner")),
      domains: this.list(data.get("domains")),
      alternateDomains: this.list(data.get("alternateDomains")),
      divineAttributes: this.list(data.get("divineAttributes")),
      spells: this.spells(data.get("spells")),
      pantheonIds: this.list(data.get("pantheons")),
      tags: this.list(data.get("tags")),
      alignment: this.optional(data.get("alignment")),
      favoredWeapon: this.optional(data.get("favoredWeapon")),
      font: this.optional(data.get("font")),
      skill: this.optional(data.get("skill")),
      sanctification: this.optional(data.get("sanctification")),
      cause: this.optional(data.get("cause")),
      edicts: this.list(data.get("edicts")),
      anathema: this.list(data.get("anathema")),
      gmNotes: this.optional(data.get("gmNotes")),
      passiveBonuses: this.readBonuses(form),
      abilities: this.readAbilities(form),
      grantGroups: this.readGrantGroups(form),
      replacement: { sourceUuid: this.text(data.get("replacement.sourceUuid")), mode: this.replacementMode(data.get("replacement.mode")), contexts: this.list(data.get("replacement.contexts")), inherit: { domains: data.has("replacement.inherit.domains"), favoredWeapon: data.has("replacement.inherit.favoredWeapon"), spells: data.has("replacement.inherit.spells"), sanctification: data.has("replacement.inherit.sanctification"), skill: data.has("replacement.inherit.skill"), edicts: data.has("replacement.inherit.edicts"), anathema: data.has("replacement.inherit.anathema") }, keepForExistingActors: data.has("replacement.keepForExistingActors") },
      visibility
    };
  }

  private openFilePicker(root: HTMLElement | undefined, button: HTMLButtonElement): void {
    if (!root) return;
    const target = button.dataset.target ?? "";
    const input = root.querySelector<HTMLInputElement>(`[name='${target}']`);
    if (!input) return;
    type Picker = { callback?: ((path: string) => void) | null; render(force?: boolean): Promise<unknown> };
    type PickerConstructor = { new(options?: Record<string, unknown>): Picker; fromButton?: (button: HTMLButtonElement) => Picker };
    const runtime = globalThis as unknown as { foundry?: { applications?: { apps?: { FilePicker?: PickerConstructor } } }; FilePicker?: PickerConstructor };
    const FilePicker = runtime.foundry?.applications?.apps?.FilePicker ?? runtime.FilePicker;
    if (!FilePicker) return;
    const select = (path: string): void => { input.value = path; input.dispatchEvent(new Event("input", { bubbles: true })); };
    const picker = FilePicker.fromButton ? FilePicker.fromButton(button) : new FilePicker({ type: "image", current: input.value, callback: select });
    picker.callback = select;
    void picker.render(true);
  }

  private handleImageDrop(event: DragEvent, field: HTMLElement): void {
    event.preventDefault();
    const raw = event.dataTransfer?.getData("text/plain")?.trim();
    if (!raw) return;
    let path = raw;
    try { const parsed = JSON.parse(raw) as { path?: unknown; src?: unknown }; path = typeof parsed.path === "string" ? parsed.path : typeof parsed.src === "string" ? parsed.src : ""; } catch { /* Plain Foundry file path. */ }
    if (!path) return;
    const input = field.querySelector<HTMLInputElement>("[data-image-input]");
    if (!input) return;
    input.value = path;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  private updateImagePreview(root: HTMLElement, field: string, value: string): void {
    const preview = root.querySelector<HTMLImageElement>(`[data-image-preview='${field}']`);
    if (!preview) return;
    const path = value.trim();
    preview.hidden = !path;
    if (path) preview.src = safeImageUrl(path);
    else preview.removeAttribute("src");
  }

  private readBonuses(form: HTMLFormElement): PassiveBonusDefinition[] {
    return [...form.querySelectorAll<HTMLElement>("[data-bonus-row]")].flatMap((row) => {
      const name = this.input(row, "bonus.name");
      const selector = this.input(row, "bonus.selector");
      if (!name && !selector) return [];
      const rawValue = this.input(row, "bonus.value");
      const numericValue = Number(rawValue);
      return [{
        id: crypto.randomUUID(),
        name,
        selector,
        value: rawValue !== "" && Number.isFinite(numericValue) ? numericValue : rawValue,
        modifierType: this.modifierType(this.input(row, "bonus.modifierType")),
        appliesTo: this.appliesTo(this.input(row, "bonus.appliesTo")),
        condition: this.input(row, "bonus.condition") || undefined,
        visibility: this.visibility(this.input(row, "bonus.visibility"), "followers"),
        enabled: true
      }];
    });
  }

  private readAbilities(form: HTMLFormElement): AbilityDefinition[] {
    return [...form.querySelectorAll<HTMLElement>("[data-ability-row]")].flatMap((row) => {
      const name = this.input(row, "ability.name");
      if (!name) return [];
      const description = this.input(row, "ability.description");
      const maxText = this.input(row, "ability.usageMax");
      const max = maxText === "" ? null : Math.max(0, Number(maxText));
      const reset = this.resetType(this.input(row, "ability.reset"));
      const cooldownValue = Math.max(0, Number(this.input(row, "ability.cooldownValue") || 0));
      const durationValue = Math.max(0, Number(this.input(row, "ability.durationValue") || 0));
      const effectType = this.input(row, "ability.effectType");
      const formula = this.input(row, "ability.formula") || "0";
      const effects: AbilityDefinition["effects"] = effectType === "heal" || effectType === "damage"
        ? [{ type: effectType, formula, target: "target" }]
        : effectType === "modifier"
          ? [{ type: "modifier", selector: this.input(row, "ability.selector") || "all", value: formula, modifierType: "status", duration: durationValue }]
          : [{ type: "message", text: description }];
      return [{
        id: crypto.randomUUID(),
        name,
        description,
        visibility: this.visibility(this.input(row, "ability.visibility"), "followers"),
        enabled: true,
        uses: max === null ? undefined : { max, reset },
        timing: {
          actionCost: { type: this.actionCost(this.input(row, "ability.actionCost")), actions: Number(this.input(row, "ability.actions") || 0) || undefined },
          usage: { max, period: max === null ? "unlimited" : "reset" },
          reset: { event: reset },
          cooldown: cooldownValue > 0 ? { value: cooldownValue, unit: this.cooldownUnit(this.input(row, "ability.cooldownUnit")) } : null,
          duration: { value: durationValue, unit: this.durationUnit(this.input(row, "ability.durationUnit")) }
        },
        effects
      }];
    });
  }

  private readGrantGroups(form: HTMLFormElement): GrantGroup[] {
    const list = form.querySelector<HTMLElement>("[data-grant-list]");
    if (!list) return [];
    return [...list.children].flatMap((child) => child instanceof HTMLElement && child.matches("[data-grant-group]") ? [this.readGrantGroup(child)] : []);
  }

  private readGrantGroup(row: HTMLElement): GrantGroup {
    const members = row.querySelector<HTMLElement>(":scope > [data-grant-members]");
    const grants: GrantMember[] = [];
    for (const child of members?.children ?? []) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.matches("[data-grant-group]")) { grants.push(this.readGrantGroup(child)); continue; }
      if (!child.matches("[data-grant-member]")) continue;
      const ref = this.input(child, "grant.ref");
      if (!ref) continue;
      const overrideName = this.input(child, "grant.overrideName");
      const overrideDescription = this.input(child, "grant.overrideDescription");
      const overrideValue = this.input(child, "grant.overrideValue");
      const numericValue = Number(overrideValue);
      const overrides = overrideName || overrideDescription || overrideValue ? { name: overrideName || undefined, description: overrideDescription || undefined, value: overrideValue ? (Number.isFinite(numericValue) ? numericValue : overrideValue) : undefined } : undefined;
      grants.push({ type: this.input(child, "grant.type") === "bonus" ? "bonus" : "ability", ref, overrides });
    }
    const mode = this.input(row, "grantGroup.mode") === "any" ? "any" as const : "all" as const;
    const pick = Number(this.input(row, "grantGroup.pick") || 1);
    return { id: this.input(row, "grantGroup.id") || crypto.randomUUID(), label: this.input(row, "grantGroup.label"), mode, pick: mode === "any" ? Math.max(1, pick) : undefined, grants };
  }

  private populateGrantGroup(root: HTMLElement, target: HTMLElement | null, group: GrantGroup): void {
    const template = root.querySelector<HTMLTemplateElement>("template[data-template='grant-group']");
    if (!template || !target) return;
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const row = fragment.querySelector<HTMLElement>("[data-grant-group]");
    if (!row) return;
    this.setValue(row, "grantGroup.id", group.id); this.setValue(row, "grantGroup.label", group.label); this.setValue(row, "grantGroup.mode", group.mode); this.setValue(row, "grantGroup.pick", String(group.pick ?? 1));
    const members = row.querySelector<HTMLElement>(":scope > [data-grant-members]");
    for (const grant of group.grants) {
      if ("mode" in grant) { this.populateGrantGroup(root, members, grant); continue; }
      const memberTemplate = root.querySelector<HTMLTemplateElement>("template[data-template='grant-member']");
      if (!memberTemplate || !members) continue;
      const memberFragment = memberTemplate.content.cloneNode(true) as DocumentFragment;
      const member = memberFragment.querySelector<HTMLElement>("[data-grant-member]");
      if (!member) continue;
      this.setValue(member, "grant.type", grant.type); this.setValue(member, "grant.ref", grant.ref); this.setValue(member, "grant.overrideName", grant.overrides?.name ?? ""); this.setValue(member, "grant.overrideDescription", grant.overrides?.description ?? ""); this.setValue(member, "grant.overrideValue", grant.overrides?.value === undefined ? "" : String(grant.overrides.value));
      members.append(memberFragment);
    }
    target.append(fragment);
  }

  private input(row: HTMLElement, name: string): string { return (row.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name='${name}']`)?.value ?? "").trim(); }
  private setValue(root: ParentNode, name: string, value: string): void { const field = root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name='${name}']`); if (field) field.value = value; }
  private setChecked(root: ParentNode, name: string, checked: boolean): void { const field = root.querySelector<HTMLInputElement>(`[name='${name}']`); if (field) field.checked = checked; }
  private updateStackingWarnings(root: HTMLElement | undefined): void {
    if (!root) return;
    const rows = [...root.querySelectorAll<HTMLElement>("[data-bonus-row]")];
    const duplicateSelectors = new Set(rows.filter((row) => this.input(row, "bonus.modifierType") === "status").map((row) => this.input(row, "bonus.selector")).filter((selector, index, values) => selector && values.indexOf(selector) !== index));
    for (const row of rows) { const warning = row.querySelector<HTMLElement>("[data-stacking-warning]"); if (warning) warning.hidden = !duplicateSelectors.has(this.input(row, "bonus.selector")); }
  }
  private text(value: FormDataEntryValue | null): string { return String(value ?? "").trim(); }
  private optional(value: FormDataEntryValue | null): string | undefined { return this.text(value) || undefined; }
  private list(value: FormDataEntryValue | null): string[] { return this.text(value).split(",").map((item) => item.trim()).filter(Boolean); }
  private spells(value: FormDataEntryValue | null): Record<string, string> { return Object.fromEntries(this.text(value).split(/[\n,]+/).map((item) => item.trim()).flatMap((item) => { const match = item.match(/^([1-9]|10)\s*=\s*(.+)$/); return match ? [[match[1]!, match[2]!.trim()]] : []; })); }
  private formatSpells(value: Record<string, string> | undefined): string { return Object.entries(value ?? {}).sort(([left], [right]) => Number(left) - Number(right)).map(([rank, uuid]) => `${rank}=${uuid}`).join("\n"); }
  private visibility(value: FormDataEntryValue | string | null, fallback: VisibilityLevel): VisibilityLevel { const text = String(value ?? ""); return text === "public" || text === "selection" || text === "followers" || text === "owner" || text === "trusted" || text === "gm" || text === "hidden-until-selected" ? text : fallback; }
  private status(value: FormDataEntryValue | null): DeityDefinition["status"] { const text = String(value ?? ""); return text === "test" || text === "published" || text === "disabled" || text === "archived" ? text : "draft"; }
  private replacementMode(value: FormDataEntryValue | null): DeityDefinition["replacement"]["mode"] { const text = String(value ?? ""); return text === "replace" || text === "hide" ? text : "none"; }
  private modifierType(value: string): PassiveBonusDefinition["modifierType"] { return value === "item" || value === "circumstance" || value === "untyped" ? value : "status"; }
  private appliesTo(value: string): NonNullable<PassiveBonusDefinition["appliesTo"]> { return value === "dc" || value === "both" ? value : "checks"; }
  private resetType(value: string): NonNullable<AbilityDefinition["uses"]>["reset"] { return value === "ten-minute-rest" || value === "refocus" || value === "encounter-end" || value === "scene-change" || value === "calendar-day" || value === "calendar-week" || value === "calendar-month" || value === "calendar-year" || value === "custom-rest" || value === "manual" || value === "daily" || value === "weekly" || value === "encounter" ? value : "daily-preparations"; }
  private actionCost(value: string): NonNullable<AbilityDefinition["timing"]>["actionCost"]["type"] { return value === "automatic" || value === "free" || value === "reaction" || value === "exploration" || value === "downtime" || value === "custom" ? value : "actions"; }
  private cooldownUnit(value: string): "rounds" | "minutes" | "hours" | "days" { return value === "minutes" || value === "hours" || value === "days" ? value : "rounds"; }
  private durationUnit(value: string): NonNullable<AbilityDefinition["timing"]>["duration"]["unit"] { return value === "rounds" || value === "minutes" || value === "hours" || value === "encounter" || value === "scene" || value === "until-reset" ? value : "instant"; }
}
