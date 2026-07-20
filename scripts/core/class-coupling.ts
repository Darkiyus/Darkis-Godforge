import type { DeityDefinition } from "./types";
import { resolveGrantGroup, type GrantSelection } from "./grant-service";

export interface ClassSystemValues { domains: string[]; alternateDomains: string[]; divineAttributes: string[]; spells: Record<string, string>; font?: string; favoredWeapon?: string; skill?: string; sanctification?: string; cause?: string; }
export interface ClassGrantResult { deityId: string; classId: string; grants: string[]; choices: GrantSelection[]; systemValues: ClassSystemValues; }
export function resolveClassGrants(deity: DeityDefinition, classId: string, selections: GrantSelection[] = []): ClassGrantResult { if (!classId.trim()) throw new Error("Class identifier is required for deity coupling."); const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, selections)); return { deityId: deity.id, classId, grants, choices: selections, systemValues: { domains: deity.domains, alternateDomains: deity.alternateDomains ?? [], divineAttributes: deity.divineAttributes ?? [], spells: deity.spells ?? {}, font: deity.font, favoredWeapon: deity.favoredWeapon, skill: deity.skill, sanctification: deity.sanctification, cause: deity.cause } }; }
