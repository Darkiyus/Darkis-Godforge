import type { DeityDefinition, DeitySummary } from "../core/types";
import type { ClassGrantResult } from "../core/class-coupling";
export interface AdapterCapabilities { lore: boolean; deity: boolean; passiveBonuses: boolean; abilities: boolean; classCoupling: boolean; selectors: string[]; }
export interface SystemChoice { value: string; label: string; slug?: string; img?: string; group?: string; category?: string; traits?: string[]; source?: string; rank?: number; }
export interface SystemEditorCatalog { skills: SystemChoice[]; domains: SystemChoice[]; weapons: SystemChoice[]; spells: SystemChoice[]; fonts: SystemChoice[]; sanctifications: SystemChoice[]; attributes: SystemChoice[]; }
export interface MaterializationContext { createItem(data: Record<string, unknown>): Promise<{ uuid: string }>; }
export interface GodForgeSystemAdapter { readonly id: string; readonly capabilities: AdapterCapabilities; materialize(deity: DeityDefinition, context?: MaterializationContext): Promise<string | null>; listOfficialDeities(): Promise<DeitySummary[]>; listSkills(): string[]; listEditorCatalog(): Promise<SystemEditorCatalog>; buildPassiveBonus(bonus: DeityDefinition["passiveBonuses"][number]): object | null; buildClassCoupling(result: ClassGrantResult): object | null; }
