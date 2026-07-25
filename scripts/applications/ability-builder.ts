import { autoLayoutGraph, describeAbilityGraph, emptyAbilityGraph, graphPorts, migrateEffectsToGraph, validateAbilityGraph } from "../core/ability-graph";
import type { AbilityGraph, AbilityGraphNode, GraphNodeCategory, GraphPortType } from "../core/types";
import { gmApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";
import { executeAbilityGraph } from "../core/graph-execution";

interface LibraryItem { category: GraphNodeCategory; type: string; label: string; icon: string; }

const library: LibraryItem[] = [
  { category: "trigger", type: "manual", label: "Manual button", icon: "fa-hand-pointer" },
  { category: "trigger", type: "skill-check", label: "Skill check", icon: "fa-dice-d20" },
  { category: "trigger", type: "attack-roll", label: "Attack roll", icon: "fa-crosshairs" },
  { category: "trigger", type: "saving-throw", label: "Saving throw", icon: "fa-shield-halved" },
  { category: "trigger", type: "damage-roll", label: "Damage roll", icon: "fa-burst" },
  { category: "trigger", type: "damage-taken", label: "Damage taken", icon: "fa-heart-crack" },
  { category: "trigger", type: "healing-received", label: "Healing received", icon: "fa-heart-pulse" },
  { category: "trigger", type: "combat-start", label: "Combat start", icon: "fa-swords" },
  { category: "trigger", type: "turn-start", label: "Turn start", icon: "fa-play" },
  { category: "trigger", type: "turn-end", label: "Turn end", icon: "fa-stop" },
  { category: "trigger", type: "round-start", label: "Round start", icon: "fa-rotate" },
  { category: "trigger", type: "daily-preparations", label: "Daily preparations", icon: "fa-sun" },
  { category: "trigger", type: "token-move", label: "Token movement", icon: "fa-location-arrow" },
  { category: "trigger", type: "deity-assigned", label: "Deity assigned", icon: "fa-link" },
  { category: "trigger", type: "custom", label: "Custom event", icon: "fa-puzzle-piece" },
  { category: "logic", type: "condition", label: "Condition", icon: "fa-code-branch" },
  { category: "logic", type: "chance", label: "Chance", icon: "fa-percent" },
  { category: "logic", type: "compare", label: "Compare values", icon: "fa-scale-balanced" },
  { category: "logic", type: "branch", label: "Branch", icon: "fa-code-branch" },
  { category: "action", type: "heal", label: "Heal", icon: "fa-kit-medical" },
  { category: "action", type: "damage", label: "Damage", icon: "fa-burst" },
  { category: "action", type: "modifier", label: "Bonus / penalty", icon: "fa-plus-minus" },
  { category: "action", type: "condition", label: "Apply condition", icon: "fa-shield-virus" },
  { category: "action", type: "roll", label: "Request roll", icon: "fa-dice" },
  { category: "action", type: "resource", label: "Resource", icon: "fa-coins" },
  { category: "action", type: "movement", label: "Movement", icon: "fa-person-running" },
  { category: "action", type: "message", label: "Chat message", icon: "fa-message" },
  { category: "result", type: "success", label: "Success", icon: "fa-check" },
  { category: "result", type: "failure", label: "Failure", icon: "fa-xmark" },
  { category: "result", type: "summary", label: "Summary", icon: "fa-scroll" },
  { category: "result", type: "end", label: "End", icon: "fa-flag-checkered" }
];

export class GodForgeAbilityBuilder extends gmApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-ability-builder", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.BUILDER_TITLE", resizable: true }, position: { width: 1380, height: 850 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/ability-builder.hbs" } };
  private graph: AbilityGraph;
  private selectedId = "";
  private connectFrom = "";
  private connectFromPort = "next";
  private connectFromType: GraphPortType = "flow";
  private history: AbilityGraph[] = [];
  private future: AbilityGraph[] = [];
  private search = "";
  private category: GraphNodeCategory | "all" = "all";
  private simulation: string[] = [];
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private zoom = 1;
  constructor(graph: AbilityGraph | undefined, private readonly onSave: (graph: AbilityGraph) => void) { super(); this.graph = structuredClone(graph ?? emptyAbilityGraph()); }
  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    const ui = uiText();
    const validation = validateAbilityGraph(this.graph);
    const selected = this.graph.nodes.find((node) => node.id === this.selectedId);
    const nodes = this.graph.nodes.map((node) => {
      const ports = graphPorts(node);
      const libraryItem = library.find((item) => item.category === node.category && item.type === node.type);
      return {
        ...node,
        label: localizedNodeLabel(node, ui),
        selected: node.id === this.selectedId,
        connecting: node.id === this.connectFrom,
        style: `left:${node.x}px;top:${node.y}px;height:${Math.max(88, 58 + Math.max(ports.filter((entry) => entry.direction === "input").length, ports.filter((entry) => entry.direction === "output").length) * 24)}px`,
        icon: libraryItem?.icon ?? "fa-circle-nodes",
        hasError: validation.issues.some((issue) => issue.nodeId === node.id),
        miniStyle: `left:${node.x / 20}px;top:${node.y / 20}px`,
        categoryLabel: ui[`CATEGORY_${node.category.toUpperCase()}`] ?? node.category,
        inputPorts: decoratePorts(ports.filter((entry) => entry.direction === "input"), ui),
        outputPorts: decoratePorts(ports.filter((entry) => entry.direction === "output"), ui)
      };
    });
    const edges = this.graph.edges.flatMap((edge) => {
      const from = this.graph.nodes.find((node) => node.id === edge.from.nodeId);
      const to = this.graph.nodes.find((node) => node.id === edge.to.nodeId);
      if (!from || !to) return [];
      const fromPoint = portPoint(from, edge.from.port, "output");
      const toPoint = portPoint(to, edge.to.port, "input");
      return [{ ...edge, x1: fromPoint.x, y1: fromPoint.y, x2: toPoint.x, y2: toPoint.y, path: curve(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y), portType: edge.from.type }];
    });
    const localizedLibrary = library.map((item) => ({ ...item, label: ui[nodeKey(item.type)] ?? item.label, categoryLabel: ui[`CATEGORY_${item.category.toUpperCase()}`] ?? item.category }));
    const visibleLibrary = localizedLibrary.filter((item) => (this.category === "all" || item.category === this.category) && (!this.search || `${item.label} ${item.type}`.toLocaleLowerCase().includes(this.search)));
    return {
      ui,
      graph: this.graph,
      nodes,
      edges,
      selected,
      selectedCategory: selected ? ui[`CATEGORY_${selected.category.toUpperCase()}`] ?? selected.category : "",
      selectedConfig: selected ? this.configFields(selected, ui) : [],
      library: visibleLibrary,
      issues: validation.issues.map((issue) => ({ ...issue, message: graphIssueText(issue.code, ui) })),
      valid: validation.valid,
      search: this.search,
      category: this.category,
      connecting: Boolean(this.connectFrom),
      canUndo: this.history.length > 0,
      canRedo: this.future.length > 0,
      outline: describeAbilityGraph(this.graph).map((line) => localizeOutline(line, ui)),
      simulation: this.simulation
      , zoomPercent: Math.round(this.zoom * 100)
      , canvasStyle: `transform:scale(${this.zoom});transform-origin:0 0`
    };
  }
  _onRender(): void {
    requireGM();
    const root = this.element;
    if (!root) return;
    root.querySelector<HTMLInputElement>("[data-library-search]")?.addEventListener("input", (event) => { this.search = (event.target as HTMLInputElement).value.toLocaleLowerCase(); if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => void this.render(true), 140); });
    root.querySelector<HTMLSelectElement>("[data-library-category]")?.addEventListener("change", (event) => { const value = (event.target as HTMLSelectElement).value; this.category = value === "trigger" || value === "logic" || value === "action" || value === "result" ? value : "all"; void this.render(true); });
    root.querySelectorAll<HTMLElement>("[data-add-node]").forEach((button) => button.addEventListener("click", () => this.addNode(button.dataset.category as GraphNodeCategory, button.dataset.type ?? "")));
    root.querySelectorAll<HTMLElement>("[data-graph-node]").forEach((node) => {
      node.addEventListener("click", (event) => { if ((event.target as HTMLElement).closest("[data-node-port]")) return; this.selectedId = node.dataset.graphNode ?? ""; void this.render(true); });
      node.addEventListener("keydown", (event) => this.onNodeKeydown(event, node.dataset.graphNode ?? ""));
      node.querySelector<HTMLElement>("[data-node-drag]")?.addEventListener("pointerdown", (event) => this.beginDrag(event, node));
      node.querySelectorAll<HTMLElement>("[data-node-output]").forEach((output) => output.addEventListener("click", () => { this.connectFrom = node.dataset.graphNode ?? ""; this.connectFromPort = output.dataset.nodeOutput || "next"; this.connectFromType = portType(output.dataset.portType); void this.render(true); }));
      node.querySelectorAll<HTMLElement>("[data-node-input]").forEach((input) => input.addEventListener("click", () => this.finishConnection(node.dataset.graphNode ?? "", input.dataset.nodeInput ?? "in", portType(input.dataset.portType))));
    });
    root.querySelector<HTMLElement>("[data-action='delete-node']")?.addEventListener("click", () => this.deleteSelected());
    root.querySelector<HTMLElement>("[data-action='duplicate-node']")?.addEventListener("click", () => this.duplicateSelected());
    root.querySelector<HTMLElement>("[data-action='auto-layout']")?.addEventListener("click", () => this.mutate(() => { this.graph = autoLayoutGraph(this.graph); }));
    root.querySelector<HTMLElement>("[data-action='zoom-in']")?.addEventListener("click", () => this.setZoom(this.zoom + .1));
    root.querySelector<HTMLElement>("[data-action='zoom-out']")?.addEventListener("click", () => this.setZoom(this.zoom - .1));
    root.querySelector<HTMLElement>("[data-action='center-graph']")?.addEventListener("click", () => this.centerGraph());
    root.querySelectorAll<HTMLElement>("[data-graph-template]").forEach((button) => button.addEventListener("click", () => this.applyTemplate(button.dataset.graphTemplate ?? "")));
    root.querySelector<HTMLElement>("[data-action='undo']")?.addEventListener("click", () => this.undo());
    root.querySelector<HTMLElement>("[data-action='redo']")?.addEventListener("click", () => this.redo());
    root.querySelector<HTMLElement>("[data-action='simulate']")?.addEventListener("click", () => void this.simulate());
    root.querySelector<HTMLElement>("[data-action='save-graph']")?.addEventListener("click", () => { const validation = validateAbilityGraph(this.graph); if (!validation.valid) return; this.onSave(structuredClone(this.graph)); void this.close?.(); });
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[data-node-field]").forEach((input) => input.addEventListener("change", () => this.updateSelected(input)));
  }
  _onClose(): void { if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = null; }
  private addNode(category: GraphNodeCategory, type: string): void {
    const item = library.find((entry) => entry.category === category && entry.type === type);
    if (!item) return;
    this.mutate(() => {
      const column = this.graph.nodes.length % 4;
      const row = Math.floor(this.graph.nodes.length / 4);
      const node: AbilityGraphNode = { id: crypto.randomUUID(), category, type, label: uiText()[nodeKey(type)] ?? item.label, x: 80 + column * 280, y: 80 + row * 170, config: defaults(category, type) };
      this.graph.nodes.push(node); this.selectedId = node.id;
    });
  }
  private setZoom(value: number): void { this.zoom = Math.max(.5, Math.min(1.5, Math.round(value * 10) / 10)); void this.render(true); }
  private centerGraph(): void {
    const region = this.element?.querySelector<HTMLElement>(".dg-graph-region");
    if (!region || !this.graph.nodes.length) return;
    const minX = Math.min(...this.graph.nodes.map((node) => node.x)) * this.zoom;
    const minY = Math.min(...this.graph.nodes.map((node) => node.y)) * this.zoom;
    const maxX = Math.max(...this.graph.nodes.map((node) => node.x + 240)) * this.zoom;
    const maxY = Math.max(...this.graph.nodes.map((node) => node.y + 130)) * this.zoom;
    region.scrollTo({ left: Math.max(0, (minX + maxX - region.clientWidth) / 2), top: Math.max(0, (minY + maxY - region.clientHeight) / 2), behavior: "smooth" });
  }
  private applyTemplate(name: string): void {
    this.mutate(() => {
      if (name === "heal") this.graph = migrateEffectsToGraph({ trigger: "manual", effects: [{ type: "heal", formula: "1d8", target: "target" }, { type: "message", text: "The blessing takes effect." }] });
      else if (name === "damage-reaction") this.graph = migrateEffectsToGraph({ trigger: "damage-taken", effects: [{ type: "modifier", selector: "ac", value: 1, modifierType: "status", target: "self", duration: 1 }] });
      else if (name === "daily-resource") this.graph = migrateEffectsToGraph({ trigger: "daily-preparations", effects: [{ type: "resource", resource: "item", operation: "add", formula: "1", target: "self", itemUuid: "" }] });
      this.graph = autoLayoutGraph(this.graph);
      this.selectedId = "";
    });
  }
  private deleteSelected(): void { if (!this.selectedId) return; this.mutate(() => { this.graph.nodes = this.graph.nodes.filter((node) => node.id !== this.selectedId); this.graph.edges = this.graph.edges.filter((edge) => edge.from.nodeId !== this.selectedId && edge.to.nodeId !== this.selectedId); this.selectedId = ""; }); }
  private duplicateSelected(): void { const selected = this.graph.nodes.find((node) => node.id === this.selectedId); if (!selected) return; this.mutate(() => { const copy = { ...structuredClone(selected), id: crypto.randomUUID(), x: selected.x + 32, y: selected.y + 32, label: `${selected.label} ${uiText().COPY_SUFFIX ?? "Copy"}` }; this.graph.nodes.push(copy); this.selectedId = copy.id; }); }
  private finishConnection(toId: string, toPort: string, toType: GraphPortType): void {
    if (!this.connectFrom || this.connectFrom === toId) return;
    if (this.connectFromType !== toType) return;
    this.mutate(() => {
      if (toType !== "flow") this.graph.edges = this.graph.edges.filter((edge) => !(edge.to.nodeId === toId && edge.to.port === toPort));
      if (!this.graph.edges.some((edge) => edge.from.nodeId === this.connectFrom && edge.from.port === this.connectFromPort && edge.to.nodeId === toId && edge.to.port === toPort)) this.graph.edges.push({ id: crypto.randomUUID(), from: { nodeId: this.connectFrom, port: this.connectFromPort, type: this.connectFromType }, to: { nodeId: toId, port: toPort, type: toType } });
      this.connectFrom = ""; this.connectFromPort = "next"; this.connectFromType = "flow";
    });
  }
  private beginDrag(event: PointerEvent, element: HTMLElement): void {
    const id = element.dataset.graphNode ?? "";
    const node = this.graph.nodes.find((entry) => entry.id === id);
    if (!node) return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY, nodeX: node.x, nodeY: node.y };
    const snapshot = structuredClone(this.graph);
    const move = (pointer: PointerEvent): void => {
      node.x = Math.round((start.nodeX + pointer.clientX - start.x) / 8) * 8;
      node.y = Math.round((start.nodeY + pointer.clientY - start.y) / 8) * 8;
      element.style.left = `${node.x}px`; element.style.top = `${node.y}px`;
    };
    const up = (): void => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); this.history.push(snapshot); this.future = []; void this.render(true); };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up, { once: true });
  }
  private onNodeKeydown(event: KeyboardEvent, id: string): void {
    if (event.key === "Delete") { this.selectedId = id; this.deleteSelected(); return; }
    if (event.key.toLocaleLowerCase() === "c") { this.connectFrom = id; void this.render(true); return; }
    const node = this.graph.nodes.find((entry) => entry.id === id);
    if (!node || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    this.mutate(() => { if (event.key === "ArrowLeft") node.x -= 16; if (event.key === "ArrowRight") node.x += 16; if (event.key === "ArrowUp") node.y -= 16; if (event.key === "ArrowDown") node.y += 16; });
  }
  private updateSelected(input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): void {
    const node = this.graph.nodes.find((entry) => entry.id === this.selectedId); if (!node) return;
    this.mutate(() => { const field = input.dataset.nodeField ?? ""; if (field === "label") node.label = input.value.slice(0, 160); else if (input.type === "number") node.config[field] = Number(input.value); else if (field === "equals") node.config[field] = primitiveInput(input.value); else node.config[field] = input.value; });
  }
  private async simulate(): Promise<void> {
    const validation = validateAbilityGraph(this.graph);
    const ui = uiText();
    if (!validation.valid) {
      this.simulation = validation.issues.map((issue) => graphIssueText(issue.code, ui));
      void this.render(true);
      return;
    }
    const actor = { id: "simulation-actor", hp: 20, maxHp: 30, gold: 10, modifiers: {}, conditions: [] };
    const target = { id: "simulation-target", hp: 15, maxHp: 25, gold: 5, modifiers: {}, conditions: [] };
    try {
      const result = await executeAbilityGraph(this.graph, {
        actor,
        target,
        allies: [],
        enemies: [target],
        facts: { actor: { level: 5, hpPercent: 66 }, target: { hpPercent: 60 } },
        conditionFacts: { always: true, "actor.level": 5, "actor.hpPercent": 66, "target.hpPercent": 60 },
        triggerEvent: this.graph.nodes.find((node) => node.category === "trigger")?.type ?? "manual",
        rollDice: async () => 5,
        rollStatistic: async () => ({ total: 15, degree: "success" }),
        choose: async (_prompt, options) => options[0]?.id ?? "",
        runMacro: async () => undefined,
        rollTable: async () => ui.SIMULATION_RANDOM_TABLE ?? "Simulated random-table result"
      });
      this.simulation = [
        `${this.graph.nodes.length} ${ui.NODES ?? "nodes"} · ${this.graph.edges.length} ${ui.CONNECTIONS ?? "connections"}`,
        `${ui.HEALING ?? "Healing"}: ${result.healing} · ${ui.DAMAGE ?? "Damage"}: ${result.damage}`,
        ...result.rolls.map((roll) => `${roll.selector}: ${roll.total ?? "–"} (${roll.degree ?? roll.type})`),
        ...result.modifierOperations.map((modifier) => `${modifier.targetId}: ${modifier.selector} ${modifier.value >= 0 ? "+" : ""}${modifier.value}`),
        ...result.appliedConditions.map((condition) => `${ui.CONDITION ?? "Condition"}: ${condition}`),
        ...result.messages
      ];
    } catch (error) {
      this.simulation = [error instanceof Error ? error.message : String(error)];
    }
    void this.render(true);
  }
  private undo(): void { const previous = this.history.pop(); if (!previous) return; this.future.push(structuredClone(this.graph)); this.graph = previous; void this.render(true); }
  private redo(): void { const next = this.future.pop(); if (!next) return; this.history.push(structuredClone(this.graph)); this.graph = next; void this.render(true); }
  private mutate(action: () => void): void { this.history.push(structuredClone(this.graph)); if (this.history.length > 100) this.history.shift(); this.future = []; action(); void this.render(true); }
  private configFields(node: AbilityGraphNode, ui: Record<string, string>): Array<{ key: string; label: string; value: string | number; type: "text" | "number" | "select" | "textarea"; isSelect?: boolean; isTextarea?: boolean; options?: Array<{ value: string; label: string; selected?: boolean }> }> {
    const label = (key: string, fallback: string): string => ui[key] ?? fallback;
    const fields: ReturnType<GodForgeAbilityBuilder["configFields"]> = [{ key: "label", label: label("NODE_LABEL", "Label"), value: node.label, type: "text" }];
    if (node.category === "trigger") fields.push({ key: "selector", label: label("EVENT_FILTER", "Event filter"), value: String(node.config.selector ?? ""), type: "text" });
    if (node.category === "logic") {
      if (node.type === "chance") fields.push({ key: "threshold", label: label("CHANCE_PERCENT", "Chance in percent"), value: String(node.config.threshold ?? 50), type: "number" });
      else {
        fields.push({ key: "fact", label: label("FACT_PATH", "Fact"), value: String(node.config.fact ?? "actor.level"), type: "text" });
        if (node.type === "compare") fields.push({ key: "operator", label: label("COMPARISON", "Comparison"), value: String(node.config.operator ?? "gte"), type: "select", options: ["eq", "neq", "gt", "gte", "lt", "lte"].map((value) => ({ value, label: ui[`COMPARE_${value.toUpperCase()}`] ?? value, selected: value === String(node.config.operator ?? "gte") })) });
        fields.push({ key: "equals", label: label("EXPECTED_VALUE", "Expected value"), value: String(node.config.equals ?? true), type: "text" });
      }
    }
    if (["heal", "damage", "resource", "modifier"].includes(node.type)) fields.push({ key: "formula", label: label("FORMULA_VALUE", "Formula or value"), value: String(node.config.formula ?? node.config.value ?? "1"), type: "text" });
    if (["modifier", "roll"].includes(node.type)) fields.push({ key: "selector", label: label("SYSTEM_SELECTOR", "System selector"), value: String(node.config.selector ?? "perception"), type: "text" });
    if (node.type === "roll") fields.push({ key: "dc", label: label("DIFFICULTY_CLASS", "Difficulty class"), value: String(node.config.dc ?? 15), type: "number" });
    if (node.type === "condition") fields.push({ key: "condition", label: label("CONDITION", "Condition"), value: String(node.config.condition ?? "frightened"), type: "text" });
    if (node.type === "message" || node.type === "summary") fields.push({ key: "text", label: label("TEXT", "Text"), value: String(node.config.text ?? ""), type: "textarea" });
    if (node.category === "action" && !["message", "summary"].includes(node.type)) fields.push({ key: "target", label: label("TARGET", "Target"), value: String(node.config.target ?? "self"), type: "select", options: ["self", "target", "allies", "enemies", "group"].map((value) => ({ value, label: ui[`TARGET_${value.toUpperCase()}`] ?? value, selected: value === String(node.config.target ?? "self") })) });
    return fields.map((field) => ({ ...field, isSelect: field.type === "select", isTextarea: field.type === "textarea" }));
  }
}

function defaults(category: GraphNodeCategory, type: string): Record<string, unknown> {
  if (category === "logic" && type === "chance") return { threshold: 50 };
  if (category === "logic" && type === "compare") return { fact: "actor.level", operator: "gte", equals: 1 };
  if (category === "logic") return { fact: "always", equals: true };
  if (type === "heal" || type === "damage") return { formula: "1d8", target: "self" };
  if (type === "modifier") return { selector: "perception", value: 1, modifierType: "status", target: "self" };
  if (type === "condition") return { condition: "frightened", operation: "add", target: "target" };
  if (type === "roll") return { selector: "perception", roll: "check", dc: 15, target: "self" };
  if (type === "movement") return { distance: 5, mode: "step", target: "target" };
  if (type === "resource") return { resource: "hp", operation: "add", formula: "1", target: "self" };
  if (type === "message" || type === "summary") return { text: "" };
  return {};
}
function curve(x1: number, y1: number, x2: number, y2: number): string { const offset = Math.max(70, Math.abs(x2 - x1) / 2); return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`; }
function nodeKey(type: string): string { return `NODE_${type.replaceAll("-", "_").toUpperCase()}`; }
function primitiveInput(value: string): string | number | boolean { if (value === "true") return true; if (value === "false") return false; const numeric = Number(value); return value.trim() !== "" && Number.isFinite(numeric) ? numeric : value; }
function portType(value: string | undefined): GraphPortType { return value === "actor" || value === "number" || value === "boolean" || value === "text" || value === "roll" || value === "degree" || value === "item" || value === "event" ? value : "flow"; }
function decoratePorts(ports: ReturnType<typeof graphPorts>, ui: Record<string, string>): Array<ReturnType<typeof graphPorts>[number] & { style: string }> { return ports.map((entry, index) => ({ ...entry, label: ui[`PORT_${entry.port.replaceAll("-", "_").toUpperCase()}`] ?? entry.label, style: `top:${42 + index * 24}px` })); }
function portPoint(node: AbilityGraphNode, portName: string, direction: "input" | "output"): { x: number; y: number } { const ports = graphPorts(node).filter((entry) => entry.direction === direction); const index = Math.max(0, ports.findIndex((entry) => entry.port === portName)); return { x: node.x + (direction === "output" ? 220 : 0), y: node.y + 42 + index * 24 }; }
function graphIssueText(code: string, ui: Record<string, string>): string { return ui[`GRAPH_ISSUE_${code.replace(/[.-]/g, "_").toUpperCase()}`] ?? (ui.GRAPH_ISSUE_GENERIC ?? "Invalid graph element ({code}).").replace("{code}", code); }
function localizeOutline(line: string, ui: Record<string, string>): string { return line.replace(/^Trigger:/, `${ui.CATEGORY_TRIGGER ?? "Trigger"}:`).replace(/^Logic:/, `${ui.CATEGORY_LOGIC ?? "Logic"}:`).replace(/^Action:/, `${ui.CATEGORY_ACTION ?? "Action"}:`).replace(/^Result:/, `${ui.CATEGORY_RESULT ?? "Result"}:`); }
function localizedNodeLabel(node: AbilityGraphNode, ui: Record<string, string>): string {
  const localized = ui[nodeKey(node.type)];
  if (!localized) return node.label;
  const libraryLabel = library.find((item) => item.category === node.category && item.type === node.type)?.label;
  const legacyLabels = new Set([libraryLabel, node.type, titleCase(node.type), node.type === "manual" ? "Manual" : "", node.type === "random-wheel" ? "Random Wheel" : ""].filter(Boolean));
  return !node.label || legacyLabels.has(node.label) ? localized : node.label;
}
function titleCase(value: string): string { return value.split("-").map((part) => part ? part[0]!.toUpperCase() + part.slice(1) : part).join(" "); }
