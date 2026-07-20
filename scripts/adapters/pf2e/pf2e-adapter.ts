import type { GodForgeSystemAdapter } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";

// ref: https://github.com/foundryvtt/pf2e/wiki/Rule-Elements (FlatModifier)
export class Pf2eAdapter implements GodForgeSystemAdapter {
  readonly id = "pf2e";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: true, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] };
  async materialize(_deity: DeityDefinition): Promise<string | null> { return null; } // TODO(verify): create Item type deity against installed PF2e version.
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "FlatModifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
}
