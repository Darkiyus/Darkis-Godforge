import type { ActorGodForgeState } from "../core/types";
import type { ViewerContext } from "../core/visibility-service";
import { localize } from "./i18n";
import { getFoundryGame, getFoundryUi } from "./runtime";

export function requireGM(): void {
  if (isCurrentUserGM()) return;
  notifyGMOnly();
  throw new Error("GodForge: GM only.");
}

export function isCurrentUserGM(): boolean { return getFoundryGame()?.user?.isGM === true; }

export function notifyGMOnly(): void { getFoundryUi()?.notifications?.warn?.(localize("DARKIS_GODFORGE.ERROR.GM_ONLY")); }

export function currentViewerContext(selection = false): ViewerContext {
  const user = getFoundryGame()?.user;
  const actor = user?.character as { flags?: Record<string, unknown>; testUserPermission?: (user: unknown, permission: string) => boolean } | undefined;
  const state = actor?.flags?.["darkis-godforge"] as Partial<ActorGodForgeState> | undefined;
  return {
    isGM: user?.isGM === true,
    isTrusted: user?.isTrusted === true || (typeof user?.role === "number" && user.role >= 2),
    selection,
    actorDeityId: typeof state?.deityId === "string" ? state.deityId : undefined,
    ownsActor: Boolean(user && actor?.testUserPermission?.(user, "OWNER") === true)
  };
}
