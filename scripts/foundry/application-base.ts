export interface FoundryApplicationInstance { render(force?: boolean): Promise<unknown>; close?(): Promise<unknown>; element?: HTMLElement; }
type ApplicationConstructor = new (...args: never[]) => FoundryApplicationInstance;
export function handlebarsApplicationBase(): ApplicationConstructor {
  const runtime = globalThis as unknown as { foundry?: { applications?: { api?: { ApplicationV2?: ApplicationConstructor; HandlebarsApplicationMixin?: (base: ApplicationConstructor) => ApplicationConstructor } } } };
  const api = runtime.foundry?.applications?.api; if (api?.ApplicationV2 && api.HandlebarsApplicationMixin) return api.HandlebarsApplicationMixin(api.ApplicationV2);
  return class { render(): Promise<unknown> { return Promise.resolve(this); } };
}
