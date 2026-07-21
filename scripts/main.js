var ut = Object.defineProperty;
var ht = (r, t, e) => t in r ? ut(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var b = (r, t, e) => ht(r, typeof t != "symbol" ? t + "" : t, e);
function Qe(r, t) {
  return {
    name: r.name,
    type: "deity",
    img: r.image,
    system: {
      category: "deity",
      description: { value: r.description },
      sanctification: mt(r.sanctification),
      domains: { primary: [...r.domains], alternate: [...r.alternateDomains ?? []] },
      font: pt(r.font),
      attribute: [...r.divineAttributes ?? []],
      skill: r.skill ? [r.skill] : null,
      weapons: r.favoredWeapon ? [r.favoredWeapon] : [],
      spells: structuredClone(r.spells ?? {}),
      traits: { otherTags: [] }
    },
    flags: { "darkis-godforge": { definitionUuid: t } }
  };
}
function pt(r) {
  if (r === "heal-harm") return ["heal", "harm"];
  const t = (r == null ? void 0 : r.split(",").map((e) => e.trim().toLocaleLowerCase()).filter((e) => e === "harm" || e === "heal")) ?? [];
  return [...new Set(t)];
}
function mt(r) {
  if (r === "holy-unholy") return { modal: "can", what: ["holy", "unholy"] };
  const t = (r == null ? void 0 : r.split(",").map((e) => e.trim().toLocaleLowerCase()).filter((e) => e === "holy" || e === "unholy")) ?? [];
  return t.length ? { modal: "can", what: [...new Set(t)] } : null;
}
function we() {
  const r = globalThis, t = typeof Hooks < "u" ? Hooks : r.Hooks;
  return t ? { Hooks: t } : null;
}
function v() {
  const r = globalThis;
  return typeof game < "u" ? game : r.game;
}
function L() {
  const r = globalThis;
  return typeof ui < "u" ? ui : r.ui;
}
function ft(r) {
  var e, i, s, n;
  const t = globalThis;
  return (r == null ? void 0 : r.documentClass) ?? ((i = (e = t.foundry) == null ? void 0 : e.documents) == null ? void 0 : i.JournalEntry) ?? ((n = (s = t.CONFIG) == null ? void 0 : s.JournalEntry) == null ? void 0 : n.documentClass) ?? null;
}
function Me(r) {
  if (!r || typeof r != "object") return !1;
  const t = r;
  return typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities);
}
async function Ae(r) {
  var s, n, a, o, l, c, p, u, h, d, m, g, I;
  const e = (((n = (s = v()) == null ? void 0 : s.packs) == null ? void 0 : n.contents) ?? []).filter((f) => {
    var y;
    return f.documentName === "Item" && (!((y = f.metadata) != null && y.system) || f.metadata.system === r);
  }), i = [];
  for (const f of e) {
    const y = await f.getIndex({ fields: ["type", "img", "system.domains", "system.alignment", "system.skill", "system.weapons", "system.pantheon"] });
    for (const E of y) {
      if (E.type !== "deity" || !E._id || !E.name || !f.collection) continue;
      const S = `Compendium.${f.collection}.Item.${E._id}`, T = Array.isArray((a = E.system) == null ? void 0 : a.domains) ? E.system.domains : [...((l = (o = E.system) == null ? void 0 : o.domains) == null ? void 0 : l.primary) ?? [], ...((p = (c = E.system) == null ? void 0 : c.domains) == null ? void 0 : p.alternate) ?? []];
      i.push({ id: S, sourceUuid: S, official: !0, name: E.name, title: E.name, image: E.img, domains: T, alignment: (u = E.system) == null ? void 0 : u.alignment, skill: (d = (h = E.system) == null ? void 0 : h.skill) == null ? void 0 : d.join(", "), favoredWeapon: (g = (m = E.system) == null ? void 0 : m.weapons) == null ? void 0 : g.join(", "), pantheon: (I = E.system) == null ? void 0 : I.pantheon });
    }
  }
  return i;
}
function gt(r) {
  if (r.classId !== "cleric" && r.classId !== "champion") return null;
  const t = r.systemValues;
  return { classId: r.classId, deityId: r.deityId, grants: r.grants, domains: { available: t.domains, alternate: t.alternateDomains, pick: r.classId === "cleric" ? 1 : 0 }, divineAttributes: t.divineAttributes, grantedSpells: t.spells, divineFont: r.classId === "cleric" ? t.font : void 0, favoredWeapon: t.favoredWeapon, trainedSkill: r.classId === "cleric" ? t.skill : void 0, sanctification: t.sanctification, cause: r.classId === "champion" ? t.cause : void 0 };
}
const ne = /* @__PURE__ */ new Map();
function Te(r, t) {
  var n, a;
  const e = `${r}:${((a = (n = v()) == null ? void 0 : n.system) == null ? void 0 : a.version) ?? ""}`, i = ne.get(e);
  if (i) return i;
  const s = Et(r, t).catch((o) => {
    throw ne.delete(e), o;
  });
  return ne.set(e, s), s;
}
async function Et(r, t) {
  var l, c, p, u, h, d;
  const e = yt(r), s = (((c = (l = v()) == null ? void 0 : l.packs) == null ? void 0 : c.contents) ?? []).filter((m) => {
    var g;
    return m.documentName === "Item" && (!((g = m.metadata) != null && g.system) || m.metadata.system === r);
  }), n = [], a = [];
  for (const m of s) {
    const g = await m.getIndex({ fields: ["type", "img", "system.slug", "system.category", "system.group", "system.traits", "system.level", "system.rank", "system.publication.remaster"] });
    for (const I of g) {
      if (!I._id || !I.name || !m.collection || I.type !== "weapon" && I.type !== "spell") continue;
      const f = I.system ?? {}, y = {
        value: `Compendium.${m.collection}.Item.${I._id}`,
        label: I.name,
        slug: oe(f.slug) ?? I.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        img: I.img,
        category: oe(f.category),
        group: oe(f.group),
        traits: bt(((p = f.traits) == null ? void 0 : p.value) ?? f.traits),
        source: ((u = m.metadata) == null ? void 0 : u.label) ?? m.collection,
        rank: vt(f.rank ?? ((h = f.level) == null ? void 0 : h.value) ?? f.level),
        remaster: ((d = f.publication) == null ? void 0 : d.remaster) === !0,
        available: !0
      };
      I.type === "weapon" ? n.push(y) : a.push(y);
    }
  }
  return {
    skills: ae(e.skills, t),
    domains: ae(e.deityDomains ?? e.domains, []),
    weapons: Ue(n),
    spells: Ue(a),
    fonts: [P("heal", "Heilen / Heal"), P("harm", "Schaden / Harm"), P("heal-harm", "Heilen oder Schaden / Either"), P("none", "Keine / None")],
    sanctifications: [P("holy", "Heilig / Holy"), P("unholy", "Unheilig / Unholy"), P("holy-unholy", "Heilig oder unheilig / Either"), P("none", "Keine / None")],
    attributes: ae(e.abilities ?? e.attributes, ["str", "dex", "con", "int", "wis", "cha"])
  };
}
function yt(r) {
  var i;
  const t = globalThis, e = r === "sfrpg" ? "SFRPG" : "PF2E";
  return ((i = t.CONFIG) == null ? void 0 : i[e]) ?? {};
}
function ae(r, t) {
  return !r || typeof r != "object" ? t.map((e) => P(e, Ze(e))) : Object.entries(r).map(([e, i]) => P(e, It(i, e))).sort((e, i) => e.label.localeCompare(i.label));
}
function It(r, t) {
  var s, n, a;
  const e = typeof r == "string" ? r : r && typeof r == "object" ? String(r.label ?? r.name ?? t) : t, i = (a = (n = (s = v()) == null ? void 0 : s.i18n) == null ? void 0 : n.localize) == null ? void 0 : a.call(n, e);
  return i && i !== e ? i : e.includes(".") ? Ze(t) : e;
}
function Ue(r) {
  return [...new Map(r.map((t) => [t.value, t])).values()].sort((t, e) => t.label.localeCompare(e.label));
}
function P(r, t) {
  return { value: r, label: t };
}
function Ze(r) {
  return r.replaceAll("-", " ").replace(/\b\w/g, (t) => t.toUpperCase());
}
function oe(r) {
  if (typeof r == "string") return r;
  if (r && typeof r == "object" && typeof r.value == "string") return String(r.value);
}
function bt(r) {
  return Array.isArray(r) ? r.filter((t) => typeof t == "string") : void 0;
}
function vt(r) {
  const t = Number(r);
  return Number.isFinite(t) ? t : void 0;
}
class St {
  constructor() {
    b(this, "id", "pf2e");
    b(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery", "perception", "ac", "attack-roll"] });
  }
  async materialize(t, e) {
    return e ? (await e.createItem(Qe(t, t.id))).uuid : null;
  }
  async listOfficialDeities() {
    return Ae(this.id);
  }
  listSkills() {
    var e, i;
    const t = (i = (e = globalThis.CONFIG) == null ? void 0 : e.PF2E) == null ? void 0 : i.skills;
    return t ? Object.keys(t).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Te(this.id, this.listSkills());
  }
  buildPassiveBonus(t) {
    return { key: "FlatModifier", selector: t.selector, value: t.value, type: t.modifierType, slug: t.id };
  }
  buildClassCoupling(t) {
    return gt(t);
  }
}
class wt {
  constructor() {
    b(this, "id", "sfrpg");
    b(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(t, e) {
    return null;
  }
  async listOfficialDeities() {
    return Ae(this.id);
  }
  listSkills() {
    var e, i;
    const t = (i = (e = globalThis.CONFIG) == null ? void 0 : e.SFRPG) == null ? void 0 : i.skills;
    return t ? Object.keys(t).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Te(this.id, this.listSkills());
  }
  buildPassiveBonus(t) {
    return { key: "Modifier", selector: t.selector, value: t.value, type: t.modifierType, slug: t.id };
  }
  buildClassCoupling(t) {
    return null;
  }
}
class At {
  constructor() {
    b(this, "id", "sf2e");
    b(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(t, e) {
    return e ? (await e.createItem(Qe(t, t.id))).uuid : null;
  }
  async listOfficialDeities() {
    return Ae(this.id);
  }
  listSkills() {
    var e, i;
    const t = (i = (e = globalThis.CONFIG) == null ? void 0 : e.PF2E) == null ? void 0 : i.skills;
    return t ? Object.keys(t).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Te(this.id, this.listSkills());
  }
  buildPassiveBonus(t) {
    return { key: "FlatModifier", selector: t.selector, value: t.value, type: t.modifierType, slug: t.id };
  }
  buildClassCoupling(t) {
    return { classId: t.classId, deityId: t.deityId, system: t.systemValues, grants: t.grants };
  }
}
class De {
  constructor() {
    b(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new St()), this.register(new At()), this.register(new wt());
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
function _(r, t, e) {
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
function j(r, t) {
  return t.isGM ? !0 : r.status === "published" && _(r.visibility.deity, r.id, t);
}
function z(r, t) {
  if (!j(r, t)) return null;
  const e = r.visibility.fields, i = { id: r.id, name: r.name, title: r.title };
  _(e.portrait, r.id, t) && (i.image = r.image), _(e.portrait, r.id, t) && (i.symbol = r.symbol, i.imagePresentation = structuredClone(r.imagePresentation ?? {})), _(e.description, r.id, t) && (i.description = r.description), _(e.quote, r.id, t) && (i.quote = r.quote), _(e.pantheon, r.id, t) && (i.pantheonIds = structuredClone(r.pantheonIds ?? []));
  const s = t.selection === !0 && r.visibility.showMechanicsInSelection === !0;
  return (_(e.domains, r.id, t) || s) && (i.domains = structuredClone(r.domains), i.alternateDomains = structuredClone(r.alternateDomains ?? [])), (_(e.spells, r.id, t) || s) && (i.spells = structuredClone(r.spells ?? {})), (_(e.favoredWeapon, r.id, t) || s) && (i.favoredWeapon = r.favoredWeapon), _(e.edicts, r.id, t) && (i.edicts = structuredClone(r.edicts ?? [])), _(e.anathema, r.id, t) && (i.anathema = structuredClone(r.anathema ?? [])), (_(e.bonuses, r.id, t) || s) && (i.passiveBonuses = r.passiveBonuses.filter((n) => n.enabled !== !1 && _(n.visibility ?? "followers", r.id, t)).map((n) => Tt(n, s || _(e.numericValues, r.id, t)))), (_(e.abilities, r.id, t) || s) && (i.abilities = r.abilities.filter((n) => n.enabled !== !1 && _(n.visibility ?? "followers", r.id, t)).map((n) => Dt(n, s || _(e.numericValues, r.id, t)))), i;
}
function Tt(r, t) {
  const e = structuredClone(r);
  return t || (e.value = ""), delete e.visible, e;
}
function Dt(r, t) {
  const e = structuredClone(r);
  return t || (e.effects = e.effects.filter((i) => i.type === "message"), delete e.timing, delete e.uses, delete e.duration, delete e.actionCost), delete e.condition, e;
}
function _t(r) {
  return { id: r.id, name: r.name, title: r.title, image: r.image, domains: r.domains, alignment: r.alignment };
}
function Ot(r, t, e, i = { isGM: !0 }) {
  return r.filter((s) => s.kind !== "lore" && !e.has(s.id) && j(s, i) && (!t.pantheonFilter || s.domains.includes(t.pantheonFilter))).flatMap((s) => {
    if (i.isGM) return [_t(s)];
    const n = z(s, i);
    return n ? [{ id: n.id, name: n.name, title: n.title ?? "", image: n.image, domains: n.domains ?? [] }] : [];
  });
}
function J(r, t) {
  var n;
  const e = Array.isArray(t) ? t : t ? [t] : [];
  if (r.mode === "all") return r.grants.flatMap((a) => "mode" in a ? J(a, e) : [a.ref]);
  const i = ((n = e.find((a) => a.groupId === r.id)) == null ? void 0 : n.refs) ?? [], s = r.grants.map((a) => "mode" in a ? a.id : a.ref);
  if (!r.pick || i.length !== r.pick || i.some((a) => !s.includes(a))) throw new Error(`Grant group ${r.id} requires ${r.pick ?? 1} valid choice(s).`);
  return i.flatMap((a) => {
    const o = r.grants.find((l) => ("mode" in l ? l.id : l.ref) === a);
    return o && "mode" in o ? J(o, e) : o ? [o.ref] : [];
  });
}
function et(r, t) {
  return r.used < r.max;
}
function Rt(r, t) {
  if (!et(r)) throw new Error("No uses remaining.");
  return { ...r, used: r.used + 1 };
}
function Ct(r, t) {
  return { ...r, used: 0, lastResetAt: t };
}
const Nt = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, kt = /^\d+d\d+(?:[+\-]\d+)?$/, Pt = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function tt(r) {
  const t = r.replace(/\s/g, ""), e = t.match(Nt);
  if (!e || e.join("") !== t) throw new Error("Formula contains an unsupported term.");
  return e;
}
function _e(r) {
  const t = r.replace(/\s/g, ""), e = t.match(/\b\d+d\d+\b/g) ?? [], i = t.replace(/\b\d+d\d+\b/g, "0");
  if (e.some((s) => !/^\d+d\d+$/.test(s))) return !1;
  try {
    return new it(tt(i), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function ie(r, t) {
  const e = r.replace(/\s/g, "");
  if (!_e(e)) throw new Error("Formula contains an unsupported term.");
  if (kt.test(e)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new it(tt(e), t).parse();
}
async function Lt(r, t, e) {
  if (!_e(r)) throw new Error("Formula contains an unsupported term.");
  const i = r.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let s = r;
  for (const n of [...new Set(i)]) {
    const a = await e(n);
    if (!Number.isFinite(a)) throw new Error("Dice result is not a finite number.");
    s = s.replace(new RegExp(`\\b${n}\\b`, "g"), String(a));
  }
  return ie(s, t);
}
class it {
  constructor(t, e) {
    b(this, "position", 0);
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
    if (Pt.has(t)) return this.call(t);
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
function Q(r, t) {
  if (r.type === "fact") return t[r.key] === r.equals;
  if (r.type === "not") return !Q(r.child, t);
  const e = r.children.map((i) => Q(i, t));
  return r.type === "and" ? e.every(Boolean) : e.some(Boolean);
}
async function Gt(r, t) {
  const e = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [], rolls: [], movements: [], resources: [], choices: [] };
  if (r.condition && !Q(r.condition, t.conditionFacts ?? {})) return e;
  for (const i of r.effects) await de(i, t, e);
  return e;
}
async function de(r, t, e) {
  var i, s;
  if (r.type === "message") {
    e.messages.push(r.text);
    return;
  }
  if (r.type === "branch") {
    const n = Q(r.condition, t.conditionFacts ?? {}) ? r.then : r.otherwise ?? [];
    for (const a of n) await de(a, t, e);
    return;
  }
  if (r.type === "choice") {
    const n = t.choose ? await t.choose(r.prompt, r.options.map(({ id: o, label: l }) => ({ id: o, label: l }))) : (i = r.options[0]) == null ? void 0 : i.id, a = r.options.find((o) => o.id === n);
    if (a) {
      e.choices.push(a.id);
      for (const o of a.effects) await de(o, t, e);
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
    const n = (s = t.actor).counters ?? (s.counters = {}), a = W(r.value, t);
    if (r.operation === "require") {
      if ((n[r.key] ?? 0) < a) throw new Error(`Counter requirement not met: ${r.key}`);
    } else n[r.key] = r.operation === "set" ? a : (n[r.key] ?? 0) + a;
    return;
  }
  if (r.type === "roll") {
    const n = r.dc === void 0 ? void 0 : W(r.dc, t);
    e.rolls.push({ type: r.roll, selector: r.selector, value: n });
    return;
  }
  if (r.type === "movement") {
    const n = W(r.distance, t);
    for (const a of U(r.target, t)) e.movements.push({ targetId: a.id, mode: r.mode, distance: n });
    return;
  }
  if (r.type === "action") {
    for (const n of U(r.target, t))
      r.operation === "lose" && n.actions !== void 0 && (n.actions = Math.max(0, n.actions - r.amount)), e.messages.push(`${n.id}: ${r.operation} ${r.amount} action(s)`);
    return;
  }
  if (r.type === "control") {
    for (const n of U(r.target, t)) n.faction = r.faction;
    return;
  }
  if (r.type === "resource") {
    const n = W(r.formula, t);
    for (const a of U(r.target, t))
      r.resource === "hp" && a.hp !== void 0 && (a.hp = Math.max(0, Math.min(a.maxHp ?? Number.MAX_SAFE_INTEGER, a.hp + (r.operation === "remove" ? -n : n)))), r.resource === "gold" && (a.gold = Math.max(0, (a.gold ?? 0) + (r.operation === "remove" ? -n : n))), r.resource === "item" && r.itemUuid && (a.items ?? (a.items = []), r.operation === "remove" ? a.items = a.items.filter((o) => o !== r.itemUuid) : a.items.push(r.itemUuid)), e.resources.push({ targetId: a.id, resource: r.resource, amount: n });
    return;
  }
  if (r.type === "heal" || r.type === "damage") {
    const n = /\b\d+d\d+\b/.test(r.formula) ? t.rollDice ? await Lt(r.formula, t.facts, t.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : ie(r.formula, t.facts);
    for (const a of U(r.target, t))
      r.type === "heal" ? (e.healing += n, a.hp !== void 0 && (a.hp = Math.min(a.maxHp ?? Number.MAX_SAFE_INTEGER, a.hp + n))) : (e.damage += n, a.hp !== void 0 && (a.hp = Math.max(0, a.hp - n)));
    return;
  }
  if (r.type === "modifier") {
    const n = W(r.value, t);
    for (const a of U(r.target ?? "self", t)) a.modifiers[r.selector] = n;
    e.appliedModifiers.push(r.selector);
    return;
  }
  if (r.type === "condition")
    for (const n of U(r.target, t))
      r.operation === "remove" ? n.conditions = n.conditions.filter((a) => a !== r.condition) : r.operation === "suppress" ? n.conditions = n.conditions.map((a) => a === r.condition ? `suppressed:${a}` : a) : n.conditions.includes(r.condition) || n.conditions.push(r.condition), e.appliedConditions.push(r.condition);
}
function U(r, t) {
  if (r === "self") return [t.actor];
  if (r === "target") {
    if (!t.target) throw new Error("This ability requires a valid target.");
    return [t.target];
  }
  return r === "allies" ? t.allies ?? [] : r === "enemies" ? t.enemies ?? [] : [...new Map([t.actor, t.target, ...t.allies ?? [], ...t.enemies ?? []].filter((e) => !!e).map((e) => [e.id, e])).values()];
}
function W(r, t) {
  return typeof r == "number" ? r : ie(r, t.facts);
}
function Mt(r, t, e = []) {
  if (!t.trim()) throw new Error("Class identifier is required for deity coupling.");
  const i = r.grantGroups.flatMap((s) => J(s, e));
  return { deityId: r.id, classId: t, grants: i, choices: e, systemValues: { domains: r.domains, alternateDomains: r.alternateDomains ?? [], divineAttributes: r.divineAttributes ?? [], spells: r.spells ?? {}, font: r.font, favoredWeapon: r.favoredWeapon, skill: r.skill, sanctification: r.sanctification, cause: r.cause } };
}
function le(r, t) {
  return !r || !t ? { deity: null, grants: [], abilities: [] } : { deity: { id: r.id, name: r.name, title: r.title ?? "", image: r.image }, grants: t.grants, abilities: (r.abilities ?? []).map((e) => {
    var i;
    return { id: e.id, name: e.name, description: e.description, uses: e.uses ? { used: ((i = t.usages[e.id]) == null ? void 0 : i.used) ?? 0, max: e.uses.max } : void 0 };
  }) };
}
const H = {
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
}, N = 3;
function st(r) {
  if (!r || typeof r != "object") throw new Error("Invalid deity definition.");
  const t = structuredClone(r), e = typeof t.schemaVersion == "number" ? t.schemaVersion : 0;
  if (e > N) throw new Error(`Unsupported deity schema ${e}.`);
  const i = [], s = t.visibility && typeof t.visibility == "object" ? t.visibility : {}, n = Ut(s, e < 3), a = xt(t.status, s.players), o = {
    ...t,
    schemaVersion: N,
    revision: Math.max(1, typeof t.revision == "number" ? t.revision : 0) + (e < N ? 1 : 0),
    createdAt: typeof t.createdAt == "string" ? t.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: e < N ? (/* @__PURE__ */ new Date()).toISOString() : String(t.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()),
    checksum: typeof t.checksum == "string" ? t.checksum : "pending",
    status: a,
    kind: t.kind === "lore" ? "lore" : "selectable",
    visibility: n,
    passiveBonuses: t.kind === "lore" ? [] : Array.isArray(t.passiveBonuses) ? t.passiveBonuses.map(qt) : [],
    abilities: t.kind === "lore" ? [] : Array.isArray(t.abilities) ? t.abilities.map(Ht) : [],
    grantGroups: t.kind === "lore" ? [] : Array.isArray(t.grantGroups) ? t.grantGroups : [],
    replacement: t.kind === "lore" ? { sourceUuid: "", mode: "none", contexts: [] } : Ft(t.replacement),
    imagePresentation: Vt(t.imagePresentation),
    domains: Array.isArray(t.domains) ? t.domains : []
  };
  return e < N && i.push(`Legacy definition migrated to schema version ${N}.`), { definition: o, migrated: e < N, warnings: i };
}
function Ut(r, t = !1) {
  if (typeof r.deity == "string" && r.fields && typeof r.fields == "object") {
    const n = r.fields, a = {
      deity: Z(r.deity, H.deity),
      fields: Object.fromEntries(Object.entries(H.fields).map(([o, l]) => [o, Z(n[o], l)])),
      showMechanicsInSelection: r.showMechanicsInSelection === !0
    };
    return t && (a.fields.domains = "followers", a.fields.spells = "followers", a.fields.favoredWeapon = "followers", a.fields.gmNotes = "gm"), a;
  }
  const e = r.players !== !1, i = r.library === !1 || !e ? "gm" : "public", s = r.characterSheet === !1 ? "gm" : "followers";
  return { ...structuredClone(H), deity: i, fields: { ...structuredClone(H.fields), bonuses: s, abilities: s } };
}
function Ft(r) {
  if (!r || typeof r != "object") return { sourceUuid: "", mode: "none", contexts: [] };
  const t = r, e = typeof t.sourceUuid == "string" ? t.sourceUuid.trim() : "", i = t.mode === "hide" ? "hide" : t.mode === "replace" || e ? "replace" : "none";
  return { ...t, sourceUuid: e, mode: i, contexts: Array.isArray(t.contexts) ? t.contexts.filter((s) => typeof s == "string") : [] };
}
function Vt(r) {
  if (!r || typeof r != "object") return;
  const t = {};
  for (const e of ["image", "icon", "symbol", "banner"]) {
    const i = r[e];
    if (!i || typeof i != "object") continue;
    const s = i;
    t[e] = {
      fit: s.fit === "contain" ? "contain" : "cover",
      focusX: Fe(s.focusX, 50),
      focusY: Fe(s.focusY, 25),
      zoom: ue(s.zoom, 1, 1, 3),
      rotation: ue(s.rotation, 0, -180, 180)
    };
  }
  return t;
}
function Fe(r, t) {
  return ue(r, t, 0, 100);
}
function ue(r, t, e, i) {
  const s = Number(r);
  return Number.isFinite(s) ? Math.min(i, Math.max(e, s)) : t;
}
function xt(r, t) {
  return r === "draft" || r === "test" || r === "published" || r === "disabled" || r === "archived" ? r : t === !1 ? "draft" : "published";
}
function qt(r) {
  if (!r || typeof r != "object") return r;
  const t = r;
  return { ...t, enabled: t.enabled !== !1, visibility: Z(t.visibility, t.visible === !1 ? "gm" : "followers") };
}
function Ht(r) {
  if (!r || typeof r != "object") return r;
  const t = r;
  return { ...t, enabled: t.enabled !== !1, visibility: Z(t.visibility, "followers") };
}
function Z(r, t) {
  return r === "public" || r === "selection" || r === "followers" || r === "owner" || r === "trusted" || r === "gm" || r === "hidden-until-selected" ? r : t;
}
function Bt(r, t = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: N, exportedAt: t, deities: structuredClone(r) };
}
function $t(r) {
  if (!r || typeof r != "object") return !1;
  const t = r;
  return t.format === "darkis-godforge" && typeof t.schemaVersion == "number" && t.schemaVersion >= 1 && t.schemaVersion <= N && Array.isArray(t.deities) && t.deities.every((e) => typeof e == "object" && e !== null && typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities));
}
function rt(r) {
  if (!$t(r)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return r.deities.map((t) => st(t).definition);
}
function Oe(r, t) {
  const e = r.filter((o) => Number.isFinite(o.weight) && o.weight > 0), i = e.reduce((o, l) => o + l.weight, 0);
  if (!e.length || i <= 0) throw new Error("Random table has no selectable entries.");
  const s = Math.min(Math.max(t(), 0), 0.999999999) * i;
  let n = 0;
  for (const [o, l] of e.entries())
    if (n += l.weight, s < n) return { entry: l, index: o, roll: s };
  return { entry: e[e.length - 1], index: e.length - 1, roll: s };
}
function Wt(r, t) {
  return { status: "resolved", draw: Oe(r, t) };
}
function nt(r) {
  if (!r || typeof r != "object") return !1;
  const t = r;
  if (t.tables !== void 0 && !Array.isArray(t.tables) || t.wheels !== void 0 && !Array.isArray(t.wheels)) return !1;
  const e = t.tables ?? [], i = /* @__PURE__ */ new Set();
  for (const n of e) {
    if (!he(n) || !M(n.id) || i.has(n.id) || !M(n.name) || !M(n.formula) || !Ve(n.visibility) || !Array.isArray(n.entries) || !n.entries.length || !n.entries.every(jt)) return !1;
    i.add(n.id);
  }
  const s = /* @__PURE__ */ new Set();
  for (const n of t.wheels ?? []) {
    if (!he(n) || !M(n.id) || s.has(n.id) || !M(n.name) || !M(n.tableId) || !i.has(n.tableId) || !Ve(n.visibility) || !pe(n.duration) || !pe(n.minimumSpins)) return !1;
    s.add(n.id);
  }
  return !0;
}
class at {
  constructor() {
    b(this, "tables", /* @__PURE__ */ new Map());
    b(this, "wheels", /* @__PURE__ */ new Map());
    b(this, "persistContent");
  }
  setPersistence(t) {
    this.persistContent = t;
  }
  load(t) {
    const e = t ?? {};
    if (!nt(e)) throw new Error("Invalid GodForge random content.");
    this.tables.clear(), this.wheels.clear();
    for (const i of e.tables ?? []) this.tables.set(i.id, structuredClone(i));
    for (const i of e.wheels ?? []) this.wheels.set(i.id, structuredClone(i));
  }
  replace(t) {
    this.load(t), this.persist();
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
    return Oe(i.entries, e);
  }
  spinWheel(t, e) {
    var s;
    const i = this.wheels.get(t);
    if (!i) throw new Error("Fortune wheel was not found.");
    return Wt(((s = this.tables.get(i.tableId)) == null ? void 0 : s.entries) ?? [], e);
  }
  persist() {
    this.persistContent && this.persistContent(this.snapshot()).catch((t) => console.error("Darkis GodForge | Could not persist random content.", t));
  }
}
function he(r) {
  return !!r && typeof r == "object";
}
function M(r) {
  return typeof r == "string" && r.trim().length > 0 && r.length <= 1e4;
}
function pe(r) {
  return typeof r == "number" && Number.isFinite(r) && r > 0;
}
function Ve(r) {
  return r === "public" || r === "selection" || r === "followers" || r === "owner" || r === "gm" || r === "hidden-until-selected";
}
function jt(r) {
  return !he(r) || !M(r.id) || !M(r.label) || !pe(r.weight) || r.description !== void 0 && typeof r.description != "string" ? !1 : r.category === void 0 || r.category === "positive" || r.category === "neutral" || r.category === "negative" || r.category === "catastrophic" || r.category === "jackpot";
}
const zt = /* @__PURE__ */ JSON.parse(`{"UI":{"TITLE":"Darkis GodForge","TAGLINE":"Custom deities","SUBTITLE":"Create, publish, and connect them directly to characters.","CREATE":"New deity","EDIT":"Edit","EDIT_DEITY":"Edit deity","CODEX":"Divine Codex","HUB":"Follower Hub","ACTIVE_GRANTS":"Active grants","ACTIVATE":"Activate","NO_WONDERS":"This deity grants no activatable wonders.","NO_ASSIGNED_DEITY":"No deity assigned","NO_ASSIGNED_DEITY_HINT":"Choose a deity in the Divine Codex or ask the GM to assign one to this character.","YOUR_DEITY":"Your deity","SELECT_DEITY":"Choose as deity","CHOOSE_AND_SELECT":"Choose options and assign","CHOOSE_GRANTS":"Choose grants","CHOOSE_GRANTS_HINT":"Select the required options for this deity.","PICK_EXACTLY":"Choose exactly {count} option(s).","ASSIGNMENT_FAILED":"The deity could not be assigned.","SELECTION_REQUIRES_GM":"This deity requires grant choices first.","OPEN_CODEX":"Open Divine Codex – available without a selected token","OPEN_HUB":"Open Follower Hub – the character's deity, bonuses, and wonders","SELECT_CHARACTER_FIRST":"The Follower Hub shows a character's deity, bonuses, and wonders. Control a token or choose one of your characters.","MY_DEITIES":"My deities","ENTRIES":"entries","DOMAINS":"Domains","ABILITIES":"Abilities","VISIBILITY":"Visibility","PASSIVE_BONUS":"Passive bonus","PASSIVE_BONUSES":"Passive bonuses","DIVINE_ABILITY":"Divine ability","DIVINE_WONDER":"Divine wonder","DIVINE_WONDERS":"Divine wonders","SEARCH":"Search GodForge …","ALL_DOMAINS":"All domains","NO_RESULTS":"No deities found.","NEW_DEITY":"Create a new deity","NEW_DEITY_HINT":"Define identity, rules, wonders, and visibility.","NAME":"Name","TITLE_FIELD":"Title","DEITY_KIND":"Entry type","HELP_DEITY_KIND":"Lore entries appear in the codex but cannot be worshipped or assigned to characters.","KIND_SELECTABLE":"Selectable deity","KIND_LORE":"Lore only / not worshippable","LORE_BADGE":"Lore · not worshippable","PICKER_TITLE":"GodForge selection","PICKER_EYEBROW":"System selection","PICKER_HINT":"Search, filter, or drop a Foundry document into this window.","PICKER_CATEGORY":"Category","PICKER_GROUP":"Group","PICKER_RANK":"Rank","PICKER_TRAIT":"Traits","PICKER_SOURCE":"Source","PICKER_ALL":"All","PICKER_AVAILABLE":"Available only","PICKER_REMASTER":"Remaster only","PICKER_DETAILS":"Details","PICKER_CHOOSE":"Choose","PICKER_APPLY":"Apply selection","PICKER_CLEAR":"Clear selection","PICKER_DROP_HINT":"Foundry documents can be dropped here.","PICKER_OPEN":"Open selection","PICKER_NONE":"Nothing selected yet","PICKER_MISSING":"The saved document is unavailable in the current system.","DESCRIPTION":"Description","ALIGNMENT":"Alignment","SAVE":"Save deity","CANCEL":"Cancel","OPEN_DASHBOARD":"Open GM dashboard – create and manage deities","NEW_DEITY_PLACEHOLDER":"e.g. Tenebris","TITLE_PLACEHOLDER":"e.g. Goddess of Shadows","DOMAINS_PLACEHOLDER":"Shadows, secrets, deception","QUOTE":"Quote","PORTRAIT":"Portrait","ICON":"Icon","SYMBOL":"Cult symbol","BANNER":"Banner","BROWSE_FILES":"Browse Foundry files","FILE_PATH":"Foundry file path","PANTHEONS":"Pantheons","TAGS":"Tags","FAVORED_WEAPON":"Favored weapon","DIVINE_FONT":"Divine font","TRAINED_SKILL":"Divine skill","SANCTIFICATION":"Sanctification","CHAMPION_CAUSE":"Champion cause","EDICTS":"Edicts","ANATHEMA":"Anathema","COMMA_SEPARATED":"Comma-separated","STATUS":"Publication status","STATUS_DRAFT":"Draft","STATUS_TEST":"Test","STATUS_PUBLISHED":"Published","STATUS_DISABLED":"Disabled","STATUS_ARCHIVED":"Archived","BASIC_DATA":"Basic data","EDITOR_STEPS":"Deity editor steps","REQUIRED_FIELDS":"Required fields","WIZARD_INTRO":"The wizard guides you step by step through creating a game-ready deity.","APPEARANCE":"Appearance","SYSTEM_VALUES":"System values","PREVIEW":"Preview","STEP_BASIC_INTRO":"Give your deity a clear identity. Everything except the name can be added later.","ONLY_NAME_REQUIRED":"Only the name is required","HELP_NAME":"The unique name used for this deity in the codex.","HELP_TITLE":"A short epithet such as “The Faith” or “Lady of Stars”.","HELP_DESCRIPTION":"Summarize the deity's nature, faith, and presence for players.","HELP_QUOTE":"A characteristic saying or guiding phrase.","HELP_PANTHEONS":"Optional pantheons, separated by commas.","HELP_TAGS":"Internal search terms, separated by commas.","STEP_APPEARANCE_INTRO":"Choose how the deity appears on cards, in the codex, and in selection dialogs.","OPTIONAL_STEP_HINT":"All images are optional. Paste Foundry paths, browse for files, or drag files onto the fields.","HELP_PORTRAIT":"Large image for detail views and the Divine Codex.","HELP_ICON":"Small, readable image for lists and buttons.","HELP_SYMBOL":"The cult's sign, seal, or holy symbol.","HELP_BANNER":"Wide background image for presentation areas.","STEP_SYSTEM_INTRO":"Enter the rules Pathfinder 2e or Starfinder 2e needs for this deity.","HELP_DOMAINS":"Thematic domains, separated by commas.","HELP_WEAPON":"The favored weapon of the deity's followers.","HELP_SKILL":"The skill granted by the deity, such as religion.","HELP_FONT":"Divine font such as heal, harm, or both.","HELP_SANCTIFICATION":"Allowed sanctification, such as holy or unholy.","HELP_CAUSE":"Optional champion cause or comparable bond.","HELP_EDICTS":"Actions followers are expected to uphold.","HELP_ANATHEMA":"Actions that violate the faith.","HELP_SPELLS":"Optional granted spells; one rank and UUID per line.","ADVANCED_SYSTEM_VALUES":"Additional system values for advanced users","HELP_ALIGNMENT":"Legacy alignment for older system data.","HELP_ALTERNATE_DOMAINS":"Additional domains outside the primary selection.","HELP_ATTRIBUTES":"Divine attributes, separated by commas.","STEP_BONUSES_INTRO":"Add persistent mechanical benefits. Empty cards are ignored when saving.","STEP_WONDERS_INTRO":"Create activatable abilities with uses, reset events, and effects.","STEP_REPLACEMENT_INTRO":"Choose an official deity as a template or replace it in GodForge selections without changing the system compendium.","HELP_REPLACEMENT_MODE":"None uses the selection only as a template; hide or replace changes GodForge catalogs.","HELP_OFFICIAL_DEITY":"Choose a name from the active system compendium instead of entering a UUID.","EXPERT_OPTIONS":"Expert options","HELP_REPLACEMENT_CONTEXTS":"Limits replacement to specific catalogs. Empty means all contexts.","STEP_VISIBILITY_INTRO":"Control exactly what players see before and after choosing the deity.","HELP_DEITY_VISIBILITY":"Controls who can see the deity at all.","HELP_FIELD_VISIBILITY":"Controls visibility for this individual content field.","HELP_GM_NOTES":"These notes remain visible only to the GM.","PREVIEW_AND_SAVE":"Preview and save","STEP_PREVIEW_INTRO":"Review the key details and choose the publication status.","PREVIEW_EMPTY_DESCRIPTION":"No description entered yet.","HELP_STATUS":"Drafts remain with the GM; published makes the deity normally selectable.","BACK":"Back","NEXT":"Next","SAVE_DRAFT":"Save as draft","HELP_BONUS_NAME":"A clear name for the benefit.","HELP_SELECTOR":"The system value affected by the bonus, such as religion.","HELP_BONUS_VALUE":"A number or supported formula.","HELP_WONDER_NAME":"The visible name of the ability.","HELP_WONDER_DESCRIPTION":"Describe exactly what happens on activation.","HELP_USAGES":"How often the wonder can be used before its next reset.","HELP_RESET":"The event that restores spent uses.","BONUS_EDITOR_HINT":"Create multiple system-native bonuses with conditions and individual visibility.","ABILITY_EDITOR_HINT":"Configure activation, uses, reset, and effect.","GRANT_GROUPS":"Grant groups","GRANT_GROUPS_HINT":"Nest AND/OR groups and override inherited names, descriptions, or values.","ADD_GRANT_GROUP":"Add group","GRANT_GROUP":"Grant group","ADD_GRANT":"Add grant","ADD_SUBGROUP":"Add subgroup","GROUP_MODE":"Relationship","ALL_REQUIRED":"All (AND)","CHOOSE_FROM":"Choice (OR)","PICK_COUNT":"Pick count","GRANT":"Grant","REFERENCE":"Reference ID","OVERRIDE_NAME":"Override name","OVERRIDE_VALUE":"Override value","OVERRIDE_DESCRIPTION":"Override description","ADD_BONUS":"Add bonus","ADD_ABILITY":"Add wonder","REMOVE":"Remove","MOVE_UP":"Move up","MOVE_DOWN":"Move down","DUPLICATE":"Duplicate","STACKING_WARNING":"In PF2e, this status bonus does not stack with another status bonus on the same selector; only the highest value applies.","SELECTOR":"Selector","VALUE":"Value or formula","MODIFIER_TYPE":"Modifier type","MOD_STATUS":"Status bonus","MOD_CIRCUMSTANCE":"Circumstance bonus","MOD_ITEM":"Item bonus","MOD_UNTYPED":"Untyped","APPLIES_TO":"Applies to","CHECKS":"Checks","DCS":"DCs","BOTH":"Checks and DCs","CONDITION":"Condition","OPTIONAL_CONDITION":"Optional, e.g. while in darkness","ACTION_COST":"Action cost","ACTION_AUTOMATIC":"Automatic / no action","ACTION_FREE":"Free action","ACTION_REACTION":"Reaction","ACTIONS":"Actions","ACTION_EXPLORATION":"Exploration activity","ACTION_DOWNTIME":"Downtime activity","ACTION_COUNT":"Number of actions","USAGES":"Uses","RESET":"Reset","RESET_DAILY":"At daily preparations","RESET_TEN_MINUTES":"After a 10-minute rest","RESET_REFOCUS":"After refocusing","RESET_ENCOUNTER":"At encounter end","RESET_SCENE":"On scene change","RESET_CALENDAR_DAY":"Per calendar day","RESET_MANUAL":"GM only","COOLDOWN":"Cooldown","COOLDOWN_UNIT":"Cooldown unit","DURATION":"Duration","DURATION_UNIT":"Duration unit","ROUNDS":"Rounds","MINUTES":"Minutes","HOURS":"Hours","DAYS":"Days","INSTANT":"Instant","ENCOUNTER":"Encounter","SCENE":"Scene","UNTIL_RESET":"Until next reset","EFFECT_TEMPLATE":"Effect template","EFFECT_NARRATIVE":"Narrative effect","EFFECT_HEAL":"Heal","EFFECT_DAMAGE":"Deal damage","EFFECT_BONUS":"Grant bonus","FORMULA_OR_VALUE":"Formula or value","VISIBILITY_HINT":"Hidden fields are never sent to players.","DEITY_VISIBILITY":"Deity visibility","PLAYER_PREVIEW":"Preview as player","GM_NOTES":"Internal GM notes","VIS_PUBLIC":"Public","VIS_SELECTION":"Visible before selection","VIS_FOLLOWERS":"Followers only","VIS_OWNER":"Owner only","VIS_TRUSTED":"Trusted players","VIS_GM":"GM only","VIS_HIDDEN_UNTIL_SELECTED":"Hidden until selected","VIS_FIELD_PORTRAIT":"Portrait","VIS_FIELD_DESCRIPTION":"Description","VIS_FIELD_QUOTE":"Quote","VIS_FIELD_PANTHEON":"Pantheon","VIS_FIELD_BONUSES":"Passive bonuses","VIS_FIELD_ABILITIES":"Divine wonders","VIS_FIELD_NUMERIC_VALUES":"Exact numeric values","VIS_FIELD_DOMAINS":"Domains","VIS_FIELD_SPELLS":"Granted spells","VIS_FIELD_FAVORED_WEAPON":"Favored weapon","VIS_FIELD_EDICTS":"Edicts","VIS_FIELD_ANATHEMA":"Anathema","VIS_FIELD_GM_NOTES":"Internal GM notes","REPLACEMENT":"Official template and replacement","REPLACEMENT_MODE":"Replacement mode","REPLACE_NONE":"No replacement","REPLACE_HIDE":"Hide official deity","REPLACE_SOURCE":"Replace with this deity","SOURCE_UUID":"Source UUID","REPLACEMENT_CONTEXTS":"Affected selection contexts","OVERVIEW":"Overview","DEITIES":"Deities","RANDOM_TABLES":"Random tables","FORTUNE_WHEELS":"Fortune wheels","RANDOM_AND_WHEELS":"Random tables and fortune wheels","RANDOM_MANAGER_HINT":"The result is fixed before the wheel starts spinning.","TEST_LAB_HINT":"Test existing tables and fortune wheels without creating new content.","NEW_RANDOM_TABLE":"New random table","DICE_FORMULA":"Dice formula","RESULT_ENTRIES":"Results","ADD_RESULT":"Add result","SAVE_TABLE":"Save table","NEW_FORTUNE_WHEEL":"New fortune wheel","LINKED_TABLE":"Linked table","ANIMATION_DURATION":"Animation duration in seconds","MINIMUM_SPINS":"Minimum spins","SAVE_WHEEL":"Save wheel","TEST_DRAW":"Test draw","TEST_SPIN":"Test spin","NO_RANDOM_TABLES":"No random tables have been created yet.","NO_FORTUNE_WHEELS":"No fortune wheels have been created yet.","RESULT_TITLE":"Result title","CATEGORY_JACKPOT":"Jackpot","CATEGORY_POSITIVE":"Positive","CATEGORY_NEUTRAL":"Neutral","CATEGORY_NEGATIVE":"Negative","CATEGORY_CATASTROPHIC":"Catastrophic","INTEGRATION":"Integration","REPLACEMENTS":"Replacements","REPLACEMENT_MANAGER_HINT":"Official compendiums are never modified.","OFFICIAL_DEITY":"Official deity","HOMEBREW_REPLACEMENT":"Homebrew replacement","INHERITANCE":"Inheritance","SELECTIVE_INHERITANCE":"Selective via deity definition","INHERITED_VALUES":"inherited values","SPELLS":"Spells","ALTERNATE_DOMAINS":"Alternate domains","DIVINE_ATTRIBUTES":"Divine attributes","CLERIC_SPELLS":"Granted cleric spells","SPELLS_HINT":"One per line: rank=Compendium.package.pack.Item.id","KEEP_EXISTING_ACTORS":"Keep for existing characters","NO_OFFICIAL_DEITIES":"No official deities found","NO_OFFICIAL_DEITIES_HINT":"The active system adapter did not detect a matching deity pack.","CHARACTERS":"Characters","CHARACTER":"Character","CHARACTER_MANAGER_HINT":"Assign a deity and its grants to a character.","ASSIGN_DEITY":"Assign deity","PLAYER_VIEW":"Player view","TOOLS":"Tools","TEST_LAB":"Test lab","IMPORT_EXPORT":"Import / Export","IMPORT_EXPORT_HINT":"Back up or transfer your GodForge data.","DATA_MANAGER_HINT":"Inspect GodForge packages before import and export a portable backup of your definitions.","EXPORT_PACKAGE":"Export GodForge package","EXPORT_HINT":"Exports all deities including visibility, bonuses, wonders, grants, and replacements.","EXPORT":"Export","IMPORT_PACKAGE":"Import GodForge package","IMPORT_HINT":"The file is validated and summarized before any changes are made.","CHOOSE_FILE":"Choose JSON file","IMPORT_INVALID":"Import could not be validated","IMPORT_PREVIEW":"Import preview","NEW_CONTENT":"New content","UPDATED_CONTENT":"Updated content","IMPORT_APPLY_HINT":"Existing IDs are updated and new IDs are added.","APPLY_IMPORT":"Apply validated import","IMPORTED":"GodForge entries imported.","MIGRATIONS":"Migrations","MIGRATION_MANAGER_HINT":"GodForge updates older definitions automatically when they are loaded.","MIGRATION_STATUS":"Migration status","CURRENT_SCHEMA":"Current schema","PENDING_MIGRATIONS":"Pending migrations","MIGRATION_RELOAD_HINT":"Reload the world to update pending definitions.","MIGRATION_COMPLETE":"All deities use the current schema.","AUDIT_LOG":"Audit log","PLANNED":"Planned for a later alpha release","SETTINGS":"Settings","MODULE_OPTIONS":"Module options","ADAPTER":"System adapter","HELP":"Help","QUICK_ACCESS":"Quick access","SYSTEM_STATUS":"System status","RECENTLY_EDITED":"Recently edited","PUBLISHED":"Published","INVALID":"Invalid definitions","ASSIGNED_CHARACTERS":"Assigned characters","RESET_DAILY_USAGES":"Reset daily uses","RESET_DAILY_COMPLETE":"Daily-preparation uses were reset.","MANUAL_RESET_HINT":"If the system event did not fire, the GM can reset daily uses here manually.","EMPTY_TITLE":"No custom deities yet","EMPTY_HINT":"Create a new deity or import a pantheon.","IMPORT":"Import","LARGER_WINDOW":"A larger window is recommended for the full editor.","TYPE":"Type","LAST_CHANGED":"Last changed","SYSTEM":"System","SCHEMA":"Schema","VERSION":"Version","DIAGNOSTICS_OK":"Ready"},"SETTINGS":{"MENU_NAME":"GodForge management","MENU_LABEL":"Open GodForge","MENU_HINT":"Opens the dashboard for creating and managing custom deities.","LANGUAGE":"GodForge language","LANGUAGE_HINT":"Language used by GodForge surfaces.","AUTO":"Automatic"},"ERROR":{"NO_USES":"No uses remaining.","GM_ONLY":"Only the GM may use this GodForge feature.","NO_PERMISSION":"You are not allowed to use this GodForge feature.","DASHBOARD_OPEN":"The dashboard did not open. Details are available in the browser console.","CODEX_OPEN":"The Divine Codex did not open. Reload Foundry and try again.","HUB_OPEN":"The character hub could not be loaded. Check that the character is still available.","UNSUPPORTED_SYSTEM":"Darkis GodForge does not support the active {system} system.","ACTION_FAILED":"That did not work."}}`), Re = {
  DARKIS_GODFORGE: zt
}, me = /* @__PURE__ */ new Map([["en", Re]]);
async function xe(r, t) {
  if (r === "auto" || me.has(r)) return;
  const e = await fetch(t);
  if (!e.ok) throw new Error(`Unable to load GodForge language ${r}.`);
  me.set(r, await e.json());
}
function G(r) {
  var n, a, o, l;
  const t = v(), e = (a = (n = t == null ? void 0 : t.settings) == null ? void 0 : n.get) == null ? void 0 : a.call(n, "darkis-godforge", "language");
  if (typeof e == "string" && e !== "auto") {
    const c = qe(me.get(e), r);
    if (typeof c == "string") return c;
  }
  const i = (l = (o = t == null ? void 0 : t.i18n) == null ? void 0 : o.localize) == null ? void 0 : l.call(o, r);
  if (i && i !== r) return i;
  const s = qe(Re, r);
  return typeof s == "string" ? s : r;
}
function D() {
  return Object.fromEntries(Object.keys(Re.DARKIS_GODFORGE.UI).map((r) => [r, G(`DARKIS_GODFORGE.UI.${r}`)]));
}
function qe(r, t) {
  return t.split(".").reduce((e, i) => e && typeof e == "object" ? e[i] : void 0, r);
}
function w() {
  if (!Ce())
    throw Ne(), new Error("GodForge: GM only.");
}
function Ce() {
  var r, t;
  return ((t = (r = v()) == null ? void 0 : r.user) == null ? void 0 : t.isGM) === !0;
}
function Ne() {
  var r, t, e;
  (e = (t = (r = L()) == null ? void 0 : r.notifications) == null ? void 0 : t.warn) == null || e.call(t, G("DARKIS_GODFORGE.ERROR.GM_ONLY"));
}
function F(r = !1) {
  var s, n, a;
  const t = (s = v()) == null ? void 0 : s.user, e = t == null ? void 0 : t.character, i = (n = e == null ? void 0 : e.flags) == null ? void 0 : n["darkis-godforge"];
  return {
    isGM: (t == null ? void 0 : t.isGM) === !0,
    isTrusted: (t == null ? void 0 : t.isTrusted) === !0 || typeof (t == null ? void 0 : t.role) == "number" && t.role >= 2,
    selection: r,
    actorDeityId: typeof (i == null ? void 0 : i.deityId) == "string" ? i.deityId : void 0,
    ownsActor: !!(t && ((a = e == null ? void 0 : e.testUserPermission) == null ? void 0 : a.call(e, t, "OWNER")) === !0)
  };
}
class ot {
  constructor(t, e) {
    b(this, "catalogCache", null);
    this.deities = t, this.adapters = e;
  }
  async getSelectableDeities(t) {
    var d, m, g, I;
    const e = this.deities.list(), i = t.systemId ?? ((m = (d = v()) == null ? void 0 : d.system) == null ? void 0 : m.id) ?? "", s = F(!0), n = { classId: t.classId, level: t.level, region: t.region, pantheonFilter: t.pantheonFilter, systemId: i, catalogContext: t.catalogContext, viewer: s }, a = JSON.stringify([e.map((f) => [f.id, f.revision]), n]);
    if (((g = this.catalogCache) == null ? void 0 : g.key) === a) return this.catalogCache.result;
    const o = await (((I = this.adapters.tryGet(i)) == null ? void 0 : I.listOfficialDeities()) ?? Promise.resolve([])), l = t.catalogContext ?? "characterBuilder", c = new Set(e.filter((f) => f.replacement.sourceUuid && (f.replacement.mode === "hide" || f.replacement.mode === "replace") && (!f.replacement.contexts.length || f.replacement.contexts.includes(l))).map((f) => f.replacement.sourceUuid)), p = Ot(e, t, /* @__PURE__ */ new Set(), s), u = o.filter((f) => !f.sourceUuid || !c.has(f.sourceUuid)), h = [...p, ...u];
    return this.catalogCache = { key: a, result: h }, h;
  }
  exportDeities(t) {
    return w(), Bt(this.deities.list(), t);
  }
  async importDeities(t) {
    w();
    const e = rt(t);
    for (const i of e) this.deities.save(i);
    return await this.deities.flushPersistence(), this.catalogCache = null, e.length;
  }
  drawRandomDeity(t) {
    const e = F(!0);
    return Oe(this.deities.list().filter((i) => i.kind !== "lore" && j(i, e)).map((i) => ({ id: i.id, label: i.name, weight: 1 })), t);
  }
  getAdapterCapabilities(t) {
    return this.adapters.get(t).capabilities;
  }
  isDeitySelectableByPlayer(t) {
    const e = this.deities.get(t);
    return !!(e && e.kind !== "lore" && j(e, { isGM: !1, selection: !0 }));
  }
  async materializeDeity(t, e, i) {
    w();
    const s = this.deities.get(t);
    if (!s) throw new Error(`Unknown deity: ${t}`);
    return this.adapters.get(e).materialize(s, i);
  }
  getDeity(t) {
    const e = this.deities.get(t);
    if (!e) return null;
    const i = F();
    return i.isGM ? e : z(e, i);
  }
  getActorDeity(t) {
    var n;
    this.requireActorOwner(t);
    const e = (n = t.flags) == null ? void 0 : n["darkis-godforge"];
    if (!e || typeof e != "object" || !("deityId" in e) || typeof e.deityId != "string") return null;
    const i = this.deities.get(e.deityId);
    if (!i) return null;
    const s = { ...F(), actorDeityId: e.deityId, ownsActor: !0 };
    return s.isGM ? i : z(i, s);
  }
  getCharacterWidgetData(t) {
    var o;
    this.requireActorOwner(t);
    const e = (o = t.flags) == null ? void 0 : o["darkis-godforge"], i = e && typeof e == "object" && "deityId" in e && "grants" in e && "usages" in e ? e : null, s = i ? this.deities.get(i.deityId) : null;
    if (!s || !i) return le(null, null);
    const n = F();
    if (n.isGM) return le(s, i);
    const a = z(s, { ...n, actorDeityId: s.id, ownsActor: !0 });
    return le(a, { ...i, grants: [] });
  }
  getGrantChoices(t, e) {
    var i;
    return w(), ((i = this.deities.get(t)) == null ? void 0 : i.grantGroups) ?? null;
  }
  getClassGrants(t, e, i = []) {
    w();
    const s = this.deities.get(t);
    if (!s) throw new Error(`Unknown deity: ${t}`);
    return Mt(s, e, i);
  }
  buildClassCoupling(t, e, i, s = []) {
    return this.adapters.get(i).buildClassCoupling(this.getClassGrants(t, e, s));
  }
  async assignDeity(t, e, i = {}) {
    this.requireActorOwner(t);
    const s = this.deities.get(e);
    if (!s || s.kind === "lore" || !j(s, F(!0))) throw new Error("Deity is not available for assignment.");
    const n = Object.entries(i).map(([l, c]) => ({ groupId: l, refs: c })), a = s.grantGroups.flatMap((l) => J(l, n)), o = Object.fromEntries(s.abilities.filter((l) => l.uses).map((l) => [l.id, { used: 0, max: l.uses.max, lastResetAt: Date.now(), reset: l.uses.reset }]));
    await t.update({ flags: { "darkis-godforge": { deityId: e, grants: a, usages: o } } }), await this.synchronizeActorDeityItem(t, s);
  }
  async removeDeity(t) {
    this.requireActorOwner(t), t.unsetFlag ? await Promise.all(["deityId", "grants", "usages"].map((e) => t.unsetFlag("darkis-godforge", e))) : await t.update({ flags: { "darkis-godforge": null } }), await this.removeActorDeityItems(t);
  }
  async resetActorUsages(t, e) {
    this.requireActorOwner(t);
    const i = this.readState(t), s = Date.now(), n = Object.fromEntries(Object.entries(i.usages).map(([a, o]) => o.reset === e ? [a, Ct(o, s)] : [a, o]));
    await t.update({ flags: { "darkis-godforge": { ...i, usages: n } } });
  }
  async activateAbility(t, e, i = {}) {
    w();
    const s = this.readState(t), n = this.deities.get(s.deityId), a = n == null ? void 0 : n.abilities.find((p) => p.id === e);
    if (!a) throw new Error("Ability is not available for this actor.");
    const o = s.usages[e];
    if (o && !et(o)) throw new Error("No uses remaining.");
    const l = o ? { ...s.usages, [e]: Rt(o) } : s.usages, c = { id: t.id, modifiers: {}, conditions: [] };
    await Gt(a, { actor: c, target: i.target, facts: i.facts ?? { actor: { level: 0 }, target: {} }, rollDice: i.rollDice }), await t.update({ flags: { "darkis-godforge": { ...s, usages: l } } });
  }
  getReplacementFor(t) {
    return w(), this.deities.list().find((e) => e.replacement.sourceUuid === t && e.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(t, e) {
    return w(), this.deities.list().some((i) => i.replacement.sourceUuid === t && i.replacement.mode === "hide" && i.replacement.contexts.includes(e));
  }
  registerAdapter(t) {
    w(), this.adapters.register(t);
  }
  async synchronizeActorDeityItem(t, e) {
    var l, c;
    const i = (c = (l = v()) == null ? void 0 : l.system) == null ? void 0 : c.id, s = i ? this.adapters.tryGet(i) : null;
    if (!s || !t.createEmbeddedDocuments) return;
    const n = this.actorDeityItems(t), a = n[0];
    await s.materialize(e, { createItem: async (p) => {
      if (a != null && a.update)
        return await a.update(p), { uuid: a.uuid ?? `Actor.${t.id}.Item.${a.id}` };
      const [u] = await t.createEmbeddedDocuments("Item", [p]);
      if (!u) throw new Error("The system did not create the deity item.");
      return { uuid: u.uuid ?? `Actor.${t.id}.Item.${u.id}` };
    } }) && n.length > 1 && t.deleteEmbeddedDocuments && await t.deleteEmbeddedDocuments("Item", n.slice(1).map((p) => p.id));
  }
  async removeActorDeityItems(t) {
    const e = this.actorDeityItems(t).map((i) => i.id);
    e.length && t.deleteEmbeddedDocuments && await t.deleteEmbeddedDocuments("Item", e);
  }
  actorDeityItems(t) {
    var e;
    return (((e = t.items) == null ? void 0 : e.contents) ?? []).filter((i) => {
      var n;
      const s = (n = i.flags) == null ? void 0 : n["darkis-godforge"];
      return !!(s && typeof s == "object" && "definitionUuid" in s);
    });
  }
  readState(t) {
    var i;
    const e = (i = t.flags) == null ? void 0 : i["darkis-godforge"];
    if (!e || typeof e != "object" || !("deityId" in e) || typeof e.deityId != "string" || !("usages" in e) || typeof e.usages != "object") throw new Error("Actor has no assigned deity.");
    return e;
  }
  requireActorOwner(t) {
    var i, s;
    const e = v();
    if (((i = e == null ? void 0 : e.user) == null ? void 0 : i.isGM) !== !0 && !(e != null && e.user && ((s = t.testUserPermission) == null ? void 0 : s.call(t, e.user, "OWNER")) === !0))
      throw new Error("GodForge: Actor owner or GM required.");
  }
}
function He(r) {
  return r.replace(/[&<>\"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t] ?? t);
}
function V(r) {
  if (!r) return "icons/svg/eye.svg";
  const t = r.trim();
  return /^(?:javascript|data|vbscript):/i.test(t) || /^\/\//.test(t) || /[\u0000-\u001f]/.test(t) ? "icons/svg/eye.svg" : t;
}
function Kt(r) {
  const t = [];
  r.name.trim() || t.push({ level: "error", field: "name", message: "Name is required." }), r.title.trim() || t.push({ level: "warning", field: "title", message: "Title is empty." }), r.description.trim() || t.push({ level: "warning", field: "description", message: "Description is empty." });
  for (const e of r.passiveBonuses)
    (!e.name.trim() || !e.selector.trim()) && t.push({ level: "error", field: `bonus.${e.id}`, message: "Bonus name and selector are required." }), typeof e.value == "string" && !_e(e.value) && t.push({ level: "error", field: `bonus.${e.id}.value`, message: "Bonus formula is invalid." });
  for (const e of r.abilities)
    e.name.trim() || t.push({ level: "error", field: `ability.${e.id}`, message: "Ability name is required." }), !e.timing && e.actionCost === void 0 && t.push({ level: "warning", field: `ability.${e.id}.timing`, message: "Ability timing is incomplete." });
  return t;
}
function K() {
  var i;
  const r = globalThis, t = typeof foundry < "u" ? foundry : r.foundry, e = (i = t == null ? void 0 : t.applications) == null ? void 0 : i.api;
  if (e != null && e.ApplicationV2 && e.HandlebarsApplicationMixin) return e.HandlebarsApplicationMixin(e.ApplicationV2);
  if (we()) {
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
function q() {
  const r = K();
  return class extends r {
    render(t) {
      return Ce() ? super.render(t) : (Ne(), Promise.resolve(this));
    }
  };
}
function x(r, t) {
  var e, i, s;
  console.error(`Darkis GodForge | ${r}`, t), (s = (i = (e = L()) == null ? void 0 : e.notifications) == null ? void 0 : i.error) == null || s.call(i, G("DARKIS_GODFORGE.ERROR.ACTION_FAILED"));
}
function se(r, t = []) {
  const e = r.grants.flatMap((s) => {
    if (!("mode" in s)) return [];
    const n = r.mode === "any" ? [...t, { groupId: r.id, optionId: s.id }] : t;
    return se(s, n);
  });
  if (r.mode !== "any") return e;
  const i = r.grants.map((s) => {
    var n;
    return "mode" in s ? { id: s.id, label: s.label || s.id } : { id: s.ref, label: ((n = s.overrides) == null ? void 0 : n.name) || s.ref };
  });
  return [{ id: r.id, label: r.label || r.id, pick: r.pick ?? 1, options: i, requirements: t }, ...e];
}
function Be(r) {
  return r.some((t) => se(t).length > 0);
}
class fe extends K() {
  constructor(e, i, s, n) {
    super();
    b(this, "groups", []);
    b(this, "tokens", /* @__PURE__ */ new Map());
    b(this, "error", "");
    this.deity = e, this.actor = i, this.socketRouter = s, this.onAssigned = n;
  }
  async _prepareContext() {
    this.tokens.clear();
    const e = this.deity.grantGroups.flatMap((n) => se(n)), i = /* @__PURE__ */ new Map(), s = e.map((n, a) => n.options.map((o, l) => {
      const c = `${a}-${l}-${crypto.randomUUID()}`;
      return this.tokens.set(c, o.id), i.set(`${n.id}\0${o.id}`, c), { token: c, label: o.label };
    }));
    return this.groups = e.map((n, a) => ({
      id: n.id,
      label: n.label,
      pick: n.pick,
      inputType: n.pick === 1 ? "radio" : "checkbox",
      options: s[a] ?? [],
      requirements: n.requirements.flatMap((o) => {
        const l = e.findIndex((p) => p.id === o.groupId), c = i.get(`${o.groupId}\0${o.optionId}`);
        return l >= 0 && c ? [{ name: `choice-${l}`, token: c }] : [];
      })
    })), { ui: D(), deityName: this.deity.name, groups: this.groups, error: this.error };
  }
  _onRender() {
    var i, s, n, a, o, l;
    (s = (i = this.element) == null ? void 0 : i.querySelector("form")) == null || s.addEventListener("submit", (c) => {
      var h;
      c.preventDefault();
      const p = c.currentTarget, u = {};
      for (const [d, m] of this.groups.entries()) {
        if ((h = p.querySelector(`[data-choice-group='${d}']`)) != null && h.hidden) continue;
        const g = [...p.querySelectorAll(`[name='choice-${d}']:checked`)].flatMap((I) => {
          const f = this.tokens.get(I.value);
          return f ? [f] : [];
        });
        if (g.length !== m.pick) {
          this.error = `${m.label}: ${(D().PICK_EXACTLY ?? "Choose exactly {count} option(s).").replace("{count}", String(m.pick))}`, this.render(!0);
          return;
        }
        u[m.id] = g;
      }
      this.socketRouter.assign({ actorId: this.actor.id, deityId: this.deity.id, choices: u }).then(() => {
        var d;
        this.onAssigned(), (d = this.close) == null || d.call(this);
      }).catch((d) => {
        this.error = D().ASSIGNMENT_FAILED ?? "The deity could not be assigned.", x("Grant choice assignment failed.", d), this.render(!0);
      });
    });
    const e = () => {
      var c;
      (c = this.element) == null || c.querySelectorAll("[data-choice-group]").forEach((p) => {
        const h = [...p.querySelectorAll("[data-choice-requirement]")].every((d) => {
          var I, f;
          const m = d.dataset.name ?? "", g = d.dataset.token ?? "";
          return ((f = (I = this.element) == null ? void 0 : I.querySelector(`[name='${m}'][value='${g}']`)) == null ? void 0 : f.checked) === !0;
        });
        p.hidden = !h, p.querySelectorAll("input").forEach((d) => {
          d.disabled = !h, h || (d.checked = !1);
        });
      });
    };
    (a = (n = this.element) == null ? void 0 : n.querySelector("form")) == null || a.addEventListener("change", e), e(), (l = (o = this.element) == null ? void 0 : o.querySelector("[data-action='cancel']")) == null || l.addEventListener("click", () => {
      var c;
      return void ((c = this.close) == null ? void 0 : c.call(this));
    });
  }
}
b(fe, "DEFAULT_OPTIONS", { id: "darkis-godforge-grant-choices", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHOOSE_GRANTS", resizable: !0 }, position: { width: 620, height: 680 } }), b(fe, "PARTS", { main: { template: "modules/darkis-godforge/templates/grant-choice-dialog.hbs" } });
class B extends K() {
  constructor(e, i, s, n, a, o) {
    super();
    b(this, "searchTerm", "");
    b(this, "selectedDomain", "");
    this.deityService = e, this.preview = i, this.api = s, this.socketRouter = n, this.actor = a, this.viewerOverride = o;
  }
  async _prepareContext() {
    var p, u, h, d, m, g, I;
    const e = ((p = this.preview) == null ? void 0 : p.viewer) ?? this.viewerOverride ?? F(!0), i = this.preview ? [{ ...this.preview.deity, status: "published" }] : this.deityService.list(), s = (d = (h = (u = this.actor) == null ? void 0 : u.flags) == null ? void 0 : h["darkis-godforge"]) == null ? void 0 : d.deityId, n = (m = v()) == null ? void 0 : m.user, a = !!(this.actor && n && ((I = (g = this.actor).testUserPermission) == null ? void 0 : I.call(g, n, "OWNER")) === !0), o = (f) => {
      var y, E, S, T, O, A;
      return { ...f, image: V(f.image), imageFit: ((E = (y = f.imagePresentation) == null ? void 0 : y.image) == null ? void 0 : E.fit) === "contain" ? "contain" : "cover", imagePosition: `${((T = (S = f.imagePresentation) == null ? void 0 : S.image) == null ? void 0 : T.focusX) ?? 50}% ${((A = (O = f.imagePresentation) == null ? void 0 : O.image) == null ? void 0 : A.focusY) ?? 25}%` };
    }, l = i.flatMap((f) => {
      const y = Be(f.grantGroups), E = f.kind === "lore";
      if (e.isGM) return [{ ...o(f), lore: E, selected: f.id === s, canSelect: !1, requiresChoices: y }];
      const S = z(f, e);
      return S ? [{ ...o(S), lore: E, selected: f.id === s, canSelect: !E && !!(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && (e.ownsActor || a)), requiresChoices: y }] : [];
    }).sort((f, y) => Number(y.lore) - Number(f.lore) || f.name.localeCompare(y.name)), c = l.filter((f) => {
      var y;
      return (!this.searchTerm || `${f.name} ${f.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || ((y = f.domains) == null ? void 0 : y.includes(this.selectedDomain)));
    });
    return { ui: D(), deities: c, domains: [...new Set(l.flatMap((f) => f.domains ?? []))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain, isGM: e.isGM, isPreview: !!(this.preview || this.viewerOverride) };
  }
  _onRender() {
    const e = this.element;
    if (!e) return;
    const i = e.querySelector("[data-search]"), s = e.querySelector("[data-filter]");
    i && (i.value = this.searchTerm), s && (s.value = this.selectedDomain), i == null || i.addEventListener("input", (n) => {
      this.searchTerm = n.target.value.toLocaleLowerCase(), this.render(!0);
    }), s == null || s.addEventListener("change", (n) => {
      this.selectedDomain = n.target.value, this.render(!0);
    }), e.querySelectorAll("[data-select-deity]").forEach((n) => n.addEventListener("click", () => {
      if (!this.actor || !this.socketRouter) return;
      const a = this.deityService.get(n.dataset.selectDeity ?? "");
      if (a) {
        if (Be(a.grantGroups)) {
          new fe(a, this.actor, this.socketRouter, () => void this.render(!0)).render(!0);
          return;
        }
        this.socketRouter.assign({ actorId: this.actor.id, deityId: a.id, choices: {} }).then(() => this.render(!0)).catch((o) => x("Deity assignment failed.", o));
      }
    }));
  }
}
b(B, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1e3, height: 760 } }), b(B, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
class ge extends K() {
  constructor(e, i, s, n, a) {
    super();
    b(this, "selected", /* @__PURE__ */ new Set());
    this.title = e, this.choices = i, this.multiple = n, this.onChoose = a, s.forEach((o) => this.selected.add(o));
  }
  async _prepareContext() {
    const e = this.choices.map((s, n) => {
      var a;
      return { ...s, token: String(n), selected: this.selected.has(s.value), traitText: ((a = s.traits) == null ? void 0 : a.join(", ")) ?? "", rankText: s.rank === void 0 ? "" : String(s.rank), available: s.available !== !1 };
    }), i = (s) => [...new Set(s.filter((n) => !!n))].sort((n, a) => n.localeCompare(a));
    return { ui: D(), title: this.title, items: e, multiple: this.multiple, categories: i(e.map((s) => s.category)), groups: i(e.map((s) => s.group)), sources: i(e.map((s) => s.source)), ranks: [...new Set(e.flatMap((s) => s.rank === void 0 ? [] : [s.rank]))].sort((s, n) => s - n), traits: i(e.flatMap((s) => s.traits ?? [])) };
  }
  _onRender() {
    var l, c, p;
    const e = this.element;
    if (!e) return;
    const i = [...e.querySelectorAll("[data-picker-item]")], s = () => {
      var T, O, A, k, $, X, Le, Ge;
      const u = ((T = e.querySelector("[data-picker-search]")) == null ? void 0 : T.value.trim().toLocaleLowerCase()) ?? "", h = ((O = e.querySelector("[data-picker-category]")) == null ? void 0 : O.value) ?? "", d = ((A = e.querySelector("[data-picker-group]")) == null ? void 0 : A.value) ?? "", m = ((k = e.querySelector("[data-picker-source]")) == null ? void 0 : k.value) ?? "", g = (($ = e.querySelector("[data-picker-rank]")) == null ? void 0 : $.value) ?? "", I = ((X = e.querySelector("[data-picker-trait]")) == null ? void 0 : X.value) ?? "", f = ((Le = e.querySelector("[data-picker-available]")) == null ? void 0 : Le.checked) === !0, y = ((Ge = e.querySelector("[data-picker-remaster]")) == null ? void 0 : Ge.checked) === !0;
      for (const C of i) {
        const dt = `${C.dataset.label ?? ""} ${C.dataset.traits ?? ""} ${C.dataset.category ?? ""} ${C.dataset.group ?? ""} ${C.dataset.source ?? ""}`.toLocaleLowerCase();
        C.hidden = !!(u && !dt.includes(u) || h && C.dataset.category !== h || d && C.dataset.group !== d || m && C.dataset.source !== m || g && C.dataset.rank !== g || I && !(C.dataset.traits ?? "").split("|").includes(I) || f && C.dataset.available !== "true" || y && C.dataset.remaster !== "true");
      }
      const E = i.filter((C) => !C.hidden).length, S = e.querySelector("[data-picker-count]");
      S && (S.textContent = String(E));
    }, n = (u) => {
      i.forEach((m) => m.classList.toggle("active", m === u));
      const h = e.querySelector("[data-picker-preview-image]");
      h && (h.hidden = !u.dataset.img, u.dataset.img && (h.src = u.dataset.img));
      const d = (m, g) => {
        const I = e.querySelector(m);
        I && (I.textContent = g || "—");
      };
      d("[data-picker-preview-name]", u.dataset.label ?? ""), d("[data-picker-preview-category]", [u.dataset.category, u.dataset.group].filter(Boolean).join(" · ")), d("[data-picker-preview-traits]", (u.dataset.traits ?? "").replaceAll("|", ", ")), d("[data-picker-preview-source]", u.dataset.source ?? ""), d("[data-picker-preview-rank]", u.dataset.rank ?? "");
    }, a = (u) => {
      var m;
      const h = this.choices[Number(u.dataset.pickerItem)];
      if (!h) return;
      if (!this.multiple) {
        this.onChoose({ values: [h.value], items: [h] }), (m = this.close) == null || m.call(this);
        return;
      }
      this.selected.has(h.value) ? this.selected.delete(h.value) : this.selected.add(h.value), u.classList.toggle("selected", this.selected.has(h.value));
      const d = u.querySelector("[data-picker-choose]");
      d && d.setAttribute("aria-pressed", String(this.selected.has(h.value)));
    };
    e.querySelectorAll("[data-picker-filter]").forEach((u) => u.addEventListener("input", s)), i.forEach((u) => {
      u.addEventListener("click", (h) => {
        n(u), h.target.closest("[data-picker-choose]") && a(u);
      }), u.addEventListener("dblclick", () => a(u));
    }), e.addEventListener("dragover", (u) => u.preventDefault()), e.addEventListener("drop", (u) => {
      var g;
      u.preventDefault();
      const h = ((g = u.dataTransfer) == null ? void 0 : g.getData("text/plain")) ?? "";
      let d = h.trim();
      try {
        const I = JSON.parse(h);
        typeof I.uuid == "string" && (d = I.uuid);
      } catch {
      }
      const m = this.choices.findIndex((I) => I.value === d);
      m >= 0 && a(i[m]);
    }), (l = e.querySelector("[data-picker-confirm]")) == null || l.addEventListener("click", () => {
      var h;
      const u = this.choices.filter((d) => this.selected.has(d.value));
      this.onChoose({ values: u.map((d) => d.value), items: u }), (h = this.close) == null || h.call(this);
    }), (c = e.querySelector("[data-picker-clear]")) == null || c.addEventListener("click", () => {
      var u;
      this.onChoose({ values: [], items: [] }), (u = this.close) == null || u.call(this);
    }), (p = e.querySelector("[data-picker-cancel]")) == null || p.addEventListener("click", () => {
      var u;
      return void ((u = this.close) == null ? void 0 : u.call(this));
    });
    const o = i.find((u) => u.classList.contains("selected")) ?? i[0];
    o && n(o), s();
  }
}
b(ge, "DEFAULT_OPTIONS", { id: "darkis-godforge-picker", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.PICKER_TITLE", resizable: !0 }, position: { width: 980, height: 720 } }), b(ge, "PARTS", { main: { template: "modules/darkis-godforge/templates/picker-dialog.hbs" } });
const $e = Object.keys(H.fields);
class ee extends q() {
  constructor(e, i, s = new De(), n) {
    super();
    b(this, "systemCatalog", { skills: [], domains: [], weapons: [], spells: [], fonts: [], sanctifications: [], attributes: [] });
    b(this, "officialChoices", []);
    this.deityService = e, this.onSaved = i, this.adapters = s, this.existing = n;
  }
  async _prepareContext() {
    var p, u, h;
    w();
    const e = ((u = (p = v()) == null ? void 0 : p.system) == null ? void 0 : u.id) ?? "", i = this.adapters.tryGet(e), s = (i == null ? void 0 : i.listSkills()) ?? [];
    let n = { skills: s.map((d) => ({ value: d, label: d })), domains: [], weapons: [], spells: [], fonts: [], sanctifications: [], attributes: [] }, a = [];
    try {
      a = await ((i == null ? void 0 : i.listOfficialDeities()) ?? Promise.resolve([]));
    } catch (d) {
      console.error("Darkis GodForge | Could not load official deities for the editor.", d);
    }
    try {
      i && (n = await i.listEditorCatalog());
    } catch (d) {
      console.error("Darkis GodForge | Could not load system choices for the editor.", d);
    }
    this.systemCatalog = n, this.officialChoices = a.map((d) => ({ value: d.sourceUuid ?? d.id, label: d.name, img: d.image, category: d.pantheon, group: d.skill ?? d.alignment, traits: d.domains, source: e.toUpperCase(), details: d.favoredWeapon ? `Waffe: ${d.favoredWeapon}` : void 0, available: !0 }));
    const o = ((h = this.existing) == null ? void 0 : h.replacement.sourceUuid) ?? "", l = a.map((d) => ({ ...d, selected: d.sourceUuid === o }));
    o && !l.some((d) => d.sourceUuid === o) && l.push({ id: o, sourceUuid: o, official: !0, name: o, title: o, domains: [], selected: !0 });
    const c = D();
    return {
      ui: { ...c, NEW_DEITY: this.existing ? c.EDIT_DEITY : c.NEW_DEITY },
      selectors: s,
      systemCatalog: n,
      pantheonOptions: this.deityService.list().flatMap((d) => d.pantheons ?? []).filter((d, m, g) => g.findIndex((I) => I.id === d.id) === m).map((d) => {
        var m, g;
        return { ...d, selected: ((g = (m = this.existing) == null ? void 0 : m.pantheonIds) == null ? void 0 : g.includes(d.id)) === !0 };
      }),
      officialDeities: l,
      visibilityFields: $e.map((d) => ({ key: d, label: c[`VIS_FIELD_${d.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? d })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((d) => ({ value: d, label: c[`VIS_${d.replaceAll("-", "_").toUpperCase()}`] ?? d }))
    };
  }
  _onRender() {
    var n, a, o, l, c;
    w();
    const e = this.element, i = e == null ? void 0 : e.querySelector("form");
    let s = !1;
    e && i && this.existing && this.populateForm(e, i, this.existing), e && i && this.setupWizard(e, i), i && this.refreshPickerControls(i), e == null || e.querySelectorAll("[data-action='browse-image']").forEach((p) => p.addEventListener("click", () => this.openFilePicker(e, p))), e == null || e.querySelectorAll("[data-image-field]").forEach((p) => {
      p.addEventListener("dragover", (u) => {
        u.preventDefault(), u.dataTransfer.dropEffect = "copy";
      }), p.addEventListener("drop", (u) => this.handleImageDrop(u, p));
    }), (n = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || n.addEventListener("click", () => {
      var p;
      s && !globalThis.confirm("Ungespeicherte Änderungen verwerfen? / Discard unsaved changes?") || (p = this.close) == null || p.call(this);
    }), (a = e == null ? void 0 : e.querySelector("[data-action='add-bonus']")) == null || a.addEventListener("click", () => this.appendTemplate(e, "bonus", "[data-bonus-list]")), (o = e == null ? void 0 : e.querySelector("[data-action='add-ability']")) == null || o.addEventListener("click", () => this.appendTemplate(e, "ability", "[data-ability-list]")), (l = e == null ? void 0 : e.querySelector("[data-action='add-grant-group']")) == null || l.addEventListener("click", () => this.appendTemplate(e, "grant-group", "[data-grant-list]")), e == null || e.addEventListener("click", (p) => {
      var d, m, g;
      const u = p.target.closest("[data-action]");
      if (!u) return;
      if (u.dataset.action === "open-system-picker" && i) {
        this.openSystemPicker(i, u);
        return;
      }
      if (u.dataset.action === "generate-image-variants" && i) {
        this.generateImageVariants(i, u);
        return;
      }
      if (u.dataset.action === "scroll-steps-left" || u.dataset.action === "scroll-steps-right") {
        (d = e.querySelector(".dg-step-strip")) == null || d.scrollBy({ left: u.dataset.action.endsWith("right") ? 260 : -260, behavior: "smooth" });
        return;
      }
      const h = u == null ? void 0 : u.closest(".dg-editor-card");
      h && (u.dataset.action === "add-grant-member" && this.appendTemplate(h, "grant-member", ":scope > [data-grant-members]"), u.dataset.action === "add-subgroup" && this.appendTemplate(h, "grant-group", ":scope > [data-grant-members]"), u.dataset.action === "add-effect" && this.appendTemplate(h, "effect", ":scope > [data-effect-list]"), u.dataset.action === "remove-row" && h.remove(), u.dataset.action === "duplicate-row" && h.after(h.cloneNode(!0)), u.dataset.action === "move-up" && h.previousElementSibling && ((m = h.parentElement) == null || m.insertBefore(h, h.previousElementSibling)), u.dataset.action === "move-down" && h.nextElementSibling && ((g = h.parentElement) == null || g.insertBefore(h.nextElementSibling, h)), this.updateStackingWarnings(e), i && this.updateWizardPreview(e, i));
    }), e == null || e.addEventListener("input", (p) => {
      s = !0, this.updateStackingWarnings(e);
      const u = p.target;
      u.matches("[data-image-input]") && this.updateImagePreview(e, u.name, u.value), u.matches("[data-formula]") && this.validateFormulaField(u), i && this.updateWizardPreview(e, i);
    }), e == null || e.addEventListener("change", (p) => {
      s = !0;
      const u = p.target;
      if (u.name === "replacement.sourceUuid" && i) {
        const h = i.elements.namedItem("replacement.mode");
        h && (h.value = u.value ? "replace" : "none"), u.value && i.querySelectorAll("[name^='replacement.inherit.']").forEach((d) => {
          d.checked = d.name !== "replacement.inherit.edicts" && d.name !== "replacement.inherit.anathema";
        });
      }
      if (u.matches("[data-weapon-picker]") && i) {
        const h = u.selectedOptions[0], d = i.elements.namedItem("favoredWeapon"), m = i.elements.namedItem("favoredWeaponUuid");
        d && (d.value = (h == null ? void 0 : h.dataset.slug) ?? ""), m && (m.value = u.value);
      }
      u.matches("[data-image-setting]") && this.updateImagePresentationPreview(e, u.dataset.imageSetting ?? ""), i && this.updateWizardPreview(e, i);
    }), e == null || e.querySelectorAll("[data-image-input]").forEach((p) => this.updateImagePreview(e, p.name, p.value)), e == null || e.querySelectorAll("[data-action='preview-player']").forEach((p) => p.addEventListener("click", () => {
      const u = i == null ? void 0 : i.elements.namedItem("name");
      if (!i || !(u != null && u.reportValidity())) return;
      const h = this.previewDefinition(i);
      new B(this.deityService, { deity: h, viewer: { isGM: !1, selection: !0 } }).render(!0);
    })), (c = e == null ? void 0 : e.querySelector("[data-action='save-draft']")) == null || c.addEventListener("click", () => {
      const p = i == null ? void 0 : i.elements.namedItem("name");
      !i || !(p != null && p.reportValidity()) || this.saveDefinition(i, !0);
    }), i == null || i.addEventListener("submit", (p) => {
      p.preventDefault(), this.saveDefinition(i, !1);
    });
  }
  setupWizard(e, i) {
    const s = [...e.querySelectorAll("[data-wizard-panel]")], n = [...e.querySelectorAll("[data-wizard-step]")], a = e.querySelector("[data-action='previous-step']"), o = e.querySelector("[data-action='next-step']"), l = e.querySelector("[data-action='finish']"), c = e.querySelector("[data-wizard-current]"), p = e.querySelector("[data-wizard-total]"), u = i.elements.namedItem("kind");
    let h = 0;
    const d = () => s.filter((g) => (u == null ? void 0 : u.value) !== "lore" || !g.hasAttribute("data-selectable-only")), m = (g) => {
      var y;
      const I = d();
      h = Math.max(0, Math.min(I.length - 1, g));
      const f = I[h];
      s.forEach((E) => {
        E.hidden = E !== f;
      }), n.forEach((E) => {
        const S = s.find((O) => O.dataset.wizardPanel === E.dataset.wizardStep), T = S ? I.indexOf(S) : -1;
        E.hidden = T < 0, E.querySelector("b").textContent = T < 0 ? "" : String(T + 1), E.classList.toggle("completed", T >= 0 && T < h), S === f ? E.setAttribute("aria-current", "step") : E.removeAttribute("aria-current");
      }), a && (a.disabled = h === 0), o && (o.hidden = h === I.length - 1), l && (l.hidden = h !== I.length - 1), c && (c.textContent = String(h + 1)), p && (p.textContent = String(I.length)), (y = n.find((E) => E.getAttribute("aria-current") === "step")) == null || y.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }), this.updateWizardPreview(e, i);
    };
    n.forEach((g) => g.addEventListener("click", () => {
      const I = s.find((y) => y.dataset.wizardPanel === g.dataset.wizardStep), f = I ? d().indexOf(I) : -1;
      f >= 0 && m(f);
    })), a == null || a.addEventListener("click", () => m(h - 1)), o == null || o.addEventListener("click", () => m(h + 1)), u == null || u.addEventListener("change", () => m(0)), m(0);
  }
  updateWizardPreview(e, i) {
    var u, h;
    const s = D(), n = (d) => {
      var m;
      return ((m = i.elements.namedItem(d)) == null ? void 0 : m.value.trim()) ?? "";
    }, a = (d, m) => {
      const g = e.querySelector(d);
      g && (g.textContent = m);
    };
    a("[data-wizard-preview-name]", n("name") || s.NEW_DEITY_PLACEHOLDER || "New deity"), a("[data-wizard-preview-title]", n("title") || "—"), a("[data-wizard-preview-description]", n("description") || s.PREVIEW_EMPTY_DESCRIPTION || "—");
    const o = e.querySelector("[data-wizard-preview-quote]");
    o && (o.textContent = n("quote"), o.hidden = !o.textContent);
    const l = i.elements.namedItem("status");
    a("[data-wizard-preview-status]", ((u = l == null ? void 0 : l.selectedOptions[0]) == null ? void 0 : u.textContent) ?? s.STATUS_DRAFT ?? "Draft");
    const c = i.elements.namedItem("replacement.sourceUuid");
    a("[data-wizard-preview-source]", c != null && c.value ? ((h = this.officialChoices.find((d) => d.value === c.value)) == null ? void 0 : h.label) ?? c.value : "—"), a("[data-wizard-preview-bonuses]", String(i.querySelectorAll("[data-bonus-row]").length)), a("[data-wizard-preview-abilities]", String(i.querySelectorAll("[data-ability-row]").length));
    const p = e.querySelector("[data-wizard-preview-image]");
    p && (p.src = n("image") ? V(n("image")) : "modules/darkis-godforge/assets/logo.png");
  }
  async saveDefinition(e, i) {
    var a;
    w();
    const s = this.readInput(e);
    i && (s.status = "draft");
    const n = this.existing ? this.deityService.update(this.existing.id, s) : this.deityService.create(s);
    try {
      await this.deityService.flushPersistence(), this.onSaved(n), await ((a = this.close) == null ? void 0 : a.call(this));
    } catch (o) {
      x("Deity persistence failed.", o);
    }
  }
  appendTemplate(e, i, s) {
    var c, p, u;
    const n = ((c = this.element) == null ? void 0 : c.querySelector(`template[data-template='${i}']`)) ?? (e == null ? void 0 : e.querySelector(`template[data-template='${i}']`)), a = e == null ? void 0 : e.querySelector(s);
    if (!n || !a) return;
    const o = n.content.cloneNode(!0);
    (u = (p = o.querySelector("[name$='.visibility']")) == null ? void 0 : p.querySelector("[value='followers']")) == null || u.setAttribute("selected", "selected"), a.append(o), this.updateStackingWarnings(e);
    const l = e == null ? void 0 : e.querySelector("form");
    e && l && this.updateWizardPreview(e, l);
  }
  previewDefinition(e) {
    const i = (/* @__PURE__ */ new Date()).toISOString();
    return { ...this.readInput(e), id: "preview", schemaVersion: N, revision: 1, createdAt: i, updatedAt: i, checksum: "preview" };
  }
  populateForm(e, i, s) {
    var a, o, l, c, p, u;
    const n = {
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
      "visibility.deity": s.visibility.deity
    };
    for (const [h, d] of Object.entries(s.visibility.fields)) n[`visibility.fields.${h}`] = d;
    for (const h of ["image", "icon", "symbol", "banner"]) {
      const d = (a = s.imagePresentation) == null ? void 0 : a[h];
      n[`imagePresentation.${h}.fit`] = (d == null ? void 0 : d.fit) ?? "cover", n[`imagePresentation.${h}.focusX`] = String((d == null ? void 0 : d.focusX) ?? 50), n[`imagePresentation.${h}.focusY`] = String((d == null ? void 0 : d.focusY) ?? 25), n[`imagePresentation.${h}.zoom`] = String((d == null ? void 0 : d.zoom) ?? 1), n[`imagePresentation.${h}.rotation`] = String((d == null ? void 0 : d.rotation) ?? 0);
    }
    for (const [h, d] of Object.entries(n)) this.setValue(i, h, d);
    for (const h of ["domains", "favoredWeapon", "spells", "sanctification", "skill", "font", "divineAttributes", "edicts", "anathema"]) this.setChecked(i, `replacement.inherit.${h}`, ((o = s.replacement.inherit) == null ? void 0 : o[h]) === !0);
    this.setChecked(i, "replacement.keepForExistingActors", s.replacement.keepForExistingActors !== !1), this.setChecked(i, "visibility.showMechanicsInSelection", s.visibility.showMechanicsInSelection === !0);
    for (const h of s.passiveBonuses) {
      this.appendTemplate(e, "bonus", "[data-bonus-list]");
      const d = e.querySelector("[data-bonus-list] [data-bonus-row]:last-child");
      d && (this.setValue(d, "bonus.name", h.name), this.setValue(d, "bonus.selector", h.selector), this.setValue(d, "bonus.value", String(h.value)), this.setValue(d, "bonus.modifierType", h.modifierType), this.setValue(d, "bonus.appliesTo", h.appliesTo ?? "checks"), this.setValue(d, "bonus.condition", h.condition ?? ""), this.setValue(d, "bonus.visibility", h.visibility ?? "followers"));
    }
    for (const h of s.abilities) {
      this.appendTemplate(e, "ability", "[data-ability-list]");
      const d = e.querySelector("[data-ability-list] [data-ability-row]:last-child");
      if (!d) continue;
      const m = h.timing;
      this.setValue(d, "ability.name", h.name), this.setValue(d, "ability.description", h.description), this.setValue(d, "ability.visibility", h.visibility ?? "followers"), this.setValue(d, "ability.abilityType", h.abilityType ?? "standard"), this.setValue(d, "ability.actionCost", (m == null ? void 0 : m.actionCost.type) ?? "actions"), this.setValue(d, "ability.actions", String((m == null ? void 0 : m.actionCost.actions) ?? h.actionCost ?? 1)), this.setValue(d, "ability.usageMax", String((m == null ? void 0 : m.usage.max) ?? ((l = h.uses) == null ? void 0 : l.max) ?? "")), this.setValue(d, "ability.reset", (m == null ? void 0 : m.reset.event) ?? ((c = h.uses) == null ? void 0 : c.reset) ?? "daily-preparations"), this.setValue(d, "ability.cooldownValue", String(((p = m == null ? void 0 : m.cooldown) == null ? void 0 : p.value) ?? 0)), this.setValue(d, "ability.cooldownUnit", ((u = m == null ? void 0 : m.cooldown) == null ? void 0 : u.unit) ?? "rounds"), this.setValue(d, "ability.durationValue", String((m == null ? void 0 : m.duration.value) ?? h.duration ?? 0)), this.setValue(d, "ability.durationUnit", (m == null ? void 0 : m.duration.unit) ?? "instant");
      for (const g of h.effects) this.populateEffect(d, g);
    }
    for (const h of s.grantGroups) this.populateGrantGroup(e, e.querySelector("[data-grant-list]"), h);
    this.updateStackingWarnings(e);
  }
  readInput(e) {
    const i = new FormData(e), s = i.get("kind") === "lore" ? "lore" : "selectable", n = structuredClone(H);
    n.deity = this.visibility(i.get("visibility.deity"), "public"), n.showMechanicsInSelection = i.has("visibility.showMechanicsInSelection");
    for (const a of $e) n.fields[a] = this.visibility(i.get(`visibility.fields.${a}`), n.fields[a]);
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
      passiveBonuses: s === "lore" ? [] : this.readBonuses(e),
      abilities: s === "lore" ? [] : this.readAbilities(e),
      grantGroups: s === "lore" ? [] : this.readGrantGroups(e),
      replacement: s === "lore" ? { sourceUuid: "", mode: "none", contexts: [] } : { sourceUuid: this.text(i.get("replacement.sourceUuid")), mode: this.text(i.get("replacement.sourceUuid")) ? this.replacementMode(i.get("replacement.mode")) === "hide" ? "hide" : "replace" : "none", contexts: this.list(i.get("replacement.contexts")), inherit: { domains: i.has("replacement.inherit.domains"), favoredWeapon: i.has("replacement.inherit.favoredWeapon"), spells: i.has("replacement.inherit.spells"), sanctification: i.has("replacement.inherit.sanctification"), skill: i.has("replacement.inherit.skill"), font: i.has("replacement.inherit.font"), divineAttributes: i.has("replacement.inherit.divineAttributes"), edicts: i.has("replacement.inherit.edicts"), anathema: i.has("replacement.inherit.anathema") }, keepForExistingActors: i.has("replacement.keepForExistingActors") },
      visibility: n
    };
  }
  openFilePicker(e, i) {
    var p, u, h;
    if (!e) return;
    const s = i.dataset.target ?? "", n = e.querySelector(`[name='${s}']`);
    if (!n) return;
    const a = globalThis, o = ((h = (u = (p = a.foundry) == null ? void 0 : p.applications) == null ? void 0 : u.apps) == null ? void 0 : h.FilePicker) ?? a.FilePicker;
    if (!o) return;
    const l = (d) => {
      n.value = d, n.dispatchEvent(new Event("input", { bubbles: !0 }));
    }, c = o.fromButton ? o.fromButton(i) : new o({ type: "image", current: n.value, callback: l });
    c.callback = l, c.render(!0);
  }
  handleImageDrop(e, i) {
    var o, l;
    e.preventDefault();
    const s = (l = (o = e.dataTransfer) == null ? void 0 : o.getData("text/plain")) == null ? void 0 : l.trim();
    if (!s) return;
    let n = s;
    try {
      const c = JSON.parse(s);
      n = typeof c.path == "string" ? c.path : typeof c.src == "string" ? c.src : "";
    } catch {
    }
    if (!n) return;
    const a = i.querySelector("[data-image-input]");
    a && (a.value = n, a.dispatchEvent(new Event("input", { bubbles: !0 })));
  }
  updateImagePreview(e, i, s) {
    const n = e.querySelector(`[data-image-preview='${i}']`);
    if (!n) return;
    const a = s.trim();
    n.hidden = !a, a ? n.src = V(a) : n.removeAttribute("src"), this.updateImagePresentationPreview(e, i);
  }
  updateImagePresentationPreview(e, i) {
    if (!i) return;
    const s = e.querySelector(`[data-image-preview='${i}']`);
    if (!s) return;
    const n = (a, o) => {
      var l;
      return ((l = e.querySelector(`[name='imagePresentation.${i}.${a}']`)) == null ? void 0 : l.value) ?? o;
    };
    s.style.objectFit = n("fit", "cover") === "contain" ? "contain" : "cover", s.style.objectPosition = `${n("focusX", "50")}% ${n("focusY", "25")}%`, s.style.transform = `scale(${n("zoom", "1")}) rotate(${n("rotation", "0")}deg)`;
  }
  readBonuses(e) {
    return [...e.querySelectorAll("[data-bonus-row]")].flatMap((i) => {
      const s = this.input(i, "bonus.name"), n = this.input(i, "bonus.selector");
      if (!s && !n) return [];
      const a = this.input(i, "bonus.value"), o = Number(a);
      return [{
        id: crypto.randomUUID(),
        name: s,
        selector: n,
        value: a !== "" && Number.isFinite(o) ? o : a,
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
      const n = this.input(i, "ability.description"), a = this.input(i, "ability.usageMax"), o = a === "" ? null : Math.max(0, Number(a)), l = this.resetType(this.input(i, "ability.reset")), c = Math.max(0, Number(this.input(i, "ability.cooldownValue") || 0)), p = Math.max(0, Number(this.input(i, "ability.durationValue") || 0)), u = [...i.querySelectorAll("[data-effect-row]")].map((h) => this.readEffect(h, p));
      return [{
        id: crypto.randomUUID(),
        name: s,
        description: n,
        visibility: this.visibility(this.input(i, "ability.visibility"), "followers"),
        enabled: !0,
        abilityType: this.input(i, "ability.abilityType") === "fortune-wheel" ? "fortune-wheel" : "standard",
        uses: o === null ? void 0 : { max: o, reset: l },
        timing: {
          actionCost: { type: this.actionCost(this.input(i, "ability.actionCost")), actions: Number(this.input(i, "ability.actions") || 0) || void 0 },
          usage: { max: o, period: o === null ? "unlimited" : "reset" },
          reset: { event: l },
          cooldown: c > 0 ? { value: c, unit: this.cooldownUnit(this.input(i, "ability.cooldownUnit")) } : null,
          duration: { value: p, unit: this.durationUnit(this.input(i, "ability.durationUnit")) }
        },
        effects: u.length ? u : [{ type: "message", text: n }]
      }];
    });
  }
  readEffect(e, i) {
    const s = this.input(e, "effect.type"), n = this.input(e, "effect.formula") || "1", a = this.input(e, "effect.selector") || "all", o = this.effectTarget(this.input(e, "effect.target")), l = this.input(e, "effect.aux"), c = this.input(e, "effect.operation");
    return s === "heal" || s === "damage" ? { type: s, formula: n, target: o } : s === "modifier" ? { type: s, selector: a, value: n, modifierType: this.modifierType(this.input(e, "effect.modifierType")), target: o, duration: Math.max(0, Number(this.input(e, "effect.duration") || i)) } : s === "condition" ? { type: s, condition: l || a, target: o, operation: c === "remove" || c === "suppress" ? c : "add", duration: Math.max(0, Number(this.input(e, "effect.duration") || i)) } : s === "roll" ? { type: s, roll: c === "check" || c === "saving-throw" || c === "degree-of-success" ? c : "reroll", selector: a, dc: n, keep: l === "higher" || l === "lower" ? l : "new", target: o } : s === "movement" ? { type: s, mode: c === "teleport" || c === "forced" ? c : "step", distance: n, target: o } : s === "action" ? { type: s, operation: c === "repeat" ? "repeat" : "lose", amount: Math.max(1, Number(n) || 1), target: o } : s === "control" ? { type: s, faction: c === "friendly" || c === "neutral" ? c : "hostile", target: o, save: a, bossImmune: l !== "allow-boss" } : s === "resource" ? { type: s, resource: c === "gold" || c === "item" ? c : "hp", operation: l === "remove" || l === "transfer" ? l : "add", formula: n, target: o, itemUuid: this.input(e, "effect.uuid") || void 0 } : s === "information" ? { type: s, mode: c === "reveal" || c === "truth" ? c : "gm-dialog", text: l || void 0, questions: Math.max(1, Number(n) || 1) } : s === "counter" ? { type: s, key: a, operation: c === "set" || c === "require" ? c : "add", value: n } : s === "choice" ? { type: s, prompt: l || "Choose", options: a.split(",").map((p) => p.trim()).filter(Boolean).map((p) => ({ id: crypto.randomUUID(), label: p, effects: [{ type: "message", text: p }] })) } : s === "random-wheel" ? { type: s, tableId: this.input(e, "effect.uuid") || a, visibility: c === "gm" || c === "user" ? c : "public" } : s === "macro" ? { type: s, command: this.input(e, "effect.code") || l } : { type: "message", text: l || n };
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
    const i = e.getAll("pantheon.selected").map(String).filter(Boolean), s = this.list(e.get("pantheons")), n = this.text(e.get("pantheon.new.name"));
    return n && i.push(this.pantheonId(n)), [.../* @__PURE__ */ new Set([...i, ...s])];
  }
  readPantheons(e) {
    const i = new Set(e.getAll("pantheon.selected").map(String)), s = this.deityService.list().flatMap((a) => a.pantheons ?? []).filter((a) => i.has(a.id)), n = this.text(e.get("pantheon.new.name"));
    return n && s.push({ id: this.pantheonId(n), name: n, color: this.text(e.get("pantheon.new.color")) || "#8f38e8", symbol: this.optional(e.get("pantheon.new.symbol")), order: this.clampNumber(e.get("pantheon.new.order"), 0, 0, 999) }), [...new Map(s.map((a) => [a.id, a])).values()];
  }
  pantheonId(e) {
    return `pantheon-${e.toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  }
  openSystemPicker(e, i) {
    const s = i.dataset.picker ?? "", n = this.pickerChoices(s), a = this.pickerValues(e, s), o = s === "domains" || s === "alternateDomains" || s === "spells" || s === "attributes", l = D(), c = { domains: l.DOMAINS, alternateDomains: l.ALTERNATE_DOMAINS, weapons: l.FAVORED_WEAPON, spells: l.CLERIC_SPELLS, skills: l.TRAINED_SKILL, fonts: l.DIVINE_FONT, sanctifications: l.SANCTIFICATION, attributes: l.DIVINE_ATTRIBUTES, official: l.OFFICIAL_DEITY };
    new ge(c[s] ?? l.PICKER_TITLE ?? "Selection", n, a, o, ({ items: p }) => {
      var h, d;
      const u = p.map((m) => m.value);
      if (s === "weapons")
        this.setValue(e, "favoredWeaponUuid", u[0] ?? ""), this.setValue(e, "favoredWeapon", ((h = p[0]) == null ? void 0 : h.slug) ?? "");
      else if (s === "spells") {
        const m = /* @__PURE__ */ new Map();
        p.forEach((g) => m.set(g.rank ?? 1, g)), this.setValue(e, "spells", [...m.entries()].sort(([g], [I]) => g - I).map(([g, I]) => `${g}=${I.value}`).join(`
`));
      } else {
        const m = { domains: "domains", alternateDomains: "alternateDomains", skills: "skill", fonts: "font", sanctifications: "sanctification", attributes: "divineAttributes", official: "replacement.sourceUuid" }[s];
        m && this.setValue(e, m, o ? u.join(", ") : u[0] ?? "");
      }
      s === "official" && ((d = e.elements.namedItem("replacement.sourceUuid")) == null || d.dispatchEvent(new Event("change", { bubbles: !0 }))), this.refreshPickerControls(e), this.updateWizardPreview(this.element, e);
    }).render(!0);
  }
  pickerChoices(e) {
    return e === "official" ? this.officialChoices : e === "alternateDomains" ? this.systemCatalog.domains : this.systemCatalog[e] ?? [];
  }
  pickerValues(e, i) {
    var a, o;
    if (i === "spells") return Object.values(this.spells(((a = e.elements.namedItem("spells")) == null ? void 0 : a.value) ?? "") ?? {});
    const s = { domains: "domains", alternateDomains: "alternateDomains", weapons: "favoredWeaponUuid", skills: "skill", fonts: "font", sanctifications: "sanctification", attributes: "divineAttributes", official: "replacement.sourceUuid" }[i];
    if (!s) return [];
    const n = ((o = e.elements.namedItem(s)) == null ? void 0 : o.value) ?? "";
    return i === "domains" || i === "alternateDomains" || i === "attributes" ? this.list(n) : n ? [n] : [];
  }
  refreshPickerControls(e) {
    const i = D();
    e.querySelectorAll("[data-picker-control]").forEach((s) => {
      const n = s.dataset.pickerControl ?? "", a = this.pickerChoices(n), o = this.pickerValues(e, n), l = o.flatMap((u) => {
        const h = a.find((d) => d.value === u || n === "weapons" && d.slug === u);
        return h ? [h] : [];
      }), c = s.querySelector("[data-picker-label]");
      c && (c.textContent = l.length ? l.map((u) => u.rank === void 0 || n !== "spells" ? u.label : `${u.rank}: ${u.label}`).join(", ") : o.length ? o.join(", ") : i.PICKER_NONE ?? "—");
      const p = o.length > l.length;
      s.classList.toggle("missing", p), s.title = p ? i.PICKER_MISSING ?? "Saved document is unavailable." : "";
    });
  }
  async generateImageVariants(e, i) {
    var l, c, p, u, h, d;
    const s = ((l = e.elements.namedItem("image")) == null ? void 0 : l.value.trim()) ?? "", n = e.querySelector("[data-variant-status]");
    if (!s) {
      n && (n.textContent = "Bitte zuerst ein Porträt auswählen. / Select a portrait first.");
      return;
    }
    const a = globalThis, o = ((u = (p = (c = a.foundry) == null ? void 0 : c.applications) == null ? void 0 : p.apps) == null ? void 0 : u.FilePicker) ?? a.FilePicker;
    if (!(o != null && o.upload)) {
      n && (n.textContent = "Der Foundry-Dateiupload ist nicht verfügbar. / File upload is unavailable.");
      return;
    }
    i.disabled = !0, n && (n.textContent = "Varianten werden erzeugt … / Creating variants …");
    try {
      try {
        await ((h = o.createDirectory) == null ? void 0 : h.call(o, "data", "darkis-godforge"));
      } catch {
      }
      const m = await this.loadImage(V(s)), g = (((d = e.elements.namedItem("name")) == null ? void 0 : d.value) || s.split("/").pop() || "deity").replace(/\.[^.]+$/, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deity", I = [{ key: "icon", width: 512, height: 512 }, { key: "symbol", width: 1024, height: 1024 }, { key: "banner", width: 1600, height: 600 }], f = [];
      for (const y of I) {
        const E = e.elements.namedItem(`variant.${y.key}`);
        if (!(E != null && E.checked)) continue;
        const S = await this.renderImageVariant(m, y.width, y.height, this.imagePresentationFromForm(e, y.key)), T = new File([S], `${g}-${y.key}.webp`, { type: "image/webp" }), O = await o.upload("data", "darkis-godforge", T, {}, { notify: !1 }), A = O.path ?? O.url ?? `darkis-godforge/${T.name}`, k = e.elements.namedItem(y.key);
        k && (k.value = A, k.dispatchEvent(new Event("input", { bubbles: !0 }))), f.push(y.key);
      }
      n && (n.textContent = f.length ? `✓ ${f.join(", ")}` : "Keine Variante gewählt. / No variant selected.");
    } catch (m) {
      console.error("Darkis GodForge | Could not create image variants.", m), n && (n.textContent = "Bildvarianten konnten nicht erzeugt werden. Prüfe Dateirechte und Browserkonsole.");
    } finally {
      i.disabled = !1;
    }
  }
  loadImage(e) {
    return new Promise((i, s) => {
      const n = new Image();
      n.onload = () => i(n), n.onerror = () => s(new Error("The portrait could not be loaded.")), n.src = e;
    });
  }
  imagePresentationFromForm(e, i) {
    var n;
    const s = (a, o) => {
      var l;
      return this.clampNumber(((l = e.elements.namedItem(`imagePresentation.${i}.${a}`)) == null ? void 0 : l.value) ?? null, o, a === "rotation" ? -180 : a === "zoom" ? 1 : 0, a === "rotation" ? 180 : a === "zoom" ? 3 : 100);
    };
    return { fit: ((n = e.elements.namedItem(`imagePresentation.${i}.fit`)) == null ? void 0 : n.value) === "contain" ? "contain" : "cover", focusX: s("focusX", 50), focusY: s("focusY", 25), zoom: s("zoom", 1), rotation: s("rotation", 0) };
  }
  renderImageVariant(e, i, s, n) {
    const a = document.createElement("canvas");
    a.width = i, a.height = s;
    const o = a.getContext("2d");
    if (!o) return Promise.reject(new Error("Canvas is unavailable."));
    o.clearRect(0, 0, i, s);
    const l = (n.fit === "contain" ? Math.min(i / e.naturalWidth, s / e.naturalHeight) : Math.max(i / e.naturalWidth, s / e.naturalHeight)) * (n.zoom ?? 1);
    return o.translate(i / 2, s / 2), o.rotate((n.rotation ?? 0) * Math.PI / 180), o.scale(l, l), o.drawImage(e, -(n.focusX / 100) * e.naturalWidth, -(n.focusY / 100) * e.naturalHeight), new Promise((c, p) => a.toBlob((u) => u ? c(u) : p(new Error("Image encoding failed.")), "image/webp", 0.9));
  }
  validateFormulaField(e) {
    var s;
    const i = (s = e.parentElement) == null ? void 0 : s.querySelector("[data-formula-status]");
    if (i)
      try {
        ie(e.value.replace(/\b\d+d\d+\b/gi, "1"), { actor: { level: 1 }, target: {} }), i.textContent = "✓", i.dataset.valid = "true";
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
    for (const o of (i == null ? void 0 : i.children) ?? []) {
      if (!(o instanceof HTMLElement)) continue;
      if (o.matches("[data-grant-group]")) {
        s.push(this.readGrantGroup(o));
        continue;
      }
      if (!o.matches("[data-grant-member]")) continue;
      const l = this.input(o, "grant.ref");
      if (!l) continue;
      const c = this.input(o, "grant.overrideName"), p = this.input(o, "grant.overrideDescription"), u = this.input(o, "grant.overrideValue"), h = Number(u), d = c || p || u ? { name: c || void 0, description: p || void 0, value: u ? Number.isFinite(h) ? h : u : void 0 } : void 0;
      s.push({ type: this.input(o, "grant.type") === "bonus" ? "bonus" : "ability", ref: l, overrides: d });
    }
    const n = this.input(e, "grantGroup.mode") === "any" ? "any" : "all", a = Number(this.input(e, "grantGroup.pick") || 1);
    return { id: this.input(e, "grantGroup.id") || crypto.randomUUID(), label: this.input(e, "grantGroup.label"), mode: n, pick: n === "any" ? Math.max(1, a) : void 0, grants: s };
  }
  populateGrantGroup(e, i, s) {
    var c, p, u;
    const n = e.querySelector("template[data-template='grant-group']");
    if (!n || !i) return;
    const a = n.content.cloneNode(!0), o = a.querySelector("[data-grant-group]");
    if (!o) return;
    this.setValue(o, "grantGroup.id", s.id), this.setValue(o, "grantGroup.label", s.label), this.setValue(o, "grantGroup.mode", s.mode), this.setValue(o, "grantGroup.pick", String(s.pick ?? 1));
    const l = o.querySelector(":scope > [data-grant-members]");
    for (const h of s.grants) {
      if ("mode" in h) {
        this.populateGrantGroup(e, l, h);
        continue;
      }
      const d = e.querySelector("template[data-template='grant-member']");
      if (!d || !l) continue;
      const m = d.content.cloneNode(!0), g = m.querySelector("[data-grant-member]");
      g && (this.setValue(g, "grant.type", h.type), this.setValue(g, "grant.ref", h.ref), this.setValue(g, "grant.overrideName", ((c = h.overrides) == null ? void 0 : c.name) ?? ""), this.setValue(g, "grant.overrideDescription", ((p = h.overrides) == null ? void 0 : p.description) ?? ""), this.setValue(g, "grant.overrideValue", ((u = h.overrides) == null ? void 0 : u.value) === void 0 ? "" : String(h.overrides.value)), l.append(m));
    }
    i.append(a);
  }
  input(e, i) {
    var s;
    return (((s = e.querySelector(`[name='${i}']`)) == null ? void 0 : s.value) ?? "").trim();
  }
  setValue(e, i, s) {
    const n = e.querySelector(`[name='${i}']`);
    n && (n.value = s);
  }
  setChecked(e, i, s) {
    const n = e.querySelector(`[name='${i}']`);
    n && (n.checked = s);
  }
  updateStackingWarnings(e) {
    var a;
    if (!e) return;
    const i = [...e.querySelectorAll("[data-bonus-row]")], s = (((a = e.querySelector("[name='skill']")) == null ? void 0 : a.value) ?? "").trim(), n = new Set(i.filter((o) => this.input(o, "bonus.modifierType") === "status").map((o) => this.input(o, "bonus.selector")).filter((o, l, c) => o && c.indexOf(o) !== l));
    for (const o of i) {
      const l = this.input(o, "bonus.selector"), c = o.querySelector("[data-stacking-warning]");
      c && (c.hidden = !n.has(l));
      const p = o.querySelector("[data-skill-overlap]");
      p && (p.hidden = !s || l !== s);
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
  clampNumber(e, i, s, n) {
    const a = Number(e);
    return Number.isFinite(a) ? Math.min(n, Math.max(s, a)) : i;
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
b(ee, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 }, position: { width: 980, height: 760 } }), b(ee, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class Ee extends q() {
  constructor(t, e, i) {
    super(), this.deity = t, this.deityService = e, this.adapters = i;
  }
  async _prepareContext() {
    var t, e, i, s, n, a;
    return w(), { ui: D(), deity: { ...this.deity, image: V(this.deity.image), imageFit: ((e = (t = this.deity.imagePresentation) == null ? void 0 : t.image) == null ? void 0 : e.fit) === "contain" ? "contain" : "cover", imagePosition: `${((s = (i = this.deity.imagePresentation) == null ? void 0 : i.image) == null ? void 0 : s.focusX) ?? 50}% ${((a = (n = this.deity.imagePresentation) == null ? void 0 : n.image) == null ? void 0 : a.focusY) ?? 25}%` } };
  }
  _onRender() {
    var t, e;
    (e = (t = this.element) == null ? void 0 : t.querySelector("[data-action='edit']")) == null || e.addEventListener("click", () => {
      this.deityService && new ee(this.deityService, (i) => {
        this.deity = i, this.render(!0);
      }, this.adapters, this.deity).render(!0);
    });
  }
}
b(Ee, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1200, height: 820 } }), b(Ee, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class ye extends q() {
  constructor(t, e) {
    super(), this.deities = t, this.adapters = e;
  }
  async _prepareContext() {
    var n, a, o;
    w();
    const t = ((a = (n = v()) == null ? void 0 : n.system) == null ? void 0 : a.id) ?? "", e = await (((o = this.adapters.tryGet(t)) == null ? void 0 : o.listOfficialDeities()) ?? Promise.resolve([])), i = this.deities.list().filter((l) => l.kind !== "lore"), s = e.map((l) => {
      const c = i.find((p) => p.replacement.sourceUuid === l.sourceUuid && p.replacement.mode !== "none");
      return { ...l, mappingMode: (c == null ? void 0 : c.replacement.mode) ?? "none", inheritedCount: Object.values((c == null ? void 0 : c.replacement.inherit) ?? {}).filter(Boolean).length, options: i.map((p) => ({ id: p.id, name: p.name, selected: p.id === (c == null ? void 0 : c.id) })) };
    });
    return { ui: D(), rows: s, systemId: t };
  }
  _onRender() {
    var e;
    w();
    const t = (e = this.element) == null ? void 0 : e.querySelector("form");
    t == null || t.querySelectorAll("[data-source-row]").forEach((i) => {
      const s = i.querySelector("[name='replacement.mode']");
      s && (s.value = i.dataset.mode ?? "none");
    }), t == null || t.addEventListener("submit", (i) => {
      var s, n;
      i.preventDefault(), w();
      for (const a of t.querySelectorAll("[data-source-row]")) {
        const o = a.dataset.sourceUuid ?? "", l = ((s = a.querySelector("[name='replacement.deity']")) == null ? void 0 : s.value) ?? "", c = ((n = a.querySelector("[name='replacement.mode']")) == null ? void 0 : n.value) ?? "none", p = c === "hide" || c === "replace" ? c : "none";
        for (const u of this.deities.list().filter((h) => h.replacement.sourceUuid === o && h.id !== l)) this.deities.update(u.id, { replacement: { sourceUuid: "", mode: "none", contexts: [] } });
        if (l) {
          const u = this.deities.get(l);
          this.deities.update(l, { replacement: { ...u == null ? void 0 : u.replacement, sourceUuid: o, mode: p, contexts: ["characterBuilder", "compendium", "actorSheet", "searches", "leveler"] } });
        }
      }
      this.render(!0);
    });
  }
}
b(ye, "DEFAULT_OPTIONS", { id: "darkis-godforge-replacements", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.REPLACEMENTS", resizable: !0 }, position: { width: 1100, height: 760 } }), b(ye, "PARTS", { main: { template: "modules/darkis-godforge/templates/replacement-manager.hbs" } });
class Ie extends q() {
  constructor(e, i, s, n = "transfer") {
    super();
    b(this, "pendingImport");
    b(this, "preview", null);
    b(this, "error", "");
    this.deities = e, this.api = i, this.randomContent = s, this.mode = n;
  }
  async _prepareContext() {
    w();
    const e = this.deities.list();
    return { ui: D(), preview: this.preview, error: this.error, deityCount: e.length, isTransfer: this.mode === "transfer", isMigration: this.mode === "migration", currentSchema: N, pendingMigrations: e.filter((i) => i.schemaVersion < N).length };
  }
  _onRender() {
    var i, s, n;
    w();
    const e = this.element;
    (i = e == null ? void 0 : e.querySelector("[data-action='export']")) == null || i.addEventListener("click", () => this.downloadExport()), (s = e == null ? void 0 : e.querySelector("[data-import-file]")) == null || s.addEventListener("change", (a) => {
      var o;
      return void this.previewFile((o = a.target.files) == null ? void 0 : o[0]);
    }), (n = e == null ? void 0 : e.querySelector("[data-action='apply-import']")) == null || n.addEventListener("click", async () => {
      var a, o, l;
      if (w(), !!this.pendingImport) {
        try {
          const c = this.readRandomContent(this.pendingImport), p = await this.api.importDeities(this.pendingImport);
          c && this.randomContent.replace(c), this.pendingImport = void 0, this.preview = null, this.error = "", (l = (o = (a = L()) == null ? void 0 : a.notifications) == null ? void 0 : o.info) == null || l.call(o, `${p} ${D().IMPORTED}`);
        } catch (c) {
          this.error = c instanceof Error ? c.message : String(c);
        }
        this.render(!0);
      }
    });
  }
  downloadExport() {
    w();
    const e = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot() }, null, 2), i = URL.createObjectURL(new Blob([e], { type: "application/json" })), s = document.createElement("a");
    s.href = i, s.download = `darkis-godforge-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, s.click(), URL.revokeObjectURL(i);
  }
  async previewFile(e) {
    var i, s;
    if (e) {
      try {
        const n = JSON.parse(await e.text()), a = rt(n), o = new Set(this.deities.list().map((c) => c.id));
        this.pendingImport = n;
        const l = this.readRandomContent(n);
        this.preview = { total: a.length, created: a.filter((c) => !o.has(c.id)).length, updated: a.filter((c) => o.has(c.id)).length, tables: ((i = l == null ? void 0 : l.tables) == null ? void 0 : i.length) ?? 0, wheels: ((s = l == null ? void 0 : l.wheels) == null ? void 0 : s.length) ?? 0 }, this.error = "";
      } catch (n) {
        this.pendingImport = void 0, this.preview = null, this.error = n instanceof Error ? n.message : String(n);
      }
      this.render(!0);
    }
  }
  readRandomContent(e) {
    if (!e || typeof e != "object" || !("randomContent" in e)) return null;
    const i = e.randomContent;
    if (!nt(i)) throw new Error("Invalid GodForge random content.");
    return i;
  }
}
b(Ie, "DEFAULT_OPTIONS", { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: !0 }, position: { width: 900, height: 700 } }), b(Ie, "PARTS", { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } });
class be extends q() {
  constructor(e, i = "tables") {
    super();
    b(this, "result", null);
    b(this, "error", "");
    this.randomContent = e, this.mode = i;
  }
  async _prepareContext() {
    w();
    const e = this.randomContent.listTables(), i = D();
    return {
      ui: i,
      tables: e,
      wheels: this.randomContent.listWheels().map((s) => {
        var n;
        return { ...s, tableName: ((n = e.find((a) => a.id === s.tableId)) == null ? void 0 : n.name) ?? "—" };
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
    var i, s, n;
    w();
    const e = this.element;
    (i = e == null ? void 0 : e.querySelector("[data-action='add-entry']")) == null || i.addEventListener("click", () => {
      const a = e.querySelector("[data-template='random-entry']"), o = e.querySelector("[data-entry-list]");
      a && o && o.append(a.content.cloneNode(!0));
    }), e == null || e.addEventListener("click", (a) => {
      var l;
      const o = a.target.closest("[data-action='remove-entry']");
      (l = o == null ? void 0 : o.closest("[data-entry-row]")) == null || l.remove();
    }), (s = e == null ? void 0 : e.querySelector("[data-table-form]")) == null || s.addEventListener("submit", (a) => {
      a.preventDefault(), this.createTable(a.currentTarget);
    }), (n = e == null ? void 0 : e.querySelector("[data-wheel-form]")) == null || n.addEventListener("submit", (a) => {
      a.preventDefault(), this.createWheel(a.currentTarget);
    }), e == null || e.querySelectorAll("[data-test-table]").forEach((a) => a.addEventListener("click", () => this.runAction(() => {
      const o = this.randomContent.drawTable(a.dataset.testTable ?? "", Math.random);
      this.result = o.entry;
    }))), e == null || e.querySelectorAll("[data-test-wheel]").forEach((a) => a.addEventListener("click", () => this.runAction(() => {
      const o = this.randomContent.spinWheel(a.dataset.testWheel ?? "", Math.random).draw;
      this.result = o.entry;
    })));
  }
  createTable(e) {
    w();
    const i = new FormData(e), s = [...e.querySelectorAll("[data-entry-row]")].flatMap((n) => {
      const a = this.input(n, "entry.label");
      return a ? [{ id: crypto.randomUUID(), label: a, weight: Math.max(0, Number(this.input(n, "entry.weight") || 1)), category: this.category(this.input(n, "entry.category")), description: this.input(n, "entry.description") || void 0, visibleToPlayers: !0 }] : [];
    });
    this.runAction(() => {
      this.randomContent.createTable({ name: String(i.get("table.name") ?? "").trim(), formula: String(i.get("table.formula") ?? "1d100").trim(), visibility: this.visibility(i.get("table.visibility")), entries: s });
    });
  }
  createWheel(e) {
    w();
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
      this.error = i instanceof Error ? i.message : String(i), x("Random content action failed.", i), this.render(!0);
    }
  }
}
b(be, "DEFAULT_OPTIONS", { id: "darkis-godforge-random-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.RANDOM_TABLES", resizable: !0 }, position: { width: 1100, height: 800 } }), b(be, "PARTS", { main: { template: "modules/darkis-godforge/templates/random-manager.hbs" } });
class ve extends q() {
  constructor(t, e) {
    super(), this.deities = t, this.api = e;
  }
  async _prepareContext() {
    var i, s;
    w();
    const t = (((s = (i = v()) == null ? void 0 : i.actors) == null ? void 0 : s.contents) ?? []).flatMap((n) => {
      var c;
      const a = n;
      if (a.type && a.type !== "character") return [];
      const o = (c = a.flags) == null ? void 0 : c["darkis-godforge"], l = this.deities.get((o == null ? void 0 : o.deityId) ?? "");
      return [{ id: a.id, name: a.name ?? a.id, deityName: (l == null ? void 0 : l.name) ?? "—", hasDeity: !!l }];
    }), e = this.deities.list().filter((n) => n.kind !== "lore" && n.status !== "archived").map((n) => ({ id: n.id, name: n.name, choiceGroups: n.grantGroups.flatMap((a) => se(a)) }));
    return { ui: D(), actors: t, deities: e };
  }
  _onRender() {
    var s;
    w();
    const t = this.element, e = t == null ? void 0 : t.querySelector("[name='deityId']"), i = () => t == null ? void 0 : t.querySelectorAll("[data-deity-choices]").forEach((n) => {
      n.hidden = n.dataset.deityChoices !== (e == null ? void 0 : e.value);
    });
    e == null || e.addEventListener("change", i), i(), (s = t == null ? void 0 : t.querySelector("form")) == null || s.addEventListener("submit", (n) => {
      var u, h;
      n.preventDefault();
      const a = n.currentTarget, o = new FormData(a), l = (h = (u = v()) == null ? void 0 : u.actors) == null ? void 0 : h.get(String(o.get("actorId") ?? "")), c = String(o.get("deityId") ?? "");
      if (!l || !c) return;
      const p = {};
      t.querySelectorAll(`[data-deity-choices='${Yt(c)}'] input[data-group]:checked`).forEach((d) => {
        var m;
        (p[m = d.dataset.group ?? ""] ?? (p[m] = [])).push(d.value);
      }), this.api.assignDeity(l, c, p).then(() => this.render(!0)).catch((d) => x("Character assignment failed.", d));
    }), t == null || t.querySelectorAll("[data-action='reset-daily-usages']").forEach((n) => n.addEventListener("click", () => {
      var o, l;
      const a = (l = (o = v()) == null ? void 0 : o.actors) == null ? void 0 : l.get(n.dataset.actorId ?? "");
      a && (n.disabled = !0, this.api.resetActorUsages(a, "daily-preparations").then(() => {
        var c, p, u;
        return (u = (p = (c = L()) == null ? void 0 : c.notifications) == null ? void 0 : p.info) == null || u.call(p, D().RESET_DAILY_COMPLETE ?? "Daily-preparation uses were reset."), this.render(!0);
      }).catch((c) => {
        n.disabled = !1, x("Daily usage reset failed.", c);
      }));
    }));
  }
}
b(ve, "DEFAULT_OPTIONS", { id: "darkis-godforge-character-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHARACTERS", resizable: !0 }, position: { width: 900, height: 700 } }), b(ve, "PARTS", { main: { template: "modules/darkis-godforge/templates/character-manager.hbs" } });
function Yt(r) {
  return typeof CSS < "u" ? CSS.escape(r) : r.replace(/["'\\]/g, "\\$&");
}
class te extends q() {
  constructor(e, i = new De(), s = new ot(e, i), n = new at()) {
    super();
    b(this, "searchTerm", "");
    b(this, "sectionFilter", "overview");
    b(this, "searchTimer", null);
    b(this, "keydownRoot", null);
    b(this, "handleRootKeydown", (e) => {
      var i;
      if ((e.ctrlKey || e.metaKey) && e.key.toLocaleLowerCase() === "k") {
        e.preventDefault();
        const s = (i = this.element) == null ? void 0 : i.querySelector("[data-search]");
        s == null || s.focus(), s == null || s.select();
      }
    });
    this.deityService = e, this.adapters = i, this.api = s, this.randomContent = n;
  }
  async _prepareContext() {
    var p, u, h, d, m, g, I, f;
    w();
    const e = D(), i = this.deityService.list().map((y) => {
      var S, T, O, A, k, $;
      const E = Kt(y).filter((X) => X.level === "error").length;
      return {
        ...y,
        image: V(y.image),
        imagePosition: `${((T = (S = y.imagePresentation) == null ? void 0 : S.image) == null ? void 0 : T.focusX) ?? 50}% ${((A = (O = y.imagePresentation) == null ? void 0 : O.image) == null ? void 0 : A.focusY) ?? 25}%`,
        imageFit: (($ = (k = y.imagePresentation) == null ? void 0 : k.image) == null ? void 0 : $.fit) === "contain" ? "contain" : "cover",
        errors: E,
        statusLabel: e[`STATUS_${y.status.toUpperCase()}`] ?? y.status,
        updatedLabel: Jt(y.updatedAt)
      };
    }), s = this.searchTerm.toLocaleLowerCase(), n = i.filter((y) => this.matchesSection(y) && (!s || `${y.name} ${y.title} ${y.domains.join(" ")}`.toLocaleLowerCase().includes(s))), a = ((h = (u = (p = v()) == null ? void 0 : p.actors) == null ? void 0 : u.contents) == null ? void 0 : h.filter(Xt).length) ?? 0, o = v(), l = ((m = (d = o == null ? void 0 : o.modules) == null ? void 0 : d.get("darkis-godforge")) == null ? void 0 : m.version) ?? "—", c = ((g = o == null ? void 0 : o.system) == null ? void 0 : g.id) ?? "—";
    return {
      ui: e,
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
        systemVersion: ((I = o == null ? void 0 : o.system) == null ? void 0 : I.version) ?? "—",
        moduleVersion: l,
        adapter: ((f = this.adapters.tryGet(c)) == null ? void 0 : f.id) ?? "—",
        schema: N
      }
    };
  }
  _onRender() {
    var s, n, a, o, l;
    w();
    const e = this.element;
    if (!e) return;
    e.querySelectorAll("[data-action='create']").forEach((c) => c.addEventListener("click", () => new ee(this.deityService, () => void this.render(!0), this.adapters).render(!0))), e.querySelectorAll("[data-action='codex']").forEach((c) => c.addEventListener("click", () => new B(this.deityService).render(!0))), e.querySelectorAll("[data-action='player-preview']").forEach((c) => c.addEventListener("click", () => new B(this.deityService, void 0, void 0, void 0, void 0, { isGM: !1, selection: !0 }).render(!0))), e.querySelectorAll("[data-section]").forEach((c) => c.addEventListener("click", () => {
      const p = c.dataset.section;
      (p === "overview" || p === "deities" || p === "pantheons" || p === "abilities" || p === "bonuses") && (this.sectionFilter = p, this.render(!0));
    })), (s = e.querySelector("[data-manager='replacements']")) == null || s.addEventListener("click", () => void new ye(this.deityService, this.adapters).render(!0)), e.querySelectorAll("[data-manager='data']").forEach((c) => c.addEventListener("click", () => {
      const p = c.dataset.managerMode === "migration" ? "migration" : "transfer";
      new Ie(this.deityService, this.api, this.randomContent, p).render(!0);
    })), e.querySelectorAll("[data-manager='random']").forEach((c) => c.addEventListener("click", () => {
      const p = c.dataset.managerMode, u = p === "wheels" || p === "test" ? p : "tables";
      new be(this.randomContent, u).render(!0);
    })), (n = e.querySelector("[data-manager='characters']")) == null || n.addEventListener("click", () => void new ve(this.deityService, this.api).render(!0)), (a = e.querySelector("[data-action='toggle-context']")) == null || a.addEventListener("click", () => {
      var c;
      return (c = e.querySelector(".dg-app-shell")) == null ? void 0 : c.classList.toggle("context-open");
    }), (o = e.querySelector("[data-action='settings']")) == null || o.addEventListener("click", () => this.openSettings()), e.querySelectorAll("[data-scroll]").forEach((c) => c.addEventListener("click", () => {
      var p;
      return (p = e.querySelector(`[data-section-target='${c.dataset.scroll ?? ""}']`)) == null ? void 0 : p.scrollIntoView({ behavior: "smooth", block: "start" });
    })), e.querySelectorAll("[data-deity]").forEach((c) => c.addEventListener("click", () => {
      const p = this.deityService.get(c.dataset.deity ?? "");
      p && new Ee(p, this.deityService, this.adapters).render(!0);
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
    var n, a, o, l, c;
    const e = globalThis, i = ((o = (a = (n = e.foundry) == null ? void 0 : n.applications) == null ? void 0 : a.settings) == null ? void 0 : o.SettingsConfig) ?? e.SettingsConfig;
    if (i) {
      new i({ initialCategory: "darkis-godforge" }).render(!0);
      return;
    }
    const s = (c = (l = v()) == null ? void 0 : l.settings) == null ? void 0 : c.sheet;
    s && s.render(!0);
  }
  matchesSection(e) {
    var i;
    return this.sectionFilter === "pantheons" ? !!((i = e.pantheonIds) != null && i.length) : this.sectionFilter === "abilities" ? e.abilities.length > 0 : this.sectionFilter === "bonuses" ? e.passiveBonuses.length > 0 : !0;
  }
}
b(te, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1440, height: 900 } }), b(te, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
function Xt(r) {
  var e;
  const t = (e = r.flags) == null ? void 0 : e["darkis-godforge"];
  return !!(t && typeof t == "object" && "deityId" in t);
}
function Jt(r) {
  const t = new Date(r);
  return Number.isNaN(t.getTime()) ? "—" : new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(t);
}
class Se extends K() {
  constructor(t, e, i, s) {
    super(), this.actor = t, this.api = e, this.socketRouter = i, this.openCodex = s;
  }
  async _prepareContext() {
    const t = this.api.getCharacterWidgetData(this.actor);
    return { ui: D(), actorId: this.actor.id, ...t, deity: t.deity ? { ...t.deity, image: V(t.deity.image) } : null, abilities: t.abilities.map((e) => ({ ...e, remaining: e.uses ? Math.max(0, e.uses.max - e.uses.used) : null, available: !e.uses || e.uses.used < e.uses.max })) };
  }
  _onRender() {
    var e;
    const t = this.element;
    (e = t == null ? void 0 : t.querySelector("[data-action='codex']")) == null || e.addEventListener("click", this.openCodex), t == null || t.querySelectorAll("[data-ability]").forEach((i) => i.addEventListener("click", () => void this.socketRouter.activate({ actorId: this.actor.id, abilityId: i.dataset.ability ?? "", options: {} }).then(() => this.render(!0)).catch((s) => x("Ability activation failed.", s))));
  }
}
b(Se, "DEFAULT_OPTIONS", { id: "darkis-godforge-hub", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.HUB", resizable: !0 }, position: { width: 520, height: 650 } }), b(Se, "PARTS", { main: { template: "modules/darkis-godforge/templates/hub.hbs" } });
class Qt {
  constructor() {
    b(this, "definitions", /* @__PURE__ */ new Map());
    b(this, "persistDefinition");
    b(this, "persistenceQueue", Promise.resolve());
    b(this, "persistenceError", null);
  }
  setPersistence(t) {
    this.persistDefinition = t;
  }
  list() {
    return [...this.definitions.values()];
  }
  get(t) {
    return this.definitions.get(t) ?? null;
  }
  save(t) {
    const e = st(t).definition;
    if (this.definitions.set(e.id, structuredClone(e)), this.persistDefinition) {
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
    const e = (/* @__PURE__ */ new Date()).toISOString(), i = { ...structuredClone(t), id: crypto.randomUUID(), schemaVersion: N, revision: 1, createdAt: e, updatedAt: e, checksum: "pending" };
    return i.checksum = this.checksum(i), this.save(i);
  }
  update(t, e) {
    const i = this.get(t);
    if (!i) throw new Error(`Unknown deity: ${t}`);
    const s = { ...i, ...structuredClone(e), id: t, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return s.checksum = this.checksum(s), this.save(s);
  }
  delete(t) {
    return this.definitions.delete(t);
  }
  checksum(t) {
    const e = JSON.stringify({ ...t, checksum: void 0 });
    let i = 2166136261;
    for (let s = 0; s < e.length; s += 1) i = Math.imul(i ^ e.charCodeAt(s), 16777619);
    return (i >>> 0).toString(16);
  }
}
const ce = "darkis-godforge";
class Zt {
  constructor(t) {
    this.collection = t;
  }
  load() {
    return this.collection.contents.flatMap((t) => {
      var i;
      const e = (i = t.flags) == null ? void 0 : i[ce];
      return e && typeof e == "object" && "deity" in e && Me(e.deity) ? [e.deity] : [];
    });
  }
  async save(t) {
    const e = this.collection.contents.find((a) => {
      var l;
      const o = (l = a.flags) == null ? void 0 : l[ce];
      return o && typeof o == "object" && "deity" in o && Me(o.deity) && o.deity.id === t.id;
    }), i = { [ce]: { schemaVersion: t.schemaVersion, deity: t } };
    if (e)
      return await e.update({ name: t.name, flags: i }), e.uuid;
    const s = ft(this.collection);
    if (!s) throw new Error("Foundry JournalEntry document class is unavailable.");
    const n = await s.create({ name: t.name, flags: i });
    if (!n) throw new Error(`Foundry did not create a journal for deity ${t.id}.`);
    return n.uuid;
  }
}
function ei(r) {
  if (!r || typeof r != "object" || !("registerModule" in r)) return null;
  const e = r.registerModule("darkis-godforge");
  if (!e || typeof e != "object" || !("register" in e) || !("executeAsGM" in e)) return null;
  const i = e;
  return {
    register: (s, n) => i.register(s, async function(a) {
      var l;
      const o = (l = this.socketdata) == null ? void 0 : l.userId;
      if (!o) throw new Error("Socketlib did not provide an authenticated sender.");
      return n(a, o);
    }),
    executeAsGM: (s, n) => i.executeAsGM(s, n)
  };
}
function We(r, t, e) {
  var p;
  const i = r.actor;
  if (!i || !ii(i) || !si(i)) return;
  const s = ti(t), n = (s == null ? void 0 : s.closest(".application, .window-app, .app")) ?? s, a = n == null ? void 0 : n.querySelector(".window-header");
  if (!a) return;
  (p = a.querySelector(".darkis-godforge-sheet-button")) == null || p.remove();
  const o = G("DARKIS_GODFORGE.UI.OPEN_HUB"), l = document.createElement("a");
  l.className = "darkis-godforge-sheet-button header-control", l.title = o, l.setAttribute("aria-label", o), l.setAttribute("role", "button"), l.innerHTML = '<i class="fas fa-hammer" aria-hidden="true"></i>', l.addEventListener("click", (u) => {
    u.preventDefault(), u.stopPropagation(), e(i);
  });
  const c = a.querySelector("button.close, a.close, .header-button.close, [data-action='close']");
  c ? c.before(l) : a.append(l);
}
function ti(r) {
  var i;
  if (r instanceof HTMLElement) return r;
  const t = r, e = (t == null ? void 0 : t[0]) ?? ((i = t == null ? void 0 : t.get) == null ? void 0 : i.call(t, 0));
  return e instanceof HTMLElement ? e : null;
}
function ii(r) {
  var e;
  const t = (e = r.flags) == null ? void 0 : e["darkis-godforge"];
  return !!(t && typeof t == "object" && "deityId" in t);
}
function si(r) {
  var e, i;
  const t = (e = v()) == null ? void 0 : e.user;
  return (t == null ? void 0 : t.isGM) === !0 || ((i = r.testUserPermission) == null ? void 0 : i.call(r, t, "OWNER")) === !0;
}
const R = "darkis-godforge";
function ri(r, t, e) {
  return class extends te {
    constructor() {
      super(r, void 0, t, e);
    }
  };
}
function ni(r, t, e, i, s = () => {
}) {
  if (!r || typeof r != "object" || Array.isArray(r)) return;
  const n = r, a = Math.max(-1, ...Object.values(n).map((o) => o.order ?? -1)) + 1;
  n[R] = {
    name: R,
    title: "DARKIS_GODFORGE.UI.TITLE",
    icon: "fas fa-hammer",
    order: a,
    visible: !0,
    tools: {
      hub: { name: "hub", title: "DARKIS_GODFORGE.UI.OPEN_HUB", icon: "fas fa-star", order: 0, button: !0, visible: !0, onChange: (o, l) => s() },
      codex: { name: "codex", title: "DARKIS_GODFORGE.UI.OPEN_CODEX", icon: "fas fa-book-open", order: 1, button: !0, visible: !0, onChange: (o, l) => e() },
      dashboard: { name: "dashboard", title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", order: 2, button: !0, visible: i, onChange: (o, l) => t() }
    }
  };
}
function ai(r, t, e, i, s, n, a) {
  const o = we();
  o && (o.Hooks.once("init", () => {
    var u, h;
    const l = je("init");
    if (!l) return;
    ze(l, r, e, i, a);
    const c = ((h = (u = l.modules) == null ? void 0 : u.get(R)) == null ? void 0 : h.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], p = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...c.map((d) => [d.lang, d.name])]);
    if (!l.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!l.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try {
        l.settings.registerMenu(R, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: ri(t, r, n), restricted: !0 });
      } catch (d) {
        console.error("Darkis GodForge | Could not register dashboard settings menu.", d);
      }
      try {
        l.settings.register(R, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: p, onChange: (d) => {
          if (typeof d != "string" || d === "auto") return;
          const m = c.find((g) => g.lang === d);
          m != null && m.path && xe(d, `modules/${R}/${m.path}`);
        } });
      } catch (d) {
        console.error("Darkis GodForge | Could not register language setting.", d);
      }
      try {
        l.settings.register(R, "random-content", { scope: "world", config: !1, type: Object, default: { tables: [], wheels: [] } });
      } catch (d) {
        console.error("Darkis GodForge | Could not register random content storage.", d);
      }
    }
    if (!l.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try {
      l.keybindings.register(R, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
        var d, m;
        return ((m = (d = v()) == null ? void 0 : d.user) == null ? void 0 : m.isGM) !== !0 ? !1 : (e(), !0);
      } }), l.keybindings.register(R, "open-hub", { name: "DARKIS_GODFORGE.UI.OPEN_HUB", editable: [{ key: "KeyG" }], restricted: !1, onDown: () => (a == null || a(), !0) }), l.keybindings.register(R, "open-codex", { name: "DARKIS_GODFORGE.UI.OPEN_CODEX", editable: [{ key: "KeyG", modifiers: ["Shift"] }], restricted: !1, onDown: () => (i(), !0) });
    } catch (d) {
      console.error("Darkis GodForge | Could not register keybindings.", d);
    }
  }), o.Hooks.on("getSceneControlButtons", (...l) => {
    var c, p;
    ni(l[0], e, i, ((p = (c = v()) == null ? void 0 : c.user) == null ? void 0 : p.isGM) === !0, () => a == null ? void 0 : a());
  }), o.Hooks.on("renderCharacterSheetPF2e", (l, c) => {
    a && We(l, c, a);
  }), o.Hooks.on("renderActorSheet", (l, c) => {
    a && We(l, c, a);
  }), o.Hooks.on("pf2e.restForTheNight", (l) => {
    var u, h, d, m;
    if (((h = (u = v()) == null ? void 0 : u.system) == null ? void 0 : h.id) !== "pf2e" || !l || typeof l != "object" || !("id" in l)) return;
    const c = l;
    (((m = (d = v()) == null ? void 0 : d.user) == null ? void 0 : m.isGM) === !0 || !s ? r.resetActorUsages(c, "daily-preparations") : s.reset({ actorId: c.id, reset: "daily-preparations" })).catch((g) => console.error("Darkis GodForge | Could not reset daily-preparation usages.", g));
  }), o.Hooks.once("ready", async () => {
    var c, p, u, h, d, m, g, I, f, y;
    const l = je("ready");
    if (l) {
      ze(l, r, e, i, a);
      try {
        const E = (p = (c = l.settings) == null ? void 0 : c.get) == null ? void 0 : p.call(c, R, "language"), S = (d = (h = (u = l.modules) == null ? void 0 : u.get(R)) == null ? void 0 : h.languages) == null ? void 0 : d.find((T) => T.lang === E);
        typeof E == "string" && (S != null && S.path) && await xe(E, `modules/${R}/${S.path}`);
      } catch (E) {
        console.error("Darkis GodForge | Could not load the selected language.", E);
      }
      try {
        if (l.journal) {
          const E = new Zt(l.journal);
          for (const S of E.load()) t.save(S);
          t.setPersistence((S) => E.save(S));
        }
      } catch (E) {
        console.error("Darkis GodForge | Could not load deity journals.", E);
      }
      try {
        if (n) {
          const E = (g = (m = l.settings) == null ? void 0 : m.get) == null ? void 0 : g.call(m, R, "random-content");
          n.load(E && typeof E == "object" ? E : null), (I = l.settings) != null && I.set && n.setPersistence((S) => l.settings.set(R, "random-content", S));
        }
      } catch (E) {
        console.error("Darkis GodForge | Could not load random content.", E);
      }
      try {
        const E = ei((y = (f = l.modules) == null ? void 0 : f.get("socketlib")) == null ? void 0 : y.api);
        E && s && (s.setTransport(E), s.register());
      } catch (E) {
        console.error("Darkis GodForge | Could not initialize socketlib integration.", E);
      }
    }
  }));
}
function je(r) {
  const t = v();
  return t || console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${r}.`), t ?? null;
}
function ze(r, t, e, i, s) {
  var o;
  const n = (o = r.modules) == null ? void 0 : o.get(R);
  if (!n) {
    console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed.");
    return;
  }
  const a = t;
  a.openDashboard = e, a.openCodex = i, s && (a.openHub = s), n.api = a;
}
class oi {
  constructor(t, e, i) {
    b(this, "activations", /* @__PURE__ */ new Map());
    this.api = t, this.authority = e, this.transport = i;
  }
  setTransport(t) {
    this.transport = t;
  }
  register() {
    var t, e, i;
    (t = this.transport) == null || t.register("activateAbility", async (s, n) => this.handleActivation(this.parseRequest(s, n), !1)), (e = this.transport) == null || e.register("assignDeity", async (s, n) => this.handleAssignment(this.parseAssignment(s, n), !1)), (i = this.transport) == null || i.register("resetUsages", async (s, n) => this.handleReset(this.parseReset(s, n), !1));
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
      await this.api.activateAbility(i, t.abilityId, t.options), this.updateStatus(t.activationId, "completed");
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
    if (!e && !this.api.isDeitySelectableByPlayer(t.deityId))
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
  isAuthorizedRequester(t, e, i) {
    return i ? this.authority.isGM && e === this.authority.currentUserId : this.authority.isGMUser(e) ? !1 : this.authority.ownsActor(t, e);
  }
  parseRequest(t, e) {
    if (!t || typeof t != "object" || !this.validId(e)) throw new Error("Invalid socket request.");
    const i = t;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validId(i.abilityId)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: e, abilityId: i.abilityId, options: {} };
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
  parseChoices(t) {
    if (t === void 0) return {};
    if (!t || typeof t != "object" || Array.isArray(t)) throw new Error("Invalid socket request.");
    const e = Object.entries(t);
    if (e.length > 50) throw new Error("Invalid socket request.");
    const i = {};
    for (const [s, n] of e) {
      if (!this.validId(s) || !Array.isArray(n) || n.length > 50 || n.some((a) => !this.validId(a))) throw new Error("Invalid socket request.");
      i[s] = [...new Set(n)];
    }
    return i;
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
const re = new Qt(), ke = new De(), Y = new ot(re, ke), lt = new at();
let Ke = null;
function Ye() {
  if (!Ce()) {
    Ne();
    return;
  }
  Ke ?? (Ke = new te(re, ke, Y, lt)), Ke.render(!0).catch((r) => {
    var t, e, i;
    console.error("Darkis GodForge | Could not open dashboard.", r), (i = (e = (t = L()) == null ? void 0 : t.notifications) == null ? void 0 : e.error) == null || i.call(e, G("DARKIS_GODFORGE.ERROR.DASHBOARD_OPEN"));
  });
}
function ct() {
  new B(re, void 0, Y, Pe, di()).render(!0).catch((t) => {
    var e, i, s;
    console.error("Darkis GodForge | Could not open codex.", t), (s = (i = (e = L()) == null ? void 0 : e.notifications) == null ? void 0 : i.error) == null || s.call(i, G("DARKIS_GODFORGE.ERROR.CODEX_OPEN"));
  });
}
const Xe = /* @__PURE__ */ new Map();
function li(r) {
  hi(r).then((t) => {
    t && ci(t);
  }).catch((t) => {
    var e, i, s;
    console.error("Darkis GodForge | Could not select a character for the follower hub.", t), (s = (i = (e = L()) == null ? void 0 : e.notifications) == null ? void 0 : i.error) == null || s.call(i, G("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
function ci(r) {
  let t = Xe.get(r.id);
  t || (t = new Se(r, Y, Pe, ct), Xe.set(r.id, t)), t.render(!0).catch((e) => {
    var i, s, n;
    console.error("Darkis GodForge | Could not open hub.", e), (n = (s = (i = L()) == null ? void 0 : i.notifications) == null ? void 0 : s.error) == null || n.call(s, G("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
const Je = we(), Pe = new oi(Y, { get currentUserId() {
  var r, t;
  return ((t = (r = v()) == null ? void 0 : r.user) == null ? void 0 : t.id) ?? "unknown";
}, get isGM() {
  var r, t;
  return ((t = (r = v()) == null ? void 0 : r.user) == null ? void 0 : t.isGM) ?? !1;
}, isGMUser: (r) => {
  var t, e, i;
  return ((i = (e = (t = v()) == null ? void 0 : t.users) == null ? void 0 : e.get(r)) == null ? void 0 : i.isGM) === !0;
}, ownsActor: (r, t) => {
  var i, s, n;
  const e = ((s = (i = v()) == null ? void 0 : i.users) == null ? void 0 : s.get(t)) ?? { id: t };
  return ((n = r.testUserPermission) == null ? void 0 : n.call(r, e, "OWNER")) ?? !1;
}, resolveActor: (r) => {
  var t, e;
  return ((e = (t = v()) == null ? void 0 : t.actors) == null ? void 0 : e.get(r)) ?? null;
} });
Je ? (ai(Y, re, Ye, ct, Pe, lt, li), Je.Hooks.once("ready", () => {
  var t, e, i, s, n;
  const r = (e = (t = v()) == null ? void 0 : t.system) == null ? void 0 : e.id;
  r && !ke.supports(r) && ((n = (s = (i = L()) == null ? void 0 : i.notifications) == null ? void 0 : s.warn) == null || n.call(s, G("DARKIS_GODFORGE.ERROR.UNSUPPORTED_SYSTEM").replace("{system}", r)));
})) : typeof document < "u" && Ye();
function di() {
  var e, i, s, n;
  const r = globalThis.canvas, t = ((i = (e = r == null ? void 0 : r.tokens) == null ? void 0 : e.controlled) == null ? void 0 : i.map((a) => a.actor).filter((a) => !!a)) ?? [];
  return t.length === 1 ? t[0] : (n = (s = v()) == null ? void 0 : s.user) == null ? void 0 : n.character;
}
async function hi(r) {
  var p, u, h, d, m, g, I, f, y, E, S, T, O;
  if (r) return r;
  const t = (((u = (p = globalThis.canvas) == null ? void 0 : p.tokens) == null ? void 0 : u.controlled) ?? []).map((A) => A.actor).filter((A) => !!A);
  if (t.length === 1) return t[0];
  const e = (d = (h = v()) == null ? void 0 : h.user) == null ? void 0 : d.character;
  if (e) return e;
  const i = (m = v()) == null ? void 0 : m.user, s = (((I = (g = v()) == null ? void 0 : g.actors) == null ? void 0 : I.contents) ?? []).filter((A) => {
    var k;
    return !!(A && typeof A == "object" && "id" in A && i && ((k = A.testUserPermission) == null ? void 0 : k.call(A, i, "OWNER")) === !0);
  });
  if (s.length === 1) return s[0];
  const n = (E = (y = (f = globalThis.foundry) == null ? void 0 : f.applications) == null ? void 0 : y.api) == null ? void 0 : E.DialogV2, a = "Der Anhänger-Hub zeigt Gottheit, Boni und Wunder eines Charakters.";
  if (!n) {
    (O = (T = (S = L()) == null ? void 0 : S.notifications) == null ? void 0 : T.warn) == null || O.call(T, a);
    return;
  }
  if (!s.length) {
    await n.prompt({ window: { title: "Anhänger-Hub" }, content: `<p>${a}</p><p>Lege einen eigenen Charakter fest oder kontrolliere einen Token.</p>`, rejectClose: !1, ok: { label: "Verstanden" } });
    return;
  }
  const o = s.map((A) => `<option value="${He(A.id)}">${He(A.name ?? A.id)}</option>`).join(""), l = await n.input({ window: { title: "Anhänger-Hub – Charakter auswählen" }, content: `<p>${a}</p><label>Charakter<select name="actorId">${o}</select></label>`, rejectClose: !1, ok: { label: "Anhänger-Hub öffnen" } }), c = typeof (l == null ? void 0 : l.actorId) == "string" ? l.actorId : "";
  return s.find((A) => A.id === c);
}
export {
  te as GodForgeDashboard,
  Y as api,
  re as deityService,
  lt as randomContentService,
  ke as registry,
  Pe as socketRouter
};
