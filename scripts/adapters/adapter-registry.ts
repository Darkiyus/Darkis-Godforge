import type { GodForgeSystemAdapter } from "./adapter.interface";
import { Pf2eAdapter } from "./pf2e/pf2e-adapter";
import { Starfinder1eAdapter } from "./starfinder/starfinder1e-adapter";
import { Starfinder2eAdapter } from "./starfinder/starfinder2e-adapter";
export class AdapterRegistry {
  private readonly adapters = new Map<string, GodForgeSystemAdapter>();
  constructor() { this.register(new Pf2eAdapter()); this.register(new Starfinder2eAdapter()); this.register(new Starfinder1eAdapter()); }
  register(adapter: GodForgeSystemAdapter): void { this.adapters.set(adapter.id, adapter); }
  get(systemId: string): GodForgeSystemAdapter { const adapter = this.adapters.get(systemId); if (!adapter) throw new Error(`Unsupported game system: ${systemId}`); return adapter; }
  supports(systemId: string): boolean { return this.adapters.has(systemId); }
}
