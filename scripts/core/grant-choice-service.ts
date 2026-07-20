import type { GrantGroup } from "./types";

export interface GrantChoiceGroupView {
  id: string;
  label: string;
  pick: number;
  options: Array<{ id: string; label: string }>;
  requirements: Array<{ groupId: string; optionId: string }>;
}

export function collectGrantChoiceGroups(group: GrantGroup, requirements: GrantChoiceGroupView["requirements"] = []): GrantChoiceGroupView[] {
  const nested = group.grants.flatMap((grant) => {
    if (!("mode" in grant)) return [];
    const childRequirements = group.mode === "any" ? [...requirements, { groupId: group.id, optionId: grant.id }] : requirements;
    return collectGrantChoiceGroups(grant, childRequirements);
  });
  if (group.mode !== "any") return nested;
  const options = group.grants.map((grant) => "mode" in grant
    ? { id: grant.id, label: grant.label || grant.id }
    : { id: grant.ref, label: grant.overrides?.name || grant.ref });
  return [{ id: group.id, label: group.label || group.id, pick: group.pick ?? 1, options, requirements }, ...nested];
}

export function hasGrantChoices(groups: GrantGroup[]): boolean { return groups.some((group) => collectGrantChoiceGroups(group).length > 0); }
