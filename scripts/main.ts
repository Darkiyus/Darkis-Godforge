import { AdapterRegistry } from "./adapters/adapter-registry";
import { GodForgeApi } from "./api";
import { GodForgeDashboard } from "./applications/dashboard";
import { DeityService } from "./core/deity-service";

const deityService = new DeityService();
const registry = new AdapterRegistry();
const api = new GodForgeApi(deityService, registry);

function openDashboard(): void { new GodForgeDashboard(deityService).render(true); }
const runtime = globalThis as { Hooks?: { once: (event: string, callback: () => void) => void }; game?: { modules?: { get: (id: string) => { api?: unknown } | undefined } } };
if (runtime.Hooks) runtime.Hooks.once("ready", () => { const module = runtime.game?.modules?.get("darkis-godforge"); if (module) module.api = api; openDashboard(); });
else if (typeof document !== "undefined") openDashboard();

export { api, deityService, registry, GodForgeDashboard };
