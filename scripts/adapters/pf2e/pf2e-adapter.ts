import type { GodForgeSystemAdapter, MaterializationContext } from "../adapter.interface";
import type { DeityDefinition, PassiveBonusDefinition } from "../../core/types";
import type { ClassGrantResult } from "../../core/class-coupling";
import { buildPf2eDeityData } from "./deity-materializer";
import { listOfficialDeitiesFromPacks } from "../official-catalog";
import { buildPf2eClassCoupling } from "./class-coupling";
import { loadSystemEditorCatalog } from "../system-catalog";

// ref: https://github.com/foundryvtt/pf2e/wiki/Rule-Elements (FlatModifier)
export class Pf2eAdapter implements GodForgeSystemAdapter {
  readonly id = "pf2e";
  readonly capabilities = { lore: true, deity: true, passiveBonuses: true, abilities: true, classCoupling: true, selectors: ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery", "perception", "ac", "attack-roll"] };
  async materialize(deity: DeityDefinition, context?: MaterializationContext): Promise<string | null> { if (!context) return null; const document = await context.createItem(buildPf2eDeityData(deity, deity.id) as unknown as Record<string, unknown>); return document.uuid; }
  async listOfficialDeities() { return listOfficialDeitiesFromPacks(this.id); }
  listSkills(): string[] { const skills = (globalThis as unknown as { CONFIG?: { PF2E?: { skills?: Record<string, unknown> } } }).CONFIG?.PF2E?.skills; return skills ? Object.keys(skills).sort() : [...this.capabilities.selectors]; }
  listEditorCatalog() { return loadSystemEditorCatalog(this.id, this.listSkills()); }
  buildPassiveBonus(bonus: PassiveBonusDefinition): object { return { key: "FlatModifier", selector: bonus.selector, value: bonus.value, type: bonus.modifierType, slug: bonus.id }; }
  buildClassCoupling(result: ClassGrantResult): object | null { return buildPf2eClassCoupling(result); }
}
