import { evaluateFormula, evaluateFormulaWithDice, type FormulaFacts } from "./formula-service";
import { evaluateCondition, type Facts } from "./condition-service";
import type { AbilityDefinition, EffectNode } from "./types";

export interface EffectTarget { id: string; hp?: number; maxHp?: number; gold?: number; actions?: number; faction?: string; position?: { x: number; y: number }; modifiers: Record<string, number>; conditions: string[]; counters?: Record<string, number>; items?: string[]; }
export interface EffectContext { actor: EffectTarget; target?: EffectTarget; allies?: EffectTarget[]; enemies?: EffectTarget[]; facts: FormulaFacts; conditionFacts?: Facts; rollDice?: (formula: string) => Promise<number>; choose?: (prompt: string, options: Array<{ id: string; label: string }>) => Promise<string>; runMacro?: (command: string) => Promise<void>; rollTable?: (tableId: string) => Promise<string>; }
export interface EffectResult { messages: string[]; healing: number; damage: number; appliedModifiers: string[]; appliedConditions: string[]; rolls: Array<{ type: string; selector: string; value?: number }>; movements: Array<{ targetId: string; mode: string; distance: number }>; resources: Array<{ targetId: string; resource: string; amount: number }>; choices: string[]; }

export async function executeAbility(ability: AbilityDefinition, context: EffectContext): Promise<EffectResult> {
  const result: EffectResult = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [], rolls: [], movements: [], resources: [], choices: [] };
  if (ability.condition && !evaluateCondition(ability.condition, context.conditionFacts ?? {})) return result;
  for (const effect of ability.effects) await executeEffect(effect, context, result);
  return result;
}

async function executeEffect(effect: EffectNode, context: EffectContext, result: EffectResult): Promise<void> {
  if (effect.type === "message") { result.messages.push(effect.text); return; }
  if (effect.type === "branch") { const branch = evaluateCondition(effect.condition, context.conditionFacts ?? {}) ? effect.then : effect.otherwise ?? []; for (const child of branch) await executeEffect(child, context, result); return; }
  if (effect.type === "choice") { const selected = context.choose ? await context.choose(effect.prompt, effect.options.map(({ id, label }) => ({ id, label }))) : effect.options[0]?.id; const option = effect.options.find((entry) => entry.id === selected); if (option) { result.choices.push(option.id); for (const child of option.effects) await executeEffect(child, context, result); } return; }
  if (effect.type === "macro") { if (!context.runMacro) throw new Error("This ability requires GM macro authority."); await context.runMacro(effect.command); return; }
  if (effect.type === "random-wheel") { if (!context.rollTable) throw new Error("This ability requires a linked random table."); result.messages.push(await context.rollTable(effect.tableId)); return; }
  if (effect.type === "information") { result.messages.push(effect.text ?? `${effect.mode}${effect.questions ? ` (${effect.questions})` : ""}`); return; }
  if (effect.type === "counter") { const counters = context.actor.counters ??= {}; const value = formulaValue(effect.value, context); if (effect.operation === "require") { if ((counters[effect.key] ?? 0) < value) throw new Error(`Counter requirement not met: ${effect.key}`); } else counters[effect.key] = effect.operation === "set" ? value : (counters[effect.key] ?? 0) + value; return; }
  if (effect.type === "roll") { const value = effect.dc === undefined ? undefined : formulaValue(effect.dc, context); result.rolls.push({ type: effect.roll, selector: effect.selector, value }); return; }
  if (effect.type === "movement") { const distance = formulaValue(effect.distance, context); for (const recipient of recipients(effect.target, context)) result.movements.push({ targetId: recipient.id, mode: effect.mode, distance }); return; }
  if (effect.type === "action") { for (const recipient of recipients(effect.target, context)) { if (effect.operation === "lose" && recipient.actions !== undefined) recipient.actions = Math.max(0, recipient.actions - effect.amount); result.messages.push(`${recipient.id}: ${effect.operation} ${effect.amount} action(s)`); } return; }
  if (effect.type === "control") { for (const recipient of recipients(effect.target, context)) recipient.faction = effect.faction; return; }
  if (effect.type === "resource") { const amount = formulaValue(effect.formula, context); for (const recipient of recipients(effect.target, context)) { if (effect.resource === "hp" && recipient.hp !== undefined) recipient.hp = Math.max(0, Math.min(recipient.maxHp ?? Number.MAX_SAFE_INTEGER, recipient.hp + (effect.operation === "remove" ? -amount : amount))); if (effect.resource === "gold") recipient.gold = Math.max(0, (recipient.gold ?? 0) + (effect.operation === "remove" ? -amount : amount)); if (effect.resource === "item" && effect.itemUuid) { recipient.items ??= []; if (effect.operation === "remove") recipient.items = recipient.items.filter((item) => item !== effect.itemUuid); else recipient.items.push(effect.itemUuid); } result.resources.push({ targetId: recipient.id, resource: effect.resource, amount }); } return; }
  if (effect.type === "heal" || effect.type === "damage") {
    const amount = /\b\d+d\d+\b/.test(effect.formula) ? context.rollDice ? await evaluateFormulaWithDice(effect.formula, context.facts, context.rollDice) : (() => { throw new Error("Dice terms require a Foundry Roll resolver."); })() : evaluateFormula(effect.formula, context.facts);
    for (const recipient of recipients(effect.target, context)) { if (effect.type === "heal") { result.healing += amount; if (recipient.hp !== undefined) recipient.hp = Math.min(recipient.maxHp ?? Number.MAX_SAFE_INTEGER, recipient.hp + amount); } else { result.damage += amount; if (recipient.hp !== undefined) recipient.hp = Math.max(0, recipient.hp - amount); } }
    return;
  }
  if (effect.type === "modifier") { const value = formulaValue(effect.value, context); for (const recipient of recipients(effect.target ?? "self", context)) recipient.modifiers[effect.selector] = value; result.appliedModifiers.push(effect.selector); return; }
  if (effect.type !== "condition") return;
  for (const recipient of recipients(effect.target, context)) { if (effect.operation === "remove") recipient.conditions = recipient.conditions.filter((condition) => condition !== effect.condition); else if (effect.operation === "suppress") recipient.conditions = recipient.conditions.map((condition) => condition === effect.condition ? `suppressed:${condition}` : condition); else if (!recipient.conditions.includes(effect.condition)) recipient.conditions.push(effect.condition); result.appliedConditions.push(effect.condition); }
}

function recipients(target: "self" | "target" | "allies" | "enemies" | "group", context: EffectContext): EffectTarget[] { if (target === "self") return [context.actor]; if (target === "target") { if (!context.target) throw new Error("This ability requires a valid target."); return [context.target]; } if (target === "allies") return context.allies ?? []; if (target === "enemies") return context.enemies ?? []; return [...new Map([context.actor, context.target, ...(context.allies ?? []), ...(context.enemies ?? [])].filter((entry): entry is EffectTarget => Boolean(entry)).map((entry) => [entry.id, entry])).values()]; }
function formulaValue(value: number | string, context: EffectContext): number { return typeof value === "number" ? value : evaluateFormula(value, context.facts); }
