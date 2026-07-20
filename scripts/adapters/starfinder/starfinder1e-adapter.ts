import type { GodForgeSystemAdapter, MaterializationContext } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";
import type { ClassGrantResult } from "../../core/class-coupling";
import { listOfficialDeitiesFromPacks } from "../official-catalog";

// ref: https://github.com/foundryvtt-starfinder/foundryvtt-starfinder
export class Starfinder1eAdapter implements GodForgeSystemAdapter {
  readonly id = "sfrpg";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: false, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] };
  async materialize(_deity: DeityDefinition, _context?: MaterializationContext): Promise<string | null> { return null; }
  async listOfficialDeities() { return listOfficialDeitiesFromPacks(this.id); }
  listSkills(): string[] { const skills = (globalThis as unknown as { CONFIG?: { SFRPG?: { skills?: Record<string, unknown> } } }).CONFIG?.SFRPG?.skills; return skills ? Object.keys(skills).sort() : [...this.capabilities.selectors]; }
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "Modifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
  buildClassCoupling(_result: ClassGrantResult): object | null { return null; }
}
