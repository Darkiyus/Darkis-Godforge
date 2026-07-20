var E = Object.defineProperty;
var G = (i, e, t) => e in i ? E(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var c = (i, e, t) => G(i, typeof e != "symbol" ? e + "" : e, t);
function T(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class F {
  constructor() {
    c(this, "id", "pf2e");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(T(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
function w(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class O {
  constructor() {
    c(this, "id", "sfrpg");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(w(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class R {
  constructor() {
    c(this, "id", "sf2e");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(w(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class N {
  constructor() {
    c(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new F()), this.register(new R()), this.register(new O());
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
function $(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function B(i, e, t) {
  return i.filter((r) => r.visibility.library && !t.has(r.id) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).map($);
}
function U(i, e) {
  if (i.mode === "all") return i.grants.map((r) => r.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((r) => !i.grants.some((s) => s.ref === r))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function D(i, e) {
  return i.used < i.max;
}
function M(i, e) {
  if (!D(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function P(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const H = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g, S = /^\d+d\d+(?:[+\-]\d+)?$/;
function j(i) {
  const e = i.replace(/\s/g, "");
  if (S.test(e)) return !0;
  const t = e.match(H);
  return t !== null && t.join("") === e;
}
function v(i, e) {
  if (!j(i) || /[a-z]/i.test(i.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (S.test(i.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const r = i.replace(/@actor\.level/g, String(e.actor.level)).replace(/@actor\.hpPercent/g, String(e.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(e.target.hpPercent ?? 0)).split(/([()+\-*/,])/).map((o) => o.trim()).filter(Boolean);
  let s = 0, n = "+";
  for (const o of r) {
    if (/^[()+\-*/,]$/.test(o)) {
      n = o;
      continue;
    }
    const a = Number(o);
    if (!Number.isFinite(a)) throw new Error("Formula could not be evaluated.");
    s = n === "*" ? s * a : n === "/" ? s / a : n === "-" ? s - a : s + a;
  }
  return s;
}
function p(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !p(i.child, e);
  const t = i.children.map((r) => p(r, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function C(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !p(i.condition, e.conditionFacts ?? {})) return t;
  for (const r of i.effects) await A(r, e, t);
  return t;
}
async function A(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const s = p(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const n of s) await A(n, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const s = i.target === "target" ? e.target : e.actor;
    if (!s) throw new Error("This ability requires a valid target.");
    const n = e.rollDice && /d/.test(i.formula) ? await e.rollDice(i.formula) : v(i.formula, e.facts);
    i.type === "heal" ? (t.healing += n, s.hp !== void 0 && (s.hp = Math.min(s.maxHp ?? Number.MAX_SAFE_INTEGER, s.hp + n))) : (t.damage += n, s.hp !== void 0 && (s.hp = Math.max(0, s.hp - n)));
    return;
  }
  if (i.type === "modifier") {
    const s = typeof i.value == "number" ? i.value : v(i.value, e.facts);
    e.actor.modifiers[i.selector] = s, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const r = i.target === "target" ? e.target : e.actor;
  if (!r) throw new Error("This ability requires a valid target.");
  r.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
class L {
  constructor(e, t) {
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    return B(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  async materializeDeity(e, t, r) {
    const s = this.getDeity(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(s, r);
  }
  getDeity(e) {
    return this.deities.get(e);
  }
  getActorDeity(e) {
    var r;
    const t = (r = e.flags) == null ? void 0 : r["darkis-godforge"];
    return !t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string" ? null : this.getDeity(t.deityId);
  }
  getGrantChoices(e, t) {
    var r;
    return ((r = this.getDeity(e)) == null ? void 0 : r.grantGroups) ?? null;
  }
  async assignDeity(e, t, r = {}) {
    const s = this.getDeity(t);
    if (!s || !s.visibility.players) throw new Error("Deity is not available for assignment.");
    const n = s.grantGroups.flatMap((a) => U(a, { groupId: a.id, refs: r[a.id] ?? [] })), o = Object.fromEntries(s.abilities.filter((a) => a.uses).map((a) => [a.id, { used: 0, max: a.uses.max, lastResetAt: Date.now(), reset: a.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: n, usages: o } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const r = this.readState(e), s = Date.now(), n = Object.fromEntries(Object.entries(r.usages).map(([o, a]) => a.reset === t ? [o, P(a, s)] : [o, a]));
    await e.update({ flags: { "darkis-godforge": { ...r, usages: n } } });
  }
  async activateAbility(e, t, r = {}) {
    const s = this.readState(e), n = this.getDeity(s.deityId), o = n == null ? void 0 : n.abilities.find((g) => g.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const a = s.usages[t];
    if (a && !D(a)) throw new Error("No uses remaining.");
    const l = a ? { ...s.usages, [t]: M(a) } : s.usages, d = { id: e.id, modifiers: {}, conditions: [] };
    await C(o, { actor: d, target: r.target, facts: r.facts ?? { actor: { level: 0 }, target: {} }, rollDice: r.rollDice }), await e.update({ flags: { "darkis-godforge": { ...s, usages: l } } });
  }
  getReplacementFor(e) {
    return this.deities.list().find((t) => t.replacement.sourceUuid === e && t.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, t) {
    return this.deities.list().some((r) => r.replacement.sourceUuid === e && r.replacement.mode === "hide" && r.replacement.contexts.includes(t));
  }
  registerAdapter(e) {
    this.adapters.register(e);
  }
  readState(e) {
    var r;
    const t = (r = e.flags) == null ? void 0 : r["darkis-godforge"];
    if (!t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string" || !("usages" in t) || typeof t.usages != "object") throw new Error("Actor has no assigned deity.");
    return t;
  }
}
function _() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class q extends _() {
  constructor(e, t) {
    super(), this.deityService = e, this.onSaved = t;
  }
  render(e = !1) {
    var r;
    const t = document.createElement("div");
    t.className = "dg-editor dg-detail", t.innerHTML = '<button class="dg-close" data-close>×</button><div class="dg-editor-header"><p class="eyebrow">DARKIS GODFORGE</p><h2>Neuen Gott erschaffen</h2><p class="muted">Definiere die Identität und die ersten Domänen deiner Gottheit.</p></div><form><label>Name<input name="name" required maxlength="80" placeholder="z. B. Tenebris"></label><label>Titel<input name="title" required maxlength="120" placeholder="z. B. Göttin der Schatten"></label><label>Beschreibung<textarea name="description" required maxlength="1000" rows="4"></textarea></label><label>Domänen<input name="domains" required placeholder="Schatten, Geheimnisse, Täuschung"></label><label>Ausrichtung<input name="alignment" placeholder="Neutral Böse"></label><div class="dg-editor-actions"><button type="button" data-close>Abbrechen</button><button class="dg-primary" type="submit">Gottheit speichern</button></div><p class="dg-form-error" role="alert"></p></form>', document.body.append(t), t.querySelectorAll("[data-close]").forEach((s) => s.addEventListener("click", () => t.remove())), (r = t.querySelector("form")) == null || r.addEventListener("submit", (s) => {
      s.preventDefault(), this.save(t);
    });
  }
  save(e) {
    const t = e.querySelector("form");
    if (!(t instanceof HTMLFormElement)) return;
    const r = new FormData(t);
    try {
      const s = this.deityService.create({ name: String(r.get("name") ?? "").trim(), title: String(r.get("title") ?? "").trim(), description: String(r.get("description") ?? "").trim(), domains: String(r.get("domains") ?? "").split(",").map((n) => n.trim()).filter(Boolean), alignment: String(r.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(s), e.remove();
    } catch (s) {
      const n = e.querySelector(".dg-form-error");
      n && (n.textContent = s instanceof Error ? s.message : "Die Gottheit konnte nicht gespeichert werden.");
    }
  }
}
const x = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function z() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class k extends z() {
  constructor(t) {
    super();
    c(this, "deityService");
    this.deityService = t;
    for (const r of x) t.save(r);
  }
  render(t = !1) {
    const r = document.createElement("div");
    r.className = "dg-dashboard", r.innerHTML = this.template(this.deityService.list()), document.body.append(r), r.querySelectorAll("[data-deity]").forEach((s) => s.addEventListener("click", () => this.showDetail(s.dataset.deity ?? ""))), r.querySelectorAll("[data-create]").forEach((s) => s.addEventListener("click", () => new q(this.deityService, () => {
      r.remove(), this.render(!0);
    }).render(!0)));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((r) => `<article class="dg-card" data-deity="${r.id}"><div class="dg-card-art"><img src="${r.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${r.name}</h3><p>${r.title}</p><div class="dg-tags">${r.domains.slice(0, 3).map((s) => `<span>${s}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var n, o, a, l, d;
    const r = this.deityService.get(t);
    if (!r) return;
    const s = document.createElement("div");
    s.className = "dg-detail", s.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${r.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${r.name}</h2><p class="muted">${r.title}</p><p>${r.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${r.domains.map((g) => `<div>${g}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((n = r.passiveBonuses[0]) == null ? void 0 : n.value) ?? 0}</strong><span>${((o = r.passiveBonuses[0]) == null ? void 0 : o.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((a = r.abilities[0]) == null ? void 0 : a.name) ?? "Noch keine Fähigkeit"}</strong><span>${((l = r.abilities[0]) == null ? void 0 : l.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(s), (d = s.querySelector(".dg-close")) == null || d.addEventListener("click", () => s.remove());
  }
}
c(k, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class K {
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
    const t = (/* @__PURE__ */ new Date()).toISOString(), r = { ...structuredClone(e), id: crypto.randomUUID(), schemaVersion: 1, revision: 1, createdAt: t, updatedAt: t, checksum: "pending" };
    return r.checksum = this.checksum(r), this.save(r);
  }
  update(e, t) {
    const r = this.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    const s = { ...r, ...structuredClone(t), id: e, revision: r.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return s.checksum = this.checksum(s), this.save(s);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const t = JSON.stringify({ ...e, checksum: void 0 });
    let r = 2166136261;
    for (let s = 0; s < t.length; s += 1) r = Math.imul(r ^ t.charCodeAt(s), 16777619);
    return (r >>> 0).toString(16);
  }
}
function V() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function y(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const h = "darkis-godforge";
class W {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var r;
      const t = (r = e.flags) == null ? void 0 : r[h];
      return t && typeof t == "object" && "deity" in t && y(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var a;
      const o = (a = n.flags) == null ? void 0 : a[h];
      return o && typeof o == "object" && "deity" in o && y(o.deity) && o.deity.id === e.id;
    }), r = { [h]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: r }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: r })).uuid : null;
  }
}
const u = "darkis-godforge";
function J(i, e, t) {
  const r = V();
  r && (r.Hooks.once("init", () => {
    var s, n, o, a;
    (n = (s = r.game) == null ? void 0 : s.settings) == null || n.register(u, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (a = (o = r.game) == null ? void 0 : o.keybindings) == null || a.register(u, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => (t(), !0) });
  }), r.Hooks.on("getSceneControlButtons", (...s) => {
    const n = s[0];
    if (!Array.isArray(n)) return;
    const o = n.find((a) => typeof a == "object" && a !== null && "tools" in a);
    !(o != null && o.tools) || !Array.isArray(o.tools) || o.tools.push({ name: u, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: !0 });
  }), r.Hooks.once("ready", () => {
    var o, a, l;
    const s = (o = r.game) == null ? void 0 : o.journal;
    if (s) for (const d of new W(s).load()) e.save(d);
    const n = (l = (a = r.game) == null ? void 0 : a.modules) == null ? void 0 : l.get(u);
    n && (n.api = i);
  }));
}
class X {
  constructor(e, t, r) {
    c(this, "activations", /* @__PURE__ */ new Map());
    this.api = e, this.authority = t, this.transport = r;
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
    } catch (r) {
      throw this.activations.set(e.activationId, "aborted"), r;
    }
  }
  parseRequest(e) {
    if (!e || typeof e != "object") throw new Error("Invalid socket request.");
    const t = e;
    if (typeof t.activationId != "string" || typeof t.actorId != "string" || typeof t.userId != "string" || typeof t.abilityId != "string") throw new Error("Invalid socket request.");
    return { activationId: t.activationId, actorId: t.actorId, userId: t.userId, abilityId: t.abilityId, options: t.options ?? {} };
  }
}
const f = new K(), Q = new N(), I = new L(f, Q), Z = new X(I, { currentUserId: "local", isGM: !0, ownsActor: () => !0, resolveActor: () => null });
function m() {
  new k(f).render(!0);
}
const b = globalThis;
b.Hooks ? (J(I, f, m), b.Hooks.once("ready", m)) : typeof document < "u" && m();
export {
  k as GodForgeDashboard,
  I as api,
  f as deityService,
  Q as registry,
  Z as socketRouter
};
