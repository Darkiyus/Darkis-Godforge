import { AdapterRegistry } from "./adapters/adapter-registry";
import { GodForgeApi } from "./api";
import { GodForgeDashboard } from "./applications/dashboard";
import { DeityService } from "./core/deity-service";
import { registerFoundryBootstrap } from "./foundry/bootstrap";
import { SocketRouter } from "./foundry/socket-router";
import type { GodForgeActor } from "./api";
import { getFoundryGame, getFoundryRuntime, getFoundryUi } from "./foundry/runtime";

const deityService = new DeityService();
const registry = new AdapterRegistry();
const api = new GodForgeApi(deityService, registry);

let dashboard: GodForgeDashboard | null = null;
function openDashboard(): void {
  dashboard ??= new GodForgeDashboard(deityService);
  void dashboard.render(true).catch((error: unknown) => {
    console.error("Darkis GodForge | Could not open dashboard.", error);
    getFoundryUi()?.notifications?.error?.("Darkis GodForge could not be opened. Check the browser console.");
  });
}
const runtime = getFoundryRuntime();
const socketRouter = new SocketRouter(api, { get currentUserId() { return getFoundryGame()?.user?.id ?? "unknown"; }, get isGM() { return getFoundryGame()?.user?.isGM ?? false; }, ownsActor: (actor, userId) => { const candidate = actor as GodForgeActor & { testUserPermission?: (user: unknown, permission: string) => boolean }; return candidate.testUserPermission?.({ id: userId }, "OWNER") ?? false; }, resolveActor: (actorId) => (getFoundryGame()?.actors?.get(actorId) as GodForgeActor | null | undefined) ?? null });
if (runtime) { registerFoundryBootstrap(api, deityService, openDashboard, socketRouter); runtime.Hooks.once("ready", () => { const systemId = getFoundryGame()?.system?.id; if (systemId && !registry.supports(systemId)) getFoundryUi()?.notifications?.warn?.(`Darkis GodForge does not support ${systemId}.`); }); }
else if (typeof document !== "undefined") openDashboard();

export { api, deityService, registry, socketRouter, GodForgeDashboard };
