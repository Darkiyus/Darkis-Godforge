import type { SystemChoice, SystemEditorCatalog } from "./adapter.interface";
import { getFoundryGame } from "../foundry/runtime";

interface IndexEntry { _id?: string; name?: string; img?: string; type?: string; system?: Record<string, unknown>; }
interface ItemPack { collection?: string; documentName?: string; metadata?: { system?: string; label?: string }; getIndex(options?: { fields?: string[] }): Promise<Iterable<IndexEntry>>; }

const cache = new Map<string, Promise<SystemEditorCatalog>>();

export function loadSystemEditorCatalog(systemId: string, fallbackSkills: string[]): Promise<SystemEditorCatalog> {
  const key = `${systemId}:${getFoundryGame()?.system?.version ?? ""}`;
  const existing = cache.get(key);
  if (existing) return existing;
  const loading = buildCatalog(systemId, fallbackSkills).catch((error) => { cache.delete(key); throw error; });
  cache.set(key, loading);
  return loading;
}

async function buildCatalog(systemId: string, fallbackSkills: string[]): Promise<SystemEditorCatalog> {
  const config = readSystemConfig(systemId);
  const packs = (getFoundryGame()?.packs?.contents ?? []) as ItemPack[];
  const itemPacks = packs.filter((pack) => pack.documentName === "Item" && (!pack.metadata?.system || pack.metadata.system === systemId));
  const weapons: SystemChoice[] = [];
  const spells: SystemChoice[] = [];
  for (const pack of itemPacks) {
    const index = await pack.getIndex({ fields: ["type", "img", "system.slug", "system.category", "system.group", "system.traits", "system.level", "system.rank"] });
    for (const entry of index) {
      if (!entry._id || !entry.name || !pack.collection || (entry.type !== "weapon" && entry.type !== "spell")) continue;
      const system = entry.system ?? {};
      const choice: SystemChoice = {
        value: `Compendium.${pack.collection}.Item.${entry._id}`,
        label: entry.name,
        slug: stringValue(system.slug) ?? entry.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        img: entry.img,
        category: stringValue(system.category),
        group: stringValue(system.group),
        traits: stringArray((system.traits as { value?: unknown } | undefined)?.value ?? system.traits),
        source: pack.metadata?.label ?? pack.collection,
        rank: numberValue(system.rank ?? (system.level as { value?: unknown } | undefined)?.value ?? system.level)
      };
      if (entry.type === "weapon") weapons.push(choice); else spells.push(choice);
    }
  }
  const skills = configChoices(config.skills, fallbackSkills);
  return {
    skills,
    domains: configChoices(config.deityDomains ?? config.domains, []),
    weapons: uniqueSorted(weapons),
    spells: uniqueSorted(spells),
    fonts: [choice("heal", "Heilen / Heal"), choice("harm", "Schaden / Harm"), choice("heal-harm", "Heilen oder Schaden / Either"), choice("none", "Keine / None")],
    sanctifications: [choice("holy", "Heilig / Holy"), choice("unholy", "Unheilig / Unholy"), choice("holy-unholy", "Heilig oder unheilig / Either"), choice("none", "Keine / None")],
    attributes: configChoices(config.abilities ?? config.attributes, ["str", "dex", "con", "int", "wis", "cha"])
  };
}

function readSystemConfig(systemId: string): Record<string, unknown> {
  const globals = globalThis as unknown as { CONFIG?: Record<string, Record<string, unknown>> };
  const key = systemId === "sfrpg" ? "SFRPG" : "PF2E";
  return globals.CONFIG?.[key] ?? {};
}
function configChoices(value: unknown, fallback: string[]): SystemChoice[] {
  if (!value || typeof value !== "object") return fallback.map((key) => choice(key, title(key)));
  return Object.entries(value as Record<string, unknown>).map(([key, raw]) => choice(key, localizedLabel(raw, key))).sort((a, b) => a.label.localeCompare(b.label));
}
function localizedLabel(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value : value && typeof value === "object" ? String((value as Record<string, unknown>).label ?? (value as Record<string, unknown>).name ?? fallback) : fallback;
  const localized = getFoundryGame()?.i18n?.localize?.(raw);
  return localized && localized !== raw ? localized : raw.includes(".") ? title(fallback) : raw;
}
function uniqueSorted(items: SystemChoice[]): SystemChoice[] { return [...new Map(items.map((item) => [item.value, item])).values()].sort((a, b) => a.label.localeCompare(b.label)); }
function choice(value: string, label: string): SystemChoice { return { value, label }; }
function title(value: string): string { return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function stringValue(value: unknown): string | undefined { if (typeof value === "string") return value; if (value && typeof value === "object" && typeof (value as Record<string, unknown>).value === "string") return String((value as Record<string, unknown>).value); return undefined; }
function stringArray(value: unknown): string[] | undefined { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined; }
function numberValue(value: unknown): number | undefined { const result = Number(value); return Number.isFinite(result) ? result : undefined; }
