import { AdapterRegistry } from "./adapters/adapter-registry";
import { GodForgeApi } from "./api";
import { GodForgeDashboard } from "./applications/dashboard";
import { GodForgeCodex } from "./applications/codex";
import { GodForgeHub } from "./applications/hub";
import { DeityService } from "./core/deity-service";
import { registerFoundryBootstrap } from "./foundry/bootstrap";
import { SocketRouter } from "./foundry/socket-router";
import type { GodForgeActor } from "./api";
import { getFoundryGame, getFoundryRuntime, getFoundryUi } from "./foundry/runtime";
import { isCurrentUserGM, notifyGMOnly } from "./foundry/permissions";
import { RandomContentService } from "./core/random-service";
import { localize } from "./foundry/i18n";

const deityService = new DeityService();
const registry = new AdapterRegistry();
const api = new GodForgeApi(deityService, registry);
const randomContentService = new RandomContentService();

let dashboard: GodForgeDashboard | null = null;
function openDashboard(): void {
  if (!isCurrentUserGM()) { notifyGMOnly(); return; }
  dashboard ??= new GodForgeDashboard(deityService, registry, api, randomContentService);
  void dashboard.render(true).catch((error: unknown) => {
    console.error("Darkis GodForge | Could not open dashboard.", error);
    getFoundryUi()?.notifications?.error?.(localize("DARKIS_GODFORGE.ERROR.DASHBOARD_OPEN"));
  });
}
function openCodex(): void {
  const codex = new GodForgeCodex(deityService, undefined, api, socketRouter, resolveCurrentActor());
  void codex.render(true).catch((error: unknown) => {
    console.error("Darkis GodForge | Could not open codex.", error);
    getFoundryUi()?.notifications?.error?.(localize("DARKIS_GODFORGE.ERROR.CODEX_OPEN"));
  });
}
const hubs = new Map<string, GodForgeHub>();
function openHub(actor?: GodForgeActor): void {
  const selected = actor ?? resolveCurrentActor();
  if (!selected) { getFoundryUi()?.notifications?.warn?.(localize("DARKIS_GODFORGE.UI.SELECT_CHARACTER_FIRST")); return; }
  let hub = hubs.get(selected.id);
  if (!hub) { hub = new GodForgeHub(selected, api, socketRouter, openCodex); hubs.set(selected.id, hub); }
  void hub.render(true).catch((error: unknown) => { console.error("Darkis GodForge | Could not open hub.", error); getFoundryUi()?.notifications?.error?.(localize("DARKIS_GODFORGE.ERROR.HUB_OPEN")); });
}
const runtime = getFoundryRuntime();
const socketRouter = new SocketRouter(api, { get currentUserId() { return getFoundryGame()?.user?.id ?? "unknown"; }, get isGM() { return getFoundryGame()?.user?.isGM ?? false; }, isGMUser: (userId) => getFoundryGame()?.users?.get(userId)?.isGM === true, ownsActor: (actor, userId) => { const user = getFoundryGame()?.users?.get(userId) ?? { id: userId }; return actor.testUserPermission?.(user, "OWNER") ?? false; }, resolveActor: (actorId) => (getFoundryGame()?.actors?.get(actorId) as GodForgeActor | null | undefined) ?? null });
if (runtime) { registerFoundryBootstrap(api, deityService, openDashboard, openCodex, socketRouter, randomContentService, openHub); runtime.Hooks.once("ready", () => { const systemId = getFoundryGame()?.system?.id; if (systemId && !registry.supports(systemId)) getFoundryUi()?.notifications?.warn?.(localize("DARKIS_GODFORGE.ERROR.UNSUPPORTED_SYSTEM").replace("{system}", systemId)); }); }
else if (typeof document !== "undefined") openDashboard();

export { api, deityService, registry, socketRouter, randomContentService, GodForgeDashboard };

function resolveCurrentActor(): GodForgeActor | undefined {
  const canvas = (globalThis as unknown as { canvas?: { tokens?: { controlled?: Array<{ actor?: GodForgeActor }> } } }).canvas;
  const controlled = canvas?.tokens?.controlled?.map((token) => token.actor).filter((actor): actor is GodForgeActor => Boolean(actor)) ?? [];
  if (controlled.length === 1) return controlled[0];
  return getFoundryGame()?.user?.character as GodForgeActor | undefined;
}
