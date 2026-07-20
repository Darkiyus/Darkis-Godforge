import type { GodForgeSystemAdapter } from "./adapter.interface";
import { GenericAdapter } from "./generic/generic-adapter";
import { Pf2eAdapter } from "./pf2e/pf2e-adapter";
export class AdapterRegistry {
  private readonly adapters = new Map<string, GodForgeSystemAdapter>();
  constructor() { this.register(new GenericAdapter()); this.register(new Pf2eAdapter()); }
  register(adapter: GodForgeSystemAdapter): void { this.adapters.set(adapter.id, adapter); }
  get(systemId: string): GodForgeSystemAdapter { return this.adapters.get(systemId) ?? this.adapters.get("generic")!; }
}
