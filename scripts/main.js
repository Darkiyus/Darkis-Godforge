var at = Object.defineProperty;
var ot = (s, e, t) => e in s ? at(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var g = (s, e, t) => ot(s, typeof e != "symbol" ? e + "" : e, t);
function ze(s, e) {
  return {
    name: s.name,
    type: "deity",
    img: s.image,
    system: {
      category: "deity",
      description: { value: s.description },
      sanctification: ct(s.sanctification),
      domains: { primary: [...s.domains], alternate: [...s.alternateDomains ?? []] },
      font: lt(s.font),
      attribute: [...s.divineAttributes ?? []],
      skill: s.skill ? [s.skill] : null,
      weapons: s.favoredWeapon ? [s.favoredWeapon] : [],
      spells: structuredClone(s.spells ?? {}),
      traits: { otherTags: [] }
    },
    flags: { "darkis-godforge": { definitionUuid: e } }
  };
}
function lt(s) {
  if (s === "heal-harm") return ["heal", "harm"];
  const e = (s == null ? void 0 : s.split(",").map((t) => t.trim().toLocaleLowerCase()).filter((t) => t === "harm" || t === "heal")) ?? [];
  return [...new Set(e)];
}
function ct(s) {
  if (s === "holy-unholy") return { modal: "can", what: ["holy", "unholy"] };
  const e = (s == null ? void 0 : s.split(",").map((t) => t.trim().toLocaleLowerCase()).filter((t) => t === "holy" || t === "unholy")) ?? [];
  return e.length ? { modal: "can", what: [...new Set(e)] } : null;
}
function Ie() {
  const s = globalThis, e = typeof Hooks < "u" ? Hooks : s.Hooks;
  return e ? { Hooks: e } : null;
}
function b() {
  const s = globalThis;
  return typeof game < "u" ? game : s.game;
}
function k() {
  const s = globalThis;
  return typeof ui < "u" ? ui : s.ui;
}
function Ce(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
async function be(s) {
  var r, n, a, o, l, c, d, h;
  const t = (((n = (r = b()) == null ? void 0 : r.packs) == null ? void 0 : n.contents) ?? []).filter((u) => {
    var p;
    return u.documentName === "Item" && (!((p = u.metadata) != null && p.system) || u.metadata.system === s);
  }), i = [];
  for (const u of t) {
    const p = await u.getIndex({ fields: ["type", "img", "system.domains", "system.alignment"] });
    for (const m of p) {
      if (m.type !== "deity" || !m._id || !m.name || !u.collection) continue;
      const E = `Compendium.${u.collection}.Item.${m._id}`, S = Array.isArray((a = m.system) == null ? void 0 : a.domains) ? m.system.domains : [...((l = (o = m.system) == null ? void 0 : o.domains) == null ? void 0 : l.primary) ?? [], ...((d = (c = m.system) == null ? void 0 : c.domains) == null ? void 0 : d.alternate) ?? []];
      i.push({ id: E, sourceUuid: E, official: !0, name: m.name, title: m.name, image: m.img, domains: S, alignment: (h = m.system) == null ? void 0 : h.alignment });
    }
  }
  return i;
}
function dt(s) {
  if (s.classId !== "cleric" && s.classId !== "champion") return null;
  const e = s.systemValues;
  return { classId: s.classId, deityId: s.deityId, grants: s.grants, domains: { available: e.domains, alternate: e.alternateDomains, pick: s.classId === "cleric" ? 1 : 0 }, divineAttributes: e.divineAttributes, grantedSpells: e.spells, divineFont: s.classId === "cleric" ? e.font : void 0, favoredWeapon: e.favoredWeapon, trainedSkill: s.classId === "cleric" ? e.skill : void 0, sanctification: e.sanctification, cause: s.classId === "champion" ? e.cause : void 0 };
}
const ie = /* @__PURE__ */ new Map();
function Se(s, e) {
  var n, a;
  const t = `${s}:${((a = (n = b()) == null ? void 0 : n.system) == null ? void 0 : a.version) ?? ""}`, i = ie.get(t);
  if (i) return i;
  const r = ut(s, e).catch((o) => {
    throw ie.delete(t), o;
  });
  return ie.set(t, r), r;
}
async function ut(s, e) {
  var l, c, d, h, u;
  const t = ht(s), r = (((c = (l = b()) == null ? void 0 : l.packs) == null ? void 0 : c.contents) ?? []).filter((p) => {
    var m;
    return p.documentName === "Item" && (!((m = p.metadata) != null && m.system) || p.metadata.system === s);
  }), n = [], a = [];
  for (const p of r) {
    const m = await p.getIndex({ fields: ["type", "img", "system.slug", "system.category", "system.group", "system.traits", "system.level", "system.rank"] });
    for (const E of m) {
      if (!E._id || !E.name || !p.collection || E.type !== "weapon" && E.type !== "spell") continue;
      const S = E.system ?? {}, f = {
        value: `Compendium.${p.collection}.Item.${E._id}`,
        label: E.name,
        slug: re(S.slug) ?? E.name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        img: E.img,
        category: re(S.category),
        group: re(S.group),
        traits: mt(((d = S.traits) == null ? void 0 : d.value) ?? S.traits),
        source: ((h = p.metadata) == null ? void 0 : h.label) ?? p.collection,
        rank: ft(S.rank ?? ((u = S.level) == null ? void 0 : u.value) ?? S.level)
      };
      E.type === "weapon" ? n.push(f) : a.push(f);
    }
  }
  return {
    skills: se(t.skills, e),
    domains: se(t.deityDomains ?? t.domains, []),
    weapons: ke(n),
    spells: ke(a),
    fonts: [C("heal", "Heilen / Heal"), C("harm", "Schaden / Harm"), C("heal-harm", "Heilen oder Schaden / Either"), C("none", "Keine / None")],
    sanctifications: [C("holy", "Heilig / Holy"), C("unholy", "Unheilig / Unholy"), C("holy-unholy", "Heilig oder unheilig / Either"), C("none", "Keine / None")],
    attributes: se(t.abilities ?? t.attributes, ["str", "dex", "con", "int", "wis", "cha"])
  };
}
function ht(s) {
  var i;
  const e = globalThis, t = s === "sfrpg" ? "SFRPG" : "PF2E";
  return ((i = e.CONFIG) == null ? void 0 : i[t]) ?? {};
}
function se(s, e) {
  return !s || typeof s != "object" ? e.map((t) => C(t, Ye(t))) : Object.entries(s).map(([t, i]) => C(t, pt(i, t))).sort((t, i) => t.label.localeCompare(i.label));
}
function pt(s, e) {
  var r, n, a;
  const t = typeof s == "string" ? s : s && typeof s == "object" ? String(s.label ?? s.name ?? e) : e, i = (a = (n = (r = b()) == null ? void 0 : r.i18n) == null ? void 0 : n.localize) == null ? void 0 : a.call(n, t);
  return i && i !== t ? i : t.includes(".") ? Ye(e) : t;
}
function ke(s) {
  return [...new Map(s.map((e) => [e.value, e])).values()].sort((e, t) => e.label.localeCompare(t.label));
}
function C(s, e) {
  return { value: s, label: e };
}
function Ye(s) {
  return s.replaceAll("-", " ").replace(/\b\w/g, (e) => e.toUpperCase());
}
function re(s) {
  if (typeof s == "string") return s;
  if (s && typeof s == "object" && typeof s.value == "string") return String(s.value);
}
function mt(s) {
  return Array.isArray(s) ? s.filter((e) => typeof e == "string") : void 0;
}
function ft(s) {
  const e = Number(s);
  return Number.isFinite(e) ? e : void 0;
}
class gt {
  constructor() {
    g(this, "id", "pf2e");
    g(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy", "intimidation", "medicine", "nature", "occultism", "performance", "religion", "society", "stealth", "survival", "thievery", "perception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(ze(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return be(this.id);
  }
  listSkills() {
    var t, i;
    const e = (i = (t = globalThis.CONFIG) == null ? void 0 : t.PF2E) == null ? void 0 : i.skills;
    return e ? Object.keys(e).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Se(this.id, this.listSkills());
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return dt(e);
  }
}
class yt {
  constructor() {
    g(this, "id", "sfrpg");
    g(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return null;
  }
  async listOfficialDeities() {
    return be(this.id);
  }
  listSkills() {
    var t, i;
    const e = (i = (t = globalThis.CONFIG) == null ? void 0 : t.SFRPG) == null ? void 0 : i.skills;
    return e ? Object.keys(e).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Se(this.id, this.listSkills());
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return null;
  }
}
class Et {
  constructor() {
    g(this, "id", "sf2e");
    g(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(ze(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return be(this.id);
  }
  listSkills() {
    var t, i;
    const e = (i = (t = globalThis.CONFIG) == null ? void 0 : t.PF2E) == null ? void 0 : i.skills;
    return e ? Object.keys(e).sort() : [...this.capabilities.selectors];
  }
  listEditorCatalog() {
    return Se(this.id, this.listSkills());
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class ve {
  constructor() {
    g(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new gt()), this.register(new Et()), this.register(new yt());
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
function $(s, e) {
  return e.isGM ? !0 : s.status === "published" && T(s.visibility.deity, s.id, e);
}
function W(s, e) {
  if (!$(s, e)) return null;
  const t = s.visibility.fields, i = { id: s.id, name: s.name, title: s.title };
  T(t.portrait, s.id, e) && (i.image = s.image), T(t.portrait, s.id, e) && (i.symbol = s.symbol, i.imagePresentation = structuredClone(s.imagePresentation ?? {})), T(t.description, s.id, e) && (i.description = s.description), T(t.quote, s.id, e) && (i.quote = s.quote), T(t.pantheon, s.id, e) && (i.pantheonIds = structuredClone(s.pantheonIds ?? []));
  const r = e.selection === !0 && s.visibility.showMechanicsInSelection === !0;
  return (T(t.domains, s.id, e) || r) && (i.domains = structuredClone(s.domains), i.alternateDomains = structuredClone(s.alternateDomains ?? [])), (T(t.spells, s.id, e) || r) && (i.spells = structuredClone(s.spells ?? {})), (T(t.favoredWeapon, s.id, e) || r) && (i.favoredWeapon = s.favoredWeapon), T(t.edicts, s.id, e) && (i.edicts = structuredClone(s.edicts ?? [])), T(t.anathema, s.id, e) && (i.anathema = structuredClone(s.anathema ?? [])), (T(t.bonuses, s.id, e) || r) && (i.passiveBonuses = s.passiveBonuses.filter((n) => n.enabled !== !1 && T(n.visibility ?? "followers", s.id, e)).map((n) => It(n, r || T(t.numericValues, s.id, e)))), (T(t.abilities, s.id, e) || r) && (i.abilities = s.abilities.filter((n) => n.enabled !== !1 && T(n.visibility ?? "followers", s.id, e)).map((n) => bt(n, r || T(t.numericValues, s.id, e)))), i;
}
function It(s, e) {
  const t = structuredClone(s);
  return e || (t.value = ""), delete t.visible, t;
}
function bt(s, e) {
  const t = structuredClone(s);
  return e || (t.effects = t.effects.filter((i) => i.type === "message"), delete t.timing, delete t.uses, delete t.duration, delete t.actionCost), delete t.condition, t;
}
function St(s) {
  return { id: s.id, name: s.name, title: s.title, image: s.image, domains: s.domains, alignment: s.alignment };
}
function vt(s, e, t, i = { isGM: !0 }) {
  return s.filter((r) => !t.has(r.id) && $(r, i) && (!e.pantheonFilter || r.domains.includes(e.pantheonFilter))).flatMap((r) => {
    if (i.isGM) return [St(r)];
    const n = W(r, i);
    return n ? [{ id: n.id, name: n.name, title: n.title ?? "", image: n.image, domains: n.domains ?? [] }] : [];
  });
}
function z(s, e) {
  var n;
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (s.mode === "all") return s.grants.flatMap((a) => "mode" in a ? z(a, t) : [a.ref]);
  const i = ((n = t.find((a) => a.groupId === s.id)) == null ? void 0 : n.refs) ?? [], r = s.grants.map((a) => "mode" in a ? a.id : a.ref);
  if (!s.pick || i.length !== s.pick || i.some((a) => !r.includes(a))) throw new Error(`Grant group ${s.id} requires ${s.pick ?? 1} valid choice(s).`);
  return i.flatMap((a) => {
    const o = s.grants.find((l) => ("mode" in l ? l.id : l.ref) === a);
    return o && "mode" in o ? z(o, t) : o ? [o.ref] : [];
  });
}
function Ke(s, e) {
  return s.used < s.max;
}
function wt(s, e) {
  if (!Ke(s)) throw new Error("No uses remaining.");
  return { ...s, used: s.used + 1 };
}
function At(s, e) {
  return { ...s, used: 0, lastResetAt: e };
}
const Tt = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, Dt = /^\d+d\d+(?:[+\-]\d+)?$/, Ot = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function Xe(s) {
  const e = s.replace(/\s/g, ""), t = e.match(Tt);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function we(s) {
  const e = s.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], i = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((r) => !/^\d+d\d+$/.test(r))) return !1;
  try {
    return new Qe(Xe(i), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function J(s, e) {
  const t = s.replace(/\s/g, "");
  if (!we(t)) throw new Error("Formula contains an unsupported term.");
  if (Dt.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new Qe(Xe(t), e).parse();
}
async function _t(s, e, t) {
  if (!we(s)) throw new Error("Formula contains an unsupported term.");
  const i = s.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let r = s;
  for (const n of [...new Set(i)]) {
    const a = await t(n);
    if (!Number.isFinite(a)) throw new Error("Dice result is not a finite number.");
    r = r.replace(new RegExp(`\\b${n}\\b`, "g"), String(a));
  }
  return J(r, e);
}
class Qe {
  constructor(e, t) {
    g(this, "position", 0);
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
    if (Ot.has(e)) return this.call(e);
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
function Y(s, e) {
  if (s.type === "fact") return e[s.key] === s.equals;
  if (s.type === "not") return !Y(s.child, e);
  const t = s.children.map((i) => Y(i, e));
  return s.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function Nt(s, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [], rolls: [], movements: [], resources: [], choices: [] };
  if (s.condition && !Y(s.condition, e.conditionFacts ?? {})) return t;
  for (const i of s.effects) await oe(i, e, t);
  return t;
}
async function oe(s, e, t) {
  var i, r;
  if (s.type === "message") {
    t.messages.push(s.text);
    return;
  }
  if (s.type === "branch") {
    const n = Y(s.condition, e.conditionFacts ?? {}) ? s.then : s.otherwise ?? [];
    for (const a of n) await oe(a, e, t);
    return;
  }
  if (s.type === "choice") {
    const n = e.choose ? await e.choose(s.prompt, s.options.map(({ id: o, label: l }) => ({ id: o, label: l }))) : (i = s.options[0]) == null ? void 0 : i.id, a = s.options.find((o) => o.id === n);
    if (a) {
      t.choices.push(a.id);
      for (const o of a.effects) await oe(o, e, t);
    }
    return;
  }
  if (s.type === "macro") {
    if (!e.runMacro) throw new Error("This ability requires GM macro authority.");
    await e.runMacro(s.command);
    return;
  }
  if (s.type === "random-wheel") {
    if (!e.rollTable) throw new Error("This ability requires a linked random table.");
    t.messages.push(await e.rollTable(s.tableId));
    return;
  }
  if (s.type === "information") {
    t.messages.push(s.text ?? `${s.mode}${s.questions ? ` (${s.questions})` : ""}`);
    return;
  }
  if (s.type === "counter") {
    const n = (r = e.actor).counters ?? (r.counters = {}), a = B(s.value, e);
    if (s.operation === "require") {
      if ((n[s.key] ?? 0) < a) throw new Error(`Counter requirement not met: ${s.key}`);
    } else n[s.key] = s.operation === "set" ? a : (n[s.key] ?? 0) + a;
    return;
  }
  if (s.type === "roll") {
    const n = s.dc === void 0 ? void 0 : B(s.dc, e);
    t.rolls.push({ type: s.roll, selector: s.selector, value: n });
    return;
  }
  if (s.type === "movement") {
    const n = B(s.distance, e);
    for (const a of G(s.target, e)) t.movements.push({ targetId: a.id, mode: s.mode, distance: n });
    return;
  }
  if (s.type === "action") {
    for (const n of G(s.target, e))
      s.operation === "lose" && n.actions !== void 0 && (n.actions = Math.max(0, n.actions - s.amount)), t.messages.push(`${n.id}: ${s.operation} ${s.amount} action(s)`);
    return;
  }
  if (s.type === "control") {
    for (const n of G(s.target, e)) n.faction = s.faction;
    return;
  }
  if (s.type === "resource") {
    const n = B(s.formula, e);
    for (const a of G(s.target, e))
      s.resource === "hp" && a.hp !== void 0 && (a.hp = Math.max(0, Math.min(a.maxHp ?? Number.MAX_SAFE_INTEGER, a.hp + (s.operation === "remove" ? -n : n)))), s.resource === "gold" && (a.gold = Math.max(0, (a.gold ?? 0) + (s.operation === "remove" ? -n : n))), s.resource === "item" && s.itemUuid && (a.items ?? (a.items = []), s.operation === "remove" ? a.items = a.items.filter((o) => o !== s.itemUuid) : a.items.push(s.itemUuid)), t.resources.push({ targetId: a.id, resource: s.resource, amount: n });
    return;
  }
  if (s.type === "heal" || s.type === "damage") {
    const n = /\b\d+d\d+\b/.test(s.formula) ? e.rollDice ? await _t(s.formula, e.facts, e.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : J(s.formula, e.facts);
    for (const a of G(s.target, e))
      s.type === "heal" ? (t.healing += n, a.hp !== void 0 && (a.hp = Math.min(a.maxHp ?? Number.MAX_SAFE_INTEGER, a.hp + n))) : (t.damage += n, a.hp !== void 0 && (a.hp = Math.max(0, a.hp - n)));
    return;
  }
  if (s.type === "modifier") {
    const n = B(s.value, e);
    for (const a of G(s.target ?? "self", e)) a.modifiers[s.selector] = n;
    t.appliedModifiers.push(s.selector);
    return;
  }
  if (s.type === "condition")
    for (const n of G(s.target, e))
      s.operation === "remove" ? n.conditions = n.conditions.filter((a) => a !== s.condition) : s.operation === "suppress" ? n.conditions = n.conditions.map((a) => a === s.condition ? `suppressed:${a}` : a) : n.conditions.includes(s.condition) || n.conditions.push(s.condition), t.appliedConditions.push(s.condition);
}
function G(s, e) {
  if (s === "self") return [e.actor];
  if (s === "target") {
    if (!e.target) throw new Error("This ability requires a valid target.");
    return [e.target];
  }
  return s === "allies" ? e.allies ?? [] : s === "enemies" ? e.enemies ?? [] : [...new Map([e.actor, e.target, ...e.allies ?? [], ...e.enemies ?? []].filter((t) => !!t).map((t) => [t.id, t])).values()];
}
function B(s, e) {
  return typeof s == "number" ? s : J(s, e.facts);
}
function Rt(s, e, t = []) {
  if (!e.trim()) throw new Error("Class identifier is required for deity coupling.");
  const i = s.grantGroups.flatMap((r) => z(r, t));
  return { deityId: s.id, classId: e, grants: i, choices: t, systemValues: { domains: s.domains, alternateDomains: s.alternateDomains ?? [], divineAttributes: s.divineAttributes ?? [], spells: s.spells ?? {}, font: s.font, favoredWeapon: s.favoredWeapon, skill: s.skill, sanctification: s.sanctification, cause: s.cause } };
}
function ne(s, e) {
  return !s || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: s.id, name: s.name, title: s.title ?? "", image: s.image }, grants: e.grants, abilities: (s.abilities ?? []).map((t) => {
    var i;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((i = e.usages[t.id]) == null ? void 0 : i.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
const V = {
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
function Je(s) {
  if (!s || typeof s != "object") throw new Error("Invalid deity definition.");
  const e = structuredClone(s), t = typeof e.schemaVersion == "number" ? e.schemaVersion : 0;
  if (t > N) throw new Error(`Unsupported deity schema ${t}.`);
  const i = [], r = e.visibility && typeof e.visibility == "object" ? e.visibility : {}, n = Ct(r, t < 3), a = Lt(e.status, r.players), o = {
    ...e,
    schemaVersion: N,
    revision: Math.max(1, typeof e.revision == "number" ? e.revision : 0) + (t < N ? 1 : 0),
    createdAt: typeof e.createdAt == "string" ? e.createdAt : (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: t < N ? (/* @__PURE__ */ new Date()).toISOString() : String(e.updatedAt ?? (/* @__PURE__ */ new Date()).toISOString()),
    checksum: typeof e.checksum == "string" ? e.checksum : "pending",
    status: a,
    visibility: n,
    passiveBonuses: Array.isArray(e.passiveBonuses) ? e.passiveBonuses.map(Gt) : [],
    abilities: Array.isArray(e.abilities) ? e.abilities.map(Mt) : [],
    grantGroups: Array.isArray(e.grantGroups) ? e.grantGroups : [],
    replacement: kt(e.replacement),
    imagePresentation: Pt(e.imagePresentation),
    domains: Array.isArray(e.domains) ? e.domains : []
  };
  return t < N && i.push(`Legacy definition migrated to schema version ${N}.`), { definition: o, migrated: t < N, warnings: i };
}
function Ct(s, e = !1) {
  if (typeof s.deity == "string" && s.fields && typeof s.fields == "object") {
    const n = s.fields, a = {
      deity: K(s.deity, V.deity),
      fields: Object.fromEntries(Object.entries(V.fields).map(([o, l]) => [o, K(n[o], l)])),
      showMechanicsInSelection: s.showMechanicsInSelection === !0
    };
    return e && (a.fields.domains = "followers", a.fields.spells = "followers", a.fields.favoredWeapon = "followers", a.fields.gmNotes = "gm"), a;
  }
  const t = s.players !== !1, i = s.library === !1 || !t ? "gm" : "public", r = s.characterSheet === !1 ? "gm" : "followers";
  return { ...structuredClone(V), deity: i, fields: { ...structuredClone(V.fields), bonuses: r, abilities: r } };
}
function kt(s) {
  if (!s || typeof s != "object") return { sourceUuid: "", mode: "none", contexts: [] };
  const e = s, t = typeof e.sourceUuid == "string" ? e.sourceUuid.trim() : "", i = e.mode === "hide" ? "hide" : e.mode === "replace" || t ? "replace" : "none";
  return { ...e, sourceUuid: t, mode: i, contexts: Array.isArray(e.contexts) ? e.contexts.filter((r) => typeof r == "string") : [] };
}
function Pt(s) {
  if (!s || typeof s != "object") return;
  const e = {};
  for (const t of ["image", "icon", "symbol", "banner"]) {
    const i = s[t];
    if (!i || typeof i != "object") continue;
    const r = i;
    e[t] = {
      fit: r.fit === "contain" ? "contain" : "cover",
      focusX: Pe(r.focusX, 50),
      focusY: Pe(r.focusY, 25),
      zoom: le(r.zoom, 1, 1, 3),
      rotation: le(r.rotation, 0, -180, 180)
    };
  }
  return e;
}
function Pe(s, e) {
  return le(s, e, 0, 100);
}
function le(s, e, t, i) {
  const r = Number(s);
  return Number.isFinite(r) ? Math.min(i, Math.max(t, r)) : e;
}
function Lt(s, e) {
  return s === "draft" || s === "test" || s === "published" || s === "disabled" || s === "archived" ? s : e === !1 ? "draft" : "published";
}
function Gt(s) {
  if (!s || typeof s != "object") return s;
  const e = s;
  return { ...e, enabled: e.enabled !== !1, visibility: K(e.visibility, e.visible === !1 ? "gm" : "followers") };
}
function Mt(s) {
  if (!s || typeof s != "object") return s;
  const e = s;
  return { ...e, enabled: e.enabled !== !1, visibility: K(e.visibility, "followers") };
}
function K(s, e) {
  return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "trusted" || s === "gm" || s === "hidden-until-selected" ? s : e;
}
function Ut(s, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: N, exportedAt: e, deities: structuredClone(s) };
}
function Ft(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion >= 1 && e.schemaVersion <= N && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function Ze(s) {
  if (!Ft(s)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return s.deities.map((e) => Je(e).definition);
}
function Ae(s, e) {
  const t = s.filter((o) => Number.isFinite(o.weight) && o.weight > 0), i = t.reduce((o, l) => o + l.weight, 0);
  if (!t.length || i <= 0) throw new Error("Random table has no selectable entries.");
  const r = Math.min(Math.max(e(), 0), 0.999999999) * i;
  let n = 0;
  for (const [o, l] of t.entries())
    if (n += l.weight, r < n) return { entry: l, index: o, roll: r };
  return { entry: t[t.length - 1], index: t.length - 1, roll: r };
}
function Vt(s, e) {
  return { status: "resolved", draw: Ae(s, e) };
}
function et(s) {
  if (!s || typeof s != "object") return !1;
  const e = s;
  if (e.tables !== void 0 && !Array.isArray(e.tables) || e.wheels !== void 0 && !Array.isArray(e.wheels)) return !1;
  const t = e.tables ?? [], i = /* @__PURE__ */ new Set();
  for (const n of t) {
    if (!ce(n) || !L(n.id) || i.has(n.id) || !L(n.name) || !L(n.formula) || !Le(n.visibility) || !Array.isArray(n.entries) || !n.entries.length || !n.entries.every(xt)) return !1;
    i.add(n.id);
  }
  const r = /* @__PURE__ */ new Set();
  for (const n of e.wheels ?? []) {
    if (!ce(n) || !L(n.id) || r.has(n.id) || !L(n.name) || !L(n.tableId) || !i.has(n.tableId) || !Le(n.visibility) || !de(n.duration) || !de(n.minimumSpins)) return !1;
    r.add(n.id);
  }
  return !0;
}
class tt {
  constructor() {
    g(this, "tables", /* @__PURE__ */ new Map());
    g(this, "wheels", /* @__PURE__ */ new Map());
    g(this, "persistContent");
  }
  setPersistence(e) {
    this.persistContent = e;
  }
  load(e) {
    const t = e ?? {};
    if (!et(t)) throw new Error("Invalid GodForge random content.");
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
    return Ae(i.entries, t);
  }
  spinWheel(e, t) {
    var r;
    const i = this.wheels.get(e);
    if (!i) throw new Error("Fortune wheel was not found.");
    return Vt(((r = this.tables.get(i.tableId)) == null ? void 0 : r.entries) ?? [], t);
  }
  persist() {
    this.persistContent && this.persistContent(this.snapshot()).catch((e) => console.error("Darkis GodForge | Could not persist random content.", e));
  }
}
function ce(s) {
  return !!s && typeof s == "object";
}
function L(s) {
  return typeof s == "string" && s.trim().length > 0 && s.length <= 1e4;
}
function de(s) {
  return typeof s == "number" && Number.isFinite(s) && s > 0;
}
function Le(s) {
  return s === "public" || s === "selection" || s === "followers" || s === "owner" || s === "gm" || s === "hidden-until-selected";
}
function xt(s) {
  return !ce(s) || !L(s.id) || !L(s.label) || !de(s.weight) || s.description !== void 0 && typeof s.description != "string" ? !1 : s.category === void 0 || s.category === "positive" || s.category === "neutral" || s.category === "negative" || s.category === "catastrophic" || s.category === "jackpot";
}
const Ht = /* @__PURE__ */ JSON.parse(`{"UI":{"TITLE":"Darkis GodForge","TAGLINE":"Custom deities","SUBTITLE":"Create, publish, and connect them directly to characters.","CREATE":"New deity","EDIT":"Edit","EDIT_DEITY":"Edit deity","CODEX":"Divine Codex","HUB":"Follower Hub","ACTIVE_GRANTS":"Active grants","ACTIVATE":"Activate","NO_WONDERS":"This deity grants no activatable wonders.","NO_ASSIGNED_DEITY":"No deity assigned","NO_ASSIGNED_DEITY_HINT":"Choose a deity in the Divine Codex or ask the GM to assign one to this character.","YOUR_DEITY":"Your deity","SELECT_DEITY":"Choose as deity","CHOOSE_AND_SELECT":"Choose options and assign","CHOOSE_GRANTS":"Choose grants","CHOOSE_GRANTS_HINT":"Select the required options for this deity.","PICK_EXACTLY":"Choose exactly {count} option(s).","ASSIGNMENT_FAILED":"The deity could not be assigned.","SELECTION_REQUIRES_GM":"This deity requires grant choices first.","OPEN_CODEX":"Open Divine Codex – available without a selected token","OPEN_HUB":"Open Follower Hub – the character's deity, bonuses, and wonders","SELECT_CHARACTER_FIRST":"The Follower Hub shows a character's deity, bonuses, and wonders. Control a token or choose one of your characters.","MY_DEITIES":"My deities","ENTRIES":"entries","DOMAINS":"Domains","ABILITIES":"Abilities","VISIBILITY":"Visibility","PASSIVE_BONUS":"Passive bonus","PASSIVE_BONUSES":"Passive bonuses","DIVINE_ABILITY":"Divine ability","DIVINE_WONDER":"Divine wonder","DIVINE_WONDERS":"Divine wonders","SEARCH":"Search GodForge …","ALL_DOMAINS":"All domains","NO_RESULTS":"No deities found.","NEW_DEITY":"Create a new deity","NEW_DEITY_HINT":"Define identity, rules, wonders, and visibility.","NAME":"Name","TITLE_FIELD":"Title","DESCRIPTION":"Description","ALIGNMENT":"Alignment","SAVE":"Save deity","CANCEL":"Cancel","OPEN_DASHBOARD":"Open GM dashboard – create and manage deities","NEW_DEITY_PLACEHOLDER":"e.g. Tenebris","TITLE_PLACEHOLDER":"e.g. Goddess of Shadows","DOMAINS_PLACEHOLDER":"Shadows, secrets, deception","QUOTE":"Quote","PORTRAIT":"Portrait","ICON":"Icon","SYMBOL":"Cult symbol","BANNER":"Banner","BROWSE_FILES":"Browse Foundry files","FILE_PATH":"Foundry file path","PANTHEONS":"Pantheons","TAGS":"Tags","FAVORED_WEAPON":"Favored weapon","DIVINE_FONT":"Divine font","TRAINED_SKILL":"Divine skill","SANCTIFICATION":"Sanctification","CHAMPION_CAUSE":"Champion cause","EDICTS":"Edicts","ANATHEMA":"Anathema","COMMA_SEPARATED":"Comma-separated","STATUS":"Publication status","STATUS_DRAFT":"Draft","STATUS_TEST":"Test","STATUS_PUBLISHED":"Published","STATUS_DISABLED":"Disabled","STATUS_ARCHIVED":"Archived","BASIC_DATA":"Basic data","EDITOR_STEPS":"Deity editor steps","REQUIRED_FIELDS":"Required fields","WIZARD_INTRO":"The wizard guides you step by step through creating a game-ready deity.","APPEARANCE":"Appearance","SYSTEM_VALUES":"System values","PREVIEW":"Preview","STEP_BASIC_INTRO":"Give your deity a clear identity. Everything except the name can be added later.","ONLY_NAME_REQUIRED":"Only the name is required","HELP_NAME":"The unique name used for this deity in the codex.","HELP_TITLE":"A short epithet such as “The Faith” or “Lady of Stars”.","HELP_DESCRIPTION":"Summarize the deity's nature, faith, and presence for players.","HELP_QUOTE":"A characteristic saying or guiding phrase.","HELP_PANTHEONS":"Optional pantheons, separated by commas.","HELP_TAGS":"Internal search terms, separated by commas.","STEP_APPEARANCE_INTRO":"Choose how the deity appears on cards, in the codex, and in selection dialogs.","OPTIONAL_STEP_HINT":"All images are optional. Paste Foundry paths, browse for files, or drag files onto the fields.","HELP_PORTRAIT":"Large image for detail views and the Divine Codex.","HELP_ICON":"Small, readable image for lists and buttons.","HELP_SYMBOL":"The cult's sign, seal, or holy symbol.","HELP_BANNER":"Wide background image for presentation areas.","STEP_SYSTEM_INTRO":"Enter the rules Pathfinder 2e or Starfinder 2e needs for this deity.","HELP_DOMAINS":"Thematic domains, separated by commas.","HELP_WEAPON":"The favored weapon of the deity's followers.","HELP_SKILL":"The skill granted by the deity, such as religion.","HELP_FONT":"Divine font such as heal, harm, or both.","HELP_SANCTIFICATION":"Allowed sanctification, such as holy or unholy.","HELP_CAUSE":"Optional champion cause or comparable bond.","HELP_EDICTS":"Actions followers are expected to uphold.","HELP_ANATHEMA":"Actions that violate the faith.","HELP_SPELLS":"Optional granted spells; one rank and UUID per line.","ADVANCED_SYSTEM_VALUES":"Additional system values for advanced users","HELP_ALIGNMENT":"Legacy alignment for older system data.","HELP_ALTERNATE_DOMAINS":"Additional domains outside the primary selection.","HELP_ATTRIBUTES":"Divine attributes, separated by commas.","STEP_BONUSES_INTRO":"Add persistent mechanical benefits. Empty cards are ignored when saving.","STEP_WONDERS_INTRO":"Create activatable abilities with uses, reset events, and effects.","STEP_REPLACEMENT_INTRO":"Choose an official deity as a template or replace it in GodForge selections without changing the system compendium.","HELP_REPLACEMENT_MODE":"None uses the selection only as a template; hide or replace changes GodForge catalogs.","HELP_OFFICIAL_DEITY":"Choose a name from the active system compendium instead of entering a UUID.","EXPERT_OPTIONS":"Expert options","HELP_REPLACEMENT_CONTEXTS":"Limits replacement to specific catalogs. Empty means all contexts.","STEP_VISIBILITY_INTRO":"Control exactly what players see before and after choosing the deity.","HELP_DEITY_VISIBILITY":"Controls who can see the deity at all.","HELP_FIELD_VISIBILITY":"Controls visibility for this individual content field.","HELP_GM_NOTES":"These notes remain visible only to the GM.","PREVIEW_AND_SAVE":"Preview and save","STEP_PREVIEW_INTRO":"Review the key details and choose the publication status.","PREVIEW_EMPTY_DESCRIPTION":"No description entered yet.","HELP_STATUS":"Drafts remain with the GM; published makes the deity normally selectable.","BACK":"Back","NEXT":"Next","SAVE_DRAFT":"Save as draft","HELP_BONUS_NAME":"A clear name for the benefit.","HELP_SELECTOR":"The system value affected by the bonus, such as religion.","HELP_BONUS_VALUE":"A number or supported formula.","HELP_WONDER_NAME":"The visible name of the ability.","HELP_WONDER_DESCRIPTION":"Describe exactly what happens on activation.","HELP_USAGES":"How often the wonder can be used before its next reset.","HELP_RESET":"The event that restores spent uses.","BONUS_EDITOR_HINT":"Create multiple system-native bonuses with conditions and individual visibility.","ABILITY_EDITOR_HINT":"Configure activation, uses, reset, and effect.","GRANT_GROUPS":"Grant groups","GRANT_GROUPS_HINT":"Nest AND/OR groups and override inherited names, descriptions, or values.","ADD_GRANT_GROUP":"Add group","GRANT_GROUP":"Grant group","ADD_GRANT":"Add grant","ADD_SUBGROUP":"Add subgroup","GROUP_MODE":"Relationship","ALL_REQUIRED":"All (AND)","CHOOSE_FROM":"Choice (OR)","PICK_COUNT":"Pick count","GRANT":"Grant","REFERENCE":"Reference ID","OVERRIDE_NAME":"Override name","OVERRIDE_VALUE":"Override value","OVERRIDE_DESCRIPTION":"Override description","ADD_BONUS":"Add bonus","ADD_ABILITY":"Add wonder","REMOVE":"Remove","MOVE_UP":"Move up","MOVE_DOWN":"Move down","DUPLICATE":"Duplicate","STACKING_WARNING":"In PF2e, this status bonus does not stack with another status bonus on the same selector; only the highest value applies.","SELECTOR":"Selector","VALUE":"Value or formula","MODIFIER_TYPE":"Modifier type","MOD_STATUS":"Status bonus","MOD_CIRCUMSTANCE":"Circumstance bonus","MOD_ITEM":"Item bonus","MOD_UNTYPED":"Untyped","APPLIES_TO":"Applies to","CHECKS":"Checks","DCS":"DCs","BOTH":"Checks and DCs","CONDITION":"Condition","OPTIONAL_CONDITION":"Optional, e.g. while in darkness","ACTION_COST":"Action cost","ACTION_AUTOMATIC":"Automatic / no action","ACTION_FREE":"Free action","ACTION_REACTION":"Reaction","ACTIONS":"Actions","ACTION_EXPLORATION":"Exploration activity","ACTION_DOWNTIME":"Downtime activity","ACTION_COUNT":"Number of actions","USAGES":"Uses","RESET":"Reset","RESET_DAILY":"At daily preparations","RESET_TEN_MINUTES":"After a 10-minute rest","RESET_REFOCUS":"After refocusing","RESET_ENCOUNTER":"At encounter end","RESET_SCENE":"On scene change","RESET_CALENDAR_DAY":"Per calendar day","RESET_MANUAL":"GM only","COOLDOWN":"Cooldown","COOLDOWN_UNIT":"Cooldown unit","DURATION":"Duration","DURATION_UNIT":"Duration unit","ROUNDS":"Rounds","MINUTES":"Minutes","HOURS":"Hours","DAYS":"Days","INSTANT":"Instant","ENCOUNTER":"Encounter","SCENE":"Scene","UNTIL_RESET":"Until next reset","EFFECT_TEMPLATE":"Effect template","EFFECT_NARRATIVE":"Narrative effect","EFFECT_HEAL":"Heal","EFFECT_DAMAGE":"Deal damage","EFFECT_BONUS":"Grant bonus","FORMULA_OR_VALUE":"Formula or value","VISIBILITY_HINT":"Hidden fields are never sent to players.","DEITY_VISIBILITY":"Deity visibility","PLAYER_PREVIEW":"Preview as player","GM_NOTES":"Internal GM notes","VIS_PUBLIC":"Public","VIS_SELECTION":"Visible before selection","VIS_FOLLOWERS":"Followers only","VIS_OWNER":"Owner only","VIS_TRUSTED":"Trusted players","VIS_GM":"GM only","VIS_HIDDEN_UNTIL_SELECTED":"Hidden until selected","VIS_FIELD_PORTRAIT":"Portrait","VIS_FIELD_DESCRIPTION":"Description","VIS_FIELD_QUOTE":"Quote","VIS_FIELD_PANTHEON":"Pantheon","VIS_FIELD_BONUSES":"Passive bonuses","VIS_FIELD_ABILITIES":"Divine wonders","VIS_FIELD_NUMERIC_VALUES":"Exact numeric values","VIS_FIELD_DOMAINS":"Domains","VIS_FIELD_SPELLS":"Granted spells","VIS_FIELD_FAVORED_WEAPON":"Favored weapon","VIS_FIELD_EDICTS":"Edicts","VIS_FIELD_ANATHEMA":"Anathema","VIS_FIELD_GM_NOTES":"Internal GM notes","REPLACEMENT":"Official template and replacement","REPLACEMENT_MODE":"Replacement mode","REPLACE_NONE":"No replacement","REPLACE_HIDE":"Hide official deity","REPLACE_SOURCE":"Replace with this deity","SOURCE_UUID":"Source UUID","REPLACEMENT_CONTEXTS":"Affected selection contexts","OVERVIEW":"Overview","DEITIES":"Deities","RANDOM_TABLES":"Random tables","FORTUNE_WHEELS":"Fortune wheels","RANDOM_AND_WHEELS":"Random tables and fortune wheels","RANDOM_MANAGER_HINT":"The result is fixed before the wheel starts spinning.","TEST_LAB_HINT":"Test existing tables and fortune wheels without creating new content.","NEW_RANDOM_TABLE":"New random table","DICE_FORMULA":"Dice formula","RESULT_ENTRIES":"Results","ADD_RESULT":"Add result","SAVE_TABLE":"Save table","NEW_FORTUNE_WHEEL":"New fortune wheel","LINKED_TABLE":"Linked table","ANIMATION_DURATION":"Animation duration in seconds","MINIMUM_SPINS":"Minimum spins","SAVE_WHEEL":"Save wheel","TEST_DRAW":"Test draw","TEST_SPIN":"Test spin","NO_RANDOM_TABLES":"No random tables have been created yet.","NO_FORTUNE_WHEELS":"No fortune wheels have been created yet.","RESULT_TITLE":"Result title","CATEGORY_JACKPOT":"Jackpot","CATEGORY_POSITIVE":"Positive","CATEGORY_NEUTRAL":"Neutral","CATEGORY_NEGATIVE":"Negative","CATEGORY_CATASTROPHIC":"Catastrophic","INTEGRATION":"Integration","REPLACEMENTS":"Replacements","REPLACEMENT_MANAGER_HINT":"Official compendiums are never modified.","OFFICIAL_DEITY":"Official deity","HOMEBREW_REPLACEMENT":"Homebrew replacement","INHERITANCE":"Inheritance","SELECTIVE_INHERITANCE":"Selective via deity definition","INHERITED_VALUES":"inherited values","SPELLS":"Spells","ALTERNATE_DOMAINS":"Alternate domains","DIVINE_ATTRIBUTES":"Divine attributes","CLERIC_SPELLS":"Granted cleric spells","SPELLS_HINT":"One per line: rank=Compendium.package.pack.Item.id","KEEP_EXISTING_ACTORS":"Keep for existing characters","NO_OFFICIAL_DEITIES":"No official deities found","NO_OFFICIAL_DEITIES_HINT":"The active system adapter did not detect a matching deity pack.","CHARACTERS":"Characters","CHARACTER":"Character","CHARACTER_MANAGER_HINT":"Assign a deity and its grants to a character.","ASSIGN_DEITY":"Assign deity","PLAYER_VIEW":"Player view","TOOLS":"Tools","TEST_LAB":"Test lab","IMPORT_EXPORT":"Import / Export","IMPORT_EXPORT_HINT":"Back up or transfer your GodForge data.","DATA_MANAGER_HINT":"Inspect GodForge packages before import and export a portable backup of your definitions.","EXPORT_PACKAGE":"Export GodForge package","EXPORT_HINT":"Exports all deities including visibility, bonuses, wonders, grants, and replacements.","EXPORT":"Export","IMPORT_PACKAGE":"Import GodForge package","IMPORT_HINT":"The file is validated and summarized before any changes are made.","CHOOSE_FILE":"Choose JSON file","IMPORT_INVALID":"Import could not be validated","IMPORT_PREVIEW":"Import preview","NEW_CONTENT":"New content","UPDATED_CONTENT":"Updated content","IMPORT_APPLY_HINT":"Existing IDs are updated and new IDs are added.","APPLY_IMPORT":"Apply validated import","IMPORTED":"GodForge entries imported.","MIGRATIONS":"Migrations","MIGRATION_MANAGER_HINT":"GodForge updates older definitions automatically when they are loaded.","MIGRATION_STATUS":"Migration status","CURRENT_SCHEMA":"Current schema","PENDING_MIGRATIONS":"Pending migrations","MIGRATION_RELOAD_HINT":"Reload the world to update pending definitions.","MIGRATION_COMPLETE":"All deities use the current schema.","AUDIT_LOG":"Audit log","PLANNED":"Planned for a later alpha release","SETTINGS":"Settings","MODULE_OPTIONS":"Module options","ADAPTER":"System adapter","HELP":"Help","QUICK_ACCESS":"Quick access","SYSTEM_STATUS":"System status","RECENTLY_EDITED":"Recently edited","PUBLISHED":"Published","INVALID":"Invalid definitions","ASSIGNED_CHARACTERS":"Assigned characters","RESET_DAILY_USAGES":"Reset daily uses","RESET_DAILY_COMPLETE":"Daily-preparation uses were reset.","MANUAL_RESET_HINT":"If the system event did not fire, the GM can reset daily uses here manually.","EMPTY_TITLE":"No custom deities yet","EMPTY_HINT":"Create a new deity or import a pantheon.","IMPORT":"Import","LARGER_WINDOW":"A larger window is recommended for the full editor.","TYPE":"Type","LAST_CHANGED":"Last changed","SYSTEM":"System","SCHEMA":"Schema","VERSION":"Version","DIAGNOSTICS_OK":"Ready"},"SETTINGS":{"MENU_NAME":"GodForge management","MENU_LABEL":"Open GodForge","MENU_HINT":"Opens the dashboard for creating and managing custom deities.","LANGUAGE":"GodForge language","LANGUAGE_HINT":"Language used by GodForge surfaces.","AUTO":"Automatic"},"ERROR":{"NO_USES":"No uses remaining.","GM_ONLY":"Only the GM may use this GodForge feature.","NO_PERMISSION":"You are not allowed to use this GodForge feature.","DASHBOARD_OPEN":"The dashboard did not open. Details are available in the browser console.","CODEX_OPEN":"The Divine Codex did not open. Reload Foundry and try again.","HUB_OPEN":"The character hub could not be loaded. Check that the character is still available.","UNSUPPORTED_SYSTEM":"Darkis GodForge does not support the active {system} system.","ACTION_FAILED":"That did not work."}}`), Te = {
  DARKIS_GODFORGE: Ht
}, ue = /* @__PURE__ */ new Map([["en", Te]]);
async function Ge(s, e) {
  if (s === "auto" || ue.has(s)) return;
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Unable to load GodForge language ${s}.`);
  ue.set(s, await t.json());
}
function P(s) {
  var n, a, o, l;
  const e = b(), t = (a = (n = e == null ? void 0 : e.settings) == null ? void 0 : n.get) == null ? void 0 : a.call(n, "darkis-godforge", "language");
  if (typeof t == "string" && t !== "auto") {
    const c = Me(ue.get(t), s);
    if (typeof c == "string") return c;
  }
  const i = (l = (o = e == null ? void 0 : e.i18n) == null ? void 0 : o.localize) == null ? void 0 : l.call(o, s);
  if (i && i !== s) return i;
  const r = Me(Te, s);
  return typeof r == "string" ? r : s;
}
function _() {
  return Object.fromEntries(Object.keys(Te.DARKIS_GODFORGE.UI).map((s) => [s, P(`DARKIS_GODFORGE.UI.${s}`)]));
}
function Me(s, e) {
  return e.split(".").reduce((t, i) => t && typeof t == "object" ? t[i] : void 0, s);
}
function v() {
  if (!De())
    throw Oe(), new Error("GodForge: GM only.");
}
function De() {
  var s, e;
  return ((e = (s = b()) == null ? void 0 : s.user) == null ? void 0 : e.isGM) === !0;
}
function Oe() {
  var s, e, t;
  (t = (e = (s = k()) == null ? void 0 : s.notifications) == null ? void 0 : e.warn) == null || t.call(e, P("DARKIS_GODFORGE.ERROR.GM_ONLY"));
}
function M(s = !1) {
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
class it {
  constructor(e, t) {
    g(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  async getSelectableDeities(e) {
    var p, m, E, S;
    const t = this.deities.list(), i = e.systemId ?? ((m = (p = b()) == null ? void 0 : p.system) == null ? void 0 : m.id) ?? "", r = M(!0), n = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter, systemId: i, catalogContext: e.catalogContext, viewer: r }, a = JSON.stringify([t.map((f) => [f.id, f.revision]), n]);
    if (((E = this.catalogCache) == null ? void 0 : E.key) === a) return this.catalogCache.result;
    const o = await (((S = this.adapters.tryGet(i)) == null ? void 0 : S.listOfficialDeities()) ?? Promise.resolve([])), l = e.catalogContext ?? "characterBuilder", c = new Set(t.filter((f) => f.replacement.sourceUuid && (f.replacement.mode === "hide" || f.replacement.mode === "replace") && (!f.replacement.contexts.length || f.replacement.contexts.includes(l))).map((f) => f.replacement.sourceUuid)), d = vt(t, e, /* @__PURE__ */ new Set(), r), h = o.filter((f) => !f.sourceUuid || !c.has(f.sourceUuid)), u = [...d, ...h];
    return this.catalogCache = { key: a, result: u }, u;
  }
  exportDeities(e) {
    return v(), Ut(this.deities.list(), e);
  }
  importDeities(e) {
    v();
    const t = Ze(e);
    for (const i of t) this.deities.save(i);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e) {
    const t = M(!0);
    return Ae(this.deities.list().filter((i) => $(i, t)).map((i) => ({ id: i.id, label: i.name, weight: 1 })), e);
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  isDeitySelectableByPlayer(e) {
    const t = this.deities.get(e);
    return !!(t && $(t, { isGM: !1, selection: !0 }));
  }
  async materializeDeity(e, t, i) {
    v();
    const r = this.deities.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(r, i);
  }
  getDeity(e) {
    const t = this.deities.get(e);
    if (!t) return null;
    const i = M();
    return i.isGM ? t : W(t, i);
  }
  getActorDeity(e) {
    var n;
    this.requireActorOwner(e);
    const t = (n = e.flags) == null ? void 0 : n["darkis-godforge"];
    if (!t || typeof t != "object" || !("deityId" in t) || typeof t.deityId != "string") return null;
    const i = this.deities.get(t.deityId);
    if (!i) return null;
    const r = { ...M(), actorDeityId: t.deityId, ownsActor: !0 };
    return r.isGM ? i : W(i, r);
  }
  getCharacterWidgetData(e) {
    var o;
    this.requireActorOwner(e);
    const t = (o = e.flags) == null ? void 0 : o["darkis-godforge"], i = t && typeof t == "object" && "deityId" in t && "grants" in t && "usages" in t ? t : null, r = i ? this.deities.get(i.deityId) : null;
    if (!r || !i) return ne(null, null);
    const n = M();
    if (n.isGM) return ne(r, i);
    const a = W(r, { ...n, actorDeityId: r.id, ownsActor: !0 });
    return ne(a, { ...i, grants: [] });
  }
  getGrantChoices(e, t) {
    var i;
    return v(), ((i = this.deities.get(e)) == null ? void 0 : i.grantGroups) ?? null;
  }
  getClassGrants(e, t, i = []) {
    v();
    const r = this.deities.get(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return Rt(r, t, i);
  }
  buildClassCoupling(e, t, i, r = []) {
    return this.adapters.get(i).buildClassCoupling(this.getClassGrants(e, t, r));
  }
  async assignDeity(e, t, i = {}) {
    this.requireActorOwner(e);
    const r = this.deities.get(t);
    if (!r || !$(r, M(!0))) throw new Error("Deity is not available for assignment.");
    const n = Object.entries(i).map(([l, c]) => ({ groupId: l, refs: c })), a = r.grantGroups.flatMap((l) => z(l, n)), o = Object.fromEntries(r.abilities.filter((l) => l.uses).map((l) => [l.id, { used: 0, max: l.uses.max, lastResetAt: Date.now(), reset: l.uses.reset }]));
    await e.update({ flags: { "darkis-godforge": { deityId: t, grants: a, usages: o } } }), await this.synchronizeActorDeityItem(e, r);
  }
  async removeDeity(e) {
    this.requireActorOwner(e), e.unsetFlag ? await Promise.all(["deityId", "grants", "usages"].map((t) => e.unsetFlag("darkis-godforge", t))) : await e.update({ flags: { "darkis-godforge": null } }), await this.removeActorDeityItems(e);
  }
  async resetActorUsages(e, t) {
    this.requireActorOwner(e);
    const i = this.readState(e), r = Date.now(), n = Object.fromEntries(Object.entries(i.usages).map(([a, o]) => o.reset === t ? [a, At(o, r)] : [a, o]));
    await e.update({ flags: { "darkis-godforge": { ...i, usages: n } } });
  }
  async activateAbility(e, t, i = {}) {
    v();
    const r = this.readState(e), n = this.deities.get(r.deityId), a = n == null ? void 0 : n.abilities.find((d) => d.id === t);
    if (!a) throw new Error("Ability is not available for this actor.");
    const o = r.usages[t];
    if (o && !Ke(o)) throw new Error("No uses remaining.");
    const l = o ? { ...r.usages, [t]: wt(o) } : r.usages, c = { id: e.id, modifiers: {}, conditions: [] };
    await Nt(a, { actor: c, target: i.target, facts: i.facts ?? { actor: { level: 0 }, target: {} }, rollDice: i.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: l } } });
  }
  getReplacementFor(e) {
    return v(), this.deities.list().find((t) => t.replacement.sourceUuid === e && t.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, t) {
    return v(), this.deities.list().some((i) => i.replacement.sourceUuid === e && i.replacement.mode === "hide" && i.replacement.contexts.includes(t));
  }
  registerAdapter(e) {
    v(), this.adapters.register(e);
  }
  async synchronizeActorDeityItem(e, t) {
    var l, c;
    const i = (c = (l = b()) == null ? void 0 : l.system) == null ? void 0 : c.id, r = i ? this.adapters.tryGet(i) : null;
    if (!r || !e.createEmbeddedDocuments) return;
    const n = this.actorDeityItems(e), a = n[0];
    await r.materialize(t, { createItem: async (d) => {
      if (a != null && a.update)
        return await a.update(d), { uuid: a.uuid ?? `Actor.${e.id}.Item.${a.id}` };
      const [h] = await e.createEmbeddedDocuments("Item", [d]);
      if (!h) throw new Error("The system did not create the deity item.");
      return { uuid: h.uuid ?? `Actor.${e.id}.Item.${h.id}` };
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
function Ue(s) {
  return s.replace(/[&<>\"']/g, (e) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[e] ?? e);
}
function U(s) {
  if (!s) return "icons/svg/eye.svg";
  const e = s.trim();
  return /^(?:javascript|data|vbscript):/i.test(e) || /^\/\//.test(e) || /[\u0000-\u001f]/.test(e) ? "icons/svg/eye.svg" : e;
}
function qt(s) {
  const e = [];
  s.name.trim() || e.push({ level: "error", field: "name", message: "Name is required." }), s.title.trim() || e.push({ level: "warning", field: "title", message: "Title is empty." }), s.description.trim() || e.push({ level: "warning", field: "description", message: "Description is empty." });
  for (const t of s.passiveBonuses)
    (!t.name.trim() || !t.selector.trim()) && e.push({ level: "error", field: `bonus.${t.id}`, message: "Bonus name and selector are required." }), typeof t.value == "string" && !we(t.value) && e.push({ level: "error", field: `bonus.${t.id}.value`, message: "Bonus formula is invalid." });
  for (const t of s.abilities)
    t.name.trim() || e.push({ level: "error", field: `ability.${t.id}`, message: "Ability name is required." }), !t.timing && t.actionCost === void 0 && e.push({ level: "warning", field: `ability.${t.id}.timing`, message: "Ability timing is incomplete." });
  return e;
}
function Z() {
  var i;
  const s = globalThis, e = typeof foundry < "u" ? foundry : s.foundry, t = (i = e == null ? void 0 : e.applications) == null ? void 0 : i.api;
  if (t != null && t.ApplicationV2 && t.HandlebarsApplicationMixin) return t.HandlebarsApplicationMixin(t.ApplicationV2);
  if (Ie()) {
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
function F() {
  const s = Z();
  return class extends s {
    render(e) {
      return De() ? super.render(e) : (Oe(), Promise.resolve(this));
    }
  };
}
function x(s, e) {
  var t, i, r;
  console.error(`Darkis GodForge | ${s}`, e), (r = (i = (t = k()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, P("DARKIS_GODFORGE.ERROR.ACTION_FAILED"));
}
function ee(s, e = []) {
  const t = s.grants.flatMap((r) => {
    if (!("mode" in r)) return [];
    const n = s.mode === "any" ? [...e, { groupId: s.id, optionId: r.id }] : e;
    return ee(r, n);
  });
  if (s.mode !== "any") return t;
  const i = s.grants.map((r) => {
    var n;
    return "mode" in r ? { id: r.id, label: r.label || r.id } : { id: r.ref, label: ((n = r.overrides) == null ? void 0 : n.name) || r.ref };
  });
  return [{ id: s.id, label: s.label || s.id, pick: s.pick ?? 1, options: i, requirements: e }, ...t];
}
function Fe(s) {
  return s.some((e) => ee(e).length > 0);
}
class he extends Z() {
  constructor(t, i, r, n) {
    super();
    g(this, "groups", []);
    g(this, "tokens", /* @__PURE__ */ new Map());
    g(this, "error", "");
    this.deity = t, this.actor = i, this.socketRouter = r, this.onAssigned = n;
  }
  async _prepareContext() {
    this.tokens.clear();
    const t = this.deity.grantGroups.flatMap((n) => ee(n)), i = /* @__PURE__ */ new Map(), r = t.map((n, a) => n.options.map((o, l) => {
      const c = `${a}-${l}-${crypto.randomUUID()}`;
      return this.tokens.set(c, o.id), i.set(`${n.id}\0${o.id}`, c), { token: c, label: o.label };
    }));
    return this.groups = t.map((n, a) => ({
      id: n.id,
      label: n.label,
      pick: n.pick,
      inputType: n.pick === 1 ? "radio" : "checkbox",
      options: r[a] ?? [],
      requirements: n.requirements.flatMap((o) => {
        const l = t.findIndex((d) => d.id === o.groupId), c = i.get(`${o.groupId}\0${o.optionId}`);
        return l >= 0 && c ? [{ name: `choice-${l}`, token: c }] : [];
      })
    })), { ui: _(), deityName: this.deity.name, groups: this.groups, error: this.error };
  }
  _onRender() {
    var i, r, n, a, o, l;
    (r = (i = this.element) == null ? void 0 : i.querySelector("form")) == null || r.addEventListener("submit", (c) => {
      var u;
      c.preventDefault();
      const d = c.currentTarget, h = {};
      for (const [p, m] of this.groups.entries()) {
        if ((u = d.querySelector(`[data-choice-group='${p}']`)) != null && u.hidden) continue;
        const E = [...d.querySelectorAll(`[name='choice-${p}']:checked`)].flatMap((S) => {
          const f = this.tokens.get(S.value);
          return f ? [f] : [];
        });
        if (E.length !== m.pick) {
          this.error = `${m.label}: ${(_().PICK_EXACTLY ?? "Choose exactly {count} option(s).").replace("{count}", String(m.pick))}`, this.render(!0);
          return;
        }
        h[m.id] = E;
      }
      this.socketRouter.assign({ actorId: this.actor.id, deityId: this.deity.id, choices: h }).then(() => {
        var p;
        this.onAssigned(), (p = this.close) == null || p.call(this);
      }).catch((p) => {
        this.error = _().ASSIGNMENT_FAILED ?? "The deity could not be assigned.", x("Grant choice assignment failed.", p), this.render(!0);
      });
    });
    const t = () => {
      var c;
      (c = this.element) == null || c.querySelectorAll("[data-choice-group]").forEach((d) => {
        const u = [...d.querySelectorAll("[data-choice-requirement]")].every((p) => {
          var S, f;
          const m = p.dataset.name ?? "", E = p.dataset.token ?? "";
          return ((f = (S = this.element) == null ? void 0 : S.querySelector(`[name='${m}'][value='${E}']`)) == null ? void 0 : f.checked) === !0;
        });
        d.hidden = !u, d.querySelectorAll("input").forEach((p) => {
          p.disabled = !u, u || (p.checked = !1);
        });
      });
    };
    (a = (n = this.element) == null ? void 0 : n.querySelector("form")) == null || a.addEventListener("change", t), t(), (l = (o = this.element) == null ? void 0 : o.querySelector("[data-action='cancel']")) == null || l.addEventListener("click", () => {
      var c;
      return void ((c = this.close) == null ? void 0 : c.call(this));
    });
  }
}
g(he, "DEFAULT_OPTIONS", { id: "darkis-godforge-grant-choices", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHOOSE_GRANTS", resizable: !0 }, position: { width: 620, height: 680 } }), g(he, "PARTS", { main: { template: "modules/darkis-godforge/templates/grant-choice-dialog.hbs" } });
class H extends Z() {
  constructor(t, i, r, n, a, o) {
    super();
    g(this, "searchTerm", "");
    g(this, "selectedDomain", "");
    this.deityService = t, this.preview = i, this.api = r, this.socketRouter = n, this.actor = a, this.viewerOverride = o;
  }
  async _prepareContext() {
    var d, h, u, p, m, E, S;
    const t = ((d = this.preview) == null ? void 0 : d.viewer) ?? this.viewerOverride ?? M(!0), i = this.preview ? [{ ...this.preview.deity, status: "published" }] : this.deityService.list(), r = (p = (u = (h = this.actor) == null ? void 0 : h.flags) == null ? void 0 : u["darkis-godforge"]) == null ? void 0 : p.deityId, n = (m = b()) == null ? void 0 : m.user, a = !!(this.actor && n && ((S = (E = this.actor).testUserPermission) == null ? void 0 : S.call(E, n, "OWNER")) === !0), o = (f) => {
      var y, I, A, O, R, w;
      return { ...f, image: U(f.image), imageFit: ((I = (y = f.imagePresentation) == null ? void 0 : y.image) == null ? void 0 : I.fit) === "contain" ? "contain" : "cover", imagePosition: `${((O = (A = f.imagePresentation) == null ? void 0 : A.image) == null ? void 0 : O.focusX) ?? 50}% ${((w = (R = f.imagePresentation) == null ? void 0 : R.image) == null ? void 0 : w.focusY) ?? 25}%` };
    }, l = i.flatMap((f) => {
      const y = Fe(f.grantGroups);
      if (t.isGM) return [{ ...o(f), selected: f.id === r, canSelect: !1, requiresChoices: y }];
      const I = W(f, t);
      return I ? [{ ...o(I), selected: f.id === r, canSelect: !!(this.api && this.socketRouter && this.actor && !this.preview && !this.viewerOverride && (t.ownsActor || a)), requiresChoices: y }] : [];
    }), c = l.filter((f) => {
      var y;
      return (!this.searchTerm || `${f.name} ${f.title ?? ""}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || ((y = f.domains) == null ? void 0 : y.includes(this.selectedDomain)));
    });
    return { ui: _(), deities: c, domains: [...new Set(l.flatMap((f) => f.domains ?? []))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain, isGM: t.isGM, isPreview: !!(this.preview || this.viewerOverride) };
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
        if (Fe(a.grantGroups)) {
          new he(a, this.actor, this.socketRouter, () => void this.render(!0)).render(!0);
          return;
        }
        this.socketRouter.assign({ actorId: this.actor.id, deityId: a.id, choices: {} }).then(() => this.render(!0)).catch((o) => x("Deity assignment failed.", o));
      }
    }));
  }
}
g(H, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1e3, height: 760 } }), g(H, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
const Ve = Object.keys(V.fields);
class X extends F() {
  constructor(e, t, i = new ve(), r) {
    super(), this.deityService = e, this.onSaved = t, this.adapters = i, this.existing = r;
  }
  async _prepareContext() {
    var c, d, h;
    v();
    const e = ((d = (c = b()) == null ? void 0 : c.system) == null ? void 0 : d.id) ?? "", t = this.adapters.tryGet(e), i = (t == null ? void 0 : t.listSkills()) ?? [];
    let r = { skills: i.map((u) => ({ value: u, label: u })), domains: [], weapons: [], spells: [], fonts: [], sanctifications: [], attributes: [] }, n = [];
    try {
      n = await ((t == null ? void 0 : t.listOfficialDeities()) ?? Promise.resolve([]));
    } catch (u) {
      console.error("Darkis GodForge | Could not load official deities for the editor.", u);
    }
    try {
      t && (r = await t.listEditorCatalog());
    } catch (u) {
      console.error("Darkis GodForge | Could not load system choices for the editor.", u);
    }
    const a = ((h = this.existing) == null ? void 0 : h.replacement.sourceUuid) ?? "", o = n.map((u) => ({ ...u, selected: u.sourceUuid === a }));
    a && !o.some((u) => u.sourceUuid === a) && o.push({ id: a, sourceUuid: a, official: !0, name: a, title: a, domains: [], selected: !0 });
    const l = _();
    return {
      ui: { ...l, NEW_DEITY: this.existing ? l.EDIT_DEITY : l.NEW_DEITY },
      selectors: i,
      systemCatalog: r,
      pantheonOptions: this.deityService.list().flatMap((u) => u.pantheons ?? []).filter((u, p, m) => m.findIndex((E) => E.id === u.id) === p).map((u) => {
        var p, m;
        return { ...u, selected: ((m = (p = this.existing) == null ? void 0 : p.pantheonIds) == null ? void 0 : m.includes(u.id)) === !0 };
      }),
      officialDeities: o,
      visibilityFields: Ve.map((u) => ({ key: u, label: l[`VIS_FIELD_${u.replace(/([A-Z])/g, "_$1").toUpperCase()}`] ?? u })),
      visibilityOptions: ["public", "selection", "followers", "owner", "trusted", "gm", "hidden-until-selected"].map((u) => ({ value: u, label: l[`VIS_${u.replaceAll("-", "_").toUpperCase()}`] ?? u }))
    };
  }
  _onRender() {
    var r, n, a, o, l;
    v();
    const e = this.element, t = e == null ? void 0 : e.querySelector("form");
    let i = !1;
    e && t && this.existing && this.populateForm(e, t, this.existing), e && t && this.setupWizard(e, t), e == null || e.querySelectorAll("[data-action='browse-image']").forEach((c) => c.addEventListener("click", () => this.openFilePicker(e, c))), e == null || e.querySelectorAll("[data-image-field]").forEach((c) => {
      c.addEventListener("dragover", (d) => {
        d.preventDefault(), d.dataTransfer.dropEffect = "copy";
      }), c.addEventListener("drop", (d) => this.handleImageDrop(d, c));
    }), (r = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || r.addEventListener("click", () => {
      var c;
      i && !globalThis.confirm("Ungespeicherte Änderungen verwerfen? / Discard unsaved changes?") || (c = this.close) == null || c.call(this);
    }), (n = e == null ? void 0 : e.querySelector("[data-action='add-bonus']")) == null || n.addEventListener("click", () => this.appendTemplate(e, "bonus", "[data-bonus-list]")), (a = e == null ? void 0 : e.querySelector("[data-action='add-ability']")) == null || a.addEventListener("click", () => this.appendTemplate(e, "ability", "[data-ability-list]")), (o = e == null ? void 0 : e.querySelector("[data-action='add-grant-group']")) == null || o.addEventListener("click", () => this.appendTemplate(e, "grant-group", "[data-grant-list]")), e == null || e.addEventListener("click", (c) => {
      var u, p, m;
      const d = c.target.closest("[data-action]");
      if (!d) return;
      if (d.dataset.action === "add-catalog-spell" && t) {
        this.addCatalogSpell(t);
        return;
      }
      if (d.dataset.action === "generate-image-variants" && t) {
        this.generateImageVariants(t, d);
        return;
      }
      if (d.dataset.action === "scroll-steps-left" || d.dataset.action === "scroll-steps-right") {
        (u = e.querySelector(".dg-step-strip")) == null || u.scrollBy({ left: d.dataset.action.endsWith("right") ? 260 : -260, behavior: "smooth" });
        return;
      }
      const h = d == null ? void 0 : d.closest(".dg-editor-card");
      h && (d.dataset.action === "add-grant-member" && this.appendTemplate(h, "grant-member", ":scope > [data-grant-members]"), d.dataset.action === "add-subgroup" && this.appendTemplate(h, "grant-group", ":scope > [data-grant-members]"), d.dataset.action === "add-effect" && this.appendTemplate(h, "effect", ":scope > [data-effect-list]"), d.dataset.action === "remove-row" && h.remove(), d.dataset.action === "duplicate-row" && h.after(h.cloneNode(!0)), d.dataset.action === "move-up" && h.previousElementSibling && ((p = h.parentElement) == null || p.insertBefore(h, h.previousElementSibling)), d.dataset.action === "move-down" && h.nextElementSibling && ((m = h.parentElement) == null || m.insertBefore(h.nextElementSibling, h)), this.updateStackingWarnings(e), t && this.updateWizardPreview(e, t));
    }), e == null || e.addEventListener("input", (c) => {
      i = !0, this.updateStackingWarnings(e);
      const d = c.target;
      d.matches("[data-image-input]") && this.updateImagePreview(e, d.name, d.value), d.matches("[data-formula]") && this.validateFormulaField(d), d.matches("[data-catalog-search]") && this.filterCatalog(d), t && this.updateWizardPreview(e, t);
    }), e == null || e.addEventListener("change", (c) => {
      i = !0;
      const d = c.target;
      if (d.name === "replacement.sourceUuid" && t) {
        const h = t.elements.namedItem("replacement.mode");
        h && (h.value = d.value ? "replace" : "none"), d.value && t.querySelectorAll("[name^='replacement.inherit.']").forEach((u) => {
          u.checked = u.name !== "replacement.inherit.edicts" && u.name !== "replacement.inherit.anathema";
        });
      }
      if (d.matches("[data-weapon-picker]") && t) {
        const h = d.selectedOptions[0], u = t.elements.namedItem("favoredWeapon"), p = t.elements.namedItem("favoredWeaponUuid");
        u && (u.value = (h == null ? void 0 : h.dataset.slug) ?? ""), p && (p.value = d.value);
      }
      d.matches("[data-image-setting]") && this.updateImagePresentationPreview(e, d.dataset.imageSetting ?? ""), t && this.updateWizardPreview(e, t);
    }), e == null || e.querySelectorAll("[data-image-input]").forEach((c) => this.updateImagePreview(e, c.name, c.value)), e == null || e.querySelectorAll("[data-action='preview-player']").forEach((c) => c.addEventListener("click", () => {
      const d = t == null ? void 0 : t.elements.namedItem("name");
      if (!t || !(d != null && d.reportValidity())) return;
      const h = this.previewDefinition(t);
      new H(this.deityService, { deity: h, viewer: { isGM: !1, selection: !0 } }).render(!0);
    })), (l = e == null ? void 0 : e.querySelector("[data-action='save-draft']")) == null || l.addEventListener("click", () => {
      const c = t == null ? void 0 : t.elements.namedItem("name");
      !t || !(c != null && c.reportValidity()) || this.saveDefinition(t, !0);
    }), t == null || t.addEventListener("submit", (c) => {
      c.preventDefault(), this.saveDefinition(t, !1);
    });
  }
  setupWizard(e, t) {
    const i = [...e.querySelectorAll("[data-wizard-panel]")], r = [...e.querySelectorAll("[data-wizard-step]")], n = e.querySelector("[data-action='previous-step']"), a = e.querySelector("[data-action='next-step']"), o = e.querySelector("[data-action='finish']"), l = e.querySelector("[data-wizard-current]");
    let c = 0;
    const d = (h) => {
      var u;
      c = Math.max(0, Math.min(i.length - 1, h)), i.forEach((p, m) => {
        p.hidden = m !== c;
      }), r.forEach((p, m) => {
        p.classList.toggle("completed", m < c), m === c ? p.setAttribute("aria-current", "step") : p.removeAttribute("aria-current");
      }), n && (n.disabled = c === 0), a && (a.hidden = c === i.length - 1), o && (o.hidden = c !== i.length - 1), l && (l.textContent = String(c + 1)), (u = r[c]) == null || u.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }), this.updateWizardPreview(e, t);
    };
    r.forEach((h) => h.addEventListener("click", () => d(Number(h.dataset.wizardStep ?? 0)))), n == null || n.addEventListener("click", () => d(c - 1)), a == null || a.addEventListener("click", () => d(c + 1)), d(0);
  }
  updateWizardPreview(e, t) {
    var d, h;
    const i = _(), r = (u) => {
      var p;
      return ((p = t.elements.namedItem(u)) == null ? void 0 : p.value.trim()) ?? "";
    }, n = (u, p) => {
      const m = e.querySelector(u);
      m && (m.textContent = p);
    };
    n("[data-wizard-preview-name]", r("name") || i.NEW_DEITY_PLACEHOLDER || "New deity"), n("[data-wizard-preview-title]", r("title") || "—"), n("[data-wizard-preview-description]", r("description") || i.PREVIEW_EMPTY_DESCRIPTION || "—");
    const a = e.querySelector("[data-wizard-preview-quote]");
    a && (a.textContent = r("quote"), a.hidden = !a.textContent);
    const o = t.elements.namedItem("status");
    n("[data-wizard-preview-status]", ((d = o == null ? void 0 : o.selectedOptions[0]) == null ? void 0 : d.textContent) ?? i.STATUS_DRAFT ?? "Draft");
    const l = t.elements.namedItem("replacement.sourceUuid");
    n("[data-wizard-preview-source]", l != null && l.value ? ((h = l.selectedOptions[0]) == null ? void 0 : h.textContent) ?? l.value : "—"), n("[data-wizard-preview-bonuses]", String(t.querySelectorAll("[data-bonus-row]").length)), n("[data-wizard-preview-abilities]", String(t.querySelectorAll("[data-ability-row]").length));
    const c = e.querySelector("[data-wizard-preview-image]");
    c && (c.src = r("image") ? U(r("image")) : "modules/darkis-godforge/assets/logo.png");
  }
  saveDefinition(e, t) {
    var n;
    v();
    const i = this.readInput(e);
    t && (i.status = "draft");
    const r = this.existing ? this.deityService.update(this.existing.id, i) : this.deityService.create(i);
    this.onSaved(r), (n = this.close) == null || n.call(this);
  }
  appendTemplate(e, t, i) {
    var l, c, d;
    const r = ((l = this.element) == null ? void 0 : l.querySelector(`template[data-template='${t}']`)) ?? (e == null ? void 0 : e.querySelector(`template[data-template='${t}']`)), n = e == null ? void 0 : e.querySelector(i);
    if (!r || !n) return;
    const a = r.content.cloneNode(!0);
    (d = (c = a.querySelector("[name$='.visibility']")) == null ? void 0 : c.querySelector("[value='followers']")) == null || d.setAttribute("selected", "selected"), n.append(a), this.updateStackingWarnings(e);
    const o = e == null ? void 0 : e.querySelector("form");
    e && o && this.updateWizardPreview(e, o);
  }
  previewDefinition(e) {
    const t = (/* @__PURE__ */ new Date()).toISOString();
    return { ...this.readInput(e), id: "preview", schemaVersion: N, revision: 1, createdAt: t, updatedAt: t, checksum: "preview" };
  }
  populateForm(e, t, i) {
    var n, a, o, l, c, d;
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
      favoredWeaponUuid: i.favoredWeaponUuid ?? "",
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
    for (const [h, u] of Object.entries(i.visibility.fields)) r[`visibility.fields.${h}`] = u;
    for (const h of ["image", "icon", "symbol", "banner"]) {
      const u = (n = i.imagePresentation) == null ? void 0 : n[h];
      r[`imagePresentation.${h}.fit`] = (u == null ? void 0 : u.fit) ?? "cover", r[`imagePresentation.${h}.focusX`] = String((u == null ? void 0 : u.focusX) ?? 50), r[`imagePresentation.${h}.focusY`] = String((u == null ? void 0 : u.focusY) ?? 25), r[`imagePresentation.${h}.zoom`] = String((u == null ? void 0 : u.zoom) ?? 1), r[`imagePresentation.${h}.rotation`] = String((u == null ? void 0 : u.rotation) ?? 0);
    }
    for (const [h, u] of Object.entries(r)) this.setValue(t, h, u);
    for (const h of ["domains", "favoredWeapon", "spells", "sanctification", "skill", "font", "divineAttributes", "edicts", "anathema"]) this.setChecked(t, `replacement.inherit.${h}`, ((a = i.replacement.inherit) == null ? void 0 : a[h]) === !0);
    this.setChecked(t, "replacement.keepForExistingActors", i.replacement.keepForExistingActors !== !1), this.setChecked(t, "visibility.showMechanicsInSelection", i.visibility.showMechanicsInSelection === !0);
    for (const h of i.passiveBonuses) {
      this.appendTemplate(e, "bonus", "[data-bonus-list]");
      const u = e.querySelector("[data-bonus-list] [data-bonus-row]:last-child");
      u && (this.setValue(u, "bonus.name", h.name), this.setValue(u, "bonus.selector", h.selector), this.setValue(u, "bonus.value", String(h.value)), this.setValue(u, "bonus.modifierType", h.modifierType), this.setValue(u, "bonus.appliesTo", h.appliesTo ?? "checks"), this.setValue(u, "bonus.condition", h.condition ?? ""), this.setValue(u, "bonus.visibility", h.visibility ?? "followers"));
    }
    for (const h of i.abilities) {
      this.appendTemplate(e, "ability", "[data-ability-list]");
      const u = e.querySelector("[data-ability-list] [data-ability-row]:last-child");
      if (!u) continue;
      const p = h.timing;
      this.setValue(u, "ability.name", h.name), this.setValue(u, "ability.description", h.description), this.setValue(u, "ability.visibility", h.visibility ?? "followers"), this.setValue(u, "ability.abilityType", h.abilityType ?? "standard"), this.setValue(u, "ability.actionCost", (p == null ? void 0 : p.actionCost.type) ?? "actions"), this.setValue(u, "ability.actions", String((p == null ? void 0 : p.actionCost.actions) ?? h.actionCost ?? 1)), this.setValue(u, "ability.usageMax", String((p == null ? void 0 : p.usage.max) ?? ((o = h.uses) == null ? void 0 : o.max) ?? "")), this.setValue(u, "ability.reset", (p == null ? void 0 : p.reset.event) ?? ((l = h.uses) == null ? void 0 : l.reset) ?? "daily-preparations"), this.setValue(u, "ability.cooldownValue", String(((c = p == null ? void 0 : p.cooldown) == null ? void 0 : c.value) ?? 0)), this.setValue(u, "ability.cooldownUnit", ((d = p == null ? void 0 : p.cooldown) == null ? void 0 : d.unit) ?? "rounds"), this.setValue(u, "ability.durationValue", String((p == null ? void 0 : p.duration.value) ?? h.duration ?? 0)), this.setValue(u, "ability.durationUnit", (p == null ? void 0 : p.duration.unit) ?? "instant");
      for (const m of h.effects) this.populateEffect(u, m);
    }
    for (const h of i.grantGroups) this.populateGrantGroup(e, e.querySelector("[data-grant-list]"), h);
    this.updateStackingWarnings(e);
  }
  readInput(e) {
    const t = new FormData(e), i = structuredClone(V);
    i.deity = this.visibility(t.get("visibility.deity"), "public"), i.showMechanicsInSelection = t.has("visibility.showMechanicsInSelection");
    for (const r of Ve) i.fields[r] = this.visibility(t.get(`visibility.fields.${r}`), i.fields[r]);
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
      imagePresentation: this.readImagePresentation(t),
      domains: this.list(t.get("domains")),
      alternateDomains: this.list(t.get("alternateDomains")),
      divineAttributes: this.list(t.get("divineAttributes")),
      spells: this.spells(t.get("spells")),
      pantheonIds: this.readPantheonIds(t),
      pantheons: this.readPantheons(t),
      tags: this.list(t.get("tags")),
      alignment: this.optional(t.get("alignment")),
      favoredWeapon: this.optional(t.get("favoredWeapon")),
      favoredWeaponUuid: this.optional(t.get("favoredWeaponUuid")),
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
      replacement: { sourceUuid: this.text(t.get("replacement.sourceUuid")), mode: this.text(t.get("replacement.sourceUuid")) ? this.replacementMode(t.get("replacement.mode")) === "hide" ? "hide" : "replace" : "none", contexts: this.list(t.get("replacement.contexts")), inherit: { domains: t.has("replacement.inherit.domains"), favoredWeapon: t.has("replacement.inherit.favoredWeapon"), spells: t.has("replacement.inherit.spells"), sanctification: t.has("replacement.inherit.sanctification"), skill: t.has("replacement.inherit.skill"), font: t.has("replacement.inherit.font"), divineAttributes: t.has("replacement.inherit.divineAttributes"), edicts: t.has("replacement.inherit.edicts"), anathema: t.has("replacement.inherit.anathema") }, keepForExistingActors: t.has("replacement.keepForExistingActors") },
      visibility: i
    };
  }
  openFilePicker(e, t) {
    var c, d, h;
    if (!e) return;
    const i = t.dataset.target ?? "", r = e.querySelector(`[name='${i}']`);
    if (!r) return;
    const n = globalThis, a = ((h = (d = (c = n.foundry) == null ? void 0 : c.applications) == null ? void 0 : d.apps) == null ? void 0 : h.FilePicker) ?? n.FilePicker;
    if (!a) return;
    const o = (u) => {
      r.value = u, r.dispatchEvent(new Event("input", { bubbles: !0 }));
    }, l = a.fromButton ? a.fromButton(t) : new a({ type: "image", current: r.value, callback: o });
    l.callback = o, l.render(!0);
  }
  handleImageDrop(e, t) {
    var a, o;
    e.preventDefault();
    const i = (o = (a = e.dataTransfer) == null ? void 0 : a.getData("text/plain")) == null ? void 0 : o.trim();
    if (!i) return;
    let r = i;
    try {
      const l = JSON.parse(i);
      r = typeof l.path == "string" ? l.path : typeof l.src == "string" ? l.src : "";
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
    r.hidden = !n, n ? r.src = U(n) : r.removeAttribute("src"), this.updateImagePresentationPreview(e, t);
  }
  updateImagePresentationPreview(e, t) {
    if (!t) return;
    const i = e.querySelector(`[data-image-preview='${t}']`);
    if (!i) return;
    const r = (n, a) => {
      var o;
      return ((o = e.querySelector(`[name='imagePresentation.${t}.${n}']`)) == null ? void 0 : o.value) ?? a;
    };
    i.style.objectFit = r("fit", "cover") === "contain" ? "contain" : "cover", i.style.objectPosition = `${r("focusX", "50")}% ${r("focusY", "25")}%`, i.style.transform = `scale(${r("zoom", "1")}) rotate(${r("rotation", "0")}deg)`;
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
      const r = this.input(t, "ability.description"), n = this.input(t, "ability.usageMax"), a = n === "" ? null : Math.max(0, Number(n)), o = this.resetType(this.input(t, "ability.reset")), l = Math.max(0, Number(this.input(t, "ability.cooldownValue") || 0)), c = Math.max(0, Number(this.input(t, "ability.durationValue") || 0)), d = [...t.querySelectorAll("[data-effect-row]")].map((h) => this.readEffect(h, c));
      return [{
        id: crypto.randomUUID(),
        name: i,
        description: r,
        visibility: this.visibility(this.input(t, "ability.visibility"), "followers"),
        enabled: !0,
        abilityType: this.input(t, "ability.abilityType") === "fortune-wheel" ? "fortune-wheel" : "standard",
        uses: a === null ? void 0 : { max: a, reset: o },
        timing: {
          actionCost: { type: this.actionCost(this.input(t, "ability.actionCost")), actions: Number(this.input(t, "ability.actions") || 0) || void 0 },
          usage: { max: a, period: a === null ? "unlimited" : "reset" },
          reset: { event: o },
          cooldown: l > 0 ? { value: l, unit: this.cooldownUnit(this.input(t, "ability.cooldownUnit")) } : null,
          duration: { value: c, unit: this.durationUnit(this.input(t, "ability.durationUnit")) }
        },
        effects: d.length ? d : [{ type: "message", text: r }]
      }];
    });
  }
  readEffect(e, t) {
    const i = this.input(e, "effect.type"), r = this.input(e, "effect.formula") || "1", n = this.input(e, "effect.selector") || "all", a = this.effectTarget(this.input(e, "effect.target")), o = this.input(e, "effect.aux"), l = this.input(e, "effect.operation");
    return i === "heal" || i === "damage" ? { type: i, formula: r, target: a } : i === "modifier" ? { type: i, selector: n, value: r, modifierType: this.modifierType(this.input(e, "effect.modifierType")), target: a, duration: Math.max(0, Number(this.input(e, "effect.duration") || t)) } : i === "condition" ? { type: i, condition: o || n, target: a, operation: l === "remove" || l === "suppress" ? l : "add", duration: Math.max(0, Number(this.input(e, "effect.duration") || t)) } : i === "roll" ? { type: i, roll: l === "check" || l === "saving-throw" || l === "degree-of-success" ? l : "reroll", selector: n, dc: r, keep: o === "higher" || o === "lower" ? o : "new", target: a } : i === "movement" ? { type: i, mode: l === "teleport" || l === "forced" ? l : "step", distance: r, target: a } : i === "action" ? { type: i, operation: l === "repeat" ? "repeat" : "lose", amount: Math.max(1, Number(r) || 1), target: a } : i === "control" ? { type: i, faction: l === "friendly" || l === "neutral" ? l : "hostile", target: a, save: n, bossImmune: o !== "allow-boss" } : i === "resource" ? { type: i, resource: l === "gold" || l === "item" ? l : "hp", operation: o === "remove" || o === "transfer" ? o : "add", formula: r, target: a, itemUuid: this.input(e, "effect.uuid") || void 0 } : i === "information" ? { type: i, mode: l === "reveal" || l === "truth" ? l : "gm-dialog", text: o || void 0, questions: Math.max(1, Number(r) || 1) } : i === "counter" ? { type: i, key: n, operation: l === "set" || l === "require" ? l : "add", value: r } : i === "choice" ? { type: i, prompt: o || "Choose", options: n.split(",").map((c) => c.trim()).filter(Boolean).map((c) => ({ id: crypto.randomUUID(), label: c, effects: [{ type: "message", text: c }] })) } : i === "random-wheel" ? { type: i, tableId: this.input(e, "effect.uuid") || n, visibility: l === "gm" || l === "user" ? l : "public" } : i === "macro" ? { type: i, command: this.input(e, "effect.code") || o } : { type: "message", text: o || r };
  }
  populateEffect(e, t) {
    this.appendTemplate(e, "effect", ":scope > [data-effect-list]");
    const i = e.querySelector("[data-effect-list] [data-effect-row]:last-child");
    i && (this.setValue(i, "effect.type", t.type), "target" in t && this.setValue(i, "effect.target", t.target ?? "self"), "formula" in t && this.setValue(i, "effect.formula", String(t.formula)), t.type === "modifier" && (this.setValue(i, "effect.formula", String(t.value)), this.setValue(i, "effect.selector", t.selector), this.setValue(i, "effect.modifierType", t.modifierType), this.setValue(i, "effect.duration", String(t.duration ?? 0))), t.type === "condition" && (this.setValue(i, "effect.aux", t.condition), this.setValue(i, "effect.operation", t.operation ?? "add"), this.setValue(i, "effect.duration", String(t.duration ?? 0))), t.type === "message" && this.setValue(i, "effect.aux", t.text), t.type === "macro" && this.setValue(i, "effect.code", t.command), t.type === "random-wheel" && (this.setValue(i, "effect.uuid", t.tableId), this.setValue(i, "effect.operation", t.visibility)));
  }
  readImagePresentation(e) {
    const t = {};
    for (const i of ["image", "icon", "symbol", "banner"]) t[i] = {
      fit: this.text(e.get(`imagePresentation.${i}.fit`)) === "contain" ? "contain" : "cover",
      focusX: this.clampNumber(e.get(`imagePresentation.${i}.focusX`), 50, 0, 100),
      focusY: this.clampNumber(e.get(`imagePresentation.${i}.focusY`), 25, 0, 100),
      zoom: this.clampNumber(e.get(`imagePresentation.${i}.zoom`), 1, 1, 3),
      rotation: this.clampNumber(e.get(`imagePresentation.${i}.rotation`), 0, -180, 180)
    };
    return t;
  }
  readPantheonIds(e) {
    const t = e.getAll("pantheon.selected").map(String).filter(Boolean), i = this.list(e.get("pantheons")), r = this.text(e.get("pantheon.new.name"));
    return r && t.push(this.pantheonId(r)), [.../* @__PURE__ */ new Set([...t, ...i])];
  }
  readPantheons(e) {
    const t = new Set(e.getAll("pantheon.selected").map(String)), i = this.deityService.list().flatMap((n) => n.pantheons ?? []).filter((n) => t.has(n.id)), r = this.text(e.get("pantheon.new.name"));
    return r && i.push({ id: this.pantheonId(r), name: r, color: this.text(e.get("pantheon.new.color")) || "#8f38e8", symbol: this.optional(e.get("pantheon.new.symbol")), order: this.clampNumber(e.get("pantheon.new.order"), 0, 0, 999) }), [...new Map(i.map((n) => [n.id, n])).values()];
  }
  pantheonId(e) {
    return `pantheon-${e.toLocaleLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  }
  addCatalogSpell(e) {
    const t = e.querySelector("[data-spell-picker]"), i = e.elements.namedItem("spells"), r = t == null ? void 0 : t.selectedOptions[0];
    if (!(t != null && t.value) || !i || !r) return;
    const n = r.dataset.rank ?? "1", a = `${n}=${t.value}`, o = i.value.split(/\r?\n/).filter(Boolean), l = o.findIndex((c) => c.startsWith(`${n}=`));
    l >= 0 ? o[l] = a : o.push(a), i.value = o.join(`
`), i.dispatchEvent(new Event("input", { bubbles: !0 }));
  }
  async generateImageVariants(e, t) {
    var o, l, c, d, h, u;
    const i = ((o = e.elements.namedItem("image")) == null ? void 0 : o.value.trim()) ?? "", r = e.querySelector("[data-variant-status]");
    if (!i) {
      r && (r.textContent = "Bitte zuerst ein Porträt auswählen. / Select a portrait first.");
      return;
    }
    const n = globalThis, a = ((d = (c = (l = n.foundry) == null ? void 0 : l.applications) == null ? void 0 : c.apps) == null ? void 0 : d.FilePicker) ?? n.FilePicker;
    if (!(a != null && a.upload)) {
      r && (r.textContent = "Der Foundry-Dateiupload ist nicht verfügbar. / File upload is unavailable.");
      return;
    }
    t.disabled = !0, r && (r.textContent = "Varianten werden erzeugt … / Creating variants …");
    try {
      try {
        await ((h = a.createDirectory) == null ? void 0 : h.call(a, "data", "darkis-godforge"));
      } catch {
      }
      const p = await this.loadImage(U(i)), m = (((u = e.elements.namedItem("name")) == null ? void 0 : u.value) || i.split("/").pop() || "deity").replace(/\.[^.]+$/, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "deity", E = [{ key: "icon", width: 512, height: 512 }, { key: "symbol", width: 1024, height: 1024 }, { key: "banner", width: 1600, height: 600 }], S = [];
      for (const f of E) {
        const y = e.elements.namedItem(`variant.${f.key}`);
        if (!(y != null && y.checked)) continue;
        const I = await this.renderImageVariant(p, f.width, f.height, this.imagePresentationFromForm(e, f.key)), A = new File([I], `${m}-${f.key}.webp`, { type: "image/webp" }), O = await a.upload("data", "darkis-godforge", A, {}, { notify: !1 }), R = O.path ?? O.url ?? `darkis-godforge/${A.name}`, w = e.elements.namedItem(f.key);
        w && (w.value = R, w.dispatchEvent(new Event("input", { bubbles: !0 }))), S.push(f.key);
      }
      r && (r.textContent = S.length ? `✓ ${S.join(", ")}` : "Keine Variante gewählt. / No variant selected.");
    } catch (p) {
      console.error("Darkis GodForge | Could not create image variants.", p), r && (r.textContent = "Bildvarianten konnten nicht erzeugt werden. Prüfe Dateirechte und Browserkonsole.");
    } finally {
      t.disabled = !1;
    }
  }
  loadImage(e) {
    return new Promise((t, i) => {
      const r = new Image();
      r.onload = () => t(r), r.onerror = () => i(new Error("The portrait could not be loaded.")), r.src = e;
    });
  }
  imagePresentationFromForm(e, t) {
    var r;
    const i = (n, a) => {
      var o;
      return this.clampNumber(((o = e.elements.namedItem(`imagePresentation.${t}.${n}`)) == null ? void 0 : o.value) ?? null, a, n === "rotation" ? -180 : n === "zoom" ? 1 : 0, n === "rotation" ? 180 : n === "zoom" ? 3 : 100);
    };
    return { fit: ((r = e.elements.namedItem(`imagePresentation.${t}.fit`)) == null ? void 0 : r.value) === "contain" ? "contain" : "cover", focusX: i("focusX", 50), focusY: i("focusY", 25), zoom: i("zoom", 1), rotation: i("rotation", 0) };
  }
  renderImageVariant(e, t, i, r) {
    const n = document.createElement("canvas");
    n.width = t, n.height = i;
    const a = n.getContext("2d");
    if (!a) return Promise.reject(new Error("Canvas is unavailable."));
    a.clearRect(0, 0, t, i);
    const o = (r.fit === "contain" ? Math.min(t / e.naturalWidth, i / e.naturalHeight) : Math.max(t / e.naturalWidth, i / e.naturalHeight)) * (r.zoom ?? 1);
    return a.translate(t / 2, i / 2), a.rotate((r.rotation ?? 0) * Math.PI / 180), a.scale(o, o), a.drawImage(e, -(r.focusX / 100) * e.naturalWidth, -(r.focusY / 100) * e.naturalHeight), new Promise((l, c) => n.toBlob((d) => d ? l(d) : c(new Error("Image encoding failed.")), "image/webp", 0.9));
  }
  validateFormulaField(e) {
    var i;
    const t = (i = e.parentElement) == null ? void 0 : i.querySelector("[data-formula-status]");
    if (t)
      try {
        J(e.value.replace(/\b\d+d\d+\b/gi, "1"), { actor: { level: 1 }, target: {} }), t.textContent = "✓", t.dataset.valid = "true";
      } catch {
        t.textContent = "!", t.dataset.valid = "false";
      }
  }
  filterCatalog(e) {
    var r, n;
    const t = (r = this.element) == null ? void 0 : r.querySelector(`[data-catalog='${e.dataset.catalogSearch ?? ""}']`);
    if (!t) return;
    const i = e.value.toLocaleLowerCase();
    for (const a of t.options) a.hidden = !!i && !((n = a.textContent) != null && n.toLocaleLowerCase().includes(i));
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
      const l = this.input(a, "grant.overrideName"), c = this.input(a, "grant.overrideDescription"), d = this.input(a, "grant.overrideValue"), h = Number(d), u = l || c || d ? { name: l || void 0, description: c || void 0, value: d ? Number.isFinite(h) ? h : d : void 0 } : void 0;
      i.push({ type: this.input(a, "grant.type") === "bonus" ? "bonus" : "ability", ref: o, overrides: u });
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
    for (const h of i.grants) {
      if ("mode" in h) {
        this.populateGrantGroup(e, o, h);
        continue;
      }
      const u = e.querySelector("template[data-template='grant-member']");
      if (!u || !o) continue;
      const p = u.content.cloneNode(!0), m = p.querySelector("[data-grant-member]");
      m && (this.setValue(m, "grant.type", h.type), this.setValue(m, "grant.ref", h.ref), this.setValue(m, "grant.overrideName", ((l = h.overrides) == null ? void 0 : l.name) ?? ""), this.setValue(m, "grant.overrideDescription", ((c = h.overrides) == null ? void 0 : c.description) ?? ""), this.setValue(m, "grant.overrideValue", ((d = h.overrides) == null ? void 0 : d.value) === void 0 ? "" : String(h.overrides.value)), o.append(p));
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
    var n;
    if (!e) return;
    const t = [...e.querySelectorAll("[data-bonus-row]")], i = (((n = e.querySelector("[name='skill']")) == null ? void 0 : n.value) ?? "").trim(), r = new Set(t.filter((a) => this.input(a, "bonus.modifierType") === "status").map((a) => this.input(a, "bonus.selector")).filter((a, o, l) => a && l.indexOf(a) !== o));
    for (const a of t) {
      const o = this.input(a, "bonus.selector"), l = a.querySelector("[data-stacking-warning]");
      l && (l.hidden = !r.has(o));
      const c = a.querySelector("[data-skill-overlap]");
      c && (c.hidden = !i || o !== i);
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
  effectTarget(e) {
    return e === "target" || e === "allies" || e === "enemies" || e === "group" ? e : "self";
  }
  clampNumber(e, t, i, r) {
    const n = Number(e);
    return Number.isFinite(n) ? Math.min(r, Math.max(i, n)) : t;
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
g(X, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 }, position: { width: 980, height: 760 } }), g(X, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class pe extends F() {
  constructor(e, t, i) {
    super(), this.deity = e, this.deityService = t, this.adapters = i;
  }
  async _prepareContext() {
    var e, t, i, r, n, a;
    return v(), { ui: _(), deity: { ...this.deity, image: U(this.deity.image), imageFit: ((t = (e = this.deity.imagePresentation) == null ? void 0 : e.image) == null ? void 0 : t.fit) === "contain" ? "contain" : "cover", imagePosition: `${((r = (i = this.deity.imagePresentation) == null ? void 0 : i.image) == null ? void 0 : r.focusX) ?? 50}% ${((a = (n = this.deity.imagePresentation) == null ? void 0 : n.image) == null ? void 0 : a.focusY) ?? 25}%` } };
  }
  _onRender() {
    var e, t;
    (t = (e = this.element) == null ? void 0 : e.querySelector("[data-action='edit']")) == null || t.addEventListener("click", () => {
      this.deityService && new X(this.deityService, (i) => {
        this.deity = i, this.render(!0);
      }, this.adapters, this.deity).render(!0);
    });
  }
}
g(pe, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1200, height: 820 } }), g(pe, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class me extends F() {
  constructor(e, t) {
    super(), this.deities = e, this.adapters = t;
  }
  async _prepareContext() {
    var n, a, o;
    v();
    const e = ((a = (n = b()) == null ? void 0 : n.system) == null ? void 0 : a.id) ?? "", t = await (((o = this.adapters.tryGet(e)) == null ? void 0 : o.listOfficialDeities()) ?? Promise.resolve([])), i = this.deities.list(), r = t.map((l) => {
      const c = i.find((d) => d.replacement.sourceUuid === l.sourceUuid && d.replacement.mode !== "none");
      return { ...l, mappingMode: (c == null ? void 0 : c.replacement.mode) ?? "none", inheritedCount: Object.values((c == null ? void 0 : c.replacement.inherit) ?? {}).filter(Boolean).length, options: i.map((d) => ({ id: d.id, name: d.name, selected: d.id === (c == null ? void 0 : c.id) })) };
    });
    return { ui: _(), rows: r, systemId: e };
  }
  _onRender() {
    var t;
    v();
    const e = (t = this.element) == null ? void 0 : t.querySelector("form");
    e == null || e.querySelectorAll("[data-source-row]").forEach((i) => {
      const r = i.querySelector("[name='replacement.mode']");
      r && (r.value = i.dataset.mode ?? "none");
    }), e == null || e.addEventListener("submit", (i) => {
      var r, n;
      i.preventDefault(), v();
      for (const a of e.querySelectorAll("[data-source-row]")) {
        const o = a.dataset.sourceUuid ?? "", l = ((r = a.querySelector("[name='replacement.deity']")) == null ? void 0 : r.value) ?? "", c = ((n = a.querySelector("[name='replacement.mode']")) == null ? void 0 : n.value) ?? "none", d = c === "hide" || c === "replace" ? c : "none";
        for (const h of this.deities.list().filter((u) => u.replacement.sourceUuid === o && u.id !== l)) this.deities.update(h.id, { replacement: { sourceUuid: "", mode: "none", contexts: [] } });
        if (l) {
          const h = this.deities.get(l);
          this.deities.update(l, { replacement: { ...h == null ? void 0 : h.replacement, sourceUuid: o, mode: d, contexts: ["characterBuilder", "compendium", "actorSheet", "searches", "leveler"] } });
        }
      }
      this.render(!0);
    });
  }
}
g(me, "DEFAULT_OPTIONS", { id: "darkis-godforge-replacements", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.REPLACEMENTS", resizable: !0 }, position: { width: 1100, height: 760 } }), g(me, "PARTS", { main: { template: "modules/darkis-godforge/templates/replacement-manager.hbs" } });
class fe extends F() {
  constructor(t, i, r, n = "transfer") {
    super();
    g(this, "pendingImport");
    g(this, "preview", null);
    g(this, "error", "");
    this.deities = t, this.api = i, this.randomContent = r, this.mode = n;
  }
  async _prepareContext() {
    v();
    const t = this.deities.list();
    return { ui: _(), preview: this.preview, error: this.error, deityCount: t.length, isTransfer: this.mode === "transfer", isMigration: this.mode === "migration", currentSchema: N, pendingMigrations: t.filter((i) => i.schemaVersion < N).length };
  }
  _onRender() {
    var i, r, n;
    v();
    const t = this.element;
    (i = t == null ? void 0 : t.querySelector("[data-action='export']")) == null || i.addEventListener("click", () => this.downloadExport()), (r = t == null ? void 0 : t.querySelector("[data-import-file]")) == null || r.addEventListener("change", (a) => {
      var o;
      return void this.previewFile((o = a.target.files) == null ? void 0 : o[0]);
    }), (n = t == null ? void 0 : t.querySelector("[data-action='apply-import']")) == null || n.addEventListener("click", () => {
      var a, o, l;
      if (v(), !!this.pendingImport) {
        try {
          const c = this.readRandomContent(this.pendingImport), d = this.api.importDeities(this.pendingImport);
          c && this.randomContent.replace(c), this.pendingImport = void 0, this.preview = null, this.error = "", (l = (o = (a = k()) == null ? void 0 : a.notifications) == null ? void 0 : o.info) == null || l.call(o, `${d} ${_().IMPORTED}`);
        } catch (c) {
          this.error = c instanceof Error ? c.message : String(c);
        }
        this.render(!0);
      }
    });
  }
  downloadExport() {
    v();
    const t = JSON.stringify({ ...this.api.exportDeities(), randomContent: this.randomContent.snapshot() }, null, 2), i = URL.createObjectURL(new Blob([t], { type: "application/json" })), r = document.createElement("a");
    r.href = i, r.download = `darkis-godforge-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`, r.click(), URL.revokeObjectURL(i);
  }
  async previewFile(t) {
    var i, r;
    if (t) {
      try {
        const n = JSON.parse(await t.text()), a = Ze(n), o = new Set(this.deities.list().map((c) => c.id));
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
    if (!et(i)) throw new Error("Invalid GodForge random content.");
    return i;
  }
}
g(fe, "DEFAULT_OPTIONS", { id: "darkis-godforge-data-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.IMPORT_EXPORT", resizable: !0 }, position: { width: 900, height: 700 } }), g(fe, "PARTS", { main: { template: "modules/darkis-godforge/templates/data-manager.hbs" } });
class ge extends F() {
  constructor(t, i = "tables") {
    super();
    g(this, "result", null);
    g(this, "error", "");
    this.randomContent = t, this.mode = i;
  }
  async _prepareContext() {
    v();
    const t = this.randomContent.listTables(), i = _();
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
    v();
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
    v();
    const i = new FormData(t), r = [...t.querySelectorAll("[data-entry-row]")].flatMap((n) => {
      const a = this.input(n, "entry.label");
      return a ? [{ id: crypto.randomUUID(), label: a, weight: Math.max(0, Number(this.input(n, "entry.weight") || 1)), category: this.category(this.input(n, "entry.category")), description: this.input(n, "entry.description") || void 0, visibleToPlayers: !0 }] : [];
    });
    this.runAction(() => {
      this.randomContent.createTable({ name: String(i.get("table.name") ?? "").trim(), formula: String(i.get("table.formula") ?? "1d100").trim(), visibility: this.visibility(i.get("table.visibility")), entries: r });
    });
  }
  createWheel(t) {
    v();
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
      this.error = i instanceof Error ? i.message : String(i), x("Random content action failed.", i), this.render(!0);
    }
  }
}
g(ge, "DEFAULT_OPTIONS", { id: "darkis-godforge-random-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.RANDOM_TABLES", resizable: !0 }, position: { width: 1100, height: 800 } }), g(ge, "PARTS", { main: { template: "modules/darkis-godforge/templates/random-manager.hbs" } });
class ye extends F() {
  constructor(e, t) {
    super(), this.deities = e, this.api = t;
  }
  async _prepareContext() {
    var i, r;
    v();
    const e = (((r = (i = b()) == null ? void 0 : i.actors) == null ? void 0 : r.contents) ?? []).flatMap((n) => {
      var c;
      const a = n;
      if (a.type && a.type !== "character") return [];
      const o = (c = a.flags) == null ? void 0 : c["darkis-godforge"], l = this.deities.get((o == null ? void 0 : o.deityId) ?? "");
      return [{ id: a.id, name: a.name ?? a.id, deityName: (l == null ? void 0 : l.name) ?? "—", hasDeity: !!l }];
    }), t = this.deities.list().filter((n) => n.status !== "archived").map((n) => ({ id: n.id, name: n.name, choiceGroups: n.grantGroups.flatMap((a) => ee(a)) }));
    return { ui: _(), actors: e, deities: t };
  }
  _onRender() {
    var r;
    v();
    const e = this.element, t = e == null ? void 0 : e.querySelector("[name='deityId']"), i = () => e == null ? void 0 : e.querySelectorAll("[data-deity-choices]").forEach((n) => {
      n.hidden = n.dataset.deityChoices !== (t == null ? void 0 : t.value);
    });
    t == null || t.addEventListener("change", i), i(), (r = e == null ? void 0 : e.querySelector("form")) == null || r.addEventListener("submit", (n) => {
      var h, u;
      n.preventDefault();
      const a = n.currentTarget, o = new FormData(a), l = (u = (h = b()) == null ? void 0 : h.actors) == null ? void 0 : u.get(String(o.get("actorId") ?? "")), c = String(o.get("deityId") ?? "");
      if (!l || !c) return;
      const d = {};
      e.querySelectorAll(`[data-deity-choices='${Bt(c)}'] input[data-group]:checked`).forEach((p) => {
        var m;
        (d[m = p.dataset.group ?? ""] ?? (d[m] = [])).push(p.value);
      }), this.api.assignDeity(l, c, d).then(() => this.render(!0)).catch((p) => x("Character assignment failed.", p));
    }), e == null || e.querySelectorAll("[data-action='reset-daily-usages']").forEach((n) => n.addEventListener("click", () => {
      var o, l;
      const a = (l = (o = b()) == null ? void 0 : o.actors) == null ? void 0 : l.get(n.dataset.actorId ?? "");
      a && (n.disabled = !0, this.api.resetActorUsages(a, "daily-preparations").then(() => {
        var c, d, h;
        return (h = (d = (c = k()) == null ? void 0 : c.notifications) == null ? void 0 : d.info) == null || h.call(d, _().RESET_DAILY_COMPLETE ?? "Daily-preparation uses were reset."), this.render(!0);
      }).catch((c) => {
        n.disabled = !1, x("Daily usage reset failed.", c);
      }));
    }));
  }
}
g(ye, "DEFAULT_OPTIONS", { id: "darkis-godforge-character-manager", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.CHARACTERS", resizable: !0 }, position: { width: 900, height: 700 } }), g(ye, "PARTS", { main: { template: "modules/darkis-godforge/templates/character-manager.hbs" } });
function Bt(s) {
  return typeof CSS < "u" ? CSS.escape(s) : s.replace(/["'\\]/g, "\\$&");
}
class Q extends F() {
  constructor(t, i = new ve(), r = new it(t, i), n = new tt()) {
    super();
    g(this, "searchTerm", "");
    g(this, "sectionFilter", "overview");
    g(this, "searchTimer", null);
    g(this, "keydownRoot", null);
    g(this, "handleRootKeydown", (t) => {
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
    var d, h, u, p, m, E, S, f;
    v();
    const t = _(), i = this.deityService.list().map((y) => {
      var A, O, R, w, q, Re;
      const I = qt(y).filter((nt) => nt.level === "error").length;
      return {
        ...y,
        image: U(y.image),
        imagePosition: `${((O = (A = y.imagePresentation) == null ? void 0 : A.image) == null ? void 0 : O.focusX) ?? 50}% ${((w = (R = y.imagePresentation) == null ? void 0 : R.image) == null ? void 0 : w.focusY) ?? 25}%`,
        imageFit: ((Re = (q = y.imagePresentation) == null ? void 0 : q.image) == null ? void 0 : Re.fit) === "contain" ? "contain" : "cover",
        errors: I,
        statusLabel: t[`STATUS_${y.status.toUpperCase()}`] ?? y.status,
        updatedLabel: Wt(y.updatedAt)
      };
    }), r = this.searchTerm.toLocaleLowerCase(), n = i.filter((y) => this.matchesSection(y) && (!r || `${y.name} ${y.title} ${y.domains.join(" ")}`.toLocaleLowerCase().includes(r))), a = ((u = (h = (d = b()) == null ? void 0 : d.actors) == null ? void 0 : h.contents) == null ? void 0 : u.filter($t).length) ?? 0, o = b(), l = ((m = (p = o == null ? void 0 : o.modules) == null ? void 0 : p.get("darkis-godforge")) == null ? void 0 : m.version) ?? "—", c = ((E = o == null ? void 0 : o.system) == null ? void 0 : E.id) ?? "—";
    return {
      ui: t,
      deities: n,
      hasAnyDeities: i.length > 0,
      searchTerm: this.searchTerm,
      nav: { [this.sectionFilter]: !0 },
      recent: [...i].sort((y, I) => I.updatedAt.localeCompare(y.updatedAt)).slice(0, 6),
      stats: {
        deities: i.length,
        pantheons: new Set(i.flatMap((y) => y.pantheonIds ?? [])).size,
        published: i.filter((y) => y.status === "published").length,
        bonuses: i.reduce((y, I) => y + I.passiveBonuses.length, 0),
        abilities: i.reduce((y, I) => y + I.abilities.length, 0),
        invalid: i.filter((y) => y.errors > 0).length,
        assignedActors: a
      },
      systemInfo: {
        foundry: (o == null ? void 0 : o.version) ?? "—",
        system: c,
        systemVersion: ((S = o == null ? void 0 : o.system) == null ? void 0 : S.version) ?? "—",
        moduleVersion: l,
        adapter: ((f = this.adapters.tryGet(c)) == null ? void 0 : f.id) ?? "—",
        schema: N
      }
    };
  }
  _onRender() {
    var r, n, a, o, l;
    v();
    const t = this.element;
    if (!t) return;
    t.querySelectorAll("[data-action='create']").forEach((c) => c.addEventListener("click", () => new X(this.deityService, () => void this.render(!0), this.adapters).render(!0))), t.querySelectorAll("[data-action='codex']").forEach((c) => c.addEventListener("click", () => new H(this.deityService).render(!0))), t.querySelectorAll("[data-action='player-preview']").forEach((c) => c.addEventListener("click", () => new H(this.deityService, void 0, void 0, void 0, void 0, { isGM: !1, selection: !0 }).render(!0))), t.querySelectorAll("[data-section]").forEach((c) => c.addEventListener("click", () => {
      const d = c.dataset.section;
      (d === "overview" || d === "deities" || d === "pantheons" || d === "abilities" || d === "bonuses") && (this.sectionFilter = d, this.render(!0));
    })), (r = t.querySelector("[data-manager='replacements']")) == null || r.addEventListener("click", () => void new me(this.deityService, this.adapters).render(!0)), t.querySelectorAll("[data-manager='data']").forEach((c) => c.addEventListener("click", () => {
      const d = c.dataset.managerMode === "migration" ? "migration" : "transfer";
      new fe(this.deityService, this.api, this.randomContent, d).render(!0);
    })), t.querySelectorAll("[data-manager='random']").forEach((c) => c.addEventListener("click", () => {
      const d = c.dataset.managerMode, h = d === "wheels" || d === "test" ? d : "tables";
      new ge(this.randomContent, h).render(!0);
    })), (n = t.querySelector("[data-manager='characters']")) == null || n.addEventListener("click", () => void new ye(this.deityService, this.api).render(!0)), (a = t.querySelector("[data-action='toggle-context']")) == null || a.addEventListener("click", () => {
      var c;
      return (c = t.querySelector(".dg-app-shell")) == null ? void 0 : c.classList.toggle("context-open");
    }), (o = t.querySelector("[data-action='settings']")) == null || o.addEventListener("click", () => this.openSettings()), t.querySelectorAll("[data-scroll]").forEach((c) => c.addEventListener("click", () => {
      var d;
      return (d = t.querySelector(`[data-section-target='${c.dataset.scroll ?? ""}']`)) == null ? void 0 : d.scrollIntoView({ behavior: "smooth", block: "start" });
    })), t.querySelectorAll("[data-deity]").forEach((c) => c.addEventListener("click", () => {
      const d = this.deityService.get(c.dataset.deity ?? "");
      d && new pe(d, this.deityService, this.adapters).render(!0);
    }));
    const i = t.querySelector("[data-search]");
    i && (i.value = this.searchTerm), i == null || i.addEventListener("input", () => {
      this.searchTerm = i.value, this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = setTimeout(() => void this.render(!0), 140);
    }), this.keydownRoot !== t && ((l = this.keydownRoot) == null || l.removeEventListener("keydown", this.handleRootKeydown), t.addEventListener("keydown", this.handleRootKeydown), this.keydownRoot = t);
  }
  _onClose() {
    var t;
    this.searchTimer && clearTimeout(this.searchTimer), this.searchTimer = null, (t = this.keydownRoot) == null || t.removeEventListener("keydown", this.handleRootKeydown), this.keydownRoot = null;
  }
  openSettings() {
    var n, a, o, l, c;
    const t = globalThis, i = ((o = (a = (n = t.foundry) == null ? void 0 : n.applications) == null ? void 0 : a.settings) == null ? void 0 : o.SettingsConfig) ?? t.SettingsConfig;
    if (i) {
      new i({ initialCategory: "darkis-godforge" }).render(!0);
      return;
    }
    const r = (c = (l = b()) == null ? void 0 : l.settings) == null ? void 0 : c.sheet;
    r && r.render(!0);
  }
  matchesSection(t) {
    var i;
    return this.sectionFilter === "pantheons" ? !!((i = t.pantheonIds) != null && i.length) : this.sectionFilter === "abilities" ? t.abilities.length > 0 : this.sectionFilter === "bonuses" ? t.passiveBonuses.length > 0 : !0;
  }
}
g(Q, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 }, position: { width: 1440, height: 900 } }), g(Q, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
function $t(s) {
  var t;
  const e = (t = s.flags) == null ? void 0 : t["darkis-godforge"];
  return !!(e && typeof e == "object" && "deityId" in e);
}
function Wt(s) {
  const e = new Date(s);
  return Number.isNaN(e.getTime()) ? "—" : new Intl.DateTimeFormat(void 0, { dateStyle: "medium", timeStyle: "short" }).format(e);
}
class Ee extends Z() {
  constructor(e, t, i, r) {
    super(), this.actor = e, this.api = t, this.socketRouter = i, this.openCodex = r;
  }
  async _prepareContext() {
    const e = this.api.getCharacterWidgetData(this.actor);
    return { ui: _(), actorId: this.actor.id, ...e, deity: e.deity ? { ...e.deity, image: U(e.deity.image) } : null, abilities: e.abilities.map((t) => ({ ...t, remaining: t.uses ? Math.max(0, t.uses.max - t.uses.used) : null, available: !t.uses || t.uses.used < t.uses.max })) };
  }
  _onRender() {
    var t;
    const e = this.element;
    (t = e == null ? void 0 : e.querySelector("[data-action='codex']")) == null || t.addEventListener("click", this.openCodex), e == null || e.querySelectorAll("[data-ability]").forEach((i) => i.addEventListener("click", () => void this.socketRouter.activate({ actorId: this.actor.id, abilityId: i.dataset.ability ?? "", options: {} }).then(() => this.render(!0)).catch((r) => x("Ability activation failed.", r))));
  }
}
g(Ee, "DEFAULT_OPTIONS", { id: "darkis-godforge-hub", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.HUB", resizable: !0 }, position: { width: 520, height: 650 } }), g(Ee, "PARTS", { main: { template: "modules/darkis-godforge/templates/hub.hbs" } });
class jt {
  constructor() {
    g(this, "definitions", /* @__PURE__ */ new Map());
    g(this, "persistDefinition");
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
    const t = Je(e).definition;
    return this.definitions.set(t.id, structuredClone(t)), this.persistDefinition && this.persistDefinition(structuredClone(t)).catch((i) => console.error("Darkis GodForge | Could not persist deity.", i)), t;
  }
  create(e) {
    const t = (/* @__PURE__ */ new Date()).toISOString(), i = { ...structuredClone(e), id: crypto.randomUUID(), schemaVersion: N, revision: 1, createdAt: t, updatedAt: t, checksum: "pending" };
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
const ae = "darkis-godforge";
class zt {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var i;
      const t = (i = e.flags) == null ? void 0 : i[ae];
      return t && typeof t == "object" && "deity" in t && Ce(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var o;
      const a = (o = n.flags) == null ? void 0 : o[ae];
      return a && typeof a == "object" && "deity" in a && Ce(a.deity) && a.deity.id === e.id;
    }), i = { [ae]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: i }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: i })).uuid : null;
  }
}
function Yt(s) {
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
function xe(s, e, t) {
  var d;
  const i = s.actor;
  if (!i || !Xt(i) || !Qt(i)) return;
  const r = Kt(e), n = (r == null ? void 0 : r.closest(".application, .window-app, .app")) ?? r, a = n == null ? void 0 : n.querySelector(".window-header");
  if (!a) return;
  (d = a.querySelector(".darkis-godforge-sheet-button")) == null || d.remove();
  const o = P("DARKIS_GODFORGE.UI.OPEN_HUB"), l = document.createElement("a");
  l.className = "darkis-godforge-sheet-button header-control", l.title = o, l.setAttribute("aria-label", o), l.setAttribute("role", "button"), l.innerHTML = '<i class="fas fa-hammer" aria-hidden="true"></i>', l.addEventListener("click", (h) => {
    h.preventDefault(), h.stopPropagation(), t(i);
  });
  const c = a.querySelector("button.close, a.close, .header-button.close, [data-action='close']");
  c ? c.before(l) : a.append(l);
}
function Kt(s) {
  var i;
  if (s instanceof HTMLElement) return s;
  const e = s, t = (e == null ? void 0 : e[0]) ?? ((i = e == null ? void 0 : e.get) == null ? void 0 : i.call(e, 0));
  return t instanceof HTMLElement ? t : null;
}
function Xt(s) {
  var t;
  const e = (t = s.flags) == null ? void 0 : t["darkis-godforge"];
  return !!(e && typeof e == "object" && "deityId" in e);
}
function Qt(s) {
  var t, i;
  const e = (t = b()) == null ? void 0 : t.user;
  return (e == null ? void 0 : e.isGM) === !0 || ((i = s.testUserPermission) == null ? void 0 : i.call(s, e, "OWNER")) === !0;
}
const D = "darkis-godforge";
function Jt(s, e, t) {
  return class extends Q {
    constructor() {
      super(s, void 0, e, t);
    }
  };
}
function Zt(s, e, t, i, r = () => {
}) {
  if (!s || typeof s != "object" || Array.isArray(s)) return;
  const n = s, a = Math.max(-1, ...Object.values(n).map((o) => o.order ?? -1)) + 1;
  n[D] = {
    name: D,
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
function ei(s, e, t, i, r, n, a) {
  const o = Ie();
  o && (o.Hooks.once("init", () => {
    var h, u;
    const l = He("init");
    if (!l) return;
    qe(l, s, t, i, a);
    const c = ((u = (h = l.modules) == null ? void 0 : h.get(D)) == null ? void 0 : u.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], d = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...c.map((p) => [p.lang, p.name])]);
    if (!l.settings) console.error("Darkis GodForge | game.settings is unavailable during init.");
    else {
      if (!l.settings.registerMenu) console.error("Darkis GodForge | game.settings.registerMenu is unavailable during init.");
      else try {
        l.settings.registerMenu(D, "dashboard", { name: "DARKIS_GODFORGE.SETTINGS.MENU_NAME", label: "DARKIS_GODFORGE.SETTINGS.MENU_LABEL", hint: "DARKIS_GODFORGE.SETTINGS.MENU_HINT", icon: "fas fa-hammer", type: Jt(e, s, n), restricted: !0 });
      } catch (p) {
        console.error("Darkis GodForge | Could not register dashboard settings menu.", p);
      }
      try {
        l.settings.register(D, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: d, onChange: (p) => {
          if (typeof p != "string" || p === "auto") return;
          const m = c.find((E) => E.lang === p);
          m != null && m.path && Ge(p, `modules/${D}/${m.path}`);
        } });
      } catch (p) {
        console.error("Darkis GodForge | Could not register language setting.", p);
      }
      try {
        l.settings.register(D, "random-content", { scope: "world", config: !1, type: Object, default: { tables: [], wheels: [] } });
      } catch (p) {
        console.error("Darkis GodForge | Could not register random content storage.", p);
      }
    }
    if (!l.keybindings) console.error("Darkis GodForge | game.keybindings is unavailable during init.");
    else try {
      l.keybindings.register(D, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
        var p, m;
        return ((m = (p = b()) == null ? void 0 : p.user) == null ? void 0 : m.isGM) !== !0 ? !1 : (t(), !0);
      } }), l.keybindings.register(D, "open-hub", { name: "DARKIS_GODFORGE.UI.OPEN_HUB", editable: [{ key: "KeyG" }], restricted: !1, onDown: () => (a == null || a(), !0) }), l.keybindings.register(D, "open-codex", { name: "DARKIS_GODFORGE.UI.OPEN_CODEX", editable: [{ key: "KeyG", modifiers: ["Shift"] }], restricted: !1, onDown: () => (i(), !0) });
    } catch (p) {
      console.error("Darkis GodForge | Could not register keybindings.", p);
    }
  }), o.Hooks.on("getSceneControlButtons", (...l) => {
    var c, d;
    Zt(l[0], t, i, ((d = (c = b()) == null ? void 0 : c.user) == null ? void 0 : d.isGM) === !0, () => a == null ? void 0 : a());
  }), o.Hooks.on("renderCharacterSheetPF2e", (l, c) => {
    a && xe(l, c, a);
  }), o.Hooks.on("renderActorSheet", (l, c) => {
    a && xe(l, c, a);
  }), o.Hooks.on("pf2e.restForTheNight", (l) => {
    var h, u, p, m;
    if (((u = (h = b()) == null ? void 0 : h.system) == null ? void 0 : u.id) !== "pf2e" || !l || typeof l != "object" || !("id" in l)) return;
    const c = l;
    (((m = (p = b()) == null ? void 0 : p.user) == null ? void 0 : m.isGM) === !0 || !r ? s.resetActorUsages(c, "daily-preparations") : r.reset({ actorId: c.id, reset: "daily-preparations" })).catch((E) => console.error("Darkis GodForge | Could not reset daily-preparation usages.", E));
  }), o.Hooks.once("ready", async () => {
    var c, d, h, u, p, m, E, S, f, y;
    const l = He("ready");
    if (l) {
      qe(l, s, t, i, a);
      try {
        const I = (d = (c = l.settings) == null ? void 0 : c.get) == null ? void 0 : d.call(c, D, "language"), A = (p = (u = (h = l.modules) == null ? void 0 : h.get(D)) == null ? void 0 : u.languages) == null ? void 0 : p.find((O) => O.lang === I);
        typeof I == "string" && (A != null && A.path) && await Ge(I, `modules/${D}/${A.path}`);
      } catch (I) {
        console.error("Darkis GodForge | Could not load the selected language.", I);
      }
      try {
        if (l.journal) {
          const I = new zt(l.journal);
          for (const A of I.load()) e.save(A);
          e.setPersistence((A) => I.save(A));
        }
      } catch (I) {
        console.error("Darkis GodForge | Could not load deity journals.", I);
      }
      try {
        if (n) {
          const I = (E = (m = l.settings) == null ? void 0 : m.get) == null ? void 0 : E.call(m, D, "random-content");
          n.load(I && typeof I == "object" ? I : null), (S = l.settings) != null && S.set && n.setPersistence((A) => l.settings.set(D, "random-content", A));
        }
      } catch (I) {
        console.error("Darkis GodForge | Could not load random content.", I);
      }
      try {
        const I = Yt((y = (f = l.modules) == null ? void 0 : f.get("socketlib")) == null ? void 0 : y.api);
        I && r && (r.setTransport(I), r.register());
      } catch (I) {
        console.error("Darkis GodForge | Could not initialize socketlib integration.", I);
      }
    }
  }));
}
function He(s) {
  const e = b();
  return e || console.error(`Darkis GodForge | The Foundry game singleton is unavailable during ${s}.`), e ?? null;
}
function qe(s, e, t, i, r) {
  var o;
  const n = (o = s.modules) == null ? void 0 : o.get(D);
  if (!n) {
    console.error("Darkis GodForge | Module entry is unavailable; public API could not be exposed.");
    return;
  }
  const a = e;
  a.openDashboard = t, a.openCodex = i, r && (a.openHub = r), n.api = a;
}
class ti {
  constructor(e, t, i) {
    g(this, "activations", /* @__PURE__ */ new Map());
    this.api = e, this.authority = t, this.transport = i;
  }
  setTransport(e) {
    this.transport = e;
  }
  register() {
    var e, t, i;
    (e = this.transport) == null || e.register("activateAbility", async (r, n) => this.handleActivation(this.parseRequest(r, n), !1)), (t = this.transport) == null || t.register("assignDeity", async (r, n) => this.handleAssignment(this.parseAssignment(r, n), !1)), (i = this.transport) == null || i.register("resetUsages", async (r, n) => this.handleReset(this.parseReset(r, n), !1));
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
  async reset(e) {
    const t = { ...e, activationId: crypto.randomUUID(), userId: this.authority.currentUserId };
    if (this.updateStatus(t.activationId, "requested"), !this.authority.isGM) {
      if (!this.transport) {
        const i = this.authority.resolveActor(t.actorId);
        if (!i || !this.authority.ownsActor(i, t.userId)) throw new Error("GM authority is unavailable.");
        await this.api.resetActorUsages(i, t.reset);
        return;
      }
      await this.transport.executeAsGM("resetUsages", t);
      return;
    }
    await this.handleReset(t, !0);
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
  async handleReset(e, t) {
    if (this.activations.has(e.activationId) && this.activations.get(e.activationId) !== "requested") throw new Error("Reset request has already been processed.");
    this.updateStatus(e.activationId, "requested");
    const i = this.authority.resolveActor(e.actorId);
    if (!i)
      throw this.updateStatus(e.activationId, "aborted"), new Error("Target actor was not found.");
    if (!this.isAuthorizedRequester(i, e.userId, t))
      throw this.updateStatus(e.activationId, "aborted"), new Error("User is not allowed to reset this actor.");
    this.updateStatus(e.activationId, "validated"), this.updateStatus(e.activationId, "running");
    try {
      await this.api.resetActorUsages(i, e.reset), this.updateStatus(e.activationId, "completed");
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
  parseReset(e, t) {
    if (!e || typeof e != "object" || !this.validId(t)) throw new Error("Invalid socket request.");
    const i = e;
    if (!this.validId(i.activationId) || !this.validId(i.actorId) || !this.validReset(i.reset)) throw new Error("Invalid socket request.");
    return { activationId: i.activationId, actorId: i.actorId, userId: t, reset: i.reset };
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
  validReset(e) {
    return typeof e == "string" && ["ten-minute-rest", "refocus", "daily-preparations", "encounter-end", "scene-change", "calendar-day", "calendar-week", "calendar-month", "calendar-year", "custom-rest", "manual", "daily", "weekly", "encounter"].includes(e);
  }
  updateStatus(e, t) {
    if (!this.activations.has(e) && this.activations.size >= 1e3) {
      const i = this.activations.keys().next().value;
      i && this.activations.delete(i);
    }
    this.activations.set(e, t);
  }
}
const te = new jt(), _e = new ve(), j = new it(te, _e), st = new tt();
let Be = null;
function $e() {
  if (!De()) {
    Oe();
    return;
  }
  Be ?? (Be = new Q(te, _e, j, st)), Be.render(!0).catch((s) => {
    var e, t, i;
    console.error("Darkis GodForge | Could not open dashboard.", s), (i = (t = (e = k()) == null ? void 0 : e.notifications) == null ? void 0 : t.error) == null || i.call(t, P("DARKIS_GODFORGE.ERROR.DASHBOARD_OPEN"));
  });
}
function rt() {
  new H(te, void 0, j, Ne, ri()).render(!0).catch((e) => {
    var t, i, r;
    console.error("Darkis GodForge | Could not open codex.", e), (r = (i = (t = k()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, P("DARKIS_GODFORGE.ERROR.CODEX_OPEN"));
  });
}
const We = /* @__PURE__ */ new Map();
function ii(s) {
  ni(s).then((e) => {
    e && si(e);
  }).catch((e) => {
    var t, i, r;
    console.error("Darkis GodForge | Could not select a character for the follower hub.", e), (r = (i = (t = k()) == null ? void 0 : t.notifications) == null ? void 0 : i.error) == null || r.call(i, P("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
function si(s) {
  let e = We.get(s.id);
  e || (e = new Ee(s, j, Ne, rt), We.set(s.id, e)), e.render(!0).catch((t) => {
    var i, r, n;
    console.error("Darkis GodForge | Could not open hub.", t), (n = (r = (i = k()) == null ? void 0 : i.notifications) == null ? void 0 : r.error) == null || n.call(r, P("DARKIS_GODFORGE.ERROR.HUB_OPEN"));
  });
}
const je = Ie(), Ne = new ti(j, { get currentUserId() {
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
je ? (ei(j, te, $e, rt, Ne, st, ii), je.Hooks.once("ready", () => {
  var e, t, i, r, n;
  const s = (t = (e = b()) == null ? void 0 : e.system) == null ? void 0 : t.id;
  s && !_e.supports(s) && ((n = (r = (i = k()) == null ? void 0 : i.notifications) == null ? void 0 : r.warn) == null || n.call(r, P("DARKIS_GODFORGE.ERROR.UNSUPPORTED_SYSTEM").replace("{system}", s)));
})) : typeof document < "u" && $e();
function ri() {
  var t, i, r, n;
  const s = globalThis.canvas, e = ((i = (t = s == null ? void 0 : s.tokens) == null ? void 0 : t.controlled) == null ? void 0 : i.map((a) => a.actor).filter((a) => !!a)) ?? [];
  return e.length === 1 ? e[0] : (n = (r = b()) == null ? void 0 : r.user) == null ? void 0 : n.character;
}
async function ni(s) {
  var d, h, u, p, m, E, S, f, y, I, A, O, R;
  if (s) return s;
  const e = (((h = (d = globalThis.canvas) == null ? void 0 : d.tokens) == null ? void 0 : h.controlled) ?? []).map((w) => w.actor).filter((w) => !!w);
  if (e.length === 1) return e[0];
  const t = (p = (u = b()) == null ? void 0 : u.user) == null ? void 0 : p.character;
  if (t) return t;
  const i = (m = b()) == null ? void 0 : m.user, r = (((S = (E = b()) == null ? void 0 : E.actors) == null ? void 0 : S.contents) ?? []).filter((w) => {
    var q;
    return !!(w && typeof w == "object" && "id" in w && i && ((q = w.testUserPermission) == null ? void 0 : q.call(w, i, "OWNER")) === !0);
  });
  if (r.length === 1) return r[0];
  const n = (I = (y = (f = globalThis.foundry) == null ? void 0 : f.applications) == null ? void 0 : y.api) == null ? void 0 : I.DialogV2, a = "Der Anhänger-Hub zeigt Gottheit, Boni und Wunder eines Charakters.";
  if (!n) {
    (R = (O = (A = k()) == null ? void 0 : A.notifications) == null ? void 0 : O.warn) == null || R.call(O, a);
    return;
  }
  if (!r.length) {
    await n.prompt({ window: { title: "Anhänger-Hub" }, content: `<p>${a}</p><p>Lege einen eigenen Charakter fest oder kontrolliere einen Token.</p>`, rejectClose: !1, ok: { label: "Verstanden" } });
    return;
  }
  const o = r.map((w) => `<option value="${Ue(w.id)}">${Ue(w.name ?? w.id)}</option>`).join(""), l = await n.input({ window: { title: "Anhänger-Hub – Charakter auswählen" }, content: `<p>${a}</p><label>Charakter<select name="actorId">${o}</select></label>`, rejectClose: !1, ok: { label: "Anhänger-Hub öffnen" } }), c = typeof (l == null ? void 0 : l.actorId) == "string" ? l.actorId : "";
  return r.find((w) => w.id === c);
}
export {
  Q as GodForgeDashboard,
  j as api,
  te as deityService,
  st as randomContentService,
  _e as registry,
  Ne as socketRouter
};
