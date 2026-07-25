export type Condition =
  | { type: "fact"; key: string; equals: string | number | boolean }
  | { type: "compare"; key: string; operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte"; value: string | number | boolean }
  | { type: "and" | "or"; children: Condition[] }
  | { type: "not"; child: Condition };
export type Facts = Record<string, string | number | boolean | undefined>;

export function evaluateCondition(condition: Condition, facts: Facts): boolean {
  if (condition.type === "fact") return facts[condition.key] === condition.equals;
  if (condition.type === "compare") {
    const actual = facts[condition.key];
    if (condition.operator === "eq") return actual === condition.value;
    if (condition.operator === "neq") return actual !== condition.value;
    if (typeof actual !== "number" || typeof condition.value !== "number") return false;
    if (condition.operator === "gt") return actual > condition.value;
    if (condition.operator === "gte") return actual >= condition.value;
    if (condition.operator === "lt") return actual < condition.value;
    return actual <= condition.value;
  }
  if (condition.type === "not") return !evaluateCondition(condition.child, facts);
  const results = condition.children.map((child) => evaluateCondition(child, facts));
  return condition.type === "and" ? results.every(Boolean) : results.some(Boolean);
}
