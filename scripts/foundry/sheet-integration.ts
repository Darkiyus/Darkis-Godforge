import type { GodForgeActor } from "../api";
import { localize } from "./i18n";
import { getFoundryGame } from "./runtime";

export function addGodForgeSheetButton(app: unknown, html: unknown, openHub: (actor: GodForgeActor) => void): void {
  const actor = (app as { actor?: GodForgeActor }).actor;
  if (!actor || !hasDeity(actor) || !canUseActor(actor)) return;
  const element = getElement(html);
  const application = element?.closest<HTMLElement>(".application, .window-app, .app") ?? element;
  const header = application?.querySelector<HTMLElement>(".window-header");
  if (!header) return;
  header.querySelector(".darkis-godforge-sheet-button")?.remove();
  const title = localize("DARKIS_GODFORGE.UI.OPEN_HUB");
  const button = document.createElement("a");
  button.className = "darkis-godforge-sheet-button header-control";
  button.title = title; button.setAttribute("aria-label", title); button.setAttribute("role", "button");
  button.innerHTML = '<i class="fas fa-hammer" aria-hidden="true"></i>';
  button.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); openHub(actor); });
  const close = header.querySelector("button.close, a.close, .header-button.close, [data-action='close']");
  if (close) close.before(button); else header.append(button);
}

function getElement(value: unknown): HTMLElement | null {
  if (value instanceof HTMLElement) return value;
  const candidate = value as { 0?: unknown; get?: (index: number) => unknown } | null;
  const element = candidate?.[0] ?? candidate?.get?.(0);
  return element instanceof HTMLElement ? element : null;
}

function hasDeity(actor: GodForgeActor): boolean {
  const state = actor.flags?.["darkis-godforge"];
  return Boolean(state && typeof state === "object" && "deityId" in state);
}

function canUseActor(actor: GodForgeActor): boolean {
  const user = getFoundryGame()?.user;
  return user?.isGM === true || actor.testUserPermission?.(user, "OWNER") === true;
}
