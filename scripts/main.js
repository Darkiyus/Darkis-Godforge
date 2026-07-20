var ee = Object.defineProperty;
var te = (i, e, t) => e in i ? ee(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var l = (i, e, t) => te(i, typeof e != "symbol" ? e + "" : e, t);
function ie(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
function C() {
  const i = globalThis, e = typeof Hooks < "u" ? Hooks : i.Hooks;
  return e ? { Hooks: e } : null;
}
function m() {
  const i = globalThis;
  return typeof game < "u" ? game : i.game;
}
function V() {
  const i = globalThis;
  return typeof ui < "u" ? ui : i.ui;
}
function _(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
async function F(i) {
  var s, n, o, a;
  const t = (((n = (s = m()) == null ? void 0 : s.packs) == null ? void 0 : n.contents) ?? []).filter((d) => {
    var u;
    return d.documentName === "Item" && (!((u = d.metadata) != null && u.system) || d.metadata.system === i);
  }), r = [];
  for (const d of t) {
    const u = await d.getIndex({ fields: ["type", "img", "system.domains", "system.alignment"] });
    for (const c of u) {
      if (c.type !== "deity" || !c._id || !c.name || !d.collection) continue;
      const h = `Compendium.${d.collection}.Item.${c._id}`;
      r.push({ id: h, sourceUuid: h, official: !0, name: c.name, title: c.name, image: c.img, domains: ((o = c.system) == null ? void 0 : o.domains) ?? [], alignment: (a = c.system) == null ? void 0 : a.alignment });
    }
  }
  return r;
}
function re(i) {
  if (i.classId !== "cleric" && i.classId !== "champion") return null;
  const e = i.systemValues;
  return { classId: i.classId, deityId: i.deityId, grants: i.grants, domains: { available: e.domains, pick: i.classId === "cleric" ? 1 : 0 }, divineFont: i.classId === "cleric" ? e.font : void 0, favoredWeapon: e.favoredWeapon, trainedSkill: i.classId === "cleric" ? e.skill : void 0, sanctification: e.sanctification, cause: i.classId === "champion" ? e.cause : void 0 };
}
class se {
  constructor() {
    l(this, "id", "pf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(ie(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return F(this.id);
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return re(e);
  }
}
function $(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class ne {
  constructor() {
    l(this, "id", "sfrpg");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem($(e))).uuid : null;
  }
  async listOfficialDeities() {
    return F(this.id);
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return null;
  }
}
class ae {
  constructor() {
    l(this, "id", "sf2e");
    l(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem($(e))).uuid : null;
  }
  async listOfficialDeities() {
    return F(this.id);
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class oe {
  constructor() {
    l(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new se()), this.register(new ae()), this.register(new ne());
  }
  register(e) {
    this.adapters.set(e.id, e);
  }
  get(e) {
    const t = this.adapters.get(e);
    if (!t) throw new Error(`Unsupported game system: ${e}`);
    return t;
  }
  tryGet(e) {
    return this.adapters.get(e) ?? null;
  }
  supports(e) {
    return this.adapters.has(e);
  }
}
function ce(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function de(i, e, t) {
  return i.filter((r) => r.visibility.library && !t.has(r.id) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).map(ce);
}
function R(i, e) {
  const t = z(i);
  if (i.mode === "all") return i.grants.flatMap((s) => "mode" in s ? R(s) : [s.ref]);
  const r = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || r.length !== i.pick || r.some((s) => !t.includes(s))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return r;
}
function z(i) {
  return i.grants.flatMap((e) => "mode" in e ? z(e) : [e.ref]);
}
function W(i, e) {
  return i.used < i.max;
}
function le(i, e) {
  if (!W(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function ue(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const ge = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, he = /^\d+d\d+(?:[+\-]\d+)?$/, fe = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function K(i) {
  const e = i.replace(/\s/g, ""), t = e.match(ge);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function q(i) {
  const e = i.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], r = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((s) => !/^\d+d\d+$/.test(s))) return !1;
  try {
    return new Y(K(r), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function A(i, e) {
  const t = i.replace(/\s/g, "");
  if (!q(t)) throw new Error("Formula contains an unsupported term.");
  if (he.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new Y(K(t), e).parse();
}
async function pe(i, e, t) {
  if (!q(i)) throw new Error("Formula contains an unsupported term.");
  const r = i.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let s = i;
  for (const n of [...new Set(r)]) {
    const o = await t(n);
    if (!Number.isFinite(o)) throw new Error("Dice result is not a finite number.");
    s = s.replace(new RegExp(`\\b${n}\\b`, "g"), String(o));
  }
  return A(s, e);
}
class Y {
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
    if (fe.has(e)) return this.call(e);
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
function b(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !b(i.child, e);
  const t = i.children.map((r) => b(r, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function me(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !b(i.condition, e.conditionFacts ?? {})) return t;
  for (const r of i.effects) await J(r, e, t);
  return t;
}
async function J(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const s = b(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const n of s) await J(n, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const s = i.target === "target" ? e.target : e.actor;
    if (!s) throw new Error("This ability requires a valid target.");
    const n = /\b\d+d\d+\b/.test(i.formula) ? e.rollDice ? await pe(i.formula, e.facts, e.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : A(i.formula, e.facts);
    i.type === "heal" ? (t.healing += n, s.hp !== void 0 && (s.hp = Math.min(s.maxHp ?? Number.MAX_SAFE_INTEGER, s.hp + n))) : (t.damage += n, s.hp !== void 0 && (s.hp = Math.max(0, s.hp - n)));
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
function ye(i, e, t = []) {
  if (!e.trim()) throw new Error("Class identifier is required for deity coupling.");
  const r = i.grantGroups.flatMap((s) => R(s, t.find((n) => n.groupId === s.id)));
  return { deityId: i.id, classId: e, grants: r, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification, cause: i.cause } };
}
function ve(i, e) {
  return !i || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: i.id, name: i.name, title: i.title, image: i.image }, grants: e.grants, abilities: i.abilities.map((t) => {
    var r;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((r = e.usages[t.id]) == null ? void 0 : r.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
function we(i) {
  const e = [];
  if (i.schemaVersion > 1) throw new Error(`Unsupported deity schema ${i.schemaVersion}.`);
  if (i.schemaVersion === 1) return { definition: structuredClone(i), migrated: !1, warnings: e };
  const t = { ...structuredClone(i), schemaVersion: 1, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  return e.push("Legacy definition normalized to schema version 1."), { definition: t, migrated: !0, warnings: e };
}
function be(i, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 1, exportedAt: e, deities: structuredClone(i) };
}
function Ie(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion <= 1 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function Ee(i) {
  if (!Ie(i)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return i.deities.map((e) => we(e).definition);
}
function De(i, e) {
  const t = i.filter((a) => Number.isFinite(a.weight) && a.weight > 0), r = t.reduce((a, d) => a + d.weight, 0);
  if (!t.length || r <= 0) throw new Error("Random table has no selectable entries.");
  const s = Math.min(Math.max(e(), 0), 0.999999999) * r;
  let n = 0;
  for (const [a, d] of t.entries())
    if (n += d.weight, s < n) return { entry: d, index: a, roll: s };
  return { entry: t[t.length - 1], index: t.length - 1, roll: s };
}
class ke {
  constructor(e, t) {
    l(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  async getSelectableDeities(e) {
    var y, g, v, w;
    const t = this.deities.list(), r = e.systemId ?? ((g = (y = m()) == null ? void 0 : y.system) == null ? void 0 : g.id) ?? "", s = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter, systemId: r, catalogContext: e.catalogContext }, n = JSON.stringify([t.map((f) => [f.id, f.revision]), s]);
    if (((v = this.catalogCache) == null ? void 0 : v.key) === n) return this.catalogCache.result;
    const o = await (((w = this.adapters.tryGet(r)) == null ? void 0 : w.listOfficialDeities()) ?? Promise.resolve([])), a = e.catalogContext ?? "characterBuilder", d = new Set(t.filter((f) => f.replacement.sourceUuid && (f.replacement.mode === "hide" || f.replacement.mode === "replace") && (!f.replacement.contexts.length || f.replacement.contexts.includes(a))).map((f) => f.replacement.sourceUuid)), u = de(t, e, /* @__PURE__ */ new Set()), c = o.filter((f) => !f.sourceUuid || !d.has(f.sourceUuid)), h = [...u, ...c];
    return this.catalogCache = { key: n, result: h }, h;
  }
  exportDeities(e) {
    return be(this.deities.list(), e);
  }
  importDeities(e) {
    const t = Ee(e);
    for (const r of t) this.deities.save(r);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e) {
    return De(this.deities.list().map((t) => ({ id: t.id, label: t.name, weight: 1 })), e);
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
    return ve(this.getActorDeity(e), r);
  }
  getGrantChoices(e, t) {
    var r;
    return ((r = this.getDeity(e)) == null ? void 0 : r.grantGroups) ?? null;
  }
  getClassGrants(e, t, r = []) {
    const s = this.getDeity(e);
    if (!s) throw new Error(`Unknown deity: ${e}`);
    return ye(s, t, r);
  }
  buildClassCoupling(e, t, r, s = []) {
    return this.adapters.get(r).buildClassCoupling(this.getClassGrants(e, t, s));
  }
  async assignDeity(e, t, r = {}) {
    const s = this.getDeity(t);
    if (!s || !s.visibility.players) throw new Error("Deity is not available for assignment.");
    const n = s.grantGroups.flatMap((a) => R(a, { groupId: a.id, refs: r[a.id] ?? [] })), o = Object.fromEntries(s.abilities.filter((a) => a.uses).map((a) => [a.id, { used: 0, max: a.uses.max, lastResetAt: Date.now(), reset: a.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: n, usages: o } } });
  }
  async removeDeity(e) {
    if (e.unsetFlag) {
      await Promise.all(["deityId", "grants", "usages"].map((t) => e.unsetFlag("darkis-godforge", t)));
      return;
    }
    await e.update({ flags: { "darkis-godforge": null } });
  }
  async resetActorUsages(e, t) {
    const r = this.readState(e), s = Date.now(), n = Object.fromEntries(Object.entries(r.usages).map(([o, a]) => a.reset === t ? [o, ue(a, s)] : [o, a]));
    await e.update({ flags: { "darkis-godforge": { ...r, usages: n } } });
  }
  async activateAbility(e, t, r = {}) {
    const s = this.readState(e), n = this.getDeity(s.deityId), o = n == null ? void 0 : n.abilities.find((c) => c.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const a = s.usages[t];
    if (a && !W(a)) throw new Error("No uses remaining.");
    const d = a ? { ...s.usages, [t]: le(a) } : s.usages, u = { id: e.id, modifiers: {}, conditions: [] };
    await me(o, { actor: u, target: r.target, facts: r.facts ?? { actor: { level: 0 }, target: {} }, rollDice: r.rollDice }), await e.update({ flags: { "darkis-godforge": { ...s, usages: d } } });
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
function X(i) {
  if (!i) return "icons/svg/eye.svg";
  const e = i.trim();
  return /^(?:javascript|data|vbscript):/i.test(e) || /^\/\//.test(e) || /[\u0000-\u001f]/.test(e) ? "icons/svg/eye.svg" : e;
}
function E() {
  var r;
  const i = globalThis, e = typeof foundry < "u" ? foundry : i.foundry, t = (r = e == null ? void 0 : e.applications) == null ? void 0 : r.api;
  if (t != null && t.ApplicationV2 && t.HandlebarsApplicationMixin) return t.HandlebarsApplicationMixin(t.ApplicationV2);
  if (C()) {
    const s = "Darkis GodForge | Foundry ApplicationV2 is unavailable while loading the module.";
    return console.error(s), class {
      render() {
        return Promise.reject(new Error(s));
      }
    };
  }
  return class {
    render() {
      return Promise.resolve(this);
    }
  };
}
const Ae = { UI: { TITLE: "Darkis GodForge", TAGLINE: "Create gods. Shape belief.", SUBTITLE: "Forge destiny.", CREATE: "Create deity", CODEX: "Divine Codex", MY_DEITIES: "My deities", ENTRIES: "entries", DOMAINS: "Domains", ABILITIES: "Abilities", VISIBILITY: "Visibility", PASSIVE_BONUS: "Passive bonus", DIVINE_ABILITY: "Divine ability", SEARCH: "Search deities...", ALL_DOMAINS: "All domains", NO_RESULTS: "No deities found.", NEW_DEITY: "Create a new deity", NEW_DEITY_HINT: "Define the identity and first domains of your deity.", NAME: "Name", TITLE_FIELD: "Title", DESCRIPTION: "Description", ALIGNMENT: "Alignment", SAVE: "Save deity", CANCEL: "Cancel", OPEN_DASHBOARD: "Open GodForge", NEW_DEITY_PLACEHOLDER: "e.g. Tenebris", TITLE_PLACEHOLDER: "e.g. Goddess of Shadows", DOMAINS_PLACEHOLDER: "Shadows, secrets, deception", SANCTUARIES: "Sanctuaries" }, SETTINGS: { MENU_NAME: "GodForge management", MENU_LABEL: "Open GodForge", MENU_HINT: "Opens the dashboard for creating and managing custom deities.", LANGUAGE: "GodForge language", LANGUAGE_HINT: "Language used by GodForge surfaces.", AUTO: "Automatic" }, ERROR: { NO_USES: "No uses remaining." } }, M = {
  DARKIS_GODFORGE: Ae
}, S = /* @__PURE__ */ new Map([["en", M]]);
async function U(i, e) {
  if (i === "auto" || S.has(i)) return;
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Unable to load GodForge language ${i}.`);
  S.set(i, await t.json());
}
function Se(i) {
  var n, o, a, d;
  const e = m(), t = (o = (n = e == null ? void 0 : e.settings) == null ? void 0 : n.get) == null ? void 0 : o.call(n, "darkis-godforge", "language");
  if (typeof t == "string" && t !== "auto") {
    const u = x(S.get(t), i);
    if (typeof u == "string") return u;
  }
  const r = (d = (a = e == null ? void 0 : e.i18n) == null ? void 0 : a.localize) == null ? void 0 : d.call(a, i);
  if (r && r !== i) return r;
  const s = x(M, i);
  return typeof s == "string" ? s : i;
}
function D() {
  return Object.fromEntries(Object.keys(M.DARKIS_GODFORGE.UI).map((i) => [i, Se(`DARKIS_GODFORGE.UI.${i}`)]));
}
function x(i, e) {
  return e.split(".").reduce((t, r) => t && typeof t == "object" ? t[r] : void 0, i);
}
class G extends E() {
  constructor(t) {
    super();
    l(this, "searchTerm", "");
    l(this, "selectedDomain", "");
    this.deityService = t;
  }
  async _prepareContext() {
    const t = this.deityService.list().filter((r) => (!this.searchTerm || `${r.name} ${r.title}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || r.domains.includes(this.selectedDomain)));
    return { ui: D(), deities: t, domains: [...new Set(this.deityService.list().flatMap((r) => r.domains))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain };
  }
  _onRender() {
    const t = this.element;
    if (!t) return;
    const r = t.querySelector("[data-search]"), s = t.querySelector("[data-filter]");
    r && (r.value = this.searchTerm), s && (s.value = this.selectedDomain), r == null || r.addEventListener("input", (n) => {
      this.searchTerm = n.target.value.toLocaleLowerCase(), this.render(!0);
    }), s == null || s.addEventListener("change", (n) => {
      this.selectedDomain = n.target.value, this.render(!0);
    });
  }
}
l(G, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), l(G, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
class T extends E() {
  constructor(e, t) {
    super(), this.deityService = e, this.onSaved = t;
  }
  async _prepareContext() {
    return { ui: D() };
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
      var a;
      s.preventDefault();
      const n = new FormData(t), o = this.deityService.create({ name: String(n.get("name") ?? "").trim(), title: String(n.get("title") ?? "").trim(), description: String(n.get("description") ?? "").trim(), domains: String(n.get("domains") ?? "").split(",").map((d) => d.trim()).filter(Boolean), alignment: String(n.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(o), (a = this.close) == null || a.call(this);
    });
  }
}
l(T, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 } }), l(T, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class O extends E() {
  constructor(e) {
    super(), this.deity = e;
  }
  async _prepareContext() {
    return { ui: D(), deity: { ...this.deity, image: X(this.deity.image) } };
  }
}
l(O, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), l(O, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class I extends E() {
  constructor(e) {
    super(), this.deityService = e;
  }
  async _prepareContext() {
    const e = D(), t = this.deityService.list().map((r) => ({ ...r, image: X(r.image) }));
    return { ui: e, deities: t, stats: { deities: t.length, sanctuaries: 0, bonuses: t.reduce((r, s) => r + s.passiveBonuses.length, 0), abilities: t.reduce((r, s) => r + s.abilities.length, 0) } };
  }
  _onRender() {
    var t;
    const e = this.element;
    e && (e.querySelectorAll("[data-action='create']").forEach((r) => r.addEventListener("click", () => new T(this.deityService, () => void this.render(!0)).render(!0))), (t = e.querySelector("[data-action='codex']")) == null || t.addEventListener("click", () => new G(this.deityService).render(!0)), e.querySelectorAll("[data-deity]").forEach((r) => r.addEventListener("click", () => {
      const s = this.deityService.get(r.dataset.deity ?? "");
      s && new O(s).render(!0);
    })));
  }
}
l(I, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), l(I, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
class Ge {
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
const k = "darkis-godforge";
class Te {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var r;
      const t = (r = e.flags) == null ? void 0 : r[k];
      return t && typeof t == "object" && "deity" in t && _(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var a;
      const o = (a = n.flags) == null ? void 0 : a[k];
      return o && typeof o == "object" && "deity" in o && _(o.deity) && o.deity.id === e.id;
    }), r = { [k]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: r }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: r })).uuid : null;
  }
}
function Oe(i) {
  if (!i || typeof i != "object" || !("registerModule" in i)) return null;
  const t = i.registerModule("darkis-godforge");
  if (!t || typeof t != "object" || !("register" in t) || !("executeAsGM" in t)) return null;
  const r = t;
  return { register: (s, n) => r.register(s, n), executeAsGM: (s, n) => r.executeAsGM(s, n) };
}
const p = "darkis-godforge";
function Ce(i) {
  return class extends I {
    constructor() {
      super(i);
    }
  };
}
function Fe(i, e, t) {
  if (!i || typeof i != "object" || Array.isArray(i)) return;
  const r = i, s = Math.max(-1, ...Object.values(r).map((n) => n.order ?? -1)) + 1;
  r[p] = {
    name: p,
    title: "DARKIS_GODFORGE.UI.TITLE",
    icon: "fas fa-hammer",
    order: s,
    visible: t,
    tools: {
      dashboard: { name: "dashboard", title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 0, button: !0, visible: t, onChange: (n, o) => e() }
    }
  };
}
function Re(i, e, t, r) {
  const s = C();
  s && (s.Hooks.once("init", () => {
    var d, u;
    const n = L("init");
    if (!n) return;
    P(n, i, t);
    const o = ((u = (d = n.modules) == null ? void 0 : d.get(p)) == null ? void 0 : u.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], a = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...o.map((c) => [c.lang, c.name])]);
    if (!n.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!n.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try {
        n.settings.registerMenu(p, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: Ce(e), restricted: !0 });
      } catch (c) {
        console.error("Darkis GodForge | Could not register dashboard settings menu.", c);
      }
      try {
        n.settings.register(p, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: a, onChange: (c) => {
          if (typeof c != "string" || c === "auto") return;
          const h = o.find((y) => y.lang === c);
          h != null && h.path && U(c, `modules/${p}/${h.path}`);
        } });
      } catch (c) {
        console.error("Darkis GodForge | Could not register language setting.", c);
      }
    }
    if (!n.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try {
      n.keybindings.register(p, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
        var c, h;
        return ((h = (c = m()) == null ? void 0 : c.user) == null ? void 0 : h.isGM) !== !0 ? !1 : (t(), !0);
      } });
    } catch (c) {
      console.error("Darkis GodForge | Could not register dashboard keybinding.", c);
    }
  }), s.Hooks.on("getSceneControlButtons", (...n) => {
    var o, a;
    Fe(n[0], t, ((a = (o = m()) == null ? void 0 : o.user) == null ? void 0 : a.isGM) === !0);
  }), s.Hooks.once("ready", async () => {
    var o, a, d, u, c, h, y;
    const n = L("ready");
    if (n) {
      P(n, i, t);
      try {
        const g = (a = (o = n.settings) == null ? void 0 : o.get) == null ? void 0 : a.call(o, p, "language"), v = (c = (u = (d = n.modules) == null ? void 0 : d.get(p)) == null ? void 0 : u.languages) == null ? void 0 : c.find((w) => w.lang === g);
        typeof g == "string" && (v != null && v.path) && await U(g, `modules/${p}/${v.path}`);
      } catch (g) {
        console.error("Darkis GodForge | Could not load the selected language.", g);
      }
      try {
        if (n.journal) for (const g of new Te(n.journal).load()) e.save(g);
      } catch (g) {
        console.error("Darkis GodForge | Could not load deity journals.", g);
      }
      try {
        const g = Oe((y = (h = n.modules) == null ? void 0 : h.get("socketlib")) == null ? void 0 : y.api);
        g && r && (r.setTransport(g), r.register());
      } catch (g) {
        console.error("Darkis GodForge | Could not initialize socketlib integration.", g);
      }
    }
  }));
}
function L(i) {
  const e = m();
  return e || console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${i}.`), e ?? null;
}
function P(i, e, t) {
  var n;
  const r = (n = i.modules) == null ? void 0 : n.get(p);
  if (!r) {
    console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed.");
    return;
  }
  const s = e;
  s.openDashboard = t, r.api = s;
}
class Me {
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
const N = new Ge(), Z = new oe(), Q = new ke(N, Z);
let j = null;
function B() {
  j ?? (j = new I(N)), j.render(!0).catch((i) => {
    var e, t, r;
    console.error("Darkis GodForge | Could not open dashboard.", i), (r = (t = (e = V()) == null ? void 0 : e.notifications) == null ? void 0 : t.error) == null || r.call(t, "Darkis GodForge could not be opened. Check the browser console.");
  });
}
const H = C(), Ne = new Me(Q, { get currentUserId() {
  var i, e;
  return ((e = (i = m()) == null ? void 0 : i.user) == null ? void 0 : e.id) ?? "unknown";
}, get isGM() {
  var i, e;
  return ((e = (i = m()) == null ? void 0 : i.user) == null ? void 0 : e.isGM) ?? !1;
}, ownsActor: (i, e) => {
  var r;
  const t = i;
  return ((r = t.testUserPermission) == null ? void 0 : r.call(t, { id: e }, "OWNER")) ?? !1;
}, resolveActor: (i) => {
  var e, t;
  return ((t = (e = m()) == null ? void 0 : e.actors) == null ? void 0 : t.get(i)) ?? null;
} });
H ? (Re(Q, N, B, Ne), H.Hooks.once("ready", () => {
  var e, t, r, s, n;
  const i = (t = (e = m()) == null ? void 0 : e.system) == null ? void 0 : t.id;
  i && !Z.supports(i) && ((n = (s = (r = V()) == null ? void 0 : r.notifications) == null ? void 0 : s.warn) == null || n.call(s, `Darkis GodForge does not support ${i}.`));
})) : typeof document < "u" && B();
export {
  I as GodForgeDashboard,
  Q as api,
  N as deityService,
  Z as registry,
  Ne as socketRouter
};
