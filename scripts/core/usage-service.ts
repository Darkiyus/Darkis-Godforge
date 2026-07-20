import type { ResetType } from "./types";

export interface UsageState { used: number; max: number; lastResetAt: number; reset: ResetType; }
export function canUse(state: UsageState, now: number): boolean { void now; return state.used < state.max; }
export function consume(state: UsageState, now: number): UsageState { if (!canUse(state, now)) throw new Error("No uses remaining."); return { ...state, used: state.used + 1 }; }
export function shouldReset(state: UsageState, now: number, dayMs = 86400000): boolean { if (state.reset === "manual" || state.reset === "encounter") return false; const elapsed = now - state.lastResetAt; return state.reset === "daily" ? elapsed >= dayMs : elapsed >= dayMs * 7; }
export function reset(state: UsageState, now: number): UsageState { return { ...state, used: 0, lastResetAt: now }; }
