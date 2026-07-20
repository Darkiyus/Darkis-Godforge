import type { DeityDefinition } from "../../core/types";

export interface StarfinderDeityData { name: string; type: "deity"; description: string; system: { domains: string[]; favoredWeapon: string; alignment: string[]; }; flags: { "darkis-godforge": { definitionUuid: string } }; }
export function buildStarfinderDeityData(deity: DeityDefinition): StarfinderDeityData {
  // TODO(verify): confirm deity document fields against the installed sf2e/sfrpg version.
  return { name: deity.name, type: "deity", description: deity.description, system: { domains: deity.domains, favoredWeapon: deity.favoredWeapon ?? "", alignment: deity.alignment ? [deity.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: deity.id } } };
}
