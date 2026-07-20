import type { ActivationOptions, GodForgeActor, GodForgeApi } from "../api";

export type ActivationStatus = "requested" | "validated" | "running" | "completed" | "aborted";
export interface ActivationRequest { activationId: string; actorId: string; userId: string; abilityId: string; options: ActivationOptions; }
export interface SocketTransport { register(name: string, handler: (payload: unknown) => Promise<unknown>): void; executeAsGM(name: string, payload: unknown): Promise<unknown>; }
export interface AuthorityContext { currentUserId: string; isGM: boolean; ownsActor(actor: GodForgeActor, userId: string): boolean; resolveActor(actorId: string): GodForgeActor | null; }

export class SocketRouter {
  private readonly activations = new Map<string, ActivationStatus>();
  constructor(private readonly api: GodForgeApi, private readonly authority: AuthorityContext, private transport?: SocketTransport) {}
  setTransport(transport: SocketTransport): void { this.transport = transport; }
  register(): void { this.transport?.register("activateAbility", async (payload) => this.handleActivation(this.parseRequest(payload))); }
  async activate(request: Omit<ActivationRequest, "activationId" | "userId">): Promise<void> {
    const full: ActivationRequest = { ...request, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    this.activations.set(full.activationId, "requested");
    if (!this.authority.isGM) { if (!this.transport) throw new Error("GM authority is unavailable."); await this.transport.executeAsGM("activateAbility", full); return; }
    await this.handleActivation(full);
  }
  status(activationId: string): ActivationStatus | null { return this.activations.get(activationId) ?? null; }
  private async handleActivation(request: ActivationRequest): Promise<void> {
    if (this.activations.has(request.activationId) && this.activations.get(request.activationId) !== "requested") throw new Error("Activation request has already been processed.");
    this.activations.set(request.activationId, "requested");
    const actor = this.authority.resolveActor(request.actorId); if (!actor) { this.activations.set(request.activationId, "aborted"); throw new Error("Target actor was not found."); }
    if (!this.authority.isGM && !this.authority.ownsActor(actor, request.userId)) { this.activations.set(request.activationId, "aborted"); throw new Error("User is not allowed to modify this actor."); }
    this.activations.set(request.activationId, "validated"); this.activations.set(request.activationId, "running");
    try { await this.api.activateAbility(actor, request.abilityId, request.options); this.activations.set(request.activationId, "completed"); } catch (error) { this.activations.set(request.activationId, "aborted"); throw error; }
  }
  private parseRequest(payload: unknown): ActivationRequest { if (!payload || typeof payload !== "object") throw new Error("Invalid socket request."); const candidate = payload as Partial<ActivationRequest>; if (typeof candidate.activationId !== "string" || typeof candidate.actorId !== "string" || typeof candidate.userId !== "string" || typeof candidate.abilityId !== "string") throw new Error("Invalid socket request."); return { activationId: candidate.activationId, actorId: candidate.actorId, userId: candidate.userId, abilityId: candidate.abilityId, options: candidate.options ?? {} }; }
}
