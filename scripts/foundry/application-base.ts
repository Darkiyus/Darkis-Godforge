import { getFoundryRuntime } from "./runtime";
import { isCurrentUserGM, notifyGMOnly } from "./permissions";

export interface FoundryApplicationInstance { render(force?: boolean): Promise<unknown>; close?(): Promise<unknown>; element?: HTMLElement; }
type ApplicationConstructor = new (...args: never[]) => FoundryApplicationInstance;
declare const foundry: { applications?: { api?: { ApplicationV2?: ApplicationConstructor; HandlebarsApplicationMixin?: (base: ApplicationConstructor) => ApplicationConstructor } } } | undefined;
export function handlebarsApplicationBase(): ApplicationConstructor {
  const runtime = globalThis as unknown as { foundry?: typeof foundry };
  const namespace = typeof foundry !== "undefined" ? foundry : runtime.foundry;
  const api = namespace?.applications?.api; if (api?.ApplicationV2 && api.HandlebarsApplicationMixin) return api.HandlebarsApplicationMixin(api.ApplicationV2);
  if (getFoundryRuntime()) {
    const message = "Darkis GodForge | Foundry ApplicationV2 is unavailable while loading the module.";
    console.error(message);
    return class { render(): Promise<never> { return Promise.reject(new Error(message)); } };
  }
  return class { render(): Promise<unknown> { return Promise.resolve(this); } };
}

export function gmApplicationBase(): ApplicationConstructor {
  const Base = handlebarsApplicationBase();
  return class extends Base {
    override render(force?: boolean): Promise<unknown> {
      if (!isCurrentUserGM()) { notifyGMOnly(); return Promise.resolve(this); }
      return super.render(force);
    }
  };
}
