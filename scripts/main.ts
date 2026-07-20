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

function openDashboard(): void { new GodForgeDashboard(deityService).render(true); }
const runtime = globalThis as { Hooks?: { once: (event: string, callback: () => void) => void }; game?: { user?: { id?: string; isGM?: boolean }; actors?: { get: (id: string) => GodForgeActor | null }; modules?: { get: (id: string) => { api?: unknown } | undefined } } };
const socketRouter = new SocketRouter(api, { currentUserId: runtime.game?.user?.id ?? "unknown", isGM: runtime.game?.user?.isGM ?? false, ownsActor: (actor, userId) => { const candidate = actor as GodForgeActor & { testUserPermission?: (user: unknown, permission: string) => boolean }; return candidate.testUserPermission?.({ id: userId }, "OWNER") ?? false; }, resolveActor: (actorId) => runtime.game?.actors?.get(actorId) ?? null });
if (runtime.Hooks) { registerFoundryBootstrap(api, deityService, openDashboard, socketRouter); }
else if (typeof document !== "undefined") openDashboard();

export { api, deityService, registry, socketRouter, GodForgeDashboard };
