import { filterCatalog } from "./core/catalog-service";
import type { DeityService } from "./core/deity-service";
import type { DeityDefinition, SelectionContext } from "./core/types";
import type { AdapterRegistry } from "./adapters/adapter-registry";

export class GodForgeApi {
  constructor(private readonly deities: DeityService, private readonly adapters: AdapterRegistry) {}
  getSelectableDeities(context: SelectionContext) { return filterCatalog(this.deities.list(), context, new Set()); }
  getDeity(id: string): DeityDefinition | null { return this.deities.get(id); }
  getReplacementFor(sourceUuid: string): DeityDefinition | null { return this.deities.list().find((deity) => deity.replacement.sourceUuid === sourceUuid && deity.replacement.mode === "replace") ?? null; }
  isSourceHidden(sourceUuid: string, context: string): boolean { return this.deities.list().some((deity) => deity.replacement.sourceUuid === sourceUuid && deity.replacement.mode === "hide" && deity.replacement.contexts.includes(context)); }
  registerAdapter(adapter: Parameters<AdapterRegistry["register"]>[0]): void { this.adapters.register(adapter); }
}
