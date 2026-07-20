import type { GodForgeSystemAdapter, MaterializationContext } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";
import type { ClassGrantResult } from "../../core/class-coupling";
import { buildStarfinderDeityData } from "./starfinder-materializer";

// ref: https://github.com/foundryvtt/pf2e (the Starfinder 2e system is published as sf2e)
export class Starfinder2eAdapter implements GodForgeSystemAdapter {
  readonly id = "sf2e";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: true, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] };
  async materialize(deity: DeityDefinition, context?: MaterializationContext): Promise<string | null> { if (!context) return null; const document = await context.createItem(buildStarfinderDeityData(deity) as unknown as Record<string, unknown>); return document.uuid; }
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "FlatModifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
  buildClassCoupling(result: ClassGrantResult): object { return { classId: result.classId, deityId: result.deityId, system: result.systemValues, grants: result.grants }; }
}
