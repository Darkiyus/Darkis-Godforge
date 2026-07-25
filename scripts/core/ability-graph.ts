import type { AbilityDefinition, AbilityGraph, AbilityGraphEdge, AbilityGraphNode, EffectNode, GraphNodeCategory, GraphPortType } from "./types";
import type { Condition } from "./condition-service";

export const ABILITY_GRAPH_SCHEMA_VERSION = 1 as const;
export const MAX_GRAPH_NODES = 200;
export const MAX_GRAPH_EDGES = 400;
export const MAX_GRAPH_BYTES = 262_144;

export interface GraphIssue {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface GraphValidation {
  valid: boolean;
  issues: GraphIssue[];
  reachable: string[];
}

export interface GraphPortDefinition {
  port: string;
  type: GraphPortType;
  direction: "input" | "output";
  label: string;
}

export function graphPorts(node: Pick<AbilityGraphNode, "category" | "type">): GraphPortDefinition[] {
  if (node.category === "trigger") return [
    port("next", "flow", "output", "Next"),
    port("actor", "actor", "output", "Actor"),
    port("event", "event", "output", "Event")
  ];
  if (node.category === "result") return [
    port("in", "flow", "input", "In"),
    port("degree", "degree", "input", "Degree")
  ];
  const ports: GraphPortDefinition[] = [port("in", "flow", "input", "In")];
  if (node.category === "logic") {
    if (node.type === "branch" || node.type === "condition") ports.push(port("value", "boolean", "input", "Value"));
    if (node.type === "compare") ports.push(port("left", "number", "input", "Left"), port("right", "number", "input", "Right"));
    ports.push(port("true", "flow", "output", "True"), port("false", "flow", "output", "False"));
    return ports;
  }
  ports.push(port("target", "actor", "input", "Target"));
  if (["heal", "damage", "temporary-hp", "modifier", "damage-dice", "resource", "movement", "counter"].includes(node.type)) ports.push(port("value", "number", "input", "Value"));
  if (["modifier", "damage-dice", "roll", "condition", "resource", "item"].includes(node.type)) ports.push(port("selector", "text", "input", "Selector"));
  if (node.type === "roll") {
    ports.push(
      port("next", "flow", "output", "Next"),
      port("critical-success", "flow", "output", "Critical success"),
      port("success", "flow", "output", "Success"),
      port("failure", "flow", "output", "Failure"),
      port("critical-failure", "flow", "output", "Critical failure"),
      port("total", "number", "output", "Total"),
      port("degree", "degree", "output", "Degree")
    );
    return ports;
  }
  ports.push(port("next", "flow", "output", "Next"));
  if (["heal", "damage", "resource", "counter"].includes(node.type)) ports.push(port("result", "number", "output", "Result"));
  return ports;
}

const categories = new Set<GraphNodeCategory>(["trigger", "logic", "action", "result"]);
const portTypes = new Set<GraphPortType>(["flow", "actor", "number", "boolean", "text", "roll", "degree", "item", "event"]);
const triggerTypes = new Set([
  "manual", "roll-complete", "skill-check", "attack-roll", "damage-roll", "saving-throw",
  "damage-taken", "healing-received", "hp-threshold", "condition-added", "condition-removed", "item-used",
  "spell-cast", "combat-start", "combat-end", "round-start", "turn-start", "turn-end", "daily-preparations",
  "scene-change", "world-time", "token-move", "deity-assigned",
  "deity-revealed", "deity-removed", "custom"
]);
const actionTypes = new Set([
  "heal", "damage", "temporary-hp", "modifier", "damage-dice", "condition", "resource", "roll", "movement",
  "message", "information", "random-wheel", "counter", "choice", "macro", "item", "sound"
]);
const logicTypes = new Set(["condition", "branch", "chance", "compare", "choice", "limit", "merge"]);
const resultTypes = new Set(["success", "failure", "critical-success", "critical-failure", "approved", "denied", "summary", "message", "end"]);

export function emptyAbilityGraph(): AbilityGraph {
  return { schemaVersion: ABILITY_GRAPH_SCHEMA_VERSION, approval: "gm", nodes: [], edges: [] };
}

export function validateAbilityGraph(value: unknown): GraphValidation {
  const issues: GraphIssue[] = [];
  if (!value || typeof value !== "object") return { valid: false, issues: [{ code: "graph.invalid", message: "Graph data must be an object." }], reachable: [] };
  const graph = value as Partial<AbilityGraph>;
  if (graph.schemaVersion !== ABILITY_GRAPH_SCHEMA_VERSION) issues.push({ code: "graph.schema", message: `Unsupported graph schema: ${String(graph.schemaVersion)}.` });
  if (graph.approval !== "gm") issues.push({ code: "graph.approval", message: "Every executable graph must require GM approval." });
  if (!Array.isArray(graph.nodes)) issues.push({ code: "graph.nodes", message: "Graph nodes must be an array." });
  if (!Array.isArray(graph.edges)) issues.push({ code: "graph.edges", message: "Graph edges must be an array." });
  if (issues.length) return { valid: false, issues, reachable: [] };
  const nodes = graph.nodes as unknown[];
  const edges = graph.edges as unknown[];
  if (nodes.length > MAX_GRAPH_NODES) issues.push({ code: "graph.node-limit", message: `A graph may contain at most ${MAX_GRAPH_NODES} nodes.` });
  if (edges.length > MAX_GRAPH_EDGES) issues.push({ code: "graph.edge-limit", message: `A graph may contain at most ${MAX_GRAPH_EDGES} edges.` });
  if (new TextEncoder().encode(JSON.stringify(value)).length > MAX_GRAPH_BYTES) issues.push({ code: "graph.size-limit", message: `A graph may contain at most ${MAX_GRAPH_BYTES} bytes.` });

  const parsedNodes = new Map<string, AbilityGraphNode>();
  for (const raw of nodes) {
    if (!raw || typeof raw !== "object") { issues.push({ code: "node.invalid", message: "Every graph node must be an object." }); continue; }
    const node = raw as Partial<AbilityGraphNode>;
    if (!validId(node.id)) { issues.push({ code: "node.id", message: "Every graph node needs a valid ID." }); continue; }
    if (parsedNodes.has(node.id)) { issues.push({ code: "node.duplicate", message: `Duplicate node ID: ${node.id}.`, nodeId: node.id }); continue; }
    if (!categories.has(node.category as GraphNodeCategory)) issues.push({ code: "node.category", message: `Unknown node category: ${String(node.category)}.`, nodeId: node.id });
    if (!validId(node.type) || !knownNodeType(node.category, node.type)) issues.push({ code: "node.type", message: `Unknown node type: ${String(node.type)}.`, nodeId: node.id });
    if (typeof node.label !== "string" || node.label.length > 160) issues.push({ code: "node.label", message: "Node labels must contain at most 160 characters.", nodeId: node.id });
    if (!finiteCoordinate(node.x) || !finiteCoordinate(node.y)) issues.push({ code: "node.position", message: "Node positions must be finite coordinates.", nodeId: node.id });
    if (!node.config || typeof node.config !== "object" || Array.isArray(node.config)) issues.push({ code: "node.config", message: "Node configuration must be an object.", nodeId: node.id });
    parsedNodes.set(node.id, node as AbilityGraphNode);
  }

  const parsedEdges: AbilityGraphEdge[] = [];
  const edgeIds = new Set<string>();
  for (const raw of edges) {
    if (!raw || typeof raw !== "object") { issues.push({ code: "edge.invalid", message: "Every graph edge must be an object." }); continue; }
    const edge = raw as Partial<AbilityGraphEdge>;
    if (!validId(edge.id)) { issues.push({ code: "edge.id", message: "Every graph edge needs a valid ID." }); continue; }
    if (edgeIds.has(edge.id)) { issues.push({ code: "edge.duplicate", message: `Duplicate edge ID: ${edge.id}.`, edgeId: edge.id }); continue; }
    edgeIds.add(edge.id);
    if (!edge.from || !edge.to || !parsedNodes.has(edge.from.nodeId) || !parsedNodes.has(edge.to.nodeId)) issues.push({ code: "edge.endpoint", message: "Edge endpoints must reference existing nodes.", edgeId: edge.id });
    if (!edge.from || !edge.to || !portTypes.has(edge.from.type) || !portTypes.has(edge.to.type) || edge.from.type !== edge.to.type) issues.push({ code: "edge.port-type", message: "Connected ports must have the same supported type.", edgeId: edge.id });
    const from = edge.from;
    const to = edge.to;
    const fromNode = from ? parsedNodes.get(from.nodeId) : undefined;
    const toNode = to ? parsedNodes.get(to.nodeId) : undefined;
    if (fromNode && from && !graphPorts(fromNode).some((entry) => entry.direction === "output" && entry.port === from.port && entry.type === from.type)) issues.push({ code: "edge.output-port", message: "The source port is not available on this node.", edgeId: edge.id });
    if (toNode && to && !graphPorts(toNode).some((entry) => entry.direction === "input" && entry.port === to.port && entry.type === to.type)) issues.push({ code: "edge.input-port", message: "The target port is not available on this node.", edgeId: edge.id });
    if (edge.from?.nodeId === edge.to?.nodeId) issues.push({ code: "edge.self", message: "A node cannot connect to itself.", edgeId: edge.id });
    parsedEdges.push(edge as AbilityGraphEdge);
  }

  const triggers = [...parsedNodes.values()].filter((node) => node.category === "trigger");
  if (!triggers.length && parsedNodes.size) issues.push({ code: "graph.trigger", message: "An executable graph needs at least one trigger." });
  const adjacency = new Map<string, string[]>();
  for (const edge of parsedEdges.filter((entry) => entry.from?.type === "flow")) {
    const targets = adjacency.get(edge.from.nodeId) ?? [];
    targets.push(edge.to.nodeId);
    adjacency.set(edge.from.nodeId, targets);
  }
  for (const edge of parsedEdges.filter((entry) => entry.from.type !== "flow")) {
    const starts = triggers.map((trigger) => trigger.id);
    if (!hasPath(adjacency, edge.from.nodeId, edge.to.nodeId) || reachableWithout(adjacency, starts, edge.from.nodeId).has(edge.to.nodeId)) issues.push({ code: "edge.data-order", message: "A data source must execute on every path before the node that consumes it.", edgeId: edge.id });
  }
  if (containsCycle(adjacency, parsedNodes.keys())) issues.push({ code: "graph.cycle", message: "Unbounded graph cycles are not allowed." });
  const reachable = walk(triggers.map((node) => node.id), adjacency);
  for (const node of parsedNodes.values()) if (triggers.length && !reachable.has(node.id)) issues.push({ code: "node.unreachable", message: "Node is not reachable from a trigger.", nodeId: node.id });
  return { valid: issues.length === 0, issues, reachable: [...reachable] };
}

function port(portName: string, type: GraphPortType, direction: "input" | "output", label: string): GraphPortDefinition { return { port: portName, type, direction, label }; }

export function migrateEffectsToGraph(ability: Pick<AbilityDefinition, "trigger" | "effects">): AbilityGraph {
  const trigger: AbilityGraphNode = {
    id: crypto.randomUUID(),
    category: "trigger",
    type: normalizeTriggerType(ability.trigger),
    label: ability.trigger?.trim() || "Manual",
    x: 80,
    y: 120,
    config: ability.trigger ? { event: ability.trigger } : {}
  };
  const nodes: AbilityGraphNode[] = [trigger];
  const edges: AbilityGraphEdge[] = [];
  let previous = trigger;
  for (const [index, effect] of ability.effects.entries()) {
    const node = effectToNode(effect, index);
    nodes.push(node);
    edges.push(flowEdge(previous.id, node.id));
    previous = node;
  }
  if (!ability.effects.length) {
    const end: AbilityGraphNode = { id: crypto.randomUUID(), category: "result", type: "end", label: "End", x: 360, y: 120, config: {} };
    nodes.push(end);
    edges.push(flowEdge(trigger.id, end.id));
  }
  return { schemaVersion: ABILITY_GRAPH_SCHEMA_VERSION, approval: "gm", nodes, edges };
}

export function compileGraphToEffects(graph: AbilityGraph): EffectNode[] {
  const validation = validateAbilityGraph(graph);
  if (!validation.valid) throw new Error(validation.issues.map((issue) => issue.message).join(" "));
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const flow = new Map<string, AbilityGraphEdge[]>();
  for (const edge of graph.edges.filter((entry) => entry.from.type === "flow")) {
    const list = flow.get(edge.from.nodeId) ?? [];
    list.push(edge);
    flow.set(edge.from.nodeId, list);
  }
  const compilePath = (nodeId: string, visited = new Set<string>()): EffectNode[] => {
    if (visited.has(nodeId)) return [];
    const nextVisited = new Set(visited);
    nextVisited.add(nodeId);
    const node = nodes.get(nodeId);
    if (!node) return [];
    const outgoing = flow.get(nodeId) ?? [];
    if (node.category === "logic" && ["branch", "condition", "compare", "chance"].includes(node.type)) {
      const trueEdge = outgoing.find((edge) => edge.from.port === "true") ?? outgoing[0];
      const falseEdge = outgoing.find((edge) => edge.from.port === "false") ?? outgoing[1];
      const condition = conditionFromNode(node);
      return [{
        type: "branch",
        condition,
        then: trueEdge ? compilePath(trueEdge.to.nodeId, nextVisited) : [],
        otherwise: falseEdge ? compilePath(falseEdge.to.nodeId, nextVisited) : []
      }];
    }
    const output: EffectNode[] = [];
    const effect = graphNodeToEffect(node);
    if (effect) output.push(effect);
    for (const edge of outgoing) output.push(...compilePath(edge.to.nodeId, nextVisited));
    return output;
  };
  const output: EffectNode[] = [];
  for (const trigger of graph.nodes.filter((node) => node.category === "trigger")) output.push(...compilePath(trigger.id));
  return output;
}

export function describeAbilityGraph(graph: AbilityGraph): string[] {
  return graph.nodes
    .slice()
    .sort((a, b) => a.x - b.x || a.y - b.y)
    .map((node) => `${categoryLabel(node.category)}: ${node.label || node.type}`);
}

export function autoLayoutGraph(graph: AbilityGraph): AbilityGraph {
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();
  for (const node of graph.nodes) incoming.set(node.id, 0);
  for (const edge of graph.edges.filter((entry) => entry.from.type === "flow")) {
    incoming.set(edge.to.nodeId, (incoming.get(edge.to.nodeId) ?? 0) + 1);
    const list = outgoing.get(edge.from.nodeId) ?? [];
    list.push(edge.to.nodeId);
    outgoing.set(edge.from.nodeId, list);
  }
  const queue = graph.nodes.filter((node) => node.category === "trigger" || (incoming.get(node.id) ?? 0) === 0).map((node) => ({ id: node.id, depth: 0 }));
  const depth = new Map<string, number>();
  while (queue.length) {
    const current = queue.shift()!;
    if ((depth.get(current.id) ?? -1) >= current.depth) continue;
    depth.set(current.id, current.depth);
    for (const next of outgoing.get(current.id) ?? []) queue.push({ id: next, depth: current.depth + 1 });
  }
  const rows = new Map<number, number>();
  return {
    ...structuredClone(graph),
    nodes: graph.nodes.map((node) => {
      const column = depth.get(node.id) ?? 0;
      const row = rows.get(column) ?? 0;
      rows.set(column, row + 1);
      return { ...structuredClone(node), x: 80 + column * 280, y: 80 + row * 170 };
    })
  };
}

function effectToNode(effect: EffectNode, index: number): AbilityGraphNode {
  const type = effect.type === "branch" ? "branch" : effect.type;
  const category: GraphNodeCategory = effect.type === "branch" ? "logic" : "action";
  return { id: crypto.randomUUID(), category, type, label: humanize(type), x: 360 + index * 280, y: 120, config: structuredClone(effect) as unknown as Record<string, unknown> };
}

export function graphNodeToEffect(node: AbilityGraphNode): EffectNode | null {
  if (node.category === "trigger" || node.category === "result" && node.type !== "summary" && node.type !== "message") return null;
  const config = structuredClone(node.config);
  if (node.category === "logic" && node.type === "branch") return { type: "branch", condition: (config.condition ?? { type: "fact", key: "always", equals: true }) as Condition, then: [], otherwise: [] };
  if (node.category === "result" && (node.type === "summary" || node.type === "message")) return { type: "message", text: String(config.text ?? node.label) };
  if (node.category !== "action") return null;
  const target = targetValue(config.target);
  if (node.type === "heal" || node.type === "damage") return { type: node.type, formula: String(config.formula ?? "1"), target };
  if (node.type === "temporary-hp") return { type: "resource", resource: "hp", operation: "add", formula: String(config.formula ?? "1"), target };
  if (node.type === "modifier" || node.type === "damage-dice") return { type: "modifier", selector: String(config.selector ?? (node.type === "damage-dice" ? "strike-damage" : "all")), value: value(config.value ?? config.formula ?? 1), modifierType: modifierType(config.modifierType), target, duration: numberValue(config.duration) };
  if (node.type === "condition") return { type: "condition", condition: String(config.condition ?? config.aux ?? "frightened"), target, operation: config.operation === "remove" || config.operation === "suppress" ? config.operation : "add", duration: numberValue(config.duration) };
  if (node.type === "resource" || node.type === "item") return { type: "resource", resource: node.type === "item" ? "item" : resourceType(config.resource), operation: resourceOperation(config.operation), formula: String(config.formula ?? "1"), target, itemUuid: stringValue(config.itemUuid ?? config.uuid) };
  if (node.type === "roll") return { type: "roll", roll: rollType(config.roll ?? config.operation), selector: String(config.selector ?? "perception"), dc: optionalValue(config.dc), keep: keepValue(config.keep), target };
  if (node.type === "movement") return { type: "movement", mode: movementMode(config.mode ?? config.operation), distance: value(config.distance ?? config.formula ?? 5), target };
  if (node.type === "counter") return { type: "counter", key: String(config.key ?? config.selector ?? "counter"), operation: counterOperation(config.operation), value: value(config.value ?? config.formula ?? 1) };
  if (node.type === "random-wheel") return { type: "random-wheel", tableId: String(config.tableId ?? config.uuid ?? ""), visibility: config.visibility === "public" || config.visibility === "user" ? config.visibility : "gm" };
  if (node.type === "macro") return { type: "macro", command: String(config.command ?? config.code ?? "") };
  if (node.type === "message" || node.type === "information" || node.type === "sound") return { type: "message", text: String(config.text ?? node.label) };
  return null;
}

function conditionFromNode(node: AbilityGraphNode): Condition {
  const configured = node.config.condition;
  if (configured && typeof configured === "object") return configured as Condition;
  if (node.type === "chance") return { type: "compare", key: "random.percent", operator: "lte", value: value(node.config.threshold ?? node.config.equals ?? 50) };
  if (node.type === "compare") return { type: "compare", key: String(node.config.fact ?? "actor.level"), operator: compareOperator(node.config.operator), value: primitive(node.config.equals ?? node.config.value ?? 1) };
  return { type: "fact", key: String(node.config.fact ?? node.config.selector ?? "always"), equals: primitive(node.config.equals ?? true) };
}

function flowEdge(from: string, to: string): AbilityGraphEdge {
  return { id: crypto.randomUUID(), from: { nodeId: from, port: "next", type: "flow" }, to: { nodeId: to, port: "in", type: "flow" } };
}
function knownNodeType(category: GraphNodeCategory | undefined, type: string | undefined): boolean {
  if (!category || !type) return false;
  if (category === "trigger") return triggerTypes.has(type);
  if (category === "logic") return logicTypes.has(type);
  if (category === "action") return actionTypes.has(type);
  return resultTypes.has(type);
}
function normalizeTriggerType(value: string | undefined): string { return value && triggerTypes.has(value) ? value : "manual"; }
function validId(value: unknown): value is string { return typeof value === "string" && value.length > 0 && value.length <= 128 && /^[a-zA-Z0-9._:-]+$/.test(value); }
function finiteCoordinate(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 100_000; }
function containsCycle(adjacency: Map<string, string[]>, ids: Iterable<string>): boolean {
  const visiting = new Set<string>(); const visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adjacency.get(id) ?? []) if (visit(next)) return true;
    visiting.delete(id); visited.add(id); return false;
  };
  for (const id of ids) if (visit(id)) return true;
  return false;
}
function walk(starts: string[], adjacency: Map<string, string[]>): Set<string> { const seen = new Set<string>(); const queue = [...starts]; while (queue.length) { const id = queue.shift()!; if (seen.has(id)) continue; seen.add(id); queue.push(...(adjacency.get(id) ?? [])); } return seen; }
function hasPath(adjacency: Map<string, string[]>, from: string, to: string): boolean { if (from === to) return false; const seen = new Set<string>(); const stack = [...(adjacency.get(from) ?? [])]; while (stack.length) { const current = stack.pop()!; if (current === to) return true; if (seen.has(current)) continue; seen.add(current); stack.push(...(adjacency.get(current) ?? [])); } return false; }
function reachableWithout(adjacency: Map<string, string[]>, starts: string[], blocked: string): Set<string> { const seen = new Set<string>(); const queue = starts.filter((id) => id !== blocked); while (queue.length) { const id = queue.shift()!; if (id === blocked || seen.has(id)) continue; seen.add(id); queue.push(...(adjacency.get(id) ?? []).filter((next) => next !== blocked)); } return seen; }
function categoryLabel(value: GraphNodeCategory): string { return ({ trigger: "Trigger", logic: "Check", action: "Action", result: "Result" })[value]; }
function humanize(value: string): string { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function targetValue(value: unknown): "self" | "target" | "allies" | "enemies" | "group" { return value === "target" || value === "allies" || value === "enemies" || value === "group" ? value : "self"; }
function modifierType(value: unknown): "item" | "status" | "circumstance" | "untyped" { return value === "item" || value === "circumstance" || value === "untyped" ? value : "status"; }
function resourceType(value: unknown): "hp" | "gold" | "item" { return value === "gold" || value === "item" ? value : "hp"; }
function resourceOperation(value: unknown): "add" | "remove" | "transfer" { return value === "remove" || value === "transfer" ? value : "add"; }
function movementMode(value: unknown): "step" | "teleport" | "forced" { return value === "teleport" || value === "forced" ? value : "step"; }
function counterOperation(value: unknown): "add" | "set" | "require" { return value === "set" || value === "require" ? value : "add"; }
function rollType(value: unknown): "reroll" | "check" | "saving-throw" | "degree-of-success" { return value === "reroll" || value === "saving-throw" || value === "degree-of-success" ? value : "check"; }
function keepValue(value: unknown): "new" | "higher" | "lower" | undefined { return value === "new" || value === "higher" || value === "lower" ? value : undefined; }
function stringValue(value: unknown): string | undefined { return typeof value === "string" && value ? value : undefined; }
function numberValue(value: unknown): number | undefined { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : undefined; }
function value(input: unknown): number | string { const parsed = Number(input); return typeof input === "number" || typeof input === "string" && input.trim() !== "" && Number.isFinite(parsed) ? parsed : String(input ?? "0"); }
function optionalValue(input: unknown): number | string | undefined { return input === undefined || input === null || input === "" ? undefined : value(input); }
function primitive(input: unknown): string | number | boolean { return typeof input === "boolean" ? input : value(input); }
function compareOperator(input: unknown): "eq" | "neq" | "gt" | "gte" | "lt" | "lte" { return input === "neq" || input === "gt" || input === "gte" || input === "lt" || input === "lte" ? input : "eq"; }
