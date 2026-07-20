import type { DeityDefinition } from "../../core/types";

export interface Pf2eDeityData {
  name: string;
  type: "deity";
  img?: string;
  system: {
    category: "deity";
    description: { value: string };
    sanctification: { modal: "can" | "must"; what: Array<"holy" | "unholy"> } | null;
    domains: { primary: string[]; alternate: string[] };
    font: Array<"harm" | "heal">;
    attribute: string[];
    skill: string[] | null;
    weapons: string[];
    spells: Record<string, string>;
    traits: { otherTags: string[] };
  };
  flags: { "darkis-godforge": { definitionUuid: string } };
}

export function buildPf2eDeityData(deity: DeityDefinition, definitionUuid: string): Pf2eDeityData {
  return {
    name: deity.name,
    type: "deity",
    img: deity.image,
    system: {
      category: "deity",
      description: { value: deity.description },
      sanctification: parseSanctification(deity.sanctification),
      domains: { primary: [...deity.domains], alternate: [...(deity.alternateDomains ?? [])] },
      font: parseDivineFont(deity.font),
      attribute: [...(deity.divineAttributes ?? [])],
      skill: deity.skill ? [deity.skill] : null,
      weapons: deity.favoredWeapon ? [deity.favoredWeapon] : [],
      spells: structuredClone(deity.spells ?? {}),
      traits: { otherTags: [] }
    },
    flags: { "darkis-godforge": { definitionUuid } }
  };
}

function parseDivineFont(value: string | undefined): Array<"harm" | "heal"> {
  const fonts = value?.split(",").map((item) => item.trim().toLocaleLowerCase()).filter((item): item is "harm" | "heal" => item === "harm" || item === "heal") ?? [];
  return [...new Set(fonts)];
}

function parseSanctification(value: string | undefined): Pf2eDeityData["system"]["sanctification"] {
  const what = value?.split(",").map((item) => item.trim().toLocaleLowerCase()).filter((item): item is "holy" | "unholy" => item === "holy" || item === "unholy") ?? [];
  return what.length ? { modal: "can", what: [...new Set(what)] } : null;
}
