var S = Object.defineProperty;
var A = (t, e, i) => e in t ? S(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var l = (t, e, i) => A(t, typeof e != "symbol" ? e + "" : e, i);
function E(t, e) {
  return { name: t.name, type: "deity", description: t.description, system: { alignment: t.alignment ? [t.alignment] : [], domains: t.domains, favoredWeapon: t.favoredWeapon ?? "", font: t.font ? [t.font] : [], sanctification: t.sanctification ? [t.sanctification] : [], skill: t.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class G {
  constructor() {
    l(this, "id", "pf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, i) {
    return i ? (await i.createItem(E(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
function b(t) {
  return { name: t.name, type: "deity", description: t.description, system: { domains: t.domains, favoredWeapon: t.favoredWeapon ?? "", alignment: t.alignment ? [t.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: t.id } } };
}
class I {
  constructor() {
    l(this, "id", "sfrpg");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, i) {
    return i ? (await i.createItem(b(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class T {
  constructor() {
    l(this, "id", "sf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, i) {
    return i ? (await i.createItem(b(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class O {
  constructor() {
    l(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new G()), this.register(new T()), this.register(new I());
  }
  register(e) {
    this.adapters.set(e.id, e);
  }
  get(e) {
    const i = this.adapters.get(e);
    if (!i) throw new Error(`Unsupported game system: ${e}`);
    return i;
  }
  supports(e) {
    return this.adapters.has(e);
  }
}
function F(t) {
  return { id: t.id, name: t.name, title: t.title, image: t.image, domains: t.domains, alignment: t.alignment };
}
function $(t, e, i) {
  return t.filter((s) => s.visibility.library && !i.has(s.id) && (!e.pantheonFilter || s.domains.includes(e.pantheonFilter))).map(F);
}
function N(t, e) {
  if (t.mode === "all") return t.grants.map((s) => s.ref);
  const i = (e == null ? void 0 : e.groupId) === t.id ? e.refs : [];
  if (!t.pick || i.length !== t.pick || i.some((s) => !t.grants.some((r) => r.ref === s))) throw new Error(`Grant group ${t.id} requires ${t.pick ?? 1} valid choice(s).`);
  return i;
}
function w(t, e) {
  return t.used < t.max;
}
function R(t, e) {
  if (!w(t)) throw new Error("No uses remaining.");
  return { ...t, used: t.used + 1 };
}
function P(t, e) {
  return { ...t, used: 0, lastResetAt: e };
}
const U = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g, D = /^\d+d\d+(?:[+\-]\d+)?$/;
function B(t) {
  const e = t.replace(/\s/g, "");
  if (D.test(e)) return !0;
  const i = e.match(U);
  return i !== null && i.join("") === e;
}
function f(t, e) {
  if (!B(t) || /[a-z]/i.test(t.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (D.test(t.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const s = t.replace(/@actor\.level/g, String(e.actor.level)).replace(/@actor\.hpPercent/g, String(e.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(e.target.hpPercent ?? 0)).split(/([()+\-*/,])/).map((a) => a.trim()).filter(Boolean);
  let r = 0, o = "+";
  for (const a of s) {
    if (/^[()+\-*/,]$/.test(a)) {
      o = a;
      continue;
    }
    const n = Number(a);
    if (!Number.isFinite(n)) throw new Error("Formula could not be evaluated.");
    r = o === "*" ? r * n : o === "/" ? r / n : o === "-" ? r - n : r + n;
  }
  return r;
}
async function j(t, e) {
  const i = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  for (const s of t.effects) await H(s, e, i);
  return i;
}
async function H(t, e, i) {
  if (t.type === "message") {
    i.messages.push(t.text);
    return;
  }
  if (t.type === "heal" || t.type === "damage") {
    const r = t.target === "target" ? e.target : e.actor;
    if (!r) throw new Error("This ability requires a valid target.");
    const o = e.rollDice && /d/.test(t.formula) ? await e.rollDice(t.formula) : f(t.formula, e.facts);
    t.type === "heal" ? (i.healing += o, r.hp !== void 0 && (r.hp = Math.min(r.maxHp ?? Number.MAX_SAFE_INTEGER, r.hp + o))) : (i.damage += o, r.hp !== void 0 && (r.hp = Math.max(0, r.hp - o)));
    return;
  }
  if (t.type === "modifier") {
    const r = typeof t.value == "number" ? t.value : f(t.value, e.facts);
    e.actor.modifiers[t.selector] = r, i.appliedModifiers.push(t.selector);
    return;
  }
  if (t.type !== "condition") return;
  const s = t.target === "target" ? e.target : e.actor;
  if (!s) throw new Error("This ability requires a valid target.");
  s.conditions.push(t.condition), i.appliedConditions.push(t.condition);
}
class M {
  constructor(e, i) {
    this.deities = e, this.adapters = i;
  }
  getSelectableDeities(e) {
    return $(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  async materializeDeity(e, i, s) {
    const r = this.getDeity(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(i).materialize(r, s);
  }
  getDeity(e) {
    return this.deities.get(e);
  }
  getActorDeity(e) {
    var s;
    const i = (s = e.flags) == null ? void 0 : s["darkis-godforge"];
    return !i || typeof i != "object" || !("deityId" in i) || typeof i.deityId != "string" ? null : this.getDeity(i.deityId);
  }
  getGrantChoices(e, i) {
    var s;
    return ((s = this.getDeity(e)) == null ? void 0 : s.grantGroups) ?? null;
  }
  async assignDeity(e, i, s = {}) {
    const r = this.getDeity(i);
    if (!r || !r.visibility.players) throw new Error("Deity is not available for assignment.");
    const o = r.grantGroups.flatMap((n) => N(n, { groupId: n.id, refs: s[n.id] ?? [] })), a = Object.fromEntries(r.abilities.filter((n) => n.uses).map((n) => [n.id, { used: 0, max: n.uses.max, lastResetAt: Date.now(), reset: n.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: i, grants: o, usages: a } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, i) {
    const s = this.readState(e), r = Date.now(), o = Object.fromEntries(Object.entries(s.usages).map(([a, n]) => n.reset === i ? [a, P(n, r)] : [a, n]));
    await e.update({ flags: { "darkis-godforge": { ...s, usages: o } } });
  }
  async activateAbility(e, i, s = {}) {
    const r = this.readState(e), o = this.getDeity(r.deityId), a = o == null ? void 0 : o.abilities.find((g) => g.id === i);
    if (!a) throw new Error("Ability is not available for this actor.");
    const n = r.usages[i];
    if (n && !w(n)) throw new Error("No uses remaining.");
    const c = n ? { ...r.usages, [i]: R(n) } : r.usages, d = { id: e.id, modifiers: {}, conditions: [] };
    await j(a, { actor: d, target: s.target, facts: s.facts ?? { actor: { level: 0 }, target: {} }, rollDice: s.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: c } } });
  }
  getReplacementFor(e) {
    return this.deities.list().find((i) => i.replacement.sourceUuid === e && i.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, i) {
    return this.deities.list().some((s) => s.replacement.sourceUuid === e && s.replacement.mode === "hide" && s.replacement.contexts.includes(i));
  }
  registerAdapter(e) {
    this.adapters.register(e);
  }
  readState(e) {
    var s;
    const i = (s = e.flags) == null ? void 0 : s["darkis-godforge"];
    if (!i || typeof i != "object" || !("deityId" in i) || typeof i.deityId != "string" || !("usages" in i) || typeof i.usages != "object") throw new Error("Actor has no assigned deity.");
    return i;
  }
}
const C = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function _() {
  var t, e, i;
  return ((i = (e = (t = globalThis.foundry) == null ? void 0 : t.applications) == null ? void 0 : e.api) == null ? void 0 : i.ApplicationV2) ?? class {
    render() {
    }
  };
}
class k extends _() {
  constructor(i) {
    super();
    l(this, "deityService");
    this.deityService = i;
    for (const s of C) i.save(s);
  }
  render(i = !1) {
    const s = document.createElement("div");
    s.className = "dg-dashboard", s.innerHTML = this.template(this.deityService.list()), document.body.append(s), s.querySelectorAll("[data-deity]").forEach((r) => r.addEventListener("click", () => this.showDetail(r.dataset.deity ?? "")));
  }
  template(i) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${i.length} Einträge</span></div><div class="dg-grid">${i.map((s) => `<article class="dg-card" data-deity="${s.id}"><div class="dg-card-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${s.name}</h3><p>${s.title}</p><div class="dg-tags">${s.domains.slice(0, 3).map((r) => `<span>${r}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${i.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(i) {
    var o, a, n, c, d;
    const s = this.deityService.get(i);
    if (!s) return;
    const r = document.createElement("div");
    r.className = "dg-detail", r.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${s.name}</h2><p class="muted">${s.title}</p><p>${s.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${s.domains.map((g) => `<div>${g}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((o = s.passiveBonuses[0]) == null ? void 0 : o.value) ?? 0}</strong><span>${((a = s.passiveBonuses[0]) == null ? void 0 : a.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((n = s.abilities[0]) == null ? void 0 : n.name) ?? "Noch keine Fähigkeit"}</strong><span>${((c = s.abilities[0]) == null ? void 0 : c.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(r), (d = r.querySelector(".dg-close")) == null || d.addEventListener("click", () => r.remove());
  }
}
l(k, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class L {
  constructor() {
    l(this, "definitions", /* @__PURE__ */ new Map());
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
    const i = (/* @__PURE__ */ new Date()).toISOString(), s = { ...structuredClone(e), id: crypto.randomUUID(), schemaVersion: 1, revision: 1, createdAt: i, updatedAt: i, checksum: "pending" };
    return s.checksum = this.checksum(s), this.save(s);
  }
  update(e, i) {
    const s = this.get(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    const r = { ...s, ...structuredClone(i), id: e, revision: s.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return r.checksum = this.checksum(r), this.save(r);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const i = JSON.stringify({ ...e, checksum: void 0 });
    let s = 2166136261;
    for (let r = 0; r < i.length; r += 1) s = Math.imul(s ^ i.charCodeAt(r), 16777619);
    return (s >>> 0).toString(16);
  }
}
function q() {
  const t = globalThis;
  return t.Hooks ? { Hooks: t.Hooks, game: t.game } : null;
}
function v(t) {
  if (!t || typeof t != "object") return !1;
  const e = t;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const p = "darkis-godforge";
class x {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var s;
      const i = (s = e.flags) == null ? void 0 : s[p];
      return i && typeof i == "object" && "deity" in i && v(i.deity) ? [i.deity] : [];
    });
  }
  async save(e) {
    const i = this.collection.contents.find((o) => {
      var n;
      const a = (n = o.flags) == null ? void 0 : n[p];
      return a && typeof a == "object" && "deity" in a && v(a.deity) && a.deity.id === e.id;
    }), s = { [p]: { schemaVersion: e.schemaVersion, deity: e } };
    return i ? (await i.update({ flags: s }), i.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: s })).uuid : null;
  }
}
const u = "darkis-godforge";
function z(t, e, i) {
  const s = q();
  s && (s.Hooks.once("init", () => {
    var r, o, a, n;
    (o = (r = s.game) == null ? void 0 : r.settings) == null || o.register(u, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (n = (a = s.game) == null ? void 0 : a.keybindings) == null || n.register(u, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => (i(), !0) });
  }), s.Hooks.on("getSceneControlButtons", (...r) => {
    const o = r[0];
    if (!Array.isArray(o)) return;
    const a = o.find((n) => typeof n == "object" && n !== null && "tools" in n);
    !(a != null && a.tools) || !Array.isArray(a.tools) || a.tools.push({ name: u, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: i, visible: !0 });
  }), s.Hooks.once("ready", () => {
    var a, n, c;
    const r = (a = s.game) == null ? void 0 : a.journal;
    if (r) for (const d of new x(r).load()) e.save(d);
    const o = (c = (n = s.game) == null ? void 0 : n.modules) == null ? void 0 : c.get(u);
    o && (o.api = t);
  }));
}
const h = new L(), K = new O(), V = new M(h, K);
function m() {
  new k(h).render(!0);
}
const y = globalThis;
y.Hooks ? (z(V, h, m), y.Hooks.once("ready", m)) : typeof document < "u" && m();
export {
  k as GodForgeDashboard,
  V as api,
  h as deityService,
  K as registry
};
