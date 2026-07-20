var C = Object.defineProperty;
var T = (i, e, t) => e in i ? C(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var l = (i, e, t) => T(i, typeof e != "symbol" ? e + "" : e, t);
function $(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class F {
  constructor() {
    l(this, "id", "pf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
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
function b(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class M {
  constructor() {
    l(this, "id", "sfrpg");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(b(e))).uuid : null;
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
    l(this, "id", "sf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(b(e))).uuid : null;
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
    l(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new F()), this.register(new O()), this.register(new M());
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
  return i.filter((r) => r.visibility.library && !t.has(r.id) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).map(N);
}
function k(i, e) {
  if (i.mode === "all") return i.grants.map((r) => r.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((r) => !i.grants.some((s) => s.ref === r))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function D(i, e) {
  return i.used < i.max;
}
function L(i, e) {
  if (!D(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function B(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const j = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, S = /^\d+d\d+(?:[+\-]\d+)?$/, H = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function A(i) {
  const e = i.replace(/\s/g, ""), t = e.match(j);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function V(i) {
  const e = i.replace(/\s/g, "");
  if (S.test(e)) return !0;
  try {
    return new E(A(e), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function v(i, e) {
  const t = i.replace(/\s/g, "");
  if (!V(t)) throw new Error("Formula contains an unsupported term.");
  if (S.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new E(A(t), e).parse();
}
class E {
  constructor(e, t) {
    l(this, "position", 0);
    this.tokens = e, this.facts = t;
  }
  parse() {
    const e = this.expression();
    if (this.position !== this.tokens.length) throw new Error("Unexpected formula token.");
    if (!Number.isFinite(e)) throw new Error("Formula could not be evaluated.");
    return e;
  }
  expression() {
    let e = this.term();
    for (; this.peek("+") || this.peek("-"); ) {
      const t = this.take(), r = this.term();
      e = t === "+" ? e + r : e - r;
    }
    return e;
  }
  term() {
    let e = this.unary();
    for (; this.peek("*") || this.peek("/"); ) {
      const t = this.take(), r = this.unary();
      e = t === "*" ? e * r : e / r;
    }
    return e;
  }
  unary() {
    return this.peek("+") ? (this.take(), this.unary()) : this.peek("-") ? (this.take(), -this.unary()) : this.primary();
  }
  primary() {
    const e = this.take();
    if (e === "(") {
      const t = this.expression();
      return this.expect(")"), t;
    }
    if (/^\d/.test(e)) return Number(e);
    if (e === "@actor.level") return this.facts.actor.level;
    if (e === "@actor.hpPercent") return this.facts.actor.hpPercent ?? 0;
    if (e === "@target.hpPercent") return this.facts.target.hpPercent ?? 0;
    if (H.has(e)) return this.call(e);
    throw new Error("Unknown formula identifier.");
  }
  call(e) {
    this.expect("(");
    const t = [this.expression()];
    for (; this.peek(","); )
      this.take(), t.push(this.expression());
    if (this.expect(")"), e === "min" && t.length >= 1) return Math.min(...t);
    if (e === "max" && t.length >= 1) return Math.max(...t);
    if (e === "round" && t.length === 1) return Math.round(t[0]);
    if (e === "floor" && t.length === 1) return Math.floor(t[0]);
    if (e === "ceil" && t.length === 1) return Math.ceil(t[0]);
    if (e === "abs" && t.length === 1) return Math.abs(t[0]);
    if (e === "clamp" && t.length === 3) return Math.min(Math.max(t[0], t[1]), t[2]);
    if (e === "if" && t.length === 3) return t[0] !== 0 ? t[1] : t[2];
    throw new Error("Invalid formula function arguments.");
  }
  peek(e) {
    return this.tokens[this.position] === e;
  }
  take() {
    const e = this.tokens[this.position];
    if (!e) throw new Error("Unexpected end of formula.");
    return this.position += 1, e;
  }
  expect(e) {
    if (!this.peek(e)) throw new Error(`Expected ${e}.`);
    this.position += 1;
  }
}
function p(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !p(i.child, e);
  const t = i.children.map((r) => p(r, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function P(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !p(i.condition, e.conditionFacts ?? {})) return t;
  for (const r of i.effects) await I(r, e, t);
  return t;
}
async function I(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const s = p(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const n of s) await I(n, e, t);
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
const q = /* @__PURE__ */ new Set(["cleric", "champion"]);
function _(i, e, t = []) {
  if (!q.has(e)) throw new Error(`Unsupported deity class coupling: ${e}`);
  const r = i.grantGroups.flatMap((s) => k(s, t.find((n) => n.groupId === s.id)));
  return { deityId: i.id, classId: e, grants: r, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification } };
}
function z(i, e) {
  return !i || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: i.id, name: i.name, title: i.title, image: i.image }, grants: e.grants, abilities: i.abilities.map((t) => {
    var r;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((r = e.usages[t.id]) == null ? void 0 : r.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
function W(i) {
  const e = [];
  if (i.schemaVersion > 1) throw new Error(`Unsupported deity schema ${i.schemaVersion}.`);
  if (i.schemaVersion === 1) return { definition: structuredClone(i), migrated: !1, warnings: e };
  const t = { ...structuredClone(i), schemaVersion: 1, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  return e.push("Legacy definition normalized to schema version 1."), { definition: t, migrated: !0, warnings: e };
}
function K(i, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 1, exportedAt: e, deities: structuredClone(i) };
}
function J(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion <= 1 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function Z(i) {
  if (!J(i)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return i.deities.map((e) => W(e).definition);
}
function X(i, e = Math.random) {
  const t = i.filter((a) => Number.isFinite(a.weight) && a.weight > 0), r = t.reduce((a, c) => a + c.weight, 0);
  if (!t.length || r <= 0) throw new Error("Random table has no selectable entries.");
  const s = Math.min(Math.max(e(), 0), 0.999999999) * r;
  let n = 0;
  for (const [a, c] of t.entries())
    if (n += c.weight, s < n) return { entry: c, index: a, roll: s };
  return { entry: t[t.length - 1], index: t.length - 1, roll: s };
}
class Q {
  constructor(e, t) {
    l(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    var n;
    const t = this.deities.list(), r = JSON.stringify([t.map((o) => [o.id, o.revision]), e]);
    if (((n = this.catalogCache) == null ? void 0 : n.key) === r) return this.catalogCache.result;
    const s = U(t, e, /* @__PURE__ */ new Set());
    return this.catalogCache = { key: r, result: s }, s;
  }
  exportDeities(e) {
    return K(this.deities.list(), e);
  }
  importDeities(e) {
    const t = Z(e);
    for (const r of t) this.deities.save(r);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e = Math.random) {
    return X(this.deities.list().map((t) => ({ id: t.id, label: t.name, weight: 1 })), e);
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
  getCharacterWidgetData(e) {
    var s;
    const t = (s = e.flags) == null ? void 0 : s["darkis-godforge"], r = t && typeof t == "object" && "deityId" in t && "grants" in t && "usages" in t ? t : null;
    return z(this.getActorDeity(e), r);
  }
  getGrantChoices(e, t) {
    var r;
    return ((r = this.getDeity(e)) == null ? void 0 : r.grantGroups) ?? null;
  }
  getClassGrants(e, t, r = []) {
    const s = this.getDeity(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    return _(s, t, r);
  }
  buildClassCoupling(e, t, r, s = []) {
    return this.adapters.get(r).buildClassCoupling(this.getClassGrants(e, t, s));
  }
  async assignDeity(e, t, r = {}) {
    const s = this.getDeity(t);
    if (!s || !s.visibility.players) throw new Error("Deity is not available for assignment.");
    const n = s.grantGroups.flatMap((a) => k(a, { groupId: a.id, refs: r[a.id] ?? [] })), o = Object.fromEntries(s.abilities.filter((a) => a.uses).map((a) => [a.id, { used: 0, max: a.uses.max, lastResetAt: Date.now(), reset: a.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: n, usages: o } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const r = this.readState(e), s = Date.now(), n = Object.fromEntries(Object.entries(r.usages).map(([o, a]) => a.reset === t ? [o, B(a, s)] : [o, a]));
    await e.update({ flags: { "darkis-godforge": { ...r, usages: n } } });
  }
  async activateAbility(e, t, r = {}) {
    const s = this.readState(e), n = this.getDeity(s.deityId), o = n == null ? void 0 : n.abilities.find((d) => d.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const a = s.usages[t];
    if (a && !D(a)) throw new Error("No uses remaining.");
    const c = a ? { ...s.usages, [t]: L(a) } : s.usages, u = { id: e.id, modifiers: {}, conditions: [] };
    await P(o, { actor: u, target: r.target, facts: r.facts ?? { actor: { level: 0 }, target: {} }, rollDice: r.rollDice }), await e.update({ flags: { "darkis-godforge": { ...s, usages: c } } });
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
function Y() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class ee extends Y() {
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
function te() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class ie extends te() {
  constructor(e) {
    super(), this.deityService = e;
  }
  render(e = !1) {
    const t = document.createElement("div");
    t.className = "dg-codex dg-detail", t.innerHTML = `<button class="dg-close" data-close>×</button><div class="dg-codex-title"><p class="eyebrow">DARKIS GODFORGE</p><h2>Götterkodex</h2><p class="muted">Durchsuche dein Pantheon und entdecke seine Geschichten.</p></div><div class="dg-codex-toolbar"><input data-search placeholder="Götter durchsuchen..."><select data-filter><option value="">Alle Domänen</option>${[...new Set(this.deityService.list().flatMap((o) => o.domains))].sort().map((o) => `<option value="${o}">${o}</option>`).join("")}</select></div><div class="dg-codex-list" data-list></div>`, document.body.append(t), t.querySelectorAll("[data-close]").forEach((o) => o.addEventListener("click", () => t.remove()));
    const r = t.querySelector("[data-search]"), s = t.querySelector("[data-filter]"), n = () => {
      const o = (r == null ? void 0 : r.value.toLocaleLowerCase()) ?? "", a = (s == null ? void 0 : s.value) ?? "", c = this.deityService.list().filter((d) => (!o || `${d.name} ${d.title}`.toLocaleLowerCase().includes(o)) && (!a || d.domains.includes(a))), u = t.querySelector("[data-list]");
      u && (u.innerHTML = c.map((d) => `<article class="dg-codex-entry"><div><h3>${d.name}</h3><p>${d.title}</p></div><span>${d.domains.slice(0, 3).join(" · ")}</span></article>`).join("") || '<p class="muted">Keine Gottheiten gefunden.</p>');
    };
    r == null || r.addEventListener("input", n), s == null || s.addEventListener("change", n), n();
  }
}
const re = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function se() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class G extends se() {
  constructor(t) {
    super();
    l(this, "deityService");
    this.deityService = t;
    for (const r of re) t.save(r);
  }
  render(t = !1) {
    const r = document.createElement("div");
    r.className = "dg-dashboard", r.innerHTML = this.template(this.deityService.list()), document.body.append(r), r.querySelectorAll("[data-deity]").forEach((s) => s.addEventListener("click", () => this.showDetail(s.dataset.deity ?? ""))), r.querySelectorAll("[data-create]").forEach((s) => s.addEventListener("click", () => new ee(this.deityService, () => {
      r.remove(), this.render(!0);
    }).render(!0))), r.querySelectorAll("[data-codex]").forEach((s) => s.addEventListener("click", () => new ie(this.deityService).render(!0)));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><div class="dg-hero-actions"><button class="dg-secondary" data-codex>Götterkodex</button><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></div></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((r) => `<article class="dg-card" data-deity="${r.id}"><div class="dg-card-art"><img src="${r.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${r.name}</h3><p>${r.title}</p><div class="dg-tags">${r.domains.slice(0, 3).map((s) => `<span>${s}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var n, o, a, c, u;
    const r = this.deityService.get(t);
    if (!r) return;
    const s = document.createElement("div");
    s.className = "dg-detail", s.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${r.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${r.name}</h2><p class="muted">${r.title}</p><p>${r.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${r.domains.map((d) => `<div>${d}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((n = r.passiveBonuses[0]) == null ? void 0 : n.value) ?? 0}</strong><span>${((o = r.passiveBonuses[0]) == null ? void 0 : o.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((a = r.abilities[0]) == null ? void 0 : a.name) ?? "Noch keine Fähigkeit"}</strong><span>${((c = r.abilities[0]) == null ? void 0 : c.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(s), (u = s.querySelector(".dg-close")) == null || u.addEventListener("click", () => s.remove());
  }
}
l(G, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class ne {
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
function ae() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function y(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const g = "darkis-godforge";
class oe {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var r;
      const t = (r = e.flags) == null ? void 0 : r[g];
      return t && typeof t == "object" && "deity" in t && y(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var a;
      const o = (a = n.flags) == null ? void 0 : a[g];
      return o && typeof o == "object" && "deity" in o && y(o.deity) && o.deity.id === e.id;
    }), r = { [g]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: r }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: r })).uuid : null;
  }
}
const h = "darkis-godforge";
function ce(i, e, t) {
  const r = ae();
  r && (r.Hooks.once("init", () => {
    var s, n, o, a;
    (n = (s = r.game) == null ? void 0 : s.settings) == null || n.register(h, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (a = (o = r.game) == null ? void 0 : o.keybindings) == null || a.register(h, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => (t(), !0) });
  }), r.Hooks.on("getSceneControlButtons", (...s) => {
    const n = s[0];
    if (!Array.isArray(n)) return;
    const o = n.find((a) => typeof a == "object" && a !== null && "tools" in a);
    !(o != null && o.tools) || !Array.isArray(o.tools) || o.tools.push({ name: h, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: !0 });
  }), r.Hooks.once("ready", () => {
    var o, a, c;
    const s = (o = r.game) == null ? void 0 : o.journal;
    if (s) for (const u of new oe(s).load()) e.save(u);
    const n = (c = (a = r.game) == null ? void 0 : a.modules) == null ? void 0 : c.get(h);
    n && (n.api = i);
  }));
}
class le {
  constructor(e, t, r) {
    l(this, "activations", /* @__PURE__ */ new Map());
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
const f = new ne(), de = new R(), x = new Q(f, de), he = new le(x, { currentUserId: "local", isGM: !0, ownsActor: () => !0, resolveActor: () => null });
function m() {
  new G(f).render(!0);
}
const w = globalThis;
w.Hooks ? (ce(x, f, m), w.Hooks.once("ready", m)) : typeof document < "u" && m();
export {
  G as GodForgeDashboard,
  x as api,
  f as deityService,
  de as registry,
  he as socketRouter
};
