var ni = Object.defineProperty;
var ai = (r, t, e) => t in r ? ni(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var v = (r, t, e) => ai(r, typeof t != "symbol" ? t + "" : t, e);
function Ht(r, t) {
  return {
    name: r.name,
    type: "deity",
    img: r.image,
    system: {
      category: "deity",
      description: { value: r.description },
      sanctification: li(r.sanctification),
      domains: { primary: [...r.domains], alternate: [...r.alternateDomains ?? []] },
      font: ci(r.font),
      attribute: [...r.divineAttributes ?? []],
      skill: r.skill ? [r.skill] : null,
      weapons: r.favoredWeapon ? [r.favoredWeapon] : [],
      spells: structuredClone(r.spells ?? {}),
      traits: { otherTags: [] }
    },
    flags: { "darkis-godforge": { definitionUuid: t } }
  };
}
function ci(r) {
  if (r === "heal-harm") return ["heal", "harm"];
  const t = (r == null ? void 0 : r.split(",").map((e) => e.trim().toLocaleLowerCase()).filter((e) => e === "harm" || e === "heal")) ?? [];
  return [...new Set(t)];
}
function li(r) {
  if (r === "holy-unholy") return { modal: "can", what: ["holy", "unholy"] };
  const t = (r == null ? void 0 : r.split(",").map((e) => e.trim().toLocaleLowerCase()).filter((e) => e === "holy" || e === "unholy")) ?? [];
  return t.length ? { modal: "can", what: [...new Set(t)] } : null;
}
function re() {
  const r = globalThis, t = typeof Hooks < "u" ? Hooks : r.Hooks;
  return t ? { Hooks: t } : null;
}
function S() {
  const r = globalThis;
  return typeof game < "u" ? game : r.game;
}
function U() {
  const r = globalThis;
  return typeof ui < "u" ? ui : r.ui;
}
function di(r) {
  var e, i, s, o;
  const t = globalThis;
  return (r == null ? void 0 : r.documentClass) ?? ((i = (e = t.foundry) == null ? void 0 : e.documents) == null ? void 0 : i.JournalEntry) ?? ((o = (s = t.CONFIG) == null ? void 0 : s.JournalEntry) == null ? void 0 : o.documentClass) ?? null;
}
function _e(r) {
  if (!r || typeof r != "object") return !1;
  const t = r;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities);
}
async function Xe(r) {
  var s, o, n, a, l, c, u, d, h, p, f, m, b;
  const e = (((o = (s = S()) == null ? void 0 : s.packs) == null ? void 0 : o.contents) ?? []).filter((E) => {
    var g;
    return E.documentName === "Item" && (!((g = E.metadata) != null && g.system) || E.metadata.system === r);
  }), i = [];
  for (const E of e) {
    const g = await E.getIndex({ fields: ["type", "img", "system.domains", "system.alignment", "system.skill", "system.weapons", "system.pantheon"] });
    for (const y of g) {
      if (y.type !== "deity" || !y._id || !y.name || !E.collection) continue;
      const w = `Compendium.${E.collection}.Item.${y._id}`, I = Array.isArray((n = y.system) == null ? void 0 : n.domains) ? y.system.domains : [...((l = (a = y.system) == null ? void 0 : a.domains) == null ? void 0 : l.primary) ?? [], ...((u = (c = y.system) == null ? void 0 : c.domains) == null ? void 0 : u.alternate) ?? []];
      i.push({ id: w, sourceUuid: w, official: !0, name: y.name, title: y.name, image: y.img, domains: I, alignment: (d = y.system) == null ? void 0 : d.alignment, skill: (p = (h = y.system) == null ? void 0 : h.skill) == null ? void 0 : p.join(", "), favoredWeapon: (m = (f = y.system) == null ? void 0 : f.weapons) == null ? void 0 : m.join(", "), pantheon: (b = y.system) == null ? void 0 : b.pantheon });
    }
  }
  return i;
}
function hi(r) {
  if (r.classId !== "cleric" && r.classId !== "champion") return null;
  const t = r.systemValues;
  return { classId: r.classId, deityId: r.deityId, grants: r.grants, domains: { available: t.domains, alternate: t.alternateDomains, pick: r.classId === "cleric" ? 1 : 0 }, divineAttributes: t.divineAttributes, grantedSpells: t.spells, divineFont: r.classId === "cleric" ? t.font : void 0, favoredWeapon: t.favoredWeapon, trainedSkill: r.classId === "cleric" ? t.skill : void 0, sanctification: t.sanctification, cause: r.classId === "champion" ? t.cause : void 0 };
}
const Ce = /* @__PURE__ */ new Map();
function Je(r, t) {
  var o, n;
  const e = `${r}:${((n = (o = S()) == null ? void 0 : o.system) == null ? void 0 : n.version) ?? ""}`, i = Ce.get(e);
  if (i) return i;
  const s = pi(r, t).catch((a) => {
    throw Ce.delete(e), a;
  });
  return Ce.set(e, s), s;
}
async function pi(r, t) {
  var c, u, d, h, p, f;
  const e = fi(r), s = (((u = (c = S()) == null ? void 0 : c.packs) == null ? void 0 : u.contents) ?? []).filter((m) => {
    var b;
    return m.documentName === "Item" && (!((b = m.metadata) != null && b.system) || m.metadata.system === r);
  }), o = [], n = [], a = await Ei(s, 4, async (m) => ({
    pack: m,
    index: await m.getIndex({ fields: ["type", "img", "system.slug", "system.category", "system.group", "system.traits", "system.level", "system.rank", "system.publication.remaster"] })
  }));
  for (const { pack: m, index: b } of a)
    for (const E of b) {
      if (!E._id || !E.name || !m.collection || E.type !== "weapon" && E.type !== "spell") continue;
      const g = E.system ?? {}, y = {
        value: `Compendium.${m.collection}.Item.${E._id}`,
        label: E.name,
        slug: Oe(g.slug) ?? E.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        img: E.img,
        category: Oe(g.category),
        group: Oe(g.group),
        traits: gi(((d = g.traits) == null ? void 0 : d.value) ?? g.traits),
        source: ((h = m.metadata) == null ? void 0 : h.label) ?? m.collection,
        rank: yi(g.rank ?? ((p = g.level) == null ? void 0 : p.value) ?? g.level),
        remaster: ((f = g.publication) == null ? void 0 : f.remaster) === !0,
        available: !0
      };
      E.type === "weapon" ? o.push(y) : n.push(y);
    }
  return {
    skills: Ne(e.skills, t),
    domains: Ne(e.deityDomains ?? e.domains, []),
    weapons: dt(o),
    spells: dt(n),
    fonts: [x("heal", "Heilen / Heal"), x("harm", "Schaden / Harm"), x("heal-harm", "Heilen oder Schaden / Either"), x("none", "Keine / None")],
    sanctifications: [x("holy", "Heilig / Holy"), x("unholy", "Unheilig / Unholy"), x("holy-unholy", "Heilig oder unheilig / Either"), x("none", "Keine / None")],
    attributes: Ne(e.abilities ?? e.attributes, ["str", "dex", "con", "int", "wis", "cha"])
  };
}
function fi(r) {
  var i;
  const t = globalThis, e = r === "sfrpg" ? "SFRPG" : "PF2E";
  return ((i = t.CONFIG) == null ? void 0 : i[e]) ?? {};
}
function Ne(r, t) {
  return !r || typeof r != "object" ? t.map((e) => x(e, qt(e))) : Object.entries(r).map(([e, i]) => x(e, mi(i, e))).sort((e, i) => e.label.localeCompare(i.label));
}
function mi(r, t) {
  var s, o, n;
  const e = typeof r == "string" ? r : r && typeof r == "object" ? String(r.label ?? r.name ?? t) : t, i = (n = (o = (s = S()) == null ? void 0 : s.i18n) == null ? void 0 : o.localize) == null ? void 0 : n.call(o, e);
  return i && i !== e ? i : e.includes(".") ? qt(t) : e;
}
function dt(r) {
  return [...new Map(r.map((t) => [t.value, t])).values()].sort((t, e) => t.label.localeCompare(e.label));
}
function x(r, t) {
  return { value: r, label: t };
}
function qt(r) {
  return r.replaceAll("-", " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Oe(r) {
  if (typeof r == "string") return r;
  if (r && typeof r == "object" && typeof r.value == "string") return String(r.value);
}
function gi(r) {
  return Array.isArray(r) ? r.filter((t) => typeof t == "string") : void 0;
}
function yi(r) {
  const t = Number(r);
  return Number.isFinite(t) ? t : void 0;
}
async function Ei(r, t, e) {
  const i = new Array(r.length);
  let s = 0;
  const o = async () => {
    for (; s < r.length; ) {
      const n = s++;
      i[n] = await e(r[n]);
    }
  };
  return await Promise.all(Array.from({ length: Math.min(t, r.length) }, () => o())), i;
}
class bi {
  constructor() {
    v(this, "id", "pf2e");
    v(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery", "perception", "ac", "attack-roll"] });
  }
  async materialize(t, e) {
    return e ? (await e.createItem(Ht(t, t.id))).uuid : null;
  }
  async listOfficialDeities() {
    return Xe(this.id);
  }
  listSkills() {
    var e, i;
    const t = (i = (e = globalThis.CONFIG) == null ? void 0 : e.PF2E) == null ? void 0 : i.skills;
    return t ? Object.keys(t).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Je(this.id, this.listSkills());
  }
  buildPassiveBonus(t) {
    return { key: "FlatModifier", selector: t.selector, value: t.value, type: t.modifierType, slug: t.id };
  }
  buildClassCoupling(t) {
    return hi(t);
  }
}
class vi {
  constructor() {
    v(this, "id", "sfrpg");
    v(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !1, abilities: !1, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(t, e) {
    return null;
  }
  async listOfficialDeities() {
    return Xe(this.id);
  }
  listSkills() {
    var e, i;
    const t = (i = (e = globalThis.CONFIG) == null ? void 0 : e.SFRPG) == null ? void 0 : i.skills;
    return t ? Object.keys(t).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Je(this.id, this.listSkills());
  }
  buildPassiveBonus(t) {
    return { key: "Modifier", selector: t.selector, value: t.value, type: t.modifierType, slug: t.id };
  }
  buildClassCoupling(t) {
    return null;
  }
}
class Ii {
  constructor() {
    v(this, "id", "sf2e");
    v(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(t, e) {
    return e ? (await e.createItem(Ht(t, t.id))).uuid : null;
  }
  async listOfficialDeities() {
    return Xe(this.id);
  }
  listSkills() {
    var e, i;
    const t = (i = (e = globalThis.CONFIG) == null ? void 0 : e.PF2E) == null ? void 0 : i.skills;
    return t ? Object.keys(t).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Je(this.id, this.listSkills());
  }
  buildPassiveBonus(t) {
    return { key: "FlatModifier", selector: t.selector, value: t.value, type: t.modifierType, slug: t.id };
  }
  buildClassCoupling(t) {
    return { classId: t.classId, deityId: t.deityId, system: t.systemValues, grants: t.grants };
  }
}
class Qe {
  constructor() {
    v(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new bi()), this.register(new Ii()), this.register(new vi());
  }
  register(t) {
    this.adapters.set(t.id, t);
  }
  get(t) {
    const e = this.adapters.get(t);
    if (!e) throw new Error(`Unsupported game system: ${t}`);
    return e;
  }
  tryGet(t) {
    return this.adapters.get(t) ?? null;
  }
  supports(t) {
    return this.adapters.has(t);
  }
}
function Z(r, t) {
  var e, i, s;
  return t.isGM || !((e = r.discovery) != null && e.enabled) || t.actorDeityId === r.id || t.userId && ((i = r.discovery.revealedToUsers) != null && i.includes(t.userId)) || t.actorId && ((s = r.discovery.revealedToActors) != null && s.includes(t.actorId)) ? "revealed" : r.discovery.defaultState;
}
function L(r, t, e) {
  if (e.isGM) return !0;
  const i = e.actorDeityId === t;
  switch (r) {
    case "public":
      return !0;
    case "selection":
      return e.selection === !0;
    case "followers":
    case "hidden-until-selected":
      return i;
    case "owner":
      return i && e.ownsActor === !0;
    case "trusted":
      return e.isTrusted === !0;
    case "gm":
      return !1;
  }
}
function X(r, t) {
  return t.isGM ? !0 : r.status === "published" && L(r.visibility.deity, r.id, t);
}
function K(r, t) {
  if (!X(r, t)) return null;
  const e = r.visibility.fields, i = { id: r.id, name: r.name, title: r.title };
  L(e.portrait, r.id, t) && (i.image = r.image), L(e.portrait, r.id, t) && (i.symbol = r.symbol, i.imagePresentation = structuredClone(r.imagePresentation ?? {})), L(e.description, r.id, t) && (i.description = r.description), L(e.quote, r.id, t) && (i.quote = r.quote), L(e.pantheon, r.id, t) && (i.pantheonIds = structuredClone(r.pantheonIds ?? []));
  const s = t.selection === !0 && r.visibility.showMechanicsInSelection === !0;
  return (L(e.domains, r.id, t) || s) && (i.domains = structuredClone(r.domains), i.alternateDomains = structuredClone(r.alternateDomains ?? [])), (L(e.spells, r.id, t) || s) && (i.spells = structuredClone(r.spells ?? {})), (L(e.favoredWeapon, r.id, t) || s) && (i.favoredWeapon = r.favoredWeapon), L(e.edicts, r.id, t) && (i.edicts = structuredClone(r.edicts ?? [])), L(e.anathema, r.id, t) && (i.anathema = structuredClone(r.anathema ?? [])), (L(e.bonuses, r.id, t) || s) && (i.passiveBonuses = r.passiveBonuses.filter((o) => o.enabled !== !1 && L(o.visibility ?? "followers", r.id, t)).map((o) => wi(o, s || L(e.numericValues, r.id, t)))), (L(e.abilities, r.id, t) || s) && (i.abilities = r.abilities.filter((o) => o.enabled !== !1 && L(o.visibility ?? "followers", r.id, t)).map((o) => Ai(o, s || L(e.numericValues, r.id, t)))), i;
}
function wi(r, t) {
  const e = structuredClone(r);
  return t || (e.value = ""), delete e.visible, e;
}
function Ai(r, t) {
  const e = structuredClone(r), i = r.graph ? r.graph.nodes.some((s) => s.category === "trigger" && s.type === "manual") : !r.trigger || r.trigger === "manual";
  return delete e.graph, delete e.condition, e.trigger = i ? "manual" : "automatic", e.effects = [], t || (delete e.timing, delete e.uses, delete e.duration, delete e.actionCost), e;
}
function Si(r) {
  return { id: r.id, name: r.name, title: r.title, image: r.image, domains: r.domains, alignment: r.alignment };
}
function Ti(r, t, e, i = { isGM: !0 }) {
  return r.filter((s) => s.kind !== "lore" && !e.has(s.id) && X(s, i) && Z(s, i) === "revealed" && (!t.pantheonFilter || s.domains.includes(t.pantheonFilter))).flatMap((s) => {
    if (i.isGM) return [Si(s)];
    const o = K(s, i);
    return o ? [{ id: o.id, name: o.name, title: o.title ?? "", image: o.image, domains: o.domains ?? [] }] : [];
  });
}
function Ee(r, t) {
  var o;
  const e = Array.isArray(t) ? t : t ? [t] : [];
  if (r.mode === "all") return r.grants.flatMap((n) => "mode" in n ? Ee(n, e) : [n.ref]);
  const i = ((o = e.find((n) => n.groupId === r.id)) == null ? void 0 : o.refs) ?? [], s = r.grants.map((n) => "mode" in n ? n.id : n.ref);
  if (!r.pick || i.length !== r.pick || i.some((n) => !s.includes(n))) throw new Error(`Grant group ${r.id} requires ${r.pick ?? 1} valid choice(s).`);
  return i.flatMap((n) => {
    const a = r.grants.find((l) => ("mode" in l ? l.id : l.ref) === n);
    return a && "mode" in a ? Ee(a, e) : a ? [a.ref] : [];
  });
}
function Bt(r, t) {
  return r.used < r.max;
}
function Di(r, t) {
  if (!Bt(r)) throw new Error("No uses remaining.");
  return { ...r, used: r.used + 1 };
}
function _i(r, t) {
  return { ...r, used: 0, lastResetAt: t };
}
const Ci = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, Ni = /^\d+d\d+(?:[+\-]\d+)?$/, Oi = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function Wt(r) {
  const t = r.replace(/\s/g, ""), e = t.match(Ci);
  if (!e || e.join("") !== t) throw new Error("Formula contains an unsupported term.");
  return e;
}
function Ze(r) {
  const t = r.replace(/\s/g, ""), e = t.match(/\b\d+d\d+\b/g) ?? [], i = t.replace(/\b\d+d\d+\b/g, "0");
  if (e.some((s) => !/^\d+d\d+$/.test(s))) return !1;
  try {
    return new jt(Wt(i), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function Te(r, t) {
  const e = r.replace(/\s/g, "");
  if (!Ze(e)) throw new Error("Formula contains an unsupported term.");
  if (Ni.test(e)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new jt(Wt(e), t).parse();
}
async function Ri(r, t, e) {
  if (!Ze(r)) throw new Error("Formula contains an unsupported term.");
  const i = r.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let s = r;
  for (const o of [...new Set(i)]) {
    const n = await e(o);
    if (!Number.isFinite(n)) throw new Error("Dice result is not a finite number.");
    s = s.replace(new RegExp(`\\b${o}\\b`, "g"), String(n));
  }
  return Te(s, t);
}
class jt {
  constructor(t, e) {
    v(this, "position", 0);
    this.tokens = t, this.facts = e;
  }
  parse() {
    const t = this.expression();
    if (this.position !== this.tokens.length) throw new Error("Unexpected formula token.");
    if (!Number.isFinite(t)) throw new Error("Formula could not be evaluated.");
    return t;
  }
  expression() {
    let t = this.term();
    for (; this.peek("+") || this.peek("-"); ) {
      const e = this.take(), i = this.term();
      t = e === "+" ? t + i : t - i;
    }
    return t;
  }
  term() {
    let t = this.unary();
    for (; this.peek("*") || this.peek("/"); ) {
      const e = this.take(), i = this.unary();
      t = e === "*" ? t * i : t / i;
    }
    return t;
  }
  unary() {
    return this.peek("+") ? (this.take(), this.unary()) : this.peek("-") ? (this.take(), -this.unary()) : this.primary();
  }
  primary() {
    const t = this.take();
    if (t === "(") {
      const e = this.expression();
      return this.expect(")"), e;
    }
    if (/^\d/.test(t)) return Number(t);
    if (t === "@actor.level") return this.facts.actor.level;
    if (t === "@actor.hpPercent") return this.facts.actor.hpPercent ?? 0;
    if (t === "@target.hpPercent") return this.facts.target.hpPercent ?? 0;
    if (Oi.has(t)) return this.call(t);
    throw new Error("Unknown formula identifier.");
  }
  call(t) {
    this.expect("(");
    const e = [this.expression()];
    for (; this.peek(","); )
      this.take(), e.push(this.expression());
    if (this.expect(")"), t === "min" && e.length >= 1) return Math.min(...e);
    if (t === "max" && e.length >= 1) return Math.max(...e);
    if (t === "round" && e.length === 1) return Math.round(e[0]);
    if (t === "floor" && e.length === 1) return Math.floor(e[0]);
    if (t === "ceil" && e.length === 1) return Math.ceil(e[0]);
    if (t === "abs" && e.length === 1) return Math.abs(e[0]);
    if (t === "clamp" && e.length === 3) return Math.min(Math.max(e[0], e[1]), e[2]);
    if (t === "if" && e.length === 3) return e[0] !== 0 ? e[1] : e[2];
    throw new Error("Invalid formula function arguments.");
  }
  peek(t) {
    return this.tokens[this.position] === t;
  }
  take() {
    const t = this.tokens[this.position];
    if (!t) throw new Error("Unexpected end of formula.");
    return this.position += 1, t;
  }
  expect(t) {
    if (!this.peek(t)) throw new Error(`Expected ${t}.`);
    this.position += 1;
  }
}
function he(r, t) {
  if (r.type === "fact") return t[r.key] === r.equals;
  if (r.type === "compare") {
    const i = t[r.key];
    return r.operator === "eq" ? i === r.value : r.operator === "neq" ? i !== r.value : typeof i != "number" || typeof r.value != "number" ? !1 : r.operator === "gt" ? i > r.value : r.operator === "gte" ? i >= r.value : r.operator === "lt" ? i < r.value : i <= r.value;
  }
  if (r.type === "not") return !he(r.child, t);
  const e = r.children.map((i) => he(i, t));
  return r.type === "and" ? e.every(Boolean) : e.some(Boolean);
}
async function Yt(r, t) {
  const e = { messages: [], healing: 0, damage: 0, appliedModifiers: [], modifierOperations: [], appliedConditions: [], rolls: [], movements: [], resources: [], choices: [] };
  if (r.condition && !he(r.condition, t.conditionFacts ?? {})) return e;
  for (const i of r.effects) await Pe(i, t, e);
  return e;
}
async function Pe(r, t, e) {
  var i, s;
  if (r.type === "message") {
    e.messages.push(r.text);
    return;
  }
  if (r.type === "branch") {
    const o = he(r.condition, t.conditionFacts ?? {}) ? r.then : r.otherwise ?? [];
    for (const n of o) await Pe(n, t, e);
    return;
  }
  if (r.type === "choice") {
    const o = t.choose ? await t.choose(r.prompt, r.options.map(({ id: a, label: l }) => ({ id: a, label: l }))) : (i = r.options[0]) == null ? void 0 : i.id, n = r.options.find((a) => a.id === o);
    if (n) {
      e.choices.push(n.id);
      for (const a of n.effects) await Pe(a, t, e);
    }
    return;
  }
  if (r.type === "macro") {
    if (!t.runMacro) throw new Error("This ability requires GM macro authority.");
    await t.runMacro(r.command);
    return;
  }
  if (r.type === "random-wheel") {
    if (!t.rollTable) throw new Error("This ability requires a linked random table.");
    e.messages.push(await t.rollTable(r.tableId));
    return;
  }
  if (r.type === "information") {
    e.messages.push(r.text ?? `${r.mode}${r.questions ? ` (${r.questions})` : ""}`);
    return;
  }
  if (r.type === "counter") {
    const o = (s = t.actor).counters ?? (s.counters = {}), n = le(r.value, t);
    if (r.operation === "require") {
      if ((o[r.key] ?? 0) < n) throw new Error(`Counter requirement not met: ${r.key}`);
    } else o[r.key] = r.operation === "set" ? n : (o[r.key] ?? 0) + n;
    return;
  }
  if (r.type === "roll") {
    const o = r.dc === void 0 ? void 0 : le(r.dc, t);
    e.rolls.push({ type: r.roll, selector: r.selector, value: o });
    return;
  }
  if (r.type === "movement") {
    const o = le(r.distance, t);
    for (const n of z(r.target, t)) e.movements.push({ targetId: n.id, mode: r.mode, distance: o });
    return;
  }
  if (r.type === "action") {
    for (const o of z(r.target, t))
      r.operation === "lose" && o.actions !== void 0 && (o.actions = Math.max(0, o.actions - r.amount)), e.messages.push(`${o.id}: ${r.operation} ${r.amount} action(s)`);
    return;
  }
  if (r.type === "control") {
    for (const o of z(r.target, t)) o.faction = r.faction;
    return;
  }
  if (r.type === "resource") {
    const o = le(r.formula, t);
    for (const n of z(r.target, t))
      r.resource === "hp" && n.hp !== void 0 && (n.hp = Math.max(0, Math.min(n.maxHp ?? Number.MAX_SAFE_INTEGER, n.hp + (r.operation === "remove" ? -o : o)))), r.resource === "gold" && (n.gold = Math.max(0, (n.gold ?? 0) + (r.operation === "remove" ? -o : o))), r.resource === "item" && r.itemUuid && (n.items ?? (n.items = []), r.operation === "remove" ? n.items = n.items.filter((a) => a !== r.itemUuid) : n.items.push(r.itemUuid)), e.resources.push({ targetId: n.id, resource: r.resource, amount: o, operation: r.operation, itemUuid: r.itemUuid });
    return;
  }
  if (r.type === "heal" || r.type === "damage") {
    const o = /\b\d+d\d+\b/.test(r.formula) ? t.rollDice ? await Ri(r.formula, t.facts, t.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : Te(r.formula, t.facts);
    for (const n of z(r.target, t))
      r.type === "heal" ? (e.healing += o, n.hp !== void 0 && (n.hp = Math.min(n.maxHp ?? Number.MAX_SAFE_INTEGER, n.hp + o))) : (e.damage += o, n.hp !== void 0 && (n.hp = Math.max(0, n.hp - o)));
    return;
  }
  if (r.type === "modifier") {
    const o = le(r.value, t);
    for (const n of z(r.target ?? "self", t))
      n.modifiers[r.selector] = o, e.modifierOperations.push({ targetId: n.id, selector: r.selector, value: o, modifierType: r.modifierType, duration: r.duration });
    e.appliedModifiers.push(r.selector);
    return;
  }
  if (r.type === "condition")
    for (const o of z(r.target, t))
      r.operation === "remove" ? o.conditions = o.conditions.filter((n) => n !== r.condition) : r.operation === "suppress" ? o.conditions = o.conditions.map((n) => n === r.condition ? `suppressed:${n}` : n) : o.conditions.includes(r.condition) || o.conditions.push(r.condition), e.appliedConditions.push(r.condition);
}
function z(r, t) {
  if (r === "self") return [t.actor];
  if (r === "target") {
    if (!t.target) throw new Error("This ability requires a valid target.");
    return [t.target];
  }
  return r === "allies" ? t.allies ?? [] : r === "enemies" ? t.enemies ?? [] : [...new Map([t.actor, t.target, ...t.allies ?? [], ...t.enemies ?? []].filter((e) => !!e).map((e) => [e.id, e])).values()];
}
function le(r, t) {
  return typeof r == "number" ? r : Te(r, t.facts);
}
function ki(r, t, e, i) {
  const s = [];
  for (const [o, n] of Object.entries(t)) {
    const a = r[o];
    if (a) {
      n.hp !== a.hp && s.push({ kind: "actor-update", targetId: o, path: "system.attributes.hp.value", before: a.hp ?? null, after: n.hp ?? null }), n.gold !== a.gold && s.push({ kind: "actor-update", targetId: o, path: "system.currency.gp", before: a.gold ?? null, after: n.gold ?? null });
      for (const l of n.conditions.filter((c) => !a.conditions.includes(c) && !c.startsWith("suppressed:"))) s.push({ kind: "condition", targetId: o, condition: l, operation: "add" });
      for (const l of a.conditions.filter((c) => !n.conditions.includes(c))) s.push({ kind: "condition", targetId: o, condition: l, operation: "remove" });
    }
  }
  for (const o of e.modifierOperations) s.push({ kind: "create-modifier", ...o });
  for (const o of e.rolls) s.push(o.resolved && o.total !== void 0 ? { kind: "roll-result", targetId: i, rollType: o.type, selector: o.selector, total: o.total, degree: o.degree } : { kind: "roll", targetId: i, rollType: o.type, selector: o.selector, dc: o.value });
  for (const o of e.movements) s.push({ kind: "movement", targetId: o.targetId, mode: o.mode, distance: o.distance });
  for (const o of e.resources.filter((n) => n.resource !== "hp" && n.resource !== "gold")) s.push({ kind: "resource", targetId: o.targetId, resource: o.resource, amount: o.amount, operation: o.operation, itemUuid: o.itemUuid });
  for (const o of e.messages) s.push({ kind: "chat", targetId: i, text: o });
  return s;
}
function Li(r) {
  switch (r.kind) {
    case "actor-update":
      return `${r.targetId}: ${r.path} ${String(r.before)} → ${String(r.after)}`;
    case "create-modifier":
      return `${r.targetId}: ${r.selector} ${r.value >= 0 ? "+" : ""}${r.value} (${r.modifierType})`;
    case "condition":
      return `${r.targetId}: ${r.operation === "add" ? "+" : "−"} ${r.condition}`;
    case "roll":
      return `${r.targetId}: ${r.rollType} ${r.selector}${r.dc === void 0 ? "" : ` DC ${r.dc}`}`;
    case "roll-result":
      return `${r.targetId}: ${r.selector} = ${r.total}${r.degree ? ` (${r.degree})` : ""}`;
    case "movement":
      return `${r.targetId}: ${r.mode} ${r.distance}`;
    case "resource":
      return `${r.targetId}: ${r.resource} ${r.amount}`;
    case "chat":
      return r.text;
  }
}
function Pi(r, t, e = []) {
  if (!t.trim()) throw new Error("Class identifier is required for deity coupling.");
  const i = r.grantGroups.flatMap((s) => Ee(s, e));
  return { deityId: r.id, classId: t, grants: i, choices: e, systemValues: { domains: r.domains, alternateDomains: r.alternateDomains ?? [], divineAttributes: r.divineAttributes ?? [], spells: r.spells ?? {}, font: r.font, favoredWeapon: r.favoredWeapon, skill: r.skill, sanctification: r.sanctification, cause: r.cause } };
}
function de(r, t) {
  return !r || !t ? { deity: null, grants: [], abilities: [] } : { deity: { id: r.id, name: r.name, title: r.title ?? "", image: r.image }, grants: t.grants, abilities: (r.abilities ?? []).filter((e) => e.graph ? e.graph.nodes.some((i) => i.category === "trigger" && i.type === "manual") : e.trigger !== "automatic").map((e) => {
    var i;
    return { id: e.id, name: e.name, description: e.description, uses: e.uses ? { used: ((i = t.usages[e.id]) == null ? void 0 : i.used) ?? 0, max: e.uses.max } : void 0 };
  }) };
}
const ee = {
  deity: "public",
  fields: {
    portrait: "public",
    description: "public",
    quote: "public",
    pantheon: "public",
    bonuses: "followers",
    abilities: "followers",
    numericValues: "followers",
    domains: "followers",
    spells: "followers",
    favoredWeapon: "followers",
    edicts: "public",
    anathema: "public",
    gmNotes: "gm"
  },
  showMechanicsInSelection: !1
}, et = 1, ut = 200, ht = 400, pt = 262144;
function be(r) {
  if (r.category === "trigger") return [
    O("next", "flow", "output", "Next"),
    O("actor", "actor", "output", "Actor"),
    O("event", "event", "output", "Event")
  ];
  if (r.category === "result") return [
    O("in", "flow", "input", "In"),
    O("degree", "degree", "input", "Degree")
  ];
  const t = [O("in", "flow", "input", "In")];
  return r.category === "logic" ? ((r.type === "branch" || r.type === "condition") && t.push(O("value", "boolean", "input", "Value")), r.type === "compare" && t.push(O("left", "number", "input", "Left"), O("right", "number", "input", "Right")), t.push(O("true", "flow", "output", "True"), O("false", "flow", "output", "False")), t) : (t.push(O("target", "actor", "input", "Target")), ["heal", "damage", "temporary-hp", "modifier", "damage-dice", "resource", "movement", "counter"].includes(r.type) && t.push(O("value", "number", "input", "Value")), ["modifier", "damage-dice", "roll", "condition", "resource", "item"].includes(r.type) && t.push(O("selector", "text", "input", "Selector")), r.type === "roll" ? (t.push(
    O("next", "flow", "output", "Next"),
    O("critical-success", "flow", "output", "Critical success"),
    O("success", "flow", "output", "Success"),
    O("failure", "flow", "output", "Failure"),
    O("critical-failure", "flow", "output", "Critical failure"),
    O("total", "number", "output", "Total"),
    O("degree", "degree", "output", "Degree")
  ), t) : (t.push(O("next", "flow", "output", "Next")), ["heal", "damage", "resource", "counter"].includes(r.type) && t.push(O("result", "number", "output", "Result")), t));
}
const Mi = /* @__PURE__ */ new Set(["trigger", "logic", "action", "result"]), ft = /* @__PURE__ */ new Set(["flow", "actor", "number", "boolean", "text", "roll", "degree", "item", "event"]), zt = /* @__PURE__ */ new Set([
  "manual",
  "roll-complete",
  "skill-check",
  "attack-roll",
  "damage-roll",
  "saving-throw",
  "damage-taken",
  "healing-received",
  "hp-threshold",
  "condition-added",
  "condition-removed",
  "item-used",
  "spell-cast",
  "combat-start",
  "combat-end",
  "round-start",
  "turn-start",
  "turn-end",
  "daily-preparations",
  "scene-change",
  "world-time",
  "token-move",
  "deity-assigned",
  "deity-revealed",
  "deity-removed",
  "custom"
]), Ui = /* @__PURE__ */ new Set([
  "heal",
  "damage",
  "temporary-hp",
  "modifier",
  "damage-dice",
  "condition",
  "resource",
  "roll",
  "movement",
  "message",
  "information",
  "random-wheel",
  "counter",
  "choice",
  "macro",
  "item",
  "sound"
]), Gi = /* @__PURE__ */ new Set(["condition", "branch", "chance", "compare", "choice", "limit", "merge"]), Fi = /* @__PURE__ */ new Set(["success", "failure", "critical-success", "critical-failure", "approved", "denied", "summary", "message", "end"]);
function xi() {
  return { schemaVersion: et, approval: "gm", nodes: [], edges: [] };
}
function G(r) {
  var d, h;
  const t = [];
  if (!r || typeof r != "object") return { valid: !1, issues: [{ code: "graph.invalid", message: "Graph data must be an object." }], reachable: [] };
  const e = r;
  if (e.schemaVersion !== et && t.push({ code: "graph.schema", message: `Unsupported graph schema: ${String(e.schemaVersion)}.` }), e.approval !== "gm" && t.push({ code: "graph.approval", message: "Every executable graph must require GM approval." }), Array.isArray(e.nodes) || t.push({ code: "graph.nodes", message: "Graph nodes must be an array." }), Array.isArray(e.edges) || t.push({ code: "graph.edges", message: "Graph edges must be an array." }), t.length) return { valid: !1, issues: t, reachable: [] };
  const i = e.nodes, s = e.edges;
  i.length > ut && t.push({ code: "graph.node-limit", message: `A graph may contain at most ${ut} nodes.` }), s.length > ht && t.push({ code: "graph.edge-limit", message: `A graph may contain at most ${ht} edges.` }), new TextEncoder().encode(JSON.stringify(r)).length > pt && t.push({ code: "graph.size-limit", message: `A graph may contain at most ${pt} bytes.` });
  const o = /* @__PURE__ */ new Map();
  for (const p of i) {
    if (!p || typeof p != "object") {
      t.push({ code: "node.invalid", message: "Every graph node must be an object." });
      continue;
    }
    const f = p;
    if (!Re(f.id)) {
      t.push({ code: "node.id", message: "Every graph node needs a valid ID." });
      continue;
    }
    if (o.has(f.id)) {
      t.push({ code: "node.duplicate", message: `Duplicate node ID: ${f.id}.`, nodeId: f.id });
      continue;
    }
    Mi.has(f.category) || t.push({ code: "node.category", message: `Unknown node category: ${String(f.category)}.`, nodeId: f.id }), (!Re(f.type) || !Bi(f.category, f.type)) && t.push({ code: "node.type", message: `Unknown node type: ${String(f.type)}.`, nodeId: f.id }), (typeof f.label != "string" || f.label.length > 160) && t.push({ code: "node.label", message: "Node labels must contain at most 160 characters.", nodeId: f.id }), (!yt(f.x) || !yt(f.y)) && t.push({ code: "node.position", message: "Node positions must be finite coordinates.", nodeId: f.id }), (!f.config || typeof f.config != "object" || Array.isArray(f.config)) && t.push({ code: "node.config", message: "Node configuration must be an object.", nodeId: f.id }), o.set(f.id, f);
  }
  const n = [], a = /* @__PURE__ */ new Set();
  for (const p of s) {
    if (!p || typeof p != "object") {
      t.push({ code: "edge.invalid", message: "Every graph edge must be an object." });
      continue;
    }
    const f = p;
    if (!Re(f.id)) {
      t.push({ code: "edge.id", message: "Every graph edge needs a valid ID." });
      continue;
    }
    if (a.has(f.id)) {
      t.push({ code: "edge.duplicate", message: `Duplicate edge ID: ${f.id}.`, edgeId: f.id });
      continue;
    }
    a.add(f.id), (!f.from || !f.to || !o.has(f.from.nodeId) || !o.has(f.to.nodeId)) && t.push({ code: "edge.endpoint", message: "Edge endpoints must reference existing nodes.", edgeId: f.id }), (!f.from || !f.to || !ft.has(f.from.type) || !ft.has(f.to.type) || f.from.type !== f.to.type) && t.push({ code: "edge.port-type", message: "Connected ports must have the same supported type.", edgeId: f.id });
    const m = f.from, b = f.to, E = m ? o.get(m.nodeId) : void 0, g = b ? o.get(b.nodeId) : void 0;
    E && m && !be(E).some((y) => y.direction === "output" && y.port === m.port && y.type === m.type) && t.push({ code: "edge.output-port", message: "The source port is not available on this node.", edgeId: f.id }), g && b && !be(g).some((y) => y.direction === "input" && y.port === b.port && y.type === b.type) && t.push({ code: "edge.input-port", message: "The target port is not available on this node.", edgeId: f.id }), ((d = f.from) == null ? void 0 : d.nodeId) === ((h = f.to) == null ? void 0 : h.nodeId) && t.push({ code: "edge.self", message: "A node cannot connect to itself.", edgeId: f.id }), n.push(f);
  }
  const l = [...o.values()].filter((p) => p.category === "trigger");
  !l.length && o.size && t.push({ code: "graph.trigger", message: "An executable graph needs at least one trigger." });
  const c = /* @__PURE__ */ new Map();
  for (const p of n.filter((f) => {
    var m;
    return ((m = f.from) == null ? void 0 : m.type) === "flow";
  })) {
    const f = c.get(p.from.nodeId) ?? [];
    f.push(p.to.nodeId), c.set(p.from.nodeId, f);
  }
  for (const p of n.filter((f) => f.from.type !== "flow")) {
    const f = l.map((m) => m.id);
    (!zi(c, p.from.nodeId, p.to.nodeId) || Ki(c, f, p.from.nodeId).has(p.to.nodeId)) && t.push({ code: "edge.data-order", message: "A data source must execute on every path before the node that consumes it.", edgeId: p.id });
  }
  ji(c, o.keys()) && t.push({ code: "graph.cycle", message: "Unbounded graph cycles are not allowed." });
  const u = Yi(l.map((p) => p.id), c);
  for (const p of o.values()) l.length && !u.has(p.id) && t.push({ code: "node.unreachable", message: "Node is not reachable from a trigger.", nodeId: p.id });
  return { valid: t.length === 0, issues: t, reachable: [...u] };
}
function O(r, t, e, i) {
  return { port: r, type: t, direction: e, label: i };
}
function te(r) {
  var o;
  const t = {
    id: crypto.randomUUID(),
    category: "trigger",
    type: Wi(r.trigger),
    label: ((o = r.trigger) == null ? void 0 : o.trim()) || "Manual",
    x: 80,
    y: 120,
    config: r.trigger ? { event: r.trigger } : {}
  }, e = [t], i = [];
  let s = t;
  for (const [n, a] of r.effects.entries()) {
    const l = Hi(a, n);
    e.push(l), i.push(gt(s.id, l.id)), s = l;
  }
  if (!r.effects.length) {
    const n = { id: crypto.randomUUID(), category: "result", type: "end", label: "End", x: 360, y: 120, config: {} };
    e.push(n), i.push(gt(t.id, n.id));
  }
  return { schemaVersion: et, approval: "gm", nodes: e, edges: i };
}
function $i(r) {
  const t = G(r);
  if (!t.valid) throw new Error(t.issues.map((n) => n.message).join(" "));
  const e = new Map(r.nodes.map((n) => [n.id, n])), i = /* @__PURE__ */ new Map();
  for (const n of r.edges.filter((a) => a.from.type === "flow")) {
    const a = i.get(n.from.nodeId) ?? [];
    a.push(n), i.set(n.from.nodeId, a);
  }
  const s = (n, a = /* @__PURE__ */ new Set()) => {
    if (a.has(n)) return [];
    const l = new Set(a);
    l.add(n);
    const c = e.get(n);
    if (!c) return [];
    const u = i.get(n) ?? [];
    if (c.category === "logic" && ["branch", "condition", "compare", "chance"].includes(c.type)) {
      const p = u.find((b) => b.from.port === "true") ?? u[0], f = u.find((b) => b.from.port === "false") ?? u[1];
      return [{
        type: "branch",
        condition: qi(c),
        then: p ? s(p.to.nodeId, l) : [],
        otherwise: f ? s(f.to.nodeId, l) : []
      }];
    }
    const d = [], h = Kt(c);
    h && d.push(h);
    for (const p of u) d.push(...s(p.to.nodeId, l));
    return d;
  }, o = [];
  for (const n of r.nodes.filter((a) => a.category === "trigger")) o.push(...s(n.id));
  return o;
}
function Vi(r) {
  return r.nodes.slice().sort((t, e) => t.x - e.x || t.y - e.y).map((t) => `${Xi(t.category)}: ${t.label || t.type}`);
}
function mt(r) {
  const t = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
  for (const n of r.nodes) t.set(n.id, 0);
  for (const n of r.edges.filter((a) => a.from.type === "flow")) {
    t.set(n.to.nodeId, (t.get(n.to.nodeId) ?? 0) + 1);
    const a = e.get(n.from.nodeId) ?? [];
    a.push(n.to.nodeId), e.set(n.from.nodeId, a);
  }
  const i = r.nodes.filter((n) => n.category === "trigger" || (t.get(n.id) ?? 0) === 0).map((n) => ({ id: n.id, depth: 0 })), s = /* @__PURE__ */ new Map();
  for (; i.length; ) {
    const n = i.shift();
    if (!((s.get(n.id) ?? -1) >= n.depth)) {
      s.set(n.id, n.depth);
      for (const a of e.get(n.id) ?? []) i.push({ id: a, depth: n.depth + 1 });
    }
  }
  const o = /* @__PURE__ */ new Map();
  return {
    ...structuredClone(r),
    nodes: r.nodes.map((n) => {
      const a = s.get(n.id) ?? 0, l = o.get(a) ?? 0;
      return o.set(a, l + 1), { ...structuredClone(n), x: 80 + a * 280, y: 80 + l * 170 };
    })
  };
}
function Hi(r, t) {
  const e = r.type === "branch" ? "branch" : r.type, i = r.type === "branch" ? "logic" : "action";
  return { id: crypto.randomUUID(), category: i, type: e, label: Ji(e), x: 360 + t * 280, y: 120, config: structuredClone(r) };
}
function Kt(r) {
  if (r.category === "trigger" || r.category === "result" && r.type !== "summary" && r.type !== "message") return null;
  const t = structuredClone(r.config);
  if (r.category === "logic" && r.type === "branch") return { type: "branch", condition: t.condition ?? { type: "fact", key: "always", equals: !0 }, then: [], otherwise: [] };
  if (r.category === "result" && (r.type === "summary" || r.type === "message")) return { type: "message", text: String(t.text ?? r.label) };
  if (r.category !== "action") return null;
  const e = Qi(t.target);
  return r.type === "heal" || r.type === "damage" ? { type: r.type, formula: String(t.formula ?? "1"), target: e } : r.type === "temporary-hp" ? { type: "resource", resource: "hp", operation: "add", formula: String(t.formula ?? "1"), target: e } : r.type === "modifier" || r.type === "damage-dice" ? { type: "modifier", selector: String(t.selector ?? (r.type === "damage-dice" ? "strike-damage" : "all")), value: ie(t.value ?? t.formula ?? 1), modifierType: Zi(t.modifierType), target: e, duration: Et(t.duration) } : r.type === "condition" ? { type: "condition", condition: String(t.condition ?? t.aux ?? "frightened"), target: e, operation: t.operation === "remove" || t.operation === "suppress" ? t.operation : "add", duration: Et(t.duration) } : r.type === "resource" || r.type === "item" ? { type: "resource", resource: r.type === "item" ? "item" : er(t.resource), operation: tr(t.operation), formula: String(t.formula ?? "1"), target: e, itemUuid: nr(t.itemUuid ?? t.uuid) } : r.type === "roll" ? { type: "roll", roll: sr(t.roll ?? t.operation), selector: String(t.selector ?? "perception"), dc: ar(t.dc), keep: or(t.keep), target: e } : r.type === "movement" ? { type: "movement", mode: ir(t.mode ?? t.operation), distance: ie(t.distance ?? t.formula ?? 5), target: e } : r.type === "counter" ? { type: "counter", key: String(t.key ?? t.selector ?? "counter"), operation: rr(t.operation), value: ie(t.value ?? t.formula ?? 1) } : r.type === "random-wheel" ? { type: "random-wheel", tableId: String(t.tableId ?? t.uuid ?? ""), visibility: t.visibility === "public" || t.visibility === "user" ? t.visibility : "gm" } : r.type === "macro" ? { type: "macro", command: String(t.command ?? t.code ?? "") } : r.type === "message" || r.type === "information" || r.type === "sound" ? { type: "message", text: String(t.text ?? r.label) } : null;
}
function qi(r) {
  const t = r.config.condition;
  return t && typeof t == "object" ? t : r.type === "chance" ? { type: "compare", key: "random.percent", operator: "lte", value: ie(r.config.threshold ?? r.config.equals ?? 50) } : r.type === "compare" ? { type: "compare", key: String(r.config.fact ?? "actor.level"), operator: cr(r.config.operator), value: bt(r.config.equals ?? r.config.value ?? 1) } : { type: "fact", key: String(r.config.fact ?? r.config.selector ?? "always"), equals: bt(r.config.equals ?? !0) };
}
function gt(r, t) {
  return { id: crypto.randomUUID(), from: { nodeId: r, port: "next", type: "flow" }, to: { nodeId: t, port: "in", type: "flow" } };
}
function Bi(r, t) {
  return !r || !t ? !1 : r === "trigger" ? zt.has(t) : r === "logic" ? Gi.has(t) : r === "action" ? Ui.has(t) : Fi.has(t);
}
function Wi(r) {
  return r && zt.has(r) ? r : "manual";
}
function Re(r) {
  return typeof r == "string" && r.length > 0 && r.length <= 128 && /^[a-zA-Z0-9._:-]+$/.test(r);
}
function yt(r) {
  return typeof r == "number" && Number.isFinite(r) && Math.abs(r) <= 1e5;
}
function ji(r, t) {
  const e = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), s = (o) => {
    if (e.has(o)) return !0;
    if (i.has(o)) return !1;
    e.add(o);
    for (const n of r.get(o) ?? []) if (s(n)) return !0;
    return e.delete(o), i.add(o), !1;
  };
  for (const o of t) if (s(o)) return !0;
  return !1;
}
function Yi(r, t) {
  const e = /* @__PURE__ */ new Set(), i = [...r];
  for (; i.length; ) {
    const s = i.shift();
    e.has(s) || (e.add(s), i.push(...t.get(s) ?? []));
  }
  return e;
}
function zi(r, t, e) {
  if (t === e) return !1;
  const i = /* @__PURE__ */ new Set(), s = [...r.get(t) ?? []];
  for (; s.length; ) {
    const o = s.pop();
    if (o === e) return !0;
    i.has(o) || (i.add(o), s.push(...r.get(o) ?? []));
  }
  return !1;
}
function Ki(r, t, e) {
  const i = /* @__PURE__ */ new Set(), s = t.filter((o) => o !== e);
  for (; s.length; ) {
    const o = s.shift();
    o === e || i.has(o) || (i.add(o), s.push(...(r.get(o) ?? []).filter((n) => n !== e)));
  }
  return i;
}
function Xi(r) {
  return { trigger: "Trigger", logic: "Check", action: "Action", result: "Result" }[r];
}
function Ji(r) {
  return r.replaceAll("-", " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function Qi(r) {
  return r === "target" || r === "allies" || r === "enemies" || r === "group" ? r : "self";
}
function Zi(r) {
  return r === "item" || r === "circumstance" || r === "untyped" ? r : "status";
}
function er(r) {
  return r === "gold" || r === "item" ? r : "hp";
}
function tr(r) {
  return r === "remove" || r === "transfer" ? r : "add";
}
function ir(r) {
  return r === "teleport" || r === "forced" ? r : "step";
}
function rr(r) {
  return r === "set" || r === "require" ? r : "add";
}
function sr(r) {
  return r === "reroll" || r === "saving-throw" || r === "degree-of-success" ? r : "check";
}
function or(r) {
  return r === "new" || r === "higher" || r === "lower" ? r : void 0;
}
function nr(r) {
  return typeof r == "string" && r ? r : void 0;
}
function Et(r) {
  const t = Number(r);
  return Number.isFinite(t) ? t : void 0;
}
function ie(r) {
  const t = Number(r);
  return typeof r == "number" || typeof r == "string" && r.trim() !== "" && Number.isFinite(t) ? t : String(r ?? "0");
}
function ar(r) {
  return r == null || r === "" ? void 0 : ie(r);
}
function bt(r) {
  return typeof r == "boolean" ? r : ie(r);
}
function cr(r) {
  return r === "neq" || r === "gt" || r === "gte" || r === "lt" || r === "lte" ? r : "eq";
}
const P = 4;
function Xt(r) {
  if (!r || typeof r != "object") throw new Error("Invalid deity definition.");
  const t = structuredClone(r), e = typeof t.schemaVersion == "number" ? t.schemaVersion : 0;
  if (e > P) throw new Error(`Unsupported deity schema ${e}.`);
  const i = [], s = t.visibility && typeof t.visibility == "object" ? t.visibility : {}, o = lr(s, e < 3), n = hr(t.status, s.players), a = {
    ...t,
    schemaVersion: P,
    revision: Math.max(1, typeof t.revision == "number" ? t.revision : 0) + (e < P ? 1 : 0),
    createdAt: typeof t.createdAt == "string" ? t.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: e < P ? (/* @__PURE__ */ new Date()).toISOString() : String(t.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()),
    checksum: typeof t.checksum == "string" ? t.checksum : "pending",
    status: n,
    kind: t.kind === "lore" ? "lore" : "selectable",
    visibility: o,
    passiveBonuses: t.kind === "lore" ? [] : Array.isArray(t.passiveBonuses) ? t.passiveBonuses.map(pr) : [],
    abilities: t.kind === "lore" ? [] : Array.isArray(t.abilities) ? t.abilities.map(fr) : [],
    grantGroups: t.kind === "lore" ? [] : Array.isArray(t.grantGroups) ? t.grantGroups : [],
    replacement: t.kind === "lore" ? { sourceUuid: "", mode: "none", contexts: [] } : dr(t.replacement),
    imagePresentation: ur(t.imagePresentation),
    domains: Array.isArray(t.domains) ? t.domains : [],
    discovery: mr(t.discovery)
  };
  return e < P && i.push(`Legacy definition migrated to schema version ${P}.`), { definition: a, migrated: e < P, warnings: i };
}
function lr(r, t = !1) {
  if (typeof r.deity == "string" && r.fields && typeof r.fields == "object") {
    const o = r.fields, n = {
      deity: ve(r.deity, ee.deity),
      fields: Object.fromEntries(Object.entries(ee.fields).map(([a, l]) => [a, ve(o[a], l)])),
      showMechanicsInSelection: r.showMechanicsInSelection === !0
    };
    return t && (n.fields.domains = "followers", n.fields.spells = "followers", n.fields.favoredWeapon = "followers", n.fields.gmNotes = "gm"), n;
  }
  const e = r.players !== !1, i = r.library === !1 || !e ? "gm" : "public", s = r.characterSheet === !1 ? "gm" : "followers";
  return { ...structuredClone(ee), deity: i, fields: { ...structuredClone(ee.fields), bonuses: s, abilities: s } };
}
function dr(r) {
  if (!r || typeof r != "object") return { sourceUuid: "", mode: "none", contexts: [] };
  const t = r, e = typeof t.sourceUuid == "string" ? t.sourceUuid.trim() : "", i = t.mode === "hide" ? "hide" : t.mode === "replace" || e ? "replace" : "none";
  return { ...t, sourceUuid: e, mode: i, contexts: Array.isArray(t.contexts) ? t.contexts.filter((s) => typeof s == "string") : [] };
}
function ur(r) {
  if (!r || typeof r != "object") return;
  const t = {};
  for (const e of ["image", "icon", "symbol", "banner"]) {
    const i = r[e];
    if (!i || typeof i != "object") continue;
    const s = i;
    t[e] = {
      fit: s.fit === "contain" ? "contain" : "cover",
      focusX: vt(s.focusX, 50),
      focusY: vt(s.focusY, 25),
      zoom: Me(s.zoom, 1, 1, 3),
      rotation: Me(s.rotation, 0, -180, 180)
    };
  }
  return t;
}
function vt(r, t) {
  return Me(r, t, 0, 100);
}
function Me(r, t, e, i) {
  const s = Number(r);
  return Number.isFinite(s) ? Math.min(i, Math.max(e, s)) : t;
}
function hr(r, t) {
  return r === "draft" || r === "test" || r === "published" || r === "disabled" || r === "archived" ? r : t === !1 ? "draft" : "published";
}
function pr(r) {
  if (!r || typeof r != "object") return r;
  const t = r;
  return { ...t, enabled: t.enabled !== !1, visibility: ve(t.visibility, t.visible === !1 ? "gm" : "followers") };
}
function fr(r) {
  if (!r || typeof r != "object") return r;
  const t = r, e = { trigger: typeof t.trigger == "string" ? t.trigger : void 0, effects: Array.isArray(t.effects) ? t.effects : [] }, i = G(t.graph).valid ? structuredClone(t.graph) : te(e);
  return { ...t, effects: e.effects, graph: i, enabled: t.enabled !== !1, visibility: ve(t.visibility, "followers") };
}
function mr(r) {
  if (!r || typeof r != "object") return { enabled: !1, defaultState: "revealed", revealedToUsers: [], revealedToActors: [] };
  const t = r, e = t.defaultState === "hidden" || t.defaultState === "rumor" ? t.defaultState : "revealed";
  return {
    enabled: t.enabled === !0,
    defaultState: e,
    rumorName: typeof t.rumorName == "string" ? t.rumorName.slice(0, 160) : void 0,
    rumorText: typeof t.rumorText == "string" ? t.rumorText.slice(0, 2e3) : void 0,
    revealedToUsers: It(t.revealedToUsers),
    revealedToActors: It(t.revealedToActors)
  };
}
function It(r) {
  return Array.isArray(r) ? [...new Set(r.filter((t) => typeof t == "string" && t.length <= 128))].slice(0, 500) : [];
}
function ve(r, t) {
  return r === "public" || r === "selection" || r === "followers" || r === "owner" || r === "trusted" || r === "gm" || r === "hidden-until-selected" ? r : t;
}
function gr(r, t = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: P, exportedAt: t, deities: structuredClone(r) };
}
function yr(r) {
  if (!r || typeof r != "object") return !1;
  const t = r;
  return t.format !== "darkis-godforge" || typeof t.schemaVersion != "number" || t.schemaVersion < 1 || t.schemaVersion > P || !Array.isArray(t.deities) || t.deities.length > 5e3 ? !1 : t.deities.every((e) => typeof e != "object" || e === null || typeof e.id != "string" || e.id.length > 128 || typeof e.name != "string" || e.name.length > 256 || typeof e.schemaVersion != "number" || !Array.isArray(e.domains) || !Array.isArray(e.abilities) || e.abilities.length > 500 ? !1 : e.abilities.every((i) => !i.graph || G(i.graph).valid));
}
function Jt(r) {
  if (!yr(r)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return r.deities.map((t) => Xt(t).definition);
}
function tt(r, t) {
  const e = r.filter((a) => Number.isFinite(a.weight) && a.weight > 0), i = e.reduce((a, l) => a + l.weight, 0);
  if (!e.length || i <= 0) throw new Error("Random table has no selectable entries.");
  const s = Math.min(Math.max(t(), 0), 0.999999999) * i;
  let o = 0;
  for (const [a, l] of e.entries())
    if (o += l.weight, s < o) return { entry: l, index: a, roll: s };
  return { entry: e[e.length - 1], index: e.length - 1, roll: s };
}
function Er(r, t) {
  return { status: "resolved", draw: tt(r, t) };
}
function Qt(r) {
  if (!r || typeof r != "object") return !1;
  const t = r;
  if (t.tables !== void 0 && !Array.isArray(t.tables) || t.wheels !== void 0 && !Array.isArray(t.wheels)) return !1;
  const e = t.tables ?? [], i = /* @__PURE__ */ new Set();
  for (const o of e) {
    if (!Ue(o) || !W(o.id) || i.has(o.id) || !W(o.name) || !W(o.formula) || !wt(o.visibility) || !Array.isArray(o.entries) || !o.entries.length || !o.entries.every(br)) return !1;
    i.add(o.id);
  }
  const s = /* @__PURE__ */ new Set();
  for (const o of t.wheels ?? []) {
    if (!Ue(o) || !W(o.id) || s.has(o.id) || !W(o.name) || !W(o.tableId) || !i.has(o.tableId) || !wt(o.visibility) || !Ge(o.duration) || !Ge(o.minimumSpins)) return !1;
    s.add(o.id);
  }
  return !0;
}
class Zt {
  constructor() {
    v(this, "tables", /* @__PURE__ */ new Map());
    v(this, "wheels", /* @__PURE__ */ new Map());
    v(this, "persistContent");
    v(this, "persistenceQueue", Promise.resolve());
    v(this, "persistenceError", null);
  }
  setPersistence(t) {
    this.persistContent = t;
  }
  load(t) {
    const e = t ?? {};
    if (!Qt(e)) throw new Error("Invalid GodForge random content.");
    this.tables.clear(), this.wheels.clear();
    for (const i of e.tables ?? []) this.tables.set(i.id, structuredClone(i));
    for (const i of e.wheels ?? []) this.wheels.set(i.id, structuredClone(i));
  }
  replace(t) {
    this.load(t), this.persist();
  }
  async replacePersistent(t) {
    const e = this.snapshot();
    this.load(t), this.persist();
    try {
      await this.flushPersistence();
    } catch (i) {
      throw this.load(e), i;
    }
  }
  async flushPersistence() {
    if (await this.persistenceQueue, this.persistenceError) {
      const t = this.persistenceError;
      throw this.persistenceError = null, t;
    }
  }
  snapshot() {
    return { tables: this.listTables(), wheels: this.listWheels() };
  }
  listTables() {
    return [...this.tables.values()].map((t) => structuredClone(t));
  }
  listWheels() {
    return [...this.wheels.values()].map((t) => structuredClone(t));
  }
  getTable(t) {
    const e = this.tables.get(t);
    return e ? structuredClone(e) : null;
  }
  createTable(t) {
    if (!t.name.trim() || !t.entries.length) throw new Error("Random table requires a name and entries.");
    const e = { ...structuredClone(t), id: crypto.randomUUID(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return this.tables.set(e.id, e), this.persist(), structuredClone(e);
  }
  createWheel(t) {
    if (!this.tables.has(t.tableId)) throw new Error("Fortune wheel table was not found.");
    const e = { ...structuredClone(t), id: crypto.randomUUID(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return this.wheels.set(e.id, e), this.persist(), structuredClone(e);
  }
  drawTable(t, e) {
    const i = this.tables.get(t);
    if (!i) throw new Error("Random table was not found.");
    return tt(i.entries, e);
  }
  spinWheel(t, e) {
    var s;
    const i = this.wheels.get(t);
    if (!i) throw new Error("Fortune wheel was not found.");
    return Er(((s = this.tables.get(i.tableId)) == null ? void 0 : s.entries) ?? [], e);
  }
  persist() {
    if (!this.persistContent) return;
    const t = this.snapshot();
    this.persistenceQueue = this.persistenceQueue.then(async () => {
      var e;
      try {
        await ((e = this.persistContent) == null ? void 0 : e.call(this, t));
      } catch (i) {
        this.persistenceError ?? (this.persistenceError = i), console.error("Darkis GodForge | Could not persist random content.", i);
      }
    });
  }
}
function Ue(r) {
  return !!r && typeof r == "object";
}
function W(r) {
  return typeof r == "string" && r.trim().length > 0 && r.length <= 1e4;
}
function Ge(r) {
  return typeof r == "number" && Number.isFinite(r) && r > 0;
}
function wt(r) {
  return r === "public" || r === "selection" || r === "followers" || r === "owner" || r === "gm" || r === "hidden-until-selected";
}
function br(r) {
  return !Ue(r) || !W(r.id) || !W(r.label) || !Ge(r.weight) || r.description !== void 0 && typeof r.description != "string" ? !1 : r.category === void 0 || r.category === "positive" || r.category === "neutral" || r.category === "negative" || r.category === "catastrophic" || r.category === "jackpot";
}
const vr = /* @__PURE__ */ JSON.parse(`{"UI":{"TITLE":"Darkis GodForge","TAGLINE":"Custom deities","SUBTITLE":"Create, publish, and connect them directly to characters.","CREATE":"New deity","EDIT":"Edit","EDIT_DEITY":"Edit deity","CODEX":"Divine Codex","HUB":"Follower Hub","ACTIVE_GRANTS":"Active grants","ACTIVATE":"Activate","NO_WONDERS":"This deity grants no activatable wonders.","NO_ASSIGNED_DEITY":"No deity assigned","NO_ASSIGNED_DEITY_HINT":"Choose a deity in the Divine Codex or ask the GM to assign one to this character.","YOUR_DEITY":"Your deity","SELECT_DEITY":"Choose as deity","CHOOSE_AND_SELECT":"Choose options and assign","CHOOSE_GRANTS":"Choose grants","CHOOSE_GRANTS_HINT":"Select the required options for this deity.","PICK_EXACTLY":"Choose exactly {count} option(s).","ASSIGNMENT_FAILED":"The deity could not be assigned.","SELECTION_REQUIRES_GM":"This deity requires grant choices first.","OPEN_CODEX":"Open Divine Codex – available without a selected token","OPEN_HUB":"Open Follower Hub – the character's deity, bonuses, and wonders","SELECT_CHARACTER_FIRST":"The Follower Hub shows a character's deity, bonuses, and wonders. Control a token or choose one of your characters.","MY_DEITIES":"My deities","ENTRIES":"entries","DOMAINS":"Domains","ABILITIES":"Abilities","VISIBILITY":"Visibility","PASSIVE_BONUS":"Passive bonus","PASSIVE_BONUSES":"Passive bonuses","DIVINE_ABILITY":"Divine ability","DIVINE_WONDER":"Divine wonder","DIVINE_WONDERS":"Divine wonders","SEARCH":"Search GodForge …","ALL_DOMAINS":"All domains","NO_RESULTS":"No deities found.","NEW_DEITY":"Create a new deity","NEW_DEITY_HINT":"Define identity, rules, wonders, and visibility.","NAME":"Name","TITLE_FIELD":"Title","DEITY_KIND":"Entry type","HELP_DEITY_KIND":"Lore entries appear in the codex but cannot be worshipped or assigned to characters.","KIND_SELECTABLE":"Selectable deity","KIND_LORE":"Lore only / not worshippable","LORE_BADGE":"Lore · not worshippable","PICKER_TITLE":"GodForge selection","PICKER_EYEBROW":"System selection","PICKER_HINT":"Search, filter, or drop a Foundry document into this window.","PICKER_CATEGORY":"Category","PICKER_GROUP":"Group","PICKER_RANK":"Rank","PICKER_TRAIT":"Traits","PICKER_SOURCE":"Source","PICKER_ALL":"All","PICKER_AVAILABLE":"Available only","PICKER_REMASTER":"Remaster only","PICKER_DETAILS":"Details","PICKER_CHOOSE":"Choose","PICKER_APPLY":"Apply selection","PICKER_CLEAR":"Clear selection","PICKER_DROP_HINT":"Foundry documents can be dropped here.","PICKER_OPEN":"Open selection","PICKER_NONE":"Nothing selected yet","PICKER_MISSING":"The saved document is unavailable in the current system.","DESCRIPTION":"Description","ALIGNMENT":"Alignment","SAVE":"Save deity","CANCEL":"Cancel","OPEN_DASHBOARD":"Open GM dashboard – create and manage deities","NEW_DEITY_PLACEHOLDER":"e.g. Tenebris","TITLE_PLACEHOLDER":"e.g. Goddess of Shadows","DOMAINS_PLACEHOLDER":"Shadows, secrets, deception","QUOTE":"Quote","PORTRAIT":"Portrait","ICON":"Icon","SYMBOL":"Cult symbol","BANNER":"Banner","BROWSE_FILES":"Browse Foundry files","FILE_PATH":"Foundry file path","PANTHEONS":"Pantheons","TAGS":"Tags","FAVORED_WEAPON":"Favored weapon","DIVINE_FONT":"Divine font","TRAINED_SKILL":"Divine skill","SANCTIFICATION":"Sanctification","CHAMPION_CAUSE":"Champion cause","EDICTS":"Edicts","ANATHEMA":"Anathema","COMMA_SEPARATED":"Comma-separated","STATUS":"Publication status","STATUS_DRAFT":"Draft","STATUS_TEST":"Test","STATUS_PUBLISHED":"Published","STATUS_DISABLED":"Disabled","STATUS_ARCHIVED":"Archived","BASIC_DATA":"Basic data","EDITOR_STEPS":"Deity editor steps","REQUIRED_FIELDS":"Required fields","WIZARD_INTRO":"The wizard guides you step by step through creating a game-ready deity.","APPEARANCE":"Appearance","SYSTEM_VALUES":"System values","PREVIEW":"Preview","STEP_BASIC_INTRO":"Give your deity a clear identity. Everything except the name can be added later.","ONLY_NAME_REQUIRED":"Only the name is required","HELP_NAME":"The unique name used for this deity in the codex.","HELP_TITLE":"A short epithet such as “The Faith” or “Lady of Stars”.","HELP_DESCRIPTION":"Summarize the deity's nature, faith, and presence for players.","HELP_QUOTE":"A characteristic saying or guiding phrase.","HELP_PANTHEONS":"Optional pantheons, separated by commas.","HELP_TAGS":"Internal search terms, separated by commas.","STEP_APPEARANCE_INTRO":"Choose how the deity appears on cards, in the codex, and in selection dialogs.","OPTIONAL_STEP_HINT":"All images are optional. Paste Foundry paths, browse for files, or drag files onto the fields.","HELP_PORTRAIT":"Large image for detail views and the Divine Codex.","HELP_ICON":"Small, readable image for lists and buttons.","HELP_SYMBOL":"The cult's sign, seal, or holy symbol.","HELP_BANNER":"Wide background image for presentation areas.","STEP_SYSTEM_INTRO":"Enter the rules Pathfinder 2e or Starfinder 2e needs for this deity.","HELP_DOMAINS":"Thematic domains, separated by commas.","HELP_WEAPON":"The favored weapon of the deity's followers.","HELP_SKILL":"The skill granted by the deity, such as religion.","HELP_FONT":"Divine font such as heal, harm, or both.","HELP_SANCTIFICATION":"Allowed sanctification, such as holy or unholy.","HELP_CAUSE":"Optional champion cause or comparable bond.","HELP_EDICTS":"Actions followers are expected to uphold.","HELP_ANATHEMA":"Actions that violate the faith.","HELP_SPELLS":"Optional granted spells; one rank and UUID per line.","ADVANCED_SYSTEM_VALUES":"Additional system values for advanced users","HELP_ALIGNMENT":"Legacy alignment for older system data.","HELP_ALTERNATE_DOMAINS":"Additional domains outside the primary selection.","HELP_ATTRIBUTES":"Divine attributes, separated by commas.","STEP_BONUSES_INTRO":"Add persistent mechanical benefits. Empty cards are ignored when saving.","STEP_WONDERS_INTRO":"Create activatable abilities with uses, reset events, and effects.","STEP_REPLACEMENT_INTRO":"Choose an official deity as a template or replace it in GodForge selections without changing the system compendium.","HELP_REPLACEMENT_MODE":"None uses the selection only as a template; hide or replace changes GodForge catalogs.","HELP_OFFICIAL_DEITY":"Choose a name from the active system compendium instead of entering a UUID.","EXPERT_OPTIONS":"Expert options","HELP_REPLACEMENT_CONTEXTS":"Limits replacement to specific catalogs. Empty means all contexts.","STEP_VISIBILITY_INTRO":"Control exactly what players see before and after choosing the deity.","HELP_DEITY_VISIBILITY":"Controls who can see the deity at all.","HELP_FIELD_VISIBILITY":"Controls visibility for this individual content field.","HELP_GM_NOTES":"These notes remain visible only to the GM.","PREVIEW_AND_SAVE":"Preview and save","STEP_PREVIEW_INTRO":"Review the key details and choose the publication status.","PREVIEW_EMPTY_DESCRIPTION":"No description entered yet.","HELP_STATUS":"Drafts remain with the GM; published makes the deity normally selectable.","BACK":"Back","NEXT":"Next","SAVE_DRAFT":"Save as draft","HELP_BONUS_NAME":"A clear name for the benefit.","HELP_SELECTOR":"The system value affected by the bonus, such as religion.","HELP_BONUS_VALUE":"A number or supported formula.","HELP_WONDER_NAME":"The visible name of the ability.","HELP_WONDER_DESCRIPTION":"Describe exactly what happens on activation.","HELP_USAGES":"How often the wonder can be used before its next reset.","HELP_RESET":"The event that restores spent uses.","BONUS_EDITOR_HINT":"Create multiple system-native bonuses with conditions and individual visibility.","ABILITY_EDITOR_HINT":"Configure activation, uses, reset, and effect.","GRANT_GROUPS":"Grant groups","GRANT_GROUPS_HINT":"Nest AND/OR groups and override inherited names, descriptions, or values.","ADD_GRANT_GROUP":"Add group","GRANT_GROUP":"Grant group","ADD_GRANT":"Add grant","ADD_SUBGROUP":"Add subgroup","GROUP_MODE":"Relationship","ALL_REQUIRED":"All (AND)","CHOOSE_FROM":"Choice (OR)","PICK_COUNT":"Pick count","GRANT":"Grant","REFERENCE":"Reference ID","OVERRIDE_NAME":"Override name","OVERRIDE_VALUE":"Override value","OVERRIDE_DESCRIPTION":"Override description","ADD_BONUS":"Add bonus","ADD_ABILITY":"Add wonder","REMOVE":"Remove","MOVE_UP":"Move up","MOVE_DOWN":"Move down","DUPLICATE":"Duplicate","STACKING_WARNING":"In PF2e, this status bonus does not stack with another status bonus on the same selector; only the highest value applies.","SELECTOR":"Selector","VALUE":"Value or formula","MODIFIER_TYPE":"Modifier type","MOD_STATUS":"Status bonus","MOD_CIRCUMSTANCE":"Circumstance bonus","MOD_ITEM":"Item bonus","MOD_UNTYPED":"Untyped","APPLIES_TO":"Applies to","CHECKS":"Checks","DCS":"DCs","BOTH":"Checks and DCs","CONDITION":"Condition","OPTIONAL_CONDITION":"Optional, e.g. while in darkness","ACTION_COST":"Action cost","ACTION_AUTOMATIC":"Automatic / no action","ACTION_FREE":"Free action","ACTION_REACTION":"Reaction","ACTIONS":"Actions","ACTION_EXPLORATION":"Exploration activity","ACTION_DOWNTIME":"Downtime activity","ACTION_COUNT":"Number of actions","USAGES":"Uses","RESET":"Reset","RESET_DAILY":"At daily preparations","RESET_TEN_MINUTES":"After a 10-minute rest","RESET_REFOCUS":"After refocusing","RESET_ENCOUNTER":"At encounter end","RESET_SCENE":"On scene change","RESET_CALENDAR_DAY":"Per calendar day","RESET_MANUAL":"GM only","COOLDOWN":"Cooldown","COOLDOWN_UNIT":"Cooldown unit","DURATION":"Duration","DURATION_UNIT":"Duration unit","ROUNDS":"Rounds","MINUTES":"Minutes","HOURS":"Hours","DAYS":"Days","INSTANT":"Instant","ENCOUNTER":"Encounter","SCENE":"Scene","UNTIL_RESET":"Until next reset","EFFECT_TEMPLATE":"Effect template","EFFECT_NARRATIVE":"Narrative effect","EFFECT_HEAL":"Heal","EFFECT_DAMAGE":"Deal damage","EFFECT_BONUS":"Grant bonus","FORMULA_OR_VALUE":"Formula or value","VISIBILITY_HINT":"Hidden fields are never sent to players.","DEITY_VISIBILITY":"Deity visibility","PLAYER_PREVIEW":"Preview as player","GM_NOTES":"Internal GM notes","VIS_PUBLIC":"Public","VIS_SELECTION":"Visible before selection","VIS_FOLLOWERS":"Followers only","VIS_OWNER":"Owner only","VIS_TRUSTED":"Trusted players","VIS_GM":"GM only","VIS_HIDDEN_UNTIL_SELECTED":"Hidden until selected","VIS_FIELD_PORTRAIT":"Portrait","VIS_FIELD_DESCRIPTION":"Description","VIS_FIELD_QUOTE":"Quote","VIS_FIELD_PANTHEON":"Pantheon","VIS_FIELD_BONUSES":"Passive bonuses","VIS_FIELD_ABILITIES":"Divine wonders","VIS_FIELD_NUMERIC_VALUES":"Exact numeric values","VIS_FIELD_DOMAINS":"Domains","VIS_FIELD_SPELLS":"Granted spells","VIS_FIELD_FAVORED_WEAPON":"Favored weapon","VIS_FIELD_EDICTS":"Edicts","VIS_FIELD_ANATHEMA":"Anathema","VIS_FIELD_GM_NOTES":"Internal GM notes","REPLACEMENT":"Official template and replacement","REPLACEMENT_MODE":"Replacement mode","REPLACE_NONE":"No replacement","REPLACE_HIDE":"Hide official deity","REPLACE_SOURCE":"Replace with this deity","SOURCE_UUID":"Source UUID","REPLACEMENT_CONTEXTS":"Affected selection contexts","OVERVIEW":"Overview","DEITIES":"Deities","RANDOM_TABLES":"Random tables","FORTUNE_WHEELS":"Fortune wheels","RANDOM_AND_WHEELS":"Random tables and fortune wheels","RANDOM_MANAGER_HINT":"The result is fixed before the wheel starts spinning.","TEST_LAB_HINT":"Test existing tables and fortune wheels without creating new content.","NEW_RANDOM_TABLE":"New random table","DICE_FORMULA":"Dice formula","RESULT_ENTRIES":"Results","ADD_RESULT":"Add result","SAVE_TABLE":"Save table","NEW_FORTUNE_WHEEL":"New fortune wheel","LINKED_TABLE":"Linked table","ANIMATION_DURATION":"Animation duration in seconds","MINIMUM_SPINS":"Minimum spins","SAVE_WHEEL":"Save wheel","TEST_DRAW":"Test draw","TEST_SPIN":"Test spin","NO_RANDOM_TABLES":"No random tables have been created yet.","NO_FORTUNE_WHEELS":"No fortune wheels have been created yet.","RESULT_TITLE":"Result title","CATEGORY_JACKPOT":"Jackpot","CATEGORY_POSITIVE":"Positive","CATEGORY_NEUTRAL":"Neutral","CATEGORY_NEGATIVE":"Negative","CATEGORY_CATASTROPHIC":"Catastrophic","INTEGRATION":"Integration","REPLACEMENTS":"Replacements","REPLACEMENT_MANAGER_HINT":"Official compendiums are never modified.","OFFICIAL_DEITY":"Official deity","HOMEBREW_REPLACEMENT":"Homebrew replacement","INHERITANCE":"Inheritance","SELECTIVE_INHERITANCE":"Selective via deity definition","INHERITED_VALUES":"inherited values","SPELLS":"Spells","ALTERNATE_DOMAINS":"Alternate domains","DIVINE_ATTRIBUTES":"Divine attributes","CLERIC_SPELLS":"Granted cleric spells","SPELLS_HINT":"One per line: rank=Compendium.package.pack.Item.id","KEEP_EXISTING_ACTORS":"Keep for existing characters","NO_OFFICIAL_DEITIES":"No official deities found","NO_OFFICIAL_DEITIES_HINT":"The active system adapter did not detect a matching deity pack.","CHARACTERS":"Characters","CHARACTER":"Character","CHARACTER_MANAGER_HINT":"Assign a deity and its grants to a character.","ASSIGN_DEITY":"Assign deity","PLAYER_VIEW":"Player view","TOOLS":"Tools","TEST_LAB":"Test lab","IMPORT_EXPORT":"Import / Export","IMPORT_EXPORT_HINT":"Back up or transfer your GodForge data.","DATA_MANAGER_HINT":"Inspect GodForge packages before import and export a portable backup of your definitions.","EXPORT_PACKAGE":"Export GodForge package","EXPORT_HINT":"Exports all deities including visibility, bonuses, wonders, grants, and replacements.","EXPORT":"Export","IMPORT_PACKAGE":"Import GodForge package","IMPORT_HINT":"The file is validated and summarized before any changes are made.","CHOOSE_FILE":"Choose JSON file","IMPORT_INVALID":"The selected import file is invalid.","IMPORT_PREVIEW":"Import preview","NEW_CONTENT":"New content","UPDATED_CONTENT":"Updated content","IMPORT_APPLY_HINT":"Existing IDs are updated and new IDs are added.","APPLY_IMPORT":"Apply validated import","IMPORTED":"GodForge entries imported.","MIGRATIONS":"Migrations","MIGRATION_MANAGER_HINT":"GodForge updates older definitions automatically when they are loaded.","MIGRATION_STATUS":"Migration status","CURRENT_SCHEMA":"Current schema","PENDING_MIGRATIONS":"Pending migrations","MIGRATION_RELOAD_HINT":"Reload the world to update pending definitions.","MIGRATION_COMPLETE":"All deities use the current schema.","AUDIT_LOG":"Audit log","PLANNED":"Planned for a later alpha release","SETTINGS":"Settings","MODULE_OPTIONS":"Module options","ADAPTER":"System adapter","HELP":"Help","QUICK_ACCESS":"Quick access","SYSTEM_STATUS":"System status","RECENTLY_EDITED":"Recently edited","PUBLISHED":"Published","INVALID":"Invalid definitions","ASSIGNED_CHARACTERS":"Assigned characters","RESET_DAILY_USAGES":"Reset daily uses","RESET_DAILY_COMPLETE":"Daily-preparation uses were reset.","MANUAL_RESET_HINT":"If the system event did not fire, the GM can reset daily uses here manually.","EMPTY_TITLE":"No custom deities yet","EMPTY_HINT":"Create a new deity or import a pantheon.","IMPORT":"Import","LARGER_WINDOW":"A larger window is recommended for the full editor.","TYPE":"Type","LAST_CHANGED":"Last changed","SYSTEM":"System","SCHEMA":"Schema","VERSION":"Version","DIAGNOSTICS_OK":"Ready","LOADING":"Loading …","EXPERT_MODE":"Expert mode","DISCOVERY":"Discovery","DISCOVERY_ENABLE":"Hide this deity until it is discovered","DISCOVERY_DEFAULT":"Before discovery","DISCOVERY_REVEALED":"Fully revealed","DISCOVERY_RUMOR":"Show as an unknown rumor","DISCOVERY_HIDDEN":"Hide completely","RUMOR":"Rumor","RUMOR_NAME":"Rumor name","RUMOR_TEXT":"Clue for players","REVEALED_USERS":"Revealed user IDs","REVEALED_ACTORS":"Revealed actor IDs","UNKNOWN_DEITY":"Unknown deity","UNREVEALED":"Not yet discovered","UNKNOWN_DEITY_HINT":"A forgotten presence leaves traces, but its name and nature remain hidden.","REVEAL_TO_ALL":"Reveal to all players","CLEAR_ALL_DATA":"Delete all GodForge data","CLEAR_ALL_DATA_HINT":"Downloads one final backup, then deletes deities, assignments, generated effects, random tables and fortune wheels. Module settings remain.","CLEAR_CONFIRM_FIRST":"Download one final backup and permanently delete all GodForge content?","CLEAR_CONFIRM_TYPE":"Final confirmation: type LÖSCHUNG exactly.","CLEAR_CANCELLED":"Deletion cancelled.","CLEAR_COMPLETE":"GodForge records deleted.","CLEAR_FAILED":"Deletion stopped after an error. Use the downloaded backup to restore any affected data.","BUILDER_TITLE":"Divine blueprint","BUILDER_HINT":"Connect triggers, checks, actions and results. Every execution is previewed for the GM.","NODE_LIBRARY":"Node library","SEARCH_NODES":"Search nodes …","TRIGGERS":"Triggers","LOGIC":"Checks and logic","RESULTS":"Results","AUTO_LAYOUT":"Auto layout","ZOOM_IN":"Zoom in","ZOOM_OUT":"Zoom out","CENTER_GRAPH":"Center blueprint","COPY_SUFFIX":"Copy","DISCARD_UNSAVED":"Discard unsaved changes?","DIFFICULTY_CLASS":"Difficulty class","TRAINED_SKILL_PF2E":"Divine skill – PF2e training","SKILL_NO_BONUS":"Does not add a numeric modifier.","ADDITIONAL_FOLLOWER_BONUSES":"Additional follower bonuses","BONUS_SECTION_HINT":"These bonuses may be granted in addition to divine training.","INHERITANCE_HINT":"Recommended technical values are selected automatically","SKILL_OVERLAP_WARNING":"This skill is trained and also receives the bonus. That is allowed, but may be stronger than intended.","ABILITY_TYPE":"Ability type","ABILITY_STANDARD":"Standard","ABILITY_FORTUNE_WHEEL":"Fortune wheel / random table","VARIANT_SELECT_PORTRAIT":"Select a portrait first.","VARIANT_UPLOAD_UNAVAILABLE":"Foundry file upload is unavailable.","VARIANT_CREATING":"Creating variants …","VARIANT_NONE_SELECTED":"No variant selected.","VARIANT_FAILED":"Image variants could not be created. Check file permissions and the browser console.","IMPORT_FAILED":"The import failed. Details are available in the browser console.","INVALID_RANDOM_CONTENT":"The backup contains invalid random content.","INVALID_ACTOR_BACKUP":"The backup contains invalid actor data.","BACKUP_ITEM_FAILED":"GodForge item {id} cannot be backed up.","RESTORE_ACTOR_FAILED":"Actor {id} cannot restore embedded GodForge items.","CATEGORY_TRIGGER":"Trigger","CATEGORY_LOGIC":"Logic","CATEGORY_ACTION":"Action","CATEGORY_RESULT":"Result","PORT_NEXT":"Next","PORT_IN":"Input","PORT_ACTOR":"Actor","PORT_EVENT":"Event","PORT_VALUE":"Value","PORT_LEFT":"Left","PORT_RIGHT":"Right","PORT_TRUE":"True","PORT_FALSE":"False","PORT_TARGET":"Target","PORT_SELECTOR":"Selector","PORT_CRITICAL_SUCCESS":"Critical success","PORT_SUCCESS":"Success","PORT_FAILURE":"Failure","PORT_CRITICAL_FAILURE":"Critical failure","PORT_TOTAL":"Total","PORT_DEGREE":"Degree of success","PORT_RESULT":"Result","TEMPLATES":"Templates","TEMPLATE_HEAL":"Manual healing blessing","TEMPLATE_DAMAGE_REACTION":"Reaction after damage","TEMPLATE_DAILY_RESOURCE":"Daily resource","SIMULATE":"Test run","SIMULATION":"Test result","SIMULATION_RANDOM_TABLE":"Simulated random-table result","HEALING":"Healing","DAMAGE":"Damage","BLUEPRINT":"Ability blueprint","BLUEPRINT_EMPTY":"No blueprint connected yet","OPEN_BUILDER":"Open blueprint","LEGACY_EFFECTS":"Classic effect blocks","EFFECT_CHAIN":"Effect chain","ADD_EFFECT":"Add effect","SAVE_GRAPH":"Save blueprint","UNDO":"Undo","REDO":"Redo","CONNECT_TARGET":"Now select the input port of the next node.","CONNECT_INPUT":"Connect here","CONNECT_OUTPUT":"Start connection","BRANCH_TRUE":"True branch","BRANCH_FALSE":"False branch","GRAPH_CANVAS":"Ability blueprint canvas","GRAPH_VALID":"Blueprint is executable","GRAPH_INVALID":"Blueprint needs attention","GRAPH_ISSUE_GENERIC":"Invalid blueprint element ({code}).","EMPTY_GRAPH":"The forge is empty","EMPTY_GRAPH_HINT":"Start with a trigger from the library.","SELECT_NODE":"Select a node","SELECT_NODE_HINT":"Its settings will appear here.","LINEAR_OUTLINE":"Readable outline","APPROVAL_EYEBROW":"GM approval","APPROVAL_HINT":"Review the expected changes before they are applied.","APPROVE":"Approve and execute","DENY":"Deny","GM_REQUIRED":"Only a GM can confirm this action.","NO_CHANGES":"No actor changes","NO_CHANGES_HINT":"The ability only produces informational output.","OPERATIONS":"Planned operations","SOURCE_ACTOR":"Source character","NODE_MANUAL":"Manual button","NODE_SKILL_CHECK":"Skill check","NODE_ATTACK_ROLL":"Attack roll","NODE_SAVING_THROW":"Saving throw","NODE_DAMAGE_ROLL":"Damage roll","NODE_DAMAGE_TAKEN":"Damage taken","NODE_HEALING_RECEIVED":"Healing received","NODE_COMBAT_START":"Combat start","NODE_TURN_START":"Turn start","NODE_TURN_END":"Turn end","NODE_ROUND_START":"Round start","NODE_DAILY_PREPARATIONS":"Daily preparations","NODE_TOKEN_MOVE":"Token movement","NODE_REGION_ENTER":"Enter region","NODE_DEITY_ASSIGNED":"Deity assigned","NODE_CUSTOM":"Custom event","NODE_CONDITION":"Condition","NODE_CHANCE":"Chance","NODE_COMPARE":"Compare values","NODE_BRANCH":"Branch","NODE_CHOICE":"Choice","NODE_HEAL":"Heal","NODE_DAMAGE":"Damage","NODE_MODIFIER":"Bonus or penalty","NODE_ROLL":"Request roll","NODE_RESOURCE":"Resource","NODE_MOVEMENT":"Movement","NODE_RANDOM_WHEEL":"Random table","NODE_MESSAGE":"Chat message","NODE_SUCCESS":"Success","NODE_FAILURE":"Failure","NODE_SUMMARY":"Summary","NODE_END":"End","NODES":"nodes","CONNECTIONS":"connections","EXECUTABLE_EFFECTS":"executable effects","NODE_LABEL":"Label","EVENT_FILTER":"Selector or event filter","CHANCE_PERCENT":"Chance in percent","FACT_PATH":"Fact or result path","COMPARISON":"Comparison","EXPECTED_VALUE":"Expected value","FORMULA_VALUE":"Formula or value","SYSTEM_SELECTOR":"System selector","TARGET":"Target","TARGET_SELF":"Self","TARGET_TARGET":"Selected target","TARGET_ALLIES":"Allies","TARGET_ENEMIES":"Enemies","TARGET_GROUP":"Group","COMPARE_EQ":"equals","COMPARE_NEQ":"does not equal","COMPARE_GT":"greater than","COMPARE_GTE":"greater than or equal","COMPARE_LT":"less than","COMPARE_LTE":"less than or equal","HUB_EXPLANATION":"The Follower Hub shows a character's deity, bonuses, and wonders.","HUB_NO_CHARACTER":"Set an owned character or control a token first.","UNDERSTOOD":"Understood","CHOOSE_CHARACTER":"Choose character","OPEN_HUB_ACTION":"Open Follower Hub"},"SETTINGS":{"MENU_NAME":"GodForge management","MENU_LABEL":"Open GodForge","MENU_HINT":"Opens the dashboard for creating and managing custom deities.","LANGUAGE":"GodForge language","LANGUAGE_HINT":"Language used by GodForge surfaces.","AUTO":"Automatic"},"ERROR":{"NO_USES":"No uses remaining.","GM_ONLY":"Only the GM may use this GodForge feature.","NO_PERMISSION":"You are not allowed to use this GodForge feature.","DASHBOARD_OPEN":"The dashboard did not open. Details are available in the browser console.","CODEX_OPEN":"The Divine Codex did not open. Reload Foundry and try again.","HUB_OPEN":"The character hub could not be loaded. Check that the character is still available.","UNSUPPORTED_SYSTEM":"Darkis GodForge does not support the active {system} system.","ACTION_FAILED":"That did not work."}}`), it = {
  DARKIS_GODFORGE: vr
}, Fe = /* @__PURE__ */ new Map([["en", it]]);
async function At(r, t) {
  if (r === "auto" || Fe.has(r)) return;
  const e = await fetch(t);
  if (!e.ok) throw new Error(`Unable to load GodForge language ${r}.`);
  Fe.set(r, await e.json());
}
function q(r) {
  var o, n, a, l;
  const t = S(), e = (n = (o = t == null ? void 0 : t.settings) == null ? void 0 : o.get) == null ? void 0 : n.call(o, "darkis-godforge", "language");
  if (typeof e == "string" && e !== "auto") {
    const c = St(Fe.get(e), r);
    if (typeof c == "string") return c;
  }
  const i = (l = (a = t == null ? void 0 : t.i18n) == null ? void 0 : a.localize) == null ? void 0 : l.call(a, r);
  if (i && i !== r) return i;
  const s = St(it, r);
  return typeof s == "string" ? s : r;
}
function T() {
  return Object.fromEntries(Object.keys(it.DARKIS_GODFORGE.UI).map((r) => [r, q(`DARKIS_GODFORGE.UI.${r}`)]));
}
function St(r, t) {
  return t.split(".").reduce((e, i) => e && typeof e == "object" ? e[i] : void 0, r);
}
function D() {
  if (!rt())
    throw st(), new Error("GodForge: GM only.");
}
function rt() {
  var r, t;
  return ((t = (r = S()) == null ? void 0 : r.user) == null ? void 0 : t.isGM) === !0;
}
function st() {
  var r, t, e;
  (e = (t = (r = U()) == null ? void 0 : r.notifications) == null ? void 0 : t.warn) == null || e.call(t, q("DARKIS_GODFORGE.ERROR.GM_ONLY"));
}
function B(r = !1) {
  var s, o, n;
  const t = (s = S()) == null ? void 0 : s.user, e = t == null ? void 0 : t.character, i = (o = e == null ? void 0 : e.flags) == null ? void 0 : o["darkis-godforge"];
  return {
    isGM: (t == null ? void 0 : t.isGM) === !0,
    isTrusted: (t == null ? void 0 : t.isTrusted) === !0 || typeof (t == null ? void 0 : t.role) == "number" && t.role >= 2,
    selection: r,
    actorDeityId: typeof (i == null ? void 0 : i.deityId) == "string" ? i.deityId : void 0,
    userId: t == null ? void 0 : t.id,
    actorId: e == null ? void 0 : e.id,
    ownsActor: !!(t && ((n = e == null ? void 0 : e.testUserPermission) == null ? void 0 : n.call(e, t, "OWNER")) === !0)
  };
}
const ke = /* @__PURE__ */ new Map();
async function Ir(r, t) {
  var o, n;
  if ((((n = (o = S()) == null ? void 0 : o.system) == null ? void 0 : n.id) ?? "") === "sfrpg" && r.operations.some((a) => ["create-modifier", "condition", "roll"].includes(a.kind))) throw new Error("This advanced ability requires the PF2e or SF2e runtime adapter.");
  const i = await wr(r.operations, t), s = [];
  try {
    for (const a of r.operations.filter((l) => l.kind === "roll")) await Le(a, t, r, i);
    for (const a of r.operations.filter((l) => l.kind !== "roll" && l.kind !== "chat" && l.kind !== "roll-result")) {
      const l = await Le(a, t, r, i);
      l && s.push(l);
    }
    for (const a of r.operations.filter((l) => l.kind === "chat" || l.kind === "roll-result")) await Le(a, t, r, i);
  } catch (a) {
    for (const l of s.reverse())
      try {
        await l();
      } catch (c) {
        console.error("Darkis GodForge | Effect rollback failed.", c);
      }
    throw a;
  }
}
async function wr(r, t) {
  var s, o, n, a, l, c;
  const e = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  for (const u of r) {
    if ("targetId" in u && u.kind !== "movement" && u.kind !== "chat" && u.kind !== "roll-result" && !t.has(u.targetId)) throw new Error(`Effect target actor was not found: ${u.targetId}`);
    const d = "targetId" in u ? t.get(u.targetId) : void 0;
    if (u.kind === "create-modifier" && (!(d != null && d.createEmbeddedDocuments) || !d.deleteEmbeddedDocuments)) throw new Error("Target actor cannot safely receive rollback-capable effects.");
    if (u.kind === "condition" && u.operation === "add") {
      if (!(d != null && d.createEmbeddedDocuments) || !d.deleteEmbeddedDocuments) throw new Error("Target actor cannot safely receive rollback-capable conditions.");
      e.has(u.condition) || e.set(u.condition, await Sr(u.condition));
    }
    if (u.kind === "condition" && u.operation === "remove") {
      if (!(d != null && d.deleteEmbeddedDocuments) || !d.createEmbeddedDocuments) throw new Error("Target actor cannot safely remove conditions.");
      if ((((s = d.items) == null ? void 0 : s.contents) ?? []).filter((p) => p.type === "condition" && ei(p) === u.condition).some((p) => !p.toObject)) throw new Error("A condition cannot be backed up before removal.");
    }
    if (u.kind === "roll") {
      const h = (o = d == null ? void 0 : d.getStatistic) == null ? void 0 : o.call(d, u.selector);
      if (!(((n = h == null ? void 0 : h.check) == null ? void 0 : n.roll) ?? (h == null ? void 0 : h.roll))) throw new Error(`PF2e statistic is unavailable: ${u.selector}`);
    }
    if (u.kind === "movement") {
      const h = ti(u.targetId);
      if (!(h != null && h.update) || typeof h.x != "number" || typeof h.y != "number") throw new Error("A scene token is required for movement.");
    }
    if (u.kind === "resource" && u.resource === "item") {
      if (!u.itemUuid) throw new Error("Item resource operations require a configured item UUID.");
      if (u.operation === "remove") {
        if (!(d != null && d.deleteEmbeddedDocuments) || !d.createEmbeddedDocuments) throw new Error("Target actor cannot safely remove items.");
        if ((((a = d.items) == null ? void 0 : a.contents) ?? []).filter((p) => {
          var m;
          const f = (m = p.flags) == null ? void 0 : m["darkis-godforge"];
          return p.uuid === u.itemUuid || !!(f && typeof f == "object" && f.sourceItemUuid === u.itemUuid);
        }).some((p) => !p.toObject)) throw new Error("An item cannot be backed up before removal.");
      }
      if (u.operation !== "remove") {
        if (!(d != null && d.createEmbeddedDocuments) || !d.deleteEmbeddedDocuments) throw new Error("Target actor cannot safely receive rollback-capable items.");
        if (!i.has(u.itemUuid)) {
          const h = await ((l = globalThis.fromUuid) == null ? void 0 : l.call(globalThis, u.itemUuid)), p = (c = h == null ? void 0 : h.toObject) == null ? void 0 : c.call(h);
          if (!p) throw new Error(`Configured item is unavailable: ${u.itemUuid}`);
          delete p._id, i.set(u.itemUuid, p);
        }
      }
    }
  }
  return { conditions: e, items: i };
}
async function Le(r, t, e, i) {
  var o, n, a, l, c, u;
  const s = t.get(r.targetId);
  if (r.kind === "actor-update") {
    if (!s) throw new Error(`Effect target actor was not found: ${r.targetId}`);
    return await s.update({ [r.path]: r.after }, { darkisGodForge: !0 }), async () => {
      await s.update({ [r.path]: r.before }, { darkisGodForge: !0 });
    };
  }
  if (r.kind === "create-modifier") {
    if (!(s != null && s.createEmbeddedDocuments)) throw new Error("Target actor cannot receive PF2e effects.");
    const d = await s.createEmbeddedDocuments("Item", [{
      name: e.abilityName,
      type: "effect",
      system: {
        description: { value: `GodForge: ${e.abilityName}` },
        duration: { value: r.duration ?? 1, unit: r.duration ? "rounds" : "unlimited", expiry: null, sustained: !1 },
        rules: [{ key: "FlatModifier", selector: r.selector, value: r.value, type: r.modifierType, slug: `godforge-${e.abilityId}` }],
        start: { value: 0, initiative: null }
      },
      flags: { "darkis-godforge": { abilityId: e.abilityId, activationId: e.id } }
    }]);
    return d.length && s.deleteEmbeddedDocuments ? async () => {
      await s.deleteEmbeddedDocuments("Item", d.map((h) => h.id));
    } : void 0;
  }
  if (r.kind === "condition") {
    if (!s) throw new Error(`Condition target actor was not found: ${r.targetId}`);
    if (r.operation === "remove") {
      const p = (((o = s.items) == null ? void 0 : o.contents) ?? []).filter((m) => m.type === "condition" && ei(m) === r.condition), f = p.flatMap((m) => {
        var E;
        const b = (E = m.toObject) == null ? void 0 : E.call(m);
        return b ? (delete b._id, [b]) : [];
      });
      return p.length && s.deleteEmbeddedDocuments && await s.deleteEmbeddedDocuments("Item", p.map((m) => m.id)), f.length && s.createEmbeddedDocuments ? async () => {
        await s.createEmbeddedDocuments("Item", f);
      } : void 0;
    }
    if (!s.createEmbeddedDocuments) throw new Error("Target actor cannot receive conditions.");
    const d = i.conditions.get(r.condition);
    if (!d) throw new Error(`Condition was not prepared: ${r.condition}`);
    const h = await s.createEmbeddedDocuments("Item", [structuredClone(d)]);
    return h.length && s.deleteEmbeddedDocuments ? async () => {
      await s.deleteEmbeddedDocuments("Item", h.map((p) => p.id));
    } : void 0;
  }
  if (r.kind === "roll") {
    if (!s) throw new Error(`Roll actor was not found: ${r.targetId}`);
    const d = (n = s.getStatistic) == null ? void 0 : n.call(s, r.selector), h = ((a = d == null ? void 0 : d.check) == null ? void 0 : a.roll) ?? (d == null ? void 0 : d.roll);
    if (!h) throw new Error(`PF2e statistic is unavailable: ${r.selector}`);
    await h.call((d == null ? void 0 : d.check) ?? d, r.dc === void 0 ? {} : { dc: { value: r.dc } });
    return;
  }
  if (r.kind === "roll-result") {
    await Tt(`<strong>${ue(e.abilityName)}</strong><p>${ue(r.selector)}: ${r.total}${r.degree ? ` (${ue(r.degree)})` : ""}</p>`);
    return;
  }
  if (r.kind === "movement") {
    const d = ti(r.targetId);
    if (!(d != null && d.update) || typeof d.x != "number" || typeof d.y != "number") throw new Error("A scene token is required for movement.");
    const h = Number(((c = (l = globalThis.canvas) == null ? void 0 : l.grid) == null ? void 0 : c.size) ?? 100), p = r.distance * h / 5, f = { x: d.x, y: d.y }, m = r.mode === "teleport" ? { x: d.x + p, y: d.y, animate: !1 } : { x: d.x + p, y: d.y };
    return await d.update(m), async () => {
      await d.update(f);
    };
  }
  if (r.kind === "resource") {
    if (!s) throw new Error(`Resource target actor was not found: ${r.targetId}`);
    if (r.resource === "item") {
      if (!r.itemUuid) throw new Error("Item resource operations require a configured item UUID.");
      if (r.operation === "remove") {
        const p = (((u = s.items) == null ? void 0 : u.contents) ?? []).filter((m) => {
          var E;
          const b = (E = m.flags) == null ? void 0 : E["darkis-godforge"];
          return m.uuid === r.itemUuid || !!(b && typeof b == "object" && b.sourceItemUuid === r.itemUuid);
        }), f = p.flatMap((m) => {
          var E;
          const b = (E = m.toObject) == null ? void 0 : E.call(m);
          return b ? (delete b._id, [b]) : [];
        });
        return p.length && s.deleteEmbeddedDocuments && await s.deleteEmbeddedDocuments("Item", p.map((m) => m.id)), f.length && s.createEmbeddedDocuments ? async () => {
          await s.createEmbeddedDocuments("Item", f);
        } : void 0;
      }
      if (!s.createEmbeddedDocuments) throw new Error("Target actor cannot receive items.");
      const d = structuredClone(i.items.get(r.itemUuid));
      if (!d) throw new Error(`Configured item is unavailable: ${r.itemUuid}`);
      d.flags = { ...d.flags, "darkis-godforge": { sourceItemUuid: r.itemUuid, abilityId: e.abilityId } };
      const h = await s.createEmbeddedDocuments("Item", Array.from({ length: Math.max(1, Math.floor(r.amount)) }, () => structuredClone(d)));
      return h.length && s.deleteEmbeddedDocuments ? async () => {
        await s.deleteEmbeddedDocuments("Item", h.map((p) => p.id));
      } : void 0;
    }
    return;
  }
  await Tt(`<strong>${ue(e.abilityName)}</strong><p>${ue(r.text)}</p>`);
}
async function Ar(r, t, e, i) {
  var n;
  const s = (((n = r.items) == null ? void 0 : n.contents) ?? []).filter((a) => {
    var c;
    const l = (c = a.flags) == null ? void 0 : c["darkis-godforge"];
    return !!(l && typeof l == "object" && l.passiveBonusItem === t);
  });
  s.length && r.deleteEmbeddedDocuments && await r.deleteEmbeddedDocuments("Item", s.map((a) => a.id));
  const o = i.filter((a) => a.enabled !== !1).map((a) => ({
    key: "FlatModifier",
    selector: a.selector,
    value: a.value,
    type: a.modifierType,
    label: a.name,
    slug: `godforge-${a.id}`,
    ...a.condition ? { predicate: [a.condition] } : {}
  }));
  !o.length || !r.createEmbeddedDocuments || await r.createEmbeddedDocuments("Item", [{
    name: `${e} — GodForge`,
    type: "effect",
    system: {
      description: { value: `Passive GodForge benefits granted by ${e}.` },
      duration: { value: -1, unit: "unlimited", expiry: null, sustained: !1 },
      rules: o,
      start: { value: 0, initiative: null }
    },
    flags: { "darkis-godforge": { passiveBonusItem: t } }
  }]);
}
async function Sr(r) {
  var s;
  const t = (s = S()) == null ? void 0 : s.system, e = `${(t == null ? void 0 : t.id) ?? "unknown"}:${(t == null ? void 0 : t.version) ?? "unknown"}:${r.toLocaleLowerCase()}`;
  let i = ke.get(e);
  return i || (i = Tr(r), ke.set(e, i), i.catch(() => ke.delete(e))), structuredClone(await i);
}
async function Tr(r) {
  var i, s, o;
  const t = globalThis.fromUuid, e = ((s = (i = S()) == null ? void 0 : i.packs) == null ? void 0 : s.contents) ?? [];
  for (const n of e.filter((a) => a.documentName === "Item" && /condition/i.test(a.collection ?? ""))) {
    const l = [...await n.getIndex({ fields: ["type", "system.slug"] })].find((d) => {
      var h, p;
      return d.type === "condition" && (String(((h = d.system) == null ? void 0 : h.slug) ?? "").toLocaleLowerCase() === r.toLocaleLowerCase() || ((p = d.name) == null ? void 0 : p.toLocaleLowerCase()) === r.toLocaleLowerCase());
    });
    if (!(l != null && l._id) || !n.collection) continue;
    const c = await (t == null ? void 0 : t(`Compendium.${n.collection}.Item.${l._id}`)), u = ((o = c == null ? void 0 : c.toObject) == null ? void 0 : o.call(c)) ?? { name: (c == null ? void 0 : c.name) ?? l.name ?? r, type: "condition", system: structuredClone((c == null ? void 0 : c.system) ?? { slug: r }) };
    return delete u._id, u;
  }
  throw new Error(`PF2e condition is unavailable: ${r}`);
}
function ei(r) {
  var t;
  return String(((t = r.system) == null ? void 0 : t.slug) ?? r.name ?? "").toLocaleLowerCase();
}
function ti(r) {
  var e, i, s;
  const t = globalThis.canvas;
  return (s = (i = (e = t == null ? void 0 : t.tokens) == null ? void 0 : e.placeables) == null ? void 0 : i.find((o) => {
    var n;
    return ((n = o.actor) == null ? void 0 : n.id) === r;
  })) == null ? void 0 : s.document;
}
async function Tt(r) {
  const t = globalThis.ChatMessage;
  t && await t.create({ content: r, speaker: { alias: "Darkis GodForge" } }, { darkisGodForge: !0 });
}
function ue(r) {
  return r.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[t] ?? t);
}
async function ii(r, t) {
  const e = G(r);
  if (!e.valid) throw new Error(e.issues.map((p) => p.message).join(" "));
  const i = new Map(r.nodes.map((p) => [p.id, p])), s = Or(r.edges.filter((p) => p.from.type === "flow")), o = new Map(r.edges.filter((p) => p.from.type !== "flow").map((p) => [`${p.to.nodeId}:${p.to.port}`, p])), n = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Set(), l = Rr(), c = async (p) => {
    var E;
    if (a.has(p)) return;
    a.add(p);
    const f = i.get(p);
    if (!f) return;
    if (f.category === "trigger") {
      n.set(`${f.id}:actor`, t.actor.id), n.set(`${f.id}:event`, t.triggerEvent ?? f.type), await u(f.id, "next");
      return;
    }
    if (f.category === "logic") {
      const g = _r(f, d(f.id, "value"), d(f.id, "left"), d(f.id, "right"), t.conditionFacts ?? {});
      await u(f.id, g ? "true" : "false");
      return;
    }
    if (f.category === "action" && f.type === "roll") {
      const g = Cr(f, d(f.id, "target"), t), y = String(d(f.id, "selector") ?? f.config.selector ?? "perception"), w = Lr(f.config.dc), I = await t.rollStatistic(g, y, w);
      n.set(`${f.id}:total`, I.total), n.set(`${f.id}:degree`, I.degree), l.rolls.push({ type: String(f.config.roll ?? "check"), selector: y, value: w, total: I.total, degree: I.degree, resolved: !0 }), await u(f.id, (s.get(f.id) ?? []).some((A) => A.from.port === I.degree) ? I.degree : "next");
      return;
    }
    const m = Dr(f, d(f.id, "value"), d(f.id, "selector"), d(f.id, "target"), t), b = Kt(m);
    if (b) {
      const g = await Yt({ id: f.id, name: f.label, effects: [b] }, t);
      kr(l, g), n.set(`${f.id}:result`, g.healing || g.damage || ((E = g.resources[0]) == null ? void 0 : E.amount) || 0);
    }
    await u(f.id, "next");
  }, u = async (p, f) => {
    for (const m of (s.get(p) ?? []).filter((b) => b.from.port === f)) await c(m.to.nodeId);
  }, d = (p, f) => {
    const m = o.get(`${p}:${f}`);
    return m ? n.get(`${m.from.nodeId}:${m.from.port}`) : void 0;
  }, h = r.nodes.filter((p) => p.category === "trigger" && (!t.triggerEvent || p.type === t.triggerEvent || p.type === "custom" && (p.config.event ?? p.config.selector) === t.triggerEvent));
  for (const p of h) await c(p.id);
  return l;
}
function Dr(r, t, e, i, s) {
  const o = structuredClone(r);
  return t !== void 0 && (o.config.formula = t, o.config.value = t, o.config.distance = t), e !== void 0 && (o.config.selector = e), i !== void 0 && (o.config.target = Nr(String(i), s)), o;
}
function _r(r, t, e, i, s) {
  if (typeof t == "boolean") return t;
  if (r.type === "chance") return Math.random() * 100 < Number(r.config.threshold ?? 50);
  if (r.type === "compare") {
    const o = e ?? s[String(r.config.fact ?? "actor.level")], n = i ?? r.config.equals ?? r.config.value ?? 1, a = String(r.config.operator ?? "eq");
    return a === "eq" ? o === n : a === "neq" ? o !== n : typeof o != "number" || typeof n != "number" ? !1 : a === "gt" ? o > n : a === "gte" ? o >= n : a === "lt" ? o < n : o <= n;
  }
  return he({ type: "fact", key: String(r.config.fact ?? "always"), equals: Pr(r.config.equals ?? !0) }, s);
}
function Cr(r, t, e) {
  var s, o, n, a, l, c;
  if (typeof t == "string") return t;
  const i = String(r.config.target ?? "self");
  return i === "target" ? ((s = e.target) == null ? void 0 : s.id) ?? e.actor.id : i === "allies" ? ((n = (o = e.allies) == null ? void 0 : o[0]) == null ? void 0 : n.id) ?? e.actor.id : i === "enemies" ? ((l = (a = e.enemies) == null ? void 0 : a[0]) == null ? void 0 : l.id) ?? ((c = e.target) == null ? void 0 : c.id) ?? e.actor.id : e.actor.id;
}
function Nr(r, t) {
  var e, i;
  return r === t.actor.id ? "self" : r === ((e = t.target) == null ? void 0 : e.id) ? "target" : (i = t.allies) != null && i.some((s) => s.id === r) ? "allies" : "enemies";
}
function Or(r) {
  const t = /* @__PURE__ */ new Map();
  for (const e of r) t.set(e.from.nodeId, [...t.get(e.from.nodeId) ?? [], e]);
  return t;
}
function Rr() {
  return { messages: [], healing: 0, damage: 0, appliedModifiers: [], modifierOperations: [], appliedConditions: [], rolls: [], movements: [], resources: [], choices: [] };
}
function kr(r, t) {
  r.messages.push(...t.messages), r.healing += t.healing, r.damage += t.damage, r.appliedModifiers.push(...t.appliedModifiers), r.modifierOperations.push(...t.modifierOperations), r.appliedConditions.push(...t.appliedConditions), r.rolls.push(...t.rolls), r.movements.push(...t.movements), r.resources.push(...t.resources), r.choices.push(...t.choices);
}
function Lr(r) {
  const t = Number(r);
  return r == null || r === "" || !Number.isFinite(t) ? void 0 : t;
}
function Pr(r) {
  return typeof r == "string" || typeof r == "number" || typeof r == "boolean" ? r : String(r);
}
function oe(r, t = []) {
  const e = r.grants.flatMap((s) => {
    if (!("mode" in s)) return [];
    const o = r.mode === "any" ? [...t, { groupId: r.id, optionId: s.id }] : t;
    return oe(s, o);
  });
  if (r.mode !== "any") return e;
  const i = r.grants.map((s) => {
    var o;
    return "mode" in s ? { id: s.id, label: s.label || s.id } : { id: s.ref, label: ((o = s.overrides) == null ? void 0 : o.name) || s.ref };
  });
  return [{ id: r.id, label: r.label || r.id, pick: r.pick ?? 1, options: i, requirements: t }, ...e];
}
function Mr(r) {
  return r.some((t) => oe(t).length > 0);
}
class ri {
  constructor(t, e) {
    v(this, "catalogCache", null);
    v(this, "foundryRoll", async (t) => {
      const e = globalThis.Roll;
      if (!e) throw new Error("Foundry Roll is unavailable.");
      const i = await new e(t).evaluate({ async: !0 });
      return Number(i.total ?? 0);
    });
    this.deities = t, this.adapters = e;
  }
  async getSelectableDeities(t) {
    var p, f, m, b;
    const e = this.deities.list(), i = t.systemId ?? ((f = (p = S()) == null ? void 0 : p.system) == null ? void 0 : f.id) ?? "", s = B(!0), o = { classId: t.classId, level: t.level, region: t.region, pantheonFilter: t.pantheonFilter, systemId: i, catalogContext: t.catalogContext, viewer: s }, n = JSON.stringify([e.map((E) => [E.id, E.revision]), o]);
    if (((m = this.catalogCache) == null ? void 0 : m.key) === n) return this.catalogCache.result;
    const a = await (((b = this.adapters.tryGet(i)) == null ? void 0 : b.listOfficialDeities()) ?? Promise.resolve([])), l = t.catalogContext ?? "characterBuilder", c = new Set(e.filter((E) => E.replacement.sourceUuid && (E.replacement.mode === "hide" || E.replacement.mode === "replace") && (!E.replacement.contexts.length || E.replacement.contexts.includes(l))).map((E) => E.replacement.sourceUuid)), u = Ti(e, t, /* @__PURE__ */ new Set(), s), d = a.filter((E) => !E.sourceUuid || !c.has(E.sourceUuid)), h = [...u, ...d];
    return this.catalogCache = { key: n, result: h }, h;
  }
  exportDeities(t) {
    return D(), gr(this.deities.list(), t);
  }
  async importDeities(t) {
    D();
    const e = Jt(t);
    for (const i of e) this.deities.save(i);
    return await this.deities.flushPersistence(), this.catalogCache = null, e.length;
  }
  drawRandomDeity(t) {
    const e = B(!0);
    return tt(this.deities.list().filter((i) => i.kind !== "lore" && X(i, e) && Z(i, e) === "revealed").map((i) => ({ id: i.id, label: i.name, weight: 1 })), t);
  }
  getAdapterCapabilities(t) {
    return this.adapters.get(t).capabilities;
  }
  isDeitySelectableByPlayer(t, e = { ...B(!0), isGM: !1 }) {
    const i = this.deities.get(t);
    return !!(i && i.kind !== "lore" && X(i, e) && Z(i, e) === "revealed");
  }
  async materializeDeity(t, e, i) {
    D();
    const s = this.deities.get(t);
    if (!s) throw new Error(`Unknown deity: ${t}`);
    return this.adapters.get(e).materialize(s, i);
  }
  getDeity(t) {
    const e = this.deities.get(t);
    if (!e) return null;
    const i = B();
    return i.isGM ? e : Z(e, i) === "revealed" ? K(e, i) : null;
  }
  getActorDeity(t) {
    var o;
    this.requireActorOwner(t);
    const e = (o = t.flags) == null ? void 0 : o["darkis-godforge"];
    if (!e || typeof e != "object" || !("deityId" in e) || typeof e.deityId != "string") return null;
    const i = this.deities.get(e.deityId);
    if (!i) return null;
    const s = { ...B(), actorDeityId: e.deityId, ownsActor: !0 };
    return s.isGM ? i : K(i, s);
  }
  getCharacterWidgetData(t) {
    var a;
    this.requireActorOwner(t);
    const e = (a = t.flags) == null ? void 0 : a["darkis-godforge"], i = e && typeof e == "object" && "deityId" in e && "grants" in e && "usages" in e ? e : null, s = i ? this.deities.get(i.deityId) : null;
    if (!s || !i) return de(null, null);
    const o = B();
    if (o.isGM) return de(s, i);
    const n = K(s, { ...o, actorDeityId: s.id, ownsActor: !0 });
    return de(n, { ...i, grants: [] });
  }
  getCharacterWidgetDataForViewer(t, e) {
    var a;
    const i = (a = t.flags) == null ? void 0 : a["darkis-godforge"], s = i && typeof i == "object" && "deityId" in i && "grants" in i && "usages" in i ? i : null, o = s ? this.deities.get(s.deityId) : null;
    if (!o || !s) return de(null, null);
    const n = K(o, { ...e, actorDeityId: o.id, actorId: t.id, ownsActor: !0 });
    return de(n, { ...s, grants: [] });
  }
  getCodexSnapshot(t) {
    return this.deities.list().flatMap((e) => {
      var o, n;
      if (!X(e, t)) return [];
      const i = Z(e, t);
      if (i === "hidden") return [];
      if (i === "rumor") return [{ id: e.id, name: "", discovery: i, rumorName: (o = e.discovery) == null ? void 0 : o.rumorName, rumorText: (n = e.discovery) == null ? void 0 : n.rumorText, choiceGroups: [] }];
      const s = K(e, t);
      return s ? [{ ...s, discovery: i, lore: e.kind === "lore", choiceGroups: e.kind === "lore" ? [] : e.grantGroups.flatMap((a) => oe(a)) }] : [];
    });
  }
  getGrantChoices(t, e) {
    var i;
    return D(), ((i = this.deities.get(t)) == null ? void 0 : i.grantGroups) ?? null;
  }
  getClassGrants(t, e, i = []) {
    D();
    const s = this.deities.get(t);
    if (!s) throw new Error(`Unknown deity: ${t}`);
    return Pi(s, e, i);
  }
  buildClassCoupling(t, e, i, s = []) {
    return this.adapters.get(i).buildClassCoupling(this.getClassGrants(t, e, s));
  }
  async assignDeity(t, e, i = {}) {
    var l;
    this.requireActorOwner(t);
    const s = this.deities.get(e);
    if (!s || s.kind === "lore" || !X(s, B(!0))) throw new Error("Deity is not available for assignment.");
    const o = Object.entries(i).map(([c, u]) => ({ groupId: c, refs: u })), n = s.grantGroups.flatMap((c) => Ee(c, o)), a = Object.fromEntries(s.abilities.filter((c) => c.uses).map((c) => [c.id, { used: 0, max: c.uses.max, lastResetAt: Date.now(), reset: c.uses.reset }]));
    await t.update({ flags: { "darkis-godforge": { deityId: e, grants: n, usages: a } } }), await this.synchronizeActorDeityItem(t, s), (l = re()) == null || l.Hooks.callAll("godforge.trigger", "deity-assigned", t);
  }
  async removeDeity(t) {
    var e;
    this.requireActorOwner(t), t.unsetFlag ? await Promise.all(["deityId", "grants", "usages"].map((i) => t.unsetFlag("darkis-godforge", i))) : await t.update({ flags: { "darkis-godforge": null } }), await this.removeActorDeityItems(t), (e = re()) == null || e.Hooks.callAll("godforge.trigger", "deity-removed", t);
  }
  async resetActorUsages(t, e) {
    this.requireActorOwner(t);
    const i = this.readState(t), s = Date.now(), o = Object.fromEntries(Object.entries(i.usages).map(([n, a]) => a.reset === e ? [n, _i(a, s)] : [n, a]));
    await t.update({ flags: { "darkis-godforge": { ...i, usages: o } } });
  }
  async prepareAbility(t, e, i = {}) {
    var b, E;
    D();
    const s = this.readState(t), o = this.deities.get(s.deityId), n = o == null ? void 0 : o.abilities.find((g) => g.id === e);
    if (!n) throw new Error("Ability is not available for this actor.");
    const a = s.usages[e];
    if (a && !Bt(a)) throw new Error("No uses remaining.");
    const l = [t, i.targetActor, ...i.allies ?? [], ...i.enemies ?? []].filter((g) => !!g), c = new Map(l.map((g) => [g.id, g])), u = Object.fromEntries(l.map((g) => [g.id, this.effectTarget(g)])), d = structuredClone(u), h = i.facts ?? this.formulaFacts(t, i.targetActor), p = {
      actor: u[t.id],
      target: i.targetActor ? u[i.targetActor.id] : void 0,
      allies: (b = i.allies) == null ? void 0 : b.map((g) => u[g.id]),
      enemies: (E = i.enemies) == null ? void 0 : E.map((g) => u[g.id]),
      facts: h,
      conditionFacts: {
        always: !0,
        "actor.level": h.actor.level,
        "actor.hpPercent": h.actor.hpPercent,
        "target.hpPercent": h.target.hpPercent,
        "random.percent": Math.floor(Math.random() * 100) + 1
      },
      rollDice: i.rollDice ?? this.foundryRoll
    }, f = n.graph && G(n.graph).valid ? await ii(n.graph, { ...p, triggerEvent: this.requireGraphTrigger(n.graph, i.triggerEvent ?? "manual"), rollStatistic: (g, y, w) => this.rollStatistic(c.get(g), y, w) }) : await Yt(n, p), m = ki(d, u, f, t.id);
    return a && m.push({ kind: "actor-update", targetId: t.id, path: "flags.darkis-godforge", before: structuredClone(s), after: { ...structuredClone(s), usages: { ...structuredClone(s.usages), [e]: Di(a) } } }), {
      id: crypto.randomUUID(),
      actorId: t.id,
      deityId: o.id,
      abilityId: e,
      abilityName: n.name,
      createdAt: Date.now(),
      operations: m,
      result: f,
      updatedTargets: u
    };
  }
  async commitPreparedAbility(t, e, i, s = {}) {
    if (D(), e.actorId !== t.id || Date.now() - e.createdAt > 5 * 6e4) throw new Error("Ability preview is stale or belongs to another actor.");
    const o = this.readState(t), n = this.deities.get(o.deityId);
    if (!(n == null ? void 0 : n.abilities.find((u) => u.id === e.abilityId)) || e.deityId !== (n == null ? void 0 : n.id)) throw new Error("Ability changed after the preview was created.");
    const l = e.operations.find((u) => u.kind === "actor-update" && u.targetId === t.id && u.path === "flags.darkis-godforge");
    if ((l == null ? void 0 : l.kind) === "actor-update" && JSON.stringify(l.before) !== JSON.stringify(o)) throw new Error("Ability usage changed while the preview was waiting for approval.");
    const c = new Map([t, s.targetActor, ...s.allies ?? [], ...s.enemies ?? []].filter((u) => !!u).map((u) => [u.id, u]));
    await i(e, c);
  }
  async activateAbility(t, e, i = {}) {
    const s = await this.prepareAbility(t, e, i);
    await this.commitPreparedAbility(t, s, async (o, n) => {
      for (const a of o.operations.filter((l) => l.kind === "actor-update")) {
        const l = n.get(a.targetId);
        l && await l.update({ [a.path]: a.after });
      }
    }, i);
  }
  getReplacementFor(t) {
    return D(), this.deities.list().find((e) => e.replacement.sourceUuid === t && e.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(t, e) {
    return D(), this.deities.list().some((i) => i.replacement.sourceUuid === t && i.replacement.mode === "hide" && i.replacement.contexts.includes(e));
  }
  registerAdapter(t) {
    D(), this.adapters.register(t);
  }
  async synchronizeActorDeityItem(t, e) {
    var l, c;
    const i = (c = (l = S()) == null ? void 0 : l.system) == null ? void 0 : c.id, s = i ? this.adapters.tryGet(i) : null;
    if (!s || !t.createEmbeddedDocuments) return;
    const o = this.actorDeityItems(t), n = o[0];
    await s.materialize(e, { createItem: async (u) => {
      if (n != null && n.update)
        return await n.update(u), { uuid: n.uuid ?? `Actor.${t.id}.Item.${n.id}` };
      const [d] = await t.createEmbeddedDocuments("Item", [u]);
      if (!d) throw new Error("The system did not create the deity item.");
      return { uuid: d.uuid ?? `Actor.${t.id}.Item.${d.id}` };
    } }) && o.length > 1 && t.deleteEmbeddedDocuments && await t.deleteEmbeddedDocuments("Item", o.slice(1).map((u) => u.id)), s.capabilities.passiveBonuses && await Ar(t, e.id, e.name, e.passiveBonuses);
  }
  async removeActorDeityItems(t) {
    var i;
    const e = (((i = t.items) == null ? void 0 : i.contents) ?? []).filter((s) => {
      var n;
      const o = (n = s.flags) == null ? void 0 : n["darkis-godforge"];
      return !!(o && typeof o == "object" && ("definitionUuid" in o || "passiveBonusItem" in o || "abilityId" in o));
    }).map((s) => s.id);
    e.length && t.deleteEmbeddedDocuments && await t.deleteEmbeddedDocuments("Item", e);
  }
  actorDeityItems(t) {
    var e;
    return (((e = t.items) == null ? void 0 : e.contents) ?? []).filter((i) => {
      var o;
      const s = (o = i.flags) == null ? void 0 : o["darkis-godforge"];
      return !!(s && typeof s == "object" && "definitionUuid" in s);
    });
  }
  readState(t) {
    var i;
    const e = (i = t.flags) == null ? void 0 : i["darkis-godforge"];
    if (!e || typeof e != "object" || !("deityId" in e) || typeof e.deityId != "string" || !("usages" in e) || typeof e.usages != "object") throw new Error("Actor has no assigned deity.");
    return e;
  }
  effectTarget(t) {
    var n;
    const e = t.system ?? {}, i = $(e.attributes), s = $(i.hp), o = $(e.currency);
    return {
      id: t.id,
      hp: V(s.value),
      maxHp: V(s.max),
      gold: V(o.gp),
      modifiers: {},
      conditions: (((n = t.items) == null ? void 0 : n.contents) ?? []).filter((a) => a.type === "condition").map((a) => String($(a.system).slug ?? a.name ?? a.id))
    };
  }
  formulaFacts(t, e) {
    const i = t.system ?? {}, s = (e == null ? void 0 : e.system) ?? {};
    return {
      actor: { level: V($(i.details).level) ?? V(i.level) ?? 0, hpPercent: Dt(i) },
      target: { hpPercent: Dt(s) }
    };
  }
  async rollStatistic(t, e, i) {
    var d, h;
    if (!t) throw new Error("The roll target actor is unavailable.");
    const s = (d = t.getStatistic) == null ? void 0 : d.call(t, e), o = ((h = s == null ? void 0 : s.check) == null ? void 0 : h.roll) ?? (s == null ? void 0 : s.roll);
    if (!o) throw new Error(`System statistic is unavailable: ${e}`);
    const n = await o.call((s == null ? void 0 : s.check) ?? s, { createMessage: !1, skipDialog: !0, ...i === void 0 ? {} : { dc: { value: i } } }), a = $(n), l = $(a.roll), c = V(a.total) ?? V(l.total);
    if (c === void 0) throw new Error(`The ${e} roll did not return a total.`);
    const u = a.degreeOfSuccess ?? $(a.options).degreeOfSuccess ?? l.degreeOfSuccess;
    if (u === void 0 && i === void 0) throw new Error(`The ${e} roll needs a DC or a system-provided degree of success.`);
    return { total: c, degree: Ur(u, c, i) };
  }
  requireGraphTrigger(t, e) {
    if (!t.nodes.some((s) => s.category === "trigger" && (s.type === e || s.type === "custom" && (s.config.event ?? s.config.selector) === e))) throw new Error(`This ability has no ${e} trigger.`);
    return e;
  }
  requireActorOwner(t) {
    var i, s;
    const e = S();
    if (((i = e == null ? void 0 : e.user) == null ? void 0 : i.isGM) !== !0 && !(e != null && e.user && ((s = t.testUserPermission) == null ? void 0 : s.call(t, e.user, "OWNER")) === !0))
      throw new Error("GodForge: Actor owner or GM required.");
  }
}
function $(r) {
  return r && typeof r == "object" && !Array.isArray(r) ? r : {};
}
function V(r) {
  const t = Number(r);
  return Number.isFinite(t) ? t : void 0;
}
function Dt(r) {
  const t = $($(r.attributes).hp), e = V(t.value), i = V(t.max);
  return e === void 0 || !i ? void 0 : e / i * 100;
}
function Ur(r, t, e) {
  return r === 3 || r === "criticalSuccess" || r === "critical-success" ? "critical-success" : r === 2 || r === "success" ? "success" : r === 1 || r === "failure" ? "failure" : r === 0 || r === "criticalFailure" || r === "critical-failure" ? "critical-failure" : e === void 0 || t >= e ? "success" : "failure";
}
function J(r) {
  return r.replace(/[&<>\"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function j(r) {
  if (!r) return "icons/svg/eye.svg";
  const t = r.trim();
  return /^(?:javascript|data|vbscript):/i.test(t) || /^\/\//.test(t) || /[\u0000-\u001f]/.test(t) ? "icons/svg/eye.svg" : t;
}
function Gr(r) {
  const t = [];
  r.name.trim() || t.push({ level: "error", field: "name", message: "Name is required." }), r.title.trim() || t.push({ level: "warning", field: "title", message: "Title is empty." }), r.description.trim() || t.push({ level: "warning", field: "description", message: "Description is empty." });
  for (const e of r.passiveBonuses)
    (!e.name.trim() || !e.selector.trim()) && t.push({ level: "error", field: `bonus.${e.id}`, message: "Bonus name and selector are required." }), typeof e.value == "string" && !Ze(e.value) && t.push({ level: "error", field: `bonus.${e.id}.value`, message: "Bonus formula is invalid." });
  for (const e of r.abilities)
    e.name.trim() || t.push({ level: "error", field: `ability.${e.id}`, message: "Ability name is required." }), !e.timing && e.actionCost === void 0 && t.push({ level: "warning", field: `ability.${e.id}.timing`, message: "Ability timing is incomplete." });
  return t;
}
function ne() {
  var i;
  const r = globalThis, t = typeof foundry < "u" ? foundry : r.foundry, e = (i = t == null ? void 0 : t.applications) == null ? void 0 : i.api;
  if (e != null && e.ApplicationV2 && e.HandlebarsApplicationMixin) return e.HandlebarsApplicationMixin(e.ApplicationV2);
  if (re()) {
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
function Y() {
  const r = ne();
  return class extends r {
    render(t) {
      return rt() ? super.render(t) : (st(), Promise.resolve(this));
    }
  };
}
function H(r, t) {
  var e, i, s;
  console.error(`Darkis GodForge | ${r}`, t), (s = (i = (e = U()) == null ? void 0 : e.notifications) == null ? void 0 : i.error) == null || s.call(i, q("DARKIS_GODFORGE.ERROR.ACTION_FAILED"));
}
class xe extends ne() {
  constructor(e, i, s, o) {
    super();
    v(this, "groups", []);
    v(this, "tokens", /* @__PURE__ */ new Map());
    v(this, "error", "");
    this.deity = e, this.actor = i, this.socketRouter = s, this.onAssigned = o;
  }
  async _prepareContext() {
    this.tokens.clear();
    const e = "choiceGroups" in this.deity ? this.deity.choiceGroups : this.deity.grantGroups.flatMap((o) => oe(o)), i = /* @__PURE__ */ new Map(), s = e.map((o, n) => o.options.map((a, l) => {
      const c = `${n}-${l}-${crypto.randomUUID()}`;
      return this.tokens.set(c, a.id), i.set(`${o.id}\0${a.id}`, c), { token: c, label: a.label };
    }));
    return this.groups = e.map((o, n) => ({
      id: o.id,
      label: o.label,
      pick: o.pick,
      inputType: o.pick === 1 ? "radio" : "checkbox",
      options: s[n] ?? [],
      requirements: o.requirements.flatMap((a) => {
        const l = e.findIndex((u) => u.id === a.groupId), c = i.get(`${a.groupId}\0${a.optionId}`);
        return l >= 0 && c ? [{ name: `choice-${l}`, token: c }] : [];
      })
    })), { ui: T(), deityName: this.deity.name, groups: this.groups, error: this.error };
  }
  _onRender() {
    var i, s, o, n, a, l;
    (s = (i = this.element) == null ? void 0 : i.querySelector("form")) == null || s.addEventListener("submit", (c) => {
      var h;
      c.preventDefault();
      const u = c.currentTarget, d = {};
      for (const [p, f] of this.groups.entries()) {
        if ((h = u.querySelector(`[data-choice-group='${p}']`)) != null && h.hidden) continue;
        const m = [...u.querySelectorAll(`[name='choice-${p}']:checked`)].flatMap((b) => {
          const E = this.tokens.get(b.value);
          return E ? [E] : [];
        });
        if (m.length !== f.pick) {
          this.error = `${f.label}: ${(T().PICK_EXACTLY ?? "Choose exactly {count} option(s).").replace("{count}", String(f.pick))}`, this.render(!0);
          return;
        }
        d[f.id] = m;
      }
      this.socketRouter.assign({ actorId: this.actor.id, deityId: this.deity.id, choices: d }).then(() => {
        var p;
        this.onAssigned(), (p = this.close) == null || p.call(this);
      }).catch((p) => {
        this.error = T().ASSIGNMENT_FAILED ?? "The deity could not be assigned.", H("Grant choice assignment failed.", p), this.render(!0);
      });
    });
    const e = () => {
      var c;
      (c = this.element) == null || c.querySelectorAll("[data-choice-group]").forEach((u) => {
        const h = [...u.querySelectorAll("[data-choice-requirement]")].every((p) => {
          var b, E;
          const f = p.dataset.name ?? "", m = p.dataset.token ?? "";
          return ((E = (b = this.element) == null ? void 0 : b.querySelector(`[name='${f}'][value='${m}']`)) == null ? void 0 : E.checked) === !0;
        });
        u.hidden = !h, u.querySelectorAll("input").forEach((p) => {
          p.disabled = !h, h || (p.checked = !1);
        });
      });
    };
    (n = (o = this.element) == null ? void 0 : o.querySelector("form")) == null || n.addEventListener("change", e), e(), (l = (a = this.element) == null ? void 0 : a.querySelector("[data-action='cancel']")) == null || l.addEventListener("click", () => {
      var c;
      return void ((c = this.close) == null ? void 0 : c.call(this));
    });
  }
}
v(xe, "DEFAULT_OPTIONS", { id: "darkis-godforge-grant-choices", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHOOSE_GRANTS", resizable: !0 }, position: { width: 620, height: 680 } }), v(xe, "PARTS", { main: { template: "modules/darkis-godforge/templates/grant-choice-dialog.hbs" } });
function Ie(r) {
  const t = me(r == null ? void 0 : r.focusX, 50, 0, 100), e = me(r == null ? void 0 : r.focusY, 25, 0, 100), i = me(r == null ? void 0 : r.zoom, 1, 1, 3), s = me(r == null ? void 0 : r.rotation, 0, -180, 180);
  return {
    imageFit: (r == null ? void 0 : r.fit) === "contain" ? "contain" : "cover",
    imagePosition: `${t}% ${e}%`,
    imageTransform: `scale(${i}) rotate(${s}deg)`,
    imageTransformOrigin: `${t}% ${e}%`
  };
}
function me(r, t, e, i) {
  return Math.max(e, Math.min(i, Number.isFinite(r) ? r : t));
}
const _t = "modules/darkis-godforge/assets/unknown-deity.svg";
class se extends ne() {
  constructor(e, i, s, o, n, a) {
    super();
    v(this, "searchTerm", "");
    v(this, "selectedDomain", "");
    v(this, "spread", 0);
    v(this, "searchTimer", null);
    v(this, "remoteChoices", /* @__PURE__ */ new Map());
    this.deityService = e, this.preview = i, this.api = s, this.socketRouter = o, this.actor = n, this.viewerOverride = a;
  }
  async _prepareContext() {
    var p, f, m, b, E, g, y, w;
    const e = ((p = this.preview) == null ? void 0 : p.viewer) ?? this.viewerOverride ?? B(!0), i = !e.isGM && !this.preview && !this.viewerOverride && this.socketRouter ? await this.socketRouter.codexSnapshot((f = this.actor) == null ? void 0 : f.id) : null;
    this.remoteChoices.clear();
    for (const I of i ?? []) this.remoteChoices.set(I.id, I);
    const s = this.preview ? [{ ...this.preview.deity, status: "published" }] : i ?? this.deityService.list(), o = (E = (b = (m = this.actor) == null ? void 0 : m.flags) == null ? void 0 : b["darkis-godforge"]) == null ? void 0 : E.deityId, n = (g = S()) == null ? void 0 : g.user, a = !!(this.actor && n && ((w = (y = this.actor).testUserPermission) == null ? void 0 : w.call(y, n, "OWNER")) === !0), l = s.flatMap((I) => {
      var F, ae, ce, R, fe, nt, at, ct, lt;
      if ("discovery" in I && typeof I.discovery == "string")
        return I.discovery === "rumor" ? [{ id: I.id, name: ((F = I.rumorName) == null ? void 0 : F.trim()) || T().UNKNOWN_DEITY || "Unknown deity", title: T().UNREVEALED || "Not yet discovered", image: _t, imageFit: "cover", imagePosition: "50% 35%", rumor: !0, rumorText: ((ae = I.rumorText) == null ? void 0 : ae.trim()) || T().UNKNOWN_DEITY_HINT }] : [{ ...I, image: j(I.image), ...Ie((ce = I.imagePresentation) == null ? void 0 : ce.image), lore: I.lore, selected: I.id === o, canSelect: !I.lore && !!(this.actor && this.socketRouter), requiresChoices: I.choiceGroups.length > 0 }];
      if (!X(I, e)) return [];
      const A = Z(I, e);
      if (A === "hidden") return [];
      if (A === "rumor")
        return [{
          id: I.id,
          name: ((fe = (R = I.discovery) == null ? void 0 : R.rumorName) == null ? void 0 : fe.trim()) || T().UNKNOWN_DEITY || "Unknown deity",
          title: T().UNREVEALED || "Not yet discovered",
          image: _t,
          imageFit: "cover",
          imagePosition: "50% 35%",
          rumor: !0,
          rumorText: ((at = (nt = I.discovery) == null ? void 0 : nt.rumorText) == null ? void 0 : at.trim()) || T().UNKNOWN_DEITY_HINT
        }];
      const C = Mr(I.grantGroups), N = I.kind === "lore", _ = e.isGM ? I : K(I, e);
      return _ ? [{
        ..._,
        image: j(_.image),
        ...Ie((ct = _.imagePresentation) == null ? void 0 : ct.image),
        lore: N,
        selected: I.id === o,
        canSelect: !N && !!(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && (e.ownsActor || a)),
        canReveal: e.isGM && ((lt = I.discovery) == null ? void 0 : lt.enabled) === !0,
        requiresChoices: C
      }] : [];
    }).sort((I, A) => Number(A.lore) - Number(I.lore) || I.name.localeCompare(A.name)), c = l.filter(
      (I) => {
        var A;
        return (!this.searchTerm || `${I.name} ${I.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || ((A = I.domains) == null ? void 0 : A.includes(this.selectedDomain)));
      }
    ), u = Math.max(1, Math.ceil(c.length / 2));
    this.spread = Math.max(0, Math.min(this.spread, u - 1));
    const d = c[this.spread * 2], h = c[this.spread * 2 + 1];
    return {
      ui: T(),
      left: d,
      right: h,
      hasEntries: c.length > 0,
      domains: [...new Set(l.flatMap((I) => I.domains ?? []))].sort(),
      searchTerm: this.searchTerm,
      selectedDomain: this.selectedDomain,
      spreadNumber: this.spread + 1,
      spreadCount: u,
      canPrevious: this.spread > 0,
      canNext: this.spread < u - 1,
      isGM: e.isGM,
      isPreview: !!(this.preview || this.viewerOverride)
    };
  }
  _onRender() {
    var o, n;
    const e = this.element;
    if (!e) return;
    const i = e.querySelector("[data-search]"), s = e.querySelector("[data-filter]");
    i && (i.value = this.searchTerm), s && (s.value = this.selectedDomain), i == null || i.addEventListener("input", (a) => {
      this.searchTerm = a.target.value.toLocaleLowerCase(), this.spread = 0, this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => void this.render(!0), 160);
    }), s == null || s.addEventListener("change", (a) => {
      this.selectedDomain = a.target.value, this.spread = 0, this.render(!0);
    }), (o = e.querySelector("[data-page='previous']")) == null || o.addEventListener("click", () => {
      this.spread -= 1, this.render(!0);
    }), (n = e.querySelector("[data-page='next']")) == null || n.addEventListener("click", () => {
      this.spread += 1, this.render(!0);
    }), e.querySelectorAll("[data-reveal-deity]").forEach((a) => a.addEventListener("click", () => {
      var c, u;
      const l = this.deityService.get(a.dataset.revealDeity ?? "");
      !l || !((u = (c = S()) == null ? void 0 : c.user) != null && u.isGM) || (this.deityService.update(l.id, { discovery: { ...l.discovery, enabled: !1, defaultState: "revealed" } }), this.deityService.flushPersistence().then(() => {
        var d;
        return (d = re()) == null || d.Hooks.callAll("godforge.trigger", "deity-revealed", this.actor), this.render(!0);
      }).catch((d) => H("Deity reveal failed.", d)));
    })), e.addEventListener("keydown", (a) => {
      a.target.matches("input, select") || (a.key === "ArrowLeft" && this.spread > 0 && (this.spread -= 1, this.render(!0)), a.key === "ArrowRight" && (this.spread += 1, this.render(!0)));
    }), e.querySelectorAll("[data-select-deity]").forEach((a) => a.addEventListener("click", () => {
      if (!this.actor || !this.socketRouter) return;
      const l = a.dataset.selectDeity ?? "", c = this.deityService.get(l) ?? this.remoteChoices.get(l);
      if (!c) return;
      const u = "choiceGroups" in c ? c.choiceGroups : c.grantGroups.flatMap((d) => oe(d));
      if (u.length) {
        new xe("choiceGroups" in c ? { id: c.id, name: c.name, choiceGroups: u } : c, this.actor, this.socketRouter, () => void this.render(!0)).render(!0);
        return;
      }
      this.socketRouter.assign({ actorId: this.actor.id, deityId: c.id, choices: {} }).then(() => this.render(!0)).catch((d) => H("Deity assignment failed.", d));
    }));
  }
  _onClose() {
    this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = null;
  }
}
v(se, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1120, height: 790 } }), v(se, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
class $e extends ne() {
  constructor(e, i, s, o, n) {
    super();
    v(this, "selected", /* @__PURE__ */ new Set());
    this.dialogTitle = e, this.choices = i, this.multiple = o, this.onChoose = n, s.forEach((a) => this.selected.add(a));
  }
  async _prepareContext() {
    const e = this.choices.map((s, o) => {
      var n;
      return { ...s, token: String(o), selected: this.selected.has(s.value), traitText: ((n = s.traits) == null ? void 0 : n.join(", ")) ?? "", rankText: s.rank === void 0 ? "" : String(s.rank), available: s.available !== !1 };
    }), i = (s) => [...new Set(s.filter((o) => !!o))].sort((o, n) => o.localeCompare(n));
    return { ui: T(), title: this.dialogTitle, items: e, multiple: this.multiple, categories: i(e.map((s) => s.category)), groups: i(e.map((s) => s.group)), sources: i(e.map((s) => s.source)), ranks: [...new Set(e.flatMap((s) => s.rank === void 0 ? [] : [s.rank]))].sort((s, o) => s - o), traits: i(e.flatMap((s) => s.traits ?? [])) };
  }
  _onRender() {
    var l, c, u;
    const e = this.element;
    if (!e) return;
    const i = [...e.querySelectorAll("[data-picker-item]")], s = () => {
      var I, A, C, N, _, F, ae, ce;
      const d = ((I = e.querySelector("[data-picker-search]")) == null ? void 0 : I.value.trim().toLocaleLowerCase()) ?? "", h = ((A = e.querySelector("[data-picker-category]")) == null ? void 0 : A.value) ?? "", p = ((C = e.querySelector("[data-picker-group]")) == null ? void 0 : C.value) ?? "", f = ((N = e.querySelector("[data-picker-source]")) == null ? void 0 : N.value) ?? "", m = ((_ = e.querySelector("[data-picker-rank]")) == null ? void 0 : _.value) ?? "", b = ((F = e.querySelector("[data-picker-trait]")) == null ? void 0 : F.value) ?? "", E = ((ae = e.querySelector("[data-picker-available]")) == null ? void 0 : ae.checked) === !0, g = ((ce = e.querySelector("[data-picker-remaster]")) == null ? void 0 : ce.checked) === !0;
      for (const R of i) {
        const fe = `${R.dataset.label ?? ""} ${R.dataset.traits ?? ""} ${R.dataset.category ?? ""} ${R.dataset.group ?? ""} ${R.dataset.source ?? ""}`.toLocaleLowerCase();
        R.hidden = !!(d && !fe.includes(d) || h && R.dataset.category !== h || p && R.dataset.group !== p || f && R.dataset.source !== f || m && R.dataset.rank !== m || b && !(R.dataset.traits ?? "").split("|").includes(b) || E && R.dataset.available !== "true" || g && R.dataset.remaster !== "true");
      }
      const y = i.filter((R) => !R.hidden).length, w = e.querySelector("[data-picker-count]");
      w && (w.textContent = String(y));
    }, o = (d) => {
      i.forEach((f) => f.classList.toggle("active", f === d));
      const h = e.querySelector("[data-picker-preview-image]");
      h && (h.hidden = !d.dataset.img, d.dataset.img && (h.src = d.dataset.img));
      const p = (f, m) => {
        const b = e.querySelector(f);
        b && (b.textContent = m || "—");
      };
      p("[data-picker-preview-name]", d.dataset.label ?? ""), p("[data-picker-preview-category]", [d.dataset.category, d.dataset.group].filter(Boolean).join(" · ")), p("[data-picker-preview-traits]", (d.dataset.traits ?? "").replaceAll("|", ", ")), p("[data-picker-preview-source]", d.dataset.source ?? ""), p("[data-picker-preview-rank]", d.dataset.rank ?? "");
    }, n = (d) => {
      var f;
      const h = this.choices[Number(d.dataset.pickerItem)];
      if (!h) return;
      if (!this.multiple) {
        this.onChoose({ values: [h.value], items: [h] }), (f = this.close) == null || f.call(this);
        return;
      }
      this.selected.has(h.value) ? this.selected.delete(h.value) : this.selected.add(h.value), d.classList.toggle("selected", this.selected.has(h.value));
      const p = d.querySelector("[data-picker-choose]");
      p && p.setAttribute("aria-pressed", String(this.selected.has(h.value)));
    };
    e.querySelectorAll("[data-picker-filter]").forEach((d) => d.addEventListener("input", s)), i.forEach((d) => {
      d.addEventListener("click", (h) => {
        o(d), h.target.closest("[data-picker-choose]") && n(d);
      }), d.addEventListener("dblclick", () => n(d));
    }), e.addEventListener("dragover", (d) => d.preventDefault()), e.addEventListener("drop", (d) => {
      var m;
      d.preventDefault();
      const h = ((m = d.dataTransfer) == null ? void 0 : m.getData("text/plain")) ?? "";
      let p = h.trim();
      try {
        const b = JSON.parse(h);
        typeof b.uuid == "string" && (p = b.uuid);
      } catch {
      }
      const f = this.choices.findIndex((b) => b.value === p);
      f >= 0 && n(i[f]);
    }), (l = e.querySelector("[data-picker-confirm]")) == null || l.addEventListener("click", () => {
      var h;
      const d = this.choices.filter((p) => this.selected.has(p.value));
      this.onChoose({ values: d.map((p) => p.value), items: d }), (h = this.close) == null || h.call(this);
    }), (c = e.querySelector("[data-picker-clear]")) == null || c.addEventListener("click", () => {
      var d;
      this.onChoose({ values: [], items: [] }), (d = this.close) == null || d.call(this);
    }), (u = e.querySelector("[data-picker-cancel]")) == null || u.addEventListener("click", () => {
      var d;
      return void ((d = this.close) == null ? void 0 : d.call(this));
    });
    const a = i.find((d) => d.classList.contains("selected")) ?? i[0];
    a && o(a), s();
  }
}
v($e, "DEFAULT_OPTIONS", { id: "darkis-godforge-picker", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.PICKER_TITLE", resizable: !0 }, position: { width: 980, height: 720 } }), v($e, "PARTS", { main: { template: "modules/darkis-godforge/templates/picker-dialog.hbs" } });
const ye = [
  { category: "trigger", type: "manual", label: "Manual button", icon: "fa-hand-pointer" },
  { category: "trigger", type: "skill-check", label: "Skill check", icon: "fa-dice-d20" },
  { category: "trigger", type: "attack-roll", label: "Attack roll", icon: "fa-crosshairs" },
  { category: "trigger", type: "saving-throw", label: "Saving throw", icon: "fa-shield-halved" },
  { category: "trigger", type: "damage-roll", label: "Damage roll", icon: "fa-burst" },
  { category: "trigger", type: "damage-taken", label: "Damage taken", icon: "fa-heart-crack" },
  { category: "trigger", type: "healing-received", label: "Healing received", icon: "fa-heart-pulse" },
  { category: "trigger", type: "combat-start", label: "Combat start", icon: "fa-swords" },
  { category: "trigger", type: "turn-start", label: "Turn start", icon: "fa-play" },
  { category: "trigger", type: "turn-end", label: "Turn end", icon: "fa-stop" },
  { category: "trigger", type: "round-start", label: "Round start", icon: "fa-rotate" },
  { category: "trigger", type: "daily-preparations", label: "Daily preparations", icon: "fa-sun" },
  { category: "trigger", type: "token-move", label: "Token movement", icon: "fa-location-arrow" },
  { category: "trigger", type: "deity-assigned", label: "Deity assigned", icon: "fa-link" },
  { category: "trigger", type: "custom", label: "Custom event", icon: "fa-puzzle-piece" },
  { category: "logic", type: "condition", label: "Condition", icon: "fa-code-branch" },
  { category: "logic", type: "chance", label: "Chance", icon: "fa-percent" },
  { category: "logic", type: "compare", label: "Compare values", icon: "fa-scale-balanced" },
  { category: "logic", type: "branch", label: "Branch", icon: "fa-code-branch" },
  { category: "action", type: "heal", label: "Heal", icon: "fa-kit-medical" },
  { category: "action", type: "damage", label: "Damage", icon: "fa-burst" },
  { category: "action", type: "modifier", label: "Bonus / penalty", icon: "fa-plus-minus" },
  { category: "action", type: "condition", label: "Apply condition", icon: "fa-shield-virus" },
  { category: "action", type: "roll", label: "Request roll", icon: "fa-dice" },
  { category: "action", type: "resource", label: "Resource", icon: "fa-coins" },
  { category: "action", type: "movement", label: "Movement", icon: "fa-person-running" },
  { category: "action", type: "message", label: "Chat message", icon: "fa-message" },
  { category: "result", type: "success", label: "Success", icon: "fa-check" },
  { category: "result", type: "failure", label: "Failure", icon: "fa-xmark" },
  { category: "result", type: "summary", label: "Summary", icon: "fa-scroll" },
  { category: "result", type: "end", label: "End", icon: "fa-flag-checkered" }
];
class Ve extends Y() {
  constructor(e, i) {
    super();
    v(this, "graph");
    v(this, "selectedId", "");
    v(this, "connectFrom", "");
    v(this, "connectFromPort", "next");
    v(this, "connectFromType", "flow");
    v(this, "history", []);
    v(this, "future", []);
    v(this, "search", "");
    v(this, "category", "all");
    v(this, "simulation", []);
    v(this, "searchTimer", null);
    v(this, "zoom", 1);
    this.onSave = i, this.graph = structuredClone(e ?? xi());
  }
  async _prepareContext() {
    D();
    const e = T(), i = G(this.graph), s = this.graph.nodes.find((c) => c.id === this.selectedId), o = this.graph.nodes.map((c) => {
      const u = be(c), d = ye.find((h) => h.category === c.category && h.type === c.type);
      return {
        ...c,
        label: kt(c, e),
        selected: c.id === this.selectedId,
        connecting: c.id === this.connectFrom,
        style: `left:${c.x}px;top:${c.y}px;height:${Math.max(88, 58 + Math.max(u.filter((h) => h.direction === "input").length, u.filter((h) => h.direction === "output").length) * 24)}px`,
        icon: (d == null ? void 0 : d.icon) ?? "fa-circle-nodes",
        hasError: i.issues.some((h) => h.nodeId === c.id),
        miniStyle: `left:${c.x / 20}px;top:${c.y / 20}px`,
        categoryLabel: e[`CATEGORY_${c.category.toUpperCase()}`] ?? c.category,
        inputPorts: Nt(u.filter((h) => h.direction === "input"), e),
        outputPorts: Nt(u.filter((h) => h.direction === "output"), e)
      };
    }), n = this.graph.edges.flatMap((c) => {
      const u = this.graph.nodes.find((f) => f.id === c.from.nodeId), d = this.graph.nodes.find((f) => f.id === c.to.nodeId);
      if (!u || !d) return [];
      const h = Ot(u, c.from.port, "output"), p = Ot(d, c.to.port, "input");
      return [{ ...c, x1: h.x, y1: h.y, x2: p.x, y2: p.y, path: xr(h.x, h.y, p.x, p.y), portType: c.from.type }];
    }), l = ye.map((c) => ({ ...c, label: e[He(c.type)] ?? c.label, categoryLabel: e[`CATEGORY_${c.category.toUpperCase()}`] ?? c.category })).filter((c) => (this.category === "all" || c.category === this.category) && (!this.search || `${c.label} ${c.type}`.toLocaleLowerCase().includes(this.search)));
    return {
      ui: e,
      graph: this.graph,
      nodes: o,
      edges: n,
      selected: s,
      selectedCategory: s ? e[`CATEGORY_${s.category.toUpperCase()}`] ?? s.category : "",
      selectedConfig: s ? this.configFields(s, e) : [],
      library: l,
      issues: i.issues.map((c) => ({ ...c, message: Rt(c.code, e) })),
      valid: i.valid,
      search: this.search,
      category: this.category,
      connecting: !!this.connectFrom,
      canUndo: this.history.length > 0,
      canRedo: this.future.length > 0,
      outline: Vi({ ...this.graph, nodes: this.graph.nodes.map((c) => ({ ...c, label: kt(c, e) })) }).map((c) => Vr(c, e)),
      simulation: this.simulation,
      zoomPercent: Math.round(this.zoom * 100),
      canvasStyle: `transform:scale(${this.zoom});transform-origin:0 0`
    };
  }
  _onRender() {
    var i, s, o, n, a, l, c, u, d, h, p, f;
    D();
    const e = this.element;
    e && ((i = e.querySelector("[data-library-search]")) == null || i.addEventListener("input", (m) => {
      this.search = m.target.value.toLocaleLowerCase(), this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => void this.render(!0), 140);
    }), (s = e.querySelector("[data-library-category]")) == null || s.addEventListener("change", (m) => {
      const b = m.target.value;
      this.category = b === "trigger" || b === "logic" || b === "action" || b === "result" ? b : "all", this.render(!0);
    }), e.querySelectorAll("[data-add-node]").forEach((m) => m.addEventListener("click", () => this.addNode(m.dataset.category, m.dataset.type ?? ""))), e.querySelectorAll("[data-graph-node]").forEach((m) => {
      var b;
      m.addEventListener("click", (E) => {
        E.target.closest("[data-node-port]") || (this.selectedId = m.dataset.graphNode ?? "", this.render(!0));
      }), m.addEventListener("keydown", (E) => this.onNodeKeydown(E, m.dataset.graphNode ?? "")), (b = m.querySelector("[data-node-drag]")) == null || b.addEventListener("pointerdown", (E) => this.beginDrag(E, m)), m.querySelectorAll("[data-node-output]").forEach((E) => E.addEventListener("click", () => {
        this.connectFrom = m.dataset.graphNode ?? "", this.connectFromPort = E.dataset.nodeOutput || "next", this.connectFromType = Ct(E.dataset.portType), this.render(!0);
      })), m.querySelectorAll("[data-node-input]").forEach((E) => E.addEventListener("click", () => this.finishConnection(m.dataset.graphNode ?? "", E.dataset.nodeInput ?? "in", Ct(E.dataset.portType))));
    }), (o = e.querySelector("[data-action='delete-node']")) == null || o.addEventListener("click", () => this.deleteSelected()), (n = e.querySelector("[data-action='duplicate-node']")) == null || n.addEventListener("click", () => this.duplicateSelected()), (a = e.querySelector("[data-action='auto-layout']")) == null || a.addEventListener("click", () => this.mutate(() => {
      this.graph = mt(this.graph);
    })), (l = e.querySelector("[data-action='zoom-in']")) == null || l.addEventListener("click", () => this.setZoom(this.zoom + 0.1)), (c = e.querySelector("[data-action='zoom-out']")) == null || c.addEventListener("click", () => this.setZoom(this.zoom - 0.1)), (u = e.querySelector("[data-action='center-graph']")) == null || u.addEventListener("click", () => this.centerGraph()), e.querySelectorAll("[data-graph-template]").forEach((m) => m.addEventListener("click", () => this.applyTemplate(m.dataset.graphTemplate ?? ""))), (d = e.querySelector("[data-action='undo']")) == null || d.addEventListener("click", () => this.undo()), (h = e.querySelector("[data-action='redo']")) == null || h.addEventListener("click", () => this.redo()), (p = e.querySelector("[data-action='simulate']")) == null || p.addEventListener("click", () => void this.simulate()), (f = e.querySelector("[data-action='save-graph']")) == null || f.addEventListener("click", () => {
      var b;
      G(this.graph).valid && (this.onSave(structuredClone(this.graph)), (b = this.close) == null || b.call(this));
    }), e.querySelectorAll("[data-node-field]").forEach((m) => m.addEventListener("change", () => this.updateSelected(m))));
  }
  _onClose() {
    this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = null;
  }
  addNode(e, i) {
    const s = ye.find((o) => o.category === e && o.type === i);
    s && this.mutate(() => {
      const o = this.graph.nodes.length % 4, n = Math.floor(this.graph.nodes.length / 4), a = { id: crypto.randomUUID(), category: e, type: i, label: T()[He(i)] ?? s.label, x: 80 + o * 280, y: 80 + n * 170, config: Fr(e, i) };
      this.graph.nodes.push(a), this.selectedId = a.id;
    });
  }
  setZoom(e) {
    this.zoom = Math.max(0.5, Math.min(1.5, Math.round(e * 10) / 10)), this.render(!0);
  }
  centerGraph() {
    var a;
    const e = (a = this.element) == null ? void 0 : a.querySelector(".dg-graph-region");
    if (!e || !this.graph.nodes.length) return;
    const i = Math.min(...this.graph.nodes.map((l) => l.x)) * this.zoom, s = Math.min(...this.graph.nodes.map((l) => l.y)) * this.zoom, o = Math.max(...this.graph.nodes.map((l) => l.x + 240)) * this.zoom, n = Math.max(...this.graph.nodes.map((l) => l.y + 130)) * this.zoom;
    e.scrollTo({ left: Math.max(0, (i + o - e.clientWidth) / 2), top: Math.max(0, (s + n - e.clientHeight) / 2), behavior: "smooth" });
  }
  applyTemplate(e) {
    this.mutate(() => {
      e === "heal" ? this.graph = te({ trigger: "manual", effects: [{ type: "heal", formula: "1d8", target: "target" }, { type: "message", text: "The blessing takes effect." }] }) : e === "damage-reaction" ? this.graph = te({ trigger: "damage-taken", effects: [{ type: "modifier", selector: "ac", value: 1, modifierType: "status", target: "self", duration: 1 }] }) : e === "daily-resource" && (this.graph = te({ trigger: "daily-preparations", effects: [{ type: "resource", resource: "item", operation: "add", formula: "1", target: "self", itemUuid: "" }] })), this.graph = mt(this.graph), this.selectedId = "";
    });
  }
  deleteSelected() {
    this.selectedId && this.mutate(() => {
      this.graph.nodes = this.graph.nodes.filter((e) => e.id !== this.selectedId), this.graph.edges = this.graph.edges.filter((e) => e.from.nodeId !== this.selectedId && e.to.nodeId !== this.selectedId), this.selectedId = "";
    });
  }
  duplicateSelected() {
    const e = this.graph.nodes.find((i) => i.id === this.selectedId);
    e && this.mutate(() => {
      const i = { ...structuredClone(e), id: crypto.randomUUID(), x: e.x + 32, y: e.y + 32, label: `${e.label} ${T().COPY_SUFFIX ?? "Copy"}` };
      this.graph.nodes.push(i), this.selectedId = i.id;
    });
  }
  finishConnection(e, i, s) {
    !this.connectFrom || this.connectFrom === e || this.connectFromType === s && this.mutate(() => {
      s !== "flow" && (this.graph.edges = this.graph.edges.filter((o) => !(o.to.nodeId === e && o.to.port === i))), this.graph.edges.some((o) => o.from.nodeId === this.connectFrom && o.from.port === this.connectFromPort && o.to.nodeId === e && o.to.port === i) || this.graph.edges.push({ id: crypto.randomUUID(), from: { nodeId: this.connectFrom, port: this.connectFromPort, type: this.connectFromType }, to: { nodeId: e, port: i, type: s } }), this.connectFrom = "", this.connectFromPort = "next", this.connectFromType = "flow";
    });
  }
  beginDrag(e, i) {
    const s = i.dataset.graphNode ?? "", o = this.graph.nodes.find((u) => u.id === s);
    if (!o) return;
    e.preventDefault();
    const n = { x: e.clientX, y: e.clientY, nodeX: o.x, nodeY: o.y }, a = structuredClone(this.graph), l = (u) => {
      o.x = Math.round((n.nodeX + u.clientX - n.x) / 8) * 8, o.y = Math.round((n.nodeY + u.clientY - n.y) / 8) * 8, i.style.left = `${o.x}px`, i.style.top = `${o.y}px`;
    }, c = () => {
      window.removeEventListener("pointermove", l), window.removeEventListener("pointerup", c), this.history.push(a), this.future = [], this.render(!0);
    };
    window.addEventListener("pointermove", l), window.addEventListener("pointerup", c, { once: !0 });
  }
  onNodeKeydown(e, i) {
    if (e.key === "Delete") {
      this.selectedId = i, this.deleteSelected();
      return;
    }
    if (e.key.toLocaleLowerCase() === "c") {
      this.connectFrom = i, this.render(!0);
      return;
    }
    const s = this.graph.nodes.find((o) => o.id === i);
    !s || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) || (e.preventDefault(), this.mutate(() => {
      e.key === "ArrowLeft" && (s.x -= 16), e.key === "ArrowRight" && (s.x += 16), e.key === "ArrowUp" && (s.y -= 16), e.key === "ArrowDown" && (s.y += 16);
    }));
  }
  updateSelected(e) {
    const i = this.graph.nodes.find((s) => s.id === this.selectedId);
    i && this.mutate(() => {
      const s = e.dataset.nodeField ?? "";
      s === "label" ? i.label = e.value.slice(0, 160) : e.type === "number" ? i.config[s] = Number(e.value) : s === "equals" ? i.config[s] = $r(e.value) : i.config[s] = e.value;
    });
  }
  async simulate() {
    var n;
    const e = G(this.graph), i = T();
    if (!e.valid) {
      this.simulation = e.issues.map((a) => Rt(a.code, i)), this.render(!0);
      return;
    }
    const s = { id: "simulation-actor", hp: 20, maxHp: 30, gold: 10, modifiers: {}, conditions: [] }, o = { id: "simulation-target", hp: 15, maxHp: 25, gold: 5, modifiers: {}, conditions: [] };
    try {
      const a = await ii(this.graph, {
        actor: s,
        target: o,
        allies: [],
        enemies: [o],
        facts: { actor: { level: 5, hpPercent: 66 }, target: { hpPercent: 60 } },
        conditionFacts: { always: !0, "actor.level": 5, "actor.hpPercent": 66, "target.hpPercent": 60 },
        triggerEvent: ((n = this.graph.nodes.find((l) => l.category === "trigger")) == null ? void 0 : n.type) ?? "manual",
        rollDice: async () => 5,
        rollStatistic: async () => ({ total: 15, degree: "success" }),
        choose: async (l, c) => {
          var u;
          return ((u = c[0]) == null ? void 0 : u.id) ?? "";
        },
        runMacro: async () => {
        },
        rollTable: async () => i.SIMULATION_RANDOM_TABLE ?? "Simulated random-table result"
      });
      this.simulation = [
        `${this.graph.nodes.length} ${i.NODES ?? "nodes"} · ${this.graph.edges.length} ${i.CONNECTIONS ?? "connections"}`,
        `${i.HEALING ?? "Healing"}: ${a.healing} · ${i.DAMAGE ?? "Damage"}: ${a.damage}`,
        ...a.rolls.map((l) => `${l.selector}: ${l.total ?? "–"} (${l.degree ?? l.type})`),
        ...a.modifierOperations.map((l) => `${l.targetId}: ${l.selector} ${l.value >= 0 ? "+" : ""}${l.value}`),
        ...a.appliedConditions.map((l) => `${i.CONDITION ?? "Condition"}: ${l}`),
        ...a.messages
      ];
    } catch (a) {
      this.simulation = [a instanceof Error ? a.message : String(a)];
    }
    this.render(!0);
  }
  undo() {
    const e = this.history.pop();
    e && (this.future.push(structuredClone(this.graph)), this.graph = e, this.render(!0));
  }
  redo() {
    const e = this.future.pop();
    e && (this.history.push(structuredClone(this.graph)), this.graph = e, this.render(!0));
  }
  mutate(e) {
    this.history.push(structuredClone(this.graph)), this.history.length > 100 && this.history.shift(), this.future = [], e(), this.render(!0);
  }
  configFields(e, i) {
    const s = (n, a) => i[n] ?? a, o = [{ key: "label", label: s("NODE_LABEL", "Label"), value: e.label, type: "text" }];
    return e.category === "trigger" && o.push({ key: "selector", label: s("EVENT_FILTER", "Event filter"), value: String(e.config.selector ?? ""), type: "text" }), e.category === "logic" && (e.type === "chance" ? o.push({ key: "threshold", label: s("CHANCE_PERCENT", "Chance in percent"), value: String(e.config.threshold ?? 50), type: "number" }) : (o.push({ key: "fact", label: s("FACT_PATH", "Fact"), value: String(e.config.fact ?? "actor.level"), type: "text" }), e.type === "compare" && o.push({ key: "operator", label: s("COMPARISON", "Comparison"), value: String(e.config.operator ?? "gte"), type: "select", options: ["eq", "neq", "gt", "gte", "lt", "lte"].map((n) => ({ value: n, label: i[`COMPARE_${n.toUpperCase()}`] ?? n, selected: n === String(e.config.operator ?? "gte") })) }), o.push({ key: "equals", label: s("EXPECTED_VALUE", "Expected value"), value: String(e.config.equals ?? !0), type: "text" }))), ["heal", "damage", "resource", "modifier"].includes(e.type) && o.push({ key: "formula", label: s("FORMULA_VALUE", "Formula or value"), value: String(e.config.formula ?? e.config.value ?? "1"), type: "text" }), ["modifier", "roll"].includes(e.type) && o.push({ key: "selector", label: s("SYSTEM_SELECTOR", "System selector"), value: String(e.config.selector ?? "perception"), type: "text" }), e.type === "roll" && o.push({ key: "dc", label: s("DIFFICULTY_CLASS", "Difficulty class"), value: String(e.config.dc ?? 15), type: "number" }), e.type === "condition" && o.push({ key: "condition", label: s("CONDITION", "Condition"), value: String(e.config.condition ?? "frightened"), type: "text" }), (e.type === "message" || e.type === "summary") && o.push({ key: "text", label: s("TEXT", "Text"), value: String(e.config.text ?? ""), type: "textarea" }), e.category === "action" && !["message", "summary"].includes(e.type) && o.push({ key: "target", label: s("TARGET", "Target"), value: String(e.config.target ?? "self"), type: "select", options: ["self", "target", "allies", "enemies", "group"].map((n) => ({ value: n, label: i[`TARGET_${n.toUpperCase()}`] ?? n, selected: n === String(e.config.target ?? "self") })) }), o.map((n) => ({ ...n, isSelect: n.type === "select", isTextarea: n.type === "textarea" }));
  }
}
v(Ve, "DEFAULT_OPTIONS", { id: "darkis-godforge-ability-builder", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.BUILDER_TITLE", resizable: !0 }, position: { width: 1380, height: 850 } }), v(Ve, "PARTS", { main: { template: "modules/darkis-godforge/templates/ability-builder.hbs" } });
function Fr(r, t) {
  return r === "logic" && t === "chance" ? { threshold: 50 } : r === "logic" && t === "compare" ? { fact: "actor.level", operator: "gte", equals: 1 } : r === "logic" ? { fact: "always", equals: !0 } : t === "heal" || t === "damage" ? { formula: "1d8", target: "self" } : t === "modifier" ? { selector: "perception", value: 1, modifierType: "status", target: "self" } : t === "condition" ? { condition: "frightened", operation: "add", target: "target" } : t === "roll" ? { selector: "perception", roll: "check", dc: 15, target: "self" } : t === "movement" ? { distance: 5, mode: "step", target: "target" } : t === "resource" ? { resource: "hp", operation: "add", formula: "1", target: "self" } : t === "message" || t === "summary" ? { text: "" } : {};
}
function xr(r, t, e, i) {
  const s = Math.max(70, Math.abs(e - r) / 2);
  return `M ${r} ${t} C ${r + s} ${t}, ${e - s} ${i}, ${e} ${i}`;
}
function He(r) {
  return `NODE_${r.replaceAll("-", "_").toUpperCase()}`;
}
function $r(r) {
  if (r === "true") return !0;
  if (r === "false") return !1;
  const t = Number(r);
  return r.trim() !== "" && Number.isFinite(t) ? t : r;
}
function Ct(r) {
  return r === "actor" || r === "number" || r === "boolean" || r === "text" || r === "roll" || r === "degree" || r === "item" || r === "event" ? r : "flow";
}
function Nt(r, t) {
  return r.map((e, i) => ({ ...e, label: t[`PORT_${e.port.replaceAll("-", "_").toUpperCase()}`] ?? e.label, style: `top:${42 + i * 24}px` }));
}
function Ot(r, t, e) {
  const i = be(r).filter((o) => o.direction === e), s = Math.max(0, i.findIndex((o) => o.port === t));
  return { x: r.x + (e === "output" ? 220 : 0), y: r.y + 42 + s * 24 };
}
function Rt(r, t) {
  return t[`GRAPH_ISSUE_${r.replace(/[.-]/g, "_").toUpperCase()}`] ?? (t.GRAPH_ISSUE_GENERIC ?? "Invalid graph element ({code}).").replace("{code}", r);
}
function Vr(r, t) {
  return r.replace(/^Trigger:/, `${t.CATEGORY_TRIGGER ?? "Trigger"}:`).replace(/^Logic:/, `${t.CATEGORY_LOGIC ?? "Logic"}:`).replace(/^Action:/, `${t.CATEGORY_ACTION ?? "Action"}:`).replace(/^Result:/, `${t.CATEGORY_RESULT ?? "Result"}:`);
}
function kt(r, t) {
  var o;
  const e = t[He(r.type)];
  if (!e) return r.label;
  const i = (o = ye.find((n) => n.category === r.category && n.type === r.type)) == null ? void 0 : o.label, s = new Set([i, r.type, Hr(r.type), r.type === "manual" ? "Manual" : "", r.type === "random-wheel" ? "Random Wheel" : ""].filter(Boolean));
  return !r.label || s.has(r.label) ? e : r.label;
}
function Hr(r) {
  return r.split("-").map((t) => t && t[0].toUpperCase() + t.slice(1)).join(" ");
}
const Lt = Object.keys(ee.fields);
class we extends Y() {
  constructor(e, i, s = new Qe(), o) {
    super();
    v(this, "systemCatalog", { skills: [], domains: [], weapons: [], spells: [], fonts: [], sanctifications: [], attributes: [] });
    v(this, "officialChoices", []);
    v(this, "catalogLoaded", !1);
    v(this, "officialLoaded", !1);
    this.deityService = e, this.onSaved = i, this.adapters = s, this.existing = o;
  }
  _prepareContext() {
    var l, c, u;
    D();
    const e = ((c = (l = S()) == null ? void 0 : l.system) == null ? void 0 : c.id) ?? "", i = this.adapters.tryGet(e), s = (i == null ? void 0 : i.listSkills()) ?? [];
    this.systemCatalog.skills = s.map((d) => ({ value: d, label: d }));
    const o = ((u = this.existing) == null ? void 0 : u.replacement.sourceUuid) ?? "", n = o ? [{ id: o, sourceUuid: o, official: !0, name: o, title: o, domains: [], selected: !0 }] : [], a = T();
    return {
      ui: { ...a, NEW_DEITY: this.existing ? a.EDIT_DEITY : a.NEW_DEITY },
      selectors: s,
      systemCatalog: this.systemCatalog,
      pantheonOptions: this.deityService.list().flatMap((d) => d.pantheons ?? []).filter((d, h, p) => p.findIndex((f) => f.id === d.id) === h).map((d) => {
        var h, p;
        return { ...d, selected: ((p = (h = this.existing) == null ? void 0 : h.pantheonIds) == null ? void 0 : p.includes(d.id)) === !0 };
      }),
      officialDeities: n,
      visibilityFields: Lt.map((d) => ({ key: d, label: a[`VIS_FIELD_${d.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? d })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((d) => ({ value: d, label: a[`VIS_${d.replaceAll("-", "_").toUpperCase()}`] ?? d }))
    };
  }
  _onRender() {
    var o, n, a, l, c;
    D();
    const e = this.element, i = e == null ? void 0 : e.querySelector("form");
    let s = !1;
    e && i && this.existing && this.populateForm(e, i, this.existing), e && i && this.setupWizard(e, i), i && this.refreshPickerControls(i), e == null || e.querySelectorAll("[data-action='browse-image']").forEach((u) => u.addEventListener("click", () => this.openFilePicker(e, u))), e == null || e.querySelectorAll("[data-image-field]").forEach((u) => {
      u.addEventListener("dragover", (d) => {
        d.preventDefault(), d.dataTransfer.dropEffect = "copy";
      }), u.addEventListener("drop", (d) => this.handleImageDrop(d, u));
    }), (o = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || o.addEventListener("click", () => {
      var u;
      s && !globalThis.confirm(T().DISCARD_UNSAVED ?? "Discard unsaved changes?") || (u = this.close) == null || u.call(this);
    }), (n = e == null ? void 0 : e.querySelector("[data-action='add-bonus']")) == null || n.addEventListener("click", () => this.appendTemplate(e, "bonus", "[data-bonus-list]")), (a = e == null ? void 0 : e.querySelector("[data-action='add-ability']")) == null || a.addEventListener("click", () => this.appendTemplate(e, "ability", "[data-ability-list]")), (l = e == null ? void 0 : e.querySelector("[data-action='add-grant-group']")) == null || l.addEventListener("click", () => this.appendTemplate(e, "grant-group", "[data-grant-list]")), e == null || e.addEventListener("click", (u) => {
      var p, f, m;
      const d = u.target.closest("[data-action]");
      if (!d) return;
      if (d.dataset.action === "open-system-picker" && i) {
        this.openSystemPicker(i, d);
        return;
      }
      if (d.dataset.action === "open-ability-builder") {
        this.openAbilityBuilder(d);
        return;
      }
      if (d.dataset.action === "generate-image-variants" && i) {
        this.generateImageVariants(i, d);
        return;
      }
      if (d.dataset.action === "scroll-steps-left" || d.dataset.action === "scroll-steps-right") {
        (p = e.querySelector(".dg-step-strip")) == null || p.scrollBy({ left: d.dataset.action.endsWith("right") ? 260 : -260, behavior: "smooth" });
        return;
      }
      const h = d == null ? void 0 : d.closest(".dg-editor-card");
      h && (d.dataset.action === "add-grant-member" && this.appendTemplate(h, "grant-member", ":scope > [data-grant-members]"), d.dataset.action === "add-subgroup" && this.appendTemplate(h, "grant-group", ":scope > [data-grant-members]"), d.dataset.action === "add-effect" && this.appendTemplate(h, "effect", ":scope > [data-effect-list]"), d.dataset.action === "remove-row" && h.remove(), d.dataset.action === "duplicate-row" && h.after(h.cloneNode(!0)), d.dataset.action === "move-up" && h.previousElementSibling && ((f = h.parentElement) == null || f.insertBefore(h, h.previousElementSibling)), d.dataset.action === "move-down" && h.nextElementSibling && ((m = h.parentElement) == null || m.insertBefore(h.nextElementSibling, h)), this.updateStackingWarnings(e), i && this.updateWizardPreview(e, i));
    }), e == null || e.addEventListener("input", (u) => {
      s = !0, this.updateStackingWarnings(e);
      const d = u.target;
      d.matches("[data-image-input]") && this.updateImagePreview(e, d.name, d.value), d.matches("[data-formula]") && this.validateFormulaField(d), i && this.updateWizardPreview(e, i);
    }), e == null || e.addEventListener("change", (u) => {
      s = !0;
      const d = u.target;
      if (d.name === "replacement.sourceUuid" && i) {
        const h = i.elements.namedItem("replacement.mode");
        h && (h.value = d.value ? "replace" : "none"), d.value && i.querySelectorAll("[name^='replacement.inherit.']").forEach((p) => {
          p.checked = p.name !== "replacement.inherit.edicts" && p.name !== "replacement.inherit.anathema";
        });
      }
      if (d.matches("[data-weapon-picker]") && i) {
        const h = d.selectedOptions[0], p = i.elements.namedItem("favoredWeapon"), f = i.elements.namedItem("favoredWeaponUuid");
        p && (p.value = (h == null ? void 0 : h.dataset.slug) ?? ""), f && (f.value = d.value);
      }
      d.matches("[data-image-setting]") && this.updateImagePresentationPreview(e, d.dataset.imageSetting ?? ""), i && this.updateWizardPreview(e, i);
    }), e == null || e.querySelectorAll("[data-image-input]").forEach((u) => this.updateImagePreview(e, u.name, u.value)), e == null || e.querySelectorAll("[data-action='preview-player']").forEach((u) => u.addEventListener("click", () => {
      const d = i == null ? void 0 : i.elements.namedItem("name");
      if (!i || !(d != null && d.reportValidity())) return;
      const h = this.previewDefinition(i);
      new se(this.deityService, { deity: h, viewer: { isGM: !1, selection: !0 } }).render(!0);
    })), (c = e == null ? void 0 : e.querySelector("[data-action='save-draft']")) == null || c.addEventListener("click", () => {
      const u = i == null ? void 0 : i.elements.namedItem("name");
      !i || !(u != null && u.reportValidity()) || this.saveDefinition(i, !0);
    }), i == null || i.addEventListener("submit", (u) => {
      u.preventDefault(), this.saveDefinition(i, !1);
    });
  }
  setupWizard(e, i) {
    const s = [...e.querySelectorAll("[data-wizard-panel]")], o = [...e.querySelectorAll("[data-wizard-step]")], n = e.querySelector("[data-expert-toggle]"), a = e.querySelector("[data-action='previous-step']"), l = e.querySelector("[data-action='next-step']"), c = e.querySelector("[data-action='finish']"), u = e.querySelector("[data-wizard-current]"), d = e.querySelector("[data-wizard-total]"), h = i.elements.namedItem("kind");
    let p = 0;
    const f = (E) => ((h == null ? void 0 : h.value) !== "lore" || !E.hasAttribute("data-selectable-only")) && (!E.hasAttribute("data-expert-only") || (n == null ? void 0 : n.checked) === !0), m = () => o.map((E) => E.dataset.wizardStep ?? "").filter((E) => s.some((g) => g.dataset.wizardPanel === E && f(g))), b = (E) => {
      var w;
      const g = m();
      p = Math.max(0, Math.min(g.length - 1, E));
      const y = g[p];
      s.forEach((I) => {
        I.hidden = I.dataset.wizardPanel !== y || !f(I);
      }), o.forEach((I) => {
        const A = g.indexOf(I.dataset.wizardStep ?? "");
        I.hidden = A < 0, I.querySelector("b").textContent = A < 0 ? "" : String(A + 1), I.classList.toggle("completed", A >= 0 && A < p), I.dataset.wizardStep === y ? I.setAttribute("aria-current", "step") : I.removeAttribute("aria-current");
      }), a && (a.disabled = p === 0), l && (l.hidden = p === g.length - 1), c && (c.hidden = p !== g.length - 1), u && (u.textContent = String(p + 1)), d && (d.textContent = String(g.length)), (w = o.find((I) => I.getAttribute("aria-current") === "step")) == null || w.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }), this.updateWizardPreview(e, i);
    };
    o.forEach((E) => E.addEventListener("click", () => {
      const g = m().indexOf(E.dataset.wizardStep ?? "");
      g >= 0 && b(g);
    })), a == null || a.addEventListener("click", () => b(p - 1)), l == null || l.addEventListener("click", () => b(p + 1)), h == null || h.addEventListener("change", () => b(0)), n == null || n.addEventListener("change", () => b(Math.min(p, m().length - 1))), b(0);
  }
  updateWizardPreview(e, i) {
    var d, h;
    const s = T(), o = (p) => {
      var f;
      return ((f = i.elements.namedItem(p)) == null ? void 0 : f.value.trim()) ?? "";
    }, n = (p, f) => {
      const m = e.querySelector(p);
      m && (m.textContent = f);
    };
    n("[data-wizard-preview-name]", o("name") || s.NEW_DEITY_PLACEHOLDER || "New deity"), n("[data-wizard-preview-title]", o("title") || "—"), n("[data-wizard-preview-description]", o("description") || s.PREVIEW_EMPTY_DESCRIPTION || "—");
    const a = e.querySelector("[data-wizard-preview-quote]");
    a && (a.textContent = o("quote"), a.hidden = !a.textContent);
    const l = i.elements.namedItem("status");
    n("[data-wizard-preview-status]", ((d = l == null ? void 0 : l.selectedOptions[0]) == null ? void 0 : d.textContent) ?? s.STATUS_DRAFT ?? "Draft");
    const c = i.elements.namedItem("replacement.sourceUuid");
    n("[data-wizard-preview-source]", c != null && c.value ? ((h = this.officialChoices.find((p) => p.value === c.value)) == null ? void 0 : h.label) ?? c.value : "—"), n("[data-wizard-preview-bonuses]", String(i.querySelectorAll("[data-bonus-row]").length)), n("[data-wizard-preview-abilities]", String(i.querySelectorAll("[data-ability-row]").length));
    const u = e.querySelector("[data-wizard-preview-image]");
    u && (u.src = o("image") ? j(o("image")) : "modules/darkis-godforge/assets/logo.png");
  }
  async saveDefinition(e, i) {
    var n;
    D();
    const s = this.readInput(e);
    i && (s.status = "draft");
    const o = this.existing ? this.deityService.update(this.existing.id, s) : this.deityService.create(s);
    try {
      await this.deityService.flushPersistence(), this.onSaved(o), await ((n = this.close) == null ? void 0 : n.call(this));
    } catch (a) {
      H("Deity persistence failed.", a);
    }
  }
  appendTemplate(e, i, s) {
    var c, u, d;
    const o = ((c = this.element) == null ? void 0 : c.querySelector(`template[data-template='${i}']`)) ?? (e == null ? void 0 : e.querySelector(`template[data-template='${i}']`)), n = e == null ? void 0 : e.querySelector(s);
    if (!o || !n) return;
    const a = o.content.cloneNode(!0);
    (d = (u = a.querySelector("[name$='.visibility']")) == null ? void 0 : u.querySelector("[value='followers']")) == null || d.setAttribute("selected", "selected"), n.append(a), this.updateStackingWarnings(e);
    const l = e == null ? void 0 : e.querySelector("form");
    e && l && this.updateWizardPreview(e, l);
  }
  previewDefinition(e) {
    const i = (/* @__PURE__ */ new Date()).toISOString();
    return { ...this.readInput(e), id: "preview", schemaVersion: P, revision: 1, createdAt: i, updatedAt: i, checksum: "preview" };
  }
  populateForm(e, i, s) {
    var n, a, l, c, u, d, h, p, f, m, b, E;
    const o = {
      name: s.name,
      title: s.title,
      kind: s.kind ?? "selectable",
      status: s.status,
      description: s.description,
      quote: s.quote ?? "",
      image: s.image ?? "",
      icon: s.icon ?? "",
      symbol: s.symbol ?? "",
      banner: s.banner ?? "",
      pantheons: (s.pantheonIds ?? []).join(", "),
      domains: s.domains.join(", "),
      alternateDomains: (s.alternateDomains ?? []).join(", "),
      divineAttributes: (s.divineAttributes ?? []).join(", "),
      spells: this.formatSpells(s.spells),
      tags: (s.tags ?? []).join(", "),
      alignment: s.alignment ?? "",
      favoredWeapon: s.favoredWeapon ?? "",
      favoredWeaponUuid: s.favoredWeaponUuid ?? "",
      font: s.font ?? "",
      skill: s.skill ?? "",
      sanctification: s.sanctification ?? "",
      cause: s.cause ?? "",
      edicts: (s.edicts ?? []).join(", "),
      anathema: (s.anathema ?? []).join(", "),
      gmNotes: s.gmNotes ?? "",
      "replacement.mode": s.replacement.mode,
      "replacement.sourceUuid": s.replacement.sourceUuid,
      "replacement.contexts": s.replacement.contexts.join(", "),
      "visibility.deity": s.visibility.deity,
      "discovery.defaultState": ((n = s.discovery) == null ? void 0 : n.defaultState) ?? "revealed",
      "discovery.rumorName": ((a = s.discovery) == null ? void 0 : a.rumorName) ?? "",
      "discovery.rumorText": ((l = s.discovery) == null ? void 0 : l.rumorText) ?? "",
      "discovery.revealedToUsers": (((c = s.discovery) == null ? void 0 : c.revealedToUsers) ?? []).join(", "),
      "discovery.revealedToActors": (((u = s.discovery) == null ? void 0 : u.revealedToActors) ?? []).join(", ")
    };
    for (const [g, y] of Object.entries(s.visibility.fields)) o[`visibility.fields.${g}`] = y;
    for (const g of ["image", "icon", "symbol", "banner"]) {
      const y = (d = s.imagePresentation) == null ? void 0 : d[g];
      o[`imagePresentation.${g}.fit`] = (y == null ? void 0 : y.fit) ?? "cover", o[`imagePresentation.${g}.focusX`] = String((y == null ? void 0 : y.focusX) ?? 50), o[`imagePresentation.${g}.focusY`] = String((y == null ? void 0 : y.focusY) ?? 25), o[`imagePresentation.${g}.zoom`] = String((y == null ? void 0 : y.zoom) ?? 1), o[`imagePresentation.${g}.rotation`] = String((y == null ? void 0 : y.rotation) ?? 0);
    }
    for (const [g, y] of Object.entries(o)) this.setValue(i, g, y);
    for (const g of ["domains", "favoredWeapon", "spells", "sanctification", "skill", "font", "divineAttributes", "edicts", "anathema"]) this.setChecked(i, `replacement.inherit.${g}`, ((h = s.replacement.inherit) == null ? void 0 : h[g]) === !0);
    this.setChecked(i, "replacement.keepForExistingActors", s.replacement.keepForExistingActors !== !1), this.setChecked(i, "visibility.showMechanicsInSelection", s.visibility.showMechanicsInSelection === !0), this.setChecked(i, "discovery.enabled", ((p = s.discovery) == null ? void 0 : p.enabled) === !0);
    for (const g of s.passiveBonuses) {
      this.appendTemplate(e, "bonus", "[data-bonus-list]");
      const y = e.querySelector("[data-bonus-list] [data-bonus-row]:last-child");
      y && (this.setValue(y, "bonus.name", g.name), this.setValue(y, "bonus.selector", g.selector), this.setValue(y, "bonus.value", String(g.value)), this.setValue(y, "bonus.modifierType", g.modifierType), this.setValue(y, "bonus.appliesTo", g.appliesTo ?? "checks"), this.setValue(y, "bonus.condition", g.condition ?? ""), this.setValue(y, "bonus.visibility", g.visibility ?? "followers"));
    }
    for (const g of s.abilities) {
      this.appendTemplate(e, "ability", "[data-ability-list]");
      const y = e.querySelector("[data-ability-list] [data-ability-row]:last-child");
      if (!y) continue;
      const w = g.timing;
      this.setValue(y, "ability.name", g.name), this.setValue(y, "ability.description", g.description), this.setValue(y, "ability.visibility", g.visibility ?? "followers"), this.setValue(y, "ability.abilityType", g.abilityType ?? "standard"), this.setValue(y, "ability.actionCost", (w == null ? void 0 : w.actionCost.type) ?? "actions"), this.setValue(y, "ability.actions", String((w == null ? void 0 : w.actionCost.actions) ?? g.actionCost ?? 1)), this.setValue(y, "ability.usageMax", String((w == null ? void 0 : w.usage.max) ?? ((f = g.uses) == null ? void 0 : f.max) ?? "")), this.setValue(y, "ability.reset", (w == null ? void 0 : w.reset.event) ?? ((m = g.uses) == null ? void 0 : m.reset) ?? "daily-preparations"), this.setValue(y, "ability.cooldownValue", String(((b = w == null ? void 0 : w.cooldown) == null ? void 0 : b.value) ?? 0)), this.setValue(y, "ability.cooldownUnit", ((E = w == null ? void 0 : w.cooldown) == null ? void 0 : E.unit) ?? "rounds"), this.setValue(y, "ability.durationValue", String((w == null ? void 0 : w.duration.value) ?? g.duration ?? 0)), this.setValue(y, "ability.durationUnit", (w == null ? void 0 : w.duration.unit) ?? "instant"), this.setValue(y, "ability.graph", JSON.stringify(g.graph ?? te(g)));
      for (const I of g.effects) this.populateEffect(y, I);
    }
    for (const g of s.grantGroups) this.populateGrantGroup(e, e.querySelector("[data-grant-list]"), g);
    this.updateStackingWarnings(e);
  }
  readInput(e) {
    const i = new FormData(e), s = i.get("kind") === "lore" ? "lore" : "selectable", o = structuredClone(ee);
    o.deity = this.visibility(i.get("visibility.deity"), "public"), o.showMechanicsInSelection = i.has("visibility.showMechanicsInSelection");
    for (const n of Lt) o.fields[n] = this.visibility(i.get(`visibility.fields.${n}`), o.fields[n]);
    return {
      status: this.status(i.get("status")),
      kind: s,
      name: this.text(i.get("name")),
      title: this.text(i.get("title")),
      description: this.text(i.get("description")),
      quote: this.optional(i.get("quote")),
      image: this.optional(i.get("image")),
      icon: this.optional(i.get("icon")),
      symbol: this.optional(i.get("symbol")),
      banner: this.optional(i.get("banner")),
      imagePresentation: this.readImagePresentation(i),
      domains: s === "lore" ? [] : this.list(i.get("domains")),
      alternateDomains: s === "lore" ? [] : this.list(i.get("alternateDomains")),
      divineAttributes: s === "lore" ? [] : this.list(i.get("divineAttributes")),
      spells: s === "lore" ? void 0 : this.spells(i.get("spells")),
      pantheonIds: this.readPantheonIds(i),
      pantheons: this.readPantheons(i),
      tags: this.list(i.get("tags")),
      alignment: this.optional(i.get("alignment")),
      favoredWeapon: s === "lore" ? void 0 : this.optional(i.get("favoredWeapon")),
      favoredWeaponUuid: s === "lore" ? void 0 : this.optional(i.get("favoredWeaponUuid")),
      font: s === "lore" ? void 0 : this.optional(i.get("font")),
      skill: s === "lore" ? void 0 : this.optional(i.get("skill")),
      sanctification: s === "lore" ? void 0 : this.optional(i.get("sanctification")),
      cause: s === "lore" ? void 0 : this.optional(i.get("cause")),
      edicts: s === "lore" ? [] : this.list(i.get("edicts")),
      anathema: s === "lore" ? [] : this.list(i.get("anathema")),
      gmNotes: this.optional(i.get("gmNotes")),
      discovery: {
        enabled: i.has("discovery.enabled"),
        defaultState: i.get("discovery.defaultState") === "hidden" ? "hidden" : i.get("discovery.defaultState") === "rumor" ? "rumor" : "revealed",
        rumorName: this.optional(i.get("discovery.rumorName")),
        rumorText: this.optional(i.get("discovery.rumorText")),
        revealedToUsers: this.list(i.get("discovery.revealedToUsers")),
        revealedToActors: this.list(i.get("discovery.revealedToActors"))
      },
      passiveBonuses: s === "lore" ? [] : this.readBonuses(e),
      abilities: s === "lore" ? [] : this.readAbilities(e),
      grantGroups: s === "lore" ? [] : this.readGrantGroups(e),
      replacement: s === "lore" ? { sourceUuid: "", mode: "none", contexts: [] } : { sourceUuid: this.text(i.get("replacement.sourceUuid")), mode: this.text(i.get("replacement.sourceUuid")) ? this.replacementMode(i.get("replacement.mode")) === "hide" ? "hide" : "replace" : "none", contexts: this.list(i.get("replacement.contexts")), inherit: { domains: i.has("replacement.inherit.domains"), favoredWeapon: i.has("replacement.inherit.favoredWeapon"), spells: i.has("replacement.inherit.spells"), sanctification: i.has("replacement.inherit.sanctification"), skill: i.has("replacement.inherit.skill"), font: i.has("replacement.inherit.font"), divineAttributes: i.has("replacement.inherit.divineAttributes"), edicts: i.has("replacement.inherit.edicts"), anathema: i.has("replacement.inherit.anathema") }, keepForExistingActors: i.has("replacement.keepForExistingActors") },
      visibility: o
    };
  }
  openFilePicker(e, i) {
    var u, d, h;
    if (!e) return;
    const s = i.dataset.target ?? "", o = e.querySelector(`[name='${s}']`);
    if (!o) return;
    const n = globalThis, a = ((h = (d = (u = n.foundry) == null ? void 0 : u.applications) == null ? void 0 : d.apps) == null ? void 0 : h.FilePicker) ?? n.FilePicker;
    if (!a) return;
    const l = (p) => {
      o.value = p, o.dispatchEvent(new Event("input", { bubbles: !0 }));
    }, c = a.fromButton ? a.fromButton(i) : new a({ type: "image", current: o.value, callback: l });
    c.callback = l, c.render(!0);
  }
  handleImageDrop(e, i) {
    var a, l;
    e.preventDefault();
    const s = (l = (a = e.dataTransfer) == null ? void 0 : a.getData("text/plain")) == null ? void 0 : l.trim();
    if (!s) return;
    let o = s;
    try {
      const c = JSON.parse(s);
      o = typeof c.path == "string" ? c.path : typeof c.src == "string" ? c.src : "";
    } catch {
    }
    if (!o) return;
    const n = i.querySelector("[data-image-input]");
    n && (n.value = o, n.dispatchEvent(new Event("input", { bubbles: !0 })));
  }
  updateImagePreview(e, i, s) {
    const o = e.querySelector(`[data-image-preview='${i}']`);
    if (!o) return;
    const n = s.trim();
    o.hidden = !n, n ? o.src = j(n) : o.removeAttribute("src"), this.updateImagePresentationPreview(e, i);
  }
  updateImagePresentationPreview(e, i) {
    if (!i) return;
    const s = e.querySelector(`[data-image-preview='${i}']`);
    if (!s) return;
    const o = (n, a) => {
      var l;
      return ((l = e.querySelector(`[name='imagePresentation.${i}.${n}']`)) == null ? void 0 : l.value) ?? a;
    };
    s.style.objectFit = o("fit", "cover") === "contain" ? "contain" : "cover", s.style.objectPosition = `${o("focusX", "50")}% ${o("focusY", "25")}%`, s.style.transform = `scale(${o("zoom", "1")}) rotate(${o("rotation", "0")}deg)`;
  }
  readBonuses(e) {
    return [...e.querySelectorAll("[data-bonus-row]")].flatMap((i) => {
      const s = this.input(i, "bonus.name"), o = this.input(i, "bonus.selector");
      if (!s && !o) return [];
      const n = this.input(i, "bonus.value"), a = Number(n);
      return [{
        id: crypto.randomUUID(),
        name: s,
        selector: o,
        value: n !== "" && Number.isFinite(a) ? a : n,
        modifierType: this.modifierType(this.input(i, "bonus.modifierType")),
        appliesTo: this.appliesTo(this.input(i, "bonus.appliesTo")),
        condition: this.input(i, "bonus.condition") || void 0,
        visibility: this.visibility(this.input(i, "bonus.visibility"), "followers"),
        enabled: !0
      }];
    });
  }
  readAbilities(e) {
    return [...e.querySelectorAll("[data-ability-row]")].flatMap((i) => {
      const s = this.input(i, "ability.name");
      if (!s) return [];
      const o = this.input(i, "ability.description"), n = this.input(i, "ability.usageMax"), a = n === "" ? null : Math.max(0, Number(n)), l = this.resetType(this.input(i, "ability.reset")), c = Math.max(0, Number(this.input(i, "ability.cooldownValue") || 0)), u = Math.max(0, Number(this.input(i, "ability.durationValue") || 0)), d = [...i.querySelectorAll("[data-effect-row]")].map((m) => this.readEffect(m, u)), h = d.length ? d : [{ type: "message", text: o }], p = this.readGraph(this.input(i, "ability.graph"), { effects: h }), f = G(p).valid ? $i(p) : h;
      return [{
        id: crypto.randomUUID(),
        name: s,
        description: o,
        visibility: this.visibility(this.input(i, "ability.visibility"), "followers"),
        enabled: !0,
        abilityType: this.input(i, "ability.abilityType") === "fortune-wheel" ? "fortune-wheel" : "standard",
        uses: a === null ? void 0 : { max: a, reset: l },
        timing: {
          actionCost: { type: this.actionCost(this.input(i, "ability.actionCost")), actions: Number(this.input(i, "ability.actions") || 0) || void 0 },
          usage: { max: a, period: a === null ? "unlimited" : "reset" },
          reset: { event: l },
          cooldown: c > 0 ? { value: c, unit: this.cooldownUnit(this.input(i, "ability.cooldownUnit")) } : null,
          duration: { value: u, unit: this.durationUnit(this.input(i, "ability.durationUnit")) }
        },
        effects: f.length ? f : h,
        graph: p
      }];
    });
  }
  openAbilityBuilder(e) {
    const i = e.closest("[data-ability-row]");
    if (!i) return;
    const s = this.input(i, "ability.description"), o = [...i.querySelectorAll("[data-effect-row]")].map((a) => this.readEffect(a, 0)), n = this.readGraph(this.input(i, "ability.graph"), { effects: o.length ? o : s ? [{ type: "message", text: s }] : [] });
    new Ve(n, (a) => {
      this.setValue(i, "ability.graph", JSON.stringify(a));
      const l = i.querySelector("[data-graph-status]");
      l && (l.textContent = `${a.nodes.length} ${T().NODES ?? "nodes"} · ${a.edges.length} ${T().CONNECTIONS ?? "connections"}`);
    }).render(!0);
  }
  readGraph(e, i) {
    if (e.trim())
      try {
        const s = JSON.parse(e);
        if (G(s).valid) return s;
      } catch {
      }
    return te({ trigger: i.trigger, effects: i.effects });
  }
  readEffect(e, i) {
    const s = this.input(e, "effect.type"), o = this.input(e, "effect.formula") || "1", n = this.input(e, "effect.selector") || "all", a = this.effectTarget(this.input(e, "effect.target")), l = this.input(e, "effect.aux"), c = this.input(e, "effect.operation");
    return s === "heal" || s === "damage" ? { type: s, formula: o, target: a } : s === "modifier" ? { type: s, selector: n, value: o, modifierType: this.modifierType(this.input(e, "effect.modifierType")), target: a, duration: Math.max(0, Number(this.input(e, "effect.duration") || i)) } : s === "condition" ? { type: s, condition: l || n, target: a, operation: c === "remove" || c === "suppress" ? c : "add", duration: Math.max(0, Number(this.input(e, "effect.duration") || i)) } : s === "roll" ? { type: s, roll: c === "check" || c === "saving-throw" || c === "degree-of-success" ? c : "reroll", selector: n, dc: o, keep: l === "higher" || l === "lower" ? l : "new", target: a } : s === "movement" ? { type: s, mode: c === "teleport" || c === "forced" ? c : "step", distance: o, target: a } : s === "action" ? { type: s, operation: c === "repeat" ? "repeat" : "lose", amount: Math.max(1, Number(o) || 1), target: a } : s === "control" ? { type: s, faction: c === "friendly" || c === "neutral" ? c : "hostile", target: a, save: n, bossImmune: l !== "allow-boss" } : s === "resource" ? { type: s, resource: c === "gold" || c === "item" ? c : "hp", operation: l === "remove" || l === "transfer" ? l : "add", formula: o, target: a, itemUuid: this.input(e, "effect.uuid") || void 0 } : s === "information" ? { type: s, mode: c === "reveal" || c === "truth" ? c : "gm-dialog", text: l || void 0, questions: Math.max(1, Number(o) || 1) } : s === "counter" ? { type: s, key: n, operation: c === "set" || c === "require" ? c : "add", value: o } : s === "choice" ? { type: s, prompt: l || "Choose", options: n.split(",").map((u) => u.trim()).filter(Boolean).map((u) => ({ id: crypto.randomUUID(), label: u, effects: [{ type: "message", text: u }] })) } : s === "random-wheel" ? { type: s, tableId: this.input(e, "effect.uuid") || n, visibility: c === "gm" || c === "user" ? c : "public" } : s === "macro" ? { type: s, command: this.input(e, "effect.code") || l } : { type: "message", text: l || o };
  }
  populateEffect(e, i) {
    this.appendTemplate(e, "effect", ":scope > [data-effect-list]");
    const s = e.querySelector("[data-effect-list] [data-effect-row]:last-child");
    s && (this.setValue(s, "effect.type", i.type), "target" in i && this.setValue(s, "effect.target", i.target ?? "self"), "formula" in i && this.setValue(s, "effect.formula", String(i.formula)), i.type === "modifier" && (this.setValue(s, "effect.formula", String(i.value)), this.setValue(s, "effect.selector", i.selector), this.setValue(s, "effect.modifierType", i.modifierType), this.setValue(s, "effect.duration", String(i.duration ?? 0))), i.type === "condition" && (this.setValue(s, "effect.aux", i.condition), this.setValue(s, "effect.operation", i.operation ?? "add"), this.setValue(s, "effect.duration", String(i.duration ?? 0))), i.type === "message" && this.setValue(s, "effect.aux", i.text), i.type === "macro" && this.setValue(s, "effect.code", i.command), i.type === "random-wheel" && (this.setValue(s, "effect.uuid", i.tableId), this.setValue(s, "effect.operation", i.visibility)));
  }
  readImagePresentation(e) {
    const i = {};
    for (const s of ["image", "icon", "symbol", "banner"]) i[s] = {
      fit: this.text(e.get(`imagePresentation.${s}.fit`)) === "contain" ? "contain" : "cover",
      focusX: this.clampNumber(e.get(`imagePresentation.${s}.focusX`), 50, 0, 100),
      focusY: this.clampNumber(e.get(`imagePresentation.${s}.focusY`), 25, 0, 100),
      zoom: this.clampNumber(e.get(`imagePresentation.${s}.zoom`), 1, 1, 3),
      rotation: this.clampNumber(e.get(`imagePresentation.${s}.rotation`), 0, -180, 180)
    };
    return i;
  }
  readPantheonIds(e) {
    const i = e.getAll("pantheon.selected").map(String).filter(Boolean), s = this.list(e.get("pantheons")), o = this.text(e.get("pantheon.new.name"));
    return o && i.push(this.pantheonId(o)), [.../* @__PURE__ */ new Set([...i, ...s])];
  }
  readPantheons(e) {
    const i = new Set(e.getAll("pantheon.selected").map(String)), s = this.deityService.list().flatMap((n) => n.pantheons ?? []).filter((n) => i.has(n.id)), o = this.text(e.get("pantheon.new.name"));
    return o && s.push({ id: this.pantheonId(o), name: o, color: this.text(e.get("pantheon.new.color")) || "#8f38e8", symbol: this.optional(e.get("pantheon.new.symbol")), order: this.clampNumber(e.get("pantheon.new.order"), 0, 0, 999) }), [...new Map(s.map((n) => [n.id, n])).values()];
  }
  pantheonId(e) {
    return `pantheon-${e.toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  }
  async openSystemPicker(e, i) {
    const s = i.dataset.picker ?? "", o = i.closest("[data-picker-control]"), n = o == null ? void 0 : o.querySelector("[data-picker-label]"), a = (n == null ? void 0 : n.textContent) ?? "", l = i;
    l.disabled = !0, l.classList.add("loading"), n && (n.textContent = T().LOADING ?? "Loading …");
    try {
      await this.loadPickerData(s);
      const c = this.pickerChoices(s), u = this.pickerValues(e, s), d = s === "domains" || s === "alternateDomains" || s === "spells" || s === "attributes", h = T(), p = { domains: h.DOMAINS, alternateDomains: h.ALTERNATE_DOMAINS, weapons: h.FAVORED_WEAPON, spells: h.CLERIC_SPELLS, skills: h.TRAINED_SKILL, fonts: h.DIVINE_FONT, sanctifications: h.SANCTIFICATION, attributes: h.DIVINE_ATTRIBUTES, official: h.OFFICIAL_DEITY };
      await new $e(p[s] ?? h.PICKER_TITLE ?? "Selection", c, u, d, ({ items: m }) => {
        var E, g;
        const b = m.map((y) => y.value);
        if (s === "weapons")
          this.setValue(e, "favoredWeaponUuid", b[0] ?? ""), this.setValue(e, "favoredWeapon", ((E = m[0]) == null ? void 0 : E.slug) ?? "");
        else if (s === "spells") {
          const y = /* @__PURE__ */ new Map();
          m.forEach((w) => y.set(w.rank ?? 1, w)), this.setValue(e, "spells", [...y.entries()].sort(([w], [I]) => w - I).map(([w, I]) => `${w}=${I.value}`).join(`
`));
        } else {
          const y = { domains: "domains", alternateDomains: "alternateDomains", skills: "skill", fonts: "font", sanctifications: "sanctification", attributes: "divineAttributes", official: "replacement.sourceUuid" }[s];
          y && this.setValue(e, y, d ? b.join(", ") : b[0] ?? "");
        }
        s === "official" && ((g = e.elements.namedItem("replacement.sourceUuid")) == null || g.dispatchEvent(new Event("change", { bubbles: !0 }))), this.refreshPickerControls(e), this.updateWizardPreview(this.element, e);
      }).render(!0);
    } catch (c) {
      H("Darkis GodForge | Could not load picker data.", c);
    } finally {
      n && (n.textContent = a), l.disabled = !1, l.classList.remove("loading");
    }
  }
  async loadPickerData(e) {
    var o, n;
    const i = ((n = (o = S()) == null ? void 0 : o.system) == null ? void 0 : n.id) ?? "", s = this.adapters.tryGet(i);
    if (s) {
      if (e === "official") {
        if (this.officialLoaded) return;
        const a = await s.listOfficialDeities();
        this.officialChoices = a.map((l) => ({
          value: l.sourceUuid ?? l.id,
          label: l.name,
          img: l.image,
          category: l.pantheon,
          group: l.skill ?? l.alignment,
          traits: l.domains,
          source: i.toUpperCase(),
          details: l.favoredWeapon ? `${T().FAVORED_WEAPON}: ${l.favoredWeapon}` : void 0,
          available: !0
        })), this.officialLoaded = !0;
        return;
      }
      this.catalogLoaded || (this.systemCatalog = await s.listEditorCatalog(), this.catalogLoaded = !0);
    }
  }
  pickerChoices(e) {
    return e === "official" ? this.officialChoices : e === "alternateDomains" ? this.systemCatalog.domains : this.systemCatalog[e] ?? [];
  }
  pickerValues(e, i) {
    var n, a;
    if (i === "spells") return Object.values(this.spells(((n = e.elements.namedItem("spells")) == null ? void 0 : n.value) ?? "") ?? {});
    const s = { domains: "domains", alternateDomains: "alternateDomains", weapons: "favoredWeaponUuid", skills: "skill", fonts: "font", sanctifications: "sanctification", attributes: "divineAttributes", official: "replacement.sourceUuid" }[i];
    if (!s) return [];
    const o = ((a = e.elements.namedItem(s)) == null ? void 0 : a.value) ?? "";
    return i === "domains" || i === "alternateDomains" || i === "attributes" ? this.list(o) : o ? [o] : [];
  }
  refreshPickerControls(e) {
    const i = T();
    e.querySelectorAll("[data-picker-control]").forEach((s) => {
      const o = s.dataset.pickerControl ?? "", n = this.pickerChoices(o), a = this.pickerValues(e, o), l = a.flatMap((d) => {
        const h = n.find((p) => p.value === d || o === "weapons" && p.slug === d);
        return h ? [h] : [];
      }), c = s.querySelector("[data-picker-label]");
      c && (c.textContent = l.length ? l.map((d) => d.rank === void 0 || o !== "spells" ? d.label : `${d.rank}: ${d.label}`).join(", ") : a.length ? a.join(", ") : i.PICKER_NONE ?? "—");
      const u = a.length > l.length;
      s.classList.toggle("missing", u), s.title = u ? i.PICKER_MISSING ?? "Saved document is unavailable." : "";
    });
  }
  async generateImageVariants(e, i) {
    var c, u, d, h, p, f;
    const s = ((c = e.elements.namedItem("image")) == null ? void 0 : c.value.trim()) ?? "", o = e.querySelector("[data-variant-status]"), n = T();
    if (!s) {
      o && (o.textContent = n.VARIANT_SELECT_PORTRAIT ?? "Select a portrait first.");
      return;
    }
    const a = globalThis, l = ((h = (d = (u = a.foundry) == null ? void 0 : u.applications) == null ? void 0 : d.apps) == null ? void 0 : h.FilePicker) ?? a.FilePicker;
    if (!(l != null && l.upload)) {
      o && (o.textContent = n.VARIANT_UPLOAD_UNAVAILABLE ?? "File upload is unavailable.");
      return;
    }
    i.disabled = !0, o && (o.textContent = n.VARIANT_CREATING ?? "Creating variants …");
    try {
      try {
        await ((p = l.createDirectory) == null ? void 0 : p.call(l, "data", "darkis-godforge"));
      } catch {
      }
      const m = await this.loadImage(j(s)), b = (((f = e.elements.namedItem("name")) == null ? void 0 : f.value) || s.split("/").pop() || "deity").replace(/\.[^.]+$/, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deity", E = [{ key: "icon", width: 512, height: 512 }, { key: "symbol", width: 1024, height: 1024 }, { key: "banner", width: 1600, height: 600 }], g = [];
      for (const y of E) {
        const w = e.elements.namedItem(`variant.${y.key}`);
        if (!(w != null && w.checked)) continue;
        const I = await this.renderImageVariant(m, y.width, y.height, this.imagePresentationFromForm(e, y.key)), A = new File([I], `${b}-${y.key}.webp`, { type: "image/webp" }), C = await l.upload("data", "darkis-godforge", A, {}, { notify: !1 }), N = C.path ?? C.url ?? `darkis-godforge/${A.name}`, _ = e.elements.namedItem(y.key);
        _ && (_.value = N, _.dispatchEvent(new Event("input", { bubbles: !0 }))), g.push(y.key);
      }
      o && (o.textContent = g.length ? `✓ ${g.join(", ")}` : n.VARIANT_NONE_SELECTED ?? "No variant selected.");
    } catch (m) {
      console.error("Darkis GodForge | Could not create image variants.", m), o && (o.textContent = n.VARIANT_FAILED ?? "Image variants could not be created.");
    } finally {
      i.disabled = !1;
    }
  }
  loadImage(e) {
    return new Promise((i, s) => {
      const o = new Image();
      o.onload = () => i(o), o.onerror = () => s(new Error("The portrait could not be loaded.")), o.src = e;
    });
  }
  imagePresentationFromForm(e, i) {
    var o;
    const s = (n, a) => {
      var l;
      return this.clampNumber(((l = e.elements.namedItem(`imagePresentation.${i}.${n}`)) == null ? void 0 : l.value) ?? null, a, n === "rotation" ? -180 : n === "zoom" ? 1 : 0, n === "rotation" ? 180 : n === "zoom" ? 3 : 100);
    };
    return { fit: ((o = e.elements.namedItem(`imagePresentation.${i}.fit`)) == null ? void 0 : o.value) === "contain" ? "contain" : "cover", focusX: s("focusX", 50), focusY: s("focusY", 25), zoom: s("zoom", 1), rotation: s("rotation", 0) };
  }
  renderImageVariant(e, i, s, o) {
    const n = document.createElement("canvas");
    n.width = i, n.height = s;
    const a = n.getContext("2d");
    if (!a) return Promise.reject(new Error("Canvas is unavailable."));
    a.clearRect(0, 0, i, s);
    const l = (o.fit === "contain" ? Math.min(i / e.naturalWidth, s / e.naturalHeight) : Math.max(i / e.naturalWidth, s / e.naturalHeight)) * (o.zoom ?? 1);
    return a.translate(i / 2, s / 2), a.rotate((o.rotation ?? 0) * Math.PI / 180), a.scale(l, l), a.drawImage(e, -(o.focusX / 100) * e.naturalWidth, -(o.focusY / 100) * e.naturalHeight), new Promise((c, u) => n.toBlob((d) => d ? c(d) : u(new Error("Image encoding failed.")), "image/webp", 0.9));
  }
  validateFormulaField(e) {
    var s;
    const i = (s = e.parentElement) == null ? void 0 : s.querySelector("[data-formula-status]");
    if (i)
      try {
        Te(e.value.replace(/\b\d+d\d+\b/gi, "1"), { actor: { level: 1 }, target: {} }), i.textContent = "✓", i.dataset.valid = "true";
      } catch {
        i.textContent = "!", i.dataset.valid = "false";
      }
  }
  readGrantGroups(e) {
    const i = e.querySelector("[data-grant-list]");
    return i ? [...i.children].flatMap((s) => s instanceof HTMLElement && s.matches("[data-grant-group]") ? [this.readGrantGroup(s)] : []) : [];
  }
  readGrantGroup(e) {
    const i = e.querySelector(":scope > [data-grant-members]"), s = [];
    for (const a of (i == null ? void 0 : i.children) ?? []) {
      if (!(a instanceof HTMLElement)) continue;
      if (a.matches("[data-grant-group]")) {
        s.push(this.readGrantGroup(a));
        continue;
      }
      if (!a.matches("[data-grant-member]")) continue;
      const l = this.input(a, "grant.ref");
      if (!l) continue;
      const c = this.input(a, "grant.overrideName"), u = this.input(a, "grant.overrideDescription"), d = this.input(a, "grant.overrideValue"), h = Number(d), p = c || u || d ? { name: c || void 0, description: u || void 0, value: d ? Number.isFinite(h) ? h : d : void 0 } : void 0;
      s.push({ type: this.input(a, "grant.type") === "bonus" ? "bonus" : "ability", ref: l, overrides: p });
    }
    const o = this.input(e, "grantGroup.mode") === "any" ? "any" : "all", n = Number(this.input(e, "grantGroup.pick") || 1);
    return { id: this.input(e, "grantGroup.id") || crypto.randomUUID(), label: this.input(e, "grantGroup.label"), mode: o, pick: o === "any" ? Math.max(1, n) : void 0, grants: s };
  }
  populateGrantGroup(e, i, s) {
    var c, u, d;
    const o = e.querySelector("template[data-template='grant-group']");
    if (!o || !i) return;
    const n = o.content.cloneNode(!0), a = n.querySelector("[data-grant-group]");
    if (!a) return;
    this.setValue(a, "grantGroup.id", s.id), this.setValue(a, "grantGroup.label", s.label), this.setValue(a, "grantGroup.mode", s.mode), this.setValue(a, "grantGroup.pick", String(s.pick ?? 1));
    const l = a.querySelector(":scope > [data-grant-members]");
    for (const h of s.grants) {
      if ("mode" in h) {
        this.populateGrantGroup(e, l, h);
        continue;
      }
      const p = e.querySelector("template[data-template='grant-member']");
      if (!p || !l) continue;
      const f = p.content.cloneNode(!0), m = f.querySelector("[data-grant-member]");
      m && (this.setValue(m, "grant.type", h.type), this.setValue(m, "grant.ref", h.ref), this.setValue(m, "grant.overrideName", ((c = h.overrides) == null ? void 0 : c.name) ?? ""), this.setValue(m, "grant.overrideDescription", ((u = h.overrides) == null ? void 0 : u.description) ?? ""), this.setValue(m, "grant.overrideValue", ((d = h.overrides) == null ? void 0 : d.value) === void 0 ? "" : String(h.overrides.value)), l.append(f));
    }
    i.append(n);
  }
  input(e, i) {
    var s;
    return (((s = e.querySelector(`[name='${i}']`)) == null ? void 0 : s.value) ?? "").trim();
  }
  setValue(e, i, s) {
    const o = e.querySelector(`[name='${i}']`);
    o && (o.value = s);
  }
  setChecked(e, i, s) {
    const o = e.querySelector(`[name='${i}']`);
    o && (o.checked = s);
  }
  updateStackingWarnings(e) {
    var n;
    if (!e) return;
    const i = [...e.querySelectorAll("[data-bonus-row]")], s = (((n = e.querySelector("[name='skill']")) == null ? void 0 : n.value) ?? "").trim(), o = new Set(i.filter((a) => this.input(a, "bonus.modifierType") === "status").map((a) => this.input(a, "bonus.selector")).filter((a, l, c) => a && c.indexOf(a) !== l));
    for (const a of i) {
      const l = this.input(a, "bonus.selector"), c = a.querySelector("[data-stacking-warning]");
      c && (c.hidden = !o.has(l));
      const u = a.querySelector("[data-skill-overlap]");
      u && (u.hidden = !s || l !== s);
    }
  }
  text(e) {
    return String(e ?? "").trim();
  }
  optional(e) {
    return this.text(e) || void 0;
  }
  list(e) {
    return this.text(e).split(",").map((i) => i.trim()).filter(Boolean);
  }
  spells(e) {
    return Object.fromEntries(this.text(e).split(/[\n,]+/).map((i) => i.trim()).flatMap((i) => {
      const s = i.match(/^([1-9]|10)\s*=\s*(.+)$/);
      return s ? [[s[1], s[2].trim()]] : [];
    }));
  }
  formatSpells(e) {
    return Object.entries(e ?? {}).sort(([i], [s]) => Number(i) - Number(s)).map(([i, s]) => `${i}=${s}`).join(`
`);
  }
  visibility(e, i) {
    const s = String(e ?? "");
    return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "trusted" || s === "gm" || s === "hidden-until-selected" ? s : i;
  }
  status(e) {
    const i = String(e ?? "");
    return i === "test" || i === "published" || i === "disabled" || i === "archived" ? i : "draft";
  }
  replacementMode(e) {
    const i = String(e ?? "");
    return i === "replace" || i === "hide" ? i : "none";
  }
  effectTarget(e) {
    return e === "target" || e === "allies" || e === "enemies" || e === "group" ? e : "self";
  }
  clampNumber(e, i, s, o) {
    const n = Number(e);
    return Number.isFinite(n) ? Math.min(o, Math.max(s, n)) : i;
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
v(we, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 }, position: { width: 980, height: 760 } }), v(we, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class qe extends Y() {
  constructor(t, e, i) {
    super(), this.deity = t, this.deityService = e, this.adapters = i;
  }
  async _prepareContext() {
    var t;
    return D(), { ui: T(), deity: { ...this.deity, image: j(this.deity.image), ...Ie((t = this.deity.imagePresentation) == null ? void 0 : t.image) } };
  }
  _onRender() {
    var t, e;
    (e = (t = this.element) == null ? void 0 : t.querySelector("[data-action='edit']")) == null || e.addEventListener("click", () => {
      this.deityService && new we(this.deityService, (i) => {
        this.deity = i, this.render(!0);
      }, this.adapters, this.deity).render(!0);
    });
  }
}
v(qe, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1200, height: 820 } }), v(qe, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class Be extends Y() {
  constructor(t, e) {
    super(), this.deities = t, this.adapters = e;
  }
  async _prepareContext() {
    var o, n, a;
    D();
    const t = ((n = (o = S()) == null ? void 0 : o.system) == null ? void 0 : n.id) ?? "", e = await (((a = this.adapters.tryGet(t)) == null ? void 0 : a.listOfficialDeities()) ?? Promise.resolve([])), i = this.deities.list().filter((l) => l.kind !== "lore"), s = e.map((l) => {
      const c = i.find((u) => u.replacement.sourceUuid === l.sourceUuid && u.replacement.mode !== "none");
      return { ...l, mappingMode: (c == null ? void 0 : c.replacement.mode) ?? "none", inheritedCount: Object.values((c == null ? void 0 : c.replacement.inherit) ?? {}).filter(Boolean).length, options: i.map((u) => ({ id: u.id, name: u.name, selected: u.id === (c == null ? void 0 : c.id) })) };
    });
    return { ui: T(), rows: s, systemId: t };
  }
  _onRender() {
    var e;
    D();
    const t = (e = this.element) == null ? void 0 : e.querySelector("form");
    t == null || t.querySelectorAll("[data-source-row]").forEach((i) => {
      const s = i.querySelector("[name='replacement.mode']");
      s && (s.value = i.dataset.mode ?? "none");
    }), t == null || t.addEventListener("submit", (i) => {
      var s, o;
      i.preventDefault(), D();
      for (const n of t.querySelectorAll("[data-source-row]")) {
        const a = n.dataset.sourceUuid ?? "", l = ((s = n.querySelector("[name='replacement.deity']")) == null ? void 0 : s.value) ?? "", c = ((o = n.querySelector("[name='replacement.mode']")) == null ? void 0 : o.value) ?? "none", u = c === "hide" || c === "replace" ? c : "none";
        for (const d of this.deities.list().filter((h) => h.replacement.sourceUuid === a && h.id !== l)) this.deities.update(d.id, { replacement: { sourceUuid: "", mode: "none", contexts: [] } });
        if (l) {
          const d = this.deities.get(l);
          this.deities.update(l, { replacement: { ...d == null ? void 0 : d.replacement, sourceUuid: a, mode: u, contexts: ["characterBuilder", "compendium", "actorSheet", "searches", "leveler"] } });
        }
      }
      this.render(!0);
    });
  }
}
v(Be, "DEFAULT_OPTIONS", { id: "darkis-godforge-replacements", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.REPLACEMENTS", resizable: !0 }, position: { width: 1100, height: 760 } }), v(Be, "PARTS", { main: { template: "modules/darkis-godforge/templates/replacement-manager.hbs" } });
class We extends Y() {
  constructor(e, i, s, o = "transfer") {
    super();
    v(this, "pendingImport");
    v(this, "preview", null);
    v(this, "error", "");
    this.deities = e, this.api = i, this.randomContent = s, this.mode = o;
  }
  async _prepareContext() {
    D();
    const e = this.deities.list();
    return { ui: T(), preview: this.preview, error: this.error, deityCount: e.length, isTransfer: this.mode === "transfer", isMigration: this.mode === "migration", currentSchema: P, pendingMigrations: e.filter((i) => i.schemaVersion < P).length };
  }
  _onRender() {
    var i, s, o, n;
    D();
    const e = this.element;
    (i = e == null ? void 0 : e.querySelector("[data-action='export']")) == null || i.addEventListener("click", () => this.downloadExport()), (s = e == null ? void 0 : e.querySelector("[data-action='clear-all-data']")) == null || s.addEventListener("click", () => void this.clearAllData()), (o = e == null ? void 0 : e.querySelector("[data-import-file]")) == null || o.addEventListener("change", (a) => {
      var l;
      return void this.previewFile((l = a.target.files) == null ? void 0 : l[0]);
    }), (n = e == null ? void 0 : e.querySelector("[data-action='apply-import']")) == null || n.addEventListener("click", async () => {
      var a, l, c;
      if (D(), !!this.pendingImport) {
        try {
          const u = this.readRandomContent(this.pendingImport), d = await this.api.importDeities(this.pendingImport);
          u && await this.randomContent.replacePersistent(u), await this.restoreActors(this.readActorBackups(this.pendingImport)), this.pendingImport = void 0, this.preview = null, this.error = "", (c = (l = (a = U()) == null ? void 0 : a.notifications) == null ? void 0 : l.info) == null || c.call(l, `${d} ${T().IMPORTED}`);
        } catch (u) {
          console.error("Darkis GodForge | Import failed.", u), this.error = T().IMPORT_FAILED ?? "Import failed.";
        }
        this.render(!0);
      }
    });
  }
  downloadExport() {
    D();
    const e = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot(), actors: this.actorBackups() }, null, 2), i = URL.createObjectURL(new Blob([e], { type: "application/json" })), s = document.createElement("a");
    s.href = i, s.download = `darkis-godforge-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, s.click(), URL.revokeObjectURL(i);
  }
  async clearAllData() {
    var n, a, l, c, u, d, h, p, f, m, b;
    D();
    const e = T();
    if (!globalThis.confirm(e.CLEAR_CONFIRM_FIRST ?? "Create one backup and delete all GodForge content?")) return;
    if (globalThis.prompt(e.CLEAR_CONFIRM_TYPE ?? "Type LÖSCHUNG to confirm.", "") !== "LÖSCHUNG") {
      (l = (a = (n = U()) == null ? void 0 : n.notifications) == null ? void 0 : a.warn) == null || l.call(a, e.CLEAR_CANCELLED ?? "Deletion cancelled.");
      return;
    }
    const o = (((u = (c = S()) == null ? void 0 : c.actors) == null ? void 0 : u.contents) ?? []).filter((E) => {
      var g;
      return !!((g = E.flags) != null && g["darkis-godforge"]);
    });
    try {
      this.downloadExport();
      for (const g of o) await this.api.removeDeity(g);
      await this.randomContent.replacePersistent({ tables: [], wheels: [] });
      const E = await this.deities.clearPersistent();
      (p = (h = (d = U()) == null ? void 0 : d.notifications) == null ? void 0 : h.info) == null || p.call(h, `${E} ${e.CLEAR_COMPLETE ?? "GodForge records deleted."}`), this.render(!0);
    } catch (E) {
      console.error("Darkis GodForge | Deletion failed.", E), this.error = e.CLEAR_FAILED ?? "Deletion failed.", (b = (m = (f = U()) == null ? void 0 : f.notifications) == null ? void 0 : m.error) == null || b.call(m, e.CLEAR_FAILED ?? "Deletion stopped. The downloaded backup can restore the data."), this.render(!0);
    }
  }
  async previewFile(e) {
    var i, s;
    if (e) {
      try {
        const o = JSON.parse(await e.text()), n = Jt(o), a = new Set(this.deities.list().map((c) => c.id));
        this.pendingImport = o;
        const l = this.readRandomContent(o);
        this.preview = { total: n.length, created: n.filter((c) => !a.has(c.id)).length, updated: n.filter((c) => a.has(c.id)).length, tables: ((i = l == null ? void 0 : l.tables) == null ? void 0 : i.length) ?? 0, wheels: ((s = l == null ? void 0 : l.wheels) == null ? void 0 : s.length) ?? 0 }, this.error = "";
      } catch (o) {
        console.error("Darkis GodForge | Import preview failed.", o), this.pendingImport = void 0, this.preview = null, this.error = T().IMPORT_INVALID ?? "The selected import is invalid.";
      }
      this.render(!0);
    }
  }
  readRandomContent(e) {
    if (!e || typeof e != "object" || !("randomContent" in e)) return null;
    const i = e.randomContent;
    if (!Qt(i)) throw new Error(T().INVALID_RANDOM_CONTENT ?? "Invalid random content.");
    return i;
  }
  actorBackups() {
    var e, i;
    return (((i = (e = S()) == null ? void 0 : e.actors) == null ? void 0 : i.contents) ?? []).flatMap((s) => {
      var a, l;
      const o = (a = s.flags) == null ? void 0 : a["darkis-godforge"], n = (((l = s.items) == null ? void 0 : l.contents) ?? []).filter((c) => {
        var u;
        return !!((u = c.flags) != null && u["darkis-godforge"]);
      }).map((c) => {
        var d;
        const u = (d = c.toObject) == null ? void 0 : d.call(c);
        if (!u) throw new Error((T().BACKUP_ITEM_FAILED ?? "Item {id} cannot be backed up.").replace("{id}", c.id));
        return structuredClone(u);
      });
      return o || n.length ? [{ id: s.id, state: structuredClone(o ?? null), items: n }] : [];
    });
  }
  readActorBackups(e) {
    if (!e || typeof e != "object" || !("actors" in e)) return [];
    const i = e.actors;
    if (!Array.isArray(i)) throw new Error(T().INVALID_ACTOR_BACKUP ?? "Invalid actor backup.");
    return i.map((s) => {
      if (!s || typeof s != "object") throw new Error(T().INVALID_ACTOR_BACKUP ?? "Invalid actor backup.");
      const o = s;
      if (typeof o.id != "string" || !Array.isArray(o.items)) throw new Error(T().INVALID_ACTOR_BACKUP ?? "Invalid actor backup.");
      return { id: o.id, state: structuredClone(o.state ?? null), items: o.items.filter((n) => !!(n && typeof n == "object")).map((n) => structuredClone(n)) };
    });
  }
  async restoreActors(e) {
    var s, o, n;
    const i = ((o = (s = S()) == null ? void 0 : s.actors) == null ? void 0 : o.contents) ?? [];
    for (const a of e) {
      const l = i.find((c) => c.id === a.id);
      if (l && ((n = l.flags) != null && n["darkis-godforge"] && await this.api.removeDeity(l), await l.update({ flags: { "darkis-godforge": a.state } }), a.items.length)) {
        if (!l.createEmbeddedDocuments) throw new Error((T().RESTORE_ACTOR_FAILED ?? "Actor {id} cannot restore embedded items.").replace("{id}", l.id));
        const c = a.items.map((u) => {
          const d = structuredClone(u);
          return delete d._id, d;
        });
        await l.createEmbeddedDocuments("Item", c);
      }
    }
  }
}
v(We, "DEFAULT_OPTIONS", { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: !0 }, position: { width: 900, height: 700 } }), v(We, "PARTS", { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } });
class je extends Y() {
  constructor(e, i = "tables") {
    super();
    v(this, "result", null);
    v(this, "error", "");
    this.randomContent = e, this.mode = i;
  }
  async _prepareContext() {
    D();
    const e = this.randomContent.listTables(), i = T();
    return {
      ui: i,
      tables: e,
      wheels: this.randomContent.listWheels().map((s) => {
        var o;
        return { ...s, tableName: ((o = e.find((n) => n.id === s.tableId)) == null ? void 0 : o.name) ?? "—" };
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
    var i, s, o;
    D();
    const e = this.element;
    (i = e == null ? void 0 : e.querySelector("[data-action='add-entry']")) == null || i.addEventListener("click", () => {
      const n = e.querySelector("[data-template='random-entry']"), a = e.querySelector("[data-entry-list]");
      n && a && a.append(n.content.cloneNode(!0));
    }), e == null || e.addEventListener("click", (n) => {
      var l;
      const a = n.target.closest("[data-action='remove-entry']");
      (l = a == null ? void 0 : a.closest("[data-entry-row]")) == null || l.remove();
    }), (s = e == null ? void 0 : e.querySelector("[data-table-form]")) == null || s.addEventListener("submit", (n) => {
      n.preventDefault(), this.createTable(n.currentTarget);
    }), (o = e == null ? void 0 : e.querySelector("[data-wheel-form]")) == null || o.addEventListener("submit", (n) => {
      n.preventDefault(), this.createWheel(n.currentTarget);
    }), e == null || e.querySelectorAll("[data-test-table]").forEach((n) => n.addEventListener("click", () => this.runAction(() => {
      const a = this.randomContent.drawTable(n.dataset.testTable ?? "", Math.random);
      this.result = a.entry;
    }))), e == null || e.querySelectorAll("[data-test-wheel]").forEach((n) => n.addEventListener("click", () => this.runAction(() => {
      const a = this.randomContent.spinWheel(n.dataset.testWheel ?? "", Math.random).draw;
      this.result = a.entry;
    })));
  }
  createTable(e) {
    D();
    const i = new FormData(e), s = [...e.querySelectorAll("[data-entry-row]")].flatMap((o) => {
      const n = this.input(o, "entry.label");
      return n ? [{ id: crypto.randomUUID(), label: n, weight: Math.max(0, Number(this.input(o, "entry.weight") || 1)), category: this.category(this.input(o, "entry.category")), description: this.input(o, "entry.description") || void 0, visibleToPlayers: !0 }] : [];
    });
    this.runAction(() => {
      this.randomContent.createTable({ name: String(i.get("table.name") ?? "").trim(), formula: String(i.get("table.formula") ?? "1d100").trim(), visibility: this.visibility(i.get("table.visibility")), entries: s });
    });
  }
  createWheel(e) {
    D();
    const i = new FormData(e);
    this.runAction(() => {
      this.randomContent.createWheel({ name: String(i.get("wheel.name") ?? "").trim(), tableId: String(i.get("wheel.tableId") ?? ""), visibility: this.visibility(i.get("wheel.visibility")), duration: Math.max(1, Number(i.get("wheel.duration") ?? 6)), minimumSpins: Math.max(1, Number(i.get("wheel.minimumSpins") ?? 5)) });
    });
  }
  input(e, i) {
    var s;
    return ((s = e.querySelector(`[name='${i}']`)) == null ? void 0 : s.value.trim()) ?? "";
  }
  visibility(e) {
    const i = String(e ?? "");
    return i === "gm" || i === "owner" || i === "followers" ? i : "public";
  }
  category(e) {
    return e === "positive" || e === "negative" || e === "catastrophic" || e === "jackpot" ? e : "neutral";
  }
  runAction(e) {
    try {
      e(), this.error = "", this.render(!0);
    } catch (i) {
      this.error = i instanceof Error ? i.message : String(i), H("Random content action failed.", i), this.render(!0);
    }
  }
}
v(je, "DEFAULT_OPTIONS", { id: "darkis-godforge-random-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.RANDOM_TABLES", resizable: !0 }, position: { width: 1100, height: 800 } }), v(je, "PARTS", { main: { template: "modules/darkis-godforge/templates/random-manager.hbs" } });
class Ye extends Y() {
  constructor(t, e) {
    super(), this.deities = t, this.api = e;
  }
  async _prepareContext() {
    var i, s;
    D();
    const t = (((s = (i = S()) == null ? void 0 : i.actors) == null ? void 0 : s.contents) ?? []).flatMap((o) => {
      var c;
      const n = o;
      if (n.type && n.type !== "character") return [];
      const a = (c = n.flags) == null ? void 0 : c["darkis-godforge"], l = this.deities.get((a == null ? void 0 : a.deityId) ?? "");
      return [{ id: n.id, name: n.name ?? n.id, deityName: (l == null ? void 0 : l.name) ?? "—", hasDeity: !!l }];
    }), e = this.deities.list().filter((o) => o.kind !== "lore" && o.status !== "archived").map((o) => ({ id: o.id, name: o.name, choiceGroups: o.grantGroups.flatMap((n) => oe(n)) }));
    return { ui: T(), actors: t, deities: e };
  }
  _onRender() {
    var s;
    D();
    const t = this.element, e = t == null ? void 0 : t.querySelector("[name='deityId']"), i = () => t == null ? void 0 : t.querySelectorAll("[data-deity-choices]").forEach((o) => {
      o.hidden = o.dataset.deityChoices !== (e == null ? void 0 : e.value);
    });
    e == null || e.addEventListener("change", i), i(), (s = t == null ? void 0 : t.querySelector("form")) == null || s.addEventListener("submit", (o) => {
      var d, h;
      o.preventDefault();
      const n = o.currentTarget, a = new FormData(n), l = (h = (d = S()) == null ? void 0 : d.actors) == null ? void 0 : h.get(String(a.get("actorId") ?? "")), c = String(a.get("deityId") ?? "");
      if (!l || !c) return;
      const u = {};
      t.querySelectorAll(`[data-deity-choices='${qr(c)}'] input[data-group]:checked`).forEach((p) => {
        var f;
        (u[f = p.dataset.group ?? ""] ?? (u[f] = [])).push(p.value);
      }), this.api.assignDeity(l, c, u).then(() => this.render(!0)).catch((p) => H("Character assignment failed.", p));
    }), t == null || t.querySelectorAll("[data-action='reset-daily-usages']").forEach((o) => o.addEventListener("click", () => {
      var a, l;
      const n = (l = (a = S()) == null ? void 0 : a.actors) == null ? void 0 : l.get(o.dataset.actorId ?? "");
      n && (o.disabled = !0, this.api.resetActorUsages(n, "daily-preparations").then(() => {
        var c, u, d;
        return (d = (u = (c = U()) == null ? void 0 : c.notifications) == null ? void 0 : u.info) == null || d.call(u, T().RESET_DAILY_COMPLETE ?? "Daily-preparation uses were reset."), this.render(!0);
      }).catch((c) => {
        o.disabled = !1, H("Daily usage reset failed.", c);
      }));
    }));
  }
}
v(Ye, "DEFAULT_OPTIONS", { id: "darkis-godforge-character-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHARACTERS", resizable: !0 }, position: { width: 900, height: 700 } }), v(Ye, "PARTS", { main: { template: "modules/darkis-godforge/templates/character-manager.hbs" } });
function qr(r) {
  return typeof CSS < "u" ? CSS.escape(r) : r.replace(/["'\\]/g, "\\$&");
}
class Ae extends Y() {
  constructor(e, i = new Qe(), s = new ri(e, i), o = new Zt()) {
    super();
    v(this, "searchTerm", "");
    v(this, "sectionFilter", "overview");
    v(this, "searchTimer", null);
    v(this, "keydownRoot", null);
    v(this, "handleRootKeydown", (e) => {
      var i;
      if ((e.ctrlKey || e.metaKey) && e.key.toLocaleLowerCase() === "k") {
        e.preventDefault();
        const s = (i = this.element) == null ? void 0 : i.querySelector("[data-search]");
        s == null || s.focus(), s == null || s.select();
      }
    });
    this.deityService = e, this.adapters = i, this.api = s, this.randomContent = o;
  }
  async _prepareContext() {
    var u, d, h, p, f, m, b, E;
    D();
    const e = T(), i = this.deityService.list().map((g) => {
      var w;
      const y = Gr(g).filter((I) => I.level === "error").length;
      return {
        ...g,
        image: j(g.image),
        ...Ie((w = g.imagePresentation) == null ? void 0 : w.image),
        errors: y,
        statusLabel: e[`STATUS_${g.status.toUpperCase()}`] ?? g.status,
        updatedLabel: Wr(g.updatedAt)
      };
    }), s = this.searchTerm.toLocaleLowerCase(), o = i.filter((g) => this.matchesSection(g) && (!s || `${g.name} ${g.title} ${g.domains.join(" ")}`.toLocaleLowerCase().includes(s))), n = ((h = (d = (u = S()) == null ? void 0 : u.actors) == null ? void 0 : d.contents) == null ? void 0 : h.filter(Br).length) ?? 0, a = S(), l = ((f = (p = a == null ? void 0 : a.modules) == null ? void 0 : p.get("darkis-godforge")) == null ? void 0 : f.version) ?? "—", c = ((m = a == null ? void 0 : a.system) == null ? void 0 : m.id) ?? "—";
    return {
      ui: e,
      deities: o,
      hasAnyDeities: i.length > 0,
      searchTerm: this.searchTerm,
      nav: { [this.sectionFilter]: !0 },
      recent: [...i].sort((g, y) => y.updatedAt.localeCompare(g.updatedAt)).slice(0, 6),
      stats: {
        deities: i.length,
        pantheons: new Set(i.flatMap((g) => g.pantheonIds ?? [])).size,
        published: i.filter((g) => g.status === "published").length,
        bonuses: i.reduce((g, y) => g + y.passiveBonuses.length, 0),
        abilities: i.reduce((g, y) => g + y.abilities.length, 0),
        invalid: i.filter((g) => g.errors > 0).length,
        assignedActors: n
      },
      systemInfo: {
        foundry: (a == null ? void 0 : a.version) ?? "—",
        system: c,
        systemVersion: ((b = a == null ? void 0 : a.system) == null ? void 0 : b.version) ?? "—",
        moduleVersion: l,
        adapter: ((E = this.adapters.tryGet(c)) == null ? void 0 : E.id) ?? "—",
        schema: P
      }
    };
  }
  _onRender() {
    var s, o, n, a, l;
    D();
    const e = this.element;
    if (!e) return;
    e.querySelectorAll("[data-action='create']").forEach((c) => c.addEventListener("click", () => new we(this.deityService, () => void this.render(!0), this.adapters).render(!0))), e.querySelectorAll("[data-action='codex']").forEach((c) => c.addEventListener("click", () => new se(this.deityService).render(!0))), e.querySelectorAll("[data-action='player-preview']").forEach((c) => c.addEventListener("click", () => new se(this.deityService, void 0, void 0, void 0, void 0, { isGM: !1, selection: !0 }).render(!0))), e.querySelectorAll("[data-section]").forEach((c) => c.addEventListener("click", () => {
      const u = c.dataset.section;
      (u === "overview" || u === "deities" || u === "pantheons" || u === "abilities" || u === "bonuses") && (this.sectionFilter = u, this.render(!0));
    })), (s = e.querySelector("[data-manager='replacements']")) == null || s.addEventListener("click", () => void new Be(this.deityService, this.adapters).render(!0)), e.querySelectorAll("[data-manager='data']").forEach((c) => c.addEventListener("click", () => {
      const u = c.dataset.managerMode === "migration" ? "migration" : "transfer";
      new We(this.deityService, this.api, this.randomContent, u).render(!0);
    })), e.querySelectorAll("[data-manager='random']").forEach((c) => c.addEventListener("click", () => {
      const u = c.dataset.managerMode, d = u === "wheels" || u === "test" ? u : "tables";
      new je(this.randomContent, d).render(!0);
    })), (o = e.querySelector("[data-manager='characters']")) == null || o.addEventListener("click", () => void new Ye(this.deityService, this.api).render(!0)), (n = e.querySelector("[data-action='toggle-context']")) == null || n.addEventListener("click", () => {
      var c;
      return (c = e.querySelector(".dg-app-shell")) == null ? void 0 : c.classList.toggle("context-open");
    }), (a = e.querySelector("[data-action='settings']")) == null || a.addEventListener("click", () => this.openSettings()), e.querySelectorAll("[data-scroll]").forEach((c) => c.addEventListener("click", () => {
      var u;
      return (u = e.querySelector(`[data-section-target='${c.dataset.scroll ?? ""}']`)) == null ? void 0 : u.scrollIntoView({ behavior: "smooth", block: "start" });
    })), e.querySelectorAll("[data-deity]").forEach((c) => c.addEventListener("click", () => {
      const u = this.deityService.get(c.dataset.deity ?? "");
      u && new qe(u, this.deityService, this.adapters).render(!0);
    }));
    const i = e.querySelector("[data-search]");
    i && (i.value = this.searchTerm), i == null || i.addEventListener("input", () => {
      this.searchTerm = i.value, this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => void this.render(!0), 140);
    }), this.keydownRoot !== e && ((l = this.keydownRoot) == null || l.removeEventListener("keydown", this.handleRootKeydown), e.addEventListener("keydown", this.handleRootKeydown), this.keydownRoot = e);
  }
  _onClose() {
    var e;
    this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = null, (e = this.keydownRoot) == null || e.removeEventListener("keydown", this.handleRootKeydown), this.keydownRoot = null;
  }
  openSettings() {
    var o, n, a, l, c;
    const e = globalThis, i = ((a = (n = (o = e.foundry) == null ? void 0 : o.applications) == null ? void 0 : n.settings) == null ? void 0 : a.SettingsConfig) ?? e.SettingsConfig;
    if (i) {
      new i({ initialCategory: "darkis-godforge" }).render(!0);
      return;
    }
    const s = (c = (l = S()) == null ? void 0 : l.settings) == null ? void 0 : c.sheet;
    s && s.render(!0);
  }
  matchesSection(e) {
    var i;
    return this.sectionFilter === "pantheons" ? !!((i = e.pantheonIds) != null && i.length) : this.sectionFilter === "abilities" ? e.abilities.length > 0 : this.sectionFilter === "bonuses" ? e.passiveBonuses.length > 0 : !0;
  }
}
v(Ae, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1440, height: 900 } }), v(Ae, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
function Br(r) {
  var e;
  const t = (e = r.flags) == null ? void 0 : e["darkis-godforge"];
  return !!(t && typeof t == "object" && "deityId" in t);
}
function Wr(r) {
  const t = new Date(r);
  return Number.isNaN(t.getTime()) ? "—" : new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(t);
}
class ze extends ne() {
  constructor(t, e, i, s) {
    super(), this.actor = t, this.api = e, this.socketRouter = i, this.openCodex = s;
  }
  async _prepareContext() {
    var e, i;
    const t = ((i = (e = S()) == null ? void 0 : e.user) == null ? void 0 : i.isGM) === !0 ? this.api.getCharacterWidgetData(this.actor) : await this.socketRouter.characterWidgetSnapshot(this.actor.id);
    return { ui: T(), actorId: this.actor.id, ...t, deity: t.deity ? { ...t.deity, image: j(t.deity.image) } : null, abilities: t.abilities.map((s) => ({ ...s, remaining: s.uses ? Math.max(0, s.uses.max - s.uses.used) : null, available: !s.uses || s.uses.used < s.uses.max })) };
  }
  _onRender() {
    var e;
    const t = this.element;
    (e = t == null ? void 0 : t.querySelector("[data-action='codex']")) == null || e.addEventListener("click", this.openCodex), t == null || t.querySelectorAll("[data-ability]").forEach((i) => i.addEventListener("click", () => {
      const s = jr();
      this.socketRouter.activate({ actorId: this.actor.id, abilityId: i.dataset.ability ?? "", options: { targetActorId: s[0], enemyActorIds: s, triggerEvent: "manual" } }).then(() => this.render(!0)).catch((o) => H("Ability activation failed.", o));
    }));
  }
}
v(ze, "DEFAULT_OPTIONS", { id: "darkis-godforge-hub", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.HUB", resizable: !0 }, position: { width: 520, height: 650 } }), v(ze, "PARTS", { main: { template: "modules/darkis-godforge/templates/hub.hbs" } });
function jr() {
  var e, i;
  const r = globalThis.canvas, t = ((i = (e = r == null ? void 0 : r.tokens) == null ? void 0 : e.placeables) == null ? void 0 : i.filter((s) => s.isTargeted).map((s) => {
    var o;
    return (o = s.actor) == null ? void 0 : o.id;
  }).filter((s) => !!s)) ?? [];
  return [...new Set(t)];
}
class Yr {
  constructor() {
    v(this, "definitions", /* @__PURE__ */ new Map());
    v(this, "persistDefinition");
    v(this, "deletePersistedDefinition");
    v(this, "clearPersistedDefinitions");
    v(this, "persistenceQueue", Promise.resolve());
    v(this, "persistenceError", null);
    v(this, "listeners", /* @__PURE__ */ new Set());
  }
  setPersistence(t) {
    this.persistDefinition = t;
  }
  setDeletePersistence(t, e) {
    this.deletePersistedDefinition = t, this.clearPersistedDefinitions = e;
  }
  list() {
    return [...this.definitions.values()];
  }
  get(t) {
    return this.definitions.get(t) ?? null;
  }
  subscribe(t) {
    return this.listeners.add(t), () => this.listeners.delete(t);
  }
  save(t) {
    const e = Xt(t).definition;
    if (this.definitions.set(e.id, structuredClone(e)), this.notify(), this.persistDefinition) {
      const i = this.persistDefinition;
      this.persistenceQueue = this.persistenceQueue.then(async () => {
        try {
          await i(structuredClone(e));
        } catch (s) {
          this.persistenceError ?? (this.persistenceError = s), console.error("Darkis GodForge | Could not persist deity.", s);
        }
      });
    }
    return e;
  }
  async flushPersistence() {
    if (await this.persistenceQueue, this.persistenceError) {
      const t = this.persistenceError;
      throw this.persistenceError = null, t;
    }
  }
  create(t) {
    const e = (/* @__PURE__ */ new Date()).toISOString(), i = { ...structuredClone(t), id: crypto.randomUUID(), schemaVersion: P, revision: 1, createdAt: e, updatedAt: e, checksum: "pending" };
    return i.checksum = this.checksum(i), this.save(i);
  }
  update(t, e) {
    const i = this.get(t);
    if (!i) throw new Error(`Unknown deity: ${t}`);
    const s = { ...i, ...structuredClone(e), id: t, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return s.checksum = this.checksum(s), this.save(s);
  }
  delete(t) {
    const e = this.definitions.delete(t);
    return e && this.notify(), e;
  }
  clear() {
    const t = this.definitions.size;
    return this.definitions.clear(), t && this.notify(), t;
  }
  async deletePersistent(t) {
    var i;
    const e = this.delete(t);
    return e && await ((i = this.deletePersistedDefinition) == null ? void 0 : i.call(this, t)), e;
  }
  async clearPersistent() {
    var e;
    const t = this.definitions.size;
    return t && await ((e = this.clearPersistedDefinitions) == null ? void 0 : e.call(this)), this.clear(), t;
  }
  notify() {
    for (const t of this.listeners) t();
  }
  checksum(t) {
    const e = JSON.stringify({ ...t, checksum: void 0 });
    let i = 2166136261;
    for (let s = 0; s < e.length; s += 1) i = Math.imul(i ^ e.charCodeAt(s), 16777619);
    return (i >>> 0).toString(16);
  }
}
const Q = "darkis-godforge";
class zr {
  constructor(t) {
    this.collection = t;
  }
  load() {
    return this.collection.contents.flatMap((t) => {
      var i;
      const e = (i = t.flags) == null ? void 0 : i[Q];
      return e && typeof e == "object" && "deity" in e && _e(e.deity) ? [e.deity] : [];
    });
  }
  async save(t) {
    const e = this.collection.contents.find((n) => {
      var l;
      const a = (l = n.flags) == null ? void 0 : l[Q];
      return a && typeof a == "object" && "deity" in a && _e(a.deity) && a.deity.id === t.id;
    }), i = { [Q]: { schemaVersion: t.schemaVersion, deity: t } };
    if (e) {
      const n = Object.fromEntries(Object.keys(e.ownership ?? {}).map((a) => [a, 0]));
      return n.default = 0, await e.update({ name: t.name, flags: i, ownership: n }), e.uuid;
    }
    const s = di(this.collection);
    if (!s) throw new Error("Foundry JournalEntry document class is unavailable.");
    const o = await s.create({ name: t.name, flags: i, ownership: { default: 0 } });
    if (!o) throw new Error(`Foundry did not create a journal for deity ${t.id}.`);
    return o.uuid;
  }
  async delete(t) {
    const e = this.collection.contents.find((i) => {
      var o;
      const s = (o = i.flags) == null ? void 0 : o[Q];
      return s && typeof s == "object" && "deity" in s && _e(s.deity) && s.deity.id === t;
    });
    if (!e) return !1;
    if (!e.delete) throw new Error("Foundry JournalEntry deletion is unavailable.");
    return await e.delete(), !0;
  }
  async deleteAll() {
    const t = this.collection.contents.filter((e) => {
      var s;
      const i = (s = e.flags) == null ? void 0 : s[Q];
      return i && typeof i == "object" && "deity" in i;
    });
    for (const e of t) {
      if (!e.delete) throw new Error("Foundry JournalEntry deletion is unavailable.");
      await e.delete();
    }
    return t.length;
  }
  async secureAll() {
    for (const t of this.collection.contents.filter((e) => {
      var i;
      return !!((i = e.flags) != null && i[Q]);
    })) {
      const e = Object.fromEntries(Object.keys(t.ownership ?? {}).map((i) => [i, 0]));
      e.default = 0, Object.entries(t.ownership ?? {}).some(([i, s]) => i === "default" ? s !== 0 : s > 0) && await t.update({ ownership: e });
    }
  }
}
function Kr(r) {
  if (!r || typeof r != "object" || !("registerModule" in r)) return null;
  const e = r.registerModule("darkis-godforge");
  if (!e || typeof e != "object" || !("register" in e) || !("executeAsGM" in e)) return null;
  const i = e;
  return {
    register: (s, o) => i.register(s, async function(n) {
      var l;
      const a = (l = this.socketdata) == null ? void 0 : l.userId;
      if (!a) throw new Error("Socketlib did not provide an authenticated sender.");
      return o(n, a);
    }),
    executeAsGM: (s, o) => i.executeAsGM(s, o)
  };
}
function Pt(r, t, e) {
  var u;
  const i = r.actor;
  if (!i || !Jr(i) || !Qr(i)) return;
  const s = Xr(t), o = (s == null ? void 0 : s.closest(".application, .window-app, .app")) ?? s, n = o == null ? void 0 : o.querySelector(".window-header");
  if (!n) return;
  (u = n.querySelector(".darkis-godforge-sheet-button")) == null || u.remove();
  const a = q("DARKIS_GODFORGE.UI.OPEN_HUB"), l = document.createElement("a");
  l.className = "darkis-godforge-sheet-button header-control", l.title = a, l.setAttribute("aria-label", a), l.setAttribute("role", "button"), l.innerHTML = '<i class="fas fa-hammer" aria-hidden="true"></i>', l.addEventListener("click", (d) => {
    d.preventDefault(), d.stopPropagation(), e(i);
  });
  const c = n.querySelector("button.close, a.close, .header-button.close, [data-action='close']");
  c ? c.before(l) : n.append(l);
}
function Xr(r) {
  var i;
  if (r instanceof HTMLElement) return r;
  const t = r, e = (t == null ? void 0 : t[0]) ?? ((i = t == null ? void 0 : t.get) == null ? void 0 : i.call(t, 0));
  return e instanceof HTMLElement ? e : null;
}
function Jr(r) {
  var e;
  const t = (e = r.flags) == null ? void 0 : e["darkis-godforge"];
  return !!(t && typeof t == "object" && "deityId" in t);
}
function Qr(r) {
  var e, i;
  const t = (e = S()) == null ? void 0 : e.user;
  return (t == null ? void 0 : t.isGM) === !0 || ((i = r.testUserPermission) == null ? void 0 : i.call(r, t, "OWNER")) === !0;
}
class Zr {
  constructor() {
    v(this, "byEvent", /* @__PURE__ */ new Map());
  }
  rebuild(t) {
    this.byEvent.clear();
    for (const e of t)
      if (!(e.status !== "published" || e.kind === "lore"))
        for (const i of e.abilities.filter((s) => s.enabled !== !1)) {
          const s = i.graph && G(i.graph).valid ? i.graph.nodes.filter((o) => o.category === "trigger").map((o) => ({ event: o.type === "custom" ? String(o.config.event ?? o.config.selector ?? "custom") : o.type, config: o.config })) : i.trigger ? [{ event: i.trigger, config: {} }] : [];
          for (const o of s) {
            const n = this.byEvent.get(o.event) ?? /* @__PURE__ */ new Map(), a = n.get(e.id) ?? [];
            a.push({ deityId: e.id, abilityId: i.id, ability: i, event: o.event, config: structuredClone(o.config) }), n.set(e.id, a), this.byEvent.set(o.event, n);
          }
        }
  }
  hasEvent(t) {
    return this.byEvent.has(t);
  }
  forActor(t, e) {
    var i;
    return ((i = this.byEvent.get(t)) == null ? void 0 : i.get(e)) ?? [];
  }
  events() {
    return [...this.byEvent.keys()].sort();
  }
  size(t) {
    return (t ? [this.byEvent.get(t)].filter((i) => !!i) : [...this.byEvent.values()]).reduce((i, s) => i + [...s.values()].reduce((o, n) => o + n.length, 0), 0);
  }
}
class es {
  constructor(t, e, i) {
    v(this, "registry", new Zr());
    v(this, "recent", /* @__PURE__ */ new Map());
    v(this, "previousHp", /* @__PURE__ */ new Map());
    this.hooks = t, this.deities = e, this.socketRouter = i;
  }
  register() {
    this.registry.rebuild(this.deities.list()), this.deities.subscribe(() => this.registry.rebuild(this.deities.list())), this.hooks.on("combatStart", (t) => this.dispatchCombat("combat-start", t)), this.hooks.on("deleteCombat", (t) => this.dispatchCombat("combat-end", t)), this.hooks.on("combatRound", (t) => this.dispatchCombat("round-start", t)), this.hooks.on("pf2e.startTurn", (t) => this.dispatch("turn-start", t)), this.hooks.on("pf2e.endTurn", (t) => this.dispatch("turn-end", t)), this.hooks.on("preUpdateActor", (t, e) => {
      if (ge(e, ["system", "attributes", "hp", "value"]) === void 0) return;
      const i = t, s = ge(i.system ?? {}, ["attributes", "hp", "value"]);
      s !== void 0 && this.previousHp.set(i.id, s);
    }), this.hooks.on("updateActor", (t, e, i) => this.dispatchActorUpdate(t, e, i)), this.hooks.on("createItem", (t, e) => this.dispatchItem("condition-added", t, e)), this.hooks.on("deleteItem", (t, e) => this.dispatchItem("condition-removed", t, e)), this.hooks.on("createChatMessage", (t, e) => this.dispatchRollMessage(t, e)), this.hooks.on("updateToken", (t, e, i) => {
      const s = M(e);
      ("x" in s || "y" in s || "elevation" in s) && this.dispatch("token-move", M(t).actor);
    }), this.hooks.on("canvasReady", () => this.dispatchAll("scene-change")), this.hooks.on("updateWorldTime", () => this.dispatchAll("world-time")), this.hooks.on("pf2e.restForTheNight", (t) => this.dispatch("daily-preparations", t)), this.hooks.on("godforge.trigger", (t, e) => {
      typeof t == "string" && t.length <= 128 && this.dispatch(t, e);
    });
  }
  dispatchActorUpdate(t, e, i) {
    if (M(i).darkisGodForge === !0) return;
    const o = M(e), n = ge(o, ["system", "attributes", "hp", "value"]);
    if (n !== void 0) {
      const a = t, l = this.previousHp.get(a.id);
      this.previousHp.delete(a.id), l !== void 0 && n < l ? this.dispatch("damage-taken", a) : l !== void 0 && n > l && this.dispatch("healing-received", a);
      const c = ge(a.system ?? {}, ["attributes", "hp", "max"]);
      this.dispatch("hp-threshold", a, { hpPercent: c ? n / c * 100 : void 0 });
    }
  }
  dispatchItem(t, e, i) {
    if (M(i).darkisGodForge === !0) return;
    const s = M(e);
    s.type === "condition" && this.dispatch(t, s.parent);
  }
  dispatchRollMessage(t, e) {
    if (M(e).darkisGodForge === !0) return;
    const i = M(t), s = M(M(i.flags).pf2e), o = M(s.context), n = i.actor ?? M(i.token).actor;
    if (!n) return;
    const a = String(o.type ?? o.rollType ?? "").toLocaleLowerCase(), l = Array.isArray(o.domains) ? o.domains.map(String) : [], c = Array.isArray(o.options) ? o.options.map(String) : [], u = String(o.statistic ?? o.slug ?? l.find((d) => !d.includes(":")) ?? "");
    !i.rolls && !i.roll || (this.dispatch("roll-complete", n, { selector: u }), a.includes("damage") ? this.dispatch("damage-roll", n, { selector: u }) : a.includes("attack") || l.some((d) => d.includes("attack")) ? this.dispatch("attack-roll", n, { selector: u }) : a.includes("saving") || l.some((d) => d.includes("saving-throw")) ? this.dispatch("saving-throw", n, { selector: u }) : (a.includes("skill") || l.some((d) => is.has(d))) && this.dispatch("skill-check", n, { selector: u }), (a.includes("spell") || l.some((d) => d.includes("spell")) || c.some((d) => d.includes("spell"))) && this.dispatch("spell-cast", n), (o.item || s.origin || a.includes("action")) && this.dispatch("item-used", n));
  }
  dispatchCombat(t, e) {
    const i = M(e).turns;
    if (Array.isArray(i))
      for (const s of i) this.dispatch(t, M(s).actor);
  }
  dispatchAll(t) {
    var e, i;
    for (const s of ((i = (e = S()) == null ? void 0 : e.actors) == null ? void 0 : i.contents) ?? []) this.dispatch(t, s);
  }
  dispatch(t, e, i = {}) {
    var a, l, c;
    if (((l = (a = S()) == null ? void 0 : a.user) == null ? void 0 : l.isGM) !== !0 || !this.registry.hasEvent(t) || !e || typeof e != "object") return;
    const s = e, o = (c = s.flags) == null ? void 0 : c["darkis-godforge"];
    if (!(o != null && o.deityId)) return;
    const n = Date.now();
    for (const u of this.registry.forActor(t, o.deityId)) {
      if (ts.has(t)) {
        const h = String(u.config.selector ?? "").trim().toLocaleLowerCase(), p = String(i.selector ?? "").trim().toLocaleLowerCase();
        if (h && h !== p) continue;
      }
      if (t === "hp-threshold") {
        const h = Number(u.config.threshold), p = Number(i.hpPercent);
        if (Number.isFinite(h) && (!Number.isFinite(p) || p > h)) continue;
      }
      const d = `${t}:${s.id}:${u.abilityId}`;
      n - (this.recent.get(d) ?? 0) < 500 || (this.recent.set(d, n), this.socketRouter.activate({ actorId: s.id, abilityId: u.abilityId, options: { triggerEvent: t } }).catch((h) => console.error("Darkis GodForge | Automatic trigger failed.", { event: t, actorId: s.id, abilityId: u.abilityId, error: h })));
    }
    if (this.recent.size > 1e3)
      for (const [u, d] of this.recent) n - d > 6e4 && this.recent.delete(u);
  }
}
function M(r) {
  return r && typeof r == "object" ? r : {};
}
function ge(r, t) {
  let e = r;
  for (const s of t) e = M(e)[s];
  const i = Number(e);
  return Number.isFinite(i) ? i : void 0;
}
const ts = /* @__PURE__ */ new Set(["roll-complete", "skill-check", "attack-roll", "damage-roll", "saving-throw"]), is = /* @__PURE__ */ new Set(["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery"]), k = "darkis-godforge";
function rs(r, t, e) {
  return class extends Ae {
    constructor() {
      super(r, void 0, t, e);
    }
  };
}
function ss(r, t, e, i, s = () => {
}) {
  if (!r || typeof r != "object" || Array.isArray(r)) return;
  const o = r, n = Math.max(-1, ...Object.values(o).map((a) => a.order ?? -1)) + 1;
  o[k] = {
    name: k,
    title: "DARKIS_GODFORGE.UI.TITLE",
    icon: "fas fa-hammer",
    order: n,
    visible: !0,
    tools: {
      hub: { name: "hub", title: "DARKIS_GODFORGE.UI.OPEN_HUB", icon: "fas fa-star", order: 0, button: !0, visible: !0, onChange: (a, l) => s() },
      codex: { name: "codex", title: "DARKIS_GODFORGE.UI.OPEN_CODEX", icon: "fas fa-book-open", order: 1, button: !0, visible: !0, onChange: (a, l) => e() },
      dashboard: { name: "dashboard", title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 2, button: !0, visible: i, onChange: (a, l) => t() }
    }
  };
}
function os(r, t, e, i, s, o, n, a) {
  const l = re();
  l && (l.Hooks.once("init", () => {
    var h, p;
    const c = Mt("init");
    if (!c) return;
    Ut(c, r, e, i, n);
    const u = ((p = (h = c.modules) == null ? void 0 : h.get(k)) == null ? void 0 : p.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], d = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...u.map((f) => [f.lang, f.name])]);
    if (!c.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!c.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try {
        c.settings.registerMenu(k, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: rs(t, r, o), restricted: !0 });
      } catch (f) {
        console.error("Darkis GodForge | Could not register dashboard settings menu.", f);
      }
      try {
        c.settings.register(k, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: d, onChange: (f) => {
          if (typeof f != "string" || f === "auto") return;
          const m = u.find((b) => b.lang === f);
          m != null && m.path && At(f, `modules/${k}/${m.path}`);
        } });
      } catch (f) {
        console.error("Darkis GodForge | Could not register language setting.", f);
      }
      try {
        c.settings.register(k, "random-content", { scope: "world", config: !1, type: Object, default: { tables: [], wheels: [] } });
      } catch (f) {
        console.error("Darkis GodForge | Could not register random content storage.", f);
      }
      try {
        c.settings.register(k, "migration-backup", { scope: "world", config: !1, type: Object, default: {} });
      } catch (f) {
        console.error("Darkis GodForge | Could not register migration backup storage.", f);
      }
    }
    if (!c.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try {
      c.keybindings.register(k, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
        var f, m;
        return ((m = (f = S()) == null ? void 0 : f.user) == null ? void 0 : m.isGM) !== !0 ? !1 : (e(), !0);
      } }), c.keybindings.register(k, "open-hub", { name: "DARKIS_GODFORGE.UI.OPEN_HUB", editable: [{ key: "KeyG" }], restricted: !1, onDown: () => (n == null || n(), !0) }), c.keybindings.register(k, "open-codex", { name: "DARKIS_GODFORGE.UI.OPEN_CODEX", editable: [{ key: "KeyG", modifiers: ["Shift"] }], restricted: !1, onDown: () => (i(), !0) });
    } catch (f) {
      console.error("Darkis GodForge | Could not register keybindings.", f);
    }
  }), l.Hooks.on("getSceneControlButtons", (...c) => {
    var u, d;
    ss(c[0], e, i, ((d = (u = S()) == null ? void 0 : u.user) == null ? void 0 : d.isGM) === !0, () => n == null ? void 0 : n());
  }), l.Hooks.on("renderCharacterSheetPF2e", (c, u) => {
    n && Pt(c, u, n);
  }), l.Hooks.on("renderActorSheet", (c, u) => {
    n && Pt(c, u, n);
  }), l.Hooks.on("pf2e.restForTheNight", (c) => {
    var h, p, f, m;
    if (((p = (h = S()) == null ? void 0 : h.system) == null ? void 0 : p.id) !== "pf2e" || !c || typeof c != "object" || !("id" in c)) return;
    const u = c;
    (((m = (f = S()) == null ? void 0 : f.user) == null ? void 0 : m.isGM) === !0 || !s ? r.resetActorUsages(u, "daily-preparations") : s.reset({ actorId: u.id, reset: "daily-preparations" })).catch((b) => console.error("Darkis GodForge | Could not reset daily-preparation usages.", b));
  }), l.Hooks.once("ready", async () => {
    var u, d, h, p, f, m, b, E, g, y, w, I;
    const c = Mt("ready");
    if (c) {
      Ut(c, r, e, i, n);
      try {
        const A = (d = (u = c.settings) == null ? void 0 : u.get) == null ? void 0 : d.call(u, k, "language"), C = (f = (p = (h = c.modules) == null ? void 0 : h.get(k)) == null ? void 0 : p.languages) == null ? void 0 : f.find((N) => N.lang === A);
        typeof A == "string" && (C != null && C.path) && await At(A, `modules/${k}/${C.path}`);
      } catch (A) {
        console.error("Darkis GodForge | Could not load the selected language.", A);
      }
      try {
        if (((m = c.user) == null ? void 0 : m.isGM) === !0 && c.journal) {
          const A = new zr(c.journal), C = A.load();
          await A.secureAll(), C.some((N) => N.schemaVersion < P) && ((b = c.settings) != null && b.set) && await c.settings.set(k, "migration-backup", { createdAt: (/* @__PURE__ */ new Date()).toISOString(), targetSchema: P, definitions: C });
          for (const N of C) t.save(N);
          t.setPersistence((N) => A.save(N)), t.setDeletePersistence((N) => A.delete(N), () => A.deleteAll()), C.some((N) => N.schemaVersion < P) && await Promise.all(t.list().map((N) => A.save(N)));
        }
      } catch (A) {
        console.error("Darkis GodForge | Could not load deity journals.", A);
      }
      try {
        if (o) {
          const A = (g = (E = c.settings) == null ? void 0 : E.get) == null ? void 0 : g.call(E, k, "random-content");
          o.load(A && typeof A == "object" ? A : null), (y = c.settings) != null && y.set && o.setPersistence((C) => c.settings.set(k, "random-content", C));
        }
      } catch (A) {
        console.error("Darkis GodForge | Could not load random content.", A);
      }
      try {
        const A = Kr((I = (w = c.modules) == null ? void 0 : w.get("socketlib")) == null ? void 0 : I.api);
        A && s && (s.setTransport(A), s.register());
      } catch (A) {
        console.error("Darkis GodForge | Could not initialize socketlib integration.", A);
      }
      try {
        a && l.Hooks.callAll("godforge.registerSystemAdapter", (A) => a.register(A)), s && new es(l.Hooks, t, s).register();
      } catch (A) {
        console.error("Darkis GodForge | Could not initialize trigger and adapter bridges.", A);
      }
    }
  }));
}
function Mt(r) {
  const t = S();
  return t || console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${r}.`), t ?? null;
}
function Ut(r, t, e, i, s) {
  var a;
  const o = (a = r.modules) == null ? void 0 : a.get(k);
  if (!o) {
    console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed.");
    return;
  }
  const n = t;
  n.openDashboard = e, n.openCodex = i, s && (n.openHub = s), o.api = n;
}
class ns {
  constructor(t, e, i, s = async () => !0) {
    v(this, "activations", /* @__PURE__ */ new Map());
    this.api = t, this.authority = e, this.transport = i, this.requestApproval = s;
  }
  setTransport(t) {
    this.transport = t;
  }
  register() {
    var t, e, i, s, o;
    (t = this.transport) == null || t.register("activateAbility", async (n, a) => this.handleActivation(this.parseRequest(n, a), !1)), (e = this.transport) == null || e.register("assignDeity", async (n, a) => this.handleAssignment(this.parseAssignment(n, a), !1)), (i = this.transport) == null || i.register("resetUsages", async (n, a) => this.handleReset(this.parseReset(n, a), !1)), (s = this.transport) == null || s.register("codexSnapshot", async (n, a) => this.handleCodexSnapshot(this.parseSnapshot(n), a)), (o = this.transport) == null || o.register("characterWidgetSnapshot", async (n, a) => this.handleCharacterWidgetSnapshot(this.parseSnapshot(n, !0), a));
  }
  async codexSnapshot(t) {
    if (this.authority.isGM) return this.handleCodexSnapshot({ actorId: t }, this.authority.currentUserId);
    if (!this.transport) throw new Error("GM authority is unavailable.");
    return await this.transport.executeAsGM("codexSnapshot", { actorId: t });
  }
  async characterWidgetSnapshot(t) {
    if (this.authority.isGM) return this.handleCharacterWidgetSnapshot({ actorId: t }, this.authority.currentUserId);
    if (!this.transport) throw new Error("GM authority is unavailable.");
    return await this.transport.executeAsGM("characterWidgetSnapshot", { actorId: t });
  }
  async activate(t) {
    const e = { ...t, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.updateStatus(e.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) throw new Error("GM authority is unavailable.");
      await this.transport.executeAsGM("activateAbility", e);
      return;
    }
    await this.handleActivation(e, !0);
  }
  async assign(t) {
    const e = { ...t, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.updateStatus(e.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) throw new Error("GM authority is unavailable.");
      await this.transport.executeAsGM("assignDeity", e);
      return;
    }
    await this.handleAssignment(e, !0);
  }
  async reset(t) {
    const e = { ...t, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.updateStatus(e.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) {
        const i = this.authority.resolveActor(e.actorId);
        if (!i || !this.authority.ownsActor(i, e.userId)) throw new Error("GM authority is unavailable.");
        await this.api.resetActorUsages(i, e.reset);
        return;
      }
      await this.transport.executeAsGM("resetUsages", e);
      return;
    }
    await this.handleReset(e, !0);
  }
  status(t) {
    return this.activations.get(t) ?? null;
  }
  async handleActivation(t, e) {
    if (this.activations.has(t.activationId) && this.activations.get(t.activationId) !== "requested") throw new Error("Activation request has already been processed.");
    this.updateStatus(t.activationId, "requested");
    const i = this.authority.resolveActor(t.actorId);
    if (!i)
      throw this.updateStatus(t.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.isAuthorizedRequester(i, t.userId, e))
      throw this.updateStatus(t.activationId, "aborted"), new Error("User is not allowed to modify this actor.");
    this.updateStatus(t.activationId, "validated"), this.updateStatus(t.activationId, "running");
    try {
      const s = this.resolveActivationOptions({ ...t.options, triggerEvent: e ? t.options.triggerEvent : "manual" }), o = await this.api.prepareAbility(i, t.abilityId, s);
      if (!await this.requestApproval(o)) {
        this.updateStatus(t.activationId, "aborted");
        return;
      }
      await this.api.commitPreparedAbility(i, o, Ir, s), this.updateStatus(t.activationId, "completed");
    } catch (s) {
      throw this.updateStatus(t.activationId, "aborted"), s;
    }
  }
  async handleAssignment(t, e) {
    if (this.activations.has(t.activationId) && this.activations.get(t.activationId) !== "requested") throw new Error("Assignment request has already been processed.");
    this.updateStatus(t.activationId, "requested");
    const i = this.authority.resolveActor(t.actorId);
    if (!i)
      throw this.updateStatus(t.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.isAuthorizedRequester(i, t.userId, e))
      throw this.updateStatus(t.activationId, "aborted"), new Error("User is not allowed to modify this actor.");
    if (!e && !this.api.isDeitySelectableByPlayer(t.deityId, { isGM: !1, selection: !0, userId: t.userId, actorId: i.id }))
      throw this.updateStatus(t.activationId, "aborted"), new Error("Deity is not available for player selection.");
    this.updateStatus(t.activationId, "validated"), this.updateStatus(t.activationId, "running");
    try {
      await this.api.assignDeity(i, t.deityId, t.choices), this.updateStatus(t.activationId, "completed");
    } catch (s) {
      throw this.updateStatus(t.activationId, "aborted"), s;
    }
  }
  async handleReset(t, e) {
    if (this.activations.has(t.activationId) && this.activations.get(t.activationId) !== "requested") throw new Error("Reset request has already been processed.");
    this.updateStatus(t.activationId, "requested");
    const i = this.authority.resolveActor(t.actorId);
    if (!i)
      throw this.updateStatus(t.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.isAuthorizedRequester(i, t.userId, e))
      throw this.updateStatus(t.activationId, "aborted"), new Error("User is not allowed to reset this actor.");
    this.updateStatus(t.activationId, "validated"), this.updateStatus(t.activationId, "running");
    try {
      await this.api.resetActorUsages(i, t.reset), this.updateStatus(t.activationId, "completed");
    } catch (s) {
      throw this.updateStatus(t.activationId, "aborted"), s;
    }
  }
  async handleCodexSnapshot(t, e) {
    var n;
    const i = t.actorId ? this.authority.resolveActor(t.actorId) : null;
    if (t.actorId && (!i || !this.authority.isGMUser(e) && !this.authority.ownsActor(i, e))) throw new Error("User is not allowed to browse for this actor.");
    const s = (n = i == null ? void 0 : i.flags) == null ? void 0 : n["darkis-godforge"], o = s && typeof s == "object" && "deityId" in s && typeof s.deityId == "string" ? s.deityId : void 0;
    return this.api.getCodexSnapshot({ isGM: !1, selection: !0, userId: e, actorId: i == null ? void 0 : i.id, actorDeityId: o, ownsActor: !!i });
  }
  async handleCharacterWidgetSnapshot(t, e) {
    const i = t.actorId ? this.authority.resolveActor(t.actorId) : null;
    if (!i || !this.authority.isGMUser(e) && !this.authority.ownsActor(i, e)) throw new Error("User is not allowed to view this actor.");
    return this.api.getCharacterWidgetDataForViewer(i, { isGM: !1, userId: e, actorId: i.id, ownsActor: !0 });
  }
  isAuthorizedRequester(t, e, i) {
    return i ? this.authority.isGM && e === this.authority.currentUserId : this.authority.isGMUser(e) ? !1 : this.authority.ownsActor(t, e);
  }
  parseRequest(t, e) {
    if (!t || typeof t != "object" || !this.validId(e)) throw new Error("Invalid socket request.");
    const i = t;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validId(i.abilityId)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: e, abilityId: i.abilityId, options: this.parseActivationOptions(i.options) };
  }
  parseAssignment(t, e) {
    if (!t || typeof t != "object" || !this.validId(e)) throw new Error("Invalid socket request.");
    const i = t;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validId(i.deityId)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: e, deityId: i.deityId, choices: this.parseChoices(i.choices) };
  }
  parseReset(t, e) {
    if (!t || typeof t != "object" || !this.validId(e)) throw new Error("Invalid socket request.");
    const i = t;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validReset(i.reset)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: e, reset: i.reset };
  }
  parseSnapshot(t, e = !1) {
    if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Invalid socket request.");
    const i = t.actorId;
    if ((e || i !== void 0) && !this.validId(i)) throw new Error("Invalid socket request.");
    return { actorId: i };
  }
  parseChoices(t) {
    if (t === void 0) return {};
    if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Invalid socket request.");
    const e = Object.entries(t);
    if (e.length > 50) throw new Error("Invalid socket request.");
    const i = {};
    for (const [s, o] of e) {
      if (!this.validId(s) || !Array.isArray(o) || o.length > 50 || o.some((n) => !this.validId(n))) throw new Error("Invalid socket request.");
      i[s] = [...new Set(o)];
    }
    return i;
  }
  parseActivationOptions(t) {
    if (t === void 0) return {};
    if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Invalid socket request.");
    const e = t, i = (s) => {
      if (s === void 0) return [];
      if (!Array.isArray(s) || s.length > 50 || s.some((o) => !this.validId(o))) throw new Error("Invalid socket request.");
      return [...new Set(s)];
    };
    if (e.targetActorId !== void 0 && !this.validId(e.targetActorId)) throw new Error("Invalid socket request.");
    if (e.triggerEvent !== void 0 && !this.validId(e.triggerEvent)) throw new Error("Invalid socket request.");
    return { targetActorId: e.targetActorId, allyActorIds: i(e.allyActorIds), enemyActorIds: i(e.enemyActorIds), triggerEvent: e.triggerEvent };
  }
  resolveActivationOptions(t) {
    const e = (i) => i ? this.authority.resolveActor(i) ?? void 0 : void 0;
    return {
      targetActor: e(t.targetActorId),
      allies: (t.allyActorIds ?? []).flatMap((i) => {
        const s = e(i);
        return s ? [s] : [];
      }),
      enemies: (t.enemyActorIds ?? []).flatMap((i) => {
        const s = e(i);
        return s ? [s] : [];
      }),
      triggerEvent: t.triggerEvent
    };
  }
  validId(t) {
    return typeof t == "string" && t.length > 0 && t.length <= 256;
  }
  validReset(t) {
    return typeof t == "string" && ["ten-minute-rest", "refocus", "daily-preparations", "encounter-end", "scene-change", "calendar-day", "calendar-week", "calendar-month", "calendar-year", "custom-rest", "manual", "daily", "weekly", "encounter"].includes(t);
  }
  updateStatus(t, e) {
    if (!this.activations.has(t) && this.activations.size >= 1e3) {
      const i = this.activations.keys().next().value;
      i && this.activations.delete(i);
    }
    this.activations.set(t, e);
  }
}
class Ke extends ne() {
  constructor(e) {
    super();
    v(this, "resolve");
    v(this, "settled", !1);
    this.prepared = e;
  }
  async _prepareContext() {
    return D(), { ui: T(), prepared: this.prepared, operations: this.prepared.operations.map((e) => ({ kind: e.kind, summary: Li(e), dangerous: e.kind === "actor-update" || e.kind === "movement" || e.kind === "resource" })) };
  }
  _onRender() {
    var i, s;
    const e = this.element;
    (i = e == null ? void 0 : e.querySelector("[data-action='approve']")) == null || i.addEventListener("click", () => this.finish(!0)), (s = e == null ? void 0 : e.querySelector("[data-action='deny']")) == null || s.addEventListener("click", () => this.finish(!1));
  }
  wait() {
    return new Promise((e) => {
      this.resolve = e, this.render(!0).catch(() => this.settle(!1, !1));
    });
  }
  _onClose() {
    this.settle(!1, !1);
  }
  finish(e) {
    this.settle(e, !0);
  }
  settle(e, i) {
    var s, o;
    this.settled || (this.settled = !0, (s = this.resolve) == null || s.call(this, e), this.resolve = void 0, i && ((o = this.close) == null || o.call(this)));
  }
}
v(Ke, "DEFAULT_OPTIONS", { id: "darkis-godforge-ability-approval", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.APPROVAL_TITLE", resizable: !0 }, position: { width: 680, height: 650 } }), v(Ke, "PARTS", { main: { template: "modules/darkis-godforge/templates/ability-approval.hbs" } });
const De = new Yr(), Se = new Qe(), pe = new ri(De, Se), si = new Zt();
let Gt = Promise.resolve(), Ft = null;
function xt() {
  if (!rt()) {
    st();
    return;
  }
  Ft ?? (Ft = new Ae(De, Se, pe, si)), Ft.render(!0).catch((r) => {
    var t, e, i;
    console.error("Darkis GodForge | Could not open dashboard.", r), (i = (e = (t = U()) == null ? void 0 : t.notifications) == null ? void 0 : e.error) == null || i.call(e, q("DARKIS_GODFORGE.ERROR.DASHBOARD_OPEN"));
  });
}
function oi() {
  new se(De, void 0, pe, ot, ls()).render(!0).catch((t) => {
    var e, i, s;
    console.error("Darkis GodForge | Could not open codex.", t), (s = (i = (e = U()) == null ? void 0 : e.notifications) == null ? void 0 : i.error) == null || s.call(i, q("DARKIS_GODFORGE.ERROR.CODEX_OPEN"));
  });
}
const $t = /* @__PURE__ */ new Map();
function as(r) {
  ds(r).then((t) => {
    t && cs(t);
  }).catch((t) => {
    var e, i, s;
    console.error("Darkis GodForge | Could not select a character for the follower hub.", t), (s = (i = (e = U()) == null ? void 0 : e.notifications) == null ? void 0 : i.error) == null || s.call(i, q("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
function cs(r) {
  let t = $t.get(r.id);
  t || (t = new ze(r, pe, ot, oi), $t.set(r.id, t)), t.render(!0).catch((e) => {
    var i, s, o;
    console.error("Darkis GodForge | Could not open hub.", e), (o = (s = (i = U()) == null ? void 0 : i.notifications) == null ? void 0 : s.error) == null || o.call(s, q("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
const Vt = re(), ot = new ns(pe, { get currentUserId() {
  var r, t;
  return ((t = (r = S()) == null ? void 0 : r.user) == null ? void 0 : t.id) ?? "unknown";
}, get isGM() {
  var r, t;
  return ((t = (r = S()) == null ? void 0 : r.user) == null ? void 0 : t.isGM) ?? !1;
}, isGMUser: (r) => {
  var t, e, i;
  return ((i = (e = (t = S()) == null ? void 0 : t.users) == null ? void 0 : e.get(r)) == null ? void 0 : i.isGM) === !0;
}, ownsActor: (r, t) => {
  var i, s, o;
  const e = ((s = (i = S()) == null ? void 0 : i.users) == null ? void 0 : s.get(t)) ?? { id: t };
  return ((o = r.testUserPermission) == null ? void 0 : o.call(r, e, "OWNER")) ?? !1;
}, resolveActor: (r) => {
  var t, e;
  return ((e = (t = S()) == null ? void 0 : t.actors) == null ? void 0 : e.get(r)) ?? null;
} }, void 0, (r) => {
  const t = Gt.then(() => new Ke(r).wait());
  return Gt = t.then(() => {
  }, () => {
  }), t;
});
Vt ? (os(pe, De, xt, oi, ot, si, as, Se), Vt.Hooks.once("ready", () => {
  var t, e, i, s, o;
  const r = (e = (t = S()) == null ? void 0 : t.system) == null ? void 0 : e.id;
  r && !Se.supports(r) && ((o = (s = (i = U()) == null ? void 0 : i.notifications) == null ? void 0 : s.warn) == null || o.call(s, q("DARKIS_GODFORGE.ERROR.UNSUPPORTED_SYSTEM").replace("{system}", r)));
})) : typeof document < "u" && xt();
function ls() {
  var e, i, s, o;
  const r = globalThis.canvas, t = ((i = (e = r == null ? void 0 : r.tokens) == null ? void 0 : e.controlled) == null ? void 0 : i.map((n) => n.actor).filter((n) => !!n)) ?? [];
  return t.length === 1 ? t[0] : (o = (s = S()) == null ? void 0 : s.user) == null ? void 0 : o.character;
}
async function ds(r) {
  var h, p, f, m, b, E, g, y, w, I, A, C, N;
  if (r) return r;
  const t = (((p = (h = globalThis.canvas) == null ? void 0 : h.tokens) == null ? void 0 : p.controlled) ?? []).map((_) => _.actor).filter((_) => !!_);
  if (t.length === 1) return t[0];
  const e = (m = (f = S()) == null ? void 0 : f.user) == null ? void 0 : m.character;
  if (e) return e;
  const i = (b = S()) == null ? void 0 : b.user, s = (((g = (E = S()) == null ? void 0 : E.actors) == null ? void 0 : g.contents) ?? []).filter((_) => {
    var F;
    return !!(_ && typeof _ == "object" && "id" in _ && i && ((F = _.testUserPermission) == null ? void 0 : F.call(_, i, "OWNER")) === !0);
  });
  if (s.length === 1) return s[0];
  const o = (I = (w = (y = globalThis.foundry) == null ? void 0 : y.applications) == null ? void 0 : w.api) == null ? void 0 : I.DialogV2, n = T(), a = (_, F) => n[_] ?? F, l = a("HUB_EXPLANATION", "Choose an owned character to open GodForge.");
  if (!o) {
    (N = (C = (A = U()) == null ? void 0 : A.notifications) == null ? void 0 : C.warn) == null || N.call(C, l);
    return;
  }
  if (!s.length) {
    await o.prompt({ window: { title: a("HUB", "GodForge") }, content: `<p>${J(l)}</p><p>${J(a("HUB_NO_CHARACTER", "No owned character is available."))}</p>`, rejectClose: !1, ok: { label: a("UNDERSTOOD", "OK") } });
    return;
  }
  const c = s.map((_) => `<option value="${J(_.id)}">${J(_.name ?? _.id)}</option>`).join(""), u = await o.input({ window: { title: `${a("HUB", "GodForge")} – ${a("CHOOSE_CHARACTER", "Choose character")}` }, content: `<p>${J(l)}</p><label>${J(a("CHARACTERS", "Characters"))}<select name="actorId">${c}</select></label>`, rejectClose: !1, ok: { label: a("OPEN_HUB_ACTION", "Open") } }), d = typeof (u == null ? void 0 : u.actorId) == "string" ? u.actorId : "";
  return s.find((_) => _.id === d);
}
export {
  Ae as GodForgeDashboard,
  pe as api,
  De as deityService,
  si as randomContentService,
  Se as registry,
  ot as socketRouter
};
