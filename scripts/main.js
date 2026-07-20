var v = Object.defineProperty;
var b = (i, e, s) => e in i ? v(i, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : i[e] = s;
var a = (i, e, s) => b(i, typeof e != "symbol" ? e + "" : e, s);
class f {
  constructor() {
    a(this, "id", "generic");
    a(this, "capabilities", { lore: !0, deity: !1, passiveBonuses: !1, abilities: !1, classCoupling: !1, selectors: [] });
  }
  async materialize(e) {
    return null;
  }
  buildPassiveBonus(e) {
    return null;
  }
}
class y {
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
class G {
  constructor() {
    a(this, "adapters", /* @__PURE__ */ new Map());
    this.register(new f()), this.register(new y());
  }
  register(e) {
    this.adapters.set(e.id, e);
  }
  get(e) {
    return this.adapters.get(e) ?? this.adapters.get("generic");
  }
}
function k(i) {
  return { id: i.id, name: i.name, title: i.title, image: i.image, domains: i.domains, alignment: i.alignment };
}
function S(i, e, s) {
  return i.filter((t) => t.visibility.library && !s.has(t.id) && (!e.pantheonFilter || t.domains.includes(e.pantheonFilter))).map(k);
}
class D {
  constructor(e, s) {
    this.deities = e, this.adapters = s;
  }
  getSelectableDeities(e) {
    return S(this.deities.list(), e, /* @__PURE__ */ new Set());
  }
  getDeity(e) {
    return this.deities.get(e);
  }
  getReplacementFor(e) {
    return this.deities.list().find((s) => s.replacement.sourceUuid === e && s.replacement.mode === "replace") ?? null;
  }
  isSourceHidden(e, s) {
    return this.deities.list().some((t) => t.replacement.sourceUuid === e && t.replacement.mode === "hide" && t.replacement.contexts.includes(s));
  }
  registerAdapter(e) {
    this.adapters.register(e);
  }
}
const $ = [
  { id: "tenebris", schemaVersion: 1, revision: 1, createdAt: "2026-07-20", updatedAt: "2026-07-20", checksum: "sample", name: "Tenebris", title: "Göttin der Schatten und Geheimnisse", description: "Sie kennt die Geheimnisse, die im Verborgenen liegen.", image: "icons/svg/eye.svg", alignment: "Neutral Böse", domains: ["Geheimnisse", "Schatten", "Täuschung", "Tod"], passiveBonuses: [{ id: "shadow-sight", name: "Schattenblick", selector: "perception", value: 1, modifierType: "status", visible: !0 }], abilities: [{ id: "dark-whisper", name: "Flüstern der Dunkelheit", description: "Einmal pro Tag erhältst du eine wertvolle Information.", uses: { max: 1, reset: "daily" }, effects: [{ type: "message", text: "Die Schatten flüstern." }] }], grantGroups: [], replacement: { sourceUuid: "", mode: "none", contexts: [] }, visibility: { library: !0, players: !0, characterSheet: !0 } }
];
function w() {
  var i, e, s;
  return ((s = (e = (i = globalThis.foundry) == null ? void 0 : i.applications) == null ? void 0 : e.api) == null ? void 0 : s.ApplicationV2) ?? class {
    render() {
    }
  };
}
class g extends w() {
  constructor(s) {
    super();
    a(this, "deityService");
    this.deityService = s;
    for (const t of $) s.save(t);
  }
  render(s = !1) {
    const t = document.createElement("div");
    t.className = "dg-dashboard", t.innerHTML = this.template(this.deityService.list()), document.body.append(t), t.querySelectorAll("[data-deity]").forEach((n) => n.addEventListener("click", () => this.showDetail(n.dataset.deity ?? "")));
  }
  template(s) {
    return `<header class="dg-hero"><img src="${String(globalThis.DG_LOGO ?? "logo.png")}" alt="Darkis GodForge"><div><p class="eyebrow">DARKIS GODFORGE</p><h1>Götter erschaffen. Glauben formen.</h1><p class="muted">Schicksal schmieden.</p></div><button class="dg-primary" data-create>＋ Neuen Gott erstellen</button></header><main><section class="dg-panel"><div class="dg-section-title"><h2>Meine Götter</h2><span>${s.length} Einträge</span></div><div class="dg-grid">${s.map((t) => `<article class="dg-card" data-deity="${t.id}"><div class="dg-card-art"><img src="${t.image ?? "icons/svg/eye.svg"}" alt=""></div><h3>${t.name}</h3><p>${t.title}</p><div class="dg-tags">${t.domains.slice(0, 3).map((n) => `<span>${n}</span>`).join("")}</div></article>`).join("")}<button class="dg-card dg-add" data-create><span>＋</span><strong>Neuen Gott erstellen</strong><small>In dein Pantheon aufnehmen</small></button></div></section><section class="dg-stats"><div><strong>${s.length}</strong><span>Gottheiten</span></div><div><strong>12</strong><span>Glaubensorte</span></div><div><strong>47</strong><span>Würfel-Boni</span></div><div><strong>9</strong><span>Rituale</span></div></section></main>`;
  }
  showDetail(s) {
    var d, l, o, c, u;
    const t = this.deityService.get(s);
    if (!t) return;
    const n = document.createElement("div");
    n.className = "dg-detail", n.innerHTML = `<button class="dg-close">×</button><div class="dg-detail-art"><img src="${t.image ?? "icons/svg/eye.svg"}" alt=""></div><div><p class="eyebrow">GÖTTLICHE DEFINITION</p><h2>${t.name}</h2><p class="muted">${t.title}</p><p>${t.description}</p><div class="dg-tabs"><button class="active">Übersicht</button><button>Domänen</button><button>Fähigkeiten</button><button>Sichtbarkeit</button></div><div class="dg-detail-grid"><div><h3>Domänen</h3><div class="dg-list">${t.domains.map((h) => `<div>${h}<span>＋1</span></div>`).join("")}</div></div><div><h3>Passiver Bonus</h3><div class="dg-callout"><strong>＋${((d = t.passiveBonuses[0]) == null ? void 0 : d.value) ?? 0}</strong><span>${((l = t.passiveBonuses[0]) == null ? void 0 : l.name) ?? "Noch kein Bonus"}</span></div><h3>Göttliche Fähigkeit</h3><div class="dg-callout"><strong>${((o = t.abilities[0]) == null ? void 0 : o.name) ?? "Noch keine Fähigkeit"}</strong><span>${((c = t.abilities[0]) == null ? void 0 : c.description) ?? "Definiere dein erstes Wunder."}</span></div></div></div></div>`, document.body.append(n), (u = n.querySelector(".dg-close")) == null || u.addEventListener("click", () => n.remove());
  }
}
a(g, "DEFAULT_OPTIONS", { id: "darkis-godforge-dashboard", classes: ["darkis-godforge"], window: { title: "DARKIS_GODFORGE.UI.TITLE" } });
class T {
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
const m = new T(), F = new G(), A = new D(m, F);
function p() {
  new g(m).render(!0);
}
const r = globalThis;
r.Hooks ? r.Hooks.once("ready", () => {
  var e, s;
  const i = (s = (e = r.game) == null ? void 0 : e.modules) == null ? void 0 : s.get("darkis-godforge");
  i && (i.api = A), p();
}) : typeof document < "u" && p();
export {
  g as GodForgeDashboard,
  A as api,
  m as deityService,
  F as registry
};
