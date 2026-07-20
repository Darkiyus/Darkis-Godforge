export interface RandomEntry { id: string; label: string; weight: number; }
export interface RandomDraw { entry: RandomEntry; index: number; roll: number; }
export function drawWeighted(entries: RandomEntry[], random: () => number): RandomDraw { const valid = entries.filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0); const total = valid.reduce((sum, entry) => sum + entry.weight, 0); if (!valid.length || total <= 0) throw new Error("Random table has no selectable entries."); const roll = Math.min(Math.max(random(), 0), 0.999999999) * total; let cursor = 0; for (const [index, entry] of valid.entries()) { cursor += entry.weight; if (roll < cursor) return { entry, index, roll }; } const last = valid[valid.length - 1]!; return { entry: last, index: valid.length - 1, roll };
}
export interface WheelState { status: "requested" | "resolved"; draw: RandomDraw; }
export function resolveWheel(entries: RandomEntry[], random: () => number): WheelState { return { status: "resolved", draw: drawWeighted(entries, random) }; }
