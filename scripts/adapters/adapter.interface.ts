import type { DeityDefinition } from "../core/types";
export interface AdapterCapabilities { lore: boolean; deity: boolean; passiveBonuses: boolean; abilities: boolean; classCoupling: boolean; selectors: string[]; }
export interface MaterializationContext { createItem(data: Record<string, unknown>): Promise<{ uuid: string }>; }
export interface GodForgeSystemAdapter { readonly id: string; readonly capabilities: AdapterCapabilities; materialize(deity: DeityDefinition, context?: MaterializationContext): Promise<string | null>; buildPassiveBonus(bonus: DeityDefinition["passiveBonuses"][number]): object | null; }
