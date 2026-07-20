var H = Object.defineProperty;
var V = (i, e, t) => e in i ? H(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var l = (i, e, t) => V(i, typeof e != "symbol" ? e + "" : e, t);
function z(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
class W {
  constructor() {
    l(this, "id", "pf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(z(e, e.id))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
function C(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class $ {
  constructor() {
    l(this, "id", "sfrpg");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(C(e))).uuid : null;
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
    l(this, "id", "sf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(C(e))).uuid : null;
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class Y {
  constructor() {
    l(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new W()), this.register(new q()), this.register(new $());
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
function J(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function X(i, e, t) {
  return i.filter((r) => r.visibility.library && !t.has(r.id) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).map(J);
}
function M(i, e) {
  if (i.mode === "all") return i.grants.map((r) => r.ref);
  const t = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || t.length !== i.pick || t.some((r) => !i.grants.some((s) => s.ref === r))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return t;
}
function x(i, e) {
  return i.used < i.max;
}
function Z(i, e) {
  if (!x(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function Q(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const ee = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, te = /^\d+d\d+(?:[+\-]\d+)?$/, ie = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function N(i) {
  const e = i.replace(/\s/g, ""), t = e.match(ee);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function re(i) {
  const e = i.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], r = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((s) => !/^\d+d\d+$/.test(s))) return !1;
  try {
    return new L(N(r), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function G(i, e) {
  const t = i.replace(/\s/g, "");
  if (!re(t)) throw new Error("Formula contains an unsupported term.");
  if (te.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new L(N(t), e).parse();
}
class L {
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
    if (ie.has(e)) return this.call(e);
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
function v(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !v(i.child, e);
  const t = i.children.map((r) => v(r, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function se(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !v(i.condition, e.conditionFacts ?? {})) return t;
  for (const r of i.effects) await K(r, e, t);
  return t;
}
async function K(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const s = v(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const n of s) await K(n, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const s = i.target === "target" ? e.target : e.actor;
    if (!s) throw new Error("This ability requires a valid target.");
    const n = e.rollDice && /d/.test(i.formula) ? await e.rollDice(i.formula) : G(i.formula, e.facts);
    i.type === "heal" ? (t.healing += n, s.hp !== void 0 && (s.hp = Math.min(s.maxHp ?? Number.MAX_SAFE_INTEGER, s.hp + n))) : (t.damage += n, s.hp !== void 0 && (s.hp = Math.max(0, s.hp - n)));
    return;
  }
  if (i.type === "modifier") {
    const s = typeof i.value == "number" ? i.value : G(i.value, e.facts);
    e.actor.modifiers[i.selector] = s, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const r = i.target === "target" ? e.target : e.actor;
  if (!r) throw new Error("This ability requires a valid target.");
  r.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
const ne = /* @__PURE__ */ new Set(["cleric", "champion"]);
function ae(i, e, t = []) {
  if (!ne.has(e)) throw new Error(`Unsupported deity class coupling: ${e}`);
  const r = i.grantGroups.flatMap((s) => M(s, t.find((n) => n.groupId === s.id)));
  return { deityId: i.id, classId: e, grants: r, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification } };
}
function oe(i, e) {
  return !i || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: i.id, name: i.name, title: i.title, image: i.image }, grants: e.grants, abilities: i.abilities.map((t) => {
    var r;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((r = e.usages[t.id]) == null ? void 0 : r.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
function ce(i) {
  const e = [];
  if (i.schemaVersion > 1) throw new Error(`Unsupported deity schema ${i.schemaVersion}.`);
  if (i.schemaVersion === 1) return { definition: structuredClone(i), migrated: !1, warnings: e };
  const t = { ...structuredClone(i), schemaVersion: 1, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  return e.push("Legacy definition normalized to schema version 1."), { definition: t, migrated: !0, warnings: e };
}
function le(i, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 1, exportedAt: e, deities: structuredClone(i) };
}
function de(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion <= 1 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function ue(i) {
  if (!de(i)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return i.deities.map((e) => ce(e).definition);
}
function he(i, e = Math.random) {
  const t = i.filter((a) => Number.isFinite(a.weight) && a.weight > 0), r = t.reduce((a, c) => a + c.weight, 0);
  if (!t.length || r <= 0) throw new Error("Random table has no selectable entries.");
  const s = Math.min(Math.max(e(), 0), 0.999999999) * r;
  let n = 0;
  for (const [a, c] of t.entries())
    if (n += c.weight, s < n) return { entry: c, index: a, roll: s };
  return { entry: t[t.length - 1], index: t.length - 1, roll: s };
}
class ge {
  constructor(e, t) {
    l(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    var a;
    const t = this.deities.list(), r = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter }, s = JSON.stringify([t.map((c) => [c.id, c.revision]), r]);
    if (((a = this.catalogCache) == null ? void 0 : a.key) === s) return this.catalogCache.result;
    const n = new Set(t.filter((c) => c.replacement.mode === "hide" && c.replacement.sourceUuid).map((c) => c.replacement.sourceUuid)), o = X(t, e, n);
    return this.catalogCache = { key: s, result: o }, o;
  }
  exportDeities(e) {
    return le(this.deities.list(), e);
  }
  importDeities(e) {
    const t = ue(e);
    for (const r of t) this.deities.save(r);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e = Math.random) {
    return he(this.deities.list().map((t) => ({ id: t.id, label: t.name, weight: 1 })), e);
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
    return oe(this.getActorDeity(e), r);
  }
  getGrantChoices(e, t) {
    var r;
    return ((r = this.getDeity(e)) == null ? void 0 : r.grantGroups) ?? null;
  }
  getClassGrants(e, t, r = []) {
    const s = this.getDeity(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    return ae(s, t, r);
  }
  buildClassCoupling(e, t, r, s = []) {
    return this.adapters.get(r).buildClassCoupling(this.getClassGrants(e, t, s));
  }
  async assignDeity(e, t, r = {}) {
    const s = this.getDeity(t);
    if (!s || !s.visibility.players) throw new Error("Deity is not available for assignment.");
    const n = s.grantGroups.flatMap((a) => M(a, { groupId: a.id, refs: r[a.id] ?? [] })), o = Object.fromEntries(s.abilities.filter((a) => a.uses).map((a) => [a.id, { used: 0, max: a.uses.max, lastResetAt: Date.now(), reset: a.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: n, usages: o } } });
  }
  async removeDeity(e) {
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const r = this.readState(e), s = Date.now(), n = Object.fromEntries(Object.entries(r.usages).map(([o, a]) => a.reset === t ? [o, Q(a, s)] : [o, a]));
    await e.update({ flags: { "darkis-godforge": { ...r, usages: n } } });
  }
  async activateAbility(e, t, r = {}) {
    const s = this.readState(e), n = this.getDeity(s.deityId), o = n == null ? void 0 : n.abilities.find((d) => d.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const a = s.usages[t];
    if (a && !x(a)) throw new Error("No uses remaining.");
    const c = a ? { ...s.usages, [t]: Z(a) } : s.usages, u = { id: e.id, modifiers: {}, conditions: [] };
    await se(o, { actor: u, target: r.target, facts: r.facts ?? { actor: { level: 0 }, target: {} }, rollDice: r.rollDice }), await e.update({ flags: { "darkis-godforge": { ...s, usages: c } } });
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
function pe(i) {
  return i.replace(/[&<>\"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e] ?? e);
}
function me(i) {
  return i && /^(?:https?:\/\/|\.?\.?\/|icons\/)/i.test(i) && !/^(?:javascript|data):/i.test(i) ? pe(i) : "icons/svg/eye.svg";
}
function S() {
  var t, r;
  const e = (r = (t = globalThis.foundry) == null ? void 0 : t.applications) == null ? void 0 : r.api;
  return e != null && e.ApplicationV2 && e.HandlebarsApplicationMixin ? e.HandlebarsApplicationMixin(e.ApplicationV2) : class {
    render() {
      return Promise.resolve(this);
    }
  };
}
const P = {
  "DARKIS_GODFORGE.UI.TITLE": "Darkis GodForge",
  "DARKIS_GODFORGE.UI.TAGLINE": "Create gods. Shape belief.",
  "DARKIS_GODFORGE.UI.SUBTITLE": "Forge destiny.",
  "DARKIS_GODFORGE.UI.CREATE": "Create deity",
  "DARKIS_GODFORGE.UI.CODEX": "Divine Codex",
  "DARKIS_GODFORGE.UI.MY_DEITIES": "My deities",
  "DARKIS_GODFORGE.UI.ENTRIES": "entries",
  "DARKIS_GODFORGE.UI.DOMAINS": "Domains",
  "DARKIS_GODFORGE.UI.ABILITIES": "Abilities",
  "DARKIS_GODFORGE.UI.VISIBILITY": "Visibility",
  "DARKIS_GODFORGE.UI.PASSIVE_BONUS": "Passive bonus",
  "DARKIS_GODFORGE.UI.SEARCH": "Search deities...",
  "DARKIS_GODFORGE.UI.ALL_DOMAINS": "All domains",
  "DARKIS_GODFORGE.UI.NEW_DEITY": "Create a new deity",
  "DARKIS_GODFORGE.UI.NEW_DEITY_HINT": "Define the identity and first domains of your deity.",
  "DARKIS_GODFORGE.UI.NAME": "Name",
  "DARKIS_GODFORGE.UI.TITLE_FIELD": "Title",
  "DARKIS_GODFORGE.UI.DESCRIPTION": "Description",
  "DARKIS_GODFORGE.UI.ALIGNMENT": "Alignment",
  "DARKIS_GODFORGE.UI.SAVE": "Save deity",
  "DARKIS_GODFORGE.UI.CANCEL": "Cancel",
  "DARKIS_GODFORGE.UI.OPEN_DASHBOARD": "Open GodForge",
  "DARKIS_GODFORGE.UI.NEW_DEITY_PLACEHOLDER": "e.g. Tenebris",
  "DARKIS_GODFORGE.UI.TITLE_PLACEHOLDER": "e.g. Goddess of Shadows",
  "DARKIS_GODFORGE.UI.DOMAINS_PLACEHOLDER": "Shadows, secrets, deception",
  "DARKIS_GODFORGE.UI.SANCTUARIES": "Sanctuaries"
};
function fe(i) {
  var s, n, o, a, c, u, d, h, p;
  const e = globalThis, t = (o = (n = (s = e.game) == null ? void 0 : s.settings) == null ? void 0 : n.get) == null ? void 0 : o.call(n, "darkis-godforge", "language");
  if (typeof t == "string" && t !== "auto") {
    const m = (u = (c = (a = e.game) == null ? void 0 : a.i18n) == null ? void 0 : c.translations) == null ? void 0 : u[t], g = i.split(".").slice(1).reduce((f, B) => f && typeof f == "object" ? f[B] : void 0, m);
    if (typeof g == "string") return g;
  }
  const r = (p = (h = (d = e.game) == null ? void 0 : d.i18n) == null ? void 0 : h.localize) == null ? void 0 : p.call(h, i);
  return r && r !== i ? r : P[i] ?? i;
}
function b() {
  return Object.fromEntries(Object.keys(P).map((i) => [i.split(".").pop(), fe(i)]));
}
class w extends S() {
  constructor(t) {
    super();
    l(this, "searchTerm", "");
    l(this, "selectedDomain", "");
    this.deityService = t;
  }
  async _prepareContext() {
    const t = this.deityService.list().filter((r) => (!this.searchTerm || `${r.name} ${r.title}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || r.domains.includes(this.selectedDomain)));
    return { ui: b(), deities: t, domains: [...new Set(this.deityService.list().flatMap((r) => r.domains))].sort() };
  }
  _onRender() {
    var r, s;
    const t = this.element;
    t && ((r = t.querySelector("[data-search]")) == null || r.addEventListener("input", (n) => {
      this.searchTerm = n.target.value.toLocaleLowerCase(), this.render(!0);
    }), (s = t.querySelector("[data-filter]")) == null || s.addEventListener("change", (n) => {
      this.selectedDomain = n.target.value, this.render(!0);
    }));
  }
}
l(w, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), l(w, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
class A extends S() {
  constructor(e, t) {
    super(), this.deityService = e, this.onSaved = t;
  }
  async _prepareContext() {
    return { ui: b() };
  }
  _onRender() {
    var r;
    const e = this.element;
    (r = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || r.addEventListener("click", () => {
      var s;
      (s = this.close) == null || s.call(this);
    });
    const t = e == null ? void 0 : e.querySelector("form");
    t == null || t.addEventListener("submit", (s) => {
      s.preventDefault();
      const n = new FormData(t), o = this.deityService.create({ name: String(n.get("name") ?? "").trim(), title: String(n.get("title") ?? "").trim(), description: String(n.get("description") ?? "").trim(), domains: String(n.get("domains") ?? "").split(",").map((a) => a.trim()).filter(Boolean), alignment: String(n.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(o);
    });
  }
}
l(A, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 } }), l(A, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class E extends S() {
  constructor(e) {
    super(), this.deityService = e;
  }
  async _prepareContext() {
    const e = b(), t = this.deityService.list().map((r) => ({ ...r, image: me(r.image) }));
    return { ui: e, deities: t, stats: { deities: t.length, sanctuaries: 0, bonuses: t.reduce((r, s) => r + s.passiveBonuses.length, 0), abilities: t.reduce((r, s) => r + s.abilities.length, 0) } };
  }
  _onRender() {
    var t;
    const e = this.element;
    e && (e.querySelectorAll("[data-action='create']").forEach((r) => r.addEventListener("click", () => new A(this.deityService, () => void this.render(!0)).render(!0))), (t = e.querySelector("[data-action='codex']")) == null || t.addEventListener("click", () => new w(this.deityService).render(!0)));
  }
  openDetail(e) {
    return e;
  }
}
l(E, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), l(E, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
class Ie {
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
function ye() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function R(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const D = "darkis-godforge";
class ve {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var r;
      const t = (r = e.flags) == null ? void 0 : r[D];
      return t && typeof t == "object" && "deity" in t && R(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var a;
      const o = (a = n.flags) == null ? void 0 : a[D];
      return o && typeof o == "object" && "deity" in o && R(o.deity) && o.deity.id === e.id;
    }), r = { [D]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: r }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: r })).uuid : null;
  }
}
function De(i) {
  if (!i || typeof i != "object" || !("registerModule" in i)) return null;
  const t = i.registerModule("darkis-godforge");
  if (!t || typeof t != "object" || !("register" in t) || !("executeAsGM" in t)) return null;
  const r = t;
  return { register: (s, n) => r.register(s, n), executeAsGM: (s, n) => r.executeAsGM(s, n) };
}
const I = "darkis-godforge";
function we(i, e, t, r) {
  const s = ye();
  s && (s.Hooks.once("init", () => {
    var a, c, u, d, h, p, m;
    const n = ((u = (c = (a = s.game) == null ? void 0 : a.modules) == null ? void 0 : c.get(I)) == null ? void 0 : u.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], o = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...n.map((g) => [g.lang, g.name])]);
    (h = (d = s.game) == null ? void 0 : d.settings) == null || h.register(I, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: o }), (m = (p = s.game) == null ? void 0 : p.keybindings) == null || m.register(I, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
      var g, f;
      return ((f = (g = s.game) == null ? void 0 : g.user) == null ? void 0 : f.isGM) !== !0 ? !1 : (t(), !0);
    } });
  }), s.Hooks.on("getSceneControlButtons", (...n) => {
    var c, u;
    const o = n[0];
    if (!Array.isArray(o)) return;
    const a = o.find((d) => typeof d == "object" && d !== null && "tools" in d);
    !(a != null && a.tools) || !Array.isArray(a.tools) || a.tools.push({ name: I, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: ((u = (c = s.game) == null ? void 0 : c.user) == null ? void 0 : u.isGM) === !0 });
  }), s.Hooks.once("ready", () => {
    var c, u, d, h, p, m;
    const n = (c = s.game) == null ? void 0 : c.journal;
    if (n) for (const g of new ve(n).load()) e.save(g);
    const o = De((h = (d = (u = s.game) == null ? void 0 : u.modules) == null ? void 0 : d.get("socketlib")) == null ? void 0 : h.api);
    o && r && (r.setTransport(o), r.register());
    const a = (m = (p = s.game) == null ? void 0 : p.modules) == null ? void 0 : m.get(I);
    a && (a.api = i);
  }));
}
class Ae {
  constructor(e, t, r) {
    l(this, "activations", /* @__PURE__ */ new Map());
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
const O = new Ie(), Ee = new Y(), j = new ge(O, Ee);
function k() {
  new E(O).render(!0);
}
const y = globalThis;
var U, T, _, F;
const Se = new Ae(j, { currentUserId: ((T = (U = y.game) == null ? void 0 : U.user) == null ? void 0 : T.id) ?? "unknown", isGM: ((F = (_ = y.game) == null ? void 0 : _.user) == null ? void 0 : F.isGM) ?? !1, ownsActor: (i, e) => {
  var r;
  const t = i;
  return ((r = t.testUserPermission) == null ? void 0 : r.call(t, { id: e }, "OWNER")) ?? !1;
}, resolveActor: (i) => {
  var e, t;
  return ((t = (e = y.game) == null ? void 0 : e.actors) == null ? void 0 : t.get(i)) ?? null;
} });
y.Hooks ? we(j, O, k, Se) : typeof document < "u" && k();
export {
  E as GodForgeDashboard,
  j as api,
  O as deityService,
  Ee as registry,
  Se as socketRouter
};
