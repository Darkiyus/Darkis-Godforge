import type { DeityDefinition, DeitySummary, SelectionContext } from "./types";
import { isDeityVisible, redactForViewer, type ViewerContext } from "./visibility-service";

export function summarize(deity: DeityDefinition): DeitySummary { return { id: deity.id, name: deity.name, title: deity.title, image: deity.image, domains: deity.domains, alignment: deity.alignment }; }
export function filterCatalog(deities: DeityDefinition[], context: SelectionContext, hidden: Set<string>, viewer: ViewerContext = { isGM: true }): DeitySummary[] {
  return deities
    .filter((deity) => deity.kind !== "lore" && !hidden.has(deity.id) && isDeityVisible(deity, viewer) && (!context.pantheonFilter || deity.domains.includes(context.pantheonFilter)))
    .flatMap((deity) => {
      if (viewer.isGM) return [summarize(deity)];
      const visible = redactForViewer(deity, viewer);
      return visible ? [{ id: visible.id, name: visible.name, title: visible.title ?? "", image: visible.image, domains: visible.domains ?? [] }] : [];
    });
}
