import type { EffectTarget } from "./effect-engine";

export type TargetMode = "self" | "single" | "area";
export interface TargetQuery { mode: TargetMode; maxTargets?: number; predicate?: (target: EffectTarget) => boolean; }
export function resolveTargets(actor: EffectTarget, candidates: EffectTarget[], query: TargetQuery): EffectTarget[] { if (query.mode === "self") return [actor]; const filtered = candidates.filter((candidate) => candidate.id !== actor.id && (query.predicate?.(candidate) ?? true)); return query.mode === "single" ? filtered.slice(0, 1) : filtered.slice(0, query.maxTargets ?? filtered.length); }
