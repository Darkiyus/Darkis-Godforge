import type { DeityDefinition, DeitySummary, SelectionContext } from "./types";

export function summarize(deity: DeityDefinition): DeitySummary { return { id: deity.id, name: deity.name, title: deity.title, image: deity.image, domains: deity.domains, alignment: deity.alignment }; }
export function filterCatalog(deities: DeityDefinition[], context: SelectionContext, hidden: Set<string>): DeitySummary[] { return deities.filter((deity) => deity.visibility.library && !hidden.has(deity.id) && (!context.pantheonFilter || deity.domains.includes(context.pantheonFilter))).map(summarize); }
