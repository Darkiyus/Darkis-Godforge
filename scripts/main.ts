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
import { escapeHtml } from "./core/sanitize";

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
  void selectHubActor(actor).then((selected) => { if (selected) renderHub(selected); }).catch((error: unknown) => { console.error("Darkis GodForge | Could not select a character for the follower hub.", error); getFoundryUi()?.notifications?.error?.(localize("DARKIS_GODFORGE.ERROR.HUB_OPEN")); });
}
function renderHub(selected: GodForgeActor): void {
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

async function selectHubActor(explicit?: GodForgeActor): Promise<GodForgeActor | undefined> {
  if (explicit) return explicit;
  const controlled = ((globalThis as unknown as { canvas?: { tokens?: { controlled?: Array<{ actor?: GodForgeActor }> } } }).canvas?.tokens?.controlled ?? []).map((token) => token.actor).filter((actor): actor is GodForgeActor => Boolean(actor));
  if (controlled.length === 1) return controlled[0];
  const character = getFoundryGame()?.user?.character as GodForgeActor | undefined;
  if (character) return character;
  const user = getFoundryGame()?.user;
  const owned = (getFoundryGame()?.actors?.contents ?? []).filter((value): value is GodForgeActor & { name?: string } => Boolean(value && typeof value === "object" && "id" in value && user && (value as GodForgeActor).testUserPermission?.(user, "OWNER") === true));
  if (owned.length === 1) return owned[0];
  type DialogApi = { input(options: Record<string, unknown>): Promise<Record<string, unknown> | null>; prompt(options: Record<string, unknown>): Promise<unknown> };
  const DialogV2 = (globalThis as unknown as { foundry?: { applications?: { api?: { DialogV2?: DialogApi } } } }).foundry?.applications?.api?.DialogV2;
  const explanation = "Der Anhänger-Hub zeigt Gottheit, Boni und Wunder eines Charakters.";
  if (!DialogV2) { getFoundryUi()?.notifications?.warn?.(explanation); return undefined; }
  if (!owned.length) { await DialogV2.prompt({ window: { title: "Anhänger-Hub" }, content: `<p>${explanation}</p><p>Lege einen eigenen Charakter fest oder kontrolliere einen Token.</p>`, rejectClose: false, ok: { label: "Verstanden" } }); return undefined; }
  const options = owned.map((actor) => `<option value="${escapeHtml(actor.id)}">${escapeHtml(actor.name ?? actor.id)}</option>`).join("");
  const result = await DialogV2.input({ window: { title: "Anhänger-Hub – Charakter auswählen" }, content: `<p>${explanation}</p><label>Charakter<select name="actorId">${options}</select></label>`, rejectClose: false, ok: { label: "Anhänger-Hub öffnen" } });
  const actorId = typeof result?.actorId === "string" ? result.actorId : "";
  return owned.find((actor) => actor.id === actorId);
}
