import type { GrantGroup } from "./types";

export interface GrantSelection { groupId: string; refs: string[]; }

export function resolveGrantGroup(group: GrantGroup, selection?: GrantSelection): string[] {
  if (group.mode === "all") return group.grants.map((grant) => grant.ref);
  const requested = selection?.groupId === group.id ? selection.refs : [];
  if (!group.pick || requested.length !== group.pick || requested.some((ref) => !group.grants.some((grant) => grant.ref === ref))) throw new Error(`Grant group ${group.id} requires ${group.pick ?? 1} valid choice(s).`);
  return requested;
}
