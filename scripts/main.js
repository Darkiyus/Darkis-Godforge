var We = Object.defineProperty;
var je = (s, e, t) => e in s ? We(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var f = (s, e, t) => je(s, typeof e != "symbol" ? e + "" : e, t);
function Ne(s, e) {
  return {
    name: s.name,
    type: "deity",
    img: s.image,
    system: {
      category: "deity",
      description: { value: s.description },
      sanctification: Ye(s.sanctification),
      domains: { primary: [...s.domains], alternate: [...s.alternateDomains ?? []] },
      font: $e(s.font),
      attribute: [...s.divineAttributes ?? []],
      skill: s.skill ? [s.skill] : null,
      weapons: s.favoredWeapon ? [s.favoredWeapon] : [],
      spells: structuredClone(s.spells ?? {}),
      traits: { otherTags: [] }
    },
    flags: { "darkis-godforge": { definitionUuid: e } }
  };
}
function $e(s) {
  const e = (s == null ? void 0 : s.split(",").map((t) => t.trim().toLocaleLowerCase()).filter((t) => t === "harm" || t === "heal")) ?? [];
  return [...new Set(e)];
}
function Ye(s) {
  const e = (s == null ? void 0 : s.split(",").map((t) => t.trim().toLocaleLowerCase()).filter((t) => t === "holy" || t === "unholy")) ?? [];
  return e.length ? { modal: "can", what: [...new Set(e)] } : null;
}
function oe() {
  const s = globalThis, e = typeof Hooks < "u" ? Hooks : s.Hooks;
  return e ? { Hooks: e } : null;
}
function b() {
  const s = globalThis;
  return typeof game < "u" ? game : s.game;
}
function O() {
  const s = globalThis;
  return typeof ui < "u" ? ui : s.ui;
}
function Ee(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
async function le(s) {
  var r, n, a, c, o, l, d, u;
  const t = (((n = (r = b()) == null ? void 0 : r.packs) == null ? void 0 : n.contents) ?? []).filter((p) => {
    var h;
    return p.documentName === "Item" && (!((h = p.metadata) != null && h.system) || p.metadata.system === s);
  }), i = [];
  for (const p of t) {
    const h = await p.getIndex({ fields: ["type", "img", "system.domains", "system.alignment"] });
    for (const m of h) {
      if (m.type !== "deity" || !m._id || !m.name || !p.collection) continue;
      const A = `Compendium.${p.collection}.Item.${m._id}`, I = Array.isArray((a = m.system) == null ? void 0 : a.domains) ? m.system.domains : [...((o = (c = m.system) == null ? void 0 : c.domains) == null ? void 0 : o.primary) ?? [], ...((d = (l = m.system) == null ? void 0 : l.domains) == null ? void 0 : d.alternate) ?? []];
      i.push({ id: A, sourceUuid: A, official: !0, name: m.name, title: m.name, image: m.img, domains: I, alignment: (u = m.system) == null ? void 0 : u.alignment });
    }
  }
  return i;
}
function ze(s) {
  if (s.classId !== "cleric" && s.classId !== "champion") return null;
  const e = s.systemValues;
  return { classId: s.classId, deityId: s.deityId, grants: s.grants, domains: { available: e.domains, alternate: e.alternateDomains, pick: s.classId === "cleric" ? 1 : 0 }, divineAttributes: e.divineAttributes, grantedSpells: e.spells, divineFont: s.classId === "cleric" ? e.font : void 0, favoredWeapon: e.favoredWeapon, trainedSkill: s.classId === "cleric" ? e.skill : void 0, sanctification: e.sanctification, cause: s.classId === "champion" ? e.cause : void 0 };
}
class Ke {
  constructor() {
    f(this, "id", "pf2e");
    f(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery", "perception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(Ne(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return le(this.id);
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
    return ze(e);
  }
}
class Xe {
  constructor() {
    f(this, "id", "sfrpg");
    f(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return null;
  }
  async listOfficialDeities() {
    return le(this.id);
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
class Qe {
  constructor() {
    f(this, "id", "sf2e");
    f(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(Ne(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return le(this.id);
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
class ce {
  constructor() {
    f(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new Ke()), this.register(new Qe()), this.register(new Xe());
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
function T(s, e, t) {
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
  return e.isGM ? !0 : s.status === "published" && T(s.visibility.deity, s.id, e);
}
function F(s, e) {
  if (!U(s, e)) return null;
  const t = s.visibility.fields, i = { id: s.id, name: s.name, title: s.title };
  return T(t.portrait, s.id, e) && (i.image = s.image), T(t.description, s.id, e) && (i.description = s.description), T(t.quote, s.id, e) && (i.quote = s.quote), T(t.pantheon, s.id, e) && (i.pantheonIds = structuredClone(s.pantheonIds ?? [])), T(t.domains, s.id, e) && (i.domains = structuredClone(s.domains), i.alternateDomains = structuredClone(s.alternateDomains ?? [])), T(t.spells, s.id, e) && (i.spells = structuredClone(s.spells ?? {})), T(t.favoredWeapon, s.id, e) && (i.favoredWeapon = s.favoredWeapon), T(t.edicts, s.id, e) && (i.edicts = structuredClone(s.edicts ?? [])), T(t.anathema, s.id, e) && (i.anathema = structuredClone(s.anathema ?? [])), T(t.bonuses, s.id, e) && (i.passiveBonuses = s.passiveBonuses.filter((r) => r.enabled !== !1 && T(r.visibility ?? "followers", s.id, e)).map((r) => Je(r, T(t.numericValues, s.id, e)))), T(t.abilities, s.id, e) && (i.abilities = s.abilities.filter((r) => r.enabled !== !1 && T(r.visibility ?? "followers", s.id, e)).map((r) => Ze(r, T(t.numericValues, s.id, e)))), i;
}
function Je(s, e) {
  const t = structuredClone(s);
  return e || (t.value = ""), delete t.visible, t;
}
function Ze(s, e) {
  const t = structuredClone(s);
  return e || (t.effects = t.effects.filter((i) => i.type === "message"), delete t.timing, delete t.uses, delete t.duration, delete t.actionCost), delete t.condition, t;
}
function et(s) {
  return { id: s.id, name: s.name, title: s.title, image: s.image, domains: s.domains, alignment: s.alignment };
}
function tt(s, e, t, i = { isGM: !0 }) {
  return s.filter((r) => !t.has(r.id) && U(r, i) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).flatMap((r) => {
    if (i.isGM) return [et(r)];
    const n = F(r, i);
    return n ? [{ id: n.id, name: n.name, title: n.title ?? "", image: n.image, domains: n.domains ?? [] }] : [];
  });
}
function x(s, e) {
  var n;
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (s.mode === "all") return s.grants.flatMap((a) => "mode" in a ? x(a, t) : [a.ref]);
  const i = ((n = t.find((a) => a.groupId === s.id)) == null ? void 0 : n.refs) ?? [], r = s.grants.map((a) => "mode" in a ? a.id : a.ref);
  if (!s.pick || i.length !== s.pick || i.some((a) => !r.includes(a))) throw new Error(`Grant group ${s.id} requires ${s.pick ?? 1} valid choice(s).`);
  return i.flatMap((a) => {
    const c = s.grants.find((o) => ("mode" in o ? o.id : o.ref) === a);
    return c && "mode" in c ? x(c, t) : c ? [c.ref] : [];
  });
}
function Ce(s, e) {
  return s.used < s.max;
}
function it(s, e) {
  if (!Ce(s)) throw new Error("No uses remaining.");
  return { ...s, used: s.used + 1 };
}
function st(s, e) {
  return { ...s, used: 0, lastResetAt: e };
}
const rt = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, nt = /^\d+d\d+(?:[+\-]\d+)?$/, at = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function ke(s) {
  const e = s.replace(/\s/g, ""), t = e.match(rt);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function de(s) {
  const e = s.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], i = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((r) => !/^\d+d\d+$/.test(r))) return !1;
  try {
    return new Le(ke(i), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function X(s, e) {
  const t = s.replace(/\s/g, "");
  if (!de(t)) throw new Error("Formula contains an unsupported term.");
  if (nt.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new Le(ke(t), e).parse();
}
async function ot(s, e, t) {
  if (!de(s)) throw new Error("Formula contains an unsupported term.");
  const i = s.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let r = s;
  for (const n of [...new Set(i)]) {
    const a = await t(n);
    if (!Number.isFinite(a)) throw new Error("Dice result is not a finite number.");
    r = r.replace(new RegExp(`\\b${n}\\b`, "g"), String(a));
  }
  return X(r, e);
}
class Le {
  constructor(e, t) {
    f(this, "position", 0);
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
    if (at.has(e)) return this.call(e);
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
function H(s, e) {
  if (s.type === "fact") return e[s.key] === s.equals;
  if (s.type === "not") return !H(s.child, e);
  const t = s.children.map((i) => H(i, e));
  return s.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function lt(s, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (s.condition && !H(s.condition, e.conditionFacts ?? {})) return t;
  for (const i of s.effects) await Ge(i, e, t);
  return t;
}
async function Ge(s, e, t) {
  if (s.type === "message") {
    t.messages.push(s.text);
    return;
  }
  if (s.type === "branch") {
    const r = H(s.condition, e.conditionFacts ?? {}) ? s.then : s.otherwise ?? [];
    for (const n of r) await Ge(n, e, t);
    return;
  }
  if (s.type === "heal" || s.type === "damage") {
    const r = s.target === "target" ? e.target : e.actor;
    if (!r) throw new Error("This ability requires a valid target.");
    const n = /\b\d+d\d+\b/.test(s.formula) ? e.rollDice ? await ot(s.formula, e.facts, e.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : X(s.formula, e.facts);
    s.type === "heal" ? (t.healing += n, r.hp !== void 0 && (r.hp = Math.min(r.maxHp ?? Number.MAX_SAFE_INTEGER, r.hp + n))) : (t.damage += n, r.hp !== void 0 && (r.hp = Math.max(0, r.hp - n)));
    return;
  }
  if (s.type === "modifier") {
    const r = typeof s.value == "number" ? s.value : X(s.value, e.facts);
    e.actor.modifiers[s.selector] = r, t.appliedModifiers.push(s.selector);
    return;
  }
  if (s.type !== "condition") return;
  const i = s.target === "target" ? e.target : e.actor;
  if (!i) throw new Error("This ability requires a valid target.");
  i.conditions.push(s.condition), t.appliedConditions.push(s.condition);
}
function ct(s, e, t = []) {
  if (!e.trim()) throw new Error("Class identifier is required for deity coupling.");
  const i = s.grantGroups.flatMap((r) => x(r, t));
  return { deityId: s.id, classId: e, grants: i, choices: t, systemValues: { domains: s.domains, alternateDomains: s.alternateDomains ?? [], divineAttributes: s.divineAttributes ?? [], spells: s.spells ?? {}, font: s.font, favoredWeapon: s.favoredWeapon, skill: s.skill, sanctification: s.sanctification, cause: s.cause } };
}
function z(s, e) {
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
function Pe(s) {
  if (!s || typeof s != "object") throw new Error("Invalid deity definition.");
  const e = structuredClone(s), t = typeof e.schemaVersion == "number" ? e.schemaVersion : 0;
  if (t > _) throw new Error(`Unsupported deity schema ${t}.`);
  const i = [], r = e.visibility && typeof e.visibility == "object" ? e.visibility : {}, n = dt(r), a = ut(e.status, r.players), c = {
    ...e,
    schemaVersion: _,
    revision: Math.max(1, typeof e.revision == "number" ? e.revision : 0) + (t < _ ? 1 : 0),
    createdAt: typeof e.createdAt == "string" ? e.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: t < _ ? (/* @__PURE__ */ new Date()).toISOString() : String(e.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()),
    checksum: typeof e.checksum == "string" ? e.checksum : "pending",
    status: a,
    visibility: n,
    passiveBonuses: Array.isArray(e.passiveBonuses) ? e.passiveBonuses.map(ht) : [],
    abilities: Array.isArray(e.abilities) ? e.abilities.map(pt) : [],
    grantGroups: Array.isArray(e.grantGroups) ? e.grantGroups : [],
    replacement: e.replacement && typeof e.replacement == "object" ? e.replacement : { sourceUuid: "", mode: "none", contexts: [] },
    domains: Array.isArray(e.domains) ? e.domains : []
  };
  return t < _ && i.push(`Legacy definition migrated to schema version ${_}.`), { definition: c, migrated: t < _, warnings: i };
}
function dt(s) {
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
function ut(s, e) {
  return s === "draft" || s === "test" || s === "published" || s === "disabled" || s === "archived" ? s : e === !1 ? "draft" : "published";
}
function ht(s) {
  if (!s || typeof s != "object") return s;
  const e = s;
  return { ...e, enabled: e.enabled !== !1, visibility: q(e.visibility, e.visible === !1 ? "gm" : "followers") };
}
function pt(s) {
  if (!s || typeof s != "object") return s;
  const e = s;
  return { ...e, enabled: e.enabled !== !1, visibility: q(e.visibility, "followers") };
}
function q(s, e) {
  return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "trusted" || s === "gm" || s === "hidden-until-selected" ? s : e;
}
function mt(s, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 2, exportedAt: e, deities: structuredClone(s) };
}
function ft(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion >= 1 && e.schemaVersion <= 2 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function Me(s) {
  if (!ft(s)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return s.deities.map((e) => Pe(e).definition);
}
function ue(s, e) {
  const t = s.filter((c) => Number.isFinite(c.weight) && c.weight > 0), i = t.reduce((c, o) => c + o.weight, 0);
  if (!t.length || i <= 0) throw new Error("Random table has no selectable entries.");
  const r = Math.min(Math.max(e(), 0), 0.999999999) * i;
  let n = 0;
  for (const [c, o] of t.entries())
    if (n += o.weight, r < n) return { entry: o, index: c, roll: r };
  return { entry: t[t.length - 1], index: t.length - 1, roll: r };
}
function gt(s, e) {
  return { status: "resolved", draw: ue(s, e) };
}
function Ue(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  if (e.tables !== void 0 && !Array.isArray(e.tables) || e.wheels !== void 0 && !Array.isArray(e.wheels)) return !1;
  const t = e.tables ?? [], i = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!Q(n) || !N(n.id) || i.has(n.id) || !N(n.name) || !N(n.formula) || !ye(n.visibility) || !Array.isArray(n.entries) || !n.entries.length || !n.entries.every(Et)) return !1;
    i.add(n.id);
  }
  const r = /* @__PURE__ */ new Set();
  for (const n of e.wheels ?? []) {
    if (!Q(n) || !N(n.id) || r.has(n.id) || !N(n.name) || !N(n.tableId) || !i.has(n.tableId) || !ye(n.visibility) || !J(n.duration) || !J(n.minimumSpins)) return !1;
    r.add(n.id);
  }
  return !0;
}
class Fe {
  constructor() {
    f(this, "tables", /* @__PURE__ */ new Map());
    f(this, "wheels", /* @__PURE__ */ new Map());
    f(this, "persistContent");
  }
  setPersistence(e) {
    this.persistContent = e;
  }
  load(e) {
    const t = e ?? {};
    if (!Ue(t)) throw new Error("Invalid GodForge random content.");
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
    return ue(i.entries, t);
  }
  spinWheel(e, t) {
    var r;
    const i = this.wheels.get(e);
    if (!i) throw new Error("Fortune wheel was not found.");
    return gt(((r = this.tables.get(i.tableId)) == null ? void 0 : r.entries) ?? [], t);
  }
  persist() {
    this.persistContent && this.persistContent(this.snapshot()).catch((e) => console.error("Darkis GodForge | Could not persist random content.", e));
  }
}
function Q(s) {
  return !!s && typeof s == "object";
}
function N(s) {
  return typeof s == "string" && s.trim().length > 0 && s.length <= 1e4;
}
function J(s) {
  return typeof s == "number" && Number.isFinite(s) && s > 0;
}
function ye(s) {
  return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "gm" || s === "hidden-until-selected";
}
function Et(s) {
  return !Q(s) || !N(s.id) || !N(s.label) || !J(s.weight) || s.description !== void 0 && typeof s.description != "string" ? !1 : s.category === void 0 || s.category === "positive" || s.category === "neutral" || s.category === "negative" || s.category === "catastrophic" || s.category === "jackpot";
}
const yt = /* @__PURE__ */ JSON.parse(`{"UI":{"TITLE":"Darkis GodForge","TAGLINE":"Custom deities","SUBTITLE":"Create, publish, and connect them directly to characters.","CREATE":"New deity","EDIT":"Edit","EDIT_DEITY":"Edit deity","CODEX":"Divine Codex","HUB":"GodForge Hub","ACTIVE_GRANTS":"Active grants","ACTIVATE":"Activate","NO_WONDERS":"This deity grants no activatable wonders.","NO_ASSIGNED_DEITY":"No deity assigned","NO_ASSIGNED_DEITY_HINT":"Choose a deity in the Divine Codex or ask the GM to assign one to this character.","YOUR_DEITY":"Your deity","SELECT_DEITY":"Choose as deity","CHOOSE_AND_SELECT":"Choose options and assign","CHOOSE_GRANTS":"Choose grants","CHOOSE_GRANTS_HINT":"Select the required options for this deity.","PICK_EXACTLY":"Choose exactly {count} option(s).","ASSIGNMENT_FAILED":"The deity could not be assigned.","SELECTION_REQUIRES_GM":"This deity requires grant choices first.","OPEN_CODEX":"Open Divine Codex","OPEN_HUB":"Open GodForge Hub","SELECT_CHARACTER_FIRST":"Select or assign a character before opening GodForge Hub.","MY_DEITIES":"My deities","ENTRIES":"entries","DOMAINS":"Domains","ABILITIES":"Abilities","VISIBILITY":"Visibility","PASSIVE_BONUS":"Passive bonus","PASSIVE_BONUSES":"Passive bonuses","DIVINE_ABILITY":"Divine ability","DIVINE_WONDER":"Divine wonder","DIVINE_WONDERS":"Divine wonders","SEARCH":"Search GodForge …","ALL_DOMAINS":"All domains","NO_RESULTS":"No deities found.","NEW_DEITY":"Create a new deity","NEW_DEITY_HINT":"Define identity, rules, wonders, and visibility.","NAME":"Name","TITLE_FIELD":"Title","DESCRIPTION":"Description","ALIGNMENT":"Alignment","SAVE":"Save deity","CANCEL":"Cancel","OPEN_DASHBOARD":"Open GodForge dashboard","NEW_DEITY_PLACEHOLDER":"e.g. Tenebris","TITLE_PLACEHOLDER":"e.g. Goddess of Shadows","DOMAINS_PLACEHOLDER":"Shadows, secrets, deception","QUOTE":"Quote","PORTRAIT":"Portrait","ICON":"Icon","SYMBOL":"Cult symbol","BANNER":"Banner","BROWSE_FILES":"Browse Foundry files","FILE_PATH":"Foundry file path","PANTHEONS":"Pantheons","TAGS":"Tags","FAVORED_WEAPON":"Favored weapon","DIVINE_FONT":"Divine font","TRAINED_SKILL":"Divine skill","SANCTIFICATION":"Sanctification","CHAMPION_CAUSE":"Champion cause","EDICTS":"Edicts","ANATHEMA":"Anathema","COMMA_SEPARATED":"Comma-separated","STATUS":"Publication status","STATUS_DRAFT":"Draft","STATUS_TEST":"Test","STATUS_PUBLISHED":"Published","STATUS_DISABLED":"Disabled","STATUS_ARCHIVED":"Archived","BASIC_DATA":"Basic data","EDITOR_STEPS":"Deity editor steps","REQUIRED_FIELDS":"Required fields","WIZARD_INTRO":"The wizard guides you step by step through creating a game-ready deity.","APPEARANCE":"Appearance","SYSTEM_VALUES":"System values","PREVIEW":"Preview","STEP_BASIC_INTRO":"Give your deity a clear identity. Everything except the name can be added later.","ONLY_NAME_REQUIRED":"Only the name is required","HELP_NAME":"The unique name used for this deity in the codex.","HELP_TITLE":"A short epithet such as “The Faith” or “Lady of Stars”.","HELP_DESCRIPTION":"Summarize the deity's nature, faith, and presence for players.","HELP_QUOTE":"A characteristic saying or guiding phrase.","HELP_PANTHEONS":"Optional pantheons, separated by commas.","HELP_TAGS":"Internal search terms, separated by commas.","STEP_APPEARANCE_INTRO":"Choose how the deity appears on cards, in the codex, and in selection dialogs.","OPTIONAL_STEP_HINT":"All images are optional. Paste Foundry paths, browse for files, or drag files onto the fields.","HELP_PORTRAIT":"Large image for detail views and the Divine Codex.","HELP_ICON":"Small, readable image for lists and buttons.","HELP_SYMBOL":"The cult's sign, seal, or holy symbol.","HELP_BANNER":"Wide background image for presentation areas.","STEP_SYSTEM_INTRO":"Enter the rules Pathfinder 2e or Starfinder 2e needs for this deity.","HELP_DOMAINS":"Thematic domains, separated by commas.","HELP_WEAPON":"The favored weapon of the deity's followers.","HELP_SKILL":"The skill granted by the deity, such as religion.","HELP_FONT":"Divine font such as heal, harm, or both.","HELP_SANCTIFICATION":"Allowed sanctification, such as holy or unholy.","HELP_CAUSE":"Optional champion cause or comparable bond.","HELP_EDICTS":"Actions followers are expected to uphold.","HELP_ANATHEMA":"Actions that violate the faith.","HELP_SPELLS":"Optional granted spells; one rank and UUID per line.","ADVANCED_SYSTEM_VALUES":"Additional system values for advanced users","HELP_ALIGNMENT":"Legacy alignment for older system data.","HELP_ALTERNATE_DOMAINS":"Additional domains outside the primary selection.","HELP_ATTRIBUTES":"Divine attributes, separated by commas.","STEP_BONUSES_INTRO":"Add persistent mechanical benefits. Empty cards are ignored when saving.","STEP_WONDERS_INTRO":"Create activatable abilities with uses, reset events, and effects.","STEP_REPLACEMENT_INTRO":"Choose an official deity as a template or replace it in GodForge selections without changing the system compendium.","HELP_REPLACEMENT_MODE":"None uses the selection only as a template; hide or replace changes GodForge catalogs.","HELP_OFFICIAL_DEITY":"Choose a name from the active system compendium instead of entering a UUID.","EXPERT_OPTIONS":"Expert options","HELP_REPLACEMENT_CONTEXTS":"Limits replacement to specific catalogs. Empty means all contexts.","STEP_VISIBILITY_INTRO":"Control exactly what players see before and after choosing the deity.","HELP_DEITY_VISIBILITY":"Controls who can see the deity at all.","HELP_FIELD_VISIBILITY":"Controls visibility for this individual content field.","HELP_GM_NOTES":"These notes remain visible only to the GM.","PREVIEW_AND_SAVE":"Preview and save","STEP_PREVIEW_INTRO":"Review the key details and choose the publication status.","PREVIEW_EMPTY_DESCRIPTION":"No description entered yet.","HELP_STATUS":"Drafts remain with the GM; published makes the deity normally selectable.","BACK":"Back","NEXT":"Next","SAVE_DRAFT":"Save as draft","HELP_BONUS_NAME":"A clear name for the benefit.","HELP_SELECTOR":"The system value affected by the bonus, such as religion.","HELP_BONUS_VALUE":"A number or supported formula.","HELP_WONDER_NAME":"The visible name of the ability.","HELP_WONDER_DESCRIPTION":"Describe exactly what happens on activation.","HELP_USAGES":"How often the wonder can be used before its next reset.","HELP_RESET":"The event that restores spent uses.","BONUS_EDITOR_HINT":"Create multiple system-native bonuses with conditions and individual visibility.","ABILITY_EDITOR_HINT":"Configure activation, uses, reset, and effect.","GRANT_GROUPS":"Grant groups","GRANT_GROUPS_HINT":"Nest AND/OR groups and override inherited names, descriptions, or values.","ADD_GRANT_GROUP":"Add group","GRANT_GROUP":"Grant group","ADD_GRANT":"Add grant","ADD_SUBGROUP":"Add subgroup","GROUP_MODE":"Relationship","ALL_REQUIRED":"All (AND)","CHOOSE_FROM":"Choice (OR)","PICK_COUNT":"Pick count","GRANT":"Grant","REFERENCE":"Reference ID","OVERRIDE_NAME":"Override name","OVERRIDE_VALUE":"Override value","OVERRIDE_DESCRIPTION":"Override description","ADD_BONUS":"Add bonus","ADD_ABILITY":"Add wonder","REMOVE":"Remove","MOVE_UP":"Move up","MOVE_DOWN":"Move down","DUPLICATE":"Duplicate","STACKING_WARNING":"In PF2e, this status bonus does not stack with another status bonus on the same selector; only the highest value applies.","SELECTOR":"Selector","VALUE":"Value or formula","MODIFIER_TYPE":"Modifier type","MOD_STATUS":"Status bonus","MOD_CIRCUMSTANCE":"Circumstance bonus","MOD_ITEM":"Item bonus","MOD_UNTYPED":"Untyped","APPLIES_TO":"Applies to","CHECKS":"Checks","DCS":"DCs","BOTH":"Checks and DCs","CONDITION":"Condition","OPTIONAL_CONDITION":"Optional, e.g. while in darkness","ACTION_COST":"Action cost","ACTION_AUTOMATIC":"Automatic / no action","ACTION_FREE":"Free action","ACTION_REACTION":"Reaction","ACTIONS":"Actions","ACTION_EXPLORATION":"Exploration activity","ACTION_DOWNTIME":"Downtime activity","ACTION_COUNT":"Number of actions","USAGES":"Uses","RESET":"Reset","RESET_DAILY":"At daily preparations","RESET_TEN_MINUTES":"After a 10-minute rest","RESET_REFOCUS":"After refocusing","RESET_ENCOUNTER":"At encounter end","RESET_SCENE":"On scene change","RESET_CALENDAR_DAY":"Per calendar day","RESET_MANUAL":"GM only","COOLDOWN":"Cooldown","COOLDOWN_UNIT":"Cooldown unit","DURATION":"Duration","DURATION_UNIT":"Duration unit","ROUNDS":"Rounds","MINUTES":"Minutes","HOURS":"Hours","DAYS":"Days","INSTANT":"Instant","ENCOUNTER":"Encounter","SCENE":"Scene","UNTIL_RESET":"Until next reset","EFFECT_TEMPLATE":"Effect template","EFFECT_NARRATIVE":"Narrative effect","EFFECT_HEAL":"Heal","EFFECT_DAMAGE":"Deal damage","EFFECT_BONUS":"Grant bonus","FORMULA_OR_VALUE":"Formula or value","VISIBILITY_HINT":"Hidden fields are never sent to players.","DEITY_VISIBILITY":"Deity visibility","PLAYER_PREVIEW":"Preview as player","GM_NOTES":"Internal GM notes","VIS_PUBLIC":"Public","VIS_SELECTION":"Visible before selection","VIS_FOLLOWERS":"Followers only","VIS_OWNER":"Owner only","VIS_TRUSTED":"Trusted players","VIS_GM":"GM only","VIS_HIDDEN_UNTIL_SELECTED":"Hidden until selected","VIS_FIELD_PORTRAIT":"Portrait","VIS_FIELD_DESCRIPTION":"Description","VIS_FIELD_QUOTE":"Quote","VIS_FIELD_PANTHEON":"Pantheon","VIS_FIELD_BONUSES":"Passive bonuses","VIS_FIELD_ABILITIES":"Divine wonders","VIS_FIELD_NUMERIC_VALUES":"Exact numeric values","VIS_FIELD_DOMAINS":"Domains","VIS_FIELD_SPELLS":"Granted spells","VIS_FIELD_FAVORED_WEAPON":"Favored weapon","VIS_FIELD_EDICTS":"Edicts","VIS_FIELD_ANATHEMA":"Anathema","VIS_FIELD_GM_NOTES":"Internal GM notes","REPLACEMENT":"Official template and replacement","REPLACEMENT_MODE":"Replacement mode","REPLACE_NONE":"No replacement","REPLACE_HIDE":"Hide official deity","REPLACE_SOURCE":"Replace with this deity","SOURCE_UUID":"Source UUID","REPLACEMENT_CONTEXTS":"Affected selection contexts","OVERVIEW":"Overview","DEITIES":"Deities","RANDOM_TABLES":"Random tables","FORTUNE_WHEELS":"Fortune wheels","RANDOM_AND_WHEELS":"Random tables and fortune wheels","RANDOM_MANAGER_HINT":"The result is fixed before the wheel starts spinning.","TEST_LAB_HINT":"Test existing tables and fortune wheels without creating new content.","NEW_RANDOM_TABLE":"New random table","DICE_FORMULA":"Dice formula","RESULT_ENTRIES":"Results","ADD_RESULT":"Add result","SAVE_TABLE":"Save table","NEW_FORTUNE_WHEEL":"New fortune wheel","LINKED_TABLE":"Linked table","ANIMATION_DURATION":"Animation duration in seconds","MINIMUM_SPINS":"Minimum spins","SAVE_WHEEL":"Save wheel","TEST_DRAW":"Test draw","TEST_SPIN":"Test spin","NO_RANDOM_TABLES":"No random tables have been created yet.","NO_FORTUNE_WHEELS":"No fortune wheels have been created yet.","RESULT_TITLE":"Result title","CATEGORY_JACKPOT":"Jackpot","CATEGORY_POSITIVE":"Positive","CATEGORY_NEUTRAL":"Neutral","CATEGORY_NEGATIVE":"Negative","CATEGORY_CATASTROPHIC":"Catastrophic","INTEGRATION":"Integration","REPLACEMENTS":"Replacements","REPLACEMENT_MANAGER_HINT":"Official compendiums are never modified.","OFFICIAL_DEITY":"Official deity","HOMEBREW_REPLACEMENT":"Homebrew replacement","INHERITANCE":"Inheritance","SELECTIVE_INHERITANCE":"Selective via deity definition","INHERITED_VALUES":"inherited values","SPELLS":"Spells","ALTERNATE_DOMAINS":"Alternate domains","DIVINE_ATTRIBUTES":"Divine attributes","CLERIC_SPELLS":"Granted cleric spells","SPELLS_HINT":"One per line: rank=Compendium.package.pack.Item.id","KEEP_EXISTING_ACTORS":"Keep for existing characters","NO_OFFICIAL_DEITIES":"No official deities found","NO_OFFICIAL_DEITIES_HINT":"The active system adapter did not detect a matching deity pack.","CHARACTERS":"Characters","CHARACTER":"Character","CHARACTER_MANAGER_HINT":"Assign a deity and its grants to a character.","ASSIGN_DEITY":"Assign deity","PLAYER_VIEW":"Player view","TOOLS":"Tools","TEST_LAB":"Test lab","IMPORT_EXPORT":"Import / Export","IMPORT_EXPORT_HINT":"Back up or transfer your GodForge data.","DATA_MANAGER_HINT":"Inspect GodForge packages before import and export a portable backup of your definitions.","EXPORT_PACKAGE":"Export GodForge package","EXPORT_HINT":"Exports all deities including visibility, bonuses, wonders, grants, and replacements.","EXPORT":"Export","IMPORT_PACKAGE":"Import GodForge package","IMPORT_HINT":"The file is validated and summarized before any changes are made.","CHOOSE_FILE":"Choose JSON file","IMPORT_INVALID":"Import could not be validated","IMPORT_PREVIEW":"Import preview","NEW_CONTENT":"New content","UPDATED_CONTENT":"Updated content","IMPORT_APPLY_HINT":"Existing IDs are updated and new IDs are added.","APPLY_IMPORT":"Apply validated import","IMPORTED":"GodForge entries imported.","MIGRATIONS":"Migrations","MIGRATION_MANAGER_HINT":"GodForge updates older definitions automatically when they are loaded.","MIGRATION_STATUS":"Migration status","CURRENT_SCHEMA":"Current schema","PENDING_MIGRATIONS":"Pending migrations","MIGRATION_RELOAD_HINT":"Reload the world to update pending definitions.","MIGRATION_COMPLETE":"All deities use the current schema.","AUDIT_LOG":"Audit log","PLANNED":"Planned for a later alpha release","SETTINGS":"Settings","MODULE_OPTIONS":"Module options","ADAPTER":"System adapter","HELP":"Help","QUICK_ACCESS":"Quick access","SYSTEM_STATUS":"System status","RECENTLY_EDITED":"Recently edited","PUBLISHED":"Published","INVALID":"Invalid definitions","ASSIGNED_CHARACTERS":"Assigned characters","RESET_DAILY_USAGES":"Reset daily uses","RESET_DAILY_COMPLETE":"Daily-preparation uses were reset.","MANUAL_RESET_HINT":"If the system event did not fire, the GM can reset daily uses here manually.","EMPTY_TITLE":"No custom deities yet","EMPTY_HINT":"Create a new deity or import a pantheon.","IMPORT":"Import","LARGER_WINDOW":"A larger window is recommended for the full editor.","TYPE":"Type","LAST_CHANGED":"Last changed","SYSTEM":"System","SCHEMA":"Schema","VERSION":"Version","DIAGNOSTICS_OK":"Ready"},"SETTINGS":{"MENU_NAME":"GodForge management","MENU_LABEL":"Open GodForge","MENU_HINT":"Opens the dashboard for creating and managing custom deities.","LANGUAGE":"GodForge language","LANGUAGE_HINT":"Language used by GodForge surfaces.","AUTO":"Automatic"},"ERROR":{"NO_USES":"No uses remaining.","GM_ONLY":"Only the GM may use this GodForge feature.","NO_PERMISSION":"You are not allowed to use this GodForge feature.","DASHBOARD_OPEN":"The dashboard did not open. Details are available in the browser console.","CODEX_OPEN":"The Divine Codex did not open. Reload Foundry and try again.","HUB_OPEN":"The character hub could not be loaded. Check that the character is still available.","UNSUPPORTED_SYSTEM":"Darkis GodForge does not support the active {system} system.","ACTION_FAILED":"That did not work."}}`), he = {
  DARKIS_GODFORGE: yt
}, Z = /* @__PURE__ */ new Map([["en", he]]);
async function Ie(s, e) {
  if (s === "auto" || Z.has(s)) return;
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Unable to load GodForge language ${s}.`);
  Z.set(s, await t.json());
}
function R(s) {
  var n, a, c, o;
  const e = b(), t = (a = (n = e == null ? void 0 : e.settings) == null ? void 0 : n.get) == null ? void 0 : a.call(n, "darkis-godforge", "language");
  if (typeof t == "string" && t !== "auto") {
    const l = Se(Z.get(t), s);
    if (typeof l == "string") return l;
  }
  const i = (o = (c = e == null ? void 0 : e.i18n) == null ? void 0 : c.localize) == null ? void 0 : o.call(c, s);
  if (i && i !== s) return i;
  const r = Se(he, s);
  return typeof r == "string" ? r : s;
}
function w() {
  return Object.fromEntries(Object.keys(he.DARKIS_GODFORGE.UI).map((s) => [s, R(`DARKIS_GODFORGE.UI.${s}`)]));
}
function Se(s, e) {
  return e.split(".").reduce((t, i) => t && typeof t == "object" ? t[i] : void 0, s);
}
function S() {
  if (!pe())
    throw me(), new Error("GodForge: GM only.");
}
function pe() {
  var s, e;
  return ((e = (s = b()) == null ? void 0 : s.user) == null ? void 0 : e.isGM) === !0;
}
function me() {
  var s, e, t;
  (t = (e = (s = O()) == null ? void 0 : s.notifications) == null ? void 0 : e.warn) == null || t.call(e, R("DARKIS_GODFORGE.ERROR.GM_ONLY"));
}
function C(s = !1) {
  var r, n, a;
  const e = (r = b()) == null ? void 0 : r.user, t = e == null ? void 0 : e.character, i = (n = t == null ? void 0 : t.flags) == null ? void 0 : n["darkis-godforge"];
  return {
    isGM: (e == null ? void 0 : e.isGM) === !0,
    isTrusted: (e == null ? void 0 : e.isTrusted) === !0 || typeof (e == null ? void 0 : e.role) == "number" && e.role >= 2,
    selection: s,
    actorDeityId: typeof (i == null ? void 0 : i.deityId) == "string" ? i.deityId : void 0,
    ownsActor: !!(e && ((a = t == null ? void 0 : t.testUserPermission) == null ? void 0 : a.call(t, e, "OWNER")) === !0)
  };
}
class Ve {
  constructor(e, t) {
    f(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  async getSelectableDeities(e) {
    var h, m, A, I;
    const t = this.deities.list(), i = e.systemId ?? ((m = (h = b()) == null ? void 0 : h.system) == null ? void 0 : m.id) ?? "", r = C(!0), n = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter, systemId: i, catalogContext: e.catalogContext, viewer: r }, a = JSON.stringify([t.map((g) => [g.id, g.revision]), n]);
    if (((A = this.catalogCache) == null ? void 0 : A.key) === a) return this.catalogCache.result;
    const c = await (((I = this.adapters.tryGet(i)) == null ? void 0 : I.listOfficialDeities()) ?? Promise.resolve([])), o = e.catalogContext ?? "characterBuilder", l = new Set(t.filter((g) => g.replacement.sourceUuid && (g.replacement.mode === "hide" || g.replacement.mode === "replace") && (!g.replacement.contexts.length || g.replacement.contexts.includes(o))).map((g) => g.replacement.sourceUuid)), d = tt(t, e, /* @__PURE__ */ new Set(), r), u = c.filter((g) => !g.sourceUuid || !l.has(g.sourceUuid)), p = [...d, ...u];
    return this.catalogCache = { key: a, result: p }, p;
  }
  exportDeities(e) {
    return S(), mt(this.deities.list(), e);
  }
  importDeities(e) {
    S();
    const t = Me(e);
    for (const i of t) this.deities.save(i);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e) {
    const t = C(!0);
    return ue(this.deities.list().filter((i) => U(i, t)).map((i) => ({ id: i.id, label: i.name, weight: 1 })), e);
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  isDeitySelectableByPlayer(e) {
    const t = this.deities.get(e);
    return !!(t && U(t, { isGM: !1, selection: !0 }));
  }
  async materializeDeity(e, t, i) {
    S();
    const r = this.deities.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(r, i);
  }
  getDeity(e) {
    const t = this.deities.get(e);
    if (!t) return null;
    const i = C();
    return i.isGM ? t : F(t, i);
  }
  getActorDeity(e) {
    var n;
    this.requireActorOwner(e);
    const t = (n = e.flags) == null ? void 0 : n["darkis-godforge"];
    if (!t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string") return null;
    const i = this.deities.get(t.deityId);
    if (!i) return null;
    const r = { ...C(), actorDeityId: t.deityId, ownsActor: !0 };
    return r.isGM ? i : F(i, r);
  }
  getCharacterWidgetData(e) {
    var c;
    this.requireActorOwner(e);
    const t = (c = e.flags) == null ? void 0 : c["darkis-godforge"], i = t && typeof t == "object" && "deityId" in t && "grants" in t && "usages" in t ? t : null, r = i ? this.deities.get(i.deityId) : null;
    if (!r || !i) return z(null, null);
    const n = C();
    if (n.isGM) return z(r, i);
    const a = F(r, { ...n, actorDeityId: r.id, ownsActor: !0 });
    return z(a, { ...i, grants: [] });
  }
  getGrantChoices(e, t) {
    var i;
    return S(), ((i = this.deities.get(e)) == null ? void 0 : i.grantGroups) ?? null;
  }
  getClassGrants(e, t, i = []) {
    S();
    const r = this.deities.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return ct(r, t, i);
  }
  buildClassCoupling(e, t, i, r = []) {
    return this.adapters.get(i).buildClassCoupling(this.getClassGrants(e, t, r));
  }
  async assignDeity(e, t, i = {}) {
    this.requireActorOwner(e);
    const r = this.deities.get(t);
    if (!r || !U(r, C(!0))) throw new Error("Deity is not available for assignment.");
    const n = Object.entries(i).map(([o, l]) => ({ groupId: o, refs: l })), a = r.grantGroups.flatMap((o) => x(o, n)), c = Object.fromEntries(r.abilities.filter((o) => o.uses).map((o) => [o.id, { used: 0, max: o.uses.max, lastResetAt: Date.now(), reset: o.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: a, usages: c } } }), await this.synchronizeActorDeityItem(e, r);
  }
  async removeDeity(e) {
    this.requireActorOwner(e), e.unsetFlag ? await Promise.all(["deityId", "grants", "usages"].map((t) => e.unsetFlag("darkis-godforge", t))) : await e.update({ flags: { "darkis-godforge": null } }), await this.removeActorDeityItems(e);
  }
  async resetActorUsages(e, t) {
    this.requireActorOwner(e);
    const i = this.readState(e), r = Date.now(), n = Object.fromEntries(Object.entries(i.usages).map(([a, c]) => c.reset === t ? [a, st(c, r)] : [a, c]));
    await e.update({ flags: { "darkis-godforge": { ...i, usages: n } } });
  }
  async activateAbility(e, t, i = {}) {
    S();
    const r = this.readState(e), n = this.deities.get(r.deityId), a = n == null ? void 0 : n.abilities.find((d) => d.id === t);
    if (!a) throw new Error("Ability is not available for this actor.");
    const c = r.usages[t];
    if (c && !Ce(c)) throw new Error("No uses remaining.");
    const o = c ? { ...r.usages, [t]: it(c) } : r.usages, l = { id: e.id, modifiers: {}, conditions: [] };
    await lt(a, { actor: l, target: i.target, facts: i.facts ?? { actor: { level: 0 }, target: {} }, rollDice: i.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: o } } });
  }
  getReplacementFor(e) {
    return S(), this.deities.list().find((t) => t.replacement.sourceUuid === e && t.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, t) {
    return S(), this.deities.list().some((i) => i.replacement.sourceUuid === e && i.replacement.mode === "hide" && i.replacement.contexts.includes(t));
  }
  registerAdapter(e) {
    S(), this.adapters.register(e);
  }
  async synchronizeActorDeityItem(e, t) {
    var o, l;
    const i = (l = (o = b()) == null ? void 0 : o.system) == null ? void 0 : l.id, r = i ? this.adapters.tryGet(i) : null;
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
    if (((i = t == null ? void 0 : t.user) == null ? void 0 : i.isGM) !== !0 && !(t != null && t.user && ((r = e.testUserPermission) == null ? void 0 : r.call(e, t.user, "OWNER")) === !0))
      throw new Error("GodForge: Actor owner or GM required.");
  }
}
function k(s) {
  if (!s) return "icons/svg/eye.svg";
  const e = s.trim();
  return /^(?:javascript|data|vbscript):/i.test(e) || /^\/\//.test(e) || /[\u0000-\u001f]/.test(e) ? "icons/svg/eye.svg" : e;
}
function It(s) {
  const e = [];
  s.name.trim() || e.push({ level: "error", field: "name", message: "Name is required." }), s.title.trim() || e.push({ level: "warning", field: "title", message: "Title is empty." }), s.description.trim() || e.push({ level: "warning", field: "description", message: "Description is empty." });
  for (const t of s.passiveBonuses)
    (!t.name.trim() || !t.selector.trim()) && e.push({ level: "error", field: `bonus.${t.id}`, message: "Bonus name and selector are required." }), typeof t.value == "string" && !de(t.value) && e.push({ level: "error", field: `bonus.${t.id}.value`, message: "Bonus formula is invalid." });
  for (const t of s.abilities)
    t.name.trim() || e.push({ level: "error", field: `ability.${t.id}`, message: "Ability name is required." }), !t.timing && t.actionCost === void 0 && e.push({ level: "warning", field: `ability.${t.id}.timing`, message: "Ability timing is incomplete." });
  return e;
}
function j() {
  var i;
  const s = globalThis, e = typeof foundry < "u" ? foundry : s.foundry, t = (i = e == null ? void 0 : e.applications) == null ? void 0 : i.api;
  if (t != null && t.ApplicationV2 && t.HandlebarsApplicationMixin) return t.HandlebarsApplicationMixin(t.ApplicationV2);
  if (oe()) {
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
function L() {
  const s = j();
  return class extends s {
    render(e) {
      return pe() ? super.render(e) : (me(), Promise.resolve(this));
    }
  };
}
function P(s, e) {
  var t, i, r;
  console.error(`Darkis GodForge | ${s}`, e), (r = (i = (t = O()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, R("DARKIS_GODFORGE.ERROR.ACTION_FAILED"));
}
function $(s, e = []) {
  const t = s.grants.flatMap((r) => {
    if (!("mode" in r)) return [];
    const n = s.mode === "any" ? [...e, { groupId: s.id, optionId: r.id }] : e;
    return $(r, n);
  });
  if (s.mode !== "any") return t;
  const i = s.grants.map((r) => {
    var n;
    return "mode" in r ? { id: r.id, label: r.label || r.id } : { id: r.ref, label: ((n = r.overrides) == null ? void 0 : n.name) || r.ref };
  });
  return [{ id: s.id, label: s.label || s.id, pick: s.pick ?? 1, options: i, requirements: e }, ...t];
}
function be(s) {
  return s.some((e) => $(e).length > 0);
}
class ee extends j() {
  constructor(t, i, r, n) {
    super();
    f(this, "groups", []);
    f(this, "tokens", /* @__PURE__ */ new Map());
    f(this, "error", "");
    this.deity = t, this.actor = i, this.socketRouter = r, this.onAssigned = n;
  }
  async _prepareContext() {
    this.tokens.clear();
    const t = this.deity.grantGroups.flatMap((n) => $(n)), i = /* @__PURE__ */ new Map(), r = t.map((n, a) => n.options.map((c, o) => {
      const l = `${a}-${o}-${crypto.randomUUID()}`;
      return this.tokens.set(l, c.id), i.set(`${n.id}\0${c.id}`, l), { token: l, label: c.label };
    }));
    return this.groups = t.map((n, a) => ({
      id: n.id,
      label: n.label,
      pick: n.pick,
      inputType: n.pick === 1 ? "radio" : "checkbox",
      options: r[a] ?? [],
      requirements: n.requirements.flatMap((c) => {
        const o = t.findIndex((d) => d.id === c.groupId), l = i.get(`${c.groupId}\0${c.optionId}`);
        return o >= 0 && l ? [{ name: `choice-${o}`, token: l }] : [];
      })
    })), { ui: w(), deityName: this.deity.name, groups: this.groups, error: this.error };
  }
  _onRender() {
    var i, r, n, a, c, o;
    (r = (i = this.element) == null ? void 0 : i.querySelector("form")) == null || r.addEventListener("submit", (l) => {
      var p;
      l.preventDefault();
      const d = l.currentTarget, u = {};
      for (const [h, m] of this.groups.entries()) {
        if ((p = d.querySelector(`[data-choice-group='${h}']`)) != null && p.hidden) continue;
        const A = [...d.querySelectorAll(`[name='choice-${h}']:checked`)].flatMap((I) => {
          const g = this.tokens.get(I.value);
          return g ? [g] : [];
        });
        if (A.length !== m.pick) {
          this.error = `${m.label}: ${(w().PICK_EXACTLY ?? "Choose exactly {count} option(s).").replace("{count}", String(m.pick))}`, this.render(!0);
          return;
        }
        u[m.id] = A;
      }
      this.socketRouter.assign({ actorId: this.actor.id, deityId: this.deity.id, choices: u }).then(() => {
        var h;
        this.onAssigned(), (h = this.close) == null || h.call(this);
      }).catch((h) => {
        this.error = w().ASSIGNMENT_FAILED ?? "The deity could not be assigned.", P("Grant choice assignment failed.", h), this.render(!0);
      });
    });
    const t = () => {
      var l;
      (l = this.element) == null || l.querySelectorAll("[data-choice-group]").forEach((d) => {
        const p = [...d.querySelectorAll("[data-choice-requirement]")].every((h) => {
          var I, g;
          const m = h.dataset.name ?? "", A = h.dataset.token ?? "";
          return ((g = (I = this.element) == null ? void 0 : I.querySelector(`[name='${m}'][value='${A}']`)) == null ? void 0 : g.checked) === !0;
        });
        d.hidden = !p, d.querySelectorAll("input").forEach((h) => {
          h.disabled = !p, p || (h.checked = !1);
        });
      });
    };
    (a = (n = this.element) == null ? void 0 : n.querySelector("form")) == null || a.addEventListener("change", t), t(), (o = (c = this.element) == null ? void 0 : c.querySelector("[data-action='cancel']")) == null || o.addEventListener("click", () => {
      var l;
      return void ((l = this.close) == null ? void 0 : l.call(this));
    });
  }
}
f(ee, "DEFAULT_OPTIONS", { id: "darkis-godforge-grant-choices", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHOOSE_GRANTS", resizable: !0 }, position: { width: 620, height: 680 } }), f(ee, "PARTS", { main: { template: "modules/darkis-godforge/templates/grant-choice-dialog.hbs" } });
class M extends j() {
  constructor(t, i, r, n, a, c) {
    super();
    f(this, "searchTerm", "");
    f(this, "selectedDomain", "");
    this.deityService = t, this.preview = i, this.api = r, this.socketRouter = n, this.actor = a, this.viewerOverride = c;
  }
  async _prepareContext() {
    var l, d, u, p, h, m, A;
    const t = ((l = this.preview) == null ? void 0 : l.viewer) ?? this.viewerOverride ?? C(!0), i = this.preview ? [{ ...this.preview.deity, status: "published" }] : this.deityService.list(), r = (p = (u = (d = this.actor) == null ? void 0 : d.flags) == null ? void 0 : u["darkis-godforge"]) == null ? void 0 : p.deityId, n = (h = b()) == null ? void 0 : h.user, a = !!(this.actor && n && ((A = (m = this.actor).testUserPermission) == null ? void 0 : A.call(m, n, "OWNER")) === !0), c = i.flatMap((I) => {
      const g = be(I.grantGroups);
      if (t.isGM) return [{ ...I, image: k(I.image), selected: I.id === r, canSelect: !1, requiresChoices: g }];
      const E = F(I, t);
      return E ? [{ ...E, image: k(E.image), selected: I.id === r, canSelect: !!(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && (t.ownsActor || a)), requiresChoices: g }] : [];
    }), o = c.filter((I) => {
      var g;
      return (!this.searchTerm || `${I.name} ${I.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || ((g = I.domains) == null ? void 0 : g.includes(this.selectedDomain)));
    });
    return { ui: w(), deities: o, domains: [...new Set(c.flatMap((I) => I.domains ?? []))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain, isGM: t.isGM, isPreview: !!(this.preview || this.viewerOverride) };
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
      if (!this.actor || !this.socketRouter) return;
      const a = this.deityService.get(n.dataset.selectDeity ?? "");
      if (a) {
        if (be(a.grantGroups)) {
          new ee(a, this.actor, this.socketRouter, () => void this.render(!0)).render(!0);
          return;
        }
        this.socketRouter.assign({ actorId: this.actor.id, deityId: a.id, choices: {} }).then(() => this.render(!0)).catch((c) => P("Deity assignment failed.", c));
      }
    }));
  }
}
f(M, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1e3, height: 760 } }), f(M, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
const Ae = Object.keys(G.fields);
class B extends L() {
  constructor(e, t, i = new ce(), r) {
    super(), this.deityService = e, this.onSaved = t, this.adapters = i, this.existing = r;
  }
  async _prepareContext() {
    var o, l, d;
    S();
    const e = ((l = (o = b()) == null ? void 0 : o.system) == null ? void 0 : l.id) ?? "", t = this.adapters.tryGet(e), i = (t == null ? void 0 : t.listSkills()) ?? [];
    let r = [];
    try {
      r = await ((t == null ? void 0 : t.listOfficialDeities()) ?? Promise.resolve([]));
    } catch (u) {
      console.error("Darkis GodForge | Could not load official deities for the editor.", u);
    }
    const n = ((d = this.existing) == null ? void 0 : d.replacement.sourceUuid) ?? "", a = r.map((u) => ({ ...u, selected: u.sourceUuid === n }));
    n && !a.some((u) => u.sourceUuid === n) && a.push({ id: n, sourceUuid: n, official: !0, name: n, title: n, domains: [], selected: !0 });
    const c = w();
    return {
      ui: { ...c, NEW_DEITY: this.existing ? c.EDIT_DEITY : c.NEW_DEITY },
      selectors: i,
      officialDeities: a,
      visibilityFields: Ae.map((u) => ({ key: u, label: c[`VIS_FIELD_${u.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? u })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((u) => ({ value: u, label: c[`VIS_${u.replaceAll("-", "_").toUpperCase()}`] ?? u }))
    };
  }
  _onRender() {
    var i, r, n, a, c;
    S();
    const e = this.element, t = e == null ? void 0 : e.querySelector("form");
    e && t && this.existing && this.populateForm(e, t, this.existing), e && t && this.setupWizard(e, t), e == null || e.querySelectorAll("[data-action='browse-image']").forEach((o) => o.addEventListener("click", () => this.openFilePicker(e, o))), e == null || e.querySelectorAll("[data-image-field]").forEach((o) => {
      o.addEventListener("dragover", (l) => {
        l.preventDefault(), l.dataTransfer.dropEffect = "copy";
      }), o.addEventListener("drop", (l) => this.handleImageDrop(l, o));
    }), (i = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || i.addEventListener("click", () => {
      var o;
      return void ((o = this.close) == null ? void 0 : o.call(this));
    }), (r = e == null ? void 0 : e.querySelector("[data-action='add-bonus']")) == null || r.addEventListener("click", () => this.appendTemplate(e, "bonus", "[data-bonus-list]")), (n = e == null ? void 0 : e.querySelector("[data-action='add-ability']")) == null || n.addEventListener("click", () => this.appendTemplate(e, "ability", "[data-ability-list]")), (a = e == null ? void 0 : e.querySelector("[data-action='add-grant-group']")) == null || a.addEventListener("click", () => this.appendTemplate(e, "grant-group", "[data-grant-list]")), e == null || e.addEventListener("click", (o) => {
      var u, p;
      const l = o.target.closest("[data-action]"), d = l == null ? void 0 : l.closest(".dg-editor-card");
      !l || !d || (l.dataset.action === "add-grant-member" && this.appendTemplate(d, "grant-member", ":scope > [data-grant-members]"), l.dataset.action === "add-subgroup" && this.appendTemplate(d, "grant-group", ":scope > [data-grant-members]"), l.dataset.action === "remove-row" && d.remove(), l.dataset.action === "duplicate-row" && d.after(d.cloneNode(!0)), l.dataset.action === "move-up" && d.previousElementSibling && ((u = d.parentElement) == null || u.insertBefore(d, d.previousElementSibling)), l.dataset.action === "move-down" && d.nextElementSibling && ((p = d.parentElement) == null || p.insertBefore(d.nextElementSibling, d)), this.updateStackingWarnings(e), t && this.updateWizardPreview(e, t));
    }), e == null || e.addEventListener("input", (o) => {
      this.updateStackingWarnings(e);
      const l = o.target;
      l.matches("[data-image-input]") && this.updateImagePreview(e, l.name, l.value), t && this.updateWizardPreview(e, t);
    }), e == null || e.addEventListener("change", () => {
      t && this.updateWizardPreview(e, t);
    }), e == null || e.querySelectorAll("[data-image-input]").forEach((o) => this.updateImagePreview(e, o.name, o.value)), e == null || e.querySelectorAll("[data-action='preview-player']").forEach((o) => o.addEventListener("click", () => {
      const l = t == null ? void 0 : t.elements.namedItem("name");
      if (!t || !(l != null && l.reportValidity())) return;
      const d = this.previewDefinition(t);
      new M(this.deityService, { deity: d, viewer: { isGM: !1, selection: !0 } }).render(!0);
    })), (c = e == null ? void 0 : e.querySelector("[data-action='save-draft']")) == null || c.addEventListener("click", () => {
      const o = t == null ? void 0 : t.elements.namedItem("name");
      !t || !(o != null && o.reportValidity()) || this.saveDefinition(t, !0);
    }), t == null || t.addEventListener("submit", (o) => {
      o.preventDefault(), this.saveDefinition(t, !1);
    });
  }
  setupWizard(e, t) {
    const i = [...e.querySelectorAll("[data-wizard-panel]")], r = [...e.querySelectorAll("[data-wizard-step]")], n = e.querySelector("[data-action='previous-step']"), a = e.querySelector("[data-action='next-step']"), c = e.querySelector("[data-action='finish']"), o = e.querySelector("[data-wizard-current]");
    let l = 0;
    const d = (u) => {
      l = Math.max(0, Math.min(i.length - 1, u)), i.forEach((p, h) => {
        p.hidden = h !== l;
      }), r.forEach((p, h) => {
        h === l ? p.setAttribute("aria-current", "step") : p.removeAttribute("aria-current");
      }), n && (n.disabled = l === 0), a && (a.hidden = l === i.length - 1), c && (c.hidden = l !== i.length - 1), o && (o.textContent = String(l + 1)), this.updateWizardPreview(e, t);
    };
    r.forEach((u) => u.addEventListener("click", () => d(Number(u.dataset.wizardStep ?? 0)))), n == null || n.addEventListener("click", () => d(l - 1)), a == null || a.addEventListener("click", () => d(l + 1)), d(0);
  }
  updateWizardPreview(e, t) {
    var d, u;
    const i = w(), r = (p) => {
      var h;
      return ((h = t.elements.namedItem(p)) == null ? void 0 : h.value.trim()) ?? "";
    }, n = (p, h) => {
      const m = e.querySelector(p);
      m && (m.textContent = h);
    };
    n("[data-wizard-preview-name]", r("name") || i.NEW_DEITY_PLACEHOLDER || "New deity"), n("[data-wizard-preview-title]", r("title") || "—"), n("[data-wizard-preview-description]", r("description") || i.PREVIEW_EMPTY_DESCRIPTION || "—");
    const a = e.querySelector("[data-wizard-preview-quote]");
    a && (a.textContent = r("quote"), a.hidden = !a.textContent);
    const c = t.elements.namedItem("status");
    n("[data-wizard-preview-status]", ((d = c == null ? void 0 : c.selectedOptions[0]) == null ? void 0 : d.textContent) ?? i.STATUS_DRAFT ?? "Draft");
    const o = t.elements.namedItem("replacement.sourceUuid");
    n("[data-wizard-preview-source]", o != null && o.value ? ((u = o.selectedOptions[0]) == null ? void 0 : u.textContent) ?? o.value : "—"), n("[data-wizard-preview-bonuses]", String(t.querySelectorAll("[data-bonus-row]").length)), n("[data-wizard-preview-abilities]", String(t.querySelectorAll("[data-ability-row]").length));
    const l = e.querySelector("[data-wizard-preview-image]");
    l && (l.src = r("image") ? k(r("image")) : "modules/darkis-godforge/assets/logo.png");
  }
  saveDefinition(e, t) {
    var n;
    S();
    const i = this.readInput(e);
    t && (i.status = "draft");
    const r = this.existing ? this.deityService.update(this.existing.id, i) : this.deityService.create(i);
    this.onSaved(r), (n = this.close) == null || n.call(this);
  }
  appendTemplate(e, t, i) {
    var o, l, d;
    const r = ((o = this.element) == null ? void 0 : o.querySelector(`template[data-template='${t}']`)) ?? (e == null ? void 0 : e.querySelector(`template[data-template='${t}']`)), n = e == null ? void 0 : e.querySelector(i);
    if (!r || !n) return;
    const a = r.content.cloneNode(!0);
    (d = (l = a.querySelector("[name$='.visibility']")) == null ? void 0 : l.querySelector("[value='followers']")) == null || d.setAttribute("selected", "selected"), n.append(a), this.updateStackingWarnings(e);
    const c = e == null ? void 0 : e.querySelector("form");
    e && c && this.updateWizardPreview(e, c);
  }
  previewDefinition(e) {
    const t = (/* @__PURE__ */ new Date()).toISOString();
    return { ...this.readInput(e), id: "preview", schemaVersion: _, revision: 1, createdAt: t, updatedAt: t, checksum: "preview" };
  }
  populateForm(e, t, i) {
    var n, a, c, o, l;
    const r = {
      name: i.name,
      title: i.title,
      status: i.status,
      description: i.description,
      quote: i.quote ?? "",
      image: i.image ?? "",
      icon: i.icon ?? "",
      symbol: i.symbol ?? "",
      banner: i.banner ?? "",
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
      const p = d.timing, h = d.effects[0];
      this.setValue(u, "ability.name", d.name), this.setValue(u, "ability.description", d.description), this.setValue(u, "ability.visibility", d.visibility ?? "followers"), this.setValue(u, "ability.actionCost", (p == null ? void 0 : p.actionCost.type) ?? "actions"), this.setValue(u, "ability.actions", String((p == null ? void 0 : p.actionCost.actions) ?? d.actionCost ?? 1)), this.setValue(u, "ability.usageMax", String((p == null ? void 0 : p.usage.max) ?? ((a = d.uses) == null ? void 0 : a.max) ?? "")), this.setValue(u, "ability.reset", (p == null ? void 0 : p.reset.event) ?? ((c = d.uses) == null ? void 0 : c.reset) ?? "daily-preparations"), this.setValue(u, "ability.cooldownValue", String(((o = p == null ? void 0 : p.cooldown) == null ? void 0 : o.value) ?? 0)), this.setValue(u, "ability.cooldownUnit", ((l = p == null ? void 0 : p.cooldown) == null ? void 0 : l.unit) ?? "rounds"), this.setValue(u, "ability.durationValue", String((p == null ? void 0 : p.duration.value) ?? d.duration ?? 0)), this.setValue(u, "ability.durationUnit", (p == null ? void 0 : p.duration.unit) ?? "instant"), this.setValue(u, "ability.effectType", (h == null ? void 0 : h.type) === "heal" || (h == null ? void 0 : h.type) === "damage" || (h == null ? void 0 : h.type) === "modifier" ? h.type : "message"), this.setValue(u, "ability.formula", h && "formula" in h ? h.formula : (h == null ? void 0 : h.type) === "modifier" ? String(h.value) : "1"), this.setValue(u, "ability.selector", (h == null ? void 0 : h.type) === "modifier" ? h.selector : "");
    }
    for (const d of i.grantGroups) this.populateGrantGroup(e, e.querySelector("[data-grant-list]"), d);
    this.updateStackingWarnings(e);
  }
  readInput(e) {
    const t = new FormData(e), i = structuredClone(G);
    i.deity = this.visibility(t.get("visibility.deity"), "public");
    for (const r of Ae) i.fields[r] = this.visibility(t.get(`visibility.fields.${r}`), i.fields[r]);
    return {
      status: this.status(t.get("status")),
      name: this.text(t.get("name")),
      title: this.text(t.get("title")),
      description: this.text(t.get("description")),
      quote: this.optional(t.get("quote")),
      image: this.optional(t.get("image")),
      icon: this.optional(t.get("icon")),
      symbol: this.optional(t.get("symbol")),
      banner: this.optional(t.get("banner")),
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
  openFilePicker(e, t) {
    var l, d, u;
    if (!e) return;
    const i = t.dataset.target ?? "", r = e.querySelector(`[name='${i}']`);
    if (!r) return;
    const n = globalThis, a = ((u = (d = (l = n.foundry) == null ? void 0 : l.applications) == null ? void 0 : d.apps) == null ? void 0 : u.FilePicker) ?? n.FilePicker;
    if (!a) return;
    const c = (p) => {
      r.value = p, r.dispatchEvent(new Event("input", { bubbles: !0 }));
    }, o = a.fromButton ? a.fromButton(t) : new a({ type: "image", current: r.value, callback: c });
    o.callback = c, o.render(!0);
  }
  handleImageDrop(e, t) {
    var a, c;
    e.preventDefault();
    const i = (c = (a = e.dataTransfer) == null ? void 0 : a.getData("text/plain")) == null ? void 0 : c.trim();
    if (!i) return;
    let r = i;
    try {
      const o = JSON.parse(i);
      r = typeof o.path == "string" ? o.path : typeof o.src == "string" ? o.src : "";
    } catch {
    }
    if (!r) return;
    const n = t.querySelector("[data-image-input]");
    n && (n.value = r, n.dispatchEvent(new Event("input", { bubbles: !0 })));
  }
  updateImagePreview(e, t, i) {
    const r = e.querySelector(`[data-image-preview='${t}']`);
    if (!r) return;
    const n = i.trim();
    r.hidden = !n, n ? r.src = k(n) : r.removeAttribute("src");
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
      const r = this.input(t, "ability.description"), n = this.input(t, "ability.usageMax"), a = n === "" ? null : Math.max(0, Number(n)), c = this.resetType(this.input(t, "ability.reset")), o = Math.max(0, Number(this.input(t, "ability.cooldownValue") || 0)), l = Math.max(0, Number(this.input(t, "ability.durationValue") || 0)), d = this.input(t, "ability.effectType"), u = this.input(t, "ability.formula") || "0", p = d === "heal" || d === "damage" ? [{ type: d, formula: u, target: "target" }] : d === "modifier" ? [{ type: "modifier", selector: this.input(t, "ability.selector") || "all", value: u, modifierType: "status", duration: l }] : [{ type: "message", text: r }];
      return [{
        id: crypto.randomUUID(),
        name: i,
        description: r,
        visibility: this.visibility(this.input(t, "ability.visibility"), "followers"),
        enabled: !0,
        uses: a === null ? void 0 : { max: a, reset: c },
        timing: {
          actionCost: { type: this.actionCost(this.input(t, "ability.actionCost")), actions: Number(this.input(t, "ability.actions") || 0) || void 0 },
          usage: { max: a, period: a === null ? "unlimited" : "reset" },
          reset: { event: c },
          cooldown: o > 0 ? { value: o, unit: this.cooldownUnit(this.input(t, "ability.cooldownUnit")) } : null,
          duration: { value: l, unit: this.durationUnit(this.input(t, "ability.durationUnit")) }
        },
        effects: p
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
      const c = this.input(a, "grant.ref");
      if (!c) continue;
      const o = this.input(a, "grant.overrideName"), l = this.input(a, "grant.overrideDescription"), d = this.input(a, "grant.overrideValue"), u = Number(d), p = o || l || d ? { name: o || void 0, description: l || void 0, value: d ? Number.isFinite(u) ? u : d : void 0 } : void 0;
      i.push({ type: this.input(a, "grant.type") === "bonus" ? "bonus" : "ability", ref: c, overrides: p });
    }
    const r = this.input(e, "grantGroup.mode") === "any" ? "any" : "all", n = Number(this.input(e, "grantGroup.pick") || 1);
    return { id: this.input(e, "grantGroup.id") || crypto.randomUUID(), label: this.input(e, "grantGroup.label"), mode: r, pick: r === "any" ? Math.max(1, n) : void 0, grants: i };
  }
  populateGrantGroup(e, t, i) {
    var o, l, d;
    const r = e.querySelector("template[data-template='grant-group']");
    if (!r || !t) return;
    const n = r.content.cloneNode(!0), a = n.querySelector("[data-grant-group]");
    if (!a) return;
    this.setValue(a, "grantGroup.id", i.id), this.setValue(a, "grantGroup.label", i.label), this.setValue(a, "grantGroup.mode", i.mode), this.setValue(a, "grantGroup.pick", String(i.pick ?? 1));
    const c = a.querySelector(":scope > [data-grant-members]");
    for (const u of i.grants) {
      if ("mode" in u) {
        this.populateGrantGroup(e, c, u);
        continue;
      }
      const p = e.querySelector("template[data-template='grant-member']");
      if (!p || !c) continue;
      const h = p.content.cloneNode(!0), m = h.querySelector("[data-grant-member]");
      m && (this.setValue(m, "grant.type", u.type), this.setValue(m, "grant.ref", u.ref), this.setValue(m, "grant.overrideName", ((o = u.overrides) == null ? void 0 : o.name) ?? ""), this.setValue(m, "grant.overrideDescription", ((l = u.overrides) == null ? void 0 : l.description) ?? ""), this.setValue(m, "grant.overrideValue", ((d = u.overrides) == null ? void 0 : d.value) === void 0 ? "" : String(u.overrides.value)), c.append(h));
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
f(B, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 }, position: { width: 980, height: 760 } }), f(B, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class te extends L() {
  constructor(e, t, i) {
    super(), this.deity = e, this.deityService = t, this.adapters = i;
  }
  async _prepareContext() {
    return S(), { ui: w(), deity: { ...this.deity, image: k(this.deity.image) } };
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
f(te, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1200, height: 820 } }), f(te, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class ie extends L() {
  constructor(e, t) {
    super(), this.deities = e, this.adapters = t;
  }
  async _prepareContext() {
    var n, a, c;
    S();
    const e = ((a = (n = b()) == null ? void 0 : n.system) == null ? void 0 : a.id) ?? "", t = await (((c = this.adapters.tryGet(e)) == null ? void 0 : c.listOfficialDeities()) ?? Promise.resolve([])), i = this.deities.list(), r = t.map((o) => {
      const l = i.find((d) => d.replacement.sourceUuid === o.sourceUuid && d.replacement.mode !== "none");
      return { ...o, mappingMode: (l == null ? void 0 : l.replacement.mode) ?? "none", inheritedCount: Object.values((l == null ? void 0 : l.replacement.inherit) ?? {}).filter(Boolean).length, options: i.map((d) => ({ id: d.id, name: d.name, selected: d.id === (l == null ? void 0 : l.id) })) };
    });
    return { ui: w(), rows: r, systemId: e };
  }
  _onRender() {
    var t;
    S();
    const e = (t = this.element) == null ? void 0 : t.querySelector("form");
    e == null || e.querySelectorAll("[data-source-row]").forEach((i) => {
      const r = i.querySelector("[name='replacement.mode']");
      r && (r.value = i.dataset.mode ?? "none");
    }), e == null || e.addEventListener("submit", (i) => {
      var r, n;
      i.preventDefault(), S();
      for (const a of e.querySelectorAll("[data-source-row]")) {
        const c = a.dataset.sourceUuid ?? "", o = ((r = a.querySelector("[name='replacement.deity']")) == null ? void 0 : r.value) ?? "", l = ((n = a.querySelector("[name='replacement.mode']")) == null ? void 0 : n.value) ?? "none", d = l === "hide" || l === "replace" ? l : "none";
        for (const u of this.deities.list().filter((p) => p.replacement.sourceUuid === c && p.id !== o)) this.deities.update(u.id, { replacement: { sourceUuid: "", mode: "none", contexts: [] } });
        if (o) {
          const u = this.deities.get(o);
          this.deities.update(o, { replacement: { ...u == null ? void 0 : u.replacement, sourceUuid: c, mode: d, contexts: ["characterBuilder", "compendium", "actorSheet", "searches", "leveler"] } });
        }
      }
      this.render(!0);
    });
  }
}
f(ie, "DEFAULT_OPTIONS", { id: "darkis-godforge-replacements", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.REPLACEMENTS", resizable: !0 }, position: { width: 1100, height: 760 } }), f(ie, "PARTS", { main: { template: "modules/darkis-godforge/templates/replacement-manager.hbs" } });
class se extends L() {
  constructor(t, i, r, n = "transfer") {
    super();
    f(this, "pendingImport");
    f(this, "preview", null);
    f(this, "error", "");
    this.deities = t, this.api = i, this.randomContent = r, this.mode = n;
  }
  async _prepareContext() {
    S();
    const t = this.deities.list();
    return { ui: w(), preview: this.preview, error: this.error, deityCount: t.length, isTransfer: this.mode === "transfer", isMigration: this.mode === "migration", currentSchema: _, pendingMigrations: t.filter((i) => i.schemaVersion < _).length };
  }
  _onRender() {
    var i, r, n;
    S();
    const t = this.element;
    (i = t == null ? void 0 : t.querySelector("[data-action='export']")) == null || i.addEventListener("click", () => this.downloadExport()), (r = t == null ? void 0 : t.querySelector("[data-import-file]")) == null || r.addEventListener("change", (a) => {
      var c;
      return void this.previewFile((c = a.target.files) == null ? void 0 : c[0]);
    }), (n = t == null ? void 0 : t.querySelector("[data-action='apply-import']")) == null || n.addEventListener("click", () => {
      var a, c, o;
      if (S(), !!this.pendingImport) {
        try {
          const l = this.readRandomContent(this.pendingImport), d = this.api.importDeities(this.pendingImport);
          l && this.randomContent.replace(l), this.pendingImport = void 0, this.preview = null, this.error = "", (o = (c = (a = O()) == null ? void 0 : a.notifications) == null ? void 0 : c.info) == null || o.call(c, `${d} ${w().IMPORTED}`);
        } catch (l) {
          this.error = l instanceof Error ? l.message : String(l);
        }
        this.render(!0);
      }
    });
  }
  downloadExport() {
    S();
    const t = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot() }, null, 2), i = URL.createObjectURL(new Blob([t], { type: "application/json" })), r = document.createElement("a");
    r.href = i, r.download = `darkis-godforge-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, r.click(), URL.revokeObjectURL(i);
  }
  async previewFile(t) {
    var i, r;
    if (t) {
      try {
        const n = JSON.parse(await t.text()), a = Me(n), c = new Set(this.deities.list().map((l) => l.id));
        this.pendingImport = n;
        const o = this.readRandomContent(n);
        this.preview = { total: a.length, created: a.filter((l) => !c.has(l.id)).length, updated: a.filter((l) => c.has(l.id)).length, tables: ((i = o == null ? void 0 : o.tables) == null ? void 0 : i.length) ?? 0, wheels: ((r = o == null ? void 0 : o.wheels) == null ? void 0 : r.length) ?? 0 }, this.error = "";
      } catch (n) {
        this.pendingImport = void 0, this.preview = null, this.error = n instanceof Error ? n.message : String(n);
      }
      this.render(!0);
    }
  }
  readRandomContent(t) {
    if (!t || typeof t != "object" || !("randomContent" in t)) return null;
    const i = t.randomContent;
    if (!Ue(i)) throw new Error("Invalid GodForge random content.");
    return i;
  }
}
f(se, "DEFAULT_OPTIONS", { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: !0 }, position: { width: 900, height: 700 } }), f(se, "PARTS", { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } });
class re extends L() {
  constructor(t, i = "tables") {
    super();
    f(this, "result", null);
    f(this, "error", "");
    this.randomContent = t, this.mode = i;
  }
  async _prepareContext() {
    S();
    const t = this.randomContent.listTables(), i = w();
    return {
      ui: i,
      tables: t,
      wheels: this.randomContent.listWheels().map((r) => {
        var n;
        return { ...r, tableName: ((n = t.find((a) => a.id === r.tableId)) == null ? void 0 : n.name) ?? "—" };
      }),
      result: this.result,
      error: this.error,
      showTableEditor: this.mode === "tables",
      showWheelEditor: this.mode === "wheels",
      showTables: this.mode !== "wheels",
      showWheels: this.mode !== "tables",
      isTestLab: this.mode === "test",
      managerTitle: this.mode === "tables" ? i.RANDOM_TABLES : this.mode === "wheels" ? i.FORTUNE_WHEELS : i.TEST_LAB
    };
  }
  _onRender() {
    var i, r, n;
    S();
    const t = this.element;
    (i = t == null ? void 0 : t.querySelector("[data-action='add-entry']")) == null || i.addEventListener("click", () => {
      const a = t.querySelector("[data-template='random-entry']"), c = t.querySelector("[data-entry-list]");
      a && c && c.append(a.content.cloneNode(!0));
    }), t == null || t.addEventListener("click", (a) => {
      var o;
      const c = a.target.closest("[data-action='remove-entry']");
      (o = c == null ? void 0 : c.closest("[data-entry-row]")) == null || o.remove();
    }), (r = t == null ? void 0 : t.querySelector("[data-table-form]")) == null || r.addEventListener("submit", (a) => {
      a.preventDefault(), this.createTable(a.currentTarget);
    }), (n = t == null ? void 0 : t.querySelector("[data-wheel-form]")) == null || n.addEventListener("submit", (a) => {
      a.preventDefault(), this.createWheel(a.currentTarget);
    }), t == null || t.querySelectorAll("[data-test-table]").forEach((a) => a.addEventListener("click", () => this.runAction(() => {
      const c = this.randomContent.drawTable(a.dataset.testTable ?? "", Math.random);
      this.result = c.entry;
    }))), t == null || t.querySelectorAll("[data-test-wheel]").forEach((a) => a.addEventListener("click", () => this.runAction(() => {
      const c = this.randomContent.spinWheel(a.dataset.testWheel ?? "", Math.random).draw;
      this.result = c.entry;
    })));
  }
  createTable(t) {
    S();
    const i = new FormData(t), r = [...t.querySelectorAll("[data-entry-row]")].flatMap((n) => {
      const a = this.input(n, "entry.label");
      return a ? [{ id: crypto.randomUUID(), label: a, weight: Math.max(0, Number(this.input(n, "entry.weight") || 1)), category: this.category(this.input(n, "entry.category")), description: this.input(n, "entry.description") || void 0, visibleToPlayers: !0 }] : [];
    });
    this.runAction(() => {
      this.randomContent.createTable({ name: String(i.get("table.name") ?? "").trim(), formula: String(i.get("table.formula") ?? "1d100").trim(), visibility: this.visibility(i.get("table.visibility")), entries: r });
    });
  }
  createWheel(t) {
    S();
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
      this.error = i instanceof Error ? i.message : String(i), P("Random content action failed.", i), this.render(!0);
    }
  }
}
f(re, "DEFAULT_OPTIONS", { id: "darkis-godforge-random-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.RANDOM_TABLES", resizable: !0 }, position: { width: 1100, height: 800 } }), f(re, "PARTS", { main: { template: "modules/darkis-godforge/templates/random-manager.hbs" } });
class ne extends L() {
  constructor(e, t) {
    super(), this.deities = e, this.api = t;
  }
  async _prepareContext() {
    var i, r;
    S();
    const e = (((r = (i = b()) == null ? void 0 : i.actors) == null ? void 0 : r.contents) ?? []).flatMap((n) => {
      var l;
      const a = n;
      if (a.type && a.type !== "character") return [];
      const c = (l = a.flags) == null ? void 0 : l["darkis-godforge"], o = this.deities.get((c == null ? void 0 : c.deityId) ?? "");
      return [{ id: a.id, name: a.name ?? a.id, deityName: (o == null ? void 0 : o.name) ?? "—", hasDeity: !!o }];
    }), t = this.deities.list().filter((n) => n.status !== "archived").map((n) => ({ id: n.id, name: n.name, choiceGroups: n.grantGroups.flatMap((a) => $(a)) }));
    return { ui: w(), actors: e, deities: t };
  }
  _onRender() {
    var r;
    S();
    const e = this.element, t = e == null ? void 0 : e.querySelector("[name='deityId']"), i = () => e == null ? void 0 : e.querySelectorAll("[data-deity-choices]").forEach((n) => {
      n.hidden = n.dataset.deityChoices !== (t == null ? void 0 : t.value);
    });
    t == null || t.addEventListener("change", i), i(), (r = e == null ? void 0 : e.querySelector("form")) == null || r.addEventListener("submit", (n) => {
      var u, p;
      n.preventDefault();
      const a = n.currentTarget, c = new FormData(a), o = (p = (u = b()) == null ? void 0 : u.actors) == null ? void 0 : p.get(String(c.get("actorId") ?? "")), l = String(c.get("deityId") ?? "");
      if (!o || !l) return;
      const d = {};
      e.querySelectorAll(`[data-deity-choices='${St(l)}'] input[data-group]:checked`).forEach((h) => {
        var m;
        (d[m = h.dataset.group ?? ""] ?? (d[m] = [])).push(h.value);
      }), this.api.assignDeity(o, l, d).then(() => this.render(!0)).catch((h) => P("Character assignment failed.", h));
    }), e == null || e.querySelectorAll("[data-action='reset-daily-usages']").forEach((n) => n.addEventListener("click", () => {
      var c, o;
      const a = (o = (c = b()) == null ? void 0 : c.actors) == null ? void 0 : o.get(n.dataset.actorId ?? "");
      a && (n.disabled = !0, this.api.resetActorUsages(a, "daily-preparations").then(() => {
        var l, d, u;
        return (u = (d = (l = O()) == null ? void 0 : l.notifications) == null ? void 0 : d.info) == null || u.call(d, w().RESET_DAILY_COMPLETE ?? "Daily-preparation uses were reset."), this.render(!0);
      }).catch((l) => {
        n.disabled = !1, P("Daily usage reset failed.", l);
      }));
    }));
  }
}
f(ne, "DEFAULT_OPTIONS", { id: "darkis-godforge-character-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHARACTERS", resizable: !0 }, position: { width: 900, height: 700 } }), f(ne, "PARTS", { main: { template: "modules/darkis-godforge/templates/character-manager.hbs" } });
function St(s) {
  return typeof CSS < "u" ? CSS.escape(s) : s.replace(/["'\\]/g, "\\$&");
}
class W extends L() {
  constructor(t, i = new ce(), r = new Ve(t, i), n = new Fe()) {
    super();
    f(this, "searchTerm", "");
    f(this, "sectionFilter", "overview");
    f(this, "searchTimer", null);
    f(this, "keydownRoot", null);
    f(this, "handleRootKeydown", (t) => {
      var i;
      if ((t.ctrlKey || t.metaKey) && t.key.toLocaleLowerCase() === "k") {
        t.preventDefault();
        const r = (i = this.element) == null ? void 0 : i.querySelector("[data-search]");
        r == null || r.focus(), r == null || r.select();
      }
    });
    this.deityService = t, this.adapters = i, this.api = r, this.randomContent = n;
  }
  async _prepareContext() {
    var d, u, p, h, m, A, I, g;
    S();
    const t = w(), i = this.deityService.list().map((E) => {
      const y = It(E).filter((D) => D.level === "error").length;
      return {
        ...E,
        image: k(E.image),
        errors: y,
        statusLabel: t[`STATUS_${E.status.toUpperCase()}`] ?? E.status,
        updatedLabel: At(E.updatedAt)
      };
    }), r = this.searchTerm.toLocaleLowerCase(), n = i.filter((E) => this.matchesSection(E) && (!r || `${E.name} ${E.title} ${E.domains.join(" ")}`.toLocaleLowerCase().includes(r))), a = ((p = (u = (d = b()) == null ? void 0 : d.actors) == null ? void 0 : u.contents) == null ? void 0 : p.filter(bt).length) ?? 0, c = b(), o = ((m = (h = c == null ? void 0 : c.modules) == null ? void 0 : h.get("darkis-godforge")) == null ? void 0 : m.version) ?? "—", l = ((A = c == null ? void 0 : c.system) == null ? void 0 : A.id) ?? "—";
    return {
      ui: t,
      deities: n,
      hasAnyDeities: i.length > 0,
      searchTerm: this.searchTerm,
      nav: { [this.sectionFilter]: !0 },
      recent: [...i].sort((E, y) => y.updatedAt.localeCompare(E.updatedAt)).slice(0, 6),
      stats: {
        deities: i.length,
        pantheons: new Set(i.flatMap((E) => E.pantheonIds ?? [])).size,
        published: i.filter((E) => E.status === "published").length,
        bonuses: i.reduce((E, y) => E + y.passiveBonuses.length, 0),
        abilities: i.reduce((E, y) => E + y.abilities.length, 0),
        invalid: i.filter((E) => E.errors > 0).length,
        assignedActors: a
      },
      systemInfo: {
        foundry: (c == null ? void 0 : c.version) ?? "—",
        system: l,
        systemVersion: ((I = c == null ? void 0 : c.system) == null ? void 0 : I.version) ?? "—",
        moduleVersion: o,
        adapter: ((g = this.adapters.tryGet(l)) == null ? void 0 : g.id) ?? "—",
        schema: _
      }
    };
  }
  _onRender() {
    var r, n, a, c, o;
    S();
    const t = this.element;
    if (!t) return;
    t.querySelectorAll("[data-action='create']").forEach((l) => l.addEventListener("click", () => new B(this.deityService, () => void this.render(!0), this.adapters).render(!0))), t.querySelectorAll("[data-action='codex']").forEach((l) => l.addEventListener("click", () => new M(this.deityService).render(!0))), t.querySelectorAll("[data-action='player-preview']").forEach((l) => l.addEventListener("click", () => new M(this.deityService, void 0, void 0, void 0, void 0, { isGM: !1, selection: !0 }).render(!0))), t.querySelectorAll("[data-section]").forEach((l) => l.addEventListener("click", () => {
      const d = l.dataset.section;
      (d === "overview" || d === "deities" || d === "pantheons" || d === "abilities" || d === "bonuses") && (this.sectionFilter = d, this.render(!0));
    })), (r = t.querySelector("[data-manager='replacements']")) == null || r.addEventListener("click", () => void new ie(this.deityService, this.adapters).render(!0)), t.querySelectorAll("[data-manager='data']").forEach((l) => l.addEventListener("click", () => {
      const d = l.dataset.managerMode === "migration" ? "migration" : "transfer";
      new se(this.deityService, this.api, this.randomContent, d).render(!0);
    })), t.querySelectorAll("[data-manager='random']").forEach((l) => l.addEventListener("click", () => {
      const d = l.dataset.managerMode, u = d === "wheels" || d === "test" ? d : "tables";
      new re(this.randomContent, u).render(!0);
    })), (n = t.querySelector("[data-manager='characters']")) == null || n.addEventListener("click", () => void new ne(this.deityService, this.api).render(!0)), (a = t.querySelector("[data-action='toggle-context']")) == null || a.addEventListener("click", () => {
      var l;
      return (l = t.querySelector(".dg-app-shell")) == null ? void 0 : l.classList.toggle("context-open");
    }), (c = t.querySelector("[data-action='settings']")) == null || c.addEventListener("click", () => this.openSettings()), t.querySelectorAll("[data-scroll]").forEach((l) => l.addEventListener("click", () => {
      var d;
      return (d = t.querySelector(`[data-section-target='${l.dataset.scroll ?? ""}']`)) == null ? void 0 : d.scrollIntoView({ behavior: "smooth", block: "start" });
    })), t.querySelectorAll("[data-deity]").forEach((l) => l.addEventListener("click", () => {
      const d = this.deityService.get(l.dataset.deity ?? "");
      d && new te(d, this.deityService, this.adapters).render(!0);
    }));
    const i = t.querySelector("[data-search]");
    i && (i.value = this.searchTerm), i == null || i.addEventListener("input", () => {
      this.searchTerm = i.value, this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => void this.render(!0), 140);
    }), this.keydownRoot !== t && ((o = this.keydownRoot) == null || o.removeEventListener("keydown", this.handleRootKeydown), t.addEventListener("keydown", this.handleRootKeydown), this.keydownRoot = t);
  }
  _onClose() {
    var t;
    this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = null, (t = this.keydownRoot) == null || t.removeEventListener("keydown", this.handleRootKeydown), this.keydownRoot = null;
  }
  openSettings() {
    var n, a, c, o, l;
    const t = globalThis, i = ((c = (a = (n = t.foundry) == null ? void 0 : n.applications) == null ? void 0 : a.settings) == null ? void 0 : c.SettingsConfig) ?? t.SettingsConfig;
    if (i) {
      new i({ initialCategory: "darkis-godforge" }).render(!0);
      return;
    }
    const r = (l = (o = b()) == null ? void 0 : o.settings) == null ? void 0 : l.sheet;
    r && r.render(!0);
  }
  matchesSection(t) {
    var i;
    return this.sectionFilter === "pantheons" ? !!((i = t.pantheonIds) != null && i.length) : this.sectionFilter === "abilities" ? t.abilities.length > 0 : this.sectionFilter === "bonuses" ? t.passiveBonuses.length > 0 : !0;
  }
}
f(W, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1440, height: 900 } }), f(W, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
function bt(s) {
  var t;
  const e = (t = s.flags) == null ? void 0 : t["darkis-godforge"];
  return !!(e && typeof e == "object" && "deityId" in e);
}
function At(s) {
  const e = new Date(s);
  return Number.isNaN(e.getTime()) ? "—" : new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(e);
}
class ae extends j() {
  constructor(e, t, i, r) {
    super(), this.actor = e, this.api = t, this.socketRouter = i, this.openCodex = r;
  }
  async _prepareContext() {
    const e = this.api.getCharacterWidgetData(this.actor);
    return { ui: w(), actorId: this.actor.id, ...e, deity: e.deity ? { ...e.deity, image: k(e.deity.image) } : null, abilities: e.abilities.map((t) => ({ ...t, remaining: t.uses ? Math.max(0, t.uses.max - t.uses.used) : null, available: !t.uses || t.uses.used < t.uses.max })) };
  }
  _onRender() {
    var t;
    const e = this.element;
    (t = e == null ? void 0 : e.querySelector("[data-action='codex']")) == null || t.addEventListener("click", this.openCodex), e == null || e.querySelectorAll("[data-ability]").forEach((i) => i.addEventListener("click", () => void this.socketRouter.activate({ actorId: this.actor.id, abilityId: i.dataset.ability ?? "", options: {} }).then(() => this.render(!0)).catch((r) => P("Ability activation failed.", r))));
  }
}
f(ae, "DEFAULT_OPTIONS", { id: "darkis-godforge-hub", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.HUB", resizable: !0 }, position: { width: 520, height: 650 } }), f(ae, "PARTS", { main: { template: "modules/darkis-godforge/templates/hub.hbs" } });
class Tt {
  constructor() {
    f(this, "definitions", /* @__PURE__ */ new Map());
    f(this, "persistDefinition");
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
    const t = Pe(e).definition;
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
const K = "darkis-godforge";
class vt {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var i;
      const t = (i = e.flags) == null ? void 0 : i[K];
      return t && typeof t == "object" && "deity" in t && Ee(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var c;
      const a = (c = n.flags) == null ? void 0 : c[K];
      return a && typeof a == "object" && "deity" in a && Ee(a.deity) && a.deity.id === e.id;
    }), i = { [K]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: i }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: i })).uuid : null;
  }
}
function wt(s) {
  if (!s || typeof s != "object" || !("registerModule" in s)) return null;
  const t = s.registerModule("darkis-godforge");
  if (!t || typeof t != "object" || !("register" in t) || !("executeAsGM" in t)) return null;
  const i = t;
  return {
    register: (r, n) => i.register(r, async function(a) {
      var o;
      const c = (o = this.socketdata) == null ? void 0 : o.userId;
      if (!c) throw new Error("Socketlib did not provide an authenticated sender.");
      return n(a, c);
    }),
    executeAsGM: (r, n) => i.executeAsGM(r, n)
  };
}
function Te(s, e, t) {
  var d;
  const i = s.actor;
  if (!i || !_t(i) || !Ot(i)) return;
  const r = Dt(e), n = (r == null ? void 0 : r.closest(".application, .window-app, .app")) ?? r, a = n == null ? void 0 : n.querySelector(".window-header");
  if (!a) return;
  (d = a.querySelector(".darkis-godforge-sheet-button")) == null || d.remove();
  const c = R("DARKIS_GODFORGE.UI.OPEN_HUB"), o = document.createElement("a");
  o.className = "darkis-godforge-sheet-button header-control", o.title = c, o.setAttribute("aria-label", c), o.setAttribute("role", "button"), o.innerHTML = '<i class="fas fa-hammer" aria-hidden="true"></i>', o.addEventListener("click", (u) => {
    u.preventDefault(), u.stopPropagation(), t(i);
  });
  const l = a.querySelector("button.close, a.close, .header-button.close, [data-action='close']");
  l ? l.before(o) : a.append(o);
}
function Dt(s) {
  var i;
  if (s instanceof HTMLElement) return s;
  const e = s, t = (e == null ? void 0 : e[0]) ?? ((i = e == null ? void 0 : e.get) == null ? void 0 : i.call(e, 0));
  return t instanceof HTMLElement ? t : null;
}
function _t(s) {
  var t;
  const e = (t = s.flags) == null ? void 0 : t["darkis-godforge"];
  return !!(e && typeof e == "object" && "deityId" in e);
}
function Ot(s) {
  var t, i;
  const e = (t = b()) == null ? void 0 : t.user;
  return (e == null ? void 0 : e.isGM) === !0 || ((i = s.testUserPermission) == null ? void 0 : i.call(s, e, "OWNER")) === !0;
}
const v = "darkis-godforge";
function Rt(s, e, t) {
  return class extends W {
    constructor() {
      super(s, void 0, e, t);
    }
  };
}
function Nt(s, e, t, i, r = () => {
}) {
  if (!s || typeof s != "object" || Array.isArray(s)) return;
  const n = s, a = Math.max(-1, ...Object.values(n).map((c) => c.order ?? -1)) + 1;
  n[v] = {
    name: v,
    title: "DARKIS_GODFORGE.UI.TITLE",
    icon: "fas fa-hammer",
    order: a,
    visible: !0,
    tools: {
      hub: { name: "hub", title: "DARKIS_GODFORGE.UI.OPEN_HUB", icon: "fas fa-star", order: 0, button: !0, visible: !0, onChange: (c, o) => r() },
      codex: { name: "codex", title: "DARKIS_GODFORGE.UI.OPEN_CODEX", icon: "fas fa-book-open", order: 1, button: !0, visible: !0, onChange: (c, o) => t() },
      dashboard: { name: "dashboard", title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 2, button: !0, visible: i, onChange: (c, o) => e() }
    }
  };
}
function Ct(s, e, t, i, r, n, a) {
  const c = oe();
  c && (c.Hooks.once("init", () => {
    var u, p;
    const o = ve("init");
    if (!o) return;
    we(o, s, t, i, a);
    const l = ((p = (u = o.modules) == null ? void 0 : u.get(v)) == null ? void 0 : p.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], d = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...l.map((h) => [h.lang, h.name])]);
    if (!o.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!o.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try {
        o.settings.registerMenu(v, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: Rt(e, s, n), restricted: !0 });
      } catch (h) {
        console.error("Darkis GodForge | Could not register dashboard settings menu.", h);
      }
      try {
        o.settings.register(v, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: d, onChange: (h) => {
          if (typeof h != "string" || h === "auto") return;
          const m = l.find((A) => A.lang === h);
          m != null && m.path && Ie(h, `modules/${v}/${m.path}`);
        } });
      } catch (h) {
        console.error("Darkis GodForge | Could not register language setting.", h);
      }
      try {
        o.settings.register(v, "random-content", { scope: "world", config: !1, type: Object, default: { tables: [], wheels: [] } });
      } catch (h) {
        console.error("Darkis GodForge | Could not register random content storage.", h);
      }
    }
    if (!o.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try {
      o.keybindings.register(v, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
        var h, m;
        return ((m = (h = b()) == null ? void 0 : h.user) == null ? void 0 : m.isGM) !== !0 ? !1 : (t(), !0);
      } }), o.keybindings.register(v, "open-hub", { name: "DARKIS_GODFORGE.UI.OPEN_HUB", editable: [{ key: "KeyG" }], restricted: !1, onDown: () => (a == null || a(), !0) }), o.keybindings.register(v, "open-codex", { name: "DARKIS_GODFORGE.UI.OPEN_CODEX", editable: [{ key: "KeyG", modifiers: ["Shift"] }], restricted: !1, onDown: () => (i(), !0) });
    } catch (h) {
      console.error("Darkis GodForge | Could not register keybindings.", h);
    }
  }), c.Hooks.on("getSceneControlButtons", (...o) => {
    var l, d;
    Nt(o[0], t, i, ((d = (l = b()) == null ? void 0 : l.user) == null ? void 0 : d.isGM) === !0, () => a == null ? void 0 : a());
  }), c.Hooks.on("renderCharacterSheetPF2e", (o, l) => {
    a && Te(o, l, a);
  }), c.Hooks.on("renderActorSheet", (o, l) => {
    a && Te(o, l, a);
  }), c.Hooks.on("pf2e.restForTheNight", (o) => {
    var l, d;
    ((d = (l = b()) == null ? void 0 : l.system) == null ? void 0 : d.id) !== "pf2e" || !o || typeof o != "object" || !("id" in o) || s.resetActorUsages(o, "daily-preparations").catch((u) => console.error("Darkis GodForge | Could not reset daily-preparation usages.", u));
  }), c.Hooks.once("ready", async () => {
    var l, d, u, p, h, m, A, I, g, E;
    const o = ve("ready");
    if (o) {
      we(o, s, t, i, a);
      try {
        const y = (d = (l = o.settings) == null ? void 0 : l.get) == null ? void 0 : d.call(l, v, "language"), D = (h = (p = (u = o.modules) == null ? void 0 : u.get(v)) == null ? void 0 : p.languages) == null ? void 0 : h.find((Be) => Be.lang === y);
        typeof y == "string" && (D != null && D.path) && await Ie(y, `modules/${v}/${D.path}`);
      } catch (y) {
        console.error("Darkis GodForge | Could not load the selected language.", y);
      }
      try {
        if (o.journal) {
          const y = new vt(o.journal);
          for (const D of y.load()) e.save(D);
          e.setPersistence((D) => y.save(D));
        }
      } catch (y) {
        console.error("Darkis GodForge | Could not load deity journals.", y);
      }
      try {
        if (n) {
          const y = (A = (m = o.settings) == null ? void 0 : m.get) == null ? void 0 : A.call(m, v, "random-content");
          n.load(y && typeof y == "object" ? y : null), (I = o.settings) != null && I.set && n.setPersistence((D) => o.settings.set(v, "random-content", D));
        }
      } catch (y) {
        console.error("Darkis GodForge | Could not load random content.", y);
      }
      try {
        const y = wt((E = (g = o.modules) == null ? void 0 : g.get("socketlib")) == null ? void 0 : E.api);
        y && r && (r.setTransport(y), r.register());
      } catch (y) {
        console.error("Darkis GodForge | Could not initialize socketlib integration.", y);
      }
    }
  }));
}
function ve(s) {
  const e = b();
  return e || console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${s}.`), e ?? null;
}
function we(s, e, t, i, r) {
  var c;
  const n = (c = s.modules) == null ? void 0 : c.get(v);
  if (!n) {
    console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed.");
    return;
  }
  const a = e;
  a.openDashboard = t, a.openCodex = i, r && (a.openHub = r), n.api = a;
}
class kt {
  constructor(e, t, i) {
    f(this, "activations", /* @__PURE__ */ new Map());
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
const Y = new Tt(), fe = new ce(), V = new Ve(Y, fe), xe = new Fe();
let De = null;
function _e() {
  if (!pe()) {
    me();
    return;
  }
  De ?? (De = new W(Y, fe, V, xe)), De.render(!0).catch((s) => {
    var e, t, i;
    console.error("Darkis GodForge | Could not open dashboard.", s), (i = (t = (e = O()) == null ? void 0 : e.notifications) == null ? void 0 : t.error) == null || i.call(t, R("DARKIS_GODFORGE.ERROR.DASHBOARD_OPEN"));
  });
}
function He() {
  new M(Y, void 0, V, ge, qe()).render(!0).catch((e) => {
    var t, i, r;
    console.error("Darkis GodForge | Could not open codex.", e), (r = (i = (t = O()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, R("DARKIS_GODFORGE.ERROR.CODEX_OPEN"));
  });
}
const Oe = /* @__PURE__ */ new Map();
function Lt(s) {
  var i, r, n;
  const e = s ?? qe();
  if (!e) {
    (n = (r = (i = O()) == null ? void 0 : i.notifications) == null ? void 0 : r.warn) == null || n.call(r, R("DARKIS_GODFORGE.UI.SELECT_CHARACTER_FIRST"));
    return;
  }
  let t = Oe.get(e.id);
  t || (t = new ae(e, V, ge, He), Oe.set(e.id, t)), t.render(!0).catch((a) => {
    var c, o, l;
    console.error("Darkis GodForge | Could not open hub.", a), (l = (o = (c = O()) == null ? void 0 : c.notifications) == null ? void 0 : o.error) == null || l.call(o, R("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
const Re = oe(), ge = new kt(V, { get currentUserId() {
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
Re ? (Ct(V, Y, _e, He, ge, xe, Lt), Re.Hooks.once("ready", () => {
  var e, t, i, r, n;
  const s = (t = (e = b()) == null ? void 0 : e.system) == null ? void 0 : t.id;
  s && !fe.supports(s) && ((n = (r = (i = O()) == null ? void 0 : i.notifications) == null ? void 0 : r.warn) == null || n.call(r, R("DARKIS_GODFORGE.ERROR.UNSUPPORTED_SYSTEM").replace("{system}", s)));
})) : typeof document < "u" && _e();
function qe() {
  var t, i, r, n;
  const s = globalThis.canvas, e = ((i = (t = s == null ? void 0 : s.tokens) == null ? void 0 : t.controlled) == null ? void 0 : i.map((a) => a.actor).filter((a) => !!a)) ?? [];
  return e.length === 1 ? e[0] : (n = (r = b()) == null ? void 0 : r.user) == null ? void 0 : n.character;
}
export {
  W as GodForgeDashboard,
  V as api,
  Y as deityService,
  xe as randomContentService,
  fe as registry,
  ge as socketRouter
};
