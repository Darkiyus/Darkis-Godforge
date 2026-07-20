import type { DeityService } from "../core/deity-service";
import type { GodForgeApi } from "../api";
import { getFoundryRuntime } from "./runtime";
import { JournalDeityRepository } from "./journal-repository";

const namespace = "darkis-godforge";
export function registerFoundryBootstrap(api: GodForgeApi, deityService: DeityService, openDashboard: () => void): void {
  const runtime = getFoundryRuntime(); if (!runtime) return;
  runtime.Hooks.once("init", () => {
    runtime.game?.settings?.register(namespace, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: true, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } });
    runtime.game?.keybindings?.register(namespace, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => { openDashboard(); return true; } });
  });
  runtime.Hooks.on("getSceneControlButtons", (...args: unknown[]) => {
    const controls = args[0]; if (!Array.isArray(controls)) return;
    const control = controls.find((entry): entry is { tools?: unknown[] } => typeof entry === "object" && entry !== null && "tools" in entry);
    if (!control?.tools || !Array.isArray(control.tools)) return;
    control.tools.push({ name: namespace, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: openDashboard, visible: true });
  });
  runtime.Hooks.once("ready", () => {
    const collection = runtime.game?.journal; if (collection) for (const deity of new JournalDeityRepository(collection).load()) deityService.save(deity);
    const module = runtime.game?.modules?.get(namespace); if (module) module.api = api;
  });
}
