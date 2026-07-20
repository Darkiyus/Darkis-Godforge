import type { ActivationOptions, GodForgeActor, GodForgeApi } from "../api";

export type ActivationStatus = "requested" | "validated" | "running" | "completed" | "aborted";
export interface ActivationRequest { activationId: string; actorId: string; userId: string; abilityId: string; options: ActivationOptions; }
export interface AssignmentRequest { activationId: string; actorId: string; userId: string; deityId: string; choices: Record<string, string[]>; }
export interface SocketTransport { register(name: string, handler: (payload: unknown, authenticatedSenderId: string) => Promise<unknown>): void; executeAsGM(name: string, payload: unknown): Promise<unknown>; }
export interface AuthorityContext { currentUserId: string; isGM: boolean; isGMUser(userId: string): boolean; ownsActor(actor: GodForgeActor, userId: string): boolean; resolveActor(actorId: string): GodForgeActor | null; }

export class SocketRouter {
  private readonly activations = new Map<string, ActivationStatus>();
  constructor(private readonly api: GodForgeApi, private readonly authority: AuthorityContext, private transport?: SocketTransport) {}
  setTransport(transport: SocketTransport): void { this.transport = transport; }
  register(): void { this.transport?.register("activateAbility", async (payload, senderId) => this.handleActivation(this.parseRequest(payload, senderId), false)); this.transport?.register("assignDeity", async (payload, senderId) => this.handleAssignment(this.parseAssignment(payload, senderId), false)); }
  async activate(request: Omit<ActivationRequest, "activationId" | "userId">): Promise<void> {
    const full: ActivationRequest = { ...request, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    this.updateStatus(full.activationId, "requested");
    if (!this.authority.isGM) { if (!this.transport) throw new Error("GM authority is unavailable."); await this.transport.executeAsGM("activateAbility", full); return; }
    await this.handleActivation(full, true);
  }
  async assign(request: Omit<AssignmentRequest, "activationId" | "userId">): Promise<void> {
    const full: AssignmentRequest = { ...request, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    this.updateStatus(full.activationId, "requested");
    if (!this.authority.isGM) { if (!this.transport) throw new Error("GM authority is unavailable."); await this.transport.executeAsGM("assignDeity", full); return; }
    await this.handleAssignment(full, true);
  }
  status(activationId: string): ActivationStatus | null { return this.activations.get(activationId) ?? null; }
  private async handleActivation(request: ActivationRequest, trustedLocalGM: boolean): Promise<void> {
    if (this.activations.has(request.activationId) && this.activations.get(request.activationId) !== "requested") throw new Error("Activation request has already been processed.");
    this.updateStatus(request.activationId, "requested");
    const actor = this.authority.resolveActor(request.actorId); if (!actor) { this.updateStatus(request.activationId, "aborted"); throw new Error("Target actor was not found."); }
    if (!this.isAuthorizedRequester(actor, request.userId, trustedLocalGM)) { this.updateStatus(request.activationId, "aborted"); throw new Error("User is not allowed to modify this actor."); }
    this.updateStatus(request.activationId, "validated"); this.updateStatus(request.activationId, "running");
    try { await this.api.activateAbility(actor, request.abilityId, request.options); this.updateStatus(request.activationId, "completed"); } catch (error) { this.updateStatus(request.activationId, "aborted"); throw error; }
  }
  private async handleAssignment(request: AssignmentRequest, trustedLocalGM: boolean): Promise<void> {
    if (this.activations.has(request.activationId) && this.activations.get(request.activationId) !== "requested") throw new Error("Assignment request has already been processed.");
    this.updateStatus(request.activationId, "requested");
    const actor = this.authority.resolveActor(request.actorId); if (!actor) { this.updateStatus(request.activationId, "aborted"); throw new Error("Target actor was not found."); }
    if (!this.isAuthorizedRequester(actor, request.userId, trustedLocalGM)) { this.updateStatus(request.activationId, "aborted"); throw new Error("User is not allowed to modify this actor."); }
    if (!trustedLocalGM && !this.api.isDeitySelectableByPlayer(request.deityId)) { this.updateStatus(request.activationId, "aborted"); throw new Error("Deity is not available for player selection."); }
    this.updateStatus(request.activationId, "validated"); this.updateStatus(request.activationId, "running");
    try { await this.api.assignDeity(actor, request.deityId, request.choices); this.updateStatus(request.activationId, "completed"); } catch (error) { this.updateStatus(request.activationId, "aborted"); throw error; }
  }
  private isAuthorizedRequester(actor: GodForgeActor, userId: string, trustedLocalGM: boolean): boolean {
    if (trustedLocalGM) return this.authority.isGM && userId === this.authority.currentUserId;
    if (this.authority.isGMUser(userId)) return false;
    return this.authority.ownsActor(actor, userId);
  }
  private parseRequest(payload: unknown, authenticatedSenderId: string): ActivationRequest { if (!payload || typeof payload !== "object" || !this.validId(authenticatedSenderId)) throw new Error("Invalid socket request."); const candidate = payload as Partial<ActivationRequest>; if (!this.validId(candidate.activationId) || !this.validId(candidate.actorId) || !this.validId(candidate.abilityId)) throw new Error("Invalid socket request."); return { activationId: candidate.activationId, actorId: candidate.actorId, userId: authenticatedSenderId, abilityId: candidate.abilityId, options: {} }; }
  private parseAssignment(payload: unknown, authenticatedSenderId: string): AssignmentRequest { if (!payload || typeof payload !== "object" || !this.validId(authenticatedSenderId)) throw new Error("Invalid socket request."); const candidate = payload as Partial<AssignmentRequest>; if (!this.validId(candidate.activationId) || !this.validId(candidate.actorId) || !this.validId(candidate.deityId)) throw new Error("Invalid socket request."); return { activationId: candidate.activationId, actorId: candidate.actorId, userId: authenticatedSenderId, deityId: candidate.deityId, choices: this.parseChoices(candidate.choices) }; }
  private parseChoices(value: unknown): Record<string, string[]> { if (value === undefined) return {}; if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid socket request."); const entries = Object.entries(value); if (entries.length > 50) throw new Error("Invalid socket request."); const choices: Record<string, string[]> = {}; for (const [groupId, refs] of entries) { if (!this.validId(groupId) || !Array.isArray(refs) || refs.length > 50 || refs.some((ref) => !this.validId(ref))) throw new Error("Invalid socket request."); choices[groupId] = [...new Set(refs)]; } return choices; }
  private validId(value: unknown): value is string { return typeof value === "string" && value.length > 0 && value.length <= 256; }
  private updateStatus(id: string, status: ActivationStatus): void { if (!this.activations.has(id) && this.activations.size >= 1_000) { const oldest = this.activations.keys().next().value as string | undefined; if (oldest) this.activations.delete(oldest); } this.activations.set(id, status); }
}
