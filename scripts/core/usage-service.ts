import type { ResetType } from "./types";

export interface UsageState { used: number; max: number; lastResetAt: number; reset: ResetType; }
export function canUse(state: UsageState, now: number): boolean { void now; return state.used < state.max; }
export function consume(state: UsageState, now: number): UsageState { if (!canUse(state, now)) throw new Error("No uses remaining."); return { ...state, used: state.used + 1 }; }
export function shouldReset(state: UsageState, now: number, dayMs = 86400000): boolean {
  const elapsedDays: Partial<Record<ResetType, number>> = { daily: 1, "calendar-day": 1, weekly: 7, "calendar-week": 7, "calendar-month": 30, "calendar-year": 365 };
  const days = elapsedDays[state.reset];
  return days !== undefined && now - state.lastResetAt >= dayMs * days;
}
export function reset(state: UsageState, now: number): UsageState { return { ...state, used: 0, lastResetAt: now }; }
