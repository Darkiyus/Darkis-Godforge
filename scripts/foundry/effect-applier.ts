import type { GodForgeActor, GodForgeEmbeddedItem } from "../api";
import type { ExecutionOperation, PreparedAbility } from "../core/execution-plan";
import { getFoundryGame } from "./runtime";

interface TokenDocumentLike { actor?: GodForgeActor; x?: number; y?: number; update?(data: Record<string, unknown>): Promise<unknown>; }
interface ChatMessageClass { create(data: Record<string, unknown>, options?: Record<string, unknown>): Promise<unknown>; }
interface UuidDocument { toObject?(): Record<string, unknown>; name?: string; type?: string; img?: string; system?: Record<string, unknown>; }
interface PreparedResources { conditions: Map<string, Record<string, unknown>>; items: Map<string, Record<string, unknown>>; }
type Rollback = () => Promise<void>;
const conditionCache = new Map<string, Promise<Record<string, unknown>>>();

export async function applyPreparedAbility(prepared: PreparedAbility, actors: Map<string, GodForgeActor>): Promise<void> {
  const systemId = getFoundryGame()?.system?.id ?? "";
  if (systemId === "sfrpg" && prepared.operations.some((entry) => ["create-modifier", "condition", "roll"].includes(entry.kind))) throw new Error("This advanced ability requires the PF2e or SF2e runtime adapter.");
  const resources = await preflight(prepared.operations, actors);
  const rollbacks: Rollback[] = [];
  try {
    for (const operation of prepared.operations.filter((entry) => entry.kind === "roll")) await applyOperation(operation, actors, prepared, resources);
    for (const operation of prepared.operations.filter((entry) => entry.kind !== "roll" && entry.kind !== "chat" && entry.kind !== "roll-result")) {
      const rollback = await applyOperation(operation, actors, prepared, resources);
      if (rollback) rollbacks.push(rollback);
    }
    for (const operation of prepared.operations.filter((entry) => entry.kind === "chat" || entry.kind === "roll-result")) await applyOperation(operation, actors, prepared, resources);
  } catch (error) {
    for (const rollback of rollbacks.reverse()) {
      try { await rollback(); } catch (rollbackError) { console.error("Darkis GodForge | Effect rollback failed.", rollbackError); }
    }
    throw error;
  }
}

async function preflight(operations: ExecutionOperation[], actors: Map<string, GodForgeActor>): Promise<PreparedResources> {
  const conditions = new Map<string, Record<string, unknown>>();
  const items = new Map<string, Record<string, unknown>>();
  for (const operation of operations) {
    if ("targetId" in operation && operation.kind !== "movement" && operation.kind !== "chat" && operation.kind !== "roll-result" && !actors.has(operation.targetId)) throw new Error(`Effect target actor was not found: ${operation.targetId}`);
    const actor = "targetId" in operation ? actors.get(operation.targetId) : undefined;
    if (operation.kind === "create-modifier" && (!actor?.createEmbeddedDocuments || !actor.deleteEmbeddedDocuments)) throw new Error("Target actor cannot safely receive rollback-capable effects.");
    if (operation.kind === "condition" && operation.operation === "add") {
      if (!actor?.createEmbeddedDocuments || !actor.deleteEmbeddedDocuments) throw new Error("Target actor cannot safely receive rollback-capable conditions.");
      if (!conditions.has(operation.condition)) conditions.set(operation.condition, await resolveCondition(operation.condition));
    }
    if (operation.kind === "condition" && operation.operation === "remove") {
      if (!actor?.deleteEmbeddedDocuments || !actor.createEmbeddedDocuments) throw new Error("Target actor cannot safely remove conditions.");
      const matching = (actor.items?.contents ?? []).filter((item) => item.type === "condition" && conditionSlug(item) === operation.condition);
      if (matching.some((item) => !item.toObject)) throw new Error("A condition cannot be backed up before removal.");
    }
    if (operation.kind === "roll") {
      const statistic = actor?.getStatistic?.(operation.selector);
      if (!(statistic?.check?.roll ?? statistic?.roll)) throw new Error(`PF2e statistic is unavailable: ${operation.selector}`);
    }
    if (operation.kind === "movement") {
      const token = findToken(operation.targetId);
      if (!token?.update || typeof token.x !== "number" || typeof token.y !== "number") throw new Error("A scene token is required for movement.");
    }
    if (operation.kind === "resource" && operation.resource === "item") {
      if (!operation.itemUuid) throw new Error("Item resource operations require a configured item UUID.");
      if (operation.operation === "remove") {
        if (!actor?.deleteEmbeddedDocuments || !actor.createEmbeddedDocuments) throw new Error("Target actor cannot safely remove items.");
        const matching = (actor.items?.contents ?? []).filter((item) => {
          const flag = item.flags?.["darkis-godforge"];
          return item.uuid === operation.itemUuid || Boolean(flag && typeof flag === "object" && (flag as Record<string, unknown>).sourceItemUuid === operation.itemUuid);
        });
        if (matching.some((item) => !item.toObject)) throw new Error("An item cannot be backed up before removal.");
      }
      if (operation.operation !== "remove") {
        if (!actor?.createEmbeddedDocuments || !actor.deleteEmbeddedDocuments) throw new Error("Target actor cannot safely receive rollback-capable items.");
        if (!items.has(operation.itemUuid)) {
          const source = await (globalThis as unknown as { fromUuid?: (uuid: string) => Promise<UuidDocument | null> }).fromUuid?.(operation.itemUuid);
          const data = source?.toObject?.();
          if (!data) throw new Error(`Configured item is unavailable: ${operation.itemUuid}`);
          delete data._id;
          items.set(operation.itemUuid, data);
        }
      }
    }
  }
  return { conditions, items };
}

async function applyOperation(operation: ExecutionOperation, actors: Map<string, GodForgeActor>, prepared: PreparedAbility, resources: PreparedResources): Promise<Rollback | undefined> {
  const actor = actors.get(operation.targetId);
  if (operation.kind === "actor-update") {
    if (!actor) throw new Error(`Effect target actor was not found: ${operation.targetId}`);
    await actor.update({ [operation.path]: operation.after }, { darkisGodForge: true });
    return async () => { await actor.update({ [operation.path]: operation.before }, { darkisGodForge: true }); };
  }
  if (operation.kind === "create-modifier") {
    if (!actor?.createEmbeddedDocuments) throw new Error("Target actor cannot receive PF2e effects.");
    const created = await actor.createEmbeddedDocuments("Item", [{
      name: prepared.abilityName,
      type: "effect",
      system: {
        description: { value: `GodForge: ${prepared.abilityName}` },
        duration: { value: operation.duration ?? 1, unit: operation.duration ? "rounds" : "unlimited", expiry: null, sustained: false },
        rules: [{ key: "FlatModifier", selector: operation.selector, value: operation.value, type: operation.modifierType, slug: `godforge-${prepared.abilityId}` }],
        start: { value: 0, initiative: null }
      },
      flags: { "darkis-godforge": { abilityId: prepared.abilityId, activationId: prepared.id } }
    }]);
    return created.length && actor.deleteEmbeddedDocuments ? async () => { await actor.deleteEmbeddedDocuments!("Item", created.map((item) => item.id)); } : undefined;
  }
  if (operation.kind === "condition") {
    if (!actor) throw new Error(`Condition target actor was not found: ${operation.targetId}`);
    if (operation.operation === "remove") {
      const matching = (actor.items?.contents ?? []).filter((item) => item.type === "condition" && conditionSlug(item) === operation.condition);
      const snapshots = matching.flatMap((item) => { const data = item.toObject?.(); if (!data) return []; delete data._id; return [data]; });
      if (matching.length && actor.deleteEmbeddedDocuments) await actor.deleteEmbeddedDocuments("Item", matching.map((item) => item.id));
      return snapshots.length && actor.createEmbeddedDocuments ? async () => { await actor.createEmbeddedDocuments!("Item", snapshots); } : undefined;
    }
    if (!actor.createEmbeddedDocuments) throw new Error("Target actor cannot receive conditions.");
    const condition = resources.conditions.get(operation.condition);
    if (!condition) throw new Error(`Condition was not prepared: ${operation.condition}`);
    const created = await actor.createEmbeddedDocuments("Item", [structuredClone(condition)]);
    return created.length && actor.deleteEmbeddedDocuments ? async () => { await actor.deleteEmbeddedDocuments!("Item", created.map((item) => item.id)); } : undefined;
  }
  if (operation.kind === "roll") {
    if (!actor) throw new Error(`Roll actor was not found: ${operation.targetId}`);
    const statistic = actor.getStatistic?.(operation.selector);
    const roller = statistic?.check?.roll ?? statistic?.roll;
    if (!roller) throw new Error(`PF2e statistic is unavailable: ${operation.selector}`);
    await roller.call(statistic?.check ?? statistic, operation.dc === undefined ? {} : { dc: { value: operation.dc } });
    return undefined;
  }
  if (operation.kind === "roll-result") {
    await createChatMessage(`<strong>${escapeHtml(prepared.abilityName)}</strong><p>${escapeHtml(operation.selector)}: ${operation.total}${operation.degree ? ` (${escapeHtml(operation.degree)})` : ""}</p>`);
    return undefined;
  }
  if (operation.kind === "movement") {
    const token = findToken(operation.targetId);
    if (!token?.update || typeof token.x !== "number" || typeof token.y !== "number") throw new Error("A scene token is required for movement.");
    const gridSize = Number((globalThis as unknown as { canvas?: { grid?: { size?: number } } }).canvas?.grid?.size ?? 100);
    const distance = operation.distance * gridSize / 5;
    const before = { x: token.x, y: token.y };
    const update = operation.mode === "teleport" ? { x: token.x + distance, y: token.y, animate: false } : { x: token.x + distance, y: token.y };
    await token.update(update);
    return async () => { await token.update!(before); };
  }
  if (operation.kind === "resource") {
    if (!actor) throw new Error(`Resource target actor was not found: ${operation.targetId}`);
    if (operation.resource === "item") {
      if (!operation.itemUuid) throw new Error("Item resource operations require a configured item UUID.");
      if (operation.operation === "remove") {
        const matching = (actor.items?.contents ?? []).filter((item) => {
          const flag = item.flags?.["darkis-godforge"];
          return item.uuid === operation.itemUuid || Boolean(flag && typeof flag === "object" && (flag as Record<string, unknown>).sourceItemUuid === operation.itemUuid);
        });
        const snapshots = matching.flatMap((item) => { const data = item.toObject?.(); if (!data) return []; delete data._id; return [data]; });
        if (matching.length && actor.deleteEmbeddedDocuments) await actor.deleteEmbeddedDocuments("Item", matching.map((item) => item.id));
        return snapshots.length && actor.createEmbeddedDocuments ? async () => { await actor.createEmbeddedDocuments!("Item", snapshots); } : undefined;
      }
      if (!actor.createEmbeddedDocuments) throw new Error("Target actor cannot receive items.");
      const data = structuredClone(resources.items.get(operation.itemUuid));
      if (!data) throw new Error(`Configured item is unavailable: ${operation.itemUuid}`);
      data.flags = { ...(data.flags as Record<string, unknown> | undefined), "darkis-godforge": { sourceItemUuid: operation.itemUuid, abilityId: prepared.abilityId } };
      const created = await actor.createEmbeddedDocuments("Item", Array.from({ length: Math.max(1, Math.floor(operation.amount)) }, () => structuredClone(data)));
      return created.length && actor.deleteEmbeddedDocuments ? async () => { await actor.deleteEmbeddedDocuments!("Item", created.map((item) => item.id)); } : undefined;
    }
    return undefined;
  }
  await createChatMessage(`<strong>${escapeHtml(prepared.abilityName)}</strong><p>${escapeHtml(operation.text)}</p>`);
  return undefined;
}

export async function synchronizePassiveBonusItems(actor: GodForgeActor, deityId: string, deityName: string, bonuses: Array<{ id: string; name: string; selector: string; value: number | string; modifierType: string; condition?: string; enabled?: boolean }>): Promise<void> {
  const existing = (actor.items?.contents ?? []).filter((item) => {
    const flag = item.flags?.["darkis-godforge"];
    return Boolean(flag && typeof flag === "object" && (flag as Record<string, unknown>).passiveBonusItem === deityId);
  });
  if (existing.length && actor.deleteEmbeddedDocuments) await actor.deleteEmbeddedDocuments("Item", existing.map((item) => item.id));
  const rules = bonuses.filter((bonus) => bonus.enabled !== false).map((bonus) => ({
    key: "FlatModifier",
    selector: bonus.selector,
    value: bonus.value,
    type: bonus.modifierType,
    label: bonus.name,
    slug: `godforge-${bonus.id}`,
    ...(bonus.condition ? { predicate: [bonus.condition] } : {})
  }));
  if (!rules.length || !actor.createEmbeddedDocuments) return;
  await actor.createEmbeddedDocuments("Item", [{
    name: `${deityName} — GodForge`,
    type: "effect",
    system: {
      description: { value: `Passive GodForge benefits granted by ${deityName}.` },
      duration: { value: -1, unit: "unlimited", expiry: null, sustained: false },
      rules,
      start: { value: 0, initiative: null }
    },
    flags: { "darkis-godforge": { passiveBonusItem: deityId } }
  }]);
}

async function resolveCondition(slug: string): Promise<Record<string, unknown>> {
  const system = getFoundryGame()?.system as { id?: string; version?: string } | undefined;
  const key = `${system?.id ?? "unknown"}:${system?.version ?? "unknown"}:${slug.toLocaleLowerCase()}`;
  let pending = conditionCache.get(key);
  if (!pending) {
    pending = resolveConditionUncached(slug);
    conditionCache.set(key, pending);
    pending.catch(() => conditionCache.delete(key));
  }
  return structuredClone(await pending);
}

async function resolveConditionUncached(slug: string): Promise<Record<string, unknown>> {
  const fromUuid = (globalThis as unknown as { fromUuid?: (uuid: string) => Promise<UuidDocument | null> }).fromUuid;
  const packs = (getFoundryGame()?.packs?.contents ?? []) as Array<{ collection?: string; documentName?: string; getIndex(options?: { fields?: string[] }): Promise<Iterable<{ _id?: string; name?: string; type?: string; system?: Record<string, unknown> }>> }>;
  for (const pack of packs.filter((entry) => entry.documentName === "Item" && /condition/i.test(entry.collection ?? ""))) {
    const index = await pack.getIndex({ fields: ["type", "system.slug"] });
    const entry = [...index].find((candidate) => candidate.type === "condition" && (String(candidate.system?.slug ?? "").toLocaleLowerCase() === slug.toLocaleLowerCase() || candidate.name?.toLocaleLowerCase() === slug.toLocaleLowerCase()));
    if (!entry?._id || !pack.collection) continue;
    const document = await fromUuid?.(`Compendium.${pack.collection}.Item.${entry._id}`);
    const data = document?.toObject?.() ?? { name: document?.name ?? entry.name ?? slug, type: "condition", system: structuredClone(document?.system ?? { slug }) };
    delete data._id;
    return data;
  }
  throw new Error(`PF2e condition is unavailable: ${slug}`);
}

function conditionSlug(item: GodForgeEmbeddedItem): string { return String(item.system?.slug ?? item.name ?? "").toLocaleLowerCase(); }
function findToken(actorId: string): TokenDocumentLike | undefined {
  const canvas = (globalThis as unknown as { canvas?: { tokens?: { placeables?: Array<{ actor?: GodForgeActor; document?: TokenDocumentLike }> } } }).canvas;
  return canvas?.tokens?.placeables?.find((token) => token.actor?.id === actorId)?.document;
}
async function createChatMessage(content: string): Promise<void> {
  const ChatMessage = (globalThis as unknown as { ChatMessage?: ChatMessageClass }).ChatMessage;
  if (!ChatMessage) return;
  await ChatMessage.create({ content, speaker: { alias: "Darkis GodForge" } }, { darkisGodForge: true });
}
function escapeHtml(value: string): string { return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character); }
