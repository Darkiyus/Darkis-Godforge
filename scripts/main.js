var v = Object.defineProperty;
var f = (s, e, t) => e in s ? v(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var a = (s, e, t) => f(s, typeof e != "symbol" ? e + "" : e, t);
class b {
  constructor() {
    a(this, "id", "pf2e");
    a(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll"] });
  }
  async materialize(e) {
    return null;
  }
  // TODO(verify): create Item type deity against installed PF2e version.
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class y {
  constructor() {
    a(this, "id", "sfrpg");
    a(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !1, selectors: ["perception", "stealth", "bluff", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e) {
    return null;
  }
  // TODO(verify): confirm the installed sfrpg document schema.
  buildPassiveBonus(e) {
    return { key: "Modifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class k {
  constructor() {
    a(this, "id", "sf2e");
    a(this, "capabilities", { lore: !0, deity: !0, passiveBonuses: !0, abilities: !0, classCoupling: !0, selectors: ["perception", "stealth", "deception", "ac", "attack-roll", "piloting"] });
  }
  async materialize(e) {
    return null;
  }
  // TODO(verify): confirm the installed sf2e deity document schema.
  buildPassiveBonus(e) {
    return { key: "FlatModifier", selector: e.selector, value: e.value, type: e.modifierType, slug: e.id };
  }
}
class S {
  constructor() {
    a(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new b()), this.register(new k()), this.register(new y());
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
function G(s) {
  return { id: s.id, name: s.name, title: s.title, image: s.image, domains: s.domains, alignment: s.alignment };
}
function w(s, e, t) {
  return s.filter((i) => i.visibility.library && !t.has(i.id) && (!e.pantheonFilter || i.domains.includes(e.pantheonFilter))).map(G);
}
class $ {
  constructor(e, t) {
    this.deities = e, this.adapters = t;
  }
  getSelectableDeities(e) {
    return w(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getDeity(e) {
    return this.deities.get(e);
  }
  getReplacementFor(e) {
    return this.deities.list().find((t) => t.replacement.sourceUuid === e && t.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, t) {
    return this.deities.list().some((i) => i.replacement.sourceUuid === e && i.replacement.mode === "hide" && i.replacement.contexts.includes(t));
  }
  registerAdapter(e) {
    this.adapters.register(e);
  }
}
const D = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function T() {
  var s, e, t;
  return ((t = (e = (s = globalThis.foundry) == null ? void 0 : s.applications) == null ? void 0 : e.api) == null ? void 0 : t.ApplicationV2) ?? class {
    render() {
    }
  };
}
class g extends T() {
  constructor(t) {
    super();
    a(this, "deityService");
    this.deityService = t;
    for (const i of D) t.save(i);
  }
  render(t = !1) {
    const i = document.createElement("div");
    i.className = "dg-dashboard", i.innerHTML = this.template(this.deityService.list()), document.body.append(i), i.querySelectorAll("[data-deity]").forEach((n) => n.addEventListener("click", () => this.showDetail(n.dataset.deity ?? "")));
  }
  template(t) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${t.length} Einträge</span></div><div class="dg-grid">${t.map((i) => `<article class="dg-card" data-deity="${i.id}"><div class="dg-card-art"><img src="${i.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${i.name}</h3><p>${i.title}</p><div class="dg-tags">${i.domains.slice(0, 3).map((n) => `<span>${n}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${t.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(t) {
    var l, d, o, c, u;
    const i = this.deityService.get(t);
    if (!i) return;
    const n = document.createElement("div");
    n.className = "dg-detail", n.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${i.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${i.name}</h2><p class="muted">${i.title}</p><p>${i.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${i.domains.map((m) => `<div>${m}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((l = i.passiveBonuses[0]) == null ? void 0 : l.value) ?? 0}</strong><span>${((d = i.passiveBonuses[0]) == null ? void 0 : d.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((o = i.abilities[0]) == null ? void 0 : o.name) ?? "Noch keine Fähigkeit"}</strong><span>${((c = i.abilities[0]) == null ? void 0 : c.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(n), (u = n.querySelector(".dg-close")) == null || u.addEventListener("click", () => n.remove());
  }
}
a(g, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class F {
  constructor() {
    a(this, "definitions", /* @__PURE__ */ new Map());
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
  delete(e) {
    return this.definitions.delete(e);
  }
}
const h = new F(), A = new S(), E = new $(h, A);
function p() {
  new g(h).render(!0);
}
const r = globalThis;
r.Hooks ? r.Hooks.once("ready", () => {
  var e, t;
  const s = (t = (e = r.game) == null ? void 0 : e.modules) == null ? void 0 : t.get("darkis-godforge");
  s && (s.api = E), p();
}) : typeof document < "u" && p();
export {
  g as GodForgeDashboard,
  E as api,
  h as deityService,
  A as registry
};
