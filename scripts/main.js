var E = Object.defineProperty;
var T = (i, e, t) => e in i ? E(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var c = (i, e, t) => T(i, typeof e != "symbol" ? e + "" : e, t);
function F(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class O {
  constructor() {
    c(this, "id", "pf2e");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(F(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
function w(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class R {
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
  buildClassCoupling(e) {
    return null;
  }
}
class $ {
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
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class C {
  constructor() {
    c(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new O()), this.register(new $()), this.register(new R());
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
function N(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function U(i, e, t) {
  return i.filter((s) => s.visibility.library && !t.has(s.id) && (!e.pantheonFilter || s.domains.includes(e.pantheonFilter))).map(N);
}
function D(i, e) {
  if (i.mode === "all") return i.grants.map((s) => s.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((s) => !i.grants.some((r) => r.ref === s))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function S(i, e) {
  return i.used < i.max;
}
function B(i, e) {
  if (!S(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function M(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const P = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g, I = /^\d+d\d+(?:[+\-]\d+)?$/;
function H(i) {
  const e = i.replace(/\s/g, "");
  if (I.test(e)) return !0;
  const t = e.match(P);
  return t !== null && t.join("") === e;
}
function v(i, e) {
  if (!H(i) || /[a-z]/i.test(i.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (I.test(i.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const s = i.replace(/@actor\.level/g, String(e.actor.level)).replace(/@actor\.hpPercent/g, String(e.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(e.target.hpPercent ?? 0)).split(/([()+\-*/,])/).map((o) => o.trim()).filter(Boolean);
  let r = 0, a = "+";
  for (const o of s) {
    if (/^[()+\-*/,]$/.test(o)) {
      a = o;
      continue;
    }
    const n = Number(o);
    if (!Number.isFinite(n)) throw new Error("Formula could not be evaluated.");
    r = a === "*" ? r * n : a === "/" ? r / n : a === "-" ? r - n : r + n;
  }
  return r;
}
function p(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !p(i.child, e);
  const t = i.children.map((s) => p(s, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function j(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !p(i.condition, e.conditionFacts ?? {})) return t;
  for (const s of i.effects) await A(s, e, t);
  return t;
}
async function A(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const r = p(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const a of r) await A(a, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const r = i.target === "target" ? e.target : e.actor;
    if (!r) throw new Error("This ability requires a valid target.");
    const a = e.rollDice && /d/.test(i.formula) ? await e.rollDice(i.formula) : v(i.formula, e.facts);
    i.type === "heal" ? (t.healing += a, r.hp !== void 0 && (r.hp = Math.min(r.maxHp ?? Number.MAX_SAFE_INTEGER, r.hp + a))) : (t.damage += a, r.hp !== void 0 && (r.hp = Math.max(0, r.hp - a)));
    return;
  }
  if (i.type === "modifier") {
    const r = typeof i.value == "number" ? i.value : v(i.value, e.facts);
    e.actor.modifiers[i.selector] = r, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const s = i.target === "target" ? e.target : e.actor;
  if (!s) throw new Error("This ability requires a valid target.");
  s.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
const L = /* @__PURE__ */ new Set(["cleric", "champion"]);
function _(i, e, t = []) {
  if (!L.has(e)) throw new Error(`Unsupported deity class coupling: ${e}`);
  const s = i.grantGroups.flatMap((r) => D(r, t.find((a) => a.groupId === r.id)));
  return { deityId: i.id, classId: e, grants: s, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification } };
}
class q {
  constructor(e, t) {
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    return U(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  async materializeDeity(e, t, s) {
    const r = this.getDeity(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(r, s);
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
  getClassGrants(e, t, s = []) {
    const r = this.getDeity(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return _(r, t, s);
  }
  buildClassCoupling(e, t, s, r = []) {
    return this.adapters.get(s).buildClassCoupling(this.getClassGrants(e, t, r));
  }
  async assignDeity(e, t, s = {}) {
    const r = this.getDeity(t);
    if (!r || !r.visibility.players) throw new Error("Deity is not available for assignment.");
    const a = r.grantGroups.flatMap((n) => D(n, { groupId: n.id, refs: s[n.id] ?? [] })), o = Object.fromEntries(r.abilities.filter((n) => n.uses).map((n) => [n.id, { used: 0, max: n.uses.max, lastResetAt: Date.now(), reset: n.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: a, usages: o } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const s = this.readState(e), r = Date.now(), a = Object.fromEntries(Object.entries(s.usages).map(([o, n]) => n.reset === t ? [o, M(n, r)] : [o, n]));
    await e.update({ flags: { "darkis-godforge": { ...s, usages: a } } });
  }
  async activateAbility(e, t, s = {}) {
    const r = this.readState(e), a = this.getDeity(r.deityId), o = a == null ? void 0 : a.abilities.find((g) => g.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const n = r.usages[t];
    if (n && !S(n)) throw new Error("No uses remaining.");
    const l = n ? { ...r.usages, [t]: B(n) } : r.usages, d = { id: e.id, modifiers: {}, conditions: [] };
    await j(o, { actor: d, target: s.target, facts: s.facts ?? { actor: { level: 0 }, target: {} }, rollDice: s.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: l } } });
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
function x() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class V extends x() {
  constructor(e, t) {
    super(), this.deityService = e, this.onSaved = t;
  }
  render(e = !1) {
    var s;
    const t = document.createElement("div");
    t.className = "dg-editor dg-detail", t.innerHTML = '<button class="dg-close" data-close>×</button><div class="dg-editor-header"><p class="eyebrow">DARKIS GODFORGE</p><h2>Neuen Gott erschaffen</h2><p class="muted">Definiere die Identität und die ersten Domänen deiner Gottheit.</p></div><form><label>Name<input name="name" required maxlength="80" placeholder="z. B. Tenebris"></label><label>Titel<input name="title" required maxlength="120" placeholder="z. B. Göttin der Schatten"></label><label>Beschreibung<textarea name="description" required maxlength="1000" rows="4"></textarea></label><label>Domänen<input name="domains" required placeholder="Schatten, Geheimnisse, Täuschung"></label><label>Ausrichtung<input name="alignment" placeholder="Neutral Böse"></label><div class="dg-editor-actions"><button type="button" data-close>Abbrechen</button><button class="dg-primary" type="submit">Gottheit speichern</button></div><p class="dg-form-error" role="alert"></p></form>', document.body.append(t), t.querySelectorAll("[data-close]").forEach((r) => r.addEventListener("click", () => t.remove())), (s = t.querySelector("form")) == null || s.addEventListener("submit", (r) => {
      r.preventDefault(), this.save(t);
    });
  }
  save(e) {
    const t = e.querySelector("form");
    if (!(t instanceof HTMLFormElement)) return;
    const s = new FormData(t);
    try {
      const r = this.deityService.create({ name: String(s.get("name") ?? "").trim(), title: String(s.get("title") ?? "").trim(), description: String(s.get("description") ?? "").trim(), domains: String(s.get("domains") ?? "").split(",").map((a) => a.trim()).filter(Boolean), alignment: String(s.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(r), e.remove();
    } catch (r) {
      const a = e.querySelector(".dg-form-error");
      a && (a.textContent = r instanceof Error ? r.message : "Die Gottheit konnte nicht gespeichert werden.");
    }
  }
}
const z = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function K() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class k extends K() {
  constructor(t) {
    super();
    c(this, "deityService");
    this.deityService = t;
    for (const s of z) t.save(s);
  }
  render(t = !1) {
    const s = document.createElement("div");
    s.className = "dg-dashboard", s.innerHTML = this.template(this.deityService.list()), document.body.append(s), s.querySelectorAll("[data-deity]").forEach((r) => r.addEventListener("click", () => this.showDetail(r.dataset.deity ?? ""))), s.querySelectorAll("[data-create]").forEach((r) => r.addEventListener("click", () => new V(this.deityService, () => {
      s.remove(), this.render(!0);
    }).render(!0)));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((s) => `<article class="dg-card" data-deity="${s.id}"><div class="dg-card-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${s.name}</h3><p>${s.title}</p><div class="dg-tags">${s.domains.slice(0, 3).map((r) => `<span>${r}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var a, o, n, l, d;
    const s = this.deityService.get(t);
    if (!s) return;
    const r = document.createElement("div");
    r.className = "dg-detail", r.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${s.name}</h2><p class="muted">${s.title}</p><p>${s.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${s.domains.map((g) => `<div>${g}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((a = s.passiveBonuses[0]) == null ? void 0 : a.value) ?? 0}</strong><span>${((o = s.passiveBonuses[0]) == null ? void 0 : o.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((n = s.abilities[0]) == null ? void 0 : n.name) ?? "Noch keine Fähigkeit"}</strong><span>${((l = s.abilities[0]) == null ? void 0 : l.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(r), (d = r.querySelector(".dg-close")) == null || d.addEventListener("click", () => r.remove());
  }
}
c(k, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class W {
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
    const r = { ...s, ...structuredClone(t), id: e, revision: s.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return r.checksum = this.checksum(r), this.save(r);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const t = JSON.stringify({ ...e, checksum: void 0 });
    let s = 2166136261;
    for (let r = 0; r < t.length; r += 1) s = Math.imul(s ^ t.charCodeAt(r), 16777619);
    return (s >>> 0).toString(16);
  }
}
function J() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function y(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const h = "darkis-godforge";
class X {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var s;
      const t = (s = e.flags) == null ? void 0 : s[h];
      return t && typeof t == "object" && "deity" in t && y(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((a) => {
      var n;
      const o = (n = a.flags) == null ? void 0 : n[h];
      return o && typeof o == "object" && "deity" in o && y(o.deity) && o.deity.id === e.id;
    }), s = { [h]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: s }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: s })).uuid : null;
  }
}
const u = "darkis-godforge";
function Q(i, e, t) {
  const s = J();
  s && (s.Hooks.once("init", () => {
    var r, a, o, n;
    (a = (r = s.game) == null ? void 0 : r.settings) == null || a.register(u, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (n = (o = s.game) == null ? void 0 : o.keybindings) == null || n.register(u, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => (t(), !0) });
  }), s.Hooks.on("getSceneControlButtons", (...r) => {
    const a = r[0];
    if (!Array.isArray(a)) return;
    const o = a.find((n) => typeof n == "object" && n !== null && "tools" in n);
    !(o != null && o.tools) || !Array.isArray(o.tools) || o.tools.push({ name: u, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: !0 });
  }), s.Hooks.once("ready", () => {
    var o, n, l;
    const r = (o = s.game) == null ? void 0 : o.journal;
    if (r) for (const d of new X(r).load()) e.save(d);
    const a = (l = (n = s.game) == null ? void 0 : n.modules) == null ? void 0 : l.get(u);
    a && (a.api = i);
  }));
}
class Y {
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
const f = new W(), Z = new C(), G = new q(f, Z), te = new Y(G, { currentUserId: "local", isGM: !0, ownsActor: () => !0, resolveActor: () => null });
function m() {
  new k(f).render(!0);
}
const b = globalThis;
b.Hooks ? (Q(G, f, m), b.Hooks.once("ready", m)) : typeof document < "u" && m();
export {
  k as GodForgeDashboard,
  G as api,
  f as deityService,
  Z as registry,
  te as socketRouter
};
