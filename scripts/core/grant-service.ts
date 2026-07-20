import type { GrantGroup } from "./types";

export interface GrantSelection { groupId: string; refs: string[]; }

export function resolveGrantGroup(group: GrantGroup, selection?: GrantSelection | GrantSelection[]): string[] {
  const selections = Array.isArray(selection) ? selection : selection ? [selection] : [];
  if (group.mode === "all") return group.grants.flatMap((grant) => "mode" in grant ? resolveGrantGroup(grant, selections) : [grant.ref]);
  const requested = selections.find((item) => item.groupId === group.id)?.refs ?? [];
  const candidates = group.grants.map((grant) => "mode" in grant ? grant.id : grant.ref);
  if (!group.pick || requested.length !== group.pick || requested.some((ref) => !candidates.includes(ref))) throw new Error(`Grant group ${group.id} requires ${group.pick ?? 1} valid choice(s).`);
  return requested.flatMap((ref) => { const member = group.grants.find((grant) => ("mode" in grant ? grant.id : grant.ref) === ref); return member && "mode" in member ? resolveGrantGroup(member, selections) : member ? [member.ref] : []; });
}
export function previewGrantGroup(group: GrantGroup): string[] { return flattenGrantRefs(group); }
function flattenGrantRefs(group: GrantGroup): string[] { return group.grants.flatMap((grant) => "mode" in grant ? flattenGrantRefs(grant) : [grant.ref]); }
