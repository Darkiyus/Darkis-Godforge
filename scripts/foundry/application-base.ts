export interface FoundryApplicationInstance { render(force?: boolean): Promise<unknown>; close?(): Promise<unknown>; element?: HTMLElement; }
type ApplicationConstructor = new (...args: never[]) => FoundryApplicationInstance;
declare const foundry: { applications?: { api?: { ApplicationV2?: ApplicationConstructor; HandlebarsApplicationMixin?: (base: ApplicationConstructor) => ApplicationConstructor } } } | undefined;
export function handlebarsApplicationBase(): ApplicationConstructor {
  const runtime = globalThis as unknown as { foundry?: typeof foundry };
  const namespace = typeof foundry !== "undefined" ? foundry : runtime.foundry;
  const api = namespace?.applications?.api; if (api?.ApplicationV2 && api.HandlebarsApplicationMixin) return api.HandlebarsApplicationMixin(api.ApplicationV2);
  return class { render(): Promise<unknown> { return Promise.resolve(this); } };
}
