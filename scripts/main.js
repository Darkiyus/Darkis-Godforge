var w = Object.defineProperty;
var k = (t, e, i) => e in t ? w(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var l = (t, e, i) => k(t, typeof e != "symbol" ? e + "" : e, i);
function D(t, e) {
  return { name: t.name, type: "deity", description: t.description, system: { alignment: t.alignment ? [t.alignment] : [], domains: t.domains, favoredWeapon: t.favoredWeapon ?? "", font: t.font ? [t.font] : [], sanctification: t.sanctification ? [t.sanctification] : [], skill: t.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class S {
  constructor() {
    l(this, "id", "pf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, i) {
    return i ? (await i.createItem(D(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
function h(t) {
  return { name: t.name, type: "deity", description: t.description, system: { domains: t.domains, favoredWeapon: t.favoredWeapon ?? "", alignment: t.alignment ? [t.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: t.id } } };
}
class E {
  constructor() {
    l(this, "id", "sfrpg");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, i) {
    return i ? (await i.createItem(h(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class A {
  constructor() {
    l(this, "id", "sf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, i) {
    return i ? (await i.createItem(h(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class G {
  constructor() {
    l(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new S()), this.register(new A()), this.register(new E());
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
function $(t) {
  return { id: t.id, name: t.name, title: t.title, image: t.image, domains: t.domains, alignment: t.alignment };
}
function T(t, e, i) {
  return t.filter((s) => s.visibility.library && !i.has(s.id) && (!e.pantheonFilter || s.domains.includes(e.pantheonFilter))).map($);
}
function F(t, e) {
  if (t.mode === "all") return t.grants.map((s) => s.ref);
  const i = (e == null ? void 0 : e.groupId) === t.id ? e.refs : [];
  if (!t.pick || i.length !== t.pick || i.some((s) => !t.grants.some((r) => r.ref === s))) throw new Error(`Grant group ${t.id} requires ${t.pick ?? 1} valid choice(s).`);
  return i;
}
function f(t, e) {
  return t.used < t.max;
}
function I(t, e) {
  if (!f(t)) throw new Error("No uses remaining.");
  return { ...t, used: t.used + 1 };
}
function N(t, e) {
  return { ...t, used: 0, lastResetAt: e };
}
const P = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g, v = /^\d+d\d+(?:[+\-]\d+)?$/;
function M(t) {
  const e = t.replace(/\s/g, "");
  if (v.test(e)) return !0;
  const i = e.match(P);
  return i !== null && i.join("") === e;
}
function g(t, e) {
  if (!M(t) || /[a-z]/i.test(t.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (v.test(t.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const s = t.replace(/@actor\.level/g, String(e.actor.level)).replace(/@actor\.hpPercent/g, String(e.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(e.target.hpPercent ?? 0)).split(/([()+\-*/,])/).map((o) => o.trim()).filter(Boolean);
  let r = 0, n = "+";
  for (const o of s) {
    if (/^[()+\-*/,]$/.test(o)) {
      n = o;
      continue;
    }
    const a = Number(o);
    if (!Number.isFinite(a)) throw new Error("Formula could not be evaluated.");
    r = n === "*" ? r * a : n === "/" ? r / a : n === "-" ? r - a : r + a;
  }
  return r;
}
async function O(t, e) {
  const i = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  for (const s of t.effects) await B(s, e, i);
  return i;
}
async function B(t, e, i) {
  if (t.type === "message") {
    i.messages.push(t.text);
    return;
  }
  if (t.type === "heal" || t.type === "damage") {
    const r = t.target === "target" ? e.target : e.actor;
    if (!r) throw new Error("This ability requires a valid target.");
    const n = e.rollDice && /d/.test(t.formula) ? await e.rollDice(t.formula) : g(t.formula, e.facts);
    t.type === "heal" ? (i.healing += n, r.hp !== void 0 && (r.hp = Math.min(r.maxHp ?? Number.MAX_SAFE_INTEGER, r.hp + n))) : (i.damage += n, r.hp !== void 0 && (r.hp = Math.max(0, r.hp - n)));
    return;
  }
  if (t.type === "modifier") {
    const r = typeof t.value == "number" ? t.value : g(t.value, e.facts);
    e.actor.modifiers[t.selector] = r, i.appliedModifiers.push(t.selector);
    return;
  }
  if (t.type !== "condition") return;
  const s = t.target === "target" ? e.target : e.actor;
  if (!s) throw new Error("This ability requires a valid target.");
  s.conditions.push(t.condition), i.appliedConditions.push(t.condition);
}
class U {
  constructor(e, i) {
    this.deities = e, this.adapters = i;
  }
  getSelectableDeities(e) {
    return T(this.deities.list(), e, /* @__PURE__ */ new Set());
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
    const n = r.grantGroups.flatMap((a) => F(a, { groupId: a.id, refs: s[a.id] ?? [] })), o = Object.fromEntries(r.abilities.filter((a) => a.uses).map((a) => [a.id, { used: 0, max: a.uses.max, lastResetAt: Date.now(), reset: a.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: i, grants: n, usages: o } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, i) {
    const s = this.readState(e), r = Date.now(), n = Object.fromEntries(Object.entries(s.usages).map(([o, a]) => a.reset === i ? [o, N(a, r)] : [o, a]));
    await e.update({ flags: { "darkis-godforge": { ...s, usages: n } } });
  }
  async activateAbility(e, i, s = {}) {
    const r = this.readState(e), n = this.getDeity(r.deityId), o = n == null ? void 0 : n.abilities.find((u) => u.id === i);
    if (!o) throw new Error("Ability is not available for this actor.");
    const a = r.usages[i];
    if (a && !f(a)) throw new Error("No uses remaining.");
    const d = a ? { ...r.usages, [i]: I(a) } : r.usages, c = { id: e.id, modifiers: {}, conditions: [] };
    await O(o, { actor: c, target: s.target, facts: s.facts ?? { actor: { level: 0 }, target: {} }, rollDice: s.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: d } } });
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
function j() {
  var t, e, i;
  return ((i = (e = (t = globalThis.foundry) == null ? void 0 : t.applications) == null ? void 0 : e.api) == null ? void 0 : i.ApplicationV2) ?? class {
    render() {
    }
  };
}
class b extends j() {
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
    var n, o, a, d, c;
    const s = this.deityService.get(i);
    if (!s) return;
    const r = document.createElement("div");
    r.className = "dg-detail", r.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${s.name}</h2><p class="muted">${s.title}</p><p>${s.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${s.domains.map((u) => `<div>${u}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((n = s.passiveBonuses[0]) == null ? void 0 : n.value) ?? 0}</strong><span>${((o = s.passiveBonuses[0]) == null ? void 0 : o.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((a = s.abilities[0]) == null ? void 0 : a.name) ?? "Noch keine Fähigkeit"}</strong><span>${((d = s.abilities[0]) == null ? void 0 : d.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(r), (c = r.querySelector(".dg-close")) == null || c.addEventListener("click", () => r.remove());
  }
}
l(b, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class R {
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
const y = new R(), L = new G(), q = new U(y, L);
function m() {
  new b(y).render(!0);
}
const p = globalThis;
p.Hooks ? p.Hooks.once("ready", () => {
  var e, i;
  const t = (i = (e = p.game) == null ? void 0 : e.modules) == null ? void 0 : i.get("darkis-godforge");
  t && (t.api = q), m();
}) : typeof document < "u" && m();
export {
  b as GodForgeDashboard,
  q as api,
  y as deityService,
  L as registry
};
