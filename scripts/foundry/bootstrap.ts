import type { DeityService } from "../core/deity-service";
import type { GodForgeApi } from "../api";
import { getFoundryGame, getFoundryRuntime, type FoundryGame } from "./runtime";
import { JournalDeityRepository } from "./journal-repository";
import type { SocketRouter } from "./socket-router";
import { createSocketlibTransport } from "./socketlib-transport";
import { loadLanguage } from "./i18n";
import { GodForgeDashboard } from "../applications/dashboard";
import type { RandomContentService, RandomContentSnapshot } from "../core/random-service";
import type { GodForgeActor } from "../api";
import { addGodForgeSheetButton } from "./sheet-integration";

const namespace = "darkis-godforge";

interface SceneControlTool { name: string; title: string; icon: string; order: number; button: boolean; visible: boolean; onChange: (_event: Event, _active: boolean) => void; }
interface SceneControl { name: string; title?: string; icon?: string; order?: number; visible?: boolean; tools?: Record<string, SceneControlTool | Record<string, unknown>>; }

export function createDashboardSettingsMenu(deityService: DeityService, api?: GodForgeApi, randomContent?: RandomContentService): new () => GodForgeDashboard {
  return class GodForgeDashboardSettingsMenu extends GodForgeDashboard {
    constructor() { super(deityService, undefined, api, randomContent); }
  };
}

export function addDashboardSceneControl(controls: unknown, openDashboard: () => void, openCodex: () => void, isGM: boolean, openHub: () => void = () => undefined): void {
  if (!controls || typeof controls !== "object" || Array.isArray(controls)) return;
  const record = controls as Record<string, SceneControl>;
  const order = Math.max(-1, ...Object.values(record).map((control) => control.order ?? -1)) + 1;
  record[namespace] = {
    name: namespace,
    title: "DARKIS_GODFORGE.UI.TITLE",
    icon: "fas fa-hammer",
    order,
    visible: true,
    tools: {
      hub: { name: "hub", title: "DARKIS_GODFORGE.UI.OPEN_HUB", icon: "fas fa-star", order: 0, button: true, visible: true, onChange: (_event: Event, _active: boolean) => openHub() },
      codex: { name: "codex", title: "DARKIS_GODFORGE.UI.OPEN_CODEX", icon: "fas fa-book-open", order: 1, button: true, visible: true, onChange: (_event: Event, _active: boolean) => openCodex() },
      dashboard: { name: "dashboard", title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 2, button: true, visible: isGM, onChange: (_event: Event, _active: boolean) => openDashboard() }
    }
  };
}

export function registerFoundryBootstrap(api: GodForgeApi, deityService: DeityService, openDashboard: () => void, openCodex: () => void, socketRouter?: SocketRouter, randomContent?: RandomContentService, openHub?: (actor?: GodForgeActor) => void): void {
  const runtime = getFoundryRuntime(); if (!runtime) return;
  runtime.Hooks.once("init", () => {
    const game = requireGame("init"); if (!game) return;
    exposeModuleApi(game, api, openDashboard, openCodex, openHub);
    const languages = game.modules?.get(namespace)?.languages ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }];
    const choices = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...languages.map((language) => [language.lang, language.name])]);
    if (!game.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!game.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try { game.settings.registerMenu(namespace, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: createDashboardSettingsMenu(deityService, api, randomContent), restricted: true }); } catch (error) { console.error("Darkis GodForge | Could not register dashboard settings menu.", error); }
      try { game.settings.register(namespace, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: true, type: String, default: "auto", choices, onChange: (language: unknown) => { if (typeof language !== "string" || language === "auto") return; const entry = languages.find((item) => item.lang === language); if (entry?.path) void loadLanguage(language, `modules/${namespace}/${entry.path}`); } }); } catch (error) { console.error("Darkis GodForge | Could not register language setting.", error); }
      try { game.settings.register(namespace, "random-content", { scope: "world", config: false, type: Object, default: { tables: [], wheels: [] } }); } catch (error) { console.error("Darkis GodForge | Could not register random content storage.", error); }
    }
    if (!game.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try { game.keybindings.register(namespace, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => { if (getFoundryGame()?.user?.isGM !== true) return false; openDashboard(); return true; } }); game.keybindings.register(namespace, "open-hub", { name: "DARKIS_GODFORGE.UI.OPEN_HUB", editable: [{ key: "KeyG" }], restricted: false, onDown: () => { openHub?.(); return true; } }); game.keybindings.register(namespace, "open-codex", { name: "DARKIS_GODFORGE.UI.OPEN_CODEX", editable: [{ key: "KeyG", modifiers: ["Shift"] }], restricted: false, onDown: () => { openCodex(); return true; } }); } catch (error) { console.error("Darkis GodForge | Could not register keybindings.", error); }
  });
  runtime.Hooks.on("getSceneControlButtons", (...args: unknown[]) => {
    addDashboardSceneControl(args[0], openDashboard, openCodex, getFoundryGame()?.user?.isGM === true, () => openHub?.());
  });
  runtime.Hooks.on("renderCharacterSheetPF2e", (app: unknown, html: unknown) => { if (openHub) addGodForgeSheetButton(app, html, openHub); });
  runtime.Hooks.on("renderActorSheet", (app: unknown, html: unknown) => { if (openHub) addGodForgeSheetButton(app, html, openHub); });
  runtime.Hooks.once("ready", async () => {
    const game = requireGame("ready"); if (!game) return;
    exposeModuleApi(game, api, openDashboard, openCodex, openHub);
    try { const selectedLanguage = game.settings?.get?.(namespace, "language"); const languageEntry = game.modules?.get(namespace)?.languages?.find((entry) => entry.lang === selectedLanguage); if (typeof selectedLanguage === "string" && languageEntry?.path) await loadLanguage(selectedLanguage, `modules/${namespace}/${languageEntry.path}`); } catch (error) { console.error("Darkis GodForge | Could not load the selected language.", error); }
    try { if (game.journal) { const repository = new JournalDeityRepository(game.journal); for (const deity of repository.load()) deityService.save(deity); deityService.setPersistence((deity) => repository.save(deity)); } } catch (error) { console.error("Darkis GodForge | Could not load deity journals.", error); }
    try { if (randomContent) { const stored = game.settings?.get?.(namespace, "random-content"); randomContent.load(stored && typeof stored === "object" ? stored as Partial<RandomContentSnapshot> : null); if (game.settings?.set) randomContent.setPersistence((snapshot) => game.settings!.set!(namespace, "random-content", snapshot)); } } catch (error) { console.error("Darkis GodForge | Could not load random content.", error); }
    try { const transport = createSocketlibTransport(game.modules?.get("socketlib")?.api); if (transport && socketRouter) { socketRouter.setTransport(transport); socketRouter.register(); } } catch (error) { console.error("Darkis GodForge | Could not initialize socketlib integration.", error); }
  });
}

function requireGame(stage: "init" | "ready"): FoundryGame | null {
  const game = getFoundryGame();
  if (!game) console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${stage}.`);
  return game ?? null;
}

function exposeModuleApi(game: FoundryGame, api: GodForgeApi, openDashboard: () => void, openCodex: () => void, openHub?: (actor?: GodForgeActor) => void): void {
  const moduleEntry = game.modules?.get(namespace);
  if (!moduleEntry) { console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed."); return; }
  const exposedApi = api as GodForgeApi & { openDashboard: () => void; openCodex: () => void; openHub?: (actor?: GodForgeActor) => void };
  exposedApi.openDashboard = openDashboard;
  exposedApi.openCodex = openCodex;
  if (openHub) exposedApi.openHub = openHub;
  moduleEntry.api = exposedApi;
}
