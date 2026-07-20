import type { GodForgeSystemAdapter } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";

// ref: https://github.com/foundryvtt/pf2e (the Starfinder 2e system is published as sf2e)
export class Starfinder2eAdapter implements GodForgeSystemAdapter {
  readonly id = "sf2e";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: true, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] };
  async materialize(_deity: DeityDefinition): Promise<string | null> { return null; } // TODO(verify): confirm the installed sf2e deity document schema.
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "FlatModifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
}
