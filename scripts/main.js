var j = Object.defineProperty;
var L = (i, e, t) => e in i ? j(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var h = (i, e, t) => L(i, typeof e != "symbol" ? e + "" : e, t);
function B(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class H {
  constructor() {
    h(this, "id", "pf2e");
    h(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(B(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
function M(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class P {
  constructor() {
    h(this, "id", "sfrpg");
    h(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(M(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return null;
  }
}
class q {
  constructor() {
    h(this, "id", "sf2e");
    h(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(M(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class V {
  constructor() {
    h(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new H()), this.register(new q()), this.register(new P());
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
function _(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function z(i, e, t) {
  return i.filter((r) => r.visibility.library && !t.has(r.id) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).map(_);
}
function C(i, e) {
  if (i.mode === "all") return i.grants.map((r) => r.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((r) => !i.grants.some((s) => s.ref === r))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function $(i, e) {
  return i.used < i.max;
}
function W(i, e) {
  if (!$(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function K(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const J = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, Z = /^\d+d\d+(?:[+\-]\d+)?$/, X = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function F(i) {
  const e = i.replace(/\s/g, ""), t = e.match(J);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function Q(i) {
  const e = i.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], r = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((s) => !/^\d+d\d+$/.test(s))) return !1;
  try {
    return new T(F(r), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function A(i, e) {
  const t = i.replace(/\s/g, "");
  if (!Q(t)) throw new Error("Formula contains an unsupported term.");
  if (Z.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new T(F(t), e).parse();
}
class T {
  constructor(e, t) {
    h(this, "position", 0);
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
    if (X.has(e)) return this.call(e);
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
function m(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !m(i.child, e);
  const t = i.children.map((r) => m(r, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function Y(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !m(i.condition, e.conditionFacts ?? {})) return t;
  for (const r of i.effects) await O(r, e, t);
  return t;
}
async function O(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const s = m(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const a of s) await O(a, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const s = i.target === "target" ? e.target : e.actor;
    if (!s) throw new Error("This ability requires a valid target.");
    const a = e.rollDice && /d/.test(i.formula) ? await e.rollDice(i.formula) : A(i.formula, e.facts);
    i.type === "heal" ? (t.healing += a, s.hp !== void 0 && (s.hp = Math.min(s.maxHp ?? Number.MAX_SAFE_INTEGER, s.hp + a))) : (t.damage += a, s.hp !== void 0 && (s.hp = Math.max(0, s.hp - a)));
    return;
  }
  if (i.type === "modifier") {
    const s = typeof i.value == "number" ? i.value : A(i.value, e.facts);
    e.actor.modifiers[i.selector] = s, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const r = i.target === "target" ? e.target : e.actor;
  if (!r) throw new Error("This ability requires a valid target.");
  r.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
const ee = /* @__PURE__ */ new Set(["cleric", "champion"]);
function te(i, e, t = []) {
  if (!ee.has(e)) throw new Error(`Unsupported deity class coupling: ${e}`);
  const r = i.grantGroups.flatMap((s) => C(s, t.find((a) => a.groupId === s.id)));
  return { deityId: i.id, classId: e, grants: r, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification } };
}
function ie(i, e) {
  return !i || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: i.id, name: i.name, title: i.title, image: i.image }, grants: e.grants, abilities: i.abilities.map((t) => {
    var r;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((r = e.usages[t.id]) == null ? void 0 : r.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
function re(i) {
  const e = [];
  if (i.schemaVersion > 1) throw new Error(`Unsupported deity schema ${i.schemaVersion}.`);
  if (i.schemaVersion === 1) return { definition: structuredClone(i), migrated: !1, warnings: e };
  const t = { ...structuredClone(i), schemaVersion: 1, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  return e.push("Legacy definition normalized to schema version 1."), { definition: t, migrated: !0, warnings: e };
}
function se(i, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 1, exportedAt: e, deities: structuredClone(i) };
}
function ne(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion <= 1 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function ae(i) {
  if (!ne(i)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return i.deities.map((e) => re(e).definition);
}
function oe(i, e = Math.random) {
  const t = i.filter((n) => Number.isFinite(n.weight) && n.weight > 0), r = t.reduce((n, c) => n + c.weight, 0);
  if (!t.length || r <= 0) throw new Error("Random table has no selectable entries.");
  const s = Math.min(Math.max(e(), 0), 0.999999999) * r;
  let a = 0;
  for (const [n, c] of t.entries())
    if (a += c.weight, s < a) return { entry: c, index: n, roll: s };
  return { entry: t[t.length - 1], index: t.length - 1, roll: s };
}
class ce {
  constructor(e, t) {
    h(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    var n;
    const t = this.deities.list(), r = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter }, s = JSON.stringify([t.map((c) => [c.id, c.revision]), r]);
    if (((n = this.catalogCache) == null ? void 0 : n.key) === s) return this.catalogCache.result;
    const a = new Set(t.filter((c) => c.replacement.mode === "hide" && c.replacement.sourceUuid).map((c) => c.replacement.sourceUuid)), o = z(t, e, a);
    return this.catalogCache = { key: s, result: o }, o;
  }
  exportDeities(e) {
    return se(this.deities.list(), e);
  }
  importDeities(e) {
    const t = ae(e);
    for (const r of t) this.deities.save(r);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e = Math.random) {
    return oe(this.deities.list().map((t) => ({ id: t.id, label: t.name, weight: 1 })), e);
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
    return ie(this.getActorDeity(e), r);
  }
  getGrantChoices(e, t) {
    var r;
    return ((r = this.getDeity(e)) == null ? void 0 : r.grantGroups) ?? null;
  }
  getClassGrants(e, t, r = []) {
    const s = this.getDeity(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    return te(s, t, r);
  }
  buildClassCoupling(e, t, r, s = []) {
    return this.adapters.get(r).buildClassCoupling(this.getClassGrants(e, t, s));
  }
  async assignDeity(e, t, r = {}) {
    const s = this.getDeity(t);
    if (!s || !s.visibility.players) throw new Error("Deity is not available for assignment.");
    const a = s.grantGroups.flatMap((n) => C(n, { groupId: n.id, refs: r[n.id] ?? [] })), o = Object.fromEntries(s.abilities.filter((n) => n.uses).map((n) => [n.id, { used: 0, max: n.uses.max, lastResetAt: Date.now(), reset: n.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: a, usages: o } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const r = this.readState(e), s = Date.now(), a = Object.fromEntries(Object.entries(r.usages).map(([o, n]) => n.reset === t ? [o, K(n, s)] : [o, n]));
    await e.update({ flags: { "darkis-godforge": { ...r, usages: a } } });
  }
  async activateAbility(e, t, r = {}) {
    const s = this.readState(e), a = this.getDeity(s.deityId), o = a == null ? void 0 : a.abilities.find((l) => l.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const n = s.usages[t];
    if (n && !$(n)) throw new Error("No uses remaining.");
    const c = n ? { ...s.usages, [t]: W(n) } : s.usages, u = { id: e.id, modifiers: {}, conditions: [] };
    await Y(o, { actor: u, target: r.target, facts: r.facts ?? { actor: { level: 0 }, target: {} }, rollDice: r.rollDice }), await e.update({ flags: { "darkis-godforge": { ...s, usages: c } } });
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
function le() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class de extends le() {
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
      const s = this.deityService.create({ name: String(r.get("name") ?? "").trim(), title: String(r.get("title") ?? "").trim(), description: String(r.get("description") ?? "").trim(), domains: String(r.get("domains") ?? "").split(",").map((a) => a.trim()).filter(Boolean), alignment: String(r.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(s), e.remove();
    } catch (s) {
      const a = e.querySelector(".dg-form-error");
      a && (a.textContent = s instanceof Error ? s.message : "Die Gottheit konnte nicht gespeichert werden.");
    }
  }
}
function d(i) {
  return i.replace(/[&<>\"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e] ?? e);
}
function f(i) {
  return i && /^(?:https?:\/\/|\.?\.?\/|icons\/)/i.test(i) && !/^(?:javascript|data):/i.test(i) ? d(i) : "icons/svg/eye.svg";
}
function ue() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class he extends ue() {
  constructor(e) {
    super(), this.deityService = e;
  }
  render(e = !1) {
    const t = document.createElement("div");
    t.className = "dg-codex dg-detail", t.innerHTML = `<button class="dg-close" data-close>×</button><div class="dg-codex-title"><p class="eyebrow">DARKIS GODFORGE</p><h2>Götterkodex</h2><p class="muted">Durchsuche dein Pantheon und entdecke seine Geschichten.</p></div><div class="dg-codex-toolbar"><input data-search placeholder="Götter durchsuchen..."><select data-filter><option value="">Alle Domänen</option>${[...new Set(this.deityService.list().flatMap((o) => o.domains))].sort().map((o) => `<option value="${d(o)}">${d(o)}</option>`).join("")}</select></div><div class="dg-codex-list" data-list></div>`, document.body.append(t), t.querySelectorAll("[data-close]").forEach((o) => o.addEventListener("click", () => t.remove()));
    const r = t.querySelector("[data-search]"), s = t.querySelector("[data-filter]"), a = () => {
      const o = (r == null ? void 0 : r.value.toLocaleLowerCase()) ?? "", n = (s == null ? void 0 : s.value) ?? "", c = this.deityService.list().filter((l) => (!o || `${l.name} ${l.title}`.toLocaleLowerCase().includes(o)) && (!n || l.domains.includes(n))), u = t.querySelector("[data-list]");
      u && (u.innerHTML = c.map((l) => `<article class="dg-codex-entry"><div><h3>${d(l.name)}</h3><p>${d(l.title)}</p></div><span>${l.domains.slice(0, 3).map(d).join(" · ")}</span></article>`).join("") || '<p class="muted">Keine Gottheiten gefunden.</p>');
    };
    r == null || r.addEventListener("input", a), s == null || s.addEventListener("change", a), a();
  }
}
function pe() {
  var i, e, t;
  return ((t = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class R extends pe() {
  constructor(t) {
    super();
    h(this, "deityService");
    this.deityService = t;
  }
  render(t = !1) {
    const r = document.createElement("div");
    r.className = "dg-dashboard", r.innerHTML = this.template(this.deityService.list()), document.body.append(r), r.querySelectorAll("[data-deity]").forEach((s) => s.addEventListener("click", () => this.showDetail(s.dataset.deity ?? ""))), r.querySelectorAll("[data-create]").forEach((s) => s.addEventListener("click", () => new de(this.deityService, () => {
      r.remove(), this.render(!0);
    }).render(!0))), r.querySelectorAll("[data-codex]").forEach((s) => s.addEventListener("click", () => new he(this.deityService).render(!0)));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${f(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><div class="dg-hero-actions"><button class="dg-secondary" data-codex>Götterkodex</button><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></div></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((r) => `<article class="dg-card" data-deity="${d(r.id)}"><div class="dg-card-art"><img src="${f(r.image)}" alt=""></div><h3>${d(r.name)}</h3><p>${d(r.title)}</p><div class="dg-tags">${r.domains.slice(0, 3).map((s) => `<span>${d(s)}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var a, o, n, c, u;
    const r = this.deityService.get(t);
    if (!r) return;
    const s = document.createElement("div");
    s.className = "dg-detail", s.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${f(r.image)}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${d(r.name)}</h2><p class="muted">${d(r.title)}</p><p>${d(r.description)}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${r.domains.map((l) => `<div>${d(l)}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${d(String(((a = r.passiveBonuses[0]) == null ? void 0 : a.value) ?? 0))}</strong><span>${d(((o = r.passiveBonuses[0]) == null ? void 0 : o.name) ?? "Noch kein Bonus")}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${d(((n = r.abilities[0]) == null ? void 0 : n.name) ?? "Noch keine Fähigkeit")}</strong><span>${d(((c = r.abilities[0]) == null ? void 0 : c.description) ?? "Definiere dein erstes Wunder.")}</span></div></div></div></div>`, document.body.append(s), (u = s.querySelector(".dg-close")) == null || u.addEventListener("click", () => s.remove());
  }
}
h(R, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class ge {
  constructor() {
    h(this, "definitions", /* @__PURE__ */ new Map());
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
function me() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function D(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const v = "darkis-godforge";
class fe {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var r;
      const t = (r = e.flags) == null ? void 0 : r[v];
      return t && typeof t == "object" && "deity" in t && D(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((a) => {
      var n;
      const o = (n = a.flags) == null ? void 0 : n[v];
      return o && typeof o == "object" && "deity" in o && D(o.deity) && o.deity.id === e.id;
    }), r = { [v]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: r }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: r })).uuid : null;
  }
}
function ve(i) {
  if (!i || typeof i != "object" || !("registerModule" in i)) return null;
  const t = i.registerModule("darkis-godforge");
  if (!t || typeof t != "object" || !("register" in t) || !("executeAsGM" in t)) return null;
  const r = t;
  return { register: (s, a) => r.register(s, a), executeAsGM: (s, a) => r.executeAsGM(s, a) };
}
const p = "darkis-godforge";
function ye(i, e, t, r) {
  const s = me();
  s && (s.Hooks.once("init", () => {
    var a, o, n, c;
    (o = (a = s.game) == null ? void 0 : a.settings) == null || o.register(p, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: { auto: "DARKIS_GODFORGE.SETTINGS.AUTO", de: "Deutsch", en: "English" } }), (c = (n = s.game) == null ? void 0 : n.keybindings) == null || c.register(p, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
      var u, l;
      return ((l = (u = s.game) == null ? void 0 : u.user) == null ? void 0 : l.isGM) !== !0 ? !1 : (t(), !0);
    } });
  }), s.Hooks.on("getSceneControlButtons", (...a) => {
    var c, u;
    const o = a[0];
    if (!Array.isArray(o)) return;
    const n = o.find((l) => typeof l == "object" && l !== null && "tools" in l);
    !(n != null && n.tools) || !Array.isArray(n.tools) || n.tools.push({ name: p, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: ((u = (c = s.game) == null ? void 0 : c.user) == null ? void 0 : u.isGM) === !0 });
  }), s.Hooks.once("ready", () => {
    var c, u, l, w, b, k;
    const a = (c = s.game) == null ? void 0 : c.journal;
    if (a) for (const N of new fe(a).load()) e.save(N);
    const o = ve((w = (l = (u = s.game) == null ? void 0 : u.modules) == null ? void 0 : l.get("socketlib")) == null ? void 0 : w.api);
    o && r && (r.setTransport(o), r.register());
    const n = (k = (b = s.game) == null ? void 0 : b.modules) == null ? void 0 : k.get(p);
    n && (n.api = i);
  }));
}
class we {
  constructor(e, t, r) {
    h(this, "activations", /* @__PURE__ */ new Map());
    this.api = e, this.authority = t, this.transport = r;
  }
  setTransport(e) {
    this.transport = e;
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
const y = new ge(), be = new V(), U = new ce(y, be);
function S() {
  new R(y).render(!0);
}
const g = globalThis;
var E, I, G, x;
const ke = new we(U, { currentUserId: ((I = (E = g.game) == null ? void 0 : E.user) == null ? void 0 : I.id) ?? "unknown", isGM: ((x = (G = g.game) == null ? void 0 : G.user) == null ? void 0 : x.isGM) ?? !1, ownsActor: (i, e) => {
  var r;
  const t = i;
  return ((r = t.testUserPermission) == null ? void 0 : r.call(t, { id: e }, "OWNER")) ?? !1;
}, resolveActor: (i) => {
  var e, t;
  return ((t = (e = g.game) == null ? void 0 : e.actors) == null ? void 0 : t.get(i)) ?? null;
} });
g.Hooks ? ye(U, y, S, ke) : typeof document < "u" && S();
export {
  R as GodForgeDashboard,
  U as api,
  y as deityService,
  be as registry,
  ke as socketRouter
};
