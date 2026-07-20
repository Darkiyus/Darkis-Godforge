import type { GodForgeSystemAdapter } from "../adapter.interface";
import type { DeityDefinition } from "../../core/types";
export class GenericAdapter implements GodForgeSystemAdapter {
  readonly id = "generic";
  readonly capabilities = { lore: true, deity: false, passiveBonuses: false, abilities: false, classCoupling: false, selectors: [] };
  async materialize(_deity: DeityDefinition): Promise<string | null> { return null; }
  buildPassiveBonus(_bonus: DeityDefinition["passiveBonuses"][number]): object | null { return null; }
}
