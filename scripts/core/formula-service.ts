const tokenPattern = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g;
const allowedDice = /^\d+d\d+(?:[+\-]\d+)?$/;

export interface FormulaFacts { actor: { level: number; hpPercent?: number }; target: { hpPercent?: number }; }

export function validateFormula(formula: string): boolean {
  const trimmed = formula.replace(/\s/g, "");
  if (allowedDice.test(trimmed)) return true;
  const tokens = trimmed.match(tokenPattern);
  return tokens !== null && tokens.join("") === trimmed;
}

export function evaluateFormula(formula: string, facts: FormulaFacts): number {
  if (!validateFormula(formula) || /[a-z]/i.test(formula.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (allowedDice.test(formula.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const substituted = formula.replace(/@actor\.level/g, String(facts.actor.level)).replace(/@actor\.hpPercent/g, String(facts.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(facts.target.hpPercent ?? 0));
  const values = substituted.split(/([()+\-*/,])/).map((part) => part.trim()).filter(Boolean);
  let result = 0; let operator = "+";
  for (const value of values) { if (/^[()+\-*/,]$/.test(value)) { operator = value; continue; } const number = Number(value); if (!Number.isFinite(number)) throw new Error("Formula could not be evaluated."); result = operator === "*" ? result * number : operator === "/" ? result / number : operator === "-" ? result - number : result + number; }
  return result;
}
