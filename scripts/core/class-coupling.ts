import type { DeityDefinition } from "./types";
import { resolveGrantGroup, type GrantSelection } from "./grant-service";

export interface ClassGrantResult { deityId: string; classId: string; grants: string[]; choices: GrantSelection[]; }
export function resolveClassGrants(deity: DeityDefinition, classId: string, selections: GrantSelection[] = []): ClassGrantResult { const grants = deity.grantGroups.flatMap((group) => resolveGrantGroup(group, selections.find((selection) => selection.groupId === group.id))); return { deityId: deity.id, classId, grants, choices: selections }; }
