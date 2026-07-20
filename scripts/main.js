var k = Object.defineProperty;
var S = (i, e, t) => e in i ? k(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var c = (i, e, t) => S(i, typeof e != "symbol" ? e + "" : e, t);
function E(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class G {
  constructor() {
    c(this, "id", "pf2e");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(E(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
function b(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class T {
  constructor() {
    c(this, "id", "sfrpg");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(b(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class O {
  constructor() {
    c(this, "id", "sf2e");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(b(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class F {
  constructor() {
    c(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new G()), this.register(new O()), this.register(new T());
  }
  register(e) {
    this.adapters.set(e.id, e);
  }
  get(e) {
    const t = this.adapters.get(e);
    if (!t) throw new Error(`Unsupported game system: ${e}`);
    return t;
  }
  supports(e) {
    return this.adapters.has(e);
  }
}
function R(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function $(i, e, t) {
  return i.filter((s) => s.visibility.library && !t.has(s.id) && (!e.pantheonFilter || s.domains.includes(e.pantheonFilter))).map(R);
}
function N(i, e) {
  if (i.mode === "all") return i.grants.map((s) => s.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((s) => !i.grants.some((a) => a.ref === s))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function w(i, e) {
  return i.used < i.max;
}
function U(i, e) {
  if (!w(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function M(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const P = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g, D = /^\d+d\d+(?:[+\-]\d+)?$/;
function B(i) {
  const e = i.replace(/\s/g, "");
  if (D.test(e)) return !0;
  const t = e.match(P);
  return t !== null && t.join("") === e;
}
function f(i, e) {
  if (!B(i) || /[a-z]/i.test(i.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (D.test(i.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const s = i.replace(/@actor\.level/g, String(e.actor.level)).replace(/@actor\.hpPercent/g, String(e.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(e.target.hpPercent ?? 0)).split(/([()+\-*/,])/).map((n) => n.trim()).filter(Boolean);
  let a = 0, o = "+";
  for (const n of s) {
    if (/^[()+\-*/,]$/.test(n)) {
      o = n;
      continue;
    }
    const r = Number(n);
    if (!Number.isFinite(r)) throw new Error("Formula could not be evaluated.");
    a = o === "*" ? a * r : o === "/" ? a / r : o === "-" ? a - r : a + r;
  }
  return a;
}
async function j(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  for (const s of i.effects) await H(s, e, t);
  return t;
}
async function H(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const a = i.target === "target" ? e.target : e.actor;
    if (!a) throw new Error("This ability requires a valid target.");
    const o = e.rollDice && /d/.test(i.formula) ? await e.rollDice(i.formula) : f(i.formula, e.facts);
    i.type === "heal" ? (t.healing += o, a.hp !== void 0 && (a.hp = Math.min(a.maxHp ?? Number.MAX_SAFE_INTEGER, a.hp + o))) : (t.damage += o, a.hp !== void 0 && (a.hp = Math.max(0, a.hp - o)));
    return;
  }
  if (i.type === "modifier") {
    const a = typeof i.value == "number" ? i.value : f(i.value, e.facts);
    e.actor.modifiers[i.selector] = a, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const s = i.target === "target" ? e.target : e.actor;
  if (!s) throw new Error("This ability requires a valid target.");
  s.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
class C {
  constructor(e, t) {
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    return $(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  async materializeDeity(e, t, s) {
    const a = this.getDeity(e);
    if (!a) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(a, s);
  }
  getDeity(e) {
    return this.deities.get(e);
  }
  getActorDeity(e) {
    var s;
    const t = (s = e.flags) == null ? void 0 : s["darkis-godforge"];
    return !t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string" ? null : this.getDeity(t.deityId);
  }
  getGrantChoices(e, t) {
    var s;
    return ((s = this.getDeity(e)) == null ? void 0 : s.grantGroups) ?? null;
  }
  async assignDeity(e, t, s = {}) {
    const a = this.getDeity(t);
    if (!a || !a.visibility.players) throw new Error("Deity is not available for assignment.");
    const o = a.grantGroups.flatMap((r) => N(r, { groupId: r.id, refs: s[r.id] ?? [] })), n = Object.fromEntries(a.abilities.filter((r) => r.uses).map((r) => [r.id, { used: 0, max: r.uses.max, lastResetAt: Date.now(), reset: r.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: o, usages: n } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const s = this.readState(e), a = Date.now(), o = Object.fromEntries(Object.entries(s.usages).map(([n, r]) => r.reset === t ? [n, M(r, a)] : [n, r]));
    await e.update({ flags: { "darkis-godforge": { ...s, usages: o } } });
  }
  async activateAbility(e, t, s = {}) {
    const a = this.readState(e), o = this.getDeity(a.deityId), n = o == null ? void 0 : o.abilities.find((p) => p.id === t);
    if (!n) throw new Error("Ability is not available for this actor.");
    const r = a.usages[t];
    if (r && !w(r)) throw new Error("No uses remaining.");
    const d = r ? { ...a.usages, [t]: U(r) } : a.usages, l = { id: e.id, modifiers: {}, conditions: [] };
    await j(n, { actor: l, target: s.target, facts: s.facts ?? { actor: { level: 0 }, target: {} }, rollDice: s.rollDice }), await e.update({ flags: { "darkis-godforge": { ...a, usages: d } } });
  }
  getReplacementFor(e) {
    return this.deities.list().find((t) => t.replacement.sourceUuid === e && t.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, t) {
    return this.deities.list().some((s) => s.replacement.sourceUuid === e && s.replacement.mode === "hide" && s.replacement.contexts.includes(t));
  }
  registerAdapter(e) {
    this.adapters.register(e);
  }
  readState(e) {
    var s;
    const t = (s = e.flags) == null ? void 0 : s["darkis-godforge"];
    if (!t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string" || !("usages" in t) || typeof t.usages != "object") throw new Error("Actor has no assigned deity.");
    return t;
  }
}
const _ = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function L() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class I extends L() {
  constructor(t) {
    super();
    c(this, "deityService");
    this.deityService = t;
    for (const s of _) t.save(s);
  }
  render(t = !1) {
    const s = document.createElement("div");
    s.className = "dg-dashboard", s.innerHTML = this.template(this.deityService.list()), document.body.append(s), s.querySelectorAll("[data-deity]").forEach((a) => a.addEventListener("click", () => this.showDetail(a.dataset.deity ?? "")));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((s) => `<article class="dg-card" data-deity="${s.id}"><div class="dg-card-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${s.name}</h3><p>${s.title}</p><div class="dg-tags">${s.domains.slice(0, 3).map((a) => `<span>${a}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var o, n, r, d, l;
    const s = this.deityService.get(t);
    if (!s) return;
    const a = document.createElement("div");
    a.className = "dg-detail", a.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${s.name}</h2><p class="muted">${s.title}</p><p>${s.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${s.domains.map((p) => `<div>${p}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((o = s.passiveBonuses[0]) == null ? void 0 : o.value) ?? 0}</strong><span>${((n = s.passiveBonuses[0]) == null ? void 0 : n.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((r = s.abilities[0]) == null ? void 0 : r.name) ?? "Noch keine Fähigkeit"}</strong><span>${((d = s.abilities[0]) == null ? void 0 : d.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(a), (l = a.querySelector(".dg-close")) == null || l.addEventListener("click", () => a.remove());
  }
}
c(I, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class x {
  constructor() {
    c(this, "definitions", /* @__PURE__ */ new Map());
  }
  list() {
    return [...this.definitions.values()];
  }
  get(e) {
    return this.definitions.get(e) ?? null;
  }
  save(e) {
    return this.definitions.set(e.id, structuredClone(e)), e;
  }
  create(e) {
    const t = (/* @__PURE__ */ new Date()).toISOString(), s = { ...structuredClone(e), id: crypto.randomUUID(), schemaVersion: 1, revision: 1, createdAt: t, updatedAt: t, checksum: "pending" };
    return s.checksum = this.checksum(s), this.save(s);
  }
  update(e, t) {
    const s = this.get(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    const a = { ...s, ...structuredClone(t), id: e, revision: s.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return a.checksum = this.checksum(a), this.save(a);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const t = JSON.stringify({ ...e, checksum: void 0 });
    let s = 2166136261;
    for (let a = 0; a < t.length; a += 1) s = Math.imul(s ^ t.charCodeAt(a), 16777619);
    return (s >>> 0).toString(16);
  }
}
function z() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function v(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const g = "darkis-godforge";
class K {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var s;
      const t = (s = e.flags) == null ? void 0 : s[g];
      return t && typeof t == "object" && "deity" in t && v(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((o) => {
      var r;
      const n = (r = o.flags) == null ? void 0 : r[g];
      return n && typeof n == "object" && "deity" in n && v(n.deity) && n.deity.id === e.id;
    }), s = { [g]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: s }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: s })).uuid : null;
  }
}
const u = "darkis-godforge";
function V(i, e, t) {
  const s = z();
  s && (s.Hooks.once("init", () => {
    var a, o, n, r;
    (o = (a = s.game) == null ? void 0 : a.settings) == null || o.register(u, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (r = (n = s.game) == null ? void 0 : n.keybindings) == null || r.register(u, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => (t(), !0) });
  }), s.Hooks.on("getSceneControlButtons", (...a) => {
    const o = a[0];
    if (!Array.isArray(o)) return;
    const n = o.find((r) => typeof r == "object" && r !== null && "tools" in r);
    !(n != null && n.tools) || !Array.isArray(n.tools) || n.tools.push({ name: u, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: !0 });
  }), s.Hooks.once("ready", () => {
    var n, r, d;
    const a = (n = s.game) == null ? void 0 : n.journal;
    if (a) for (const l of new K(a).load()) e.save(l);
    const o = (d = (r = s.game) == null ? void 0 : r.modules) == null ? void 0 : d.get(u);
    o && (o.api = i);
  }));
}
class W {
  constructor(e, t, s) {
    c(this, "activations", /* @__PURE__ */ new Map());
    this.api = e, this.authority = t, this.transport = s;
  }
  register() {
    var e;
    (e = this.transport) == null || e.register("activateAbility", async (t) => this.handleActivation(this.parseRequest(t)));
  }
  async activate(e) {
    const t = { ...e, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.activations.set(t.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) throw new Error("GM authority is unavailable.");
      await this.transport.executeAsGM("activateAbility", t);
      return;
    }
    await this.handleActivation(t);
  }
  status(e) {
    return this.activations.get(e) ?? null;
  }
  async handleActivation(e) {
    if (this.activations.has(e.activationId) && this.activations.get(e.activationId) !== "requested") throw new Error("Activation request has already been processed.");
    this.activations.set(e.activationId, "requested");
    const t = this.authority.resolveActor(e.actorId);
    if (!t)
      throw this.activations.set(e.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.authority.isGM && !this.authority.ownsActor(t, e.userId))
      throw this.activations.set(e.activationId, "aborted"), new Error("User is not allowed to modify this actor.");
    this.activations.set(e.activationId, "validated"), this.activations.set(e.activationId, "running");
    try {
      await this.api.activateAbility(t, e.abilityId, e.options), this.activations.set(e.activationId, "completed");
    } catch (s) {
      throw this.activations.set(e.activationId, "aborted"), s;
    }
  }
  parseRequest(e) {
    if (!e || typeof e != "object") throw new Error("Invalid socket request.");
    const t = e;
    if (typeof t.activationId != "string" || typeof t.actorId != "string" || typeof t.userId != "string" || typeof t.abilityId != "string") throw new Error("Invalid socket request.");
    return { activationId: t.activationId, actorId: t.actorId, userId: t.userId, abilityId: t.abilityId, options: t.options ?? {} };
  }
}
const m = new x(), q = new F(), A = new C(m, q), X = new W(A, { currentUserId: "local", isGM: !0, ownsActor: () => !0, resolveActor: () => null });
function h() {
  new I(m).render(!0);
}
const y = globalThis;
y.Hooks ? (V(A, m, h), y.Hooks.once("ready", h)) : typeof document < "u" && h();
export {
  I as GodForgeDashboard,
  A as api,
  m as deityService,
  q as registry,
  X as socketRouter
};
