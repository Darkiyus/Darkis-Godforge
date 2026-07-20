import type { DeityDefinition } from "./types";
import { validateFormula } from "./formula-service";

export interface ValidationIssue { level: "warning" | "error"; field: string; message: string; }

export function validateDeity(deity: DeityDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!deity.name.trim()) issues.push({ level: "error", field: "name", message: "Name is required." });
  if (!deity.title.trim()) issues.push({ level: "warning", field: "title", message: "Title is empty." });
  if (!deity.description.trim()) issues.push({ level: "warning", field: "description", message: "Description is empty." });
  for (const bonus of deity.passiveBonuses) {
    if (!bonus.name.trim() || !bonus.selector.trim()) issues.push({ level: "error", field: `bonus.${bonus.id}`, message: "Bonus name and selector are required." });
    if (typeof bonus.value === "string" && !validateFormula(bonus.value)) issues.push({ level: "error", field: `bonus.${bonus.id}.value`, message: "Bonus formula is invalid." });
  }
  for (const ability of deity.abilities) {
    if (!ability.name.trim()) issues.push({ level: "error", field: `ability.${ability.id}`, message: "Ability name is required." });
    if (!ability.timing && ability.actionCost === undefined) issues.push({ level: "warning", field: `ability.${ability.id}.timing`, message: "Ability timing is incomplete." });
  }
  return issues;
}
