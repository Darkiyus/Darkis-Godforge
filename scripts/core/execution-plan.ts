import type { EffectResult, EffectTarget } from "./effect-engine";

export type ExecutionOperation =
  | { kind: "actor-update"; targetId: string; path: string; before: unknown; after: unknown }
  | { kind: "create-modifier"; targetId: string; selector: string; value: number; modifierType: string; duration?: number }
  | { kind: "condition"; targetId: string; condition: string; operation: "add" | "remove" }
  | { kind: "roll"; targetId: string; rollType: string; selector: string; dc?: number }
  | { kind: "roll-result"; targetId: string; rollType: string; selector: string; total: number; degree?: string }
  | { kind: "movement"; targetId: string; mode: string; distance: number }
  | { kind: "resource"; targetId: string; resource: string; amount: number; operation?: "add" | "remove" | "transfer"; itemUuid?: string }
  | { kind: "chat"; targetId: string; text: string };

export interface PreparedAbility {
  id: string;
  actorId: string;
  deityId: string;
  abilityId: string;
  abilityName: string;
  createdAt: number;
  operations: ExecutionOperation[];
  result: EffectResult;
  updatedTargets: Record<string, EffectTarget>;
}

export function buildExecutionOperations(before: Record<string, EffectTarget>, after: Record<string, EffectTarget>, result: EffectResult, actorId: string): ExecutionOperation[] {
  const operations: ExecutionOperation[] = [];
  for (const [targetId, target] of Object.entries(after)) {
    const previous = before[targetId];
    if (!previous) continue;
    if (target.hp !== previous.hp) operations.push({ kind: "actor-update", targetId, path: "system.attributes.hp.value", before: previous.hp ?? null, after: target.hp ?? null });
    if (target.gold !== previous.gold) operations.push({ kind: "actor-update", targetId, path: "system.currency.gp", before: previous.gold ?? null, after: target.gold ?? null });
    for (const condition of target.conditions.filter((entry) => !previous.conditions.includes(entry) && !entry.startsWith("suppressed:"))) operations.push({ kind: "condition", targetId, condition, operation: "add" });
    for (const condition of previous.conditions.filter((entry) => !target.conditions.includes(entry))) operations.push({ kind: "condition", targetId, condition, operation: "remove" });
  }
  for (const modifier of result.modifierOperations) operations.push({ kind: "create-modifier", ...modifier });
  for (const roll of result.rolls) operations.push(roll.resolved && roll.total !== undefined
    ? { kind: "roll-result", targetId: actorId, rollType: roll.type, selector: roll.selector, total: roll.total, degree: roll.degree }
    : { kind: "roll", targetId: actorId, rollType: roll.type, selector: roll.selector, dc: roll.value });
  for (const movement of result.movements) operations.push({ kind: "movement", targetId: movement.targetId, mode: movement.mode, distance: movement.distance });
  for (const resource of result.resources.filter((entry) => entry.resource !== "hp" && entry.resource !== "gold")) operations.push({ kind: "resource", targetId: resource.targetId, resource: resource.resource, amount: resource.amount, operation: resource.operation, itemUuid: resource.itemUuid });
  for (const message of result.messages) operations.push({ kind: "chat", targetId: actorId, text: message });
  return operations;
}

export function summarizeOperation(operation: ExecutionOperation): string {
  switch (operation.kind) {
    case "actor-update": return `${operation.targetId}: ${operation.path} ${String(operation.before)} → ${String(operation.after)}`;
    case "create-modifier": return `${operation.targetId}: ${operation.selector} ${operation.value >= 0 ? "+" : ""}${operation.value} (${operation.modifierType})`;
    case "condition": return `${operation.targetId}: ${operation.operation === "add" ? "+" : "−"} ${operation.condition}`;
    case "roll": return `${operation.targetId}: ${operation.rollType} ${operation.selector}${operation.dc === undefined ? "" : ` DC ${operation.dc}`}`;
    case "roll-result": return `${operation.targetId}: ${operation.selector} = ${operation.total}${operation.degree ? ` (${operation.degree})` : ""}`;
    case "movement": return `${operation.targetId}: ${operation.mode} ${operation.distance}`;
    case "resource": return `${operation.targetId}: ${operation.resource} ${operation.amount}`;
    case "chat": return operation.text;
  }
}
