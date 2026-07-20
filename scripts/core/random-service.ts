import type { VisibilityLevel } from "./types";

export interface RandomEntry { id: string; label: string; weight: number; category?: "positive" | "neutral" | "negative" | "catastrophic" | "jackpot"; description?: string; visibleToPlayers?: boolean; }
export interface RandomDraw { entry: RandomEntry; index: number; roll: number; }
export function drawWeighted(entries: RandomEntry[], random: () => number): RandomDraw { const valid = entries.filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0); const total = valid.reduce((sum, entry) => sum + entry.weight, 0); if (!valid.length || total <= 0) throw new Error("Random table has no selectable entries."); const roll = Math.min(Math.max(random(), 0), 0.999999999) * total; let cursor = 0; for (const [index, entry] of valid.entries()) { cursor += entry.weight; if (roll < cursor) return { entry, index, roll }; } const last = valid[valid.length - 1]!; return { entry: last, index: valid.length - 1, roll };
}
export interface WheelState { status: "requested" | "resolved"; draw: RandomDraw; }
export function resolveWheel(entries: RandomEntry[], random: () => number): WheelState { return { status: "resolved", draw: drawWeighted(entries, random) }; }

export interface RandomTableDefinition { id: string; name: string; formula: string; visibility: VisibilityLevel; entries: RandomEntry[]; updatedAt: string; }
export interface FortuneWheelDefinition { id: string; name: string; tableId: string; visibility: VisibilityLevel; duration: number; minimumSpins: number; updatedAt: string; }
export interface RandomContentSnapshot { tables: RandomTableDefinition[]; wheels: FortuneWheelDefinition[]; }

export function validateRandomContentSnapshot(value: unknown): value is Partial<RandomContentSnapshot> {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RandomContentSnapshot>;
  if (candidate.tables !== undefined && !Array.isArray(candidate.tables)) return false;
  if (candidate.wheels !== undefined && !Array.isArray(candidate.wheels)) return false;
  const tables = candidate.tables ?? [];
  const tableIds = new Set<string>();
  for (const table of tables) {
    if (!isRecord(table) || !isText(table.id) || tableIds.has(table.id) || !isText(table.name) || !isText(table.formula) || !isVisibility(table.visibility) || !Array.isArray(table.entries) || !table.entries.length || !table.entries.every(isRandomEntry)) return false;
    tableIds.add(table.id);
  }
  const wheelIds = new Set<string>();
  for (const wheel of candidate.wheels ?? []) {
    if (!isRecord(wheel) || !isText(wheel.id) || wheelIds.has(wheel.id) || !isText(wheel.name) || !isText(wheel.tableId) || !tableIds.has(wheel.tableId) || !isVisibility(wheel.visibility) || !isPositiveNumber(wheel.duration) || !isPositiveNumber(wheel.minimumSpins)) return false;
    wheelIds.add(wheel.id);
  }
  return true;
}

export class RandomContentService {
  private readonly tables = new Map<string, RandomTableDefinition>();
  private readonly wheels = new Map<string, FortuneWheelDefinition>();
  private persistContent?: (snapshot: RandomContentSnapshot) => Promise<unknown>;
  setPersistence(handler: (snapshot: RandomContentSnapshot) => Promise<unknown>): void { this.persistContent = handler; }
  load(snapshot: Partial<RandomContentSnapshot> | null | undefined): void { const input = snapshot ?? {}; if (!validateRandomContentSnapshot(input)) throw new Error("Invalid GodForge random content."); this.tables.clear(); this.wheels.clear(); for (const table of input.tables ?? []) this.tables.set(table.id, structuredClone(table)); for (const wheel of input.wheels ?? []) this.wheels.set(wheel.id, structuredClone(wheel)); }
  replace(snapshot: Partial<RandomContentSnapshot>): void { this.load(snapshot); this.persist(); }
  snapshot(): RandomContentSnapshot { return { tables: this.listTables(), wheels: this.listWheels() }; }
  listTables(): RandomTableDefinition[] { return [...this.tables.values()].map((item) => structuredClone(item)); }
  listWheels(): FortuneWheelDefinition[] { return [...this.wheels.values()].map((item) => structuredClone(item)); }
  getTable(id: string): RandomTableDefinition | null { const table = this.tables.get(id); return table ? structuredClone(table) : null; }
  createTable(input: Omit<RandomTableDefinition, "id" | "updatedAt">): RandomTableDefinition { if (!input.name.trim() || !input.entries.length) throw new Error("Random table requires a name and entries."); const table = { ...structuredClone(input), id: crypto.randomUUID(), updatedAt: new Date().toISOString() }; this.tables.set(table.id, table); this.persist(); return structuredClone(table); }
  createWheel(input: Omit<FortuneWheelDefinition, "id" | "updatedAt">): FortuneWheelDefinition { if (!this.tables.has(input.tableId)) throw new Error("Fortune wheel table was not found."); const wheel = { ...structuredClone(input), id: crypto.randomUUID(), updatedAt: new Date().toISOString() }; this.wheels.set(wheel.id, wheel); this.persist(); return structuredClone(wheel); }
  drawTable(id: string, random: () => number): RandomDraw { const table = this.tables.get(id); if (!table) throw new Error("Random table was not found."); return drawWeighted(table.entries, random); }
  spinWheel(id: string, random: () => number): WheelState { const wheel = this.wheels.get(id); if (!wheel) throw new Error("Fortune wheel was not found."); return resolveWheel(this.tables.get(wheel.tableId)?.entries ?? [], random); }
  private persist(): void { if (this.persistContent) void this.persistContent(this.snapshot()).catch((error: unknown) => console.error("Darkis GodForge | Could not persist random content.", error)); }
}

function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object"; }
function isText(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= 10_000; }
function isPositiveNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value) && value > 0; }
function isVisibility(value: unknown): value is VisibilityLevel { return value === "public" || value === "selection" || value === "followers" || value === "owner" || value === "gm" || value === "hidden-until-selected"; }
function isRandomEntry(value: unknown): value is RandomEntry { if (!isRecord(value) || !isText(value.id) || !isText(value.label) || !isPositiveNumber(value.weight)) return false; if (value.description !== undefined && typeof value.description !== "string") return false; return value.category === undefined || value.category === "positive" || value.category === "neutral" || value.category === "negative" || value.category === "catastrophic" || value.category === "jackpot"; }
