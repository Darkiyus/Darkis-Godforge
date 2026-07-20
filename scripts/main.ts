import { AdapterRegistry } from "./adapters/adapter-registry";
import { GodForgeApi } from "./api";
import { GodForgeDashboard } from "./applications/dashboard";
import { DeityService } from "./core/deity-service";
import { registerFoundryBootstrap } from "./foundry/bootstrap";
import { SocketRouter } from "./foundry/socket-router";
import type { GodForgeActor } from "./api";

const deityService = new DeityService();
const registry = new AdapterRegistry();
const api = new GodForgeApi(deityService, registry);

let dashboard: GodForgeDashboard | null = null;
function openDashboard(): void {
  dashboard ??= new GodForgeDashboard(deityService);
  void dashboard.render(true).catch((error: unknown) => {
    console.error("Darkis GodForge | Could not open dashboard.", error);
    (globalThis as unknown as { ui?: { notifications?: { error?: (message: string) => void } } }).ui?.notifications?.error?.("Darkis GodForge could not be opened. Check the browser console.");
  });
}
const runtime = globalThis as { Hooks?: { once: (event: string, callback: () => void) => void }; game?: { system?: { id?: string }; user?: { id?: string; isGM?: boolean }; actors?: { get: (id: string) => GodForgeActor | null }; modules?: { get: (id: string) => { api?: unknown } | undefined } } };
const socketRouter = new SocketRouter(api, { currentUserId: runtime.game?.user?.id ?? "unknown", isGM: runtime.game?.user?.isGM ?? false, ownsActor: (actor, userId) => { const candidate = actor as GodForgeActor & { testUserPermission?: (user: unknown, permission: string) => boolean }; return candidate.testUserPermission?.({ id: userId }, "OWNER") ?? false; }, resolveActor: (actorId) => runtime.game?.actors?.get(actorId) ?? null });
if (runtime.Hooks) { const systemId = runtime.game?.system?.id; if (systemId && !registry.supports(systemId)) runtime.Hooks.once("ready", () => { (globalThis as unknown as { ui?: { notifications?: { warn?: (message: string) => void } } }).ui?.notifications?.warn?.(`Darkis GodForge does not support ${systemId}.`); }); else registerFoundryBootstrap(api, deityService, openDashboard, socketRouter); }
else if (typeof document !== "undefined") openDashboard();

export { api, deityService, registry, socketRouter, GodForgeDashboard };
