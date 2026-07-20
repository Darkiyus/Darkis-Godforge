import type { DeityDefinition } from "./types";
import { resolveGrantGroup, type GrantSelection } from "./grant-service";

export interface ClassSystemValues { domains: string[]; font?: string; favoredWeapon?: string; skill?: string; sanctification?: string; cause?: string; }
export interface ClassGrantResult { deityId: string; classId: string; grants: string[]; choices: GrantSelection[]; systemValues: ClassSystemValues; }
const supportedClasses = new Set(["cleric", "champion"]);
export function resolveClassGrants(deity: DeityDefinition, classId: string, selections: GrantSelection[] = []): ClassGrantResult { if (!supportedClasses.has(classId)) throw new Error(`Unsupported deity class coupling: ${classId}`); const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, selections.find((selection) => selection.groupId === group.id))); return { deityId: deity.id, classId, grants, choices: selections, systemValues: { domains: deity.domains, font: deity.font, favoredWeapon: deity.favoredWeapon, skill: deity.skill, sanctification: deity.sanctification } }; }
