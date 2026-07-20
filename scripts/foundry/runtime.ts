import type { DeityDefinition } from "../core/types";

export interface FoundryJournalDocument { id: string; uuid: string; name: string; flags?: Record<string, unknown>; update(data: Record<string, unknown>): Promise<unknown>; }
export interface FoundryJournalCollection { contents: FoundryJournalDocument[]; create?(data: Record<string, unknown>): Promise<FoundryJournalDocument>; }
export interface FoundryHooks { once(event: string, callback: (...args: unknown[]) => void): void; on(event: string, callback: (...args: unknown[]) => void): void; callAll(event: string, ...args: unknown[]): void; }
export interface FoundryRuntime { Hooks: FoundryHooks; game?: { user?: { id?: string; isGM?: boolean }; system?: { id?: string }; journal?: FoundryJournalCollection; settings?: { register(namespace: string, key: string, config: Record<string, unknown>): void; get?(namespace: string, key: string): unknown }; keybindings?: { register(namespace: string, key: string, config: Record<string, unknown>): void }; modules?: { get(id: string): { api?: unknown; languages?: Array<{ lang: string; name: string; path?: string }> } | undefined } }; }

export function getFoundryRuntime(): FoundryRuntime | null {
  const value = globalThis as unknown as { Hooks?: FoundryHooks; game?: FoundryRuntime["game"] };
  return value.Hooks ? { Hooks: value.Hooks, game: value.game } : null;
}

export function isDeityDefinition(value: unknown): value is DeityDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DeityDefinition>;
  return typeof candidate.id === "string" && typeof candidate.name === "string" && typeof candidate.schemaVersion === "number" && Array.isArray(candidate.domains) && Array.isArray(candidate.abilities);
}
