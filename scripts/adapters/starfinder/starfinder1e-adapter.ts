import type { GodForgeSystemAdapter } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";

// ref: https://github.com/foundryvtt-starfinder/foundryvtt-starfinder
export class Starfinder1eAdapter implements GodForgeSystemAdapter {
  readonly id = "sfrpg";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: false, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] };
  async materialize(_deity: DeityDefinition): Promise<string | null> { return null; } // TODO(verify): confirm the installed sfrpg document schema.
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "Modifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
}
