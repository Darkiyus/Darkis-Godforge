import { AdapterRegistry } from "../adapters/adapter-registry";
import type { DeityService } from "../core/deity-service";
import { DEFAULT_VISIBILITY, type AbilityDefinition, type DeityDefinition, type EffectNode, type GrantGroup, type GrantMember, type ImagePresentation, type PassiveBonusDefinition, type VisibilityFields, type VisibilityLevel } from "../core/types";
import type { SystemEditorCatalog } from "../adapters/adapter.interface";
import { evaluateFormula } from "../core/formula-service";
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
    let systemCatalog: SystemEditorCatalog = { skills: selectors.map((value) => ({ value, label: value })), domains: [], weapons: [], spells: [], fonts: [], sanctifications: [], attributes: [] };
    let officialDeities: Awaited<ReturnType<NonNullable<typeof adapter>["listOfficialDeities"]>> = [];
    try { officialDeities = await (adapter?.listOfficialDeities() ?? Promise.resolve([])); }
    catch (error) { console.error("Darkis GodForge | Could not load official deities for the editor.", error); }
    try { if (adapter) systemCatalog = await adapter.listEditorCatalog(); }
    catch (error) { console.error("Darkis GodForge | Could not load system choices for the editor.", error); }
    const selectedSource = this.existing?.replacement.sourceUuid ?? "";
    const officialOptions = officialDeities.map((deity) => ({ ...deity, selected: deity.sourceUuid === selectedSource }));
    if (selectedSource && !officialOptions.some((deity) => deity.sourceUuid === selectedSource)) officialOptions.push({ id: selectedSource, sourceUuid: selectedSource, official: true, name: selectedSource, title: selectedSource, domains: [], selected: true });
    const ui = uiText();
    return {
      ui: { ...ui, NEW_DEITY: this.existing ? ui.EDIT_DEITY : ui.NEW_DEITY },
      selectors,
      systemCatalog,
      pantheonOptions: this.deityService.list().flatMap((deity) => deity.pantheons ?? []).filter((pantheon, index, values) => values.findIndex((entry) => entry.id === pantheon.id) === index).map((pantheon) => ({ ...pantheon, selected: this.existing?.pantheonIds?.includes(pantheon.id) === true })),
      officialDeities: officialOptions,
      visibilityFields: visibilityFields.map((key) => ({ key, label: ui[`VIS_FIELD_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? key })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((value) => ({ value, label: ui[`VIS_${value.replaceAll("-", "_").toUpperCase()}`] ?? value }))
    };
  }

  _onRender(): void {
    requireGM();
    const root = this.element;
    const form = root?.querySelector<HTMLFormElement>("form");
    let dirty = false;
    if (root && form && this.existing) this.populateForm(root, form, this.existing);
    if (root && form) this.setupWizard(root, form);
    root?.querySelectorAll<HTMLButtonElement>("[data-action='browse-image']").forEach((button) => button.addEventListener("click", () => this.openFilePicker(root, button)));
    root?.querySelectorAll<HTMLElement>("[data-image-field]").forEach((field) => {
      field.addEventListener("dragover", (event) => { event.preventDefault(); event.dataTransfer!.dropEffect = "copy"; });
      field.addEventListener("drop", (event) => this.handleImageDrop(event, field));
    });
    root?.querySelector<HTMLElement>("[data-action='close']")?.addEventListener("click", () => { if (dirty && !globalThis.confirm("Ungespeicherte Änderungen verwerfen? / Discard unsaved changes?")) return; void this.close?.(); });
    root?.querySelector<HTMLElement>("[data-action='add-bonus']")?.addEventListener("click", () => this.appendTemplate(root, "bonus", "[data-bonus-list]"));
    root?.querySelector<HTMLElement>("[data-action='add-ability']")?.addEventListener("click", () => this.appendTemplate(root, "ability", "[data-ability-list]"));
    root?.querySelector<HTMLElement>("[data-action='add-grant-group']")?.addEventListener("click", () => this.appendTemplate(root, "grant-group", "[data-grant-list]"));
    root?.addEventListener("click", (event) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
      if (!button) return;
      if (button.dataset.action === "add-catalog-spell" && form) { this.addCatalogSpell(form); return; }
      if (button.dataset.action === "generate-image-variants" && form) { void this.generateImageVariants(form, button as HTMLButtonElement); return; }
      if (button.dataset.action === "scroll-steps-left" || button.dataset.action === "scroll-steps-right") { root.querySelector<HTMLElement>(".dg-step-strip")?.scrollBy({ left: button.dataset.action.endsWith("right") ? 260 : -260, behavior: "smooth" }); return; }
      const card = button?.closest<HTMLElement>(".dg-editor-card");
      if (!card) return;
      if (button.dataset.action === "add-grant-member") this.appendTemplate(card, "grant-member", ":scope > [data-grant-members]");
      if (button.dataset.action === "add-subgroup") this.appendTemplate(card, "grant-group", ":scope > [data-grant-members]");
      if (button.dataset.action === "add-effect") this.appendTemplate(card, "effect", ":scope > [data-effect-list]");
      if (button.dataset.action === "remove-row") card.remove();
      if (button.dataset.action === "duplicate-row") card.after(card.cloneNode(true));
      if (button.dataset.action === "move-up" && card.previousElementSibling) card.parentElement?.insertBefore(card, card.previousElementSibling);
      if (button.dataset.action === "move-down" && card.nextElementSibling) card.parentElement?.insertBefore(card.nextElementSibling, card);
      this.updateStackingWarnings(root);
      if (form) this.updateWizardPreview(root, form);
    });
    root?.addEventListener("input", (event) => { dirty = true; this.updateStackingWarnings(root); const input = event.target as HTMLInputElement; if (input.matches("[data-image-input]")) this.updateImagePreview(root, input.name, input.value); if (input.matches("[data-formula]")) this.validateFormulaField(input); if (input.matches("[data-catalog-search]")) this.filterCatalog(input); if (form) this.updateWizardPreview(root, form); });
    root?.addEventListener("change", (event) => {
      dirty = true;
      const target = event.target as HTMLInputElement | HTMLSelectElement;
      if (target.name === "replacement.sourceUuid" && form) {
        const mode = form.elements.namedItem("replacement.mode") as HTMLSelectElement | null;
        if (mode) mode.value = target.value ? "replace" : "none";
        if (target.value) form.querySelectorAll<HTMLInputElement>("[name^='replacement.inherit.']").forEach((checkbox) => { checkbox.checked = checkbox.name !== "replacement.inherit.edicts" && checkbox.name !== "replacement.inherit.anathema"; });
      }
      if (target.matches("[data-weapon-picker]") && form) {
        const option = (target as HTMLSelectElement).selectedOptions[0];
        const slug = form.elements.namedItem("favoredWeapon") as HTMLInputElement | null;
        const uuid = form.elements.namedItem("favoredWeaponUuid") as HTMLInputElement | null;
        if (slug) slug.value = option?.dataset.slug ?? "";
        if (uuid) uuid.value = target.value;
      }
      if (target.matches("[data-image-setting]")) this.updateImagePresentationPreview(root, target.dataset.imageSetting ?? "");
      if (form) this.updateWizardPreview(root, form);
    });
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
        step.classList.toggle("completed", index < activeStep);
        if (index === activeStep) step.setAttribute("aria-current", "step");
        else step.removeAttribute("aria-current");
      });
      if (previous) previous.disabled = activeStep === 0;
      if (next) next.hidden = activeStep === panels.length - 1;
      if (finish) finish.hidden = activeStep !== panels.length - 1;
      if (current) current.textContent = String(activeStep + 1);
      steps[activeStep]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
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
      pantheons: (deity.pantheonIds ?? []).join(", "), domains: deity.domains.join(", "), alternateDomains: (deity.alternateDomains ?? []).join(", "), divineAttributes: (deity.divineAttributes ?? []).join(", "), spells: this.formatSpells(deity.spells), tags: (deity.tags ?? []).join(", "), alignment: deity.alignment ?? "", favoredWeapon: deity.favoredWeapon ?? "", favoredWeaponUuid: deity.favoredWeaponUuid ?? "",
      font: deity.font ?? "", skill: deity.skill ?? "", sanctification: deity.sanctification ?? "", cause: deity.cause ?? "",
      edicts: (deity.edicts ?? []).join(", "), anathema: (deity.anathema ?? []).join(", "), gmNotes: deity.gmNotes ?? "", "replacement.mode": deity.replacement.mode,
      "replacement.sourceUuid": deity.replacement.sourceUuid, "replacement.contexts": deity.replacement.contexts.join(", "), "visibility.deity": deity.visibility.deity
    };
    for (const [field, level] of Object.entries(deity.visibility.fields)) values[`visibility.fields.${field}`] = level;
    for (const key of ["image", "icon", "symbol", "banner"] as const) {
      const presentation = deity.imagePresentation?.[key];
      values[`imagePresentation.${key}.fit`] = presentation?.fit ?? "cover";
      values[`imagePresentation.${key}.focusX`] = String(presentation?.focusX ?? 50);
      values[`imagePresentation.${key}.focusY`] = String(presentation?.focusY ?? 25);
      values[`imagePresentation.${key}.zoom`] = String(presentation?.zoom ?? 1);
      values[`imagePresentation.${key}.rotation`] = String(presentation?.rotation ?? 0);
    }
    for (const [name, value] of Object.entries(values)) this.setValue(form, name, value);
    for (const key of ["domains", "favoredWeapon", "spells", "sanctification", "skill", "font", "divineAttributes", "edicts", "anathema"] as const) this.setChecked(form, `replacement.inherit.${key}`, deity.replacement.inherit?.[key] === true);
    this.setChecked(form, "replacement.keepForExistingActors", deity.replacement.keepForExistingActors !== false);
    this.setChecked(form, "visibility.showMechanicsInSelection", deity.visibility.showMechanicsInSelection === true);
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
      this.setValue(row, "ability.name", ability.name); this.setValue(row, "ability.description", ability.description); this.setValue(row, "ability.visibility", ability.visibility ?? "followers");
      this.setValue(row, "ability.abilityType", ability.abilityType ?? "standard");
      this.setValue(row, "ability.actionCost", timing?.actionCost.type ?? "actions"); this.setValue(row, "ability.actions", String(timing?.actionCost.actions ?? ability.actionCost ?? 1)); this.setValue(row, "ability.usageMax", String(timing?.usage.max ?? ability.uses?.max ?? "")); this.setValue(row, "ability.reset", timing?.reset.event ?? ability.uses?.reset ?? "daily-preparations");
      this.setValue(row, "ability.cooldownValue", String(timing?.cooldown?.value ?? 0)); this.setValue(row, "ability.cooldownUnit", timing?.cooldown?.unit ?? "rounds"); this.setValue(row, "ability.durationValue", String(timing?.duration.value ?? ability.duration ?? 0)); this.setValue(row, "ability.durationUnit", timing?.duration.unit ?? "instant");
      for (const effect of ability.effects) this.populateEffect(row, effect);
    }
    for (const group of deity.grantGroups) this.populateGrantGroup(root, root.querySelector<HTMLElement>("[data-grant-list]"), group);
    this.updateStackingWarnings(root);
  }

  private readInput(form: HTMLFormElement): Omit<DeityDefinition, "id" | "schemaVersion" | "revision" | "createdAt" | "updatedAt" | "checksum"> {
    const data = new FormData(form);
    const visibility = structuredClone(DEFAULT_VISIBILITY);
    visibility.deity = this.visibility(data.get("visibility.deity"), "public");
    visibility.showMechanicsInSelection = data.has("visibility.showMechanicsInSelection");
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
      imagePresentation: this.readImagePresentation(data),
      domains: this.list(data.get("domains")),
      alternateDomains: this.list(data.get("alternateDomains")),
      divineAttributes: this.list(data.get("divineAttributes")),
      spells: this.spells(data.get("spells")),
      pantheonIds: this.readPantheonIds(data),
      pantheons: this.readPantheons(data),
      tags: this.list(data.get("tags")),
      alignment: this.optional(data.get("alignment")),
      favoredWeapon: this.optional(data.get("favoredWeapon")),
      favoredWeaponUuid: this.optional(data.get("favoredWeaponUuid")),
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
      replacement: { sourceUuid: this.text(data.get("replacement.sourceUuid")), mode: this.text(data.get("replacement.sourceUuid")) ? this.replacementMode(data.get("replacement.mode")) === "hide" ? "hide" : "replace" : "none", contexts: this.list(data.get("replacement.contexts")), inherit: { domains: data.has("replacement.inherit.domains"), favoredWeapon: data.has("replacement.inherit.favoredWeapon"), spells: data.has("replacement.inherit.spells"), sanctification: data.has("replacement.inherit.sanctification"), skill: data.has("replacement.inherit.skill"), font: data.has("replacement.inherit.font"), divineAttributes: data.has("replacement.inherit.divineAttributes"), edicts: data.has("replacement.inherit.edicts"), anathema: data.has("replacement.inherit.anathema") }, keepForExistingActors: data.has("replacement.keepForExistingActors") },
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
    this.updateImagePresentationPreview(root, field);
  }

  private updateImagePresentationPreview(root: HTMLElement, field: string): void {
    if (!field) return;
    const preview = root.querySelector<HTMLImageElement>(`[data-image-preview='${field}']`);
    if (!preview) return;
    const value = (suffix: string, fallback: string): string => (root.querySelector<HTMLInputElement | HTMLSelectElement>(`[name='imagePresentation.${field}.${suffix}']`)?.value ?? fallback);
    preview.style.objectFit = value("fit", "cover") === "contain" ? "contain" : "cover";
    preview.style.objectPosition = `${value("focusX", "50")}% ${value("focusY", "25")}%`;
    preview.style.transform = `scale(${value("zoom", "1")}) rotate(${value("rotation", "0")}deg)`;
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
      const effects = [...row.querySelectorAll<HTMLElement>("[data-effect-row]")].map((effectRow) => this.readEffect(effectRow, durationValue));
      return [{
        id: crypto.randomUUID(),
        name,
        description,
        visibility: this.visibility(this.input(row, "ability.visibility"), "followers"),
        enabled: true,
        abilityType: this.input(row, "ability.abilityType") === "fortune-wheel" ? "fortune-wheel" : "standard",
        uses: max === null ? undefined : { max, reset },
        timing: {
          actionCost: { type: this.actionCost(this.input(row, "ability.actionCost")), actions: Number(this.input(row, "ability.actions") || 0) || undefined },
          usage: { max, period: max === null ? "unlimited" : "reset" },
          reset: { event: reset },
          cooldown: cooldownValue > 0 ? { value: cooldownValue, unit: this.cooldownUnit(this.input(row, "ability.cooldownUnit")) } : null,
          duration: { value: durationValue, unit: this.durationUnit(this.input(row, "ability.durationUnit")) }
        },
        effects: effects.length ? effects : [{ type: "message", text: description }]
      }];
    });
  }

  private readEffect(row: HTMLElement, defaultDuration: number): EffectNode {
    const type = this.input(row, "effect.type");
    const formula = this.input(row, "effect.formula") || "1";
    const selector = this.input(row, "effect.selector") || "all";
    const target = this.effectTarget(this.input(row, "effect.target"));
    const aux = this.input(row, "effect.aux");
    const operation = this.input(row, "effect.operation");
    if (type === "heal" || type === "damage") return { type, formula, target };
    if (type === "modifier") return { type, selector, value: formula, modifierType: this.modifierType(this.input(row, "effect.modifierType")), target, duration: Math.max(0, Number(this.input(row, "effect.duration") || defaultDuration)) };
    if (type === "condition") return { type, condition: aux || selector, target, operation: operation === "remove" || operation === "suppress" ? operation : "add", duration: Math.max(0, Number(this.input(row, "effect.duration") || defaultDuration)) };
    if (type === "roll") return { type, roll: operation === "check" || operation === "saving-throw" || operation === "degree-of-success" ? operation : "reroll", selector, dc: formula, keep: aux === "higher" || aux === "lower" ? aux : "new", target };
    if (type === "movement") return { type, mode: operation === "teleport" || operation === "forced" ? operation : "step", distance: formula, target };
    if (type === "action") return { type, operation: operation === "repeat" ? "repeat" : "lose", amount: Math.max(1, Number(formula) || 1), target };
    if (type === "control") return { type, faction: operation === "friendly" || operation === "neutral" ? operation : "hostile", target, save: selector, bossImmune: aux !== "allow-boss" };
    if (type === "resource") return { type, resource: operation === "gold" || operation === "item" ? operation : "hp", operation: aux === "remove" || aux === "transfer" ? aux : "add", formula, target, itemUuid: this.input(row, "effect.uuid") || undefined };
    if (type === "information") return { type, mode: operation === "reveal" || operation === "truth" ? operation : "gm-dialog", text: aux || undefined, questions: Math.max(1, Number(formula) || 1) };
    if (type === "counter") return { type, key: selector, operation: operation === "set" || operation === "require" ? operation : "add", value: formula };
    if (type === "choice") return { type, prompt: aux || "Choose", options: selector.split(",").map((label) => label.trim()).filter(Boolean).map((label) => ({ id: crypto.randomUUID(), label, effects: [{ type: "message", text: label }] })) };
    if (type === "random-wheel") return { type, tableId: this.input(row, "effect.uuid") || selector, visibility: operation === "gm" || operation === "user" ? operation : "public" };
    if (type === "macro") return { type, command: this.input(row, "effect.code") || aux };
    return { type: "message", text: aux || formula };
  }

  private populateEffect(abilityRow: HTMLElement, effect: EffectNode): void {
    this.appendTemplate(abilityRow, "effect", ":scope > [data-effect-list]");
    const row = abilityRow.querySelector<HTMLElement>("[data-effect-list] [data-effect-row]:last-child");
    if (!row) return;
    this.setValue(row, "effect.type", effect.type);
    if ("target" in effect) this.setValue(row, "effect.target", effect.target ?? "self");
    if ("formula" in effect) this.setValue(row, "effect.formula", String(effect.formula));
    if (effect.type === "modifier") { this.setValue(row, "effect.formula", String(effect.value)); this.setValue(row, "effect.selector", effect.selector); this.setValue(row, "effect.modifierType", effect.modifierType); this.setValue(row, "effect.duration", String(effect.duration ?? 0)); }
    if (effect.type === "condition") { this.setValue(row, "effect.aux", effect.condition); this.setValue(row, "effect.operation", effect.operation ?? "add"); this.setValue(row, "effect.duration", String(effect.duration ?? 0)); }
    if (effect.type === "message") this.setValue(row, "effect.aux", effect.text);
    if (effect.type === "macro") this.setValue(row, "effect.code", effect.command);
    if (effect.type === "random-wheel") { this.setValue(row, "effect.uuid", effect.tableId); this.setValue(row, "effect.operation", effect.visibility); }
  }

  private readImagePresentation(data: FormData): DeityDefinition["imagePresentation"] {
    const result: DeityDefinition["imagePresentation"] = {};
    for (const key of ["image", "icon", "symbol", "banner"] as const) result[key] = {
      fit: this.text(data.get(`imagePresentation.${key}.fit`)) === "contain" ? "contain" : "cover",
      focusX: this.clampNumber(data.get(`imagePresentation.${key}.focusX`), 50, 0, 100),
      focusY: this.clampNumber(data.get(`imagePresentation.${key}.focusY`), 25, 0, 100),
      zoom: this.clampNumber(data.get(`imagePresentation.${key}.zoom`), 1, 1, 3),
      rotation: this.clampNumber(data.get(`imagePresentation.${key}.rotation`), 0, -180, 180)
    };
    return result;
  }

  private readPantheonIds(data: FormData): string[] {
    const selected = data.getAll("pantheon.selected").map(String).filter(Boolean);
    const legacy = this.list(data.get("pantheons"));
    const name = this.text(data.get("pantheon.new.name"));
    if (name) selected.push(this.pantheonId(name));
    return [...new Set([...selected, ...legacy])];
  }

  private readPantheons(data: FormData): DeityDefinition["pantheons"] {
    const selected = new Set(data.getAll("pantheon.selected").map(String));
    const known = this.deityService.list().flatMap((deity) => deity.pantheons ?? []).filter((pantheon) => selected.has(pantheon.id));
    const name = this.text(data.get("pantheon.new.name"));
    if (name) known.push({ id: this.pantheonId(name), name, color: this.text(data.get("pantheon.new.color")) || "#8f38e8", symbol: this.optional(data.get("pantheon.new.symbol")), order: this.clampNumber(data.get("pantheon.new.order"), 0, 0, 999) });
    return [...new Map(known.map((pantheon) => [pantheon.id, pantheon])).values()];
  }

  private pantheonId(name: string): string { return `pantheon-${name.toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`; }

  private addCatalogSpell(form: HTMLFormElement): void {
    const picker = form.querySelector<HTMLSelectElement>("[data-spell-picker]");
    const textarea = form.elements.namedItem("spells") as HTMLTextAreaElement | null;
    const option = picker?.selectedOptions[0];
    if (!picker?.value || !textarea || !option) return;
    const rank = option.dataset.rank ?? "1";
    const line = `${rank}=${picker.value}`;
    const lines = textarea.value.split(/\r?\n/).filter(Boolean);
    const existingIndex = lines.findIndex((entry) => entry.startsWith(`${rank}=`));
    if (existingIndex >= 0) lines[existingIndex] = line; else lines.push(line);
    textarea.value = lines.join("\n");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  private async generateImageVariants(form: HTMLFormElement, button: HTMLButtonElement): Promise<void> {
    const source = (form.elements.namedItem("image") as HTMLInputElement | null)?.value.trim() ?? "";
    const status = form.querySelector<HTMLElement>("[data-variant-status]");
    if (!source) { if (status) status.textContent = "Bitte zuerst ein Porträt auswählen. / Select a portrait first."; return; }
    type UploadResult = { path?: string; url?: string };
    type UploadPicker = { createDirectory?(source: string, target: string): Promise<unknown>; upload(source: string, path: string, file: File, body?: object, options?: { notify?: boolean }): Promise<UploadResult> };
    const runtime = globalThis as unknown as { foundry?: { applications?: { apps?: { FilePicker?: UploadPicker } } }; FilePicker?: UploadPicker };
    const FilePicker = runtime.foundry?.applications?.apps?.FilePicker ?? runtime.FilePicker;
    if (!FilePicker?.upload) { if (status) status.textContent = "Der Foundry-Dateiupload ist nicht verfügbar. / File upload is unavailable."; return; }
    button.disabled = true;
    if (status) status.textContent = "Varianten werden erzeugt … / Creating variants …";
    try {
      try { await FilePicker.createDirectory?.("data", "darkis-godforge"); } catch { /* The shared directory already exists. */ }
      const image = await this.loadImage(safeImageUrl(source));
      const base = ((form.elements.namedItem("name") as HTMLInputElement | null)?.value || source.split("/").pop() || "deity").replace(/\.[^.]+$/, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deity";
      const variants = [{ key: "icon", width: 512, height: 512 }, { key: "symbol", width: 1024, height: 1024 }, { key: "banner", width: 1600, height: 600 }] as const;
      const completed: string[] = [];
      for (const variant of variants) {
        const enabled = form.elements.namedItem(`variant.${variant.key}`) as HTMLInputElement | null;
        if (!enabled?.checked) continue;
        const blob = await this.renderImageVariant(image, variant.width, variant.height, this.imagePresentationFromForm(form, variant.key));
        const file = new File([blob], `${base}-${variant.key}.webp`, { type: "image/webp" });
        const uploaded = await FilePicker.upload("data", "darkis-godforge", file, {}, { notify: false });
        const path = uploaded.path ?? uploaded.url ?? `darkis-godforge/${file.name}`;
        const input = form.elements.namedItem(variant.key) as HTMLInputElement | null;
        if (input) { input.value = path; input.dispatchEvent(new Event("input", { bubbles: true })); }
        completed.push(variant.key);
      }
      if (status) status.textContent = completed.length ? `✓ ${completed.join(", ")}` : "Keine Variante gewählt. / No variant selected.";
    } catch (error) { console.error("Darkis GodForge | Could not create image variants.", error); if (status) status.textContent = "Bildvarianten konnten nicht erzeugt werden. Prüfe Dateirechte und Browserkonsole."; }
    finally { button.disabled = false; }
  }

  private loadImage(source: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("The portrait could not be loaded.")); image.src = source; }); }
  private imagePresentationFromForm(form: HTMLFormElement, key: "icon" | "symbol" | "banner"): ImagePresentation { const value = (suffix: string, fallback: number): number => this.clampNumber((form.elements.namedItem(`imagePresentation.${key}.${suffix}`) as HTMLInputElement | null)?.value ?? null, fallback, suffix === "rotation" ? -180 : suffix === "zoom" ? 1 : 0, suffix === "rotation" ? 180 : suffix === "zoom" ? 3 : 100); return { fit: (form.elements.namedItem(`imagePresentation.${key}.fit`) as HTMLSelectElement | null)?.value === "contain" ? "contain" : "cover", focusX: value("focusX", 50), focusY: value("focusY", 25), zoom: value("zoom", 1), rotation: value("rotation", 0) }; }
  private renderImageVariant(image: HTMLImageElement, width: number, height: number, presentation: ImagePresentation): Promise<Blob> { const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const context = canvas.getContext("2d"); if (!context) return Promise.reject(new Error("Canvas is unavailable.")); context.clearRect(0, 0, width, height); const scale = (presentation.fit === "contain" ? Math.min(width / image.naturalWidth, height / image.naturalHeight) : Math.max(width / image.naturalWidth, height / image.naturalHeight)) * (presentation.zoom ?? 1); context.translate(width / 2, height / 2); context.rotate((presentation.rotation ?? 0) * Math.PI / 180); context.scale(scale, scale); context.drawImage(image, -(presentation.focusX / 100) * image.naturalWidth, -(presentation.focusY / 100) * image.naturalHeight); return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image encoding failed.")), "image/webp", 0.9)); }

  private validateFormulaField(input: HTMLInputElement): void { const status = input.parentElement?.querySelector<HTMLElement>("[data-formula-status]"); if (!status) return; try { evaluateFormula(input.value.replace(/\b\d+d\d+\b/gi, "1"), { actor: { level: 1 }, target: {} }); status.textContent = "✓"; status.dataset.valid = "true"; } catch { status.textContent = "!"; status.dataset.valid = "false"; } }
  private filterCatalog(input: HTMLInputElement): void { const target = this.element?.querySelector<HTMLSelectElement>(`[data-catalog='${input.dataset.catalogSearch ?? ""}']`); if (!target) return; const query = input.value.toLocaleLowerCase(); for (const option of target.options) option.hidden = Boolean(query) && !option.textContent?.toLocaleLowerCase().includes(query); }

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
    const trainedSkill = (root.querySelector<HTMLSelectElement>("[name='skill']")?.value ?? "").trim();
    const duplicateSelectors = new Set(rows.filter((row) => this.input(row, "bonus.modifierType") === "status").map((row) => this.input(row, "bonus.selector")).filter((selector, index, values) => selector && values.indexOf(selector) !== index));
    for (const row of rows) { const selector = this.input(row, "bonus.selector"); const warning = row.querySelector<HTMLElement>("[data-stacking-warning]"); if (warning) warning.hidden = !duplicateSelectors.has(selector); const overlap = row.querySelector<HTMLElement>("[data-skill-overlap]"); if (overlap) overlap.hidden = !trainedSkill || selector !== trainedSkill; }
  }
  private text(value: FormDataEntryValue | null): string { return String(value ?? "").trim(); }
  private optional(value: FormDataEntryValue | null): string | undefined { return this.text(value) || undefined; }
  private list(value: FormDataEntryValue | null): string[] { return this.text(value).split(",").map((item) => item.trim()).filter(Boolean); }
  private spells(value: FormDataEntryValue | null): Record<string, string> { return Object.fromEntries(this.text(value).split(/[\n,]+/).map((item) => item.trim()).flatMap((item) => { const match = item.match(/^([1-9]|10)\s*=\s*(.+)$/); return match ? [[match[1]!, match[2]!.trim()]] : []; })); }
  private formatSpells(value: Record<string, string> | undefined): string { return Object.entries(value ?? {}).sort(([left], [right]) => Number(left) - Number(right)).map(([rank, uuid]) => `${rank}=${uuid}`).join("\n"); }
  private visibility(value: FormDataEntryValue | string | null, fallback: VisibilityLevel): VisibilityLevel { const text = String(value ?? ""); return text === "public" || text === "selection" || text === "followers" || text === "owner" || text === "trusted" || text === "gm" || text === "hidden-until-selected" ? text : fallback; }
  private status(value: FormDataEntryValue | null): DeityDefinition["status"] { const text = String(value ?? ""); return text === "test" || text === "published" || text === "disabled" || text === "archived" ? text : "draft"; }
  private replacementMode(value: FormDataEntryValue | null): DeityDefinition["replacement"]["mode"] { const text = String(value ?? ""); return text === "replace" || text === "hide" ? text : "none"; }
  private effectTarget(value: string): "self" | "target" | "allies" | "enemies" | "group" { return value === "target" || value === "allies" || value === "enemies" || value === "group" ? value : "self"; }
  private clampNumber(value: FormDataEntryValue | null, fallback: number, min: number, max: number): number { const number = Number(value); return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback; }
  private modifierType(value: string): PassiveBonusDefinition["modifierType"] { return value === "item" || value === "circumstance" || value === "untyped" ? value : "status"; }
  private appliesTo(value: string): NonNullable<PassiveBonusDefinition["appliesTo"]> { return value === "dc" || value === "both" ? value : "checks"; }
  private resetType(value: string): NonNullable<AbilityDefinition["uses"]>["reset"] { return value === "ten-minute-rest" || value === "refocus" || value === "encounter-end" || value === "scene-change" || value === "calendar-day" || value === "calendar-week" || value === "calendar-month" || value === "calendar-year" || value === "custom-rest" || value === "manual" || value === "daily" || value === "weekly" || value === "encounter" ? value : "daily-preparations"; }
  private actionCost(value: string): NonNullable<AbilityDefinition["timing"]>["actionCost"]["type"] { return value === "automatic" || value === "free" || value === "reaction" || value === "exploration" || value === "downtime" || value === "custom" ? value : "actions"; }
  private cooldownUnit(value: string): "rounds" | "minutes" | "hours" | "days" { return value === "minutes" || value === "hours" || value === "days" ? value : "rounds"; }
  private durationUnit(value: string): NonNullable<AbilityDefinition["timing"]>["duration"]["unit"] { return value === "rounds" || value === "minutes" || value === "hours" || value === "encounter" || value === "scene" || value === "until-reset" ? value : "instant"; }
}
