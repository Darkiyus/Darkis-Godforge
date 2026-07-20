var E = Object.defineProperty;
var T = (i, e, t) => e in i ? E(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var c = (i, e, t) => T(i, typeof e != "symbol" ? e + "" : e, t);
function $(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class F {
  constructor() {
    c(this, "id", "pf2e");
    c(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem($(e, e.id))).uuid : null;
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
class C {
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
class O {
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
class R {
  constructor() {
    c(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new F()), this.register(new O()), this.register(new C());
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
function M(i, e, t) {
  return i.filter((s) => s.visibility.library && !t.has(s.id) && (!e.pantheonFilter || s.domains.includes(e.pantheonFilter))).map(N);
}
function S(i, e) {
  if (i.mode === "all") return i.grants.map((s) => s.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((s) => !i.grants.some((n) => n.ref === s))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function D(i, e) {
  return i.used < i.max;
}
function U(i, e) {
  if (!D(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function x(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const B = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|\b(?:min|max|round|floor|ceil|abs|clamp)\b|\d+(?:\.\d+)?|[()+\-*/,\.]/g, A = /^\d+d\d+(?:[+\-]\d+)?$/;
function L(i) {
  const e = i.replace(/\s/g, "");
  if (A.test(e)) return !0;
  const t = e.match(B);
  return t !== null && t.join("") === e;
}
function v(i, e) {
  if (!L(i) || /[a-z]/i.test(i.replace(/@(?:actor\.level|actor\.hpPercent|target\.hpPercent)/g, ""))) throw new Error("Formula contains an unsupported term.");
  if (A.test(i.replace(/\s/g, ""))) throw new Error("Dice formulas require Foundry Roll at runtime.");
  const s = i.replace(/@actor\.level/g, String(e.actor.level)).replace(/@actor\.hpPercent/g, String(e.actor.hpPercent ?? 0)).replace(/@target\.hpPercent/g, String(e.target.hpPercent ?? 0)).split(/([()+\-*/,])/).map((a) => a.trim()).filter(Boolean);
  let n = 0, r = "+";
  for (const a of s) {
    if (/^[()+\-*/,]$/.test(a)) {
      r = a;
      continue;
    }
    const o = Number(a);
    if (!Number.isFinite(o)) throw new Error("Formula could not be evaluated.");
    n = r === "*" ? n * o : r === "/" ? n / o : r === "-" ? n - o : n + o;
  }
  return n;
}
function g(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !g(i.child, e);
  const t = i.children.map((s) => g(s, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function j(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !g(i.condition, e.conditionFacts ?? {})) return t;
  for (const s of i.effects) await k(s, e, t);
  return t;
}
async function k(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const n = g(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const r of n) await k(r, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const n = i.target === "target" ? e.target : e.actor;
    if (!n) throw new Error("This ability requires a valid target.");
    const r = e.rollDice && /d/.test(i.formula) ? await e.rollDice(i.formula) : v(i.formula, e.facts);
    i.type === "heal" ? (t.healing += r, n.hp !== void 0 && (n.hp = Math.min(n.maxHp ?? Number.MAX_SAFE_INTEGER, n.hp + r))) : (t.damage += r, n.hp !== void 0 && (n.hp = Math.max(0, n.hp - r)));
    return;
  }
  if (i.type === "modifier") {
    const n = typeof i.value == "number" ? i.value : v(i.value, e.facts);
    e.actor.modifiers[i.selector] = n, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const s = i.target === "target" ? e.target : e.actor;
  if (!s) throw new Error("This ability requires a valid target.");
  s.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
const H = /* @__PURE__ */ new Set(["cleric", "champion"]);
function P(i, e, t = []) {
  if (!H.has(e)) throw new Error(`Unsupported deity class coupling: ${e}`);
  const s = i.grantGroups.flatMap((n) => S(n, t.find((r) => r.groupId === n.id)));
  return { deityId: i.id, classId: e, grants: s, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification } };
}
function q(i, e) {
  return !i || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: i.id, name: i.name, title: i.title, image: i.image }, grants: e.grants, abilities: i.abilities.map((t) => {
    var s;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((s = e.usages[t.id]) == null ? void 0 : s.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
class _ {
  constructor(e, t) {
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    return M(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  async materializeDeity(e, t, s) {
    const n = this.getDeity(e);
    if (!n) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(n, s);
  }
  getDeity(e) {
    return this.deities.get(e);
  }
  getActorDeity(e) {
    var s;
    const t = (s = e.flags) == null ? void 0 : s["darkis-godforge"];
    return !t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string" ? null : this.getDeity(t.deityId);
  }
  getCharacterWidgetData(e) {
    var n;
    const t = (n = e.flags) == null ? void 0 : n["darkis-godforge"], s = t && typeof t == "object" && "deityId" in t && "grants" in t && "usages" in t ? t : null;
    return q(this.getActorDeity(e), s);
  }
  getGrantChoices(e, t) {
    var s;
    return ((s = this.getDeity(e)) == null ? void 0 : s.grantGroups) ?? null;
  }
  getClassGrants(e, t, s = []) {
    const n = this.getDeity(e);
    if (!n) throw new Error(`Unknown deity: ${e}`);
    return P(n, t, s);
  }
  buildClassCoupling(e, t, s, n = []) {
    return this.adapters.get(s).buildClassCoupling(this.getClassGrants(e, t, n));
  }
  async assignDeity(e, t, s = {}) {
    const n = this.getDeity(t);
    if (!n || !n.visibility.players) throw new Error("Deity is not available for assignment.");
    const r = n.grantGroups.flatMap((o) => S(o, { groupId: o.id, refs: s[o.id] ?? [] })), a = Object.fromEntries(n.abilities.filter((o) => o.uses).map((o) => [o.id, { used: 0, max: o.uses.max, lastResetAt: Date.now(), reset: o.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: r, usages: a } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const s = this.readState(e), n = Date.now(), r = Object.fromEntries(Object.entries(s.usages).map(([a, o]) => o.reset === t ? [a, x(o, n)] : [a, o]));
    await e.update({ flags: { "darkis-godforge": { ...s, usages: r } } });
  }
  async activateAbility(e, t, s = {}) {
    const n = this.readState(e), r = this.getDeity(n.deityId), a = r == null ? void 0 : r.abilities.find((d) => d.id === t);
    if (!a) throw new Error("Ability is not available for this actor.");
    const o = n.usages[t];
    if (o && !D(o)) throw new Error("No uses remaining.");
    const l = o ? { ...n.usages, [t]: U(o) } : n.usages, u = { id: e.id, modifiers: {}, conditions: [] };
    await j(a, { actor: u, target: s.target, facts: s.facts ?? { actor: { level: 0 }, target: {} }, rollDice: s.rollDice }), await e.update({ flags: { "darkis-godforge": { ...n, usages: l } } });
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
function V() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class K extends V() {
  constructor(e, t) {
    super(), this.deityService = e, this.onSaved = t;
  }
  render(e = !1) {
    var s;
    const t = document.createElement("div");
    t.className = "dg-editor dg-detail", t.innerHTML = '<button class="dg-close" data-close>×</button><div class="dg-editor-header"><p class="eyebrow">DARKIS GODFORGE</p><h2>Neuen Gott erschaffen</h2><p class="muted">Definiere die Identität und die ersten Domänen deiner Gottheit.</p></div><form><label>Name<input name="name" required maxlength="80" placeholder="z. B. Tenebris"></label><label>Titel<input name="title" required maxlength="120" placeholder="z. B. Göttin der Schatten"></label><label>Beschreibung<textarea name="description" required maxlength="1000" rows="4"></textarea></label><label>Domänen<input name="domains" required placeholder="Schatten, Geheimnisse, Täuschung"></label><label>Ausrichtung<input name="alignment" placeholder="Neutral Böse"></label><div class="dg-editor-actions"><button type="button" data-close>Abbrechen</button><button class="dg-primary" type="submit">Gottheit speichern</button></div><p class="dg-form-error" role="alert"></p></form>', document.body.append(t), t.querySelectorAll("[data-close]").forEach((n) => n.addEventListener("click", () => t.remove())), (s = t.querySelector("form")) == null || s.addEventListener("submit", (n) => {
      n.preventDefault(), this.save(t);
    });
  }
  save(e) {
    const t = e.querySelector("form");
    if (!(t instanceof HTMLFormElement)) return;
    const s = new FormData(t);
    try {
      const n = this.deityService.create({ name: String(s.get("name") ?? "").trim(), title: String(s.get("title") ?? "").trim(), description: String(s.get("description") ?? "").trim(), domains: String(s.get("domains") ?? "").split(",").map((r) => r.trim()).filter(Boolean), alignment: String(s.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(n), e.remove();
    } catch (n) {
      const r = e.querySelector(".dg-form-error");
      r && (r.textContent = n instanceof Error ? n.message : "Die Gottheit konnte nicht gespeichert werden.");
    }
  }
}
function W() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class z extends W() {
  constructor(e) {
    super(), this.deityService = e;
  }
  render(e = !1) {
    const t = document.createElement("div");
    t.className = "dg-codex dg-detail", t.innerHTML = `<button class="dg-close" data-close>×</button><div class="dg-codex-title"><p class="eyebrow">DARKIS GODFORGE</p><h2>Götterkodex</h2><p class="muted">Durchsuche dein Pantheon und entdecke seine Geschichten.</p></div><div class="dg-codex-toolbar"><input data-search placeholder="Götter durchsuchen..."><select data-filter><option value="">Alle Domänen</option>${[...new Set(this.deityService.list().flatMap((a) => a.domains))].sort().map((a) => `<option value="${a}">${a}</option>`).join("")}</select></div><div class="dg-codex-list" data-list></div>`, document.body.append(t), t.querySelectorAll("[data-close]").forEach((a) => a.addEventListener("click", () => t.remove()));
    const s = t.querySelector("[data-search]"), n = t.querySelector("[data-filter]"), r = () => {
      const a = (s == null ? void 0 : s.value.toLocaleLowerCase()) ?? "", o = (n == null ? void 0 : n.value) ?? "", l = this.deityService.list().filter((d) => (!a || `${d.name} ${d.title}`.toLocaleLowerCase().includes(a)) && (!o || d.domains.includes(o))), u = t.querySelector("[data-list]");
      u && (u.innerHTML = l.map((d) => `<article class="dg-codex-entry"><div><h3>${d.name}</h3><p>${d.title}</p></div><span>${d.domains.slice(0, 3).join(" · ")}</span></article>`).join("") || '<p class="muted">Keine Gottheiten gefunden.</p>');
    };
    s == null || s.addEventListener("input", r), n == null || n.addEventListener("change", r), r();
  }
}
const J = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function X() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class I extends X() {
  constructor(t) {
    super();
    c(this, "deityService");
    this.deityService = t;
    for (const s of J) t.save(s);
  }
  render(t = !1) {
    const s = document.createElement("div");
    s.className = "dg-dashboard", s.innerHTML = this.template(this.deityService.list()), document.body.append(s), s.querySelectorAll("[data-deity]").forEach((n) => n.addEventListener("click", () => this.showDetail(n.dataset.deity ?? ""))), s.querySelectorAll("[data-create]").forEach((n) => n.addEventListener("click", () => new K(this.deityService, () => {
      s.remove(), this.render(!0);
    }).render(!0))), s.querySelectorAll("[data-codex]").forEach((n) => n.addEventListener("click", () => new z(this.deityService).render(!0)));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><div class="dg-hero-actions"><button class="dg-secondary" data-codex>Götterkodex</button><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></div></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((s) => `<article class="dg-card" data-deity="${s.id}"><div class="dg-card-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${s.name}</h3><p>${s.title}</p><div class="dg-tags">${s.domains.slice(0, 3).map((n) => `<span>${n}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var r, a, o, l, u;
    const s = this.deityService.get(t);
    if (!s) return;
    const n = document.createElement("div");
    n.className = "dg-detail", n.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${s.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${s.name}</h2><p class="muted">${s.title}</p><p>${s.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${s.domains.map((d) => `<div>${d}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((r = s.passiveBonuses[0]) == null ? void 0 : r.value) ?? 0}</strong><span>${((a = s.passiveBonuses[0]) == null ? void 0 : a.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((o = s.abilities[0]) == null ? void 0 : o.name) ?? "Noch keine Fähigkeit"}</strong><span>${((l = s.abilities[0]) == null ? void 0 : l.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(n), (u = n.querySelector(".dg-close")) == null || u.addEventListener("click", () => n.remove());
  }
}
c(I, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class Q {
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
    const n = { ...s, ...structuredClone(t), id: e, revision: s.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return n.checksum = this.checksum(n), this.save(n);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const t = JSON.stringify({ ...e, checksum: void 0 });
    let s = 2166136261;
    for (let n = 0; n < t.length; n += 1) s = Math.imul(s ^ t.charCodeAt(n), 16777619);
    return (s >>> 0).toString(16);
  }
}
function Y() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function y(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const h = "darkis-godforge";
class Z {
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
    const t = this.collection.contents.find((r) => {
      var o;
      const a = (o = r.flags) == null ? void 0 : o[h];
      return a && typeof a == "object" && "deity" in a && y(a.deity) && a.deity.id === e.id;
    }), s = { [h]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: s }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: s })).uuid : null;
  }
}
const p = "darkis-godforge";
function ee(i, e, t) {
  const s = Y();
  s && (s.Hooks.once("init", () => {
    var n, r, a, o;
    (r = (n = s.game) == null ? void 0 : n.settings) == null || r.register(p, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (o = (a = s.game) == null ? void 0 : a.keybindings) == null || o.register(p, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => (t(), !0) });
  }), s.Hooks.on("getSceneControlButtons", (...n) => {
    const r = n[0];
    if (!Array.isArray(r)) return;
    const a = r.find((o) => typeof o == "object" && o !== null && "tools" in o);
    !(a != null && a.tools) || !Array.isArray(a.tools) || a.tools.push({ name: p, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: !0 });
  }), s.Hooks.once("ready", () => {
    var a, o, l;
    const n = (a = s.game) == null ? void 0 : a.journal;
    if (n) for (const u of new Z(n).load()) e.save(u);
    const r = (l = (o = s.game) == null ? void 0 : o.modules) == null ? void 0 : l.get(p);
    r && (r.api = i);
  }));
}
class te {
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
const f = new Q(), ie = new R(), G = new _(f, ie), ne = new te(G, { currentUserId: "local", isGM: !0, ownsActor: () => !0, resolveActor: () => null });
function m() {
  new I(f).render(!0);
}
const b = globalThis;
b.Hooks ? (ee(G, f, m), b.Hooks.once("ready", m)) : typeof document < "u" && m();
export {
  I as GodForgeDashboard,
  G as api,
  f as deityService,
  ie as registry,
  ne as socketRouter
};
