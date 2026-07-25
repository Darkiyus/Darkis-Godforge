import { graphNodeToEffect, validateAbilityGraph } from "./ability-graph";
import { evaluateCondition, type Facts } from "./condition-service";
import { executeAbility, type EffectContext, type EffectResult } from "./effect-engine";
import type { AbilityGraph, AbilityGraphEdge, AbilityGraphNode } from "./types";

export interface ResolvedGraphRoll {
  total: number;
  degree: "critical-success" | "success" | "failure" | "critical-failure";
}

export interface GraphExecutionContext extends EffectContext {
  triggerEvent?: string;
  rollStatistic(actorId: string, selector: string, dc?: number): Promise<ResolvedGraphRoll>;
}

export async function executeAbilityGraph(graph: AbilityGraph, context: GraphExecutionContext): Promise<EffectResult> {
  const validation = validateAbilityGraph(graph);
  if (!validation.valid) throw new Error(validation.issues.map((issue) => issue.message).join(" "));
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const flow = groupEdges(graph.edges.filter((edge) => edge.from.type === "flow"));
  const dataInputs = new Map(graph.edges.filter((edge) => edge.from.type !== "flow").map((edge) => [`${edge.to.nodeId}:${edge.to.port}`, edge]));
  const values = new Map<string, unknown>();
  const visited = new Set<string>();
  const result = emptyResult();

  const run = async (nodeId: string): Promise<void> => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodes.get(nodeId);
    if (!node) return;
    if (node.category === "trigger") {
      values.set(`${node.id}:actor`, context.actor.id);
      values.set(`${node.id}:event`, context.triggerEvent ?? node.type);
      await follow(node.id, "next");
      return;
    }
    if (node.category === "logic") {
      const branch = logicResult(node, inputValue(node.id, "value"), inputValue(node.id, "left"), inputValue(node.id, "right"), context.conditionFacts ?? {});
      await follow(node.id, branch ? "true" : "false");
      return;
    }
    if (node.category === "action" && node.type === "roll") {
      const targetId = actorInput(node, inputValue(node.id, "target"), context);
      const selector = String(inputValue(node.id, "selector") ?? node.config.selector ?? "perception");
      const dc = optionalNumber(node.config.dc);
      const roll = await context.rollStatistic(targetId, selector, dc);
      values.set(`${node.id}:total`, roll.total);
      values.set(`${node.id}:degree`, roll.degree);
      result.rolls.push({ type: String(node.config.roll ?? "check"), selector, value: dc, total: roll.total, degree: roll.degree, resolved: true });
      await follow(node.id, (flow.get(node.id) ?? []).some((edge) => edge.from.port === roll.degree) ? roll.degree : "next");
      return;
    }
    const executable = configuredNode(node, inputValue(node.id, "value"), inputValue(node.id, "selector"), inputValue(node.id, "target"), context);
    const effect = graphNodeToEffect(executable);
    if (effect) {
      const partial = await executeAbility({ id: node.id, name: node.label, description: "", effects: [effect] }, context);
      mergeResult(result, partial);
      values.set(`${node.id}:result`, partial.healing || partial.damage || partial.resources[0]?.amount || 0);
    }
    await follow(node.id, "next");
  };

  const follow = async (nodeId: string, port: string): Promise<void> => {
    for (const edge of (flow.get(nodeId) ?? []).filter((entry) => entry.from.port === port)) await run(edge.to.nodeId);
  };
  const inputValue = (nodeId: string, port: string): unknown => {
    const edge = dataInputs.get(`${nodeId}:${port}`);
    return edge ? values.get(`${edge.from.nodeId}:${edge.from.port}`) : undefined;
  };

  const triggers = graph.nodes.filter((node) => node.category === "trigger" && (!context.triggerEvent || node.type === context.triggerEvent || node.type === "custom" && (node.config.event ?? node.config.selector) === context.triggerEvent));
  for (const trigger of triggers) await run(trigger.id);
  return result;
}

function configuredNode(node: AbilityGraphNode, value: unknown, selector: unknown, actor: unknown, context: GraphExecutionContext): AbilityGraphNode {
  const copy = structuredClone(node);
  if (value !== undefined) {
    copy.config.formula = value;
    copy.config.value = value;
    copy.config.distance = value;
  }
  if (selector !== undefined) copy.config.selector = selector;
  if (actor !== undefined) copy.config.target = targetName(String(actor), context);
  return copy;
}

function logicResult(node: AbilityGraphNode, input: unknown, left: unknown, right: unknown, facts: Facts): boolean {
  if (typeof input === "boolean") return input;
  if (node.type === "chance") return Math.random() * 100 < Number(node.config.threshold ?? 50);
  if (node.type === "compare") {
    const actual = left ?? facts[String(node.config.fact ?? "actor.level")];
    const expected = right ?? node.config.equals ?? node.config.value ?? 1;
    const operator = String(node.config.operator ?? "eq");
    if (operator === "eq") return actual === expected;
    if (operator === "neq") return actual !== expected;
    if (typeof actual !== "number" || typeof expected !== "number") return false;
    if (operator === "gt") return actual > expected;
    if (operator === "gte") return actual >= expected;
    if (operator === "lt") return actual < expected;
    return actual <= expected;
  }
  return evaluateCondition({ type: "fact", key: String(node.config.fact ?? "always"), equals: primitive(node.config.equals ?? true) }, facts);
}

function actorInput(node: AbilityGraphNode, value: unknown, context: GraphExecutionContext): string {
  if (typeof value === "string") return value;
  const target = String(node.config.target ?? "self");
  if (target === "target") return context.target?.id ?? context.actor.id;
  if (target === "allies") return context.allies?.[0]?.id ?? context.actor.id;
  if (target === "enemies") return context.enemies?.[0]?.id ?? context.target?.id ?? context.actor.id;
  return context.actor.id;
}

function targetName(actorId: string, context: GraphExecutionContext): "self" | "target" | "allies" | "enemies" {
  if (actorId === context.actor.id) return "self";
  if (actorId === context.target?.id) return "target";
  if (context.allies?.some((actor) => actor.id === actorId)) return "allies";
  return "enemies";
}

function groupEdges(edges: AbilityGraphEdge[]): Map<string, AbilityGraphEdge[]> {
  const result = new Map<string, AbilityGraphEdge[]>();
  for (const edge of edges) result.set(edge.from.nodeId, [...(result.get(edge.from.nodeId) ?? []), edge]);
  return result;
}

function emptyResult(): EffectResult { return { messages: [], healing: 0, damage: 0, appliedModifiers: [], modifierOperations: [], appliedConditions: [], rolls: [], movements: [], resources: [], choices: [] }; }
function mergeResult(target: EffectResult, source: EffectResult): void {
  target.messages.push(...source.messages);
  target.healing += source.healing;
  target.damage += source.damage;
  target.appliedModifiers.push(...source.appliedModifiers);
  target.modifierOperations.push(...source.modifierOperations);
  target.appliedConditions.push(...source.appliedConditions);
  target.rolls.push(...source.rolls);
  target.movements.push(...source.movements);
  target.resources.push(...source.resources);
  target.choices.push(...source.choices);
}
function optionalNumber(value: unknown): number | undefined { const parsed = Number(value); return value === undefined || value === null || value === "" || !Number.isFinite(parsed) ? undefined : parsed; }
function primitive(value: unknown): string | number | boolean { return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : String(value); }
