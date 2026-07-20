import type { GodForgeSystemAdapter, MaterializationContext } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";
import type { ClassGrantResult } from "../../core/class-coupling";
import { buildStarfinderDeityData } from "./starfinder-materializer";

// ref: https://github.com/foundryvtt-starfinder/foundryvtt-starfinder
export class Starfinder1eAdapter implements GodForgeSystemAdapter {
  readonly id = "sfrpg";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: false, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] };
  async materialize(deity: DeityDefinition, context?: MaterializationContext): Promise<string | null> { if (!context) return null; const document = await context.createItem(buildStarfinderDeityData(deity) as unknown as Record<string, unknown>); return document.uuid; }
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "Modifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
  buildClassCoupling(_result: ClassGrantResult): object | null { return null; }
}
