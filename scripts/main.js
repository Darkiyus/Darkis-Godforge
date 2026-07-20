var Ve = Object.defineProperty;
var xe = (s, e, t) => e in s ? Ve(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var m = (s, e, t) => xe(s, typeof e != "symbol" ? e + "" : e, t);
function we(s, e) {
  return {
    name: s.name,
    type: "deity",
    img: s.image,
    system: {
      category: "deity",
      description: { value: s.description },
      sanctification: Be(s.sanctification),
      domains: { primary: [...s.domains], alternate: [...s.alternateDomains ?? []] },
      font: qe(s.font),
      attribute: [...s.divineAttributes ?? []],
      skill: s.skill ? [s.skill] : null,
      weapons: s.favoredWeapon ? [s.favoredWeapon] : [],
      spells: structuredClone(s.spells ?? {}),
      traits: { otherTags: [] }
    },
    flags: { "darkis-godforge": { definitionUuid: e } }
  };
}
function qe(s) {
  const e = (s == null ? void 0 : s.split(",").map((t) => t.trim().toLocaleLowerCase()).filter((t) => t === "harm" || t === "heal")) ?? [];
  return [...new Set(e)];
}
function Be(s) {
  const e = (s == null ? void 0 : s.split(",").map((t) => t.trim().toLocaleLowerCase()).filter((t) => t === "holy" || t === "unholy")) ?? [];
  return e.length ? { modal: "can", what: [...new Set(e)] } : null;
}
function re() {
  const s = globalThis, e = typeof Hooks < "u" ? Hooks : s.Hooks;
  return e ? { Hooks: e } : null;
}
function b() {
  const s = globalThis;
  return typeof game < "u" ? game : s.game;
}
function C() {
  const s = globalThis;
  return typeof ui < "u" ? ui : s.ui;
}
function he(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
async function ne(s) {
  var r, n, a, o, l, c, d, u;
  const t = (((n = (r = b()) == null ? void 0 : r.packs) == null ? void 0 : n.contents) ?? []).filter((h) => {
    var p;
    return h.documentName === "Item" && (!((p = h.metadata) != null && p.system) || h.metadata.system === s);
  }), i = [];
  for (const h of t) {
    const p = await h.getIndex({ fields: ["type", "img", "system.domains", "system.alignment"] });
    for (const f of p) {
      if (f.type !== "deity" || !f._id || !f.name || !h.collection) continue;
      const v = `Compendium.${h.collection}.Item.${f._id}`, T = Array.isArray((a = f.system) == null ? void 0 : a.domains) ? f.system.domains : [...((l = (o = f.system) == null ? void 0 : o.domains) == null ? void 0 : l.primary) ?? [], ...((d = (c = f.system) == null ? void 0 : c.domains) == null ? void 0 : d.alternate) ?? []];
      i.push({ id: v, sourceUuid: v, official: !0, name: f.name, title: f.name, image: f.img, domains: T, alignment: (u = f.system) == null ? void 0 : u.alignment });
    }
  }
  return i;
}
function He(s) {
  if (s.classId !== "cleric" && s.classId !== "champion") return null;
  const e = s.systemValues;
  return { classId: s.classId, deityId: s.deityId, grants: s.grants, domains: { available: e.domains, alternate: e.alternateDomains, pick: s.classId === "cleric" ? 1 : 0 }, divineAttributes: e.divineAttributes, grantedSpells: e.spells, divineFont: s.classId === "cleric" ? e.font : void 0, favoredWeapon: e.favoredWeapon, trainedSkill: s.classId === "cleric" ? e.skill : void 0, sanctification: e.sanctification, cause: s.classId === "champion" ? e.cause : void 0 };
}
class We {
  constructor() {
    m(this, "id", "pf2e");
    m(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(we(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return ne(this.id);
  }
  listSkills() {
    var t, i;
    const e = (i = (t = globalThis.CONFIG) == null ? void 0 : t.PF2E) == null ? void 0 : i.skills;
    return e ? Object.keys(e).sort() : [...this.capabilities.selectors];
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return He(e);
  }
}
class je {
  constructor() {
    m(this, "id", "sfrpg");
    m(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return null;
  }
  async listOfficialDeities() {
    return ne(this.id);
  }
  listSkills() {
    var t, i;
    const e = (i = (t = globalThis.CONFIG) == null ? void 0 : t.SFRPG) == null ? void 0 : i.skills;
    return e ? Object.keys(e).sort() : [...this.capabilities.selectors];
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return null;
  }
}
class $e {
  constructor() {
    m(this, "id", "sf2e");
    m(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(we(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return ne(this.id);
  }
  listSkills() {
    var t, i;
    const e = (i = (t = globalThis.CONFIG) == null ? void 0 : t.PF2E) == null ? void 0 : i.skills;
    return e ? Object.keys(e).sort() : [...this.capabilities.selectors];
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class ae {
  constructor() {
    m(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new We()), this.register(new $e()), this.register(new je());
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
function S(s, e, t) {
  if (t.isGM) return !0;
  const i = t.actorDeityId === e;
  switch (s) {
    case "public":
      return !0;
    case "selection":
      return t.selection === !0;
    case "followers":
    case "hidden-until-selected":
      return i;
    case "owner":
      return i && t.ownsActor === !0;
    case "trusted":
      return t.isTrusted === !0;
    case "gm":
      return !1;
  }
}
function U(s, e) {
  return e.isGM ? !0 : s.status === "published" && S(s.visibility.deity, s.id, e);
}
function M(s, e) {
  if (!U(s, e)) return null;
  const t = s.visibility.fields, i = { id: s.id, name: s.name, title: s.title };
  return S(t.portrait, s.id, e) && (i.image = s.image), S(t.description, s.id, e) && (i.description = s.description), S(t.quote, s.id, e) && (i.quote = s.quote), S(t.pantheon, s.id, e) && (i.pantheonIds = structuredClone(s.pantheonIds ?? [])), S(t.domains, s.id, e) && (i.domains = structuredClone(s.domains), i.alternateDomains = structuredClone(s.alternateDomains ?? [])), S(t.spells, s.id, e) && (i.spells = structuredClone(s.spells ?? {})), S(t.favoredWeapon, s.id, e) && (i.favoredWeapon = s.favoredWeapon), S(t.edicts, s.id, e) && (i.edicts = structuredClone(s.edicts ?? [])), S(t.anathema, s.id, e) && (i.anathema = structuredClone(s.anathema ?? [])), S(t.bonuses, s.id, e) && (i.passiveBonuses = s.passiveBonuses.filter((r) => r.enabled !== !1 && S(r.visibility ?? "followers", s.id, e)).map((r) => Ye(r, S(t.numericValues, s.id, e)))), S(t.abilities, s.id, e) && (i.abilities = s.abilities.filter((r) => r.enabled !== !1 && S(r.visibility ?? "followers", s.id, e)).map((r) => Ke(r, S(t.numericValues, s.id, e)))), i;
}
function Ye(s, e) {
  const t = structuredClone(s);
  return e || (t.value = ""), delete t.visible, t;
}
function Ke(s, e) {
  const t = structuredClone(s);
  return e || (t.effects = t.effects.filter((i) => i.type === "message"), delete t.timing, delete t.uses, delete t.duration, delete t.actionCost), delete t.condition, t;
}
function ze(s) {
  return { id: s.id, name: s.name, title: s.title, image: s.image, domains: s.domains, alignment: s.alignment };
}
function Xe(s, e, t, i = { isGM: !0 }) {
  return s.filter((r) => !t.has(r.id) && U(r, i) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).flatMap((r) => {
    if (i.isGM) return [ze(r)];
    const n = M(r, i);
    return n ? [{ id: n.id, name: n.name, title: n.title ?? "", image: n.image, domains: n.domains ?? [] }] : [];
  });
}
function V(s, e) {
  var n;
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (s.mode === "all") return s.grants.flatMap((a) => "mode" in a ? V(a, t) : [a.ref]);
  const i = ((n = t.find((a) => a.groupId === s.id)) == null ? void 0 : n.refs) ?? [], r = s.grants.map((a) => "mode" in a ? a.id : a.ref);
  if (!s.pick || i.length !== s.pick || i.some((a) => !r.includes(a))) throw new Error(`Grant group ${s.id} requires ${s.pick ?? 1} valid choice(s).`);
  return i.flatMap((a) => {
    const o = s.grants.find((l) => ("mode" in l ? l.id : l.ref) === a);
    return o && "mode" in o ? V(o, t) : o ? [o.ref] : [];
  });
}
function Te(s, e) {
  return s.used < s.max;
}
function Qe(s, e) {
  if (!Te(s)) throw new Error("No uses remaining.");
  return { ...s, used: s.used + 1 };
}
function Je(s, e) {
  return { ...s, used: 0, lastResetAt: e };
}
const Ze = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, et = /^\d+d\d+(?:[+\-]\d+)?$/, tt = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function De(s) {
  const e = s.replace(/\s/g, ""), t = e.match(Ze);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function oe(s) {
  const e = s.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], i = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((r) => !/^\d+d\d+$/.test(r))) return !1;
  try {
    return new Oe(De(i), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function K(s, e) {
  const t = s.replace(/\s/g, "");
  if (!oe(t)) throw new Error("Formula contains an unsupported term.");
  if (et.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new Oe(De(t), e).parse();
}
async function it(s, e, t) {
  if (!oe(s)) throw new Error("Formula contains an unsupported term.");
  const i = s.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let r = s;
  for (const n of [...new Set(i)]) {
    const a = await t(n);
    if (!Number.isFinite(a)) throw new Error("Dice result is not a finite number.");
    r = r.replace(new RegExp(`\\b${n}\\b`, "g"), String(a));
  }
  return K(r, e);
}
class Oe {
  constructor(e, t) {
    m(this, "position", 0);
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
      const t = this.take(), i = this.term();
      e = t === "+" ? e + i : e - i;
    }
    return e;
  }
  term() {
    let e = this.unary();
    for (; this.peek("*") || this.peek("/"); ) {
      const t = this.take(), i = this.unary();
      e = t === "*" ? e * i : e / i;
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
    if (tt.has(e)) return this.call(e);
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
function x(s, e) {
  if (s.type === "fact") return e[s.key] === s.equals;
  if (s.type === "not") return !x(s.child, e);
  const t = s.children.map((i) => x(i, e));
  return s.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function st(s, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (s.condition && !x(s.condition, e.conditionFacts ?? {})) return t;
  for (const i of s.effects) await Re(i, e, t);
  return t;
}
async function Re(s, e, t) {
  if (s.type === "message") {
    t.messages.push(s.text);
    return;
  }
  if (s.type === "branch") {
    const r = x(s.condition, e.conditionFacts ?? {}) ? s.then : s.otherwise ?? [];
    for (const n of r) await Re(n, e, t);
    return;
  }
  if (s.type === "heal" || s.type === "damage") {
    const r = s.target === "target" ? e.target : e.actor;
    if (!r) throw new Error("This ability requires a valid target.");
    const n = /\b\d+d\d+\b/.test(s.formula) ? e.rollDice ? await it(s.formula, e.facts, e.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : K(s.formula, e.facts);
    s.type === "heal" ? (t.healing += n, r.hp !== void 0 && (r.hp = Math.min(r.maxHp ?? Number.MAX_SAFE_INTEGER, r.hp + n))) : (t.damage += n, r.hp !== void 0 && (r.hp = Math.max(0, r.hp - n)));
    return;
  }
  if (s.type === "modifier") {
    const r = typeof s.value == "number" ? s.value : K(s.value, e.facts);
    e.actor.modifiers[s.selector] = r, t.appliedModifiers.push(s.selector);
    return;
  }
  if (s.type !== "condition") return;
  const i = s.target === "target" ? e.target : e.actor;
  if (!i) throw new Error("This ability requires a valid target.");
  i.conditions.push(s.condition), t.appliedConditions.push(s.condition);
}
function rt(s, e, t = []) {
  if (!e.trim()) throw new Error("Class identifier is required for deity coupling.");
  const i = s.grantGroups.flatMap((r) => V(r, t));
  return { deityId: s.id, classId: e, grants: i, choices: t, systemValues: { domains: s.domains, alternateDomains: s.alternateDomains ?? [], divineAttributes: s.divineAttributes ?? [], spells: s.spells ?? {}, font: s.font, favoredWeapon: s.favoredWeapon, skill: s.skill, sanctification: s.sanctification, cause: s.cause } };
}
function $(s, e) {
  return !s || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: s.id, name: s.name, title: s.title ?? "", image: s.image }, grants: e.grants, abilities: (s.abilities ?? []).map((t) => {
    var i;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((i = e.usages[t.id]) == null ? void 0 : i.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
const G = {
  deity: "public",
  fields: {
    portrait: "public",
    description: "public",
    quote: "public",
    pantheon: "public",
    bonuses: "followers",
    abilities: "followers",
    numericValues: "followers",
    domains: "public",
    spells: "selection",
    favoredWeapon: "public",
    edicts: "public",
    anathema: "public",
    gmNotes: "gm"
  }
}, _ = 2;
function _e(s) {
  if (!s || typeof s != "object") throw new Error("Invalid deity definition.");
  const e = structuredClone(s), t = typeof e.schemaVersion == "number" ? e.schemaVersion : 0;
  if (t > _) throw new Error(`Unsupported deity schema ${t}.`);
  const i = [], r = e.visibility && typeof e.visibility == "object" ? e.visibility : {}, n = nt(r), a = at(e.status, r.players), o = {
    ...e,
    schemaVersion: _,
    revision: Math.max(1, typeof e.revision == "number" ? e.revision : 0) + (t < _ ? 1 : 0),
    createdAt: typeof e.createdAt == "string" ? e.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: t < _ ? (/* @__PURE__ */ new Date()).toISOString() : String(e.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()),
    checksum: typeof e.checksum == "string" ? e.checksum : "pending",
    status: a,
    visibility: n,
    passiveBonuses: Array.isArray(e.passiveBonuses) ? e.passiveBonuses.map(ot) : [],
    abilities: Array.isArray(e.abilities) ? e.abilities.map(lt) : [],
    grantGroups: Array.isArray(e.grantGroups) ? e.grantGroups : [],
    replacement: e.replacement && typeof e.replacement == "object" ? e.replacement : { sourceUuid: "", mode: "none", contexts: [] },
    domains: Array.isArray(e.domains) ? e.domains : []
  };
  return t < _ && i.push(`Legacy definition migrated to schema version ${_}.`), { definition: o, migrated: t < _, warnings: i };
}
function nt(s) {
  if (typeof s.deity == "string" && s.fields && typeof s.fields == "object") {
    const r = s.fields;
    return {
      deity: q(s.deity, G.deity),
      fields: Object.fromEntries(Object.entries(G.fields).map(([n, a]) => [n, q(r[n], a)]))
    };
  }
  const e = s.players !== !1, t = s.library === !1 || !e ? "gm" : "public", i = s.characterSheet === !1 ? "gm" : "followers";
  return { ...structuredClone(G), deity: t, fields: { ...structuredClone(G.fields), bonuses: i, abilities: i } };
}
function at(s, e) {
  return s === "draft" || s === "test" || s === "published" || s === "disabled" || s === "archived" ? s : e === !1 ? "draft" : "published";
}
function ot(s) {
  if (!s || typeof s != "object") return s;
  const e = s;
  return { ...e, enabled: e.enabled !== !1, visibility: q(e.visibility, e.visible === !1 ? "gm" : "followers") };
}
function lt(s) {
  if (!s || typeof s != "object") return s;
  const e = s;
  return { ...e, enabled: e.enabled !== !1, visibility: q(e.visibility, "followers") };
}
function q(s, e) {
  return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "trusted" || s === "gm" || s === "hidden-until-selected" ? s : e;
}
function ct(s, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 2, exportedAt: e, deities: structuredClone(s) };
}
function dt(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion >= 1 && e.schemaVersion <= 2 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function Ne(s) {
  if (!dt(s)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return s.deities.map((e) => _e(e).definition);
}
function le(s, e) {
  const t = s.filter((o) => Number.isFinite(o.weight) && o.weight > 0), i = t.reduce((o, l) => o + l.weight, 0);
  if (!t.length || i <= 0) throw new Error("Random table has no selectable entries.");
  const r = Math.min(Math.max(e(), 0), 0.999999999) * i;
  let n = 0;
  for (const [o, l] of t.entries())
    if (n += l.weight, r < n) return { entry: l, index: o, roll: r };
  return { entry: t[t.length - 1], index: t.length - 1, roll: r };
}
function ut(s, e) {
  return { status: "resolved", draw: le(s, e) };
}
function Ce(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  if (e.tables !== void 0 && !Array.isArray(e.tables) || e.wheels !== void 0 && !Array.isArray(e.wheels)) return !1;
  const t = e.tables ?? [], i = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!z(n) || !N(n.id) || i.has(n.id) || !N(n.name) || !N(n.formula) || !pe(n.visibility) || !Array.isArray(n.entries) || !n.entries.length || !n.entries.every(ht)) return !1;
    i.add(n.id);
  }
  const r = /* @__PURE__ */ new Set();
  for (const n of e.wheels ?? []) {
    if (!z(n) || !N(n.id) || r.has(n.id) || !N(n.name) || !N(n.tableId) || !i.has(n.tableId) || !pe(n.visibility) || !X(n.duration) || !X(n.minimumSpins)) return !1;
    r.add(n.id);
  }
  return !0;
}
class ke {
  constructor() {
    m(this, "tables", /* @__PURE__ */ new Map());
    m(this, "wheels", /* @__PURE__ */ new Map());
    m(this, "persistContent");
  }
  setPersistence(e) {
    this.persistContent = e;
  }
  load(e) {
    const t = e ?? {};
    if (!Ce(t)) throw new Error("Invalid GodForge random content.");
    this.tables.clear(), this.wheels.clear();
    for (const i of t.tables ?? []) this.tables.set(i.id, structuredClone(i));
    for (const i of t.wheels ?? []) this.wheels.set(i.id, structuredClone(i));
  }
  replace(e) {
    this.load(e), this.persist();
  }
  snapshot() {
    return { tables: this.listTables(), wheels: this.listWheels() };
  }
  listTables() {
    return [...this.tables.values()].map((e) => structuredClone(e));
  }
  listWheels() {
    return [...this.wheels.values()].map((e) => structuredClone(e));
  }
  getTable(e) {
    const t = this.tables.get(e);
    return t ? structuredClone(t) : null;
  }
  createTable(e) {
    if (!e.name.trim() || !e.entries.length) throw new Error("Random table requires a name and entries.");
    const t = { ...structuredClone(e), id: crypto.randomUUID(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return this.tables.set(t.id, t), this.persist(), structuredClone(t);
  }
  createWheel(e) {
    if (!this.tables.has(e.tableId)) throw new Error("Fortune wheel table was not found.");
    const t = { ...structuredClone(e), id: crypto.randomUUID(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return this.wheels.set(t.id, t), this.persist(), structuredClone(t);
  }
  drawTable(e, t) {
    const i = this.tables.get(e);
    if (!i) throw new Error("Random table was not found.");
    return le(i.entries, t);
  }
  spinWheel(e, t) {
    var r;
    const i = this.wheels.get(e);
    if (!i) throw new Error("Fortune wheel was not found.");
    return ut(((r = this.tables.get(i.tableId)) == null ? void 0 : r.entries) ?? [], t);
  }
  persist() {
    this.persistContent && this.persistContent(this.snapshot()).catch((e) => console.error("Darkis GodForge | Could not persist random content.", e));
  }
}
function z(s) {
  return !!s && typeof s == "object";
}
function N(s) {
  return typeof s == "string" && s.trim().length > 0 && s.length <= 1e4;
}
function X(s) {
  return typeof s == "number" && Number.isFinite(s) && s > 0;
}
function pe(s) {
  return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "gm" || s === "hidden-until-selected";
}
function ht(s) {
  return !z(s) || !N(s.id) || !N(s.label) || !X(s.weight) || s.description !== void 0 && typeof s.description != "string" ? !1 : s.category === void 0 || s.category === "positive" || s.category === "neutral" || s.category === "negative" || s.category === "catastrophic" || s.category === "jackpot";
}
const pt = { UI: { TITLE: "Darkis GodForge", TAGLINE: "Create gods. Shape belief.", SUBTITLE: "Forge destiny.", CREATE: "New deity", EDIT: "Edit", EDIT_DEITY: "Edit deity", CODEX: "Divine Codex", HUB: "GodForge Hub", ACTIVE_GRANTS: "Active grants", ACTIVATE: "Activate", NO_WONDERS: "This deity grants no activatable wonders.", NO_ASSIGNED_DEITY: "No deity assigned", NO_ASSIGNED_DEITY_HINT: "Choose a deity in the Divine Codex or ask the GM to assign one to this character.", YOUR_DEITY: "Your deity", SELECT_DEITY: "Choose as deity", SELECTION_REQUIRES_GM: "This deity requires grant choices and must be assigned by the GM.", OPEN_CODEX: "Open Divine Codex", OPEN_HUB: "Open GodForge Hub", SELECT_CHARACTER_FIRST: "Select or assign a character before opening GodForge Hub.", MY_DEITIES: "My deities", ENTRIES: "entries", DOMAINS: "Domains", ABILITIES: "Abilities", VISIBILITY: "Visibility", PASSIVE_BONUS: "Passive bonus", PASSIVE_BONUSES: "Passive bonuses", DIVINE_ABILITY: "Divine ability", DIVINE_WONDER: "Divine wonder", DIVINE_WONDERS: "Divine wonders", SEARCH: "Search GodForge …", ALL_DOMAINS: "All domains", NO_RESULTS: "No deities found.", NEW_DEITY: "Create a new deity", NEW_DEITY_HINT: "Build identity, rules, wonders, and visibility in one shared draft.", NAME: "Name", TITLE_FIELD: "Title", DESCRIPTION: "Description", ALIGNMENT: "Alignment", SAVE: "Save deity", CANCEL: "Cancel", OPEN_DASHBOARD: "Open GodForge dashboard", NEW_DEITY_PLACEHOLDER: "e.g. Tenebris", TITLE_PLACEHOLDER: "e.g. Goddess of Shadows", DOMAINS_PLACEHOLDER: "Shadows, secrets, deception", QUOTE: "Quote", PORTRAIT: "Portrait", SYMBOL: "Cult symbol", FILE_PATH: "Foundry file path", PANTHEONS: "Pantheons", TAGS: "Tags", FAVORED_WEAPON: "Favored weapon", DIVINE_FONT: "Divine font", TRAINED_SKILL: "Divine skill", SANCTIFICATION: "Sanctification", CHAMPION_CAUSE: "Champion cause", EDICTS: "Edicts", ANATHEMA: "Anathema", COMMA_SEPARATED: "Comma-separated", STATUS: "Publication status", STATUS_DRAFT: "Draft", STATUS_TEST: "Test", STATUS_PUBLISHED: "Published", STATUS_DISABLED: "Disabled", STATUS_ARCHIVED: "Archived", BASIC_DATA: "Basic data", EDITOR_STEPS: "Deity editor steps", REQUIRED_FIELDS: "Required fields", BONUS_EDITOR_HINT: "Create multiple system-native bonuses with conditions and individual visibility.", ABILITY_EDITOR_HINT: "Action cost, usage, reset, cooldown, and duration remain separate.", GRANT_GROUPS: "Grant groups", GRANT_GROUPS_HINT: "Nest AND/OR groups and override inherited names, descriptions, or values.", ADD_GRANT_GROUP: "Add group", GRANT_GROUP: "Grant group", ADD_GRANT: "Add grant", ADD_SUBGROUP: "Add subgroup", GROUP_MODE: "Relationship", ALL_REQUIRED: "All (AND)", CHOOSE_FROM: "Choice (OR)", PICK_COUNT: "Pick count", GRANT: "Grant", REFERENCE: "Reference ID", OVERRIDE_NAME: "Override name", OVERRIDE_VALUE: "Override value", OVERRIDE_DESCRIPTION: "Override description", ADD_BONUS: "Add bonus", ADD_ABILITY: "Add wonder", REMOVE: "Remove", MOVE_UP: "Move up", MOVE_DOWN: "Move down", DUPLICATE: "Duplicate", STACKING_WARNING: "In PF2e, this status bonus does not stack with another status bonus on the same selector; only the highest value applies.", SELECTOR: "Selector", VALUE: "Value or formula", MODIFIER_TYPE: "Modifier type", MOD_STATUS: "Status bonus", MOD_CIRCUMSTANCE: "Circumstance bonus", MOD_ITEM: "Item bonus", MOD_UNTYPED: "Untyped", APPLIES_TO: "Applies to", CHECKS: "Checks", DCS: "DCs", BOTH: "Checks and DCs", CONDITION: "Condition", OPTIONAL_CONDITION: "Optional, e.g. while in darkness", ACTION_COST: "Action cost", ACTION_AUTOMATIC: "Automatic / no action", ACTION_FREE: "Free action", ACTION_REACTION: "Reaction", ACTIONS: "Actions", ACTION_EXPLORATION: "Exploration activity", ACTION_DOWNTIME: "Downtime activity", ACTION_COUNT: "Number of actions", USAGES: "Uses", RESET: "Reset", RESET_DAILY: "At daily preparations", RESET_TEN_MINUTES: "After a 10-minute rest", RESET_REFOCUS: "After refocusing", RESET_ENCOUNTER: "At encounter end", RESET_SCENE: "On scene change", RESET_CALENDAR_DAY: "Per calendar day", RESET_MANUAL: "GM only", COOLDOWN: "Cooldown", COOLDOWN_UNIT: "Cooldown unit", DURATION: "Duration", DURATION_UNIT: "Duration unit", ROUNDS: "Rounds", MINUTES: "Minutes", HOURS: "Hours", DAYS: "Days", INSTANT: "Instant", ENCOUNTER: "Encounter", SCENE: "Scene", UNTIL_RESET: "Until next reset", EFFECT_TEMPLATE: "Effect template", EFFECT_NARRATIVE: "Narrative effect", EFFECT_HEAL: "Heal", EFFECT_DAMAGE: "Deal damage", EFFECT_BONUS: "Grant bonus", FORMULA_OR_VALUE: "Formula or value", VISIBILITY_HINT: "Fields that are not authorized are removed from player data before rendering.", DEITY_VISIBILITY: "Deity visibility", PLAYER_PREVIEW: "Preview as player", GM_NOTES: "Internal GM notes", VIS_PUBLIC: "Public", VIS_SELECTION: "Visible before selection", VIS_FOLLOWERS: "Followers only", VIS_OWNER: "Owner only", VIS_TRUSTED: "Trusted players", VIS_GM: "GM only", VIS_HIDDEN_UNTIL_SELECTED: "Hidden until selected", VIS_FIELD_PORTRAIT: "Portrait", VIS_FIELD_DESCRIPTION: "Description", VIS_FIELD_QUOTE: "Quote", VIS_FIELD_PANTHEON: "Pantheon", VIS_FIELD_BONUSES: "Passive bonuses", VIS_FIELD_ABILITIES: "Divine wonders", VIS_FIELD_NUMERIC_VALUES: "Exact numeric values", VIS_FIELD_DOMAINS: "Domains", VIS_FIELD_SPELLS: "Granted spells", VIS_FIELD_FAVORED_WEAPON: "Favored weapon", VIS_FIELD_EDICTS: "Edicts", VIS_FIELD_ANATHEMA: "Anathema", VIS_FIELD_GM_NOTES: "Internal GM notes", REPLACEMENT: "Official template and replacement", REPLACEMENT_MODE: "Replacement mode", REPLACE_NONE: "No replacement", REPLACE_HIDE: "Hide official deity", REPLACE_SOURCE: "Replace with this deity", SOURCE_UUID: "Source UUID", REPLACEMENT_CONTEXTS: "Affected selection contexts", OVERVIEW: "Overview", DEITIES: "Deities", RANDOM_TABLES: "Random tables", FORTUNE_WHEELS: "Fortune wheels", RANDOM_AND_WHEELS: "Random tables and fortune wheels", RANDOM_MANAGER_HINT: "The result is resolved authoritatively first; the wheel animation only presents that fixed result.", NEW_RANDOM_TABLE: "New random table", DICE_FORMULA: "Dice formula", RESULT_ENTRIES: "Results", ADD_RESULT: "Add result", SAVE_TABLE: "Save table", NEW_FORTUNE_WHEEL: "New fortune wheel", LINKED_TABLE: "Linked table", ANIMATION_DURATION: "Animation duration in seconds", MINIMUM_SPINS: "Minimum spins", SAVE_WHEEL: "Save wheel", TEST_DRAW: "Test draw", TEST_SPIN: "Test spin", NO_RANDOM_TABLES: "No random tables have been created yet.", NO_FORTUNE_WHEELS: "No fortune wheels have been created yet.", RESULT_TITLE: "Result title", CATEGORY_JACKPOT: "Jackpot", CATEGORY_POSITIVE: "Positive", CATEGORY_NEUTRAL: "Neutral", CATEGORY_NEGATIVE: "Negative", CATEGORY_CATASTROPHIC: "Catastrophic", INTEGRATION: "Integration", REPLACEMENTS: "Replacements", REPLACEMENT_MANAGER_HINT: "Safely map official system deities to homebrew replacements without modifying source packs.", OFFICIAL_DEITY: "Official deity", HOMEBREW_REPLACEMENT: "Homebrew replacement", INHERITANCE: "Inheritance", SELECTIVE_INHERITANCE: "Selective via deity definition", INHERITED_VALUES: "inherited values", SPELLS: "Spells", ALTERNATE_DOMAINS: "Alternate domains", DIVINE_ATTRIBUTES: "Divine attributes", CLERIC_SPELLS: "Granted cleric spells", SPELLS_HINT: "One per line: rank=Compendium.package.pack.Item.id", KEEP_EXISTING_ACTORS: "Keep for existing characters", NO_OFFICIAL_DEITIES: "No official deities found", NO_OFFICIAL_DEITIES_HINT: "The active system adapter did not detect a matching deity pack.", CHARACTERS: "Characters", CHARACTER: "Character", CHARACTER_MANAGER_HINT: "Assign deities and nested grant choices to a character in a controlled workflow.", ASSIGN_DEITY: "Assign deity", PLAYER_VIEW: "Player view", TOOLS: "Tools", TEST_LAB: "Test lab", IMPORT_EXPORT: "Import / Export", DATA_MANAGER_HINT: "Inspect GodForge packages before import and export a portable backup of your definitions.", EXPORT_PACKAGE: "Export GodForge package", EXPORT_HINT: "Exports all deities including visibility, bonuses, wonders, grants, and replacements.", EXPORT: "Export", IMPORT_PACKAGE: "Import GodForge package", IMPORT_HINT: "The file is validated and summarized before any changes are made.", CHOOSE_FILE: "Choose JSON file", IMPORT_INVALID: "Import could not be validated", IMPORT_PREVIEW: "Import preview", NEW_CONTENT: "New content", UPDATED_CONTENT: "Updated content", IMPORT_APPLY_HINT: "Existing IDs are updated and new IDs are added.", APPLY_IMPORT: "Apply validated import", IMPORTED: "GodForge entries imported.", MIGRATIONS: "Migrations", AUDIT_LOG: "Audit log", SETTINGS: "Settings", MODULE_OPTIONS: "Module options", ADAPTER: "System adapter", HELP: "Help", QUICK_ACCESS: "Quick access", SYSTEM_STATUS: "System status", RECENTLY_EDITED: "Recently edited", PUBLISHED: "Published", INVALID: "Invalid definitions", ASSIGNED_CHARACTERS: "Assigned characters", EMPTY_TITLE: "No custom deities yet", EMPTY_HINT: "Create a new deity or import a pantheon.", IMPORT: "Import", LARGER_WINDOW: "A larger window is recommended for the full editor.", TYPE: "Type", LAST_CHANGED: "Last changed", SYSTEM: "System", SCHEMA: "Data schema", VERSION: "Version", DIAGNOSTICS_OK: "Ready" }, SETTINGS: { MENU_NAME: "GodForge management", MENU_LABEL: "Open GodForge", MENU_HINT: "Opens the dashboard for creating and managing custom deities.", LANGUAGE: "GodForge language", LANGUAGE_HINT: "Language used by GodForge surfaces.", AUTO: "Automatic" }, ERROR: { NO_USES: "No uses remaining.", GM_ONLY: "Only the GM may use this GodForge feature.", NO_PERMISSION: "You are not allowed to use this GodForge feature.", DASHBOARD_OPEN: "The GodForge dashboard could not be opened. Check the browser console.", CODEX_OPEN: "The Divine Codex could not be opened. Check the browser console.", HUB_OPEN: "The GodForge Hub could not be opened. Check the browser console.", UNSUPPORTED_SYSTEM: "Darkis GodForge does not support the active {system} system.", ACTION_FAILED: "The action could not be completed. Check the browser console." } }, ce = {
  DARKIS_GODFORGE: pt
}, Q = /* @__PURE__ */ new Map([["en", ce]]);
async function me(s, e) {
  if (s === "auto" || Q.has(s)) return;
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Unable to load GodForge language ${s}.`);
  Q.set(s, await t.json());
}
function O(s) {
  var n, a, o, l;
  const e = b(), t = (a = (n = e == null ? void 0 : e.settings) == null ? void 0 : n.get) == null ? void 0 : a.call(n, "darkis-godforge", "language");
  if (typeof t == "string" && t !== "auto") {
    const c = fe(Q.get(t), s);
    if (typeof c == "string") return c;
  }
  const i = (l = (o = e == null ? void 0 : e.i18n) == null ? void 0 : o.localize) == null ? void 0 : l.call(o, s);
  if (i && i !== s) return i;
  const r = fe(ce, s);
  return typeof r == "string" ? r : s;
}
function D() {
  return Object.fromEntries(Object.keys(ce.DARKIS_GODFORGE.UI).map((s) => [s, O(`DARKIS_GODFORGE.UI.${s}`)]));
}
function fe(s, e) {
  return e.split(".").reduce((t, i) => t && typeof t == "object" ? t[i] : void 0, s);
}
function g() {
  var t, i, r, n;
  const s = b();
  if (!s || ((t = s.user) == null ? void 0 : t.isGM) === !0) return;
  const e = O("DARKIS_GODFORGE.ERROR.GM_ONLY");
  throw (n = (r = (i = C()) == null ? void 0 : i.notifications) == null ? void 0 : r.warn) == null || n.call(r, e), new Error("GodForge: GM only.");
}
function k(s = !1) {
  var r, n, a;
  const e = (r = b()) == null ? void 0 : r.user, t = e == null ? void 0 : e.character, i = (n = t == null ? void 0 : t.flags) == null ? void 0 : n["darkis-godforge"];
  return {
    isGM: (e == null ? void 0 : e.isGM) === !0,
    isTrusted: (e == null ? void 0 : e.isTrusted) === !0 || typeof (e == null ? void 0 : e.role) == "number" && e.role >= 2,
    selection: s,
    actorDeityId: typeof (i == null ? void 0 : i.deityId) == "string" ? i.deityId : void 0,
    ownsActor: ((a = t == null ? void 0 : t.testUserPermission) == null ? void 0 : a.call(t, e, "OWNER")) ?? !!t
  };
}
class Ge {
  constructor(e, t) {
    m(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  async getSelectableDeities(e) {
    var p, f, v, T;
    const t = this.deities.list(), i = e.systemId ?? ((f = (p = b()) == null ? void 0 : p.system) == null ? void 0 : f.id) ?? "", r = k(!0), n = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter, systemId: i, catalogContext: e.catalogContext, viewer: r }, a = JSON.stringify([t.map((I) => [I.id, I.revision]), n]);
    if (((v = this.catalogCache) == null ? void 0 : v.key) === a) return this.catalogCache.result;
    const o = await (((T = this.adapters.tryGet(i)) == null ? void 0 : T.listOfficialDeities()) ?? Promise.resolve([])), l = e.catalogContext ?? "characterBuilder", c = new Set(t.filter((I) => I.replacement.sourceUuid && (I.replacement.mode === "hide" || I.replacement.mode === "replace") && (!I.replacement.contexts.length || I.replacement.contexts.includes(l))).map((I) => I.replacement.sourceUuid)), d = Xe(t, e, /* @__PURE__ */ new Set(), r), u = o.filter((I) => !I.sourceUuid || !c.has(I.sourceUuid)), h = [...d, ...u];
    return this.catalogCache = { key: a, result: h }, h;
  }
  exportDeities(e) {
    return g(), ct(this.deities.list(), e);
  }
  importDeities(e) {
    g();
    const t = Ne(e);
    for (const i of t) this.deities.save(i);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e) {
    const t = k(!0);
    return le(this.deities.list().filter((i) => U(i, t)).map((i) => ({ id: i.id, label: i.name, weight: 1 })), e);
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  isDeitySelectableByPlayer(e) {
    const t = this.deities.get(e);
    return !!(t && U(t, { isGM: !1, selection: !0 }));
  }
  async materializeDeity(e, t, i) {
    g();
    const r = this.deities.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(r, i);
  }
  getDeity(e) {
    const t = this.deities.get(e);
    if (!t) return null;
    const i = k();
    return i.isGM ? t : M(t, i);
  }
  getActorDeity(e) {
    var n;
    this.requireActorOwner(e);
    const t = (n = e.flags) == null ? void 0 : n["darkis-godforge"];
    if (!t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string") return null;
    const i = this.deities.get(t.deityId);
    if (!i) return null;
    const r = { ...k(), actorDeityId: t.deityId, ownsActor: !0 };
    return r.isGM ? i : M(i, r);
  }
  getCharacterWidgetData(e) {
    var o;
    this.requireActorOwner(e);
    const t = (o = e.flags) == null ? void 0 : o["darkis-godforge"], i = t && typeof t == "object" && "deityId" in t && "grants" in t && "usages" in t ? t : null, r = i ? this.deities.get(i.deityId) : null;
    if (!r || !i) return $(null, null);
    const n = k();
    if (n.isGM) return $(r, i);
    const a = M(r, { ...n, actorDeityId: r.id, ownsActor: !0 });
    return $(a, { ...i, grants: [] });
  }
  getGrantChoices(e, t) {
    var i;
    return g(), ((i = this.deities.get(e)) == null ? void 0 : i.grantGroups) ?? null;
  }
  getClassGrants(e, t, i = []) {
    g();
    const r = this.deities.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return rt(r, t, i);
  }
  buildClassCoupling(e, t, i, r = []) {
    return this.adapters.get(i).buildClassCoupling(this.getClassGrants(e, t, r));
  }
  async assignDeity(e, t, i = {}) {
    this.requireActorOwner(e);
    const r = this.deities.get(t);
    if (!r || !U(r, k(!0))) throw new Error("Deity is not available for assignment.");
    const n = Object.entries(i).map(([l, c]) => ({ groupId: l, refs: c })), a = r.grantGroups.flatMap((l) => V(l, n)), o = Object.fromEntries(r.abilities.filter((l) => l.uses).map((l) => [l.id, { used: 0, max: l.uses.max, lastResetAt: Date.now(), reset: l.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: a, usages: o } } }), await this.synchronizeActorDeityItem(e, r);
  }
  async removeDeity(e) {
    this.requireActorOwner(e), e.unsetFlag ? await Promise.all(["deityId", "grants", "usages"].map((t) => e.unsetFlag("darkis-godforge", t))) : await e.update({ flags: { "darkis-godforge": null } }), await this.removeActorDeityItems(e);
  }
  async resetActorUsages(e, t) {
    g();
    const i = this.readState(e), r = Date.now(), n = Object.fromEntries(Object.entries(i.usages).map(([a, o]) => o.reset === t ? [a, Je(o, r)] : [a, o]));
    await e.update({ flags: { "darkis-godforge": { ...i, usages: n } } });
  }
  async activateAbility(e, t, i = {}) {
    g();
    const r = this.readState(e), n = this.deities.get(r.deityId), a = n == null ? void 0 : n.abilities.find((d) => d.id === t);
    if (!a) throw new Error("Ability is not available for this actor.");
    const o = r.usages[t];
    if (o && !Te(o)) throw new Error("No uses remaining.");
    const l = o ? { ...r.usages, [t]: Qe(o) } : r.usages, c = { id: e.id, modifiers: {}, conditions: [] };
    await st(a, { actor: c, target: i.target, facts: i.facts ?? { actor: { level: 0 }, target: {} }, rollDice: i.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: l } } });
  }
  getReplacementFor(e) {
    return g(), this.deities.list().find((t) => t.replacement.sourceUuid === e && t.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, t) {
    return g(), this.deities.list().some((i) => i.replacement.sourceUuid === e && i.replacement.mode === "hide" && i.replacement.contexts.includes(t));
  }
  registerAdapter(e) {
    g(), this.adapters.register(e);
  }
  async synchronizeActorDeityItem(e, t) {
    var l, c;
    const i = (c = (l = b()) == null ? void 0 : l.system) == null ? void 0 : c.id, r = i ? this.adapters.tryGet(i) : null;
    if (!r || !e.createEmbeddedDocuments) return;
    const n = this.actorDeityItems(e), a = n[0];
    await r.materialize(t, { createItem: async (d) => {
      if (a != null && a.update)
        return await a.update(d), { uuid: a.uuid ?? `Actor.${e.id}.Item.${a.id}` };
      const [u] = await e.createEmbeddedDocuments("Item", [d]);
      if (!u) throw new Error("The system did not create the deity item.");
      return { uuid: u.uuid ?? `Actor.${e.id}.Item.${u.id}` };
    } }) && n.length > 1 && e.deleteEmbeddedDocuments && await e.deleteEmbeddedDocuments("Item", n.slice(1).map((d) => d.id));
  }
  async removeActorDeityItems(e) {
    const t = this.actorDeityItems(e).map((i) => i.id);
    t.length && e.deleteEmbeddedDocuments && await e.deleteEmbeddedDocuments("Item", t);
  }
  actorDeityItems(e) {
    var t;
    return (((t = e.items) == null ? void 0 : t.contents) ?? []).filter((i) => {
      var n;
      const r = (n = i.flags) == null ? void 0 : n["darkis-godforge"];
      return !!(r && typeof r == "object" && "definitionUuid" in r);
    });
  }
  readState(e) {
    var i;
    const t = (i = e.flags) == null ? void 0 : i["darkis-godforge"];
    if (!t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string" || !("usages" in t) || typeof t.usages != "object") throw new Error("Actor has no assigned deity.");
    return t;
  }
  requireActorOwner(e) {
    var i, r;
    const t = b();
    if (!(!t || ((i = t.user) == null ? void 0 : i.isGM) === !0) && ((r = e.testUserPermission) == null ? void 0 : r.call(e, t.user, "OWNER")) !== !0)
      throw new Error("GodForge: Actor owner or GM required.");
  }
}
function F(s) {
  if (!s) return "icons/svg/eye.svg";
  const e = s.trim();
  return /^(?:javascript|data|vbscript):/i.test(e) || /^\/\//.test(e) || /[\u0000-\u001f]/.test(e) ? "icons/svg/eye.svg" : e;
}
function mt(s) {
  const e = [];
  s.name.trim() || e.push({ level: "error", field: "name", message: "Name is required." }), s.title.trim() || e.push({ level: "error", field: "title", message: "Title is required." }), s.description.trim() || e.push({ level: "warning", field: "description", message: "Description is empty." });
  for (const t of s.passiveBonuses)
    (!t.name.trim() || !t.selector.trim()) && e.push({ level: "error", field: `bonus.${t.id}`, message: "Bonus name and selector are required." }), typeof t.value == "string" && !oe(t.value) && e.push({ level: "error", field: `bonus.${t.id}.value`, message: "Bonus formula is invalid." });
  for (const t of s.abilities)
    t.name.trim() || e.push({ level: "error", field: `ability.${t.id}`, message: "Ability name is required." }), !t.timing && t.actionCost === void 0 && e.push({ level: "warning", field: `ability.${t.id}.timing`, message: "Ability timing is incomplete." });
  return e;
}
function R() {
  var i;
  const s = globalThis, e = typeof foundry < "u" ? foundry : s.foundry, t = (i = e == null ? void 0 : e.applications) == null ? void 0 : i.api;
  if (t != null && t.ApplicationV2 && t.HandlebarsApplicationMixin) return t.HandlebarsApplicationMixin(t.ApplicationV2);
  if (re()) {
    const r = "Darkis GodForge | Foundry ApplicationV2 is unavailable while loading the module.";
    return console.error(r), class {
      render() {
        return Promise.reject(new Error(r));
      }
    };
  }
  return class {
    render() {
      return Promise.resolve(this);
    }
  };
}
function W(s, e) {
  var t, i, r;
  console.error(`Darkis GodForge | ${s}`, e), (r = (i = (t = C()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, O("DARKIS_GODFORGE.ERROR.ACTION_FAILED"));
}
class L extends R() {
  constructor(t, i, r, n, a, o) {
    super();
    m(this, "searchTerm", "");
    m(this, "selectedDomain", "");
    this.deityService = t, this.preview = i, this.api = r, this.socketRouter = n, this.actor = a, this.viewerOverride = o;
  }
  async _prepareContext() {
    var o, l, c, d;
    const t = ((o = this.preview) == null ? void 0 : o.viewer) ?? this.viewerOverride ?? k(!0), i = this.preview ? [{ ...this.preview.deity, status: "published" }] : this.deityService.list(), r = (d = (c = (l = this.actor) == null ? void 0 : l.flags) == null ? void 0 : c["darkis-godforge"]) == null ? void 0 : d.deityId, n = i.flatMap((u) => {
      const h = u.grantGroups.some((f) => f.mode === "any");
      if (t.isGM) return [{ ...u, image: F(u.image), selected: u.id === r, canSelect: !1, requiresChoices: h }];
      const p = M(u, t);
      return p ? [{ ...p, image: F(p.image), selected: u.id === r, canSelect: !!(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && !h), requiresChoices: h }] : [];
    }), a = n.filter((u) => {
      var h;
      return (!this.searchTerm || `${u.name} ${u.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || ((h = u.domains) == null ? void 0 : h.includes(this.selectedDomain)));
    });
    return { ui: D(), deities: a, domains: [...new Set(n.flatMap((u) => u.domains ?? []))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain, isGM: t.isGM, isPreview: !!(this.preview || this.viewerOverride) };
  }
  _onRender() {
    const t = this.element;
    if (!t) return;
    const i = t.querySelector("[data-search]"), r = t.querySelector("[data-filter]");
    i && (i.value = this.searchTerm), r && (r.value = this.selectedDomain), i == null || i.addEventListener("input", (n) => {
      this.searchTerm = n.target.value.toLocaleLowerCase(), this.render(!0);
    }), r == null || r.addEventListener("change", (n) => {
      this.selectedDomain = n.target.value, this.render(!0);
    }), t.querySelectorAll("[data-select-deity]").forEach((n) => n.addEventListener("click", () => {
      !this.actor || !this.socketRouter || this.socketRouter.assign({ actorId: this.actor.id, deityId: n.dataset.selectDeity ?? "", choices: {} }).then(() => this.render(!0)).catch((a) => W("Deity assignment failed.", a));
    }));
  }
}
m(L, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1e3, height: 760 } }), m(L, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
const ge = Object.keys(G.fields);
class B extends R() {
  constructor(e, t, i = new ae(), r) {
    super(), this.deityService = e, this.onSaved = t, this.adapters = i, this.existing = r;
  }
  async _prepareContext() {
    var r, n, a;
    g();
    const e = ((n = (r = b()) == null ? void 0 : r.system) == null ? void 0 : n.id) ?? "", t = ((a = this.adapters.tryGet(e)) == null ? void 0 : a.listSkills()) ?? [], i = D();
    return {
      ui: { ...i, NEW_DEITY: this.existing ? i.EDIT_DEITY : i.NEW_DEITY },
      selectors: t,
      visibilityFields: ge.map((o) => ({ key: o, label: i[`VIS_FIELD_${o.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? o })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((o) => ({ value: o, label: i[`VIS_${o.replaceAll("-", "_").toUpperCase()}`] ?? o }))
    };
  }
  _onRender() {
    var i, r, n, a, o;
    g();
    const e = this.element, t = e == null ? void 0 : e.querySelector("form");
    e && t && this.existing && this.populateForm(e, t, this.existing), (i = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || i.addEventListener("click", () => {
      var l;
      return void ((l = this.close) == null ? void 0 : l.call(this));
    }), (r = e == null ? void 0 : e.querySelector("[data-action='add-bonus']")) == null || r.addEventListener("click", () => this.appendTemplate(e, "bonus", "[data-bonus-list]")), (n = e == null ? void 0 : e.querySelector("[data-action='add-ability']")) == null || n.addEventListener("click", () => this.appendTemplate(e, "ability", "[data-ability-list]")), (a = e == null ? void 0 : e.querySelector("[data-action='add-grant-group']")) == null || a.addEventListener("click", () => this.appendTemplate(e, "grant-group", "[data-grant-list]")), e == null || e.addEventListener("click", (l) => {
      var u, h;
      const c = l.target.closest("[data-action]"), d = c == null ? void 0 : c.closest(".dg-editor-card");
      !c || !d || (c.dataset.action === "add-grant-member" && this.appendTemplate(d, "grant-member", ":scope > [data-grant-members]"), c.dataset.action === "add-subgroup" && this.appendTemplate(d, "grant-group", ":scope > [data-grant-members]"), c.dataset.action === "remove-row" && d.remove(), c.dataset.action === "duplicate-row" && d.after(d.cloneNode(!0)), c.dataset.action === "move-up" && d.previousElementSibling && ((u = d.parentElement) == null || u.insertBefore(d, d.previousElementSibling)), c.dataset.action === "move-down" && d.nextElementSibling && ((h = d.parentElement) == null || h.insertBefore(d.nextElementSibling, d)), this.updateStackingWarnings(e));
    }), e == null || e.addEventListener("input", () => this.updateStackingWarnings(e)), (o = e == null ? void 0 : e.querySelector("[data-action='preview-player']")) == null || o.addEventListener("click", () => {
      if (!(t != null && t.reportValidity())) return;
      const l = this.previewDefinition(t);
      new L(this.deityService, { deity: l, viewer: { isGM: !1, selection: !0 } }).render(!0);
    }), t == null || t.addEventListener("submit", (l) => {
      var d;
      l.preventDefault(), g();
      const c = this.existing ? this.deityService.update(this.existing.id, this.readInput(t)) : this.deityService.create(this.readInput(t));
      this.onSaved(c), (d = this.close) == null || d.call(this);
    });
  }
  appendTemplate(e, t, i) {
    var o, l, c;
    const r = ((o = this.element) == null ? void 0 : o.querySelector(`template[data-template='${t}']`)) ?? (e == null ? void 0 : e.querySelector(`template[data-template='${t}']`)), n = e == null ? void 0 : e.querySelector(i);
    if (!r || !n) return;
    const a = r.content.cloneNode(!0);
    (c = (l = a.querySelector("[name$='.visibility']")) == null ? void 0 : l.querySelector("[value='followers']")) == null || c.setAttribute("selected", "selected"), n.append(a), this.updateStackingWarnings(e);
  }
  previewDefinition(e) {
    const t = (/* @__PURE__ */ new Date()).toISOString();
    return { ...this.readInput(e), id: "preview", schemaVersion: 2, revision: 1, createdAt: t, updatedAt: t, checksum: "preview" };
  }
  populateForm(e, t, i) {
    var n, a, o, l, c;
    const r = {
      name: i.name,
      title: i.title,
      status: i.status,
      description: i.description,
      quote: i.quote ?? "",
      image: i.image ?? "",
      symbol: i.symbol ?? "",
      pantheons: (i.pantheonIds ?? []).join(", "),
      domains: i.domains.join(", "),
      alternateDomains: (i.alternateDomains ?? []).join(", "),
      divineAttributes: (i.divineAttributes ?? []).join(", "),
      spells: this.formatSpells(i.spells),
      tags: (i.tags ?? []).join(", "),
      alignment: i.alignment ?? "",
      favoredWeapon: i.favoredWeapon ?? "",
      font: i.font ?? "",
      skill: i.skill ?? "",
      sanctification: i.sanctification ?? "",
      cause: i.cause ?? "",
      edicts: (i.edicts ?? []).join(", "),
      anathema: (i.anathema ?? []).join(", "),
      gmNotes: i.gmNotes ?? "",
      "replacement.mode": i.replacement.mode,
      "replacement.sourceUuid": i.replacement.sourceUuid,
      "replacement.contexts": i.replacement.contexts.join(", "),
      "visibility.deity": i.visibility.deity
    };
    for (const [d, u] of Object.entries(i.visibility.fields)) r[`visibility.fields.${d}`] = u;
    for (const [d, u] of Object.entries(r)) this.setValue(t, d, u);
    for (const d of ["domains", "favoredWeapon", "spells", "sanctification", "skill", "edicts", "anathema"]) this.setChecked(t, `replacement.inherit.${d}`, ((n = i.replacement.inherit) == null ? void 0 : n[d]) === !0);
    this.setChecked(t, "replacement.keepForExistingActors", i.replacement.keepForExistingActors !== !1);
    for (const d of i.passiveBonuses) {
      this.appendTemplate(e, "bonus", "[data-bonus-list]");
      const u = e.querySelector("[data-bonus-list] [data-bonus-row]:last-child");
      u && (this.setValue(u, "bonus.name", d.name), this.setValue(u, "bonus.selector", d.selector), this.setValue(u, "bonus.value", String(d.value)), this.setValue(u, "bonus.modifierType", d.modifierType), this.setValue(u, "bonus.appliesTo", d.appliesTo ?? "checks"), this.setValue(u, "bonus.condition", d.condition ?? ""), this.setValue(u, "bonus.visibility", d.visibility ?? "followers"));
    }
    for (const d of i.abilities) {
      this.appendTemplate(e, "ability", "[data-ability-list]");
      const u = e.querySelector("[data-ability-list] [data-ability-row]:last-child");
      if (!u) continue;
      const h = d.timing, p = d.effects[0];
      this.setValue(u, "ability.name", d.name), this.setValue(u, "ability.description", d.description), this.setValue(u, "ability.visibility", d.visibility ?? "followers"), this.setValue(u, "ability.actionCost", (h == null ? void 0 : h.actionCost.type) ?? "actions"), this.setValue(u, "ability.actions", String((h == null ? void 0 : h.actionCost.actions) ?? d.actionCost ?? 1)), this.setValue(u, "ability.usageMax", String((h == null ? void 0 : h.usage.max) ?? ((a = d.uses) == null ? void 0 : a.max) ?? "")), this.setValue(u, "ability.reset", (h == null ? void 0 : h.reset.event) ?? ((o = d.uses) == null ? void 0 : o.reset) ?? "daily-preparations"), this.setValue(u, "ability.cooldownValue", String(((l = h == null ? void 0 : h.cooldown) == null ? void 0 : l.value) ?? 0)), this.setValue(u, "ability.cooldownUnit", ((c = h == null ? void 0 : h.cooldown) == null ? void 0 : c.unit) ?? "rounds"), this.setValue(u, "ability.durationValue", String((h == null ? void 0 : h.duration.value) ?? d.duration ?? 0)), this.setValue(u, "ability.durationUnit", (h == null ? void 0 : h.duration.unit) ?? "instant"), this.setValue(u, "ability.effectType", (p == null ? void 0 : p.type) === "heal" || (p == null ? void 0 : p.type) === "damage" || (p == null ? void 0 : p.type) === "modifier" ? p.type : "message"), this.setValue(u, "ability.formula", p && "formula" in p ? p.formula : (p == null ? void 0 : p.type) === "modifier" ? String(p.value) : "1"), this.setValue(u, "ability.selector", (p == null ? void 0 : p.type) === "modifier" ? p.selector : "");
    }
    for (const d of i.grantGroups) this.populateGrantGroup(e, e.querySelector("[data-grant-list]"), d);
    this.updateStackingWarnings(e);
  }
  readInput(e) {
    const t = new FormData(e), i = structuredClone(G);
    i.deity = this.visibility(t.get("visibility.deity"), "public");
    for (const r of ge) i.fields[r] = this.visibility(t.get(`visibility.fields.${r}`), i.fields[r]);
    return {
      status: this.status(t.get("status")),
      name: this.text(t.get("name")),
      title: this.text(t.get("title")),
      description: this.text(t.get("description")),
      quote: this.optional(t.get("quote")),
      image: this.optional(t.get("image")),
      symbol: this.optional(t.get("symbol")),
      domains: this.list(t.get("domains")),
      alternateDomains: this.list(t.get("alternateDomains")),
      divineAttributes: this.list(t.get("divineAttributes")),
      spells: this.spells(t.get("spells")),
      pantheonIds: this.list(t.get("pantheons")),
      tags: this.list(t.get("tags")),
      alignment: this.optional(t.get("alignment")),
      favoredWeapon: this.optional(t.get("favoredWeapon")),
      font: this.optional(t.get("font")),
      skill: this.optional(t.get("skill")),
      sanctification: this.optional(t.get("sanctification")),
      cause: this.optional(t.get("cause")),
      edicts: this.list(t.get("edicts")),
      anathema: this.list(t.get("anathema")),
      gmNotes: this.optional(t.get("gmNotes")),
      passiveBonuses: this.readBonuses(e),
      abilities: this.readAbilities(e),
      grantGroups: this.readGrantGroups(e),
      replacement: { sourceUuid: this.text(t.get("replacement.sourceUuid")), mode: this.replacementMode(t.get("replacement.mode")), contexts: this.list(t.get("replacement.contexts")), inherit: { domains: t.has("replacement.inherit.domains"), favoredWeapon: t.has("replacement.inherit.favoredWeapon"), spells: t.has("replacement.inherit.spells"), sanctification: t.has("replacement.inherit.sanctification"), skill: t.has("replacement.inherit.skill"), edicts: t.has("replacement.inherit.edicts"), anathema: t.has("replacement.inherit.anathema") }, keepForExistingActors: t.has("replacement.keepForExistingActors") },
      visibility: i
    };
  }
  readBonuses(e) {
    return [...e.querySelectorAll("[data-bonus-row]")].flatMap((t) => {
      const i = this.input(t, "bonus.name"), r = this.input(t, "bonus.selector");
      if (!i && !r) return [];
      const n = this.input(t, "bonus.value"), a = Number(n);
      return [{
        id: crypto.randomUUID(),
        name: i,
        selector: r,
        value: n !== "" && Number.isFinite(a) ? a : n,
        modifierType: this.modifierType(this.input(t, "bonus.modifierType")),
        appliesTo: this.appliesTo(this.input(t, "bonus.appliesTo")),
        condition: this.input(t, "bonus.condition") || void 0,
        visibility: this.visibility(this.input(t, "bonus.visibility"), "followers"),
        enabled: !0
      }];
    });
  }
  readAbilities(e) {
    return [...e.querySelectorAll("[data-ability-row]")].flatMap((t) => {
      const i = this.input(t, "ability.name");
      if (!i) return [];
      const r = this.input(t, "ability.description"), n = this.input(t, "ability.usageMax"), a = n === "" ? null : Math.max(0, Number(n)), o = this.resetType(this.input(t, "ability.reset")), l = Math.max(0, Number(this.input(t, "ability.cooldownValue") || 0)), c = Math.max(0, Number(this.input(t, "ability.durationValue") || 0)), d = this.input(t, "ability.effectType"), u = this.input(t, "ability.formula") || "0", h = d === "heal" || d === "damage" ? [{ type: d, formula: u, target: "target" }] : d === "modifier" ? [{ type: "modifier", selector: this.input(t, "ability.selector") || "all", value: u, modifierType: "status", duration: c }] : [{ type: "message", text: r }];
      return [{
        id: crypto.randomUUID(),
        name: i,
        description: r,
        visibility: this.visibility(this.input(t, "ability.visibility"), "followers"),
        enabled: !0,
        uses: a === null ? void 0 : { max: a, reset: o },
        timing: {
          actionCost: { type: this.actionCost(this.input(t, "ability.actionCost")), actions: Number(this.input(t, "ability.actions") || 0) || void 0 },
          usage: { max: a, period: a === null ? "unlimited" : "reset" },
          reset: { event: o },
          cooldown: l > 0 ? { value: l, unit: this.cooldownUnit(this.input(t, "ability.cooldownUnit")) } : null,
          duration: { value: c, unit: this.durationUnit(this.input(t, "ability.durationUnit")) }
        },
        effects: h
      }];
    });
  }
  readGrantGroups(e) {
    const t = e.querySelector("[data-grant-list]");
    return t ? [...t.children].flatMap((i) => i instanceof HTMLElement && i.matches("[data-grant-group]") ? [this.readGrantGroup(i)] : []) : [];
  }
  readGrantGroup(e) {
    const t = e.querySelector(":scope > [data-grant-members]"), i = [];
    for (const a of (t == null ? void 0 : t.children) ?? []) {
      if (!(a instanceof HTMLElement)) continue;
      if (a.matches("[data-grant-group]")) {
        i.push(this.readGrantGroup(a));
        continue;
      }
      if (!a.matches("[data-grant-member]")) continue;
      const o = this.input(a, "grant.ref");
      if (!o) continue;
      const l = this.input(a, "grant.overrideName"), c = this.input(a, "grant.overrideDescription"), d = this.input(a, "grant.overrideValue"), u = Number(d), h = l || c || d ? { name: l || void 0, description: c || void 0, value: d ? Number.isFinite(u) ? u : d : void 0 } : void 0;
      i.push({ type: this.input(a, "grant.type") === "bonus" ? "bonus" : "ability", ref: o, overrides: h });
    }
    const r = this.input(e, "grantGroup.mode") === "any" ? "any" : "all", n = Number(this.input(e, "grantGroup.pick") || 1);
    return { id: this.input(e, "grantGroup.id") || crypto.randomUUID(), label: this.input(e, "grantGroup.label"), mode: r, pick: r === "any" ? Math.max(1, n) : void 0, grants: i };
  }
  populateGrantGroup(e, t, i) {
    var l, c, d;
    const r = e.querySelector("template[data-template='grant-group']");
    if (!r || !t) return;
    const n = r.content.cloneNode(!0), a = n.querySelector("[data-grant-group]");
    if (!a) return;
    this.setValue(a, "grantGroup.id", i.id), this.setValue(a, "grantGroup.label", i.label), this.setValue(a, "grantGroup.mode", i.mode), this.setValue(a, "grantGroup.pick", String(i.pick ?? 1));
    const o = a.querySelector(":scope > [data-grant-members]");
    for (const u of i.grants) {
      if ("mode" in u) {
        this.populateGrantGroup(e, o, u);
        continue;
      }
      const h = e.querySelector("template[data-template='grant-member']");
      if (!h || !o) continue;
      const p = h.content.cloneNode(!0), f = p.querySelector("[data-grant-member]");
      f && (this.setValue(f, "grant.type", u.type), this.setValue(f, "grant.ref", u.ref), this.setValue(f, "grant.overrideName", ((l = u.overrides) == null ? void 0 : l.name) ?? ""), this.setValue(f, "grant.overrideDescription", ((c = u.overrides) == null ? void 0 : c.description) ?? ""), this.setValue(f, "grant.overrideValue", ((d = u.overrides) == null ? void 0 : d.value) === void 0 ? "" : String(u.overrides.value)), o.append(p));
    }
    t.append(n);
  }
  input(e, t) {
    var i;
    return (((i = e.querySelector(`[name='${t}']`)) == null ? void 0 : i.value) ?? "").trim();
  }
  setValue(e, t, i) {
    const r = e.querySelector(`[name='${t}']`);
    r && (r.value = i);
  }
  setChecked(e, t, i) {
    const r = e.querySelector(`[name='${t}']`);
    r && (r.checked = i);
  }
  updateStackingWarnings(e) {
    if (!e) return;
    const t = [...e.querySelectorAll("[data-bonus-row]")], i = new Set(t.filter((r) => this.input(r, "bonus.modifierType") === "status").map((r) => this.input(r, "bonus.selector")).filter((r, n, a) => r && a.indexOf(r) !== n));
    for (const r of t) {
      const n = r.querySelector("[data-stacking-warning]");
      n && (n.hidden = !i.has(this.input(r, "bonus.selector")));
    }
  }
  text(e) {
    return String(e ?? "").trim();
  }
  optional(e) {
    return this.text(e) || void 0;
  }
  list(e) {
    return this.text(e).split(",").map((t) => t.trim()).filter(Boolean);
  }
  spells(e) {
    return Object.fromEntries(this.text(e).split(/[\n,]+/).map((t) => t.trim()).flatMap((t) => {
      const i = t.match(/^([1-9]|10)\s*=\s*(.+)$/);
      return i ? [[i[1], i[2].trim()]] : [];
    }));
  }
  formatSpells(e) {
    return Object.entries(e ?? {}).sort(([t], [i]) => Number(t) - Number(i)).map(([t, i]) => `${t}=${i}`).join(`
`);
  }
  visibility(e, t) {
    const i = String(e ?? "");
    return i === "public" || i === "selection" || i === "followers" || i === "owner" || i === "trusted" || i === "gm" || i === "hidden-until-selected" ? i : t;
  }
  status(e) {
    const t = String(e ?? "");
    return t === "test" || t === "published" || t === "disabled" || t === "archived" ? t : "draft";
  }
  replacementMode(e) {
    const t = String(e ?? "");
    return t === "replace" || t === "hide" ? t : "none";
  }
  modifierType(e) {
    return e === "item" || e === "circumstance" || e === "untyped" ? e : "status";
  }
  appliesTo(e) {
    return e === "dc" || e === "both" ? e : "checks";
  }
  resetType(e) {
    return e === "ten-minute-rest" || e === "refocus" || e === "encounter-end" || e === "scene-change" || e === "calendar-day" || e === "calendar-week" || e === "calendar-month" || e === "calendar-year" || e === "custom-rest" || e === "manual" || e === "daily" || e === "weekly" || e === "encounter" ? e : "daily-preparations";
  }
  actionCost(e) {
    return e === "automatic" || e === "free" || e === "reaction" || e === "exploration" || e === "downtime" || e === "custom" ? e : "actions";
  }
  cooldownUnit(e) {
    return e === "minutes" || e === "hours" || e === "days" ? e : "rounds";
  }
  durationUnit(e) {
    return e === "rounds" || e === "minutes" || e === "hours" || e === "encounter" || e === "scene" || e === "until-reset" ? e : "instant";
  }
}
m(B, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 }, position: { width: 780, height: "auto" } }), m(B, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class J extends R() {
  constructor(e, t, i) {
    super(), this.deity = e, this.deityService = t, this.adapters = i;
  }
  async _prepareContext() {
    return g(), { ui: D(), deity: { ...this.deity, image: F(this.deity.image) } };
  }
  _onRender() {
    var e, t;
    (t = (e = this.element) == null ? void 0 : e.querySelector("[data-action='edit']")) == null || t.addEventListener("click", () => {
      this.deityService && new B(this.deityService, (i) => {
        this.deity = i, this.render(!0);
      }, this.adapters, this.deity).render(!0);
    });
  }
}
m(J, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1200, height: 820 } }), m(J, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class Z extends R() {
  constructor(e, t) {
    super(), this.deities = e, this.adapters = t;
  }
  async _prepareContext() {
    var n, a, o;
    g();
    const e = ((a = (n = b()) == null ? void 0 : n.system) == null ? void 0 : a.id) ?? "", t = await (((o = this.adapters.tryGet(e)) == null ? void 0 : o.listOfficialDeities()) ?? Promise.resolve([])), i = this.deities.list(), r = t.map((l) => {
      const c = i.find((d) => d.replacement.sourceUuid === l.sourceUuid && d.replacement.mode !== "none");
      return { ...l, mappingMode: (c == null ? void 0 : c.replacement.mode) ?? "none", inheritedCount: Object.values((c == null ? void 0 : c.replacement.inherit) ?? {}).filter(Boolean).length, options: i.map((d) => ({ id: d.id, name: d.name, selected: d.id === (c == null ? void 0 : c.id) })) };
    });
    return { ui: D(), rows: r, systemId: e };
  }
  _onRender() {
    var t;
    g();
    const e = (t = this.element) == null ? void 0 : t.querySelector("form");
    e == null || e.querySelectorAll("[data-source-row]").forEach((i) => {
      const r = i.querySelector("[name='replacement.mode']");
      r && (r.value = i.dataset.mode ?? "none");
    }), e == null || e.addEventListener("submit", (i) => {
      var r, n;
      i.preventDefault(), g();
      for (const a of e.querySelectorAll("[data-source-row]")) {
        const o = a.dataset.sourceUuid ?? "", l = ((r = a.querySelector("[name='replacement.deity']")) == null ? void 0 : r.value) ?? "", c = ((n = a.querySelector("[name='replacement.mode']")) == null ? void 0 : n.value) ?? "none", d = c === "hide" || c === "replace" ? c : "none";
        for (const u of this.deities.list().filter((h) => h.replacement.sourceUuid === o && h.id !== l)) this.deities.update(u.id, { replacement: { sourceUuid: "", mode: "none", contexts: [] } });
        if (l) {
          const u = this.deities.get(l);
          this.deities.update(l, { replacement: { ...u == null ? void 0 : u.replacement, sourceUuid: o, mode: d, contexts: ["characterBuilder", "compendium", "actorSheet", "searches", "leveler"] } });
        }
      }
      this.render(!0);
    });
  }
}
m(Z, "DEFAULT_OPTIONS", { id: "darkis-godforge-replacements", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.REPLACEMENTS", resizable: !0 }, position: { width: 1100, height: 760 } }), m(Z, "PARTS", { main: { template: "modules/darkis-godforge/templates/replacement-manager.hbs" } });
class ee extends R() {
  constructor(t, i, r) {
    super();
    m(this, "pendingImport");
    m(this, "preview", null);
    m(this, "error", "");
    this.deities = t, this.api = i, this.randomContent = r;
  }
  async _prepareContext() {
    return g(), { ui: D(), preview: this.preview, error: this.error, deityCount: this.deities.list().length };
  }
  _onRender() {
    var i, r, n;
    g();
    const t = this.element;
    (i = t == null ? void 0 : t.querySelector("[data-action='export']")) == null || i.addEventListener("click", () => this.downloadExport()), (r = t == null ? void 0 : t.querySelector("[data-import-file]")) == null || r.addEventListener("change", (a) => {
      var o;
      return void this.previewFile((o = a.target.files) == null ? void 0 : o[0]);
    }), (n = t == null ? void 0 : t.querySelector("[data-action='apply-import']")) == null || n.addEventListener("click", () => {
      var a, o, l;
      if (g(), !!this.pendingImport) {
        try {
          const c = this.readRandomContent(this.pendingImport), d = this.api.importDeities(this.pendingImport);
          c && this.randomContent.replace(c), this.pendingImport = void 0, this.preview = null, this.error = "", (l = (o = (a = C()) == null ? void 0 : a.notifications) == null ? void 0 : o.info) == null || l.call(o, `${d} ${D().IMPORTED}`);
        } catch (c) {
          this.error = c instanceof Error ? c.message : String(c);
        }
        this.render(!0);
      }
    });
  }
  downloadExport() {
    g();
    const t = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot() }, null, 2), i = URL.createObjectURL(new Blob([t], { type: "application/json" })), r = document.createElement("a");
    r.href = i, r.download = `darkis-godforge-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, r.click(), URL.revokeObjectURL(i);
  }
  async previewFile(t) {
    var i, r;
    if (t) {
      try {
        const n = JSON.parse(await t.text()), a = Ne(n), o = new Set(this.deities.list().map((c) => c.id));
        this.pendingImport = n;
        const l = this.readRandomContent(n);
        this.preview = { total: a.length, created: a.filter((c) => !o.has(c.id)).length, updated: a.filter((c) => o.has(c.id)).length, tables: ((i = l == null ? void 0 : l.tables) == null ? void 0 : i.length) ?? 0, wheels: ((r = l == null ? void 0 : l.wheels) == null ? void 0 : r.length) ?? 0 }, this.error = "";
      } catch (n) {
        this.pendingImport = void 0, this.preview = null, this.error = n instanceof Error ? n.message : String(n);
      }
      this.render(!0);
    }
  }
  readRandomContent(t) {
    if (!t || typeof t != "object" || !("randomContent" in t)) return null;
    const i = t.randomContent;
    if (!Ce(i)) throw new Error("Invalid GodForge random content.");
    return i;
  }
}
m(ee, "DEFAULT_OPTIONS", { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: !0 }, position: { width: 900, height: 700 } }), m(ee, "PARTS", { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } });
class te extends R() {
  constructor(t) {
    super();
    m(this, "result", null);
    m(this, "error", "");
    this.randomContent = t;
  }
  async _prepareContext() {
    g();
    const t = this.randomContent.listTables();
    return { ui: D(), tables: t, wheels: this.randomContent.listWheels().map((i) => {
      var r;
      return { ...i, tableName: ((r = t.find((n) => n.id === i.tableId)) == null ? void 0 : r.name) ?? "—" };
    }), result: this.result, error: this.error };
  }
  _onRender() {
    var i, r, n;
    g();
    const t = this.element;
    (i = t == null ? void 0 : t.querySelector("[data-action='add-entry']")) == null || i.addEventListener("click", () => {
      const a = t.querySelector("[data-template='random-entry']"), o = t.querySelector("[data-entry-list]");
      a && o && o.append(a.content.cloneNode(!0));
    }), t == null || t.addEventListener("click", (a) => {
      var l;
      const o = a.target.closest("[data-action='remove-entry']");
      (l = o == null ? void 0 : o.closest("[data-entry-row]")) == null || l.remove();
    }), (r = t == null ? void 0 : t.querySelector("[data-table-form]")) == null || r.addEventListener("submit", (a) => {
      a.preventDefault(), this.createTable(a.currentTarget);
    }), (n = t == null ? void 0 : t.querySelector("[data-wheel-form]")) == null || n.addEventListener("submit", (a) => {
      a.preventDefault(), this.createWheel(a.currentTarget);
    }), t == null || t.querySelectorAll("[data-test-table]").forEach((a) => a.addEventListener("click", () => this.runAction(() => {
      const o = this.randomContent.drawTable(a.dataset.testTable ?? "", Math.random);
      this.result = o.entry;
    }))), t == null || t.querySelectorAll("[data-test-wheel]").forEach((a) => a.addEventListener("click", () => this.runAction(() => {
      const o = this.randomContent.spinWheel(a.dataset.testWheel ?? "", Math.random).draw;
      this.result = o.entry;
    })));
  }
  createTable(t) {
    g();
    const i = new FormData(t), r = [...t.querySelectorAll("[data-entry-row]")].flatMap((n) => {
      const a = this.input(n, "entry.label");
      return a ? [{ id: crypto.randomUUID(), label: a, weight: Math.max(0, Number(this.input(n, "entry.weight") || 1)), category: this.category(this.input(n, "entry.category")), description: this.input(n, "entry.description") || void 0, visibleToPlayers: !0 }] : [];
    });
    this.runAction(() => {
      this.randomContent.createTable({ name: String(i.get("table.name") ?? "").trim(), formula: String(i.get("table.formula") ?? "1d100").trim(), visibility: this.visibility(i.get("table.visibility")), entries: r });
    });
  }
  createWheel(t) {
    g();
    const i = new FormData(t);
    this.runAction(() => {
      this.randomContent.createWheel({ name: String(i.get("wheel.name") ?? "").trim(), tableId: String(i.get("wheel.tableId") ?? ""), visibility: this.visibility(i.get("wheel.visibility")), duration: Math.max(1, Number(i.get("wheel.duration") ?? 6)), minimumSpins: Math.max(1, Number(i.get("wheel.minimumSpins") ?? 5)) });
    });
  }
  input(t, i) {
    var r;
    return ((r = t.querySelector(`[name='${i}']`)) == null ? void 0 : r.value.trim()) ?? "";
  }
  visibility(t) {
    const i = String(t ?? "");
    return i === "gm" || i === "owner" || i === "followers" ? i : "public";
  }
  category(t) {
    return t === "positive" || t === "negative" || t === "catastrophic" || t === "jackpot" ? t : "neutral";
  }
  runAction(t) {
    try {
      t(), this.error = "", this.render(!0);
    } catch (i) {
      this.error = i instanceof Error ? i.message : String(i), W("Random content action failed.", i), this.render(!0);
    }
  }
}
m(te, "DEFAULT_OPTIONS", { id: "darkis-godforge-random-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.RANDOM_TABLES", resizable: !0 }, position: { width: 1100, height: 800 } }), m(te, "PARTS", { main: { template: "modules/darkis-godforge/templates/random-manager.hbs" } });
class ie extends R() {
  constructor(e, t) {
    super(), this.deities = e, this.api = t;
  }
  async _prepareContext() {
    var i, r;
    g();
    const e = (((r = (i = b()) == null ? void 0 : i.actors) == null ? void 0 : r.contents) ?? []).flatMap((n) => {
      var l, c;
      const a = n;
      if (a.type && a.type !== "character") return [];
      const o = (l = a.flags) == null ? void 0 : l["darkis-godforge"];
      return [{ id: a.id, name: a.name ?? a.id, deityName: ((c = this.deities.get((o == null ? void 0 : o.deityId) ?? "")) == null ? void 0 : c.name) ?? "—" }];
    }), t = this.deities.list().filter((n) => n.status !== "archived").map((n) => ({ id: n.id, name: n.name, choiceGroups: n.grantGroups.flatMap(Le) }));
    return { ui: D(), actors: e, deities: t };
  }
  _onRender() {
    var r;
    g();
    const e = this.element, t = e == null ? void 0 : e.querySelector("[name='deityId']"), i = () => e == null ? void 0 : e.querySelectorAll("[data-deity-choices]").forEach((n) => {
      n.hidden = n.dataset.deityChoices !== (t == null ? void 0 : t.value);
    });
    t == null || t.addEventListener("change", i), i(), (r = e == null ? void 0 : e.querySelector("form")) == null || r.addEventListener("submit", (n) => {
      var u, h;
      n.preventDefault();
      const a = n.currentTarget, o = new FormData(a), l = (h = (u = b()) == null ? void 0 : u.actors) == null ? void 0 : h.get(String(o.get("actorId") ?? "")), c = String(o.get("deityId") ?? "");
      if (!l || !c) return;
      const d = {};
      e.querySelectorAll(`[data-deity-choices='${ft(c)}'] input[data-group]:checked`).forEach((p) => {
        var f;
        (d[f = p.dataset.group ?? ""] ?? (d[f] = [])).push(p.value);
      }), this.api.assignDeity(l, c, d).then(() => this.render(!0)).catch((p) => W("Character assignment failed.", p));
    });
  }
}
m(ie, "DEFAULT_OPTIONS", { id: "darkis-godforge-character-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHARACTERS", resizable: !0 }, position: { width: 900, height: 700 } }), m(ie, "PARTS", { main: { template: "modules/darkis-godforge/templates/character-manager.hbs" } });
function Le(s) {
  const e = s.grants.flatMap((i) => "mode" in i ? Le(i) : []);
  if (s.mode !== "any") return e;
  const t = s.grants.map((i) => {
    var r;
    return "mode" in i ? { id: i.id, label: i.label || i.id } : { id: i.ref, label: ((r = i.overrides) == null ? void 0 : r.name) || i.ref };
  });
  return [{ id: s.id, label: s.label || s.id, pick: s.pick ?? 1, options: t }, ...e];
}
function ft(s) {
  return typeof CSS < "u" ? CSS.escape(s) : s.replace(/["'\\]/g, "\\$&");
}
class H extends R() {
  constructor(t, i = new ae(), r = new Ge(t, i), n = new ke()) {
    super();
    m(this, "searchTerm", "");
    m(this, "sectionFilter", "overview");
    m(this, "searchTimer", null);
    this.deityService = t, this.adapters = i, this.api = r, this.randomContent = n;
  }
  async _prepareContext() {
    var d, u, h, p, f, v, T, I;
    g();
    const t = D(), i = this.deityService.list().map((y) => {
      const E = mt(y).filter((w) => w.level === "error").length;
      return {
        ...y,
        image: F(y.image),
        errors: E,
        statusLabel: t[`STATUS_${y.status.toUpperCase()}`] ?? y.status,
        updatedLabel: Et(y.updatedAt)
      };
    }), r = this.searchTerm.toLocaleLowerCase(), n = i.filter((y) => this.matchesSection(y) && (!r || `${y.name} ${y.title} ${y.domains.join(" ")}`.toLocaleLowerCase().includes(r))), a = ((h = (u = (d = b()) == null ? void 0 : d.actors) == null ? void 0 : u.contents) == null ? void 0 : h.filter(gt).length) ?? 0, o = b(), l = ((f = (p = o == null ? void 0 : o.modules) == null ? void 0 : p.get("darkis-godforge")) == null ? void 0 : f.version) ?? "0.2.0", c = ((v = o == null ? void 0 : o.system) == null ? void 0 : v.id) ?? "—";
    return {
      ui: t,
      deities: n,
      hasAnyDeities: i.length > 0,
      searchTerm: this.searchTerm,
      nav: { [this.sectionFilter]: !0 },
      recent: [...i].sort((y, E) => E.updatedAt.localeCompare(y.updatedAt)).slice(0, 6),
      stats: {
        deities: i.length,
        pantheons: new Set(i.flatMap((y) => y.pantheonIds ?? [])).size,
        published: i.filter((y) => y.status === "published").length,
        bonuses: i.reduce((y, E) => y + E.passiveBonuses.length, 0),
        abilities: i.reduce((y, E) => y + E.abilities.length, 0),
        invalid: i.filter((y) => y.errors > 0).length,
        assignedActors: a
      },
      systemInfo: {
        foundry: (o == null ? void 0 : o.version) ?? "—",
        system: c,
        systemVersion: ((T = o == null ? void 0 : o.system) == null ? void 0 : T.version) ?? "—",
        moduleVersion: l,
        adapter: ((I = this.adapters.tryGet(c)) == null ? void 0 : I.id) ?? "—",
        schema: 2
      }
    };
  }
  _onRender() {
    var r, n, a;
    g();
    const t = this.element;
    if (!t) return;
    t.querySelectorAll("[data-action='create']").forEach((o) => o.addEventListener("click", () => new B(this.deityService, () => void this.render(!0), this.adapters).render(!0))), t.querySelectorAll("[data-action='codex']").forEach((o) => o.addEventListener("click", () => new L(this.deityService).render(!0))), t.querySelectorAll("[data-action='player-preview']").forEach((o) => o.addEventListener("click", () => new L(this.deityService, void 0, void 0, void 0, void 0, { isGM: !1, selection: !0 }).render(!0))), t.querySelectorAll("[data-section]").forEach((o) => o.addEventListener("click", () => {
      const l = o.dataset.section;
      (l === "overview" || l === "deities" || l === "pantheons" || l === "abilities" || l === "bonuses") && (this.sectionFilter = l, this.render(!0));
    })), (r = t.querySelector("[data-manager='replacements']")) == null || r.addEventListener("click", () => void new Z(this.deityService, this.adapters).render(!0)), t.querySelectorAll("[data-manager='data']").forEach((o) => o.addEventListener("click", () => void new ee(this.deityService, this.api, this.randomContent).render(!0))), t.querySelectorAll("[data-manager='random']").forEach((o) => o.addEventListener("click", () => void new te(this.randomContent).render(!0))), (n = t.querySelector("[data-manager='characters']")) == null || n.addEventListener("click", () => void new ie(this.deityService, this.api).render(!0)), (a = t.querySelector("[data-action='toggle-context']")) == null || a.addEventListener("click", () => {
      var o;
      return (o = t.querySelector(".dg-app-shell")) == null ? void 0 : o.classList.toggle("context-open");
    }), t.querySelectorAll("[data-scroll]").forEach((o) => o.addEventListener("click", () => {
      var l;
      return (l = t.querySelector(`[data-section-target='${o.dataset.scroll ?? ""}']`)) == null ? void 0 : l.scrollIntoView({ behavior: "smooth", block: "start" });
    })), t.querySelectorAll("[data-deity]").forEach((o) => o.addEventListener("click", () => {
      const l = this.deityService.get(o.dataset.deity ?? "");
      l && new J(l, this.deityService, this.adapters).render(!0);
    }));
    const i = t.querySelector("[data-search]");
    i && (i.value = this.searchTerm), i == null || i.addEventListener("input", () => {
      this.searchTerm = i.value, this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => void this.render(!0), 140);
    }), t.addEventListener("keydown", (o) => {
      (o.ctrlKey || o.metaKey) && o.key.toLocaleLowerCase() === "k" && (o.preventDefault(), i == null || i.focus(), i == null || i.select());
    });
  }
  matchesSection(t) {
    var i;
    return this.sectionFilter === "pantheons" ? !!((i = t.pantheonIds) != null && i.length) : this.sectionFilter === "abilities" ? t.abilities.length > 0 : this.sectionFilter === "bonuses" ? t.passiveBonuses.length > 0 : !0;
  }
}
m(H, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1440, height: 900 } }), m(H, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
function gt(s) {
  var t;
  const e = (t = s.flags) == null ? void 0 : t["darkis-godforge"];
  return !!(e && typeof e == "object" && "deityId" in e);
}
function Et(s) {
  const e = new Date(s);
  return Number.isNaN(e.getTime()) ? "—" : new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(e);
}
class se extends R() {
  constructor(e, t, i, r) {
    super(), this.actor = e, this.api = t, this.socketRouter = i, this.openCodex = r;
  }
  async _prepareContext() {
    const e = this.api.getCharacterWidgetData(this.actor);
    return { ui: D(), actorId: this.actor.id, ...e, deity: e.deity ? { ...e.deity, image: F(e.deity.image) } : null, abilities: e.abilities.map((t) => ({ ...t, remaining: t.uses ? Math.max(0, t.uses.max - t.uses.used) : null, available: !t.uses || t.uses.used < t.uses.max })) };
  }
  _onRender() {
    var t;
    const e = this.element;
    (t = e == null ? void 0 : e.querySelector("[data-action='codex']")) == null || t.addEventListener("click", this.openCodex), e == null || e.querySelectorAll("[data-ability]").forEach((i) => i.addEventListener("click", () => void this.socketRouter.activate({ actorId: this.actor.id, abilityId: i.dataset.ability ?? "", options: {} }).then(() => this.render(!0)).catch((r) => W("Ability activation failed.", r))));
  }
}
m(se, "DEFAULT_OPTIONS", { id: "darkis-godforge-hub", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.HUB", resizable: !0 }, position: { width: 520, height: 650 } }), m(se, "PARTS", { main: { template: "modules/darkis-godforge/templates/hub.hbs" } });
class yt {
  constructor() {
    m(this, "definitions", /* @__PURE__ */ new Map());
    m(this, "persistDefinition");
  }
  setPersistence(e) {
    this.persistDefinition = e;
  }
  list() {
    return [...this.definitions.values()];
  }
  get(e) {
    return this.definitions.get(e) ?? null;
  }
  save(e) {
    const t = _e(e).definition;
    return this.definitions.set(t.id, structuredClone(t)), this.persistDefinition && this.persistDefinition(structuredClone(t)).catch((i) => console.error("Darkis GodForge | Could not persist deity.", i)), t;
  }
  create(e) {
    const t = (/* @__PURE__ */ new Date()).toISOString(), i = { ...structuredClone(e), id: crypto.randomUUID(), schemaVersion: _, revision: 1, createdAt: t, updatedAt: t, checksum: "pending" };
    return i.checksum = this.checksum(i), this.save(i);
  }
  update(e, t) {
    const i = this.get(e);
    if (!i) throw new Error(`Unknown deity: ${e}`);
    const r = { ...i, ...structuredClone(t), id: e, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return r.checksum = this.checksum(r), this.save(r);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const t = JSON.stringify({ ...e, checksum: void 0 });
    let i = 2166136261;
    for (let r = 0; r < t.length; r += 1) i = Math.imul(i ^ t.charCodeAt(r), 16777619);
    return (i >>> 0).toString(16);
  }
}
const Y = "darkis-godforge";
class bt {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var i;
      const t = (i = e.flags) == null ? void 0 : i[Y];
      return t && typeof t == "object" && "deity" in t && he(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var o;
      const a = (o = n.flags) == null ? void 0 : o[Y];
      return a && typeof a == "object" && "deity" in a && he(a.deity) && a.deity.id === e.id;
    }), i = { [Y]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: i }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: i })).uuid : null;
  }
}
function It(s) {
  if (!s || typeof s != "object" || !("registerModule" in s)) return null;
  const t = s.registerModule("darkis-godforge");
  if (!t || typeof t != "object" || !("register" in t) || !("executeAsGM" in t)) return null;
  const i = t;
  return {
    register: (r, n) => i.register(r, async function(a) {
      var l;
      const o = (l = this.socketdata) == null ? void 0 : l.userId;
      if (!o) throw new Error("Socketlib did not provide an authenticated sender.");
      return n(a, o);
    }),
    executeAsGM: (r, n) => i.executeAsGM(r, n)
  };
}
function Ee(s, e, t) {
  var d;
  const i = s.actor;
  if (!i || !At(i) || !vt(i)) return;
  const r = St(e), n = (r == null ? void 0 : r.closest(".application, .window-app, .app")) ?? r, a = n == null ? void 0 : n.querySelector(".window-header");
  if (!a) return;
  (d = a.querySelector(".darkis-godforge-sheet-button")) == null || d.remove();
  const o = O("DARKIS_GODFORGE.UI.OPEN_HUB"), l = document.createElement("a");
  l.className = "darkis-godforge-sheet-button header-control", l.title = o, l.setAttribute("aria-label", o), l.setAttribute("role", "button"), l.innerHTML = '<i class="fas fa-hammer" aria-hidden="true"></i>', l.addEventListener("click", (u) => {
    u.preventDefault(), u.stopPropagation(), t(i);
  });
  const c = a.querySelector("button.close, a.close, .header-button.close, [data-action='close']");
  c ? c.before(l) : a.append(l);
}
function St(s) {
  var i;
  if (s instanceof HTMLElement) return s;
  const e = s, t = (e == null ? void 0 : e[0]) ?? ((i = e == null ? void 0 : e.get) == null ? void 0 : i.call(e, 0));
  return t instanceof HTMLElement ? t : null;
}
function At(s) {
  var t;
  const e = (t = s.flags) == null ? void 0 : t["darkis-godforge"];
  return !!(e && typeof e == "object" && "deityId" in e);
}
function vt(s) {
  var t, i;
  const e = (t = b()) == null ? void 0 : t.user;
  return (e == null ? void 0 : e.isGM) === !0 || ((i = s.testUserPermission) == null ? void 0 : i.call(s, e, "OWNER")) === !0;
}
const A = "darkis-godforge";
function wt(s, e, t) {
  return class extends H {
    constructor() {
      super(s, void 0, e, t);
    }
  };
}
function Tt(s, e, t, i, r = () => {
}) {
  if (!s || typeof s != "object" || Array.isArray(s)) return;
  const n = s, a = Math.max(-1, ...Object.values(n).map((o) => o.order ?? -1)) + 1;
  n[A] = {
    name: A,
    title: "DARKIS_GODFORGE.UI.TITLE",
    icon: "fas fa-hammer",
    order: a,
    visible: !0,
    tools: {
      hub: { name: "hub", title: "DARKIS_GODFORGE.UI.OPEN_HUB", icon: "fas fa-star", order: 0, button: !0, visible: !0, onChange: (o, l) => r() },
      codex: { name: "codex", title: "DARKIS_GODFORGE.UI.OPEN_CODEX", icon: "fas fa-book-open", order: 1, button: !0, visible: !0, onChange: (o, l) => t() },
      dashboard: { name: "dashboard", title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 2, button: !0, visible: i, onChange: (o, l) => e() }
    }
  };
}
function Dt(s, e, t, i, r, n, a) {
  const o = re();
  o && (o.Hooks.once("init", () => {
    var u, h;
    const l = ye("init");
    if (!l) return;
    be(l, s, t, i, a);
    const c = ((h = (u = l.modules) == null ? void 0 : u.get(A)) == null ? void 0 : h.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], d = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...c.map((p) => [p.lang, p.name])]);
    if (!l.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!l.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try {
        l.settings.registerMenu(A, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: wt(e, s, n), restricted: !0 });
      } catch (p) {
        console.error("Darkis GodForge | Could not register dashboard settings menu.", p);
      }
      try {
        l.settings.register(A, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: d, onChange: (p) => {
          if (typeof p != "string" || p === "auto") return;
          const f = c.find((v) => v.lang === p);
          f != null && f.path && me(p, `modules/${A}/${f.path}`);
        } });
      } catch (p) {
        console.error("Darkis GodForge | Could not register language setting.", p);
      }
      try {
        l.settings.register(A, "random-content", { scope: "world", config: !1, type: Object, default: { tables: [], wheels: [] } });
      } catch (p) {
        console.error("Darkis GodForge | Could not register random content storage.", p);
      }
    }
    if (!l.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try {
      l.keybindings.register(A, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
        var p, f;
        return ((f = (p = b()) == null ? void 0 : p.user) == null ? void 0 : f.isGM) !== !0 ? !1 : (t(), !0);
      } }), l.keybindings.register(A, "open-hub", { name: "DARKIS_GODFORGE.UI.OPEN_HUB", editable: [{ key: "KeyG" }], restricted: !1, onDown: () => (a == null || a(), !0) }), l.keybindings.register(A, "open-codex", { name: "DARKIS_GODFORGE.UI.OPEN_CODEX", editable: [{ key: "KeyG", modifiers: ["Shift"] }], restricted: !1, onDown: () => (i(), !0) });
    } catch (p) {
      console.error("Darkis GodForge | Could not register keybindings.", p);
    }
  }), o.Hooks.on("getSceneControlButtons", (...l) => {
    var c, d;
    Tt(l[0], t, i, ((d = (c = b()) == null ? void 0 : c.user) == null ? void 0 : d.isGM) === !0, () => a == null ? void 0 : a());
  }), o.Hooks.on("renderCharacterSheetPF2e", (l, c) => {
    a && Ee(l, c, a);
  }), o.Hooks.on("renderActorSheet", (l, c) => {
    a && Ee(l, c, a);
  }), o.Hooks.once("ready", async () => {
    var c, d, u, h, p, f, v, T, I, y;
    const l = ye("ready");
    if (l) {
      be(l, s, t, i, a);
      try {
        const E = (d = (c = l.settings) == null ? void 0 : c.get) == null ? void 0 : d.call(c, A, "language"), w = (p = (h = (u = l.modules) == null ? void 0 : u.get(A)) == null ? void 0 : h.languages) == null ? void 0 : p.find((Pe) => Pe.lang === E);
        typeof E == "string" && (w != null && w.path) && await me(E, `modules/${A}/${w.path}`);
      } catch (E) {
        console.error("Darkis GodForge | Could not load the selected language.", E);
      }
      try {
        if (l.journal) {
          const E = new bt(l.journal);
          for (const w of E.load()) e.save(w);
          e.setPersistence((w) => E.save(w));
        }
      } catch (E) {
        console.error("Darkis GodForge | Could not load deity journals.", E);
      }
      try {
        if (n) {
          const E = (v = (f = l.settings) == null ? void 0 : f.get) == null ? void 0 : v.call(f, A, "random-content");
          n.load(E && typeof E == "object" ? E : null), (T = l.settings) != null && T.set && n.setPersistence((w) => l.settings.set(A, "random-content", w));
        }
      } catch (E) {
        console.error("Darkis GodForge | Could not load random content.", E);
      }
      try {
        const E = It((y = (I = l.modules) == null ? void 0 : I.get("socketlib")) == null ? void 0 : y.api);
        E && r && (r.setTransport(E), r.register());
      } catch (E) {
        console.error("Darkis GodForge | Could not initialize socketlib integration.", E);
      }
    }
  }));
}
function ye(s) {
  const e = b();
  return e || console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${s}.`), e ?? null;
}
function be(s, e, t, i, r) {
  var o;
  const n = (o = s.modules) == null ? void 0 : o.get(A);
  if (!n) {
    console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed.");
    return;
  }
  const a = e;
  a.openDashboard = () => {
    g(), t();
  }, a.openCodex = i, r && (a.openHub = r), n.api = a;
}
class Ot {
  constructor(e, t, i) {
    m(this, "activations", /* @__PURE__ */ new Map());
    this.api = e, this.authority = t, this.transport = i;
  }
  setTransport(e) {
    this.transport = e;
  }
  register() {
    var e, t;
    (e = this.transport) == null || e.register("activateAbility", async (i, r) => this.handleActivation(this.parseRequest(i, r), !1)), (t = this.transport) == null || t.register("assignDeity", async (i, r) => this.handleAssignment(this.parseAssignment(i, r), !1));
  }
  async activate(e) {
    const t = { ...e, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.updateStatus(t.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) throw new Error("GM authority is unavailable.");
      await this.transport.executeAsGM("activateAbility", t);
      return;
    }
    await this.handleActivation(t, !0);
  }
  async assign(e) {
    const t = { ...e, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.updateStatus(t.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) throw new Error("GM authority is unavailable.");
      await this.transport.executeAsGM("assignDeity", t);
      return;
    }
    await this.handleAssignment(t, !0);
  }
  status(e) {
    return this.activations.get(e) ?? null;
  }
  async handleActivation(e, t) {
    if (this.activations.has(e.activationId) && this.activations.get(e.activationId) !== "requested") throw new Error("Activation request has already been processed.");
    this.updateStatus(e.activationId, "requested");
    const i = this.authority.resolveActor(e.actorId);
    if (!i)
      throw this.updateStatus(e.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.isAuthorizedRequester(i, e.userId, t))
      throw this.updateStatus(e.activationId, "aborted"), new Error("User is not allowed to modify this actor.");
    this.updateStatus(e.activationId, "validated"), this.updateStatus(e.activationId, "running");
    try {
      await this.api.activateAbility(i, e.abilityId, e.options), this.updateStatus(e.activationId, "completed");
    } catch (r) {
      throw this.updateStatus(e.activationId, "aborted"), r;
    }
  }
  async handleAssignment(e, t) {
    if (this.activations.has(e.activationId) && this.activations.get(e.activationId) !== "requested") throw new Error("Assignment request has already been processed.");
    this.updateStatus(e.activationId, "requested");
    const i = this.authority.resolveActor(e.actorId);
    if (!i)
      throw this.updateStatus(e.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.isAuthorizedRequester(i, e.userId, t))
      throw this.updateStatus(e.activationId, "aborted"), new Error("User is not allowed to modify this actor.");
    if (!t && !this.api.isDeitySelectableByPlayer(e.deityId))
      throw this.updateStatus(e.activationId, "aborted"), new Error("Deity is not available for player selection.");
    this.updateStatus(e.activationId, "validated"), this.updateStatus(e.activationId, "running");
    try {
      await this.api.assignDeity(i, e.deityId, e.choices), this.updateStatus(e.activationId, "completed");
    } catch (r) {
      throw this.updateStatus(e.activationId, "aborted"), r;
    }
  }
  isAuthorizedRequester(e, t, i) {
    return i ? this.authority.isGM && t === this.authority.currentUserId : this.authority.isGMUser(t) ? !1 : this.authority.ownsActor(e, t);
  }
  parseRequest(e, t) {
    if (!e || typeof e != "object" || !this.validId(t)) throw new Error("Invalid socket request.");
    const i = e;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validId(i.abilityId)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: t, abilityId: i.abilityId, options: {} };
  }
  parseAssignment(e, t) {
    if (!e || typeof e != "object" || !this.validId(t)) throw new Error("Invalid socket request.");
    const i = e;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validId(i.deityId)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: t, deityId: i.deityId, choices: this.parseChoices(i.choices) };
  }
  parseChoices(e) {
    if (e === void 0) return {};
    if (!e || typeof e != "object" || Array.isArray(e)) throw new Error("Invalid socket request.");
    const t = Object.entries(e);
    if (t.length > 50) throw new Error("Invalid socket request.");
    const i = {};
    for (const [r, n] of t) {
      if (!this.validId(r) || !Array.isArray(n) || n.length > 50 || n.some((a) => !this.validId(a))) throw new Error("Invalid socket request.");
      i[r] = [...new Set(n)];
    }
    return i;
  }
  validId(e) {
    return typeof e == "string" && e.length > 0 && e.length <= 256;
  }
  updateStatus(e, t) {
    if (!this.activations.has(e) && this.activations.size >= 1e3) {
      const i = this.activations.keys().next().value;
      i && this.activations.delete(i);
    }
    this.activations.set(e, t);
  }
}
const j = new yt(), de = new ae(), P = new Ge(j, de), Ue = new ke();
let Ie = null;
function Se() {
  g(), Ie ?? (Ie = new H(j, de, P, Ue)), Ie.render(!0).catch((s) => {
    var e, t, i;
    console.error("Darkis GodForge | Could not open dashboard.", s), (i = (t = (e = C()) == null ? void 0 : e.notifications) == null ? void 0 : t.error) == null || i.call(t, O("DARKIS_GODFORGE.ERROR.DASHBOARD_OPEN"));
  });
}
function Me() {
  new L(j, void 0, P, ue, Fe()).render(!0).catch((e) => {
    var t, i, r;
    console.error("Darkis GodForge | Could not open codex.", e), (r = (i = (t = C()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, O("DARKIS_GODFORGE.ERROR.CODEX_OPEN"));
  });
}
const Ae = /* @__PURE__ */ new Map();
function Rt(s) {
  var i, r, n;
  const e = s ?? Fe();
  if (!e) {
    (n = (r = (i = C()) == null ? void 0 : i.notifications) == null ? void 0 : r.warn) == null || n.call(r, O("DARKIS_GODFORGE.UI.SELECT_CHARACTER_FIRST"));
    return;
  }
  let t = Ae.get(e.id);
  t || (t = new se(e, P, ue, Me), Ae.set(e.id, t)), t.render(!0).catch((a) => {
    var o, l, c;
    console.error("Darkis GodForge | Could not open hub.", a), (c = (l = (o = C()) == null ? void 0 : o.notifications) == null ? void 0 : l.error) == null || c.call(l, O("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
const ve = re(), ue = new Ot(P, { get currentUserId() {
  var s, e;
  return ((e = (s = b()) == null ? void 0 : s.user) == null ? void 0 : e.id) ?? "unknown";
}, get isGM() {
  var s, e;
  return ((e = (s = b()) == null ? void 0 : s.user) == null ? void 0 : e.isGM) ?? !1;
}, isGMUser: (s) => {
  var e, t, i;
  return ((i = (t = (e = b()) == null ? void 0 : e.users) == null ? void 0 : t.get(s)) == null ? void 0 : i.isGM) === !0;
}, ownsActor: (s, e) => {
  var i, r, n;
  const t = ((r = (i = b()) == null ? void 0 : i.users) == null ? void 0 : r.get(e)) ?? { id: e };
  return ((n = s.testUserPermission) == null ? void 0 : n.call(s, t, "OWNER")) ?? !1;
}, resolveActor: (s) => {
  var e, t;
  return ((t = (e = b()) == null ? void 0 : e.actors) == null ? void 0 : t.get(s)) ?? null;
} });
ve ? (Dt(P, j, Se, Me, ue, Ue, Rt), ve.Hooks.once("ready", () => {
  var e, t, i, r, n;
  const s = (t = (e = b()) == null ? void 0 : e.system) == null ? void 0 : t.id;
  s && !de.supports(s) && ((n = (r = (i = C()) == null ? void 0 : i.notifications) == null ? void 0 : r.warn) == null || n.call(r, O("DARKIS_GODFORGE.ERROR.UNSUPPORTED_SYSTEM").replace("{system}", s)));
})) : typeof document < "u" && Se();
function Fe() {
  var t, i, r, n;
  const s = globalThis.canvas, e = ((i = (t = s == null ? void 0 : s.tokens) == null ? void 0 : t.controlled) == null ? void 0 : i.map((a) => a.actor).filter((a) => !!a)) ?? [];
  return e.length === 1 ? e[0] : (n = (r = b()) == null ? void 0 : r.user) == null ? void 0 : n.character;
}
export {
  H as GodForgeDashboard,
  P as api,
  j as deityService,
  Ue as randomContentService,
  de as registry,
  ue as socketRouter
};
