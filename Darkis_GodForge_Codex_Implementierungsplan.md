# Darkis GodForge – Implementierungsplan & Regieanweisung für Codex

**Dokumenttyp:** Coding-Plan / Regiebuch für einen KI-Coding-Agenten (OpenAI Codex)
**Zielprodukt:** Foundry-VTT-**v14**-Modul „Darkis GodForge" – frei konfigurierbare Homebrew-Gottheiten, die offizielle Gottheiten **ersetzen**
**Primäres Spielsystem:** Pathfinder 2e (`pf2e`) – andere Systeme später über Adapter
**Grundlagen:** `Darkis_GodForge_Technische_Spezifikation.md` (Pflichtenheft) · `Darkis_GodForge_Design_UX_Spezifikation.md` (UI/UX) · `logo.png` · Dashboard-Mockups `9ff2b992-*.png`, `460bf98f-*.png`
**Sprache dieses Dokuments:** Deutsch. Code, Bezeichner, API-Namen und Lokalisierungs-Keys: Englisch.

> **An Codex:** Dieses Dokument ist deine verbindliche Regieanweisung. Es beschreibt *wie* du arbeiten sollst (Kapitel 0–3), *was* das System ist (Kapitel 4–8) und *welche Arbeitspakete* du in welcher Reihenfolge abarbeitest (Kapitel 9–13). Lies Kapitel 0–3 **vollständig**, bevor du die erste Zeile Code schreibst. Sie existieren, weil sie genau die Fehler verhindern, die Modelle wie du in Foundry-Projekten typischerweise machen.

---

## Inhaltsverzeichnis

- **Kapitel 0** – Wie Codex dieses Dokument benutzt (Arbeitsweise)
- **Kapitel 1** – Codex-Schwächen und verbindliche Gegenmaßnahmen
- **Kapitel 2** – Produktüberblick & Kernentscheidungen
- **Kapitel 3** – Verbindliche technische Leitplanken (Guardrails)
- **Kapitel 4** – Zielarchitektur
- **Kapitel 5** – Datenmodell inkl. AND/OR-Verknüpfung von Boni & Fähigkeiten
- **Kapitel 6** – Klassen-Gott-Kopplung (Kleriker & Co.) – der kritische PF2e-Teil
- **Kapitel 7** – Leveler-Integration & öffentliche API
- **Kapitel 8** – Quellen & Referenzen (mit Prüf-Auftrag)
- **Kapitel 9** – Arbeitspakete / Tickets (Phasen A–E)
- **Kapitel 10** – Teststrategie (Codex kann Foundry nicht selbst starten)
- **Kapitel 11** – Definition of Done
- **Kapitel 12** – Namens- und Style-Konventionen
- **Kapitel 13** – Glossar

---

# Kapitel 0 – Wie Codex dieses Dokument benutzt

## 0.1 Arbeitsprinzip: ein Ticket nach dem anderen

Du baust dieses Modul **nicht in einem großen Wurf**. Du arbeitest die Tickets aus Kapitel 9 **einzeln, in Reihenfolge** ab. Für jedes Ticket gilt der immer gleiche Ablauf:

1. **Ticket + verlinkte Spec-Abschnitte lesen.** Jedes Ticket nennt die relevanten Kapitel der beiden Spezifikationen. Öffne sie wirklich, rate nicht.
2. **Betroffene Dateien auflisten**, bevor du schreibst. Wenn du eine neue Datei anlegst, prüfe, ob es dafür schon eine Stelle in der Modulstruktur (Kapitel 4) gibt.
3. **Nur den Ticket-Umfang umsetzen.** Keine „Bonus-Features", keine vorauseilenden Abstraktionen für Tickets, die noch nicht dran sind.
4. **Leitplanken (Kapitel 1 + 3) einhalten.** Diese sind nicht optional.
5. **Akzeptanzkriterien abhaken.** Ein Ticket ist erst fertig, wenn *jedes* Kriterium erfüllt ist.
6. **Manuellen Testplan** (im Ticket) als Kommentar/Checkliste hinterlassen, weil du Foundry nicht selbst startest (siehe Kapitel 10).
7. **Kurze Zusammenfassung** liefern: geänderte Dateien, offene Punkte, benötigte Entscheidungen.

## 0.2 Wenn dir Wissen fehlt

- **Erfinde niemals eine Foundry- oder PF2e-API.** Wenn du eine Methode, ein Datenfeld oder ein Rule-Element-Format nicht sicher kennst, tue eines von drei Dingen: (a) im offiziellen PF2e-Systemquellcode nachschlagen (Kapitel 8), (b) explizit als `// TODO(verify): <konkrete Frage>` markieren, (c) im Zusammenfassungstext als offene Frage an den Menschen stellen. **Lieber ein markiertes TODO als eine halluzinierte Signatur.**
- **Trainingsdaten sind veraltet.** Foundry v14 und der PF2e-Adapter unterscheiden sich stark von dem, was du „aus dem Gedächtnis" kennst (v9–v11). Kapitel 1 + 3 sagen dir, welche alten Muster **verboten** sind.

## 0.3 Was „fertig" bedeutet

Fertig heißt: kompiliert (TypeScript strict, keine Fehler), lint-sauber, folgt den Leitplanken, alle Akzeptanzkriterien erfüllt, manueller Testplan dokumentiert, keine toten/ungenutzten Exporte, alle nutzersichtbaren Strings lokalisiert. Siehe Kapitel 11.

---

# Kapitel 1 – Codex-Schwächen und verbindliche Gegenmaßnahmen

Dieses Kapitel ist der Kern des Auftrags. Es benennt die typischen Fehlerquellen von KI-Coding-Agenten **in genau diesem Projekttyp** und legt für jede eine harte Regel fest.

| # | Typische Schwäche | Wie sie sich hier zeigt | Verbindliche Gegenmaßnahme |
|---|---|---|---|
| 1 | **Veraltete Framework-Muster** | Du kennst Foundry aus v9–v11: `Application`, `FormApplication`, `Dialog`, `mergeObject`, `entity.data.data`. Das ist in **v13/v14 entfernt oder deprecated**. | **Nur ApplicationV2 / DialogV2 / HandlebarsApplicationMixin.** Keine V1-Application-Klasse. Kein `Dialog`, stattdessen `foundry.applications.api.DialogV2`. Kein `.data.data`, sondern `.system`. Siehe Kapitel 3.2. |
| 2 | **API-Halluzination** | Du erfindest plausibel klingende PF2e-Rule-Elements, Deity-Felder oder Hook-Namen, die es nicht gibt. | **Kein API-Aufruf ohne Beleg.** Jede PF2e-spezifische Struktur muss aus dem echten Systemquellcode oder der RE-Wiki (Kapitel 8) stammen. Unbelegtes → `// TODO(verify)`. |
| 3 | **Scope-Wucherung / Überengineering** | Du baust „gleich alles mit", erzeugst Abstraktionsschichten, die kein Ticket verlangt, und riesige Dateien. | **Strikt Ticket-Scope.** Eine Änderung pro Ticket. Keine spekulativen Interfaces. Dateien < ~400 Zeilen; größere aufteilen. |
| 4 | **Architektur-Drift / Duplikate** | Du dupliziert Logik, weil du den bestehenden Code nicht liest. Systempfade landen quer im Code. | **Adapter-Isolation ist heilig:** *kein* `pf2e`-spezifischer Pfad außerhalb von `scripts/adapters/pf2e/`. Der Kern kennt nur Adapter-Interfaces (Kapitel 4.3). |
| 5 | **Keine Ausführung/Verifikation** | Du kannst Foundry nicht starten und meldest Dinge trotzdem als „funktioniert". | **Nichts als getestet melden, das du nicht getestet hast.** Jedes Ticket enthält einen *manuellen* Testplan für den Menschen. Formuliere ihn präzise; behaupte keine Laufzeit-Ergebnisse. |
| 6 | **Sicherheits-Abkürzungen** | Du greifst zu `eval()` / `new Function()` für Formeln, führst importiertes JS aus, oder lässt Spieler-Clients fremde Actors verändern. | **`eval`/`new Function` sind verboten** (Kapitel 3.4). Sicherheitskritische Änderungen laufen **GM-autoritativ** über Socket (Kapitel 3.6). Import führt **nie** automatisch Code aus. |
| 7 | **Lose Typisierung** | `any` überall, optionales Chaining statt echter Typen, stille `as`-Casts. | **TypeScript `strict`**. `any` nur mit `// TODO(types)`-Begründung. Datenmodelle aus Kapitel 5 als echte `interface`/`type`. |
| 8 | **Hardcodierte Strings** | Deutsche/englische Texte direkt im Code oder Template. | **Alle nutzersichtbaren Strings über `game.i18n`** + `lang/en.json` + `lang/de.json`. Kein Literal-Text in TS/HBS. |
| 9 | **Falsche Trennung von Konzepten** | Du vermischst Aktionskosten, Nutzung, Reset, Cooldown und Dauer – der häufigste Denkfehler in diesem Datenmodell. | Diese fünf sind **getrennte Felder** (Tech-Spec Kap. 11). Der Editor und das Datenmodell dürfen sie nie zusammenlegen. |
| 10 | **Manifest-Fehler** | Du schreibst ein v9-`module.json` mit `name`, `minimumCoreVersion`, `compatibleCoreVersion`. | v13/14-Manifest: `id`, `compatibility{minimum,verified,maximum}`, `relationships`, `esmodules`, `packs[].type`. Siehe Kapitel 3.1. |
| 11 | **Kontextverlust über lange Tasks** | Nach vielen Schritten „vergisst" du frühere Entscheidungen und widersprichst dir. | Am Ende jedes Tickets **Kurz-Changelog** in `CHANGELOG-DEV.md` schreiben (Datei, Entscheidung, offene Punkte). Beim nächsten Ticket zuerst dorthin schauen. |
| 12 | **PF2e-Stapelregeln ignoriert** | Du addierst zwei Statusboni, weil „+1 und +1 = +2" naiv stimmt. | PF2e stapelt nach Bonus-**Typ** (status/circumstance/item/untyped): gleicher Typ → nur der höchste. Boni **immer** mit `modifierType` versehen, Stapelverhalten dem System überlassen. |
| 13 | **UI ignoriert Adapter-Fähigkeiten** | Editor bietet „RK-Bonus" an, obwohl der aktive Adapter das gar nicht kann. | UI rendert nur Optionen, die `adapter.capabilities` meldet (Tech-Spec Kap. 4.2). Nicht unterstützt → sichtbar markieren, nicht still ignorieren. |
| 14 | **Verständliche Fehler fehlen** | Du wirfst rohe `Cannot read properties of undefined` an den Spieler. | Fehler für Endnutzer immer erklärend (Tech-Spec Kap. 35): *„Betörende Herrschaft: Ziel ist Stufe 9, Anwender Stufe 7."* |

> **Merksatz für Codex:** *Im Zweifel weniger Code, mehr Belege, klarere Grenzen.* Jede Zeile, die eine dieser 14 Regeln bricht, ist ein Fehler – auch wenn sie „funktioniert".

---

# Kapitel 2 – Produktüberblick & Kernentscheidungen

## 2.1 Was gebaut wird (Ein-Absatz-Zusammenfassung)

Ein Foundry-VTT-v14-Modul, mit dem eine Spielleitung eigene Gottheiten erschafft, die offizielle PF2e-Gottheiten in allen Auswahl- und Anzeige-Oberflächen **ersetzen** (ohne Originaldaten zu löschen). Jede Homebrew-Gottheit liefert dieselben systemrelevanten Werte wie eine echte PF2e-Gottheit (Domänen, Font, bevorzugte Waffe, Fertigkeit, Zauber, Heiligung) **sowie** zusätzliche passive Boni und aktive „göttliche Wunder" mit voller Nutzungs-, Trigger-, Bedingungs- und Effektlogik. Bedienung über ein eigenes GM-Dashboard, ein Spieler-„Götterkodex" und einen In-Game-„Hub". Integration in den hauseigenen **Darkis PF2e Leveler** über eine öffentliche API.

## 2.2 Nicht-Verhandelbare Kernentscheidungen

- **Systemneutraler Kern + Systemadapter.** Der Kern ist PF2e-frei. Ein automatisch erkannter Adapter (`game.system.id`) liefert alle systemspezifischen Werte. PF2e ist der einzige Vollausbau-Adapter in v1.0; ein `generic`-Fallback-Adapter existiert.
- **Zwei-Dokumente-Modell.** Kanonische, systemneutrale Definition als `JournalEntry` (unter Modul-Flags) + materialisiertes PF2e-`Item` (Typ `deity`) für die Systemintegration. Verknüpfung über `definitionUuid` / `materializedUuid` (Tech-Spec Kap. 5).
- **Original bleibt unangetastet.** Offizielle Packs werden nie editiert oder gelöscht. Ersetzung passiert über einen **gefilterten Katalog**, den alle Auswahlflächen abfragen (Tech-Spec Kap. 7).
- **Ein Datenmodell für Easy- und Expertenmodus.** Der Easy Mode ist nur eine vereinfachte Sicht auf dieselbe Struktur (Tech-Spec Kap. 2.3). **Keine parallelen Modelle.**
- **GM-Autorität für kritische Effekte** (Kapitel 3.6).

## 2.3 Empfohlener Tech-Stack (Umsetzung durch Codex, Begründung im Ticket A0)

- **Sprache:** TypeScript (`strict`).
- **Build:** Vite (ES-Module-Bundle) → `scripts/main.js` als `esmodule`. *(Alternative: rollup/esbuild — nur bei begründetem Vorteil.)*
- **UI:** Foundry **ApplicationV2 + HandlebarsApplicationMixin**, Templates in Handlebars. Kein React/Vue im Kern (Foundry-native, geringere Bruchgefahr bei v-Updates). Für den komplexen Expertenmodus-Graphen (Kapitel 9, Ticket C-…) darf lokal eine gekapselte JS-Graph-Komponente entstehen, aber ohne Framework-Zwang.
- **Sockets:** `socketlib` (Kapitel 8) für GM-autoritative Aufrufe.
- **Typen:** community Foundry-Types + PF2e-Typen soweit verfügbar; fehlende Typen als schmale eigene `types/`-Deklarationen, **nicht** `any`.

---

# Kapitel 3 – Verbindliche technische Leitplanken (Guardrails)

## 3.1 `module.json` (v14-konform) – Referenzskelett

> Codex: Genau dieses Schema, keine v9-Felder. `packs[].type` und `compatibility` sind Pflicht.

```jsonc
{
  "id": "darkis-godforge",
  "title": "Darkis GodForge",
  "description": "Frei konfigurierbare Homebrew-Gottheiten, die offizielle Gottheiten ersetzen.",
  "version": "0.1.0",
  "compatibility": { "minimum": "13", "verified": "14", "maximum": "14" },
  "authors": [{ "name": "Darkis" }],
  "esmodules": ["scripts/main.js"],
  "styles": ["styles/godforge.css"],
  "languages": [
    { "lang": "en", "name": "English", "path": "lang/en.json" },
    { "lang": "de", "name": "Deutsch", "path": "lang/de.json" }
  ],
  "packs": [
    {
      "name": "godforge-deities",
      "label": "GodForge Deities",
      "type": "JournalEntry",
      "path": "packs/godforge-deities",
      "system": "pf2e",
      "ownership": { "PLAYER": "OBSERVER", "ASSISTANT": "OWNER" }
    }
  ],
  "relationships": {
    "systems": [{ "id": "pf2e", "type": "system", "compatibility": { "minimum": "6.0.0" } }],
    "requires": [{ "id": "socketlib", "type": "module" }],
    "recommends": [{ "id": "lib-wrapper", "type": "module" }]
  },
  "flags": {}
}
```

> `TODO(verify)`: Die exакte PF2e-Mindestversion für deine Foundry-v14-Installation prüfen (Kapitel 8). Der Wert `6.0.0` ist ein Platzhalter.

## 3.2 UI-Framework – Pflicht: ApplicationV2

- Basisklasse: `foundry.applications.api.ApplicationV2`, gemischt mit `foundry.applications.api.HandlebarsApplicationMixin`.
- Dialoge: `foundry.applications.api.DialogV2` (`DialogV2.confirm`, `DialogV2.prompt`), **nicht** `Dialog`.
- Datenzugriff: `document.system.*` statt `document.data.data.*`. Objekt-Merge: `foundry.utils.mergeObject`, nicht globales `mergeObject`.
- Settings: `game.settings.register` mit v13+-Signatur; komplexe Settings-Menüs als `ApplicationV2`.
- Scene-Controls-Button und Hotkeys über die v13+-Hooks/Keybinding-API registrieren (`getSceneControlButtons`, `game.keybindings.register`).

> Wenn du unsicher bist, ob ein Konstrukt V1 oder V2 ist: es ist wahrscheinlich V1 aus deinen Trainingsdaten → nachschlagen (Kapitel 8), nicht raten.

## 3.3 Adapter-Isolation

- **Regel:** `game.system.id === "pf2e"`, jeder String wie `"pf2e"`, jeder PF2e-Datenpfad, jedes Rule-Element existieren **ausschließlich** unter `scripts/adapters/pf2e/`.
- Der Kern (`scripts/core/`) importiert **nie** aus `adapters/pf2e/`, sondern nur `adapters/adapter.interface.ts`.
- Grep-Test für den Menschen (Ticket-DoD): `rg -n "pf2e" scripts/core` muss **leer** sein.

## 3.4 Keine unsichere Auswertung

- **Verboten:** `eval`, `new Function`, `setTimeout("string")`, dynamisches `import()` aus Importdaten.
- Formeln laufen über einen **sicheren Ausdrucksparser** mit Whitelist an Variablen (`@actor.level`, `@target.hpPercent`, …) und Funktionen (`min,max,round,floor,ceil,abs,clamp,if` + Würfel), Tech-Spec Kap. 22. Würfelausdrücke über Foundrys `Roll`-Klasse, aber **nur** nach Validierung der erlaubten Terme.
- Optionaler eigener JS-Code ist ausschließlich eine **GM-Expertenfunktion**: standardmäßig aus, als unsicher markiert, bevorzugt als Referenz auf ein bestehendes Foundry-Makro, nie durch Import automatisch aktiviert (Tech-Spec Kap. 2.4).

## 3.5 Datenhaltung & Migration

- Kanonische Definition unter `journal.flags["darkis-godforge"] = { schemaVersion, deity }`.
- Laufzeit-/Nutzungsstatus **nur** am Actor (`actor.flags["darkis-godforge"]`), nie in der globalen Definition (Tech-Spec Kap. 5.2).
- Jede Definition trägt `schemaVersion`, `revision`, Zeitstempel, `checksum` (Tech-Spec Kap. 32). Migrations-Service mit Backup-vor-Änderung + Vorschau + Rollback.

## 3.6 Multiplayer-Autorität

- Spieler-Clients dürfen **nur ihren eigenen** Actor verändern. Alles andere (fremde Actors ändern, Item stehlen/übertragen, Gold erzeugen, Fraktion ändern, geheime Tabelle würfeln, Kompendium-Items erzeugen) läuft **GM-autoritativ** über `socketlib`.
- Ablauf: Spieler sendet validierte Anfrage → GM-Client **prüft erneut** (Besitz, Ziel, Distanz, Nutzung, Bedingungen, Formel, erlaubte Effektknoten) → führt aus (Tech-Spec Kap. 26).
- **Doppelaktivierung verhindern:** `activationId = foundry.utils.randomID()` (oder `crypto.randomUUID()`), Zustandsmaschine `requested → validated → running → completed/aborted` (Tech-Spec Kap. 26.3).

## 3.7 Performance

- Kein Voll-Scan aller Dokumente bei jedem Render. Hooks nur registrieren, wenn eine aktive Fähigkeit den Trigger braucht.
- **Trigger-Index** statt Prüfung jeder Fähigkeit bei jedem Ereignis (Tech-Spec Kap. 34.2): `Map<TriggerEvent, Set<AbilityRef>>`.
- Sichtbarkeits-/Katalog-Caches pro Benutzer, Invalidierung bei Definitionsänderung.

## 3.8 Lokalisierung & Sprachen

- **Auslieferung mit Deutsch + Englisch** (`lang/de.json`, `lang/en.json`), beide in `module.json → languages` registriert.
- **Sprachneutral programmieren:** kein nutzersichtbarer Literaltext in TS/HBS – **alles** über `game.i18n.localize` / `game.i18n.format` und `DARKIS_GODFORGE.*`-Keys (Leitplanke #8). Jeder Key existiert in **beiden** JSON-Dateien.
- **Neue Sprachen ohne Code-Änderung:** Eine weitere Sprache = **eine neue JSON-Datei** + ein Eintrag in `module.json → languages`. Keine Strings im Code, keine Sonderfälle pro Sprache → Community/GM kann Übersetzungen per JSON beisteuern. Halte `en.json` als vollständige Referenz (jeder Key vorhanden); fehlt ein Key in einer Sprache, greift Foundrys Fallback automatisch auf Englisch.
- **Sprachauflösung:** Standard = Foundrys aktive Client-Sprache (`game.i18n.lang`). **Zusätzlich** eine Modul-Einstellung `language` (`game.settings.register`) mit Auswahl `Automatisch (Foundry) | Deutsch | English | …`, die die Foundry-Sprache **nur für GodForge-Oberflächen** übersteuern kann; Default = „Automatisch". Die Auswahlliste wird dynamisch aus den in `module.json` registrierten `languages` erzeugt, damit neue Sprachen automatisch erscheinen.
- **Kein Hardcoding von Datums-/Zahlenformaten**; Design-Spec Kap. 38 beachten (längere Übersetzungen dürfen Buttons nicht sprengen).

---

# Kapitel 4 – Zielarchitektur

## 4.1 Schichten (aus Tech-Spec Kap. 3.1)

```
UI (Dashboard · Editor · Kodex · Hub · Chatkarten · Dialoge)
        ↓
GodForge-Anwendungslogik (Deity · Ability · Usage · Wheel)
        ↓
Effekt- & Regel-Engine (Trigger · Bedingungen · Ziele · Aktionen · Formeln)
        ↓
Systemadapter (pf2e · generic · Fallback)  ← einzige Stelle mit Systemwissen
        ↓
Foundry VTT (Documents · Hooks · Socket · Canvas · Rolls)
```

## 4.2 Modulstruktur (verbindlich – lege Dateien nur hier ab)

```
darkis-godforge/
├─ module.json
├─ scripts/
│  ├─ main.ts                      # einziger esmodule-Einstieg, registriert Bootstrap
│  ├─ bootstrap/ { init, setup, ready }.ts
│  ├─ core/
│  │  ├─ deity-service.ts          # CRUD auf kanonischen Definitionen
│  │  ├─ catalog-service.ts        # gefilterter Gottheiten-Katalog (Ersetzung/Sichtbarkeit)
│  │  ├─ ability-service.ts
│  │  ├─ grant-service.ts          # NEU: AND/OR-Verknüpfung von Boni & Fähigkeiten (Kap. 5.4)
│  │  ├─ usage-service.ts          # Nutzung/Reset/Cooldown/Ladungen
│  │  ├─ effect-engine.ts          # Effektgraph-Ausführung
│  │  ├─ trigger-engine.ts         # Trigger-Index + Dispatch
│  │  ├─ condition-service.ts      # UND/ODER-Bedingungsbaum (Prädikate)
│  │  ├─ target-service.ts
│  │  ├─ formula-service.ts        # sicherer Parser (Kap. 3.4)
│  │  ├─ visibility-service.ts
│  │  └─ migration-service.ts
│  ├─ adapters/
│  │  ├─ adapter.interface.ts      # GodForgeSystemAdapter + AdapterCapabilities
│  │  ├─ adapter-registry.ts
│  │  ├─ generic/                  # Fallback ohne Systemwerte
│  │  └─ pf2e/                     # ALLES PF2e-Spezifische
│  │     ├─ pf2e-adapter.ts
│  │     ├─ deity-materializer.ts  # baut das pf2e-Item vom Typ "deity"
│  │     ├─ rule-element-builder.ts
│  │     ├─ class-coupling.ts      # NEU: Kleriker/Champion-Kopplung (Kap. 6)
│  │     └─ pf2e-paths.ts          # eine gekapselte Stelle für Systempfade
│  ├─ applications/
│  │  ├─ dashboard/  deity-editor/  ability-builder/  bonus-editor/
│  │  ├─ wheel-editor/  player-codex/  hub/  dialogs/
│  ├─ canvas/ fortune-wheel-overlay.ts
│  ├─ sockets/ socket-router.ts
│  ├─ api/ public-api.ts           # game.modules.get("darkis-godforge").api
│  └─ migrations/ 0001-initial.ts
├─ templates/                      # *.hbs
├─ styles/ godforge.css            # nutzt CSS-Variablen aus Design-Spec Kap. 4.1
├─ lang/ { en, de }.json
├─ packs/ godforge-deities/        # LevelDB-Pack (v13+), NICHT einzelne .db-Datei
└─ assets/                         # logo.png etc.
```

## 4.3 Adapter-Vertrag (Kern-Interface)

```ts
interface AdapterCapabilities {
  deityDocuments: boolean; deitySelection: boolean;
  actorSheetIntegration: boolean; characterBuilderIntegration: boolean;
  skills: boolean; attributes: boolean; armorClass: boolean; savingThrows: boolean;
  conditions: boolean; ruleElements: boolean;
  restingEvents: string[]; degreesOfSuccess: boolean; inlineChecks: boolean;
  // NEU für Kap. 6:
  classDeityCoupling: boolean;   // meldet, ob Klassen-Features aus der Gottheit ableiten
}

interface GodForgeSystemAdapter {
  readonly systemId: string;
  readonly capabilities: AdapterCapabilities;
  listSkills(): SkillDescriptor[];
  materializeDeity(def: DeityDefinition, actor?: Actor): Promise<MaterializedDeity>;
  buildPassiveBonus(bonus: PassiveBonusDefinition): AdapterRuleData[];
  applyDeityToActor(actor: Actor, def: DeityDefinition): Promise<void>;
  removeDeityFromActor(actor: Actor): Promise<void>;
  // ... siehe Tickets
}
```

Die UI fragt **immer** `adapter.capabilities` ab, bevor sie Optionen zeigt (Leitplanke #13).

---

# Kapitel 5 – Datenmodell inkl. AND/OR-Verknüpfung

Basis-Datenmodell: Tech-Spec Kap. 6, 9, 10. Hier die **Ergänzungen**, die über die Spec hinausgehen und ausdrücklich gewünscht sind.

## 5.1 Gottheit – Kurzform

`DeityDefinition` (Tech-Spec Kap. 6.1) bleibt maßgeblich. Wichtig: `passiveBonuses: PassiveBonusDefinition[]` und `abilities: AbilityDefinition[]` werden in v1 **um eine Verknüpfungsebene erweitert** → `grants` (siehe 5.4).

## 5.2 Fünf-Felder-Regel (nicht vermischen!)

Aus Tech-Spec Kap. 11 – für Codex als hartes Schema:

```ts
interface AbilityTiming {
  actionCost: ActionCost;      // Was kostet die Aktivierung?
  usage: UsageDefinition;      // Wie oft? (pro Zug/Runde/Tag/Ladungen …)
  reset: ResetDefinition;      // Wann erneuern sich Nutzungen?
  cooldown?: CooldownDefinition;// Sperre bis zur nächsten Verwendung
  duration: DurationDefinition;// Wie lange wirkt der Effekt?
}
```

Reset arbeitet mit **abstrakten Reset-Ereignissen** (`ten-minute-rest`, `refocus`, `daily-preparations`, `encounter-end`, `scene-change`, `calendar-day`, `custom-rest`), die der PF2e-Adapter benutzerfreundlich benennt (Tech-Spec Kap. 13.2). Kalender-Resets bevorzugt über **Foundrys eingebaute Zeit-/Kalender-API**; externe Kalendermodule optional (Kapitel 8).

## 5.3 Bedingungen (UND/ODER) – existierend, bestätigt

Der **Bedingungsbaum** aus Tech-Spec Kap. 16 (`ConditionTree` mit `AND/OR/NOT/mindestens X von Y`) ist die Grundlage für *wann* ein Bonus/eine Fähigkeit **greift**. Er steuert Aktivierbarkeit und Prädikate. Das ist **nicht** dasselbe wie 5.4.

## 5.4 NEU: Grant-Gruppen – Boni & Fähigkeiten per AND/OR verknüpfen

**Gewünschte Fähigkeit (aus dem Auftrag):** *„man sollte Fähigkeiten verknüpfen bzw. mehrere für die Götter anlegen, z. B. auch Boni, und die per OR oder AND verknüpfen."*

Interpretation und Modell:

- **AND-Gruppe (`all`):** Alle Mitglieder werden gemeinsam gewährt (Standardfall: eine Gottheit gibt Bonus A *und* Bonus B *und* Wunder X).
- **OR-Gruppe (`any` + `pick`):** Der Charakter wählt beim Zuweisen (im Leveler/Kodex) `pick` aus N Mitgliedern. Beispiel: „**+1 Heimlichkeit ODER +1 Täuschung**", oder „Wähle **eine** von drei Domänenkräften". Das ist exakt das Muster, das PF2e-Klassen (Domänenwahl des Klerikers, Champion-Cause) brauchen (Kapitel 6).
- **Verschachtelung:** Gruppen dürfen Gruppen enthalten: `(A UND B) ODER (C)`.

```ts
type GrantMember = PassiveBonusGrant | AbilityGrant | GrantGroup;

interface GrantGroup {
  id: string;
  kind: "grant-group";
  combinator: "all" | "any";     // AND | OR
  pick?: number;                 // nur bei "any": wie viele wählbar (Default 1)
  label?: string;                // i18n-Key; für Auswahl-Prompt im Wizard
  requirement?: ConditionTree;   // optionale Voraussetzung, damit Gruppe überhaupt erscheint
  selectionTiming?: "on-assign" | "each-use" | "gm-choice" | "random";
  members: GrantMember[];
}

interface PassiveBonusGrant { id: string; kind: "bonus"; bonus: PassiveBonusDefinition; }
interface AbilityGrant       { id: string; kind: "ability"; abilityId: string; overrides?: AbilityOverride; }

// Auf der Gottheit ersetzt/ergänzt dies flache Listen:
interface DeityGrants { root: GrantGroup; } // root.combinator meist "all"
```

**`overrides` (leicht bearbeiten):** Ein `AbilityGrant`/`PassiveBonusGrant` kann eine geerbte Fähigkeit **leicht anpassen** – neuer `name`/`title`, neue `description`, geänderter Zahlenwert – ohne die Basisfähigkeit zu duplizieren (deckt den Wunsch *„die Fähigkeiten einem Gott hinzufügen und leicht bearbeiten mit Titel und Beschreibung"* ab).

```ts
interface AbilityOverride {
  name?: string; title?: string; description?: string; icon?: string;
  valueOverrides?: Record<string, NumericExpression>; // z. B. Bonuswert, Dauer
}
```

**Auswahl-Persistenz:** Bei `selectionTiming: "on-assign"` wird die Wahl in `actor.flags["darkis-godforge"].choices` gespeichert (Tech-Spec Kap. 5.2). Bei `"each-use"` wird bei jeder Aktivierung neu gefragt (Choice-Knoten, Tech-Spec Kap. 21).

**UI-Konsequenz (Design-Spec Kap. 15.2 „Mehrere Boni"):** Der Bonus-/Wunder-Editor zeigt Gruppen als sortierbare, gruppierbare Kartenstapel mit Umschalter **UND / ODER** und – bei ODER – einem `pick`-Feld. Der Leveler-Wizard rendert ODER-Gruppen als Auswahlkarten (Kapitel 7).

> **Wichtige Trennung für Codex:** `ConditionTree` (5.3) = *wann wirkt etwas*. `GrantGroup` (5.4) = *was wird (wählbar) gewährt*. Zwei verschiedene Bäume, zwei verschiedene Services (`condition-service.ts` vs. `grant-service.ts`). Nicht vermischen.

---

# Kapitel 6 – Klassen-Gott-Kopplung (der kritische PF2e-Teil)

**Gewünschte Fähigkeit (aus dem Auftrag):** *„manche Klassen haben anhand der Götterwahl andere Fähigkeiten, z. B. der Kleriker. Das muss berücksichtigt werden, da die Götter ja gegen die normalen ausgetauscht werden."*

Das ist der heikelste Teil des ganzen Moduls. Wenn eine Homebrew-Gottheit eine offizielle ersetzt, müssen **alle Klassen-Features, die aus der Gottheit ableiten, weiter funktionieren.**

## 6.1 Welche PF2e-Klassen lesen aus der Gottheit?

> `TODO(verify)` gegen den aktuellen PF2e-Quellcode (Kapitel 8) – die folgende Liste ist der Stand des Regelwerks, aber **Codex muss die exakten Datenpfade im System belegen**, nicht aus dem Gedächtnis übernehmen.

- **Kleriker (Cleric):** Divine Font (Heilen/Schaden), Domänen → Fokuszauber, bevorzugte Waffe (→ *Deadly Simplicity*, Waffenzugang), göttliche Fertigkeit, Heiligung (holy/unholy), erlaubte Schlüsselattribut-/Zauberlisten-Ergänzungen.
- **Champion (Paladin etc.):** Gottheit + Cause/Tenets, Heiligung, deific/bevorzugte Waffe.
- **Warpriest/Doktrin-Varianten des Klerikers.**
- **Weitere feat-/archetyp-basierte Zugänge** (z. B. Zugang zu bevorzugter Waffe, Domänen-Archetyp).
- **Oracle:** koppelt Mechanik an **Mystery**, nicht an die Gottheit – trotzdem kann eine Gottheit verehrt werden. Nicht fälschlich an die Gottheit koppeln.

## 6.2 Grundstrategie: nicht nachbauen, sondern korrekt materialisieren

**Regel:** Das Modul **reimplementiert keine Klerikermechanik.** Stattdessen materialisiert der PF2e-Adapter ein **vollständiges, gültiges `deity`-Item**, sodass die **bestehende PF2e-Klassenlogik** (bzw. der Leveler) die Domänen-, Font-, Waffen-, Fertigkeits- und Heiligungs-Auswahl **von selbst** korrekt anbietet und anwendet.

Das heißt konkret, `deity-materializer.ts` muss ein Item erzeugen, dessen `system`-Struktur die Felder enthält, die PF2e-Klassen-Features abfragen:

> `TODO(verify)` – Feldnamen im echten PF2e-`deity`-Item prüfen. Erwartete Felder (Bezeichnung ungefähr, exakt belegen!): Domänen (`domains` + `alternateDomains`), Font (`font`/`divineFont`), bevorzugte Waffe (`weapons`/`favoredWeapon`), göttliche Fertigkeit (`skill`), Attribut(e) (`ability`/`attribute`), Heiligung (`sanctification`), gewährte Zauber (`spells`), `alignment`/Traits, Edikte/Anathema.

**Materialisierungs-Kette (Ticket-Grundlage):**
1. Kanonische Definition + Ersetzungsregeln lesen.
2. Bei `mode: "clone-mechanics"`/`"selective-inheritance"` (Tech-Spec Kap. 7.1) die geerbten Felder von der Quell-Gottheit (`sourceUuid`) übernehmen, dann `overrides` anwenden.
3. `deity`-Item-`system` befüllen → als **eingebettetes Item auf dem Actor** materialisieren (so, wie eine echte PF2e-Gottheit am Charakter hängt).
4. Zusätzliche Boni/Wunder als `effect`/`feat`/`action`-Items bzw. Rule-Elements ergänzen (Tech-Spec Kap. 27.2).

## 6.3 Sichtbarmachen im Auswahl-Flow

Das eigentliche Problem beim „Austauschen": Die Homebrew-Gottheit muss dort **auftauchen**, wo Klassen ihre Gottheit wählen, und die Originale müssen dort **verschwinden**.

- **Leveler-Wizard:** fragt die GodForge-API (`getSelectableDeities`) – hier ist die Kopplung sauber lösbar (Kapitel 7).
- **PF2e-eigener Character-Builder / Deity-Auswahl auf dem Bogen:** hier muss der Adapter den offiziellen Auswahl-Datenstrom **filtern** (versteckte Originale raus, Homebrew rein). `TODO(verify)`: über welchen Hook/welche Datenquelle PF2e seine Deity-Auswahl speist (Compendium-Browser vs. eingebettete Liste). Wenn kein sauberer Hook existiert, dokumentiere die Einschränkung ehrlich und biete den Leveler-Weg als primären Pfad an – **erfinde keinen Hook.**

## 6.4 Feature-Kopplung im Grant-Modell

Domänen/Font/Cause werden im Datenmodell als **ODER-Grant-Gruppen** (Kapitel 5.4) abgebildet, weil der Charakter beim Aufleveln wählt:

```
Kleriker-Kopplung (Beispiel):
GrantGroup(all)
├─ AbilityGrant: Divine Font (fix, aus Gottheit)
├─ GrantGroup(any, pick=1, label="Wähle deine Domäne")   ← Domänen
│  ├─ AbilityGrant: Domäne A (+ Fokuszauber)
│  ├─ AbilityGrant: Domäne B
│  └─ AbilityGrant: Domäne C
└─ PassiveBonusGrant: göttliche Fertigkeit (trainiert)
```

`class-coupling.ts` übersetzt diese Struktur in das, was PF2e erwartet – **oder** delegiert an das native Deity-Item, wenn PF2e die Wahl selbst rendert. Welcher der beiden Wege gilt, entscheidet Ticket **C-CLERIC** nach Prüfung des Systemquellcodes.

## 6.5 Abnahmefälle

Testkatalog (manuell, Kapitel 10): ein Kleriker mit Homebrew-Gottheit muss (a) Domäne(n) wählen und die Fokuszauber erhalten, (b) den korrekten Font bekommen, (c) *Deadly Simplicity* für die bevorzugte Waffe erhalten, (d) die göttliche Fertigkeit trainiert bekommen, (e) korrekte Heiligung/Traits zeigen. Ein Champion analog für Cause + Waffe.

---

# Kapitel 7 – Leveler-Integration & öffentliche API

**Anforderung:** Das Modul ist Foundry-v14 und **kompatibel mit dem hauseigenen Darkis PF2e Leveler**, sodass im Level-/Erstellungs-Wizard der Gott ausgewählt werden kann.

## 7.1 Prinzip: API-first, keine Doppel-Logik

Der Leveler **reimplementiert nichts** von GodForge. Er ruft ausschließlich die öffentliche API auf (Tech-Spec Kap. 7.3, 28):

```ts
interface GodForgeAPI {
  getSelectableDeities(ctx: SelectionContext): Promise<DeitySummary[]>;
  getDeity(idOrUuid: string): Promise<DeityDefinition | null>;
  getActorDeity(actor: Actor): Promise<DeityDefinition | null>;
  assignDeity(actor: Actor, deityId: string, choices?: GrantChoiceMap): Promise<void>;
  removeDeity(actor: Actor): Promise<void>;
  getReplacementFor(sourceUuid: string): Promise<DeityDefinition | null>;
  isSourceHidden(sourceUuid: string, context: string): boolean;
  activateAbility(actor: Actor, abilityId: string, options?: object): Promise<void>;
  resetActorUsages(actor: Actor, resetType: string): Promise<void>;
  registerAdapter(adapter: GodForgeSystemAdapter): void;
  // NEU für Wizard + Grant-Gruppen:
  getGrantChoices(deityId: string, ctx: SelectionContext): Promise<GrantGroup>;  // ODER-Gruppen zum Rendern
}
```

`SelectionContext` enthält `actor`, `user`, `classId`, `level`, `region`, `pantheonFilter` – so kann GodForge nach Voraussetzungen, Sichtbarkeit und Veröffentlichungsstatus filtern (Tech-Spec Kap. 28).

Zugriff: `game.modules.get("darkis-godforge")?.api`. Bereitstellung im `ready`-Hook.

## 7.2 Wizard-Schritt „Gottheit"

Der Leveler:
1. holt `getSelectableDeities(ctx)` → rendert Auswahlkarten (Design-Spec Kap. 20 Vergleichsansicht).
2. bei Auswahl: `getGrantChoices()` → rendert ODER-Gruppen (Domänen etc., Kapitel 5.4/6.4) als Auswahl.
3. bestätigt via `assignDeity(actor, id, choices)`.
4. GodForge validiert und materialisiert (Kapitel 6.2), löst Hooks aus.

## 7.3 Hooks für Fremdmodule

```ts
Hooks.callAll("darkisGodForge.preAssignDeity", actor, deity);
Hooks.callAll("darkisGodForge.assignDeity", actor, deity);
Hooks.callAll("darkisGodForge.preActivateAbility", context);
Hooks.callAll("darkisGodForge.activateAbility", result);
Hooks.callAll("darkisGodForge.usageReset", actor, resetType);
```

> **Vertrag:** Die API ist stabil zu halten. Breaking Changes nur mit `schemaVersion`-Bump und Eintrag in `CHANGELOG-DEV.md`. Der Leveler darf sich auf diese Signaturen verlassen.

---

# Kapitel 8 – Quellen & Referenzen (mit Prüf-Auftrag)

> **An Codex:** Diese Quellen sind deine Wahrheitsquelle, **nicht** dein Trainingsgedächtnis. Für jeden PF2e- oder Foundry-spezifischen Code **verlinke im Kommentar**, worauf du dich stützt (`// ref: <url/datei>`), oder markiere `// TODO(verify)`. Foundry v14 und der aktuelle PF2e-Adapter weichen von älteren Versionen ab; behandle jede „Erinnerung" als potenziell veraltet.

**Foundry VTT (Core)**
- API-Referenz (v14): <https://foundryvtt.com/api/>
- ApplicationV2: <https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html>
- HandlebarsApplicationMixin: <https://foundryvtt.com/api/functions/foundry.applications.api.HandlebarsApplicationMixin.html>
- DialogV2: <https://foundryvtt.com/api/classes/foundry.applications.api.DialogV2.html>
- Modul-Entwicklung / Manifest: <https://foundryvtt.com/article/module-development/> · <https://foundryvtt.com/article/manifest-plus/>
- Content Packs / LevelDB-Packs (v13+): <https://foundryvtt.com/article/compendium/>
- Hooks-Übersicht: <https://foundryvtt.com/api/modules/hookEvents.html>
- Zeit-/Kalender-API (`game.time`, `CONFIG.time`): in der Core-API-Referenz.

**Pathfinder 2e System (der maßgebliche Beleg für alles Systemspezifische)**
- Quellcode: <https://github.com/foundryvtt/pf2e> — *hier* die echten Datenfelder von `deity`-Items, Klassen-Features (Cleric/Champion), Font/Domänen/Sanctification prüfen.
- Rule-Elements-Wiki: <https://github.com/foundryvtt/pf2e/wiki/Rule-Elements> — verbindliche RE-Syntax (FlatModifier, GrantItem, ChoiceSet, RollOption, …).
- ChoiceSet-RE (wichtig für Grant-Gruppen/Kopplung), GrantItem-RE (Fokuszauber/Features), FlatModifier-RE (Boni): in der o. g. Wiki.

**Hilfsmodule**
- socketlib (GM-Autorität): <https://github.com/manuelVo/foundryvtt-socketlib>
- libWrapper (sichere Patches): <https://github.com/ruipin/fvtt-lib-wrapper>
- Sequencer (optional, Glücksrad-/Wunder-Animation): <https://github.com/fantasycomputerworks/foundryvtt-sequencer>

**Typen**
- Community Foundry-Types: <https://github.com/League-of-Foundry-Developers/foundry-vtt-types>
- PF2e-Typen: aus dem PF2e-Repo ableiten; fehlende als schmale `types/`-Deklarationen (kein `any`).

> `TODO(verify)` beim ersten Ticket: konkrete, für deine Foundry-v14-Installation passende **PF2e-Systemversion** und ihre `deity`-Datenstruktur festhalten und in `CHANGELOG-DEV.md` dokumentieren.

---

# Kapitel 9 – Arbeitspakete / Tickets

Reihenfolge = Abarbeitungsreihenfolge. Jedes Ticket ist so geschnitten, dass es einzeln umsetzbar und prüfbar ist (Leitplanke #3, #11). Phasen entsprechen Tech-Spec Kap. 40.

## Phase A – Fundament

### A0 – Projekt-Setup & Manifest
- **Ziel:** Lauffähiges, in Foundry v14 ladbares Skelettmodul.
- **Umfang:** TS + Vite-Build → `scripts/main.js`; `module.json` nach Kapitel 3.1; Ordnerstruktur nach Kapitel 4.2 (leere Service-Stubs mit Interface-Signaturen); `lang/en.json`+`de.json` mit ein paar Keys; `styles/godforge.css` mit den CSS-Variablen aus Design-Spec Kap. 4.1; ESLint + `tsconfig` (`strict`).
- **Leitplanken:** #1, #7, #8, #10.
- **Akzeptanz:** Modul lädt in Foundry v14 ohne Konsolenfehler; `game.modules.get("darkis-godforge").active === true`; Build erzeugt ES-Modul; Lint & `tsc --noEmit` grün.
- **Manueller Test:** Modul aktivieren, Konsole prüfen, README-Testschritt notieren.
- **Quellen:** Kapitel 8 (Modul-Entwicklung, Manifest).

### A1 – Adapter-Registry & Systemerkennung
- **Ziel:** `game.system.id` erkennen, passenden Adapter registrieren, `capabilities` bereitstellen.
- **Umfang:** `adapter.interface.ts`, `adapter-registry.ts`, `generic/`-Fallback (alle capabilities `false`/leer außer Lore), `pf2e/pf2e-adapter.ts` (Grundgerüst, capabilities-Objekt). Registrierung im `init`/`setup`-Hook.
- **Leitplanken:** #4 (Isolation!). Grep-Test `rg pf2e scripts/core` leer.
- **Akzeptanz:** Unter pf2e wird der pf2e-Adapter aktiv, sonst generic; `game.modules...api` (Stub) liefert Adapter-Capabilities.

### A2 – Kanonisches Datenmodell + DeityService (CRUD)
- **Ziel:** `DeityDefinition` als Typ; Anlegen/Lesen/Ändern/Löschen als `JournalEntry` unter Flags.
- **Umfang:** Typen aus Tech-Spec Kap. 6 + Grant-Modell Kap. 5.4; `deity-service.ts`; Speicher in `packs/godforge-deities` oder Welt-Journals; `schemaVersion`/`revision`/`checksum`.
- **Leitplanken:** #7, Kap. 3.5.
- **Akzeptanz:** Eine Gottheit lässt sich per API/Konsole anlegen, neu laden, ändern; Flags korrekt strukturiert; keine Laufzeitdaten in der Definition.

### A3 – Katalog- & Ersetzungs-Service
- **Ziel:** Gefilterter Gottheiten-Katalog (Sichtbarkeit + Ersetzung), ohne Originale zu verändern.
- **Umfang:** `catalog-service.ts`, `visibility-service.ts`; `ReplacementConfiguration` (Tech-Spec Kap. 7.1); `getReplacementFor`, `isSourceHidden`.
- **Leitplanken:** Tech-Spec Kap. 7.2 (kein Löschen/Mutieren offizieller Packs).
- **Akzeptanz:** Ein als „ersetzt/versteckt" markierter Originalgott verschwindet aus dem Katalog; Original-UUID/-Daten unverändert.

### A4 – Öffentliche API (Grundgerüst)
- **Ziel:** `game.modules.get("darkis-godforge").api` gemäß Kapitel 7.1 (zunächst Deity-Teil).
- **Akzeptanz:** `getSelectableDeities`, `getDeity`, `getReplacementFor`, `isSourceHidden` funktionieren gegen den Katalog.

### A5 – GM-Dashboard-Shell + Gottheiten-Browser
- **Ziel:** ApplicationV2-Dashboard mit Navigation, Startseite, Gottheiten-Browser (Karten/Liste), Detailseite mit Tabs – visuell an den **Mockups** und Design-Spec Kap. 9–12 orientiert.
- **Umfang:** `applications/dashboard/`; Scene-Control-Button + Hotkey (Design-Spec Kap. 7); responsive Grundstruktur (Design-Spec Kap. 31); nutzt reale Daten aus A2/A3.
- **Leitplanken:** #1 (ApplicationV2), #8 (i18n), Design-Spec Kap. 43 Anti-Patterns.
- **Akzeptanz:** Dashboard öffnet über Scene-Control; zeigt vorhandene Gottheiten; Detailseite mit Tabs (Übersicht/Systemwerte/Boni/Wunder/Sichtbarkeit/Ersetzung); funktioniert bei 1100 px Breite.

## Phase B – Boni & einfache Wunder

### B1 – Sicherer Formel-Service
- **Ziel:** Whitelist-Parser (Kap. 3.4) mit Variablen/Funktionen aus Tech-Spec Kap. 22; Formelvorschau für Stufen 1/5/10/15/20.
- **Leitplanken:** #6 (kein eval). **Akzeptanz:** gültige Ausdrücke rechnen korrekt, unerlaubte Terme werden abgelehnt; Würfelausdrücke nur nach Validierung an `Roll`.

### B2 – PassiveBonus-Modell + Easy-Mode-Editor + Grant-Gruppen
- **Ziel:** Boni anlegen (Tech-Spec Kap. 9), **mehrere pro Gott**, mit **UND/ODER-Gruppen** (Kap. 5.4) und `overrides`.
- **Umfang:** `bonus-editor/` (Easy Mode: Bonus auf / Wert / Bonusart / gilt für / Bedingung / Sichtbarkeit — Design-Spec Kap. 15); Gruppen-UI mit UND/ODER-Umschalter + `pick`; Konfliktanzeige für PF2e-Stapelregeln (Design-Spec Kap. 15.3).
- **Leitplanken:** #12 (Stapelregeln), #13 (nur unterstützte Selektoren via `adapter.listSkills()`).
- **Akzeptanz:** Ein Gott kann „+1 Heimlichkeit UND +1 Wahrnehmung" oder „+1 Heimlichkeit **ODER** +1 Täuschung (pick 1)" tragen; ODER-Wahl wird beim Zuweisen abgefragt.

### B3 – PF2e-Rule-Element-Generator für passive Boni
- **Ziel:** `buildPassiveBonus()` erzeugt korrekte PF2e-Rule-Elements (FlatModifier etc.).
- **Leitplanken:** #2, #4, Kapitel 8 (RE-Wiki). Jede RE-Struktur mit `// ref:`.
- **Akzeptanz:** Ein zugewiesener Bonus erscheint als korrekt getypter Modifier auf dem PF2e-Charakterbogen und stapelt regelkonform.

### B4 – Usage/Reset/Duration-Service
- **Ziel:** Fünf-Felder-Modell (Kap. 5.2) als Laufzeitstatus am Actor; Reset-Ereignisse; Kalender-Reset über Foundry-Zeit.
- **Akzeptanz:** „1×/Tag" verbraucht sich, wird bei `daily-preparations` zurückgesetzt; „alle 3 Tage" respektiert Weltzeit.

### B5 – Einfache Wunder (Bonus/Heilung/Schaden/Zustand) + Easy-Mode-Wunder-Editor + Chatkarte
- **Ziel:** Aktivierbares Wunder mit Ziel, Wurf, Dauer, Chatkarte (Design-Spec Kap. 22).
- **Akzeptanz:** Abnahmefälle „Lebensfunke" (Heilung `3d8+@actor.level`), „Unzerstörbar" (+2 RK, 2 Runden), „Den Schleier durchblicken" (+2 Status, mehrere Selektoren) technisch umsetzbar (Tech-Spec Kap. 37).

## Phase C – Fortgeschrittene Automation

### C1 – Trigger-Engine + Trigger-Index
- Tech-Spec Kap. 15, 34.2. **Akzeptanz:** Kampf-/Erkundungs-/Zähler-Trigger lösen nur registrierte Fähigkeiten aus; kein Voll-Scan.

### C2 – Bedingungsbaum (UND/ODER/NOT/X von Y)
- Tech-Spec Kap. 16; `condition-service.ts`. **Nicht** mit Grant-Gruppen verwechseln (Kap. 5.4-Hinweis).

### C3 – Zielsystem, Flächen, Boss-Erkennung
- Tech-Spec Kap. 18. Boss-Erkennung konfigurierbar, im Zweifel GM fragen (Kap. 18.4).

### C4 – Effektgraph-Engine + Expertenmodus (Ablaufgraph)
- Tech-Spec Kap. 20/21, Design-Spec Kap. 14.4. Choice-Knoten für „Anpassung".

### C5 – GM-Autorität via socketlib
- Kapitel 3.6; `socket-router.ts`. Item-Transfer/Diebstahl, Fraktionskontrolle, Gold, geheime Würfe.
- **Akzeptanz:** „Diebischer Griff", „Goldsegen", „Betörende Herrschaft" laufen GM-autoritativ; keine Doppelaktivierung.

### C6 – Statusunterdrückung („Blinder Zorn")
- Tech-Spec Kap. 23 — im **PF2e-Adapter** explizit implementieren und testen (Sterbend bleibt, handlungsfähig, Tod bleibt möglich, Bewusstlos wird nicht ignoriert).

### C-CLERIC – Klassen-Gott-Kopplung
- **Ziel:** Kapitel 6 umsetzen: vollständiger `deity-materializer.ts` + `class-coupling.ts`.
- **Vorab-Pflicht:** PF2e-`deity`-Struktur und Cleric/Champion-Feature-Ableitung **im Quellcode belegen** (Kapitel 8), Ergebnis in `CHANGELOG-DEV.md`.
- **Akzeptanz:** Abnahmefälle Kap. 6.5 (Kleriker: Domäne+Fokuszauber, Font, Deadly Simplicity, Fertigkeit, Heiligung; Champion: Cause+Waffe) mit einer Homebrew-Gottheit erfüllt.

## Phase D – Zufallssystem

### D1 – Zufallstabellen-Editor (Tech-Spec Kap. 24, Design-Spec Kap. 16)
### D2 – Glücksrad: Editor + Canvas/DOM-Overlay + GM-autoritatives Ergebnis + geheime Sichtbarkeit
- Tech-Spec Kap. 25 — **Ergebnis autoritativ zuerst, Animation nur Darstellung** (Kap. 25.1). Abnahmefall „Chaosrad".

## Phase E – Integration

### E1 – Charakterbogen-Widget (Design-Spec Kap. 21) — adapterabhängige Position, PF2e-konform integrieren.
### E2 – GodForge-Hub (Design-Spec Kap. 8).
### E3 – Leveler-API-Vollausbau + Wizard-Schritt (Kapitel 7). ODER-Grant-Gruppen im Wizard.
### E4 – Götterkodex (Buch- + Archivansicht, Design-Spec Kap. 19), Sichtbarkeitsvorschau für GM.
### E5 – Import/Export + Migration + Sicherheitsprüfung (Tech-Spec Kap. 31–33). Import führt nie Code aus.

## Abnahme v1.0
Erst vollständig, wenn Tech-Spec Kap. 41 (21 Punkte) **und** die 21 Noclaris-Fähigkeiten (Tech-Spec Kap. 37) technisch umsetzbar sind **und** die Klassen-Gott-Kopplung (Kapitel 6) für Kleriker + Champion nachgewiesen ist.

---

# Kapitel 10 – Teststrategie

**Codex kann Foundry nicht selbst starten.** Deshalb gilt:

1. **Automatisiert (von Codex ausführbar):** `tsc --noEmit`, ESLint, plus **Unit-Tests** (Vitest) für die *reinen* Kern-Services ohne Foundry-Abhängigkeit: `formula-service` (Whitelist/Parsing), `condition-service` (Baum-Auswertung mit gemockten Fakten), `grant-service` (AND/OR-Auflösung, `pick`), `usage-service` (Reset-Logik mit gemockter Zeit), `catalog-service` (Filter). Für diese ist Foundry zu mocken; **keine** echten Foundry-Globals verlangen.
2. **Manuell (vom Menschen auszuführen):** Jedes UI-/Adapter-Ticket liefert eine nummerierte Klick-Checkliste (Vorbedingung → Schritt → erwartetes Ergebnis). Beispiele orientieren sich an Design-Spec Kap. 35 (Testlabor) und Tech-Spec Kap. 36.
3. **Codex behauptet keine Laufzeit-Ergebnisse** (Leitplanke #5). Formuliere Testpläne, führe sie nicht im Kopf aus.

Wichtige manuelle Szenarien: Stufen 1/5/10/15/20, Bossziel, bewusstlos, sterbend, keine Nutzungen, tägliche Vorbereitung — plus die Kleriker/Champion-Kopplung (Kap. 6.5).

---

# Kapitel 11 – Definition of Done

Ein Ticket ist fertig, wenn **alle** Punkte zutreffen:

- [ ] Nur der Ticket-Scope umgesetzt (Leitplanke #3).
- [ ] `tsc --noEmit` und ESLint fehlerfrei; `strict` eingehalten; kein unbegründetes `any` (#7).
- [ ] Keine V1-Application-/`Dialog`-/`.data.data`-Muster (#1).
- [ ] `rg -n "pf2e" scripts/core` ist leer (#4).
- [ ] Kein `eval`/`new Function`; kritische Effekte GM-autoritativ (#6).
- [ ] Alle nutzersichtbaren Strings in `lang/en.json` + `de.json`, kein Literaltext (#8).
- [ ] PF2e-/Foundry-spezifischer Code mit `// ref:`-Beleg oder `// TODO(verify)` (#2).
- [ ] Fünf Timing-Felder nicht vermischt (#9); Boni mit `modifierType` (#12).
- [ ] Alle Akzeptanzkriterien des Tickets erfüllt.
- [ ] Manueller Testplan dokumentiert; ggf. Unit-Tests grün (Kapitel 10).
- [ ] Eintrag in `CHANGELOG-DEV.md` (geänderte Dateien, Entscheidungen, offene `TODO(verify)`).
- [ ] Kurz-Zusammenfassung + offene Fragen an den Menschen.

---

# Kapitel 12 – Namens- & Style-Konventionen

- **Code/Dateien:** englisch, `kebab-case.ts` für Dateien, `PascalCase` für Typen/Klassen, `camelCase` für Werte/Funktionen.
- **i18n-Keys:** `DARKIS_GODFORGE.<Bereich>.<Element>`; deutsche Begriffe aus Design-Spec Kap. 39 (Gottheit, Pantheon, Passiver Bonus, Göttliches Wunder, Nutzung, Zurücksetzung, Dauer, Auslöser, Bedingung, Ziel, Effekt, Zufallstabelle, Glücksrad, Götterkodex). „Cooldown" → **Abklingzeit**, „Companion" nie als sichtbarer deutscher Hauptname.
- **CSS:** Variablen aus Design-Spec Kap. 4.1 (`--dg-*`), Akzent `#8f38e8`, Gothic-Schrift nur für Titel/Namen/Zitate (Design-Spec Kap. 3.2), nie in Formularen/Tabellen.
- **Flags-Namespace:** ausschließlich `"darkis-godforge"`.
- **Keine Dekoration an jedem Feld** (Design-Spec Kap. 3.3); Anti-Patterns Design-Spec Kap. 43 meiden.
- **Kommentardichte** wie im umgebenden Code; keine Kommentar-Fluten, aber jede systemspezifische Entscheidung belegen.

---

# Kapitel 13 – Glossar

- **Kanonische Definition** – systemneutrale Gottheitsdaten (`JournalEntry`-Flags).
- **Materialisiertes Dokument** – vom Adapter erzeugtes systemeigenes Item (PF2e `deity`).
- **Grant-Gruppe** – AND/OR-Verknüpfung von Boni & Fähigkeiten mit optionaler Auswahl (`pick`); Kapitel 5.4.
- **Bedingungsbaum** – UND/ODER/NOT-Logik, *wann* etwas wirkt; Kapitel 5.3.
- **Reset-Ereignis** – abstrakter Zeitpunkt der Nutzungs-Erneuerung (`daily-preparations` …).
- **Klassen-Gott-Kopplung** – Mechanik, dass Klassen-Features (Kleriker etc.) aus der gewählten Gottheit ableiten; Kapitel 6.
- **GM-Autorität** – sicherheitskritische Effekte laufen auf dem GM-Client; Kapitel 3.6.
- **Adapter** – einzige Stelle mit Systemwissen; Kern bleibt systemneutral.

---

## Anhang – Schnell-Referenz „Verbote" für Codex

```
NIE:  Application V1 · FormApplication · Dialog · .data.data · mergeObject(global)
NIE:  eval · new Function · importierten JS-Code automatisch ausführen
NIE:  pf2e-Pfade außerhalb von scripts/adapters/pf2e/
NIE:  Actionskosten/Nutzung/Reset/Cooldown/Dauer in ein Feld mischen
NIE:  zwei gleichartige Statusboni naiv addieren
NIE:  Strings hardcoden statt game.i18n
NIE:  eine PF2e/Foundry-API aufrufen, die du nicht belegen kannst
IMMER: ApplicationV2 · TypeScript strict · Adapter-Capabilities prüfen · GM-autoritativ · // ref: oder // TODO(verify)
```

*Ende des Regieplans. Beginne mit Ticket A0. Lies vorher Kapitel 0–3.*
