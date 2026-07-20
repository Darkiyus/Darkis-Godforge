import english from "../../lang/en.json";
import { getFoundryGame } from "./runtime";

type Catalog = Record<string, unknown>;
const catalogs = new Map<string, Catalog>([["en", english as Catalog]]);
export async function loadLanguage(language: string, path: string): Promise<void> { if (language === "auto" || catalogs.has(language)) return; const response = await fetch(path); if (!response.ok) throw new Error(`Unable to load GodForge language ${language}.`); catalogs.set(language, await response.json() as Catalog); }
export function localize(key: string): string { const game = getFoundryGame() as { settings?: { get?: (namespace: string, key: string) => unknown }; i18n?: { localize?: (key: string) => string } } | undefined; const language = game?.settings?.get?.("darkis-godforge", "language"); if (typeof language === "string" && language !== "auto") { const value = lookup(catalogs.get(language), key); if (typeof value === "string") return value; } const foundryValue = game?.i18n?.localize?.(key); if (foundryValue && foundryValue !== key) return foundryValue; const fallback = lookup(english as Catalog, key); return typeof fallback === "string" ? fallback : key; }
export function uiText(): Record<string, string> { return Object.fromEntries(Object.keys(english.DARKIS_GODFORGE.UI).map((name) => [name, localize(`DARKIS_GODFORGE.UI.${name}`)])); }
function lookup(catalog: Catalog | undefined, key: string): unknown { return key.split(".").reduce<unknown>((current, part) => current && typeof current === "object" ? (current as Catalog)[part] : undefined, catalog); }
