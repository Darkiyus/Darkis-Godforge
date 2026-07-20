import type { GodForgeSystemAdapter, MaterializationContext } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";
import type { ClassGrantResult } from "../../core/class-coupling";
import { buildPf2eDeityData } from "./deity-materializer";

// ref: https://github.com/foundryvtt/pf2e/wiki/Rule-Elements (FlatModifier)
export class Pf2eAdapter implements GodForgeSystemAdapter {
  readonly id = "pf2e";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: true, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] };
  async materialize(deity: DeityDefinition, context?: MaterializationContext): Promise<string | null> { if (!context) return null; const document = await context.createItem(buildPf2eDeityData(deity, deity.id) as unknown as Record<string, unknown>); return document.uuid; }
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "FlatModifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
  buildClassCoupling(result: ClassGrantResult): object { return { classId: result.classId, deityId: result.deityId, system: result.systemValues, grants: result.grants }; }
}
