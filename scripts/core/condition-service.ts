export type Condition = { type: "fact"; key: string; equals: string | number | boolean } | { type: "and" | "or"; children: Condition[] } | { type: "not"; child: Condition };
export type Facts = Record<string, string | number | boolean | undefined>;

export function evaluateCondition(condition: Condition, facts: Facts): boolean {
  if (condition.type === "fact") return facts[condition.key] === condition.equals;
  if (condition.type === "not") return !evaluateCondition(condition.child, facts);
  const results = condition.children.map((child) => evaluateCondition(child, facts));
  return condition.type === "and" ? results.every(Boolean) : results.some(Boolean);
}
