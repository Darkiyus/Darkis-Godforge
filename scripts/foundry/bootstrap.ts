import type { DeityService } from "../core/deity-service";
import type { GodForgeApi } from "../api";
import { getFoundryRuntime } from "./runtime";
import { JournalDeityRepository } from "./journal-repository";
import type { SocketRouter } from "./socket-router";
import { createSocketlibTransport } from "./socketlib-transport";
import { loadLanguage } from "./i18n";
import { GodForgeDashboard } from "../applications/dashboard";

const namespace = "darkis-godforge";

interface SceneControlTool { name: string; title: string; icon: string; order: number; button: boolean; visible: boolean; onChange: (_event: Event, _active: boolean) => void; }
interface SceneControl { name?: string; tools?: Record<string, SceneControlTool | Record<string, unknown>> | Array<Record<string, unknown>>; }

export function createDashboardSettingsMenu(deityService: DeityService): new () => GodForgeDashboard {
  return class GodForgeDashboardSettingsMenu extends GodForgeDashboard {
    constructor() { super(deityService); }
  };
}

export function addDashboardSceneControl(controls: unknown, openDashboard: () => void, isGM: boolean): void {
  const tool = { name: namespace, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 0, button: true, visible: isGM, onChange: (_event: Event, _active: boolean) => openDashboard() };
  if (Array.isArray(controls)) {
    const control = controls.find((entry): entry is SceneControl => typeof entry === "object" && entry !== null && (entry as SceneControl).name === "token") ?? controls.find((entry): entry is SceneControl => typeof entry === "object" && entry !== null && Array.isArray((entry as SceneControl).tools));
    if (!control || !Array.isArray(control.tools)) return;
    tool.order = control.tools.length;
    control.tools.push({ ...tool, onClick: openDashboard });
    return;
  }
  if (!controls || typeof controls !== "object") return;
  const record = controls as Record<string, SceneControl>;
  const control = record.tokens ?? Object.values(record).find((entry) => entry?.name === "tokens" || entry?.name === "token");
  if (!control?.tools || Array.isArray(control.tools)) return;
  tool.order = Object.keys(control.tools).length;
  control.tools[namespace] = tool;
}

export function registerFoundryBootstrap(api: GodForgeApi, deityService: DeityService, openDashboard: () => void, socketRouter?: SocketRouter): void {
  const runtime = getFoundryRuntime(); if (!runtime) return;
  runtime.Hooks.once("init", () => {
    const languages = runtime.game?.modules?.get(namespace)?.languages ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }]; const choices = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...languages.map((language) => [language.lang, language.name])]);
    runtime.game?.settings?.registerMenu?.(namespace, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: createDashboardSettingsMenu(deityService), restricted: true });
    runtime.game?.settings?.register(namespace, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: true, type: String, default: "auto", choices, onChange: (language: unknown) => { if (typeof language !== "string" || language === "auto") return; const entry = languages.find((item) => item.lang === language); if (entry?.path) void loadLanguage(language, `modules/${namespace}/${entry.path}`); } });
    runtime.game?.keybindings?.register(namespace, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => { if (runtime.game?.user?.isGM !== true) return false; openDashboard(); return true; } });
  });
  runtime.Hooks.on("getSceneControlButtons", (...args: unknown[]) => {
    addDashboardSceneControl(args[0], openDashboard, runtime.game?.user?.isGM === true);
  });
  runtime.Hooks.once("ready", async () => {
    const selectedLanguage = runtime.game?.settings?.get?.(namespace, "language"); const languageEntry = runtime.game?.modules?.get(namespace)?.languages?.find((entry) => entry.lang === selectedLanguage); if (typeof selectedLanguage === "string" && languageEntry?.path) await loadLanguage(selectedLanguage, `modules/${namespace}/${languageEntry.path}`);
    const collection = runtime.game?.journal; if (collection) for (const deity of new JournalDeityRepository(collection).load()) deityService.save(deity);
    const transport = createSocketlibTransport(runtime.game?.modules?.get("socketlib")?.api); if (transport && socketRouter) { socketRouter.setTransport(transport); socketRouter.register(); }
    const module = runtime.game?.modules?.get(namespace); if (module) { const exposedApi = api as GodForgeApi & { openDashboard: () => void }; exposedApi.openDashboard = openDashboard; module.api = exposedApi; }
  });
}
