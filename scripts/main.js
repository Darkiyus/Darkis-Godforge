var oe = Object.defineProperty;
var ce = (i, e, t) => e in i ? oe(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var u = (i, e, t) => ce(i, typeof e != "symbol" ? e + "" : e, t);
function le(i, e) {
  return { name: i.name, type: "deity", description: i.description, system: { alignment: i.alignment ? [i.alignment] : [], domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", font: i.font ? [i.font] : [], sanctification: i.sanctification ? [i.sanctification] : [], skill: i.skill ?? "" }, flags: { "darkis-godforge": { definitionUuid: e } } };
}
async function R(i) {
  var r, n, o, a;
  const t = (((n = (r = globalThis.game) == null ? void 0 : r.packs) == null ? void 0 : n.contents) ?? []).filter((c) => {
    var d;
    return c.documentName === "Item" && (!((d = c.metadata) != null && d.system) || c.metadata.system === i);
  }), s = [];
  for (const c of t) {
    const d = await c.getIndex({ fields: ["type", "img", "system.domains", "system.alignment"] });
    for (const l of d) {
      if (l.type !== "deity" || !l._id || !l.name || !c.collection) continue;
      const g = `Compendium.${c.collection}.Item.${l._id}`;
      s.push({ id: g, sourceUuid: g, official: !0, name: l.name, title: l.name, image: l.img, domains: ((o = l.system) == null ? void 0 : o.domains) ?? [], alignment: (a = l.system) == null ? void 0 : a.alignment });
    }
  }
  return s;
}
function de(i) {
  if (i.classId !== "cleric" && i.classId !== "champion") return null;
  const e = i.systemValues;
  return { classId: i.classId, deityId: i.deityId, grants: i.grants, domains: { available: e.domains, pick: i.classId === "cleric" ? 1 : 0 }, divineFont: i.classId === "cleric" ? e.font : void 0, favoredWeapon: e.favoredWeapon, trainedSkill: i.classId === "cleric" ? e.skill : void 0, sanctification: e.sanctification, cause: i.classId === "champion" ? e.cause : void 0 };
}
class ue {
  constructor() {
    u(this, "id", "pf2e");
    u(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(le(e, e.id))).uuid : null;
  }
  async listOfficialDeities() {
    return R(this.id);
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return de(e);
  }
}
function X(i) {
  return { name: i.name, type: "deity", description: i.description, system: { domains: i.domains, favoredWeapon: i.favoredWeapon ?? "", alignment: i.alignment ? [i.alignment] : [] }, flags: { "darkis-godforge": { definitionUuid: i.id } } };
}
class he {
  constructor() {
    u(this, "id", "sfrpg");
    u(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(X(e))).uuid : null;
  }
  async listOfficialDeities() {
    return R(this.id);
  }
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return null;
  }
}
class ge {
  constructor() {
    u(this, "id", "sf2e");
    u(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e, t) {
    return t ? (await t.createItem(X(e))).uuid : null;
  }
  async listOfficialDeities() {
    return R(this.id);
  }
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
  buildClassCoupling(e) {
    return { classId: e.classId, deityId: e.deityId, system: e.systemValues, grants: e.grants };
  }
}
class me {
  constructor() {
    u(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new ue()), this.register(new ge()), this.register(new he());
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
function fe(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function pe(i, e, t) {
  return i.filter((s) => s.visibility.library && !t.has(s.id) && (!e.pantheonFilter || s.domains.includes(e.pantheonFilter))).map(fe);
}
function U(i, e) {
  const t = Z(i);
  if (i.mode === "all") return i.grants.flatMap((r) => "mode" in r ? U(r) : [r.ref]);
  const s = (e == null ? void 0 : e.groupId) === i.id ? e.refs : [];
  if (!i.pick || s.length !== i.pick || s.some((r) => !t.includes(r))) throw new Error(`Grant group ${i.id} requires ${i.pick ?? 1} valid choice(s).`);
  return s;
}
function Z(i) {
  return i.grants.flatMap((e) => "mode" in e ? Z(e) : [e.ref]);
}
function Q(i, e) {
  return i.used < i.max;
}
function ye(i, e) {
  if (!Q(i)) throw new Error("No uses remaining.");
  return { ...i, used: i.used + 1 };
}
function ve(i, e) {
  return { ...i, used: 0, lastResetAt: e };
}
const we = /@(?:actor\.level|actor\.hpPercent|target\.hpPercent)|[A-Za-z_][A-Za-z0-9_.]*|\d+(?:\.\d+)?|[()+\-*/,]/g, Ie = /^\d+d\d+(?:[+\-]\d+)?$/, be = /* @__PURE__ */ new Set(["min", "max", "round", "floor", "ceil", "abs", "clamp", "if"]);
function ee(i) {
  const e = i.replace(/\s/g, ""), t = e.match(we);
  if (!t || t.join("") !== e) throw new Error("Formula contains an unsupported term.");
  return t;
}
function te(i) {
  const e = i.replace(/\s/g, ""), t = e.match(/\b\d+d\d+\b/g) ?? [], s = e.replace(/\b\d+d\d+\b/g, "0");
  if (t.some((r) => !/^\d+d\d+$/.test(r))) return !1;
  try {
    return new ie(ee(s), { actor: { level: 0 }, target: {} }).parse(), !0;
  } catch {
    return !1;
  }
}
function S(i, e) {
  const t = i.replace(/\s/g, "");
  if (!te(t)) throw new Error("Formula contains an unsupported term.");
  if (Ie.test(t)) throw new Error("Dice formulas require Foundry Roll at runtime.");
  return new ie(ee(t), e).parse();
}
async function Ee(i, e, t) {
  if (!te(i)) throw new Error("Formula contains an unsupported term.");
  const s = i.replace(/\s/g, "").match(/\b\d+d\d+\b/g) ?? [];
  let r = i;
  for (const n of [...new Set(s)]) {
    const o = await t(n);
    if (!Number.isFinite(o)) throw new Error("Dice result is not a finite number.");
    r = r.replace(new RegExp(`\\b${n}\\b`, "g"), String(o));
  }
  return S(r, e);
}
class ie {
  constructor(e, t) {
    u(this, "position", 0);
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
      const t = this.take(), s = this.term();
      e = t === "+" ? e + s : e - s;
    }
    return e;
  }
  term() {
    let e = this.unary();
    for (; this.peek("*") || this.peek("/"); ) {
      const t = this.take(), s = this.unary();
      e = t === "*" ? e * s : e / s;
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
    if (be.has(e)) return this.call(e);
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
function I(i, e) {
  if (i.type === "fact") return e[i.key] === i.equals;
  if (i.type === "not") return !I(i.child, e);
  const t = i.children.map((s) => I(s, e));
  return i.type === "and" ? t.every(Boolean) : t.some(Boolean);
}
async function Ae(i, e) {
  const t = { messages: [], healing: 0, damage: 0, appliedModifiers: [], appliedConditions: [] };
  if (i.condition && !I(i.condition, e.conditionFacts ?? {})) return t;
  for (const s of i.effects) await se(s, e, t);
  return t;
}
async function se(i, e, t) {
  if (i.type === "message") {
    t.messages.push(i.text);
    return;
  }
  if (i.type === "branch") {
    const r = I(i.condition, e.conditionFacts ?? {}) ? i.then : i.otherwise ?? [];
    for (const n of r) await se(n, e, t);
    return;
  }
  if (i.type === "heal" || i.type === "damage") {
    const r = i.target === "target" ? e.target : e.actor;
    if (!r) throw new Error("This ability requires a valid target.");
    const n = /\b\d+d\d+\b/.test(i.formula) ? e.rollDice ? await Ee(i.formula, e.facts, e.rollDice) : (() => {
      throw new Error("Dice terms require a Foundry Roll resolver.");
    })() : S(i.formula, e.facts);
    i.type === "heal" ? (t.healing += n, r.hp !== void 0 && (r.hp = Math.min(r.maxHp ?? Number.MAX_SAFE_INTEGER, r.hp + n))) : (t.damage += n, r.hp !== void 0 && (r.hp = Math.max(0, r.hp - n)));
    return;
  }
  if (i.type === "modifier") {
    const r = typeof i.value == "number" ? i.value : S(i.value, e.facts);
    e.actor.modifiers[i.selector] = r, t.appliedModifiers.push(i.selector);
    return;
  }
  if (i.type !== "condition") return;
  const s = i.target === "target" ? e.target : e.actor;
  if (!s) throw new Error("This ability requires a valid target.");
  s.conditions.push(i.condition), t.appliedConditions.push(i.condition);
}
function De(i, e, t = []) {
  if (!e.trim()) throw new Error("Class identifier is required for deity coupling.");
  const s = i.grantGroups.flatMap((r) => U(r, t.find((n) => n.groupId === r.id)));
  return { deityId: i.id, classId: e, grants: s, choices: t, systemValues: { domains: i.domains, font: i.font, favoredWeapon: i.favoredWeapon, skill: i.skill, sanctification: i.sanctification, cause: i.cause } };
}
function Se(i, e) {
  return !i || !e ? { deity: null, grants: [], abilities: [] } : { deity: { id: i.id, name: i.name, title: i.title, image: i.image }, grants: e.grants, abilities: i.abilities.map((t) => {
    var s;
    return { id: t.id, name: t.name, description: t.description, uses: t.uses ? { used: ((s = e.usages[t.id]) == null ? void 0 : s.used) ?? 0, max: t.uses.max } : void 0 };
  }) };
}
function ke(i) {
  const e = [];
  if (i.schemaVersion > 1) throw new Error(`Unsupported deity schema ${i.schemaVersion}.`);
  if (i.schemaVersion === 1) return { definition: structuredClone(i), migrated: !1, warnings: e };
  const t = { ...structuredClone(i), schemaVersion: 1, revision: i.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
  return e.push("Legacy definition normalized to schema version 1."), { definition: t, migrated: !0, warnings: e };
}
function Te(i, e = (/* @__PURE__ */ new Date()).toISOString()) {
  return { format: "darkis-godforge", schemaVersion: 1, exportedAt: e, deities: structuredClone(i) };
}
function Oe(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return e.format === "darkis-godforge" && typeof e.schemaVersion == "number" && e.schemaVersion <= 1 && Array.isArray(e.deities) && e.deities.every((t) => typeof t == "object" && t !== null && typeof t.id == "string" && typeof t.name == "string" && typeof t.schemaVersion == "number" && Array.isArray(t.domains) && Array.isArray(t.abilities));
}
function Ge(i) {
  if (!Oe(i)) throw new Error("Invalid GodForge export: expected a valid deity export.");
  return i.deities.map((e) => ke(e).definition);
}
function Ce(i, e) {
  const t = i.filter((a) => Number.isFinite(a.weight) && a.weight > 0), s = t.reduce((a, c) => a + c.weight, 0);
  if (!t.length || s <= 0) throw new Error("Random table has no selectable entries.");
  const r = Math.min(Math.max(e(), 0), 0.999999999) * s;
  let n = 0;
  for (const [a, c] of t.entries())
    if (n += c.weight, r < n) return { entry: c, index: a, roll: r };
  return { entry: t[t.length - 1], index: t.length - 1, roll: r };
}
class Re {
  constructor(e, t) {
    u(this, "catalogCache", null);
    this.deities = e, this.adapters = t;
  }
  async getSelectableDeities(e) {
    var y, v, m, f;
    const t = this.deities.list(), s = e.systemId ?? ((v = (y = globalThis.game) == null ? void 0 : y.system) == null ? void 0 : v.id) ?? "", r = { classId: e.classId, level: e.level, region: e.region, pantheonFilter: e.pantheonFilter, systemId: s, catalogContext: e.catalogContext }, n = JSON.stringify([t.map((h) => [h.id, h.revision]), r]);
    if (((m = this.catalogCache) == null ? void 0 : m.key) === n) return this.catalogCache.result;
    const o = await (((f = this.adapters.tryGet(s)) == null ? void 0 : f.listOfficialDeities()) ?? Promise.resolve([])), a = e.catalogContext ?? "characterBuilder", c = new Set(t.filter((h) => h.replacement.sourceUuid && (h.replacement.mode === "hide" || h.replacement.mode === "replace") && (!h.replacement.contexts.length || h.replacement.contexts.includes(a))).map((h) => h.replacement.sourceUuid)), d = pe(t, e, /* @__PURE__ */ new Set()), l = o.filter((h) => !h.sourceUuid || !c.has(h.sourceUuid)), g = [...d, ...l];
    return this.catalogCache = { key: n, result: g }, g;
  }
  exportDeities(e) {
    return Te(this.deities.list(), e);
  }
  importDeities(e) {
    const t = Ge(e);
    for (const s of t) this.deities.save(s);
    return this.catalogCache = null, t.length;
  }
  drawRandomDeity(e) {
    return Ce(this.deities.list().map((t) => ({ id: t.id, label: t.name, weight: 1 })), e);
  }
  getAdapterCapabilities(e) {
    return this.adapters.get(e).capabilities;
  }
  async materializeDeity(e, t, s) {
    const r = this.getDeity(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return this.adapters.get(t).materialize(r, s);
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
    var r;
    const t = (r = e.flags) == null ? void 0 : r["darkis-godforge"], s = t && typeof t == "object" && "deityId" in t && "grants" in t && "usages" in t ? t : null;
    return Se(this.getActorDeity(e), s);
  }
  getGrantChoices(e, t) {
    var s;
    return ((s = this.getDeity(e)) == null ? void 0 : s.grantGroups) ?? null;
  }
  getClassGrants(e, t, s = []) {
    const r = this.getDeity(e);
    if (!r) throw new Error(`Unknown deity: ${e}`);
    return De(r, t, s);
  }
  buildClassCoupling(e, t, s, r = []) {
    return this.adapters.get(s).buildClassCoupling(this.getClassGrants(e, t, r));
  }
  async assignDeity(e, t, s = {}) {
    const r = this.getDeity(t);
    if (!r || !r.visibility.players) throw new Error("Deity is not available for assignment.");
    const n = r.grantGroups.flatMap((a) => U(a, { groupId: a.id, refs: s[a.id] ?? [] })), o = Object.fromEntries(r.abilities.filter((a) => a.uses).map((a) => [a.id, { used: 0, max: a.uses.max, lastResetAt: Date.now(), reset: a.uses.reset }]));
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
    const s = this.readState(e), r = Date.now(), n = Object.fromEntries(Object.entries(s.usages).map(([o, a]) => a.reset === t ? [o, ve(a, r)] : [o, a]));
    await e.update({ flags: { "darkis-godforge": { ...s, usages: n } } });
  }
  async activateAbility(e, t, s = {}) {
    const r = this.readState(e), n = this.getDeity(r.deityId), o = n == null ? void 0 : n.abilities.find((l) => l.id === t);
    if (!o) throw new Error("Ability is not available for this actor.");
    const a = r.usages[t];
    if (a && !Q(a)) throw new Error("No uses remaining.");
    const c = a ? { ...r.usages, [t]: ye(a) } : r.usages, d = { id: e.id, modifiers: {}, conditions: [] };
    await Ae(o, { actor: d, target: s.target, facts: s.facts ?? { actor: { level: 0 }, target: {} }, rollDice: s.rollDice }), await e.update({ flags: { "darkis-godforge": { ...r, usages: c } } });
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
function re(i) {
  if (!i) return "icons/svg/eye.svg";
  const e = i.trim();
  return /^(?:javascript|data|vbscript):/i.test(e) || /^\/\//.test(e) || /[\u0000-\u001f]/.test(e) ? "icons/svg/eye.svg" : e;
}
function b() {
  var t, s;
  const e = (s = (t = globalThis.foundry) == null ? void 0 : t.applications) == null ? void 0 : s.api;
  return e != null && e.ApplicationV2 && e.HandlebarsApplicationMixin ? e.HandlebarsApplicationMixin(e.ApplicationV2) : class {
    render() {
      return Promise.resolve(this);
    }
  };
}
const Ue = { UI: { TITLE: "Darkis GodForge", TAGLINE: "Create gods. Shape belief.", SUBTITLE: "Forge destiny.", CREATE: "Create deity", CODEX: "Divine Codex", MY_DEITIES: "My deities", ENTRIES: "entries", DOMAINS: "Domains", ABILITIES: "Abilities", VISIBILITY: "Visibility", PASSIVE_BONUS: "Passive bonus", DIVINE_ABILITY: "Divine ability", SEARCH: "Search deities...", ALL_DOMAINS: "All domains", NO_RESULTS: "No deities found.", NEW_DEITY: "Create a new deity", NEW_DEITY_HINT: "Define the identity and first domains of your deity.", NAME: "Name", TITLE_FIELD: "Title", DESCRIPTION: "Description", ALIGNMENT: "Alignment", SAVE: "Save deity", CANCEL: "Cancel", OPEN_DASHBOARD: "Open GodForge", NEW_DEITY_PLACEHOLDER: "e.g. Tenebris", TITLE_PLACEHOLDER: "e.g. Goddess of Shadows", DOMAINS_PLACEHOLDER: "Shadows, secrets, deception", SANCTUARIES: "Sanctuaries" }, SETTINGS: { LANGUAGE: "GodForge language", LANGUAGE_HINT: "Language used by GodForge surfaces.", AUTO: "Automatic" }, ERROR: { NO_USES: "No uses remaining." } }, N = {
  DARKIS_GODFORGE: Ue
}, k = /* @__PURE__ */ new Map([["en", N]]);
async function B(i, e) {
  if (i === "auto" || k.has(i)) return;
  const t = await fetch(e);
  if (!t.ok) throw new Error(`Unable to load GodForge language ${i}.`);
  k.set(i, await t.json());
}
function Ne(i) {
  var n, o, a, c, d, l;
  const e = globalThis, t = (a = (o = (n = e.game) == null ? void 0 : n.settings) == null ? void 0 : o.get) == null ? void 0 : a.call(o, "darkis-godforge", "language");
  if (typeof t == "string" && t !== "auto") {
    const g = V(k.get(t), i);
    if (typeof g == "string") return g;
  }
  const s = (l = (d = (c = e.game) == null ? void 0 : c.i18n) == null ? void 0 : d.localize) == null ? void 0 : l.call(d, i);
  if (s && s !== i) return s;
  const r = V(N, i);
  return typeof r == "string" ? r : i;
}
function E() {
  return Object.fromEntries(Object.keys(N.DARKIS_GODFORGE.UI).map((i) => [i, Ne(`DARKIS_GODFORGE.UI.${i}`)]));
}
function V(i, e) {
  return e.split(".").reduce((t, s) => t && typeof t == "object" ? t[s] : void 0, i);
}
class T extends b() {
  constructor(t) {
    super();
    u(this, "searchTerm", "");
    u(this, "selectedDomain", "");
    this.deityService = t;
  }
  async _prepareContext() {
    const t = this.deityService.list().filter((s) => (!this.searchTerm || `${s.name} ${s.title}`.toLocaleLowerCase().includes(this.searchTerm)) && (!this.selectedDomain || s.domains.includes(this.selectedDomain)));
    return { ui: E(), deities: t, domains: [...new Set(this.deityService.list().flatMap((s) => s.domains))].sort(), searchTerm: this.searchTerm, selectedDomain: this.selectedDomain };
  }
  _onRender() {
    const t = this.element;
    if (!t) return;
    const s = t.querySelector("[data-search]"), r = t.querySelector("[data-filter]");
    s && (s.value = this.searchTerm), r && (r.value = this.selectedDomain), s == null || s.addEventListener("input", (n) => {
      this.searchTerm = n.target.value.toLocaleLowerCase(), this.render(!0);
    }), r == null || r.addEventListener("change", (n) => {
      this.selectedDomain = n.target.value, this.render(!0);
    });
  }
}
u(T, "DEFAULT_OPTIONS", { id: "darkis-godforge-codex", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), u(T, "PARTS", { main: { template: "modules/darkis-godforge/templates/codex.hbs" } });
class O extends b() {
  constructor(e, t) {
    super(), this.deityService = e, this.onSaved = t;
  }
  async _prepareContext() {
    return { ui: E() };
  }
  _onRender() {
    var s;
    const e = this.element;
    (s = e == null ? void 0 : e.querySelector("[data-action='close']")) == null || s.addEventListener("click", () => {
      var r;
      (r = this.close) == null || r.call(this);
    });
    const t = e == null ? void 0 : e.querySelector("form");
    t == null || t.addEventListener("submit", (r) => {
      var a;
      r.preventDefault();
      const n = new FormData(t), o = this.deityService.create({ name: String(n.get("name") ?? "").trim(), title: String(n.get("title") ?? "").trim(), description: String(n.get("description") ?? "").trim(), domains: String(n.get("domains") ?? "").split(",").map((c) => c.trim()).filter(Boolean), alignment: String(n.get("alignment") ?? "").trim() || void 0, passiveBonuses: [], abilities: [], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } });
      this.onSaved(o), (a = this.close) == null || a.call(this);
    });
  }
}
u(O, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-editor", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.NEW_DEITY", resizable: !0 } }), u(O, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-editor.hbs" } });
class G extends b() {
  constructor(e) {
    super(), this.deity = e;
  }
  async _prepareContext() {
    return { ui: E(), deity: { ...this.deity, image: re(this.deity.image) } };
  }
}
u(G, "DEFAULT_OPTIONS", { id: "darkis-godforge-deity-detail", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), u(G, "PARTS", { main: { template: "modules/darkis-godforge/templates/deity-detail.hbs" } });
class C extends b() {
  constructor(e) {
    super(), this.deityService = e;
  }
  async _prepareContext() {
    const e = E(), t = this.deityService.list().map((s) => ({ ...s, image: re(s.image) }));
    return { ui: e, deities: t, stats: { deities: t.length, sanctuaries: 0, bonuses: t.reduce((s, r) => s + r.passiveBonuses.length, 0), abilities: t.reduce((s, r) => s + r.abilities.length, 0) } };
  }
  _onRender() {
    var t;
    const e = this.element;
    e && (e.querySelectorAll("[data-action='create']").forEach((s) => s.addEventListener("click", () => new O(this.deityService, () => void this.render(!0)).render(!0))), (t = e.querySelector("[data-action='codex']")) == null || t.addEventListener("click", () => new T(this.deityService).render(!0)), e.querySelectorAll("[data-deity]").forEach((s) => s.addEventListener("click", () => {
      const r = this.deityService.get(s.dataset.deity ?? "");
      r && new G(r).render(!0);
    })));
  }
}
u(C, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE", resizable: !0 } }), u(C, "PARTS", { main: { template: "modules/darkis-godforge/templates/dashboard.hbs" } });
class Fe {
  constructor() {
    u(this, "definitions", /* @__PURE__ */ new Map());
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
    const r = { ...s, ...structuredClone(t), id: e, revision: s.revision + 1, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    return r.checksum = this.checksum(r), this.save(r);
  }
  delete(e) {
    return this.definitions.delete(e);
  }
  checksum(e) {
    const t = JSON.stringify({ ...e, checksum: void 0 });
    let s = 2166136261;
    for (let r = 0; r < t.length; r += 1) s = Math.imul(s ^ t.charCodeAt(r), 16777619);
    return (s >>> 0).toString(16);
  }
}
function Me() {
  const i = globalThis;
  return i.Hooks ? { Hooks: i.Hooks, game: i.game } : null;
}
function $(i) {
  if (!i || typeof i != "object") return !1;
  const e = i;
  return typeof e.id == "string" && typeof e.name == "string" && typeof e.schemaVersion == "number" && Array.isArray(e.domains) && Array.isArray(e.abilities);
}
const D = "darkis-godforge";
class _e {
  constructor(e) {
    this.collection = e;
  }
  load() {
    return this.collection.contents.flatMap((e) => {
      var s;
      const t = (s = e.flags) == null ? void 0 : s[D];
      return t && typeof t == "object" && "deity" in t && $(t.deity) ? [t.deity] : [];
    });
  }
  async save(e) {
    const t = this.collection.contents.find((n) => {
      var a;
      const o = (a = n.flags) == null ? void 0 : a[D];
      return o && typeof o == "object" && "deity" in o && $(o.deity) && o.deity.id === e.id;
    }), s = { [D]: { schemaVersion: e.schemaVersion, deity: e } };
    return t ? (await t.update({ flags: s }), t.uuid) : this.collection.create ? (await this.collection.create({ name: e.name, flags: s })).uuid : null;
  }
}
function xe(i) {
  if (!i || typeof i != "object" || !("registerModule" in i)) return null;
  const t = i.registerModule("darkis-godforge");
  if (!t || typeof t != "object" || !("register" in t) || !("executeAsGM" in t)) return null;
  const s = t;
  return { register: (r, n) => s.register(r, n), executeAsGM: (r, n) => s.executeAsGM(r, n) };
}
const p = "darkis-godforge";
function Le(i, e, t, s) {
  const r = Me();
  r && (r.Hooks.once("init", () => {
    var a, c, d, l, g, y, v;
    const n = ((d = (c = (a = r.game) == null ? void 0 : a.modules) == null ? void 0 : c.get(p)) == null ? void 0 : d.languages) ?? [{ lang: "de", name: "Deutsch" }, { lang: "en", name: "English" }], o = Object.fromEntries([["auto", "DARKIS_GODFORGE.SETTINGS.AUTO"], ...n.map((m) => [m.lang, m.name])]);
    (g = (l = r.game) == null ? void 0 : l.settings) == null || g.register(p, "language", { name: "DARKIS_GODFORGE.SETTINGS.LANGUAGE", hint: "DARKIS_GODFORGE.SETTINGS.LANGUAGE_HINT", scope: "client", config: !0, type: String, default: "auto", choices: o, onChange: (m) => {
      if (typeof m != "string" || m === "auto") return;
      const f = n.find((h) => h.lang === m);
      f != null && f.path && B(m, `modules/${p}/${f.path}`);
    } }), (v = (y = r.game) == null ? void 0 : y.keybindings) == null || v.register(p, "open-dashboard", { name: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", editable: [], onDown: () => {
      var m, f;
      return ((f = (m = r.game) == null ? void 0 : m.user) == null ? void 0 : f.isGM) !== !0 ? !1 : (t(), !0);
    } });
  }), r.Hooks.on("getSceneControlButtons", (...n) => {
    var c, d;
    const o = n[0];
    if (!Array.isArray(o)) return;
    const a = o.find((l) => typeof l == "object" && l !== null && "tools" in l);
    !(a != null && a.tools) || !Array.isArray(a.tools) || a.tools.push({ name: p, title: "DARKIS_GODFORGE.UI.OPEN_DASHBOARD", icon: "fas fa-hammer", button: t, visible: ((d = (c = r.game) == null ? void 0 : c.user) == null ? void 0 : d.isGM) === !0 });
  }), r.Hooks.once("ready", async () => {
    var l, g, y, v, m, f, h, M, _, x, L, P, j;
    const n = (y = (g = (l = r.game) == null ? void 0 : l.settings) == null ? void 0 : g.get) == null ? void 0 : y.call(g, p, "language"), o = (h = (f = (m = (v = r.game) == null ? void 0 : v.modules) == null ? void 0 : m.get(p)) == null ? void 0 : f.languages) == null ? void 0 : h.find((A) => A.lang === n);
    typeof n == "string" && (o != null && o.path) && await B(n, `modules/${p}/${o.path}`);
    const a = (M = r.game) == null ? void 0 : M.journal;
    if (a) for (const A of new _e(a).load()) e.save(A);
    const c = xe((L = (x = (_ = r.game) == null ? void 0 : _.modules) == null ? void 0 : x.get("socketlib")) == null ? void 0 : L.api);
    c && s && (s.setTransport(c), s.register());
    const d = (j = (P = r.game) == null ? void 0 : P.modules) == null ? void 0 : j.get(p);
    d && (d.api = i);
  }));
}
class Pe {
  constructor(e, t, s) {
    u(this, "activations", /* @__PURE__ */ new Map());
    this.api = e, this.authority = t, this.transport = s;
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
const F = new Fe(), ne = new me(), ae = new Re(F, ne);
function H() {
  new C(F).render(!0);
}
const w = globalThis;
var W, z, K, q;
const je = new Pe(ae, { currentUserId: ((z = (W = w.game) == null ? void 0 : W.user) == null ? void 0 : z.id) ?? "unknown", isGM: ((q = (K = w.game) == null ? void 0 : K.user) == null ? void 0 : q.isGM) ?? !1, ownsActor: (i, e) => {
  var s;
  const t = i;
  return ((s = t.testUserPermission) == null ? void 0 : s.call(t, { id: e }, "OWNER")) ?? !1;
}, resolveActor: (i) => {
  var e, t;
  return ((t = (e = w.game) == null ? void 0 : e.actors) == null ? void 0 : t.get(i)) ?? null;
} });
var Y, J;
if (w.Hooks) {
  const i = (J = (Y = w.game) == null ? void 0 : Y.system) == null ? void 0 : J.id;
  i && !ne.supports(i) ? w.Hooks.once("ready", () => {
    var e, t, s;
    (s = (t = (e = globalThis.ui) == null ? void 0 : e.notifications) == null ? void 0 : t.warn) == null || s.call(t, `Darkis GodForge does not support ${i}.`);
  }) : Le(ae, F, H, je);
} else typeof document < "u" && H();
export {
  C as GodForgeDashboard,
  ae as api,
  F as deityService,
  ne as registry,
  je as socketRouter
};
