import type { DeityDefinition } from "../../core/types";

export interface Pf2eDeityData { name: string; type: "deity"; description: string; system: { alignment: string[]; domains: string[]; favoredWeapon: string; font: string[]; sanctification: string[]; skill: string; }; flags: { "darkis-godforge": { definitionUuid: string } }; }
export function buildPf2eDeityData(deity: DeityDefinition, definitionUuid: string): Pf2eDeityData {
  // ref: https://github.com/foundryvtt/pf2e/wiki/Quickstart-guide-for-rule-elements (deity is a supported item type)
  return { name: deity.name, type: "deity", description: deity.description, system: { alignment: deity.alignment ? [deity.alignment] : [], domains: deity.domains, favoredWeapon: deity.favoredWeapon ?? "", font: deity.font ? [deity.font] : [], sanctification: deity.sanctification ? [deity.sanctification] : [], skill: deity.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid } } };
}
