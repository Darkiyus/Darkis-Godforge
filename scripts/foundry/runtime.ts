import type { DeityDefinition } from "../core/types";

export interface FoundryJournalDocument { id: string; uuid: string; name: string; flags?: Record<string, unknown>; update(data: Record<string, unknown>): Promise<unknown>; }
export interface FoundryJournalCollection { contents: FoundryJournalDocument[]; create?(data: Record<string, unknown>): Promise<FoundryJournalDocument>; }
export interface FoundryHooks { once(event: string, callback: (...args: unknown[]) => void): void; on(event: string, callback: (...args: unknown[]) => void): void; callAll(event: string, ...args: unknown[]): void; }
export interface FoundryGame { user?: { id?: string; isGM?: boolean }; system?: { id?: string }; actors?: { get(id: string): unknown }; journal?: FoundryJournalCollection; packs?: { contents?: unknown[] }; settings?: { register(namespace: string, key: string, config: Record<string, unknown>): void; registerMenu?(namespace: string, key: string, config: Record<string, unknown>): void; get?(namespace: string, key: string): unknown }; keybindings?: { register(namespace: string, key: string, config: Record<string, unknown>): void }; modules?: { get(id: string): { api?: unknown; active?: boolean; languages?: Array<{ lang: string; name: string; path?: string }> } | undefined }; i18n?: { localize?(key: string): string } }
export interface FoundryRuntime { Hooks: FoundryHooks }
export interface FoundryUi { notifications?: { error?: (message: string) => void; warn?: (message: string) => void } }

declare const Hooks: FoundryHooks | undefined;
declare const game: FoundryGame | undefined;
declare const ui: FoundryUi | undefined;

export function getFoundryRuntime(): FoundryRuntime | null {
  const fallback = globalThis as unknown as { Hooks?: FoundryHooks };
  const foundryHooks = typeof Hooks !== "undefined" ? Hooks : fallback.Hooks;
  return foundryHooks ? { Hooks: foundryHooks } : null;
}

export function getFoundryGame(): FoundryGame | undefined {
  const fallback = globalThis as unknown as { game?: FoundryGame };
  return typeof game !== "undefined" ? game : fallback.game;
}

export function getFoundryUi(): FoundryUi | undefined {
  const fallback = globalThis as unknown as { ui?: FoundryUi };
  return typeof ui !== "undefined" ? ui : fallback.ui;
}

export function isDeityDefinition(value: unknown): value is DeityDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DeityDefinition>;
  return typeof candidate.id === "string" && typeof candidate.name === "string" && typeof candidate.schemaVersion === "number" && Array.isArray(candidate.domains) && Array.isArray(candidate.abilities);
}
