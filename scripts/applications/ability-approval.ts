import type { PreparedAbility } from "../core/execution-plan";
import { summarizeOperation } from "../core/execution-plan";
import { handlebarsApplicationBase } from "../foundry/application-base";
import { uiText } from "../foundry/i18n";
import { requireGM } from "../foundry/permissions";

export class GodForgeAbilityApproval extends handlebarsApplicationBase() {
  static DEFAULT_OPTIONS = { id: "darkis-godforge-ability-approval", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.APPROVAL_TITLE", resizable: true }, position: { width: 680, height: 650 } };
  static PARTS = { main: { template: "modules/darkis-godforge/templates/ability-approval.hbs" } };
  private resolve?: (approved: boolean) => void;
  private settled = false;
  constructor(private readonly prepared: PreparedAbility) { super(); }
  async _prepareContext(): Promise<Record<string, unknown>> {
    requireGM();
    return { ui: uiText(), prepared: this.prepared, operations: this.prepared.operations.map((operation) => ({ kind: operation.kind, summary: summarizeOperation(operation), dangerous: operation.kind === "actor-update" || operation.kind === "movement" || operation.kind === "resource" })) };
  }
  _onRender(): void {
    const root = this.element;
    root?.querySelector<HTMLElement>("[data-action='approve']")?.addEventListener("click", () => this.finish(true));
    root?.querySelector<HTMLElement>("[data-action='deny']")?.addEventListener("click", () => this.finish(false));
  }
  wait(): Promise<boolean> { return new Promise((resolve) => { this.resolve = resolve; void this.render(true).catch(() => this.settle(false, false)); }); }
  _onClose(): void { this.settle(false, false); }
  private finish(approved: boolean): void { this.settle(approved, true); }
  private settle(approved: boolean, close: boolean): void {
    if (this.settled) return;
    this.settled = true;
    this.resolve?.(approved);
    this.resolve = undefined;
    if (close) void this.close?.();
  }
}
