import { localize } from "./i18n";
import { getFoundryUi } from "./runtime";

export function reportActionError(context: string, error: unknown): void {
  console.error(`Darkis GodForge | ${context}`, error);
  getFoundryUi()?.notifications?.error?.(localize("DARKIS_GODFORGE.ERROR.ACTION_FAILED"));
}
