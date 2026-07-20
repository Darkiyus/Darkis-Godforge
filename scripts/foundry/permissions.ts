import type { ActorGodForgeState } from "../core/types";
import type { ViewerContext } from "../core/visibility-service";
import { localize } from "./i18n";
import { getFoundryGame, getFoundryUi } from "./runtime";

export function requireGM(): void {
  const game = getFoundryGame();
  if (!game || game.user?.isGM === true) return;
  const message = localize("DARKIS_GODFORGE.ERROR.GM_ONLY");
  getFoundryUi()?.notifications?.warn?.(message);
  throw new Error("GodForge: GM only.");
}

export function currentViewerContext(selection = false): ViewerContext {
  const user = getFoundryGame()?.user;
  const actor = user?.character as { flags?: Record<string, unknown>; testUserPermission?: (user: unknown, permission: string) => boolean } | undefined;
  const state = actor?.flags?.["darkis-godforge"] as Partial<ActorGodForgeState> | undefined;
  return {
    isGM: user?.isGM === true,
    isTrusted: user?.isTrusted === true || (typeof user?.role === "number" && user.role >= 2),
    selection,
    actorDeityId: typeof state?.deityId === "string" ? state.deityId : undefined,
    ownsActor: actor?.testUserPermission?.(user, "OWNER") ?? Boolean(actor)
  };
}
