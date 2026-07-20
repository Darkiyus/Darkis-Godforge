import type { GrantGroup } from "./types";

export interface GrantSelection { groupId: string; refs: string[]; }

export function resolveGrantGroup(group: GrantGroup, selection?: GrantSelection): string[] {
  const leafRefs = flattenGrantRefs(group);
  if (group.mode === "all") return group.grants.flatMap((grant) => "mode" in grant ? resolveGrantGroup(grant) : [grant.ref]);
  const requested = selection?.groupId === group.id ? selection.refs : [];
  if (!group.pick || requested.length !== group.pick || requested.some((ref) => !leafRefs.includes(ref))) throw new Error(`Grant group ${group.id} requires ${group.pick ?? 1} valid choice(s).`);
  return requested;
}
export function previewGrantGroup(group: GrantGroup): string[] { return flattenGrantRefs(group); }
function flattenGrantRefs(group: GrantGroup): string[] { return group.grants.flatMap((grant) => "mode" in grant ? flattenGrantRefs(grant) : [grant.ref]); }
