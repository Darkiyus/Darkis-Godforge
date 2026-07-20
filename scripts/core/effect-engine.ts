import { evaluateFormula, evaluateFormulaWithDice, type FormulaFacts } from "./formula-service";
import { evaluateCondition, type Facts } from "./condition-service";
import type { AbilityDefinition, EffectNode } from "./types";

export interface EffectTarget { id: string; hp?: number; maxHp?: number; modifiers: Record<string, number>; conditions: string[]; }
export interface EffectContext { actor: EffectTarget; target?: EffectTarget; facts: FormulaFacts; conditionFacts?: Facts; rollDice?: (formula: string) => Promise<number>; }
export interface EffectResult { messages: string[]; healing: number; damage: number; appliedModifiers: string[]; appliedConditions: string[]; }

export async function executeAbility(ability: AbilityDefinition, context: EffectContext): Promise<EffectResult> {
  const result: EffectResult = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (ability.condition && !evaluateCondition(ability.condition, context.conditionFacts ?? {})) return result;
  for (const effect of ability.effects) await executeEffect(effect, context, result);
  return result;
}

async function executeEffect(effect: EffectNode, context: EffectContext, result: EffectResult): Promise<void> {
  if (effect.type === "message") { result.messages.push(effect.text); return; }
  if (effect.type === "branch") { const branch = evaluateCondition(effect.condition, context.conditionFacts ?? {}) ? effect.then : effect.otherwise ?? []; for (const child of branch) await executeEffect(child, context, result); return; }
  if (effect.type === "heal" || effect.type === "damage") {
    const recipient = effect.target === "target" ? context.target : context.actor;
    if (!recipient) throw new Error("This ability requires a valid target.");
    const amount = /\b\d+d\d+\b/.test(effect.formula) ? context.rollDice ? await evaluateFormulaWithDice(effect.formula, context.facts, context.rollDice) : (() => { throw new Error("Dice terms require a Foundry Roll resolver."); })() : evaluateFormula(effect.formula, context.facts);
    if (effect.type === "heal") { result.healing += amount; if (recipient.hp !== undefined) recipient.hp = Math.min(recipient.maxHp ?? Number.MAX_SAFE_INTEGER, recipient.hp + amount); }
    else { result.damage += amount; if (recipient.hp !== undefined) recipient.hp = Math.max(0, recipient.hp - amount); }
    return;
  }
  if (effect.type === "modifier") { const value = typeof effect.value === "number" ? effect.value : evaluateFormula(effect.value, context.facts); context.actor.modifiers[effect.selector] = value; result.appliedModifiers.push(effect.selector); return; }
  if (effect.type !== "condition") return;
  const recipient = effect.target === "target" ? context.target : context.actor;
  if (!recipient) throw new Error("This ability requires a valid target.");
  recipient.conditions.push(effect.condition); result.appliedConditions.push(effect.condition);
}
