# Darkis GodForge
## Technische Spezifikation für frei konfigurierbare Homebrew-Gottheiten in Foundry VTT

**Dokumentstatus:** Technisches Konzept / Pflichtenheft  
**Geplanter Schwerpunkt:** Gottheiten ersetzen, konfigurieren, verteilen und ihre Boni sowie göttlichen Wunder automatisieren  
**Primäres Zielsystem:** Pathfinder 2e  
**Architekturziel:** Systemneutraler Kern mit automatisch erkanntem Systemadapter  
**Zielgruppe:** Spielleitungen ohne Programmierkenntnisse, erfahrene Foundry-Nutzer und Modulautoren  
**Nicht Bestandteil dieser Phase:** Ausarbeitung von Glaubensorten, Anhängerstatistiken, Geschichten, vollständigem Lore-Management oder einer fertigen Spielerbuch-Gestaltung

---

# 1. Produktvision

**Darkis GodForge** soll eine Foundry-VTT-Erweiterung werden, mit der eine Spielleitung die offiziellen Gottheiten eines Spielsystems ausblenden und durch vollständig eigene Homebrew-Gottheiten ersetzen kann, ohne die Originaldaten zu löschen oder dauerhaft zu verändern.

Die eigenen Gottheiten sollen dieselben technischen Aufgaben erfüllen wie die ursprünglichen Gottheiten:

- Auswahl bei der Charaktererstellung
- Anzeige auf dem Charakterbogen
- Bereitstellung systemeigener Werte
- Gewährung von Fertigkeitsboni, Attributsboni, Waffen, Zaubern, Domänen oder vergleichbaren Systemwerten
- Vergabe passiver Vorteile
- Vergabe aktiver, begrenzt nutzbarer Fähigkeiten
- automatische Verwaltung von Nutzungen, Abklingzeiten und Bedingungen
- Ausführung komplexer Effekte
- Darstellung in einem Ingame-Kompendium
- Import und Export kompletter Pantheons
- Integration in andere Module, insbesondere einen späteren **Darkis PF2e Leveler**

Der Kern muss so allgemein aufgebaut sein, dass andere Spielsysteme ebenfalls unterstützt werden können. Das aktuell aktive Foundry-System wird automatisch erkannt. Sämtliche systemabhängigen Datenzugriffe werden in Adapter ausgelagert.

---

# 2. Zentrale Designprinzipien

## 2.1 Originale Inhalte bleiben erhalten

Offizielle Gottheiten werden niemals gelöscht oder überschrieben.

Stattdessen erhält jede offizielle Gottheit einen konfigurierbaren Status:

- **sichtbar**
- **ausgeblendet**
- **durch Homebrew-Gott ersetzt**
- **nur für die Spielleitung sichtbar**
- **nur in Kompendien ausgeblendet**
- **nur in Auswahlfenstern ausgeblendet**
- **weiterhin für bestehende Charaktere erlaubt**
- **für neue Charaktere gesperrt**

Eine Homebrew-Gottheit kann eine offizielle Gottheit als mechanische Vorlage verwenden. Die originale UUID und ihre Daten bleiben erhalten.

---

## 2.2 Kanonische Definition und systemabhängige Umsetzung werden getrennt

Eine Gottheit besteht aus zwei Ebenen:

### Kanonische GodForge-Definition

Systemneutral gespeicherte Informationen:

- Name
- Bild
- Beschreibung
- Tags
- Pantheon
- Boni
- Fähigkeiten
- Bedingungen
- Sichtbarkeit
- Ersetzungsregeln
- Import-/Export-ID
- Versionsnummer

### Systemadapter-Ausgabe

Vom aktiven Adapter erzeugte oder verknüpfte Foundry-Dokumente:

- PF2e-Deity-Item
- PF2e-Rule-Elements
- PF2e-Effects
- PF2e-Actions
- Einträge für Charakterbogen und Leveler
- systemeigene Domänen, Zauber, Waffen und Attribute

Dadurch kann dieselbe Gottheit später in mehreren Systemen verwendet werden, ohne dass ihre gesamte Definition neu gebaut werden muss.

---

## 2.3 Easy Mode und Expertenmodus nutzen dieselbe Datenstruktur

Es darf keine getrennten Fähigkeitstypen für Anfänger und Experten geben.

Der **Easy Mode** erzeugt intern dieselben Effektknoten wie der **Expertenmodus**. Er zeigt lediglich vereinfachte Formulare und Vorlagen an.

Beispiel:

> „+2 auf RK für 2 Runden“

wird im Easy Mode über vier Felder erstellt:

- Effekt: Bonus
- Zielwert: Rüstungsklasse
- Wert: +2
- Dauer: 2 Runden

Intern entsteht daraus dieselbe strukturierte Definition, die im Expertenmodus als JSON oder visueller Effektbaum bearbeitet werden kann.

---

## 2.4 Keine unsicheren Formeln oder ungeprüfter Code

Freie Berechnungen dürfen nicht über `eval()` ausgeführt werden.

Benötigt wird ein sicherer Ausdrucksparser mit erlaubten Variablen und Funktionen. Importierte Gottheiten dürfen niemals ungefragt JavaScript ausführen.

Eigener JavaScript-Code ist nur als optionale GM-Expertenfunktion zulässig:

- standardmäßig deaktiviert
- klar als unsicher markiert
- nur für Spielleitungen sichtbar
- niemals automatisch durch einen Import aktiviert
- bevorzugt über Referenz auf ein bereits vorhandenes Foundry-Makro
- mit Warnung und Bestätigungsdialog

---

# 3. Technische Zielarchitektur

## 3.1 Schichtenmodell

```text
┌───────────────────────────────────────────────┐
│ Benutzeroberflächen                          │
│ GM-Dashboard · Editor · Spielerbuch · Dialoge│
├───────────────────────────────────────────────┤
│ GodForge-Anwendungslogik                     │
│ Gottheiten · Fähigkeiten · Nutzung · Rad     │
├───────────────────────────────────────────────┤
│ Effekt- und Regel-Engine                     │
│ Trigger · Bedingungen · Ziele · Aktionen     │
├───────────────────────────────────────────────┤
│ Systemadapter                                │
│ PF2e · zukünftige Adapter · Fallback         │
├───────────────────────────────────────────────┤
│ Foundry VTT                                  │
│ Documents · Hooks · Socket · Canvas · Rolls  │
└───────────────────────────────────────────────┘
```

---

## 3.2 Empfohlene Modulbereiche

```text
darkis-godforge/
├─ module.json
├─ scripts/
│  ├─ bootstrap/
│  │  ├─ init.ts
│  │  ├─ setup.ts
│  │  └─ ready.ts
│  ├─ core/
│  │  ├─ deity-service.ts
│  │  ├─ ability-service.ts
│  │  ├─ usage-service.ts
│  │  ├─ effect-engine.ts
│  │  ├─ trigger-engine.ts
│  │  ├─ target-service.ts
│  │  ├─ formula-service.ts
│  │  ├─ visibility-service.ts
│  │  └─ migration-service.ts
│  ├─ adapters/
│  │  ├─ adapter.interface.ts
│  │  ├─ adapter-registry.ts
│  │  ├─ generic/
│  │  └─ pf2e/
│  ├─ applications/
│  │  ├─ dashboard/
│  │  ├─ deity-editor/
│  │  ├─ ability-builder/
│  │  ├─ wheel-editor/
│  │  ├─ player-codex/
│  │  └─ dialogs/
│  ├─ canvas/
│  │  └─ fortune-wheel-overlay.ts
│  ├─ sockets/
│  ├─ api/
│  └─ migrations/
├─ templates/
├─ styles/
├─ lang/
├─ packs/
└─ assets/
```

---

# 4. Automatische Systemerkennung

## 4.1 Erkennung

Beim Start wird das aktive System über Foundry ermittelt:

```ts
const systemId = game.system.id;
const systemVersion = game.system.version;
```

Anschließend registriert die Adapterverwaltung den passenden Adapter.

Beispiel:

```ts
adapterRegistry.register("pf2e", new PF2eGodForgeAdapter());
adapterRegistry.register("*", new GenericGodForgeAdapter());
```

---

## 4.2 Adapterfähigkeiten

Jeder Adapter meldet, welche Funktionen er unterstützt:

```ts
interface AdapterCapabilities {
  deityDocuments: boolean;
  deitySelection: boolean;
  actorSheetIntegration: boolean;
  characterBuilderIntegration: boolean;
  skills: boolean;
  attributes: boolean;
  armorClass: boolean;
  savingThrows: boolean;
  conditions: boolean;
  ruleElements: boolean;
  restingEvents: string[];
  degreesOfSuccess: boolean;
  inlineChecks: boolean;
}
```

Die Benutzeroberfläche zeigt nur Optionen, die vom aktuellen Adapter unterstützt werden. Nicht unterstützte Funktionen werden nicht stillschweigend ignoriert, sondern verständlich markiert.

---

## 4.3 Verhalten ohne passenden Adapter

Bei unbekannten Systemen bleibt GodForge nutzbar für:

- Lore
- Porträts
- Beschreibungen
- manuelle Buttons
- Chatkarten
- generische Würfe
- generische Ressourcen
- Zeit- und Nutzungskontrolle
- Zufallstabellen
- Glücksrad

Systemwerte wie RK, systemeigene Fertigkeiten oder Zustände werden erst angeboten, wenn ein Adapter sie bereitstellt.

---

# 5. Speicherung der Gottheiten

## 5.1 Empfohlenes Zwei-Dokumente-Modell

### Kanonisches Dokument

Jede Gottheit wird als standardmäßiges Foundry-`JournalEntry`-Dokument gespeichert.

Vorteile:

- systemneutral
- Bilder und Beschreibungen
- Berechtigungen
- Verlinkung
- Kompendiumstauglichkeit
- Spielerbuch kann dieselben Inhalte verwenden
- strukturierte Daten können unter Modul-Flags gespeichert werden

Beispiel:

```ts
journal.flags["darkis-godforge"] = {
  schemaVersion: 1,
  deity: { ... }
};
```

### Materialisiertes Systemdokument

Der Adapter erzeugt zusätzlich ein systemeigenes Dokument.

Für PF2e ist dies vorzugsweise ein `Item` vom Typ `deity`. Zusätzliche Wunder können als `action`, `feat` oder `effect` materialisiert werden.

Zwischen beiden Dokumenten besteht eine stabile Verknüpfung:

```ts
flags["darkis-godforge"].definitionUuid
flags["darkis-godforge"].materializedUuid
```

---

## 5.2 Laufzeitstatus auf Charakteren

Charakterbezogene Nutzung wird niemals in der globalen Gottheitsdefinition gespeichert.

```ts
actor.flags["darkis-godforge"] = {
  selectedDeityId: "godforge.deity.avarrok",
  usages: {
    "ability.goldsegen": {
      remaining: 0,
      lastUsedAt: 123456789,
      resetKey: "world-day-47"
    }
  },
  counters: {
    "ability.festmahl": {
      defeatedEnemies: 2
    }
  },
  choices: {
    "ability.anpassung": "darkvision"
  }
};
```

---

# 6. Datenmodell einer Gottheit

## 6.1 Grunddaten

```ts
interface DeityDefinition {
  id: string;
  schemaVersion: number;
  revision: number;

  name: string;
  title?: string;
  subtitle?: string;
  slug: string;

  portrait?: string;
  icon?: string;
  symbol?: string;
  banner?: string;

  shortDescription?: string;
  description?: string;
  quote?: string;

  pantheonIds: string[];
  tags: string[];
  alignmentTags?: string[];
  creatureTraits?: string[];

  visibility: VisibilityConfiguration;
  replacement: ReplacementConfiguration;
  selection: SelectionConfiguration;

  systemValues: Record<string, unknown>;
  passiveBonuses: PassiveBonusDefinition[];
  abilities: AbilityDefinition[];

  metadata: {
    author?: string;
    createdAt: number;
    updatedAt: number;
    source?: string;
    license?: string;
  };
}
```

---

## 6.2 Sichtbarkeit pro Bereich

Die Spielleitung muss nicht nur die gesamte Gottheit sichtbar oder unsichtbar schalten können. Einzelne Datenbereiche benötigen eigene Sichtbarkeiten.

```ts
type VisibilityLevel =
  | "public"
  | "selection"
  | "followers"
  | "owner"
  | "trusted"
  | "gm"
  | "hidden-until-selected";
```

Konfigurierbar für:

- Name
- Titel
- Porträt
- Beschreibung
- Pantheon
- Boni
- Würfelboni
- göttliche Wunder
- genaue Zahlenwerte
- Voraussetzungen
- Domänen
- Zauber
- Waffe
- Anathema
- Edikte
- verborgene Geschichte
- interne GM-Notizen

Beispiel:

- Spieler sehen beim Erstellen nur Name, Bild und Beschreibung.
- Boni werden erst nach Auswahl sichtbar.
- Das Ingame-Kompendium zeigt alle öffentlichen Informationen.
- Geheime Wunder bleiben ausschließlich der Spielleitung bekannt.

---

# 7. Ersetzen offizieller Gottheiten

## 7.1 Ersetzungsdefinition

```ts
interface ReplacementConfiguration {
  mode:
    | "none"
    | "hide-original"
    | "replace-original"
    | "clone-mechanics"
    | "selective-inheritance";

  sourceUuid?: string;

  inherit?: {
    domains?: boolean;
    alternateDomains?: boolean;
    favoredWeapon?: boolean;
    spells?: boolean;
    sanctification?: boolean;
    divineAttribute?: boolean;
    divineFont?: boolean;
    skill?: boolean;
    edicts?: boolean;
    anathema?: boolean;
    avatar?: boolean;
  };

  overrides?: Record<string, unknown>;

  hideSourceIn?: {
    compendiumBrowsers: boolean;
    characterBuilder: boolean;
    actorSheet: boolean;
    searches: boolean;
    leveler: boolean;
  };

  keepForExistingActors: boolean;
}
```

---

## 7.2 Kein Löschen und keine globale Mutation

Verboten:

- Originalkompendium bearbeiten
- offizielle Items löschen
- Quell-UUID ersetzen
- Systempakete direkt verändern

Stattdessen:

1. GodForge baut einen gefilterten Gottheitenkatalog.
2. Charakterbogen, Leveler und GodForge-Auswahl fragen diesen Katalog ab.
3. Ausgeblendete Originale werden aus der UI entfernt.
4. Bestehende Charaktere dürfen sie bei Bedarf weiter verwenden.
5. Homebrew-Gottheiten verweisen intern auf ihre mechanische Vorlage.

---

## 7.3 Gemeinsame öffentliche API für andere Module

Der spätere PF2e Leveler darf nicht dieselbe Logik noch einmal implementieren.

```ts
game.modules.get("darkis-godforge")?.api
```

Empfohlene API:

```ts
interface GodForgeAPI {
  getSelectableDeities(context: SelectionContext): Promise<DeitySummary[]>;
  getDeity(idOrUuid: string): Promise<DeityDefinition | null>;
  getActorDeity(actor: Actor): Promise<DeityDefinition | null>;
  assignDeity(actor: Actor, deityId: string): Promise<void>;
  removeDeity(actor: Actor): Promise<void>;

  getReplacementFor(sourceUuid: string): Promise<DeityDefinition | null>;
  isSourceHidden(sourceUuid: string, context: string): boolean;

  activateAbility(actor: Actor, abilityId: string, options?: object): Promise<void>;
  resetActorUsages(actor: Actor, resetType: string): Promise<void>;

  registerAdapter(adapter: GodForgeSystemAdapter): void;
}
```

Zusätzliche Hooks:

```ts
Hooks.callAll("darkisGodForge.preAssignDeity", actor, deity);
Hooks.callAll("darkisGodForge.assignDeity", actor, deity);
Hooks.callAll("darkisGodForge.preActivateAbility", context);
Hooks.callAll("darkisGodForge.activateAbility", result);
Hooks.callAll("darkisGodForge.usageReset", actor, resetType);
```

---

# 8. Aufbau des Gottheiten-Editors

Der Editor wird als mehrstufiger Prozess angeboten.

## 8.1 Schritte

1. **Grunddaten**
2. **Darstellung**
3. **Pantheon und Tags**
4. **Offizielle Vorlage / Ersetzung**
5. **Systemwerte**
6. **Passive Boni**
7. **Göttliche Wunder**
8. **Sichtbarkeit**
9. **Spielerauswahl**
10. **Vorschau und Veröffentlichung**

---

## 8.2 Entwurf, veröffentlicht und archiviert

Status einer Gottheit:

- **Entwurf:** Nur GM, nicht auswählbar
- **Test:** Für ausgewählte Benutzer oder Testcharaktere
- **Veröffentlicht:** Regulär auswählbar
- **Deaktiviert:** Bleibt auf bestehenden Charakteren, nicht neu auswählbar
- **Archiviert:** Nur noch in Verwaltung sichtbar

---

## 8.3 Live-Vorschau

Der Editor zeigt parallel:

- GM-Karte
- Spieler-Auswahlkarte
- Charakterbogen-Darstellung
- Kompendiumseite
- Chatkarte der Fähigkeit
- Button im Aktionsbereich

---

# 9. Passive Boni

Passive Boni sind dauerhaft aktiv, solange die Gottheit ausgewählt und der Bonus nicht durch eine Bedingung deaktiviert ist.

## 9.1 Bonusarten

Der Baukasten muss mindestens unterstützen:

- Fertigkeitsbonus
- Attributsbonus
- Wahrnehmungsbonus
- Rettungswurfbonus
- RK-Bonus
- Angriffsbonus
- Schadensbonus
- Initiativebonus
- Bewegungsbonus
- Geschwindigkeitsart hinzufügen
- Resistenz
- Immunität
- Schwäche
- temporäre Trefferpunkte
- maximale Trefferpunkte
- Zauber-SG
- Klassen-SG
- Gegenstands-SG
- Heilungsbonus
- Würfelmodifikation
- Reroll
- Fortune/Misfortune
- Erfolgsgrad anheben oder senken
- Roll-Option setzen
- Proficiency-Rang erhöhen
- Sprache hinzufügen
- Sinn hinzufügen
- Trait hinzufügen
- systemeigener freier Selektor

---

## 9.2 Konfiguration eines Würfelbonus

```ts
interface RollBonusEffect {
  kind: "roll-bonus";
  selectors: string[];
  value: NumericExpression;
  modifierType:
    | "status"
    | "circumstance"
    | "item"
    | "proficiency"
    | "untyped"
    | "system-default";

  label: string;
  predicate?: ConditionTree;
  appliesTo?: "checks" | "dc" | "both";
  stacking?: "system" | "always" | "highest" | "sum";
}
```

Easy-Mode-Felder:

- Bonus auf
- Wert
- Bonusart
- immer / nur unter Bedingung
- betrifft Würfe, SG oder beides

PF2e muss seine normalen Stapelregeln beachten. Zwei Statusboni derselben Art werden nicht einfach addiert.

---

## 9.3 Beliebige Boni statt fest eingebauter Fertigkeitsliste

Der GM darf nicht auf die Boni aus Noclaris beschränkt sein.

Benötigt werden:

- dynamische Liste aller Fertigkeiten des aktiven Systems
- optionale freie Selektoreingabe
- mehrere Boni pro Gottheit
- individuelle Werte je Bonus
- Bonusformel statt nur fester Zahl
- Bonus nur für bestimmte Aktionen oder Traits
- Bonus nur an bestimmten Glaubensorten
- Bonus abhängig von Tageszeit, Licht oder Umgebung
- Bonus nur gegen bestimmte Kreaturen
- Bonus nur beim Verteidigen eines Glaubensgrundsatzes

---

# 10. Göttliche Wunder als eigenständige Fähigkeiten

Jede Gottheit kann beliebig viele Fähigkeiten besitzen.

Eine Fähigkeit kann:

- aktiv
- passiv
- reaktiv
- automatisch ausgelöst
- als Aura
- als Ritual
- als Zufallstabelle
- als Glücksrad
- als reine Chat-/Rollenspielaktion

angelegt werden.

---

## 10.1 Grundmodell

```ts
interface AbilityDefinition {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;

  category:
    | "divine-wonder"
    | "ritual"
    | "passive"
    | "reaction"
    | "free-action"
    | "exploration"
    | "downtime"
    | "custom";

  description: string;
  quote?: string;
  traits: string[];

  actionCost: ActionCost;
  activation: ActivationDefinition;
  usage: UsageDefinition;
  duration: DurationDefinition;

  triggers: TriggerDefinition[];
  conditions?: ConditionTree;
  targeting: TargetingDefinition;
  resolution: ResolutionDefinition;

  effects: EffectNode[];
  visibility: VisibilityConfiguration;

  chat: ChatConfiguration;
  animation?: AnimationConfiguration;
  sound?: SoundConfiguration;

  advanced?: {
    ruleElements?: object[];
    macroUuid?: string;
    rawAdapterData?: Record<string, unknown>;
  };
}
```

---

# 11. Aktivierung, Häufigkeit, Abklingzeit und Dauer müssen getrennt sein

Dies ist eine der wichtigsten technischen Regeln des gesamten Moduls.

Die folgenden Begriffe dürfen im Editor nicht vermischt werden:

- **Aktionskosten:** Was kostet die Aktivierung?
- **Nutzungshäufigkeit:** Wie oft darf sie aktiviert werden?
- **Zurücksetzung:** Wann werden Nutzungen erneuert?
- **Abklingzeit:** Wie lange bis zur nächsten Verwendung?
- **Dauer:** Wie lange wirkt der Effekt?
- **Trigger:** Wann darf oder muss sie ausgelöst werden?

„Einmal pro Runde“ ist eine Nutzungshäufigkeit.  
„Wirkt eine Runde“ ist eine Dauer.  
„Setzt sich bei täglicher Vorbereitung zurück“ ist ein Reset.

---

# 12. Aktionskosten

Auswahlmöglichkeiten:

- keine Aktion / automatisch
- freie Aktion
- Reaktion
- 1 Aktion
- 2 Aktionen
- 3 Aktionen
- Aktivität mit variablen Aktionen
- Erkundungsaktivität
- Downtime-Aktivität
- 10 Minuten
- 1 Stunde
- frei definierte Zeit
- manuelle SL-Aktion

Zusatzfelder:

- benötigt freie Hand
- benötigt Stimme
- benötigt Sichtkontakt
- benötigt Bewegung
- benötigt Fokus
- benötigt Symbol oder heiligen Gegenstand
- benötigt ein bestimmtes Item
- provoziert Reaktionen
- kann außerhalb eines Kampfes genutzt werden
- kann bewusstlos genutzt werden
- kann sterbend genutzt werden

---

# 13. Nutzungshäufigkeit

## 13.1 Voreinstellungen

- unbegrenzt
- X-mal pro Zug
- X-mal pro Runde
- X-mal pro Begegnung
- X-mal pro Szene
- X-mal pro 10-Minuten-Rast
- X-mal pro kurzer Rast
- X-mal pro langer Rast
- X-mal pro täglicher Vorbereitung
- X-mal pro Kalendertag
- X-mal in beliebig vielen Tagen
- X-mal pro Woche
- X-mal pro Monat
- X-mal pro Jahr
- X Ladungen
- Ressource ausgeben
- nur nach erfüllter Bedingung
- nur durch GM zurücksetzbar

---

## 13.2 Empfehlung für Rastbegriffe

Pathfinder 2e verwendet keine klassische, universelle Kurzrast/Langrast-Struktur wie D&D.

Darum sollte der Kern mit abstrakten **Reset-Ereignissen** arbeiten:

- `ten-minute-rest`
- `refocus`
- `daily-preparations`
- `encounter-end`
- `scene-change`
- `calendar-day`
- `custom-rest`

Der PF2e-Adapter zeigt benutzerfreundlich:

- **Nach 10 Minuten Rast**
- **Nach Refokussieren**
- **Bei täglicher Vorbereitung**
- **Nach Ende einer Begegnung**

Andere Adapter dürfen daraus „Kurze Rast“ oder „Lange Rast“ machen.

Die Spielleitung kann eigene Reset-Ereignisse definieren und benennen.

---

## 13.3 Beliebige Anzahl an Tagen

```ts
interface CalendarReset {
  mode: "elapsed-days" | "calendar-day" | "calendar-month" | "calendar-year";
  amount: number;
  resetTime?: string;
  calendarProvider?: "foundry-time" | "simple-calendar" | "custom";
}
```

Beispiele:

- alle 3 Tage
- alle 30 Tage
- einmal pro Kalendermonat
- einmal pro Ingame-Jahr
- jeden Montag
- am ersten Tag eines selbst definierten Monats

Ohne Kalendermodul wird mit verstrichener Weltzeit gearbeitet. Mit kompatiblem Kalendermodul können echte Kalendergrenzen verwendet werden.

---

# 14. Dauer

## 14.1 Voreinstellungen

- sofort
- bis Ende der aktuellen Aktion
- bis Ende des aktuellen Zuges
- bis Beginn des nächsten Zuges
- bis Ende des nächsten Zuges
- 1 oder X Runden
- 1 oder X Minuten
- 1 oder X Stunden
- bis Begegnungsende
- bis Szenenende
- bis zur nächsten 10-Minuten-Rast
- bis zur nächsten täglichen Vorbereitung
- bis zum nächsten Reset
- permanent
- bis Bedingung erfüllt
- bis Konzentration endet
- manuell durch GM beendet

---

## 14.2 Rundengenaue Zeit

Im Kampf wird rundenbasiert gezählt. Außerhalb des Kampfes kann dieselbe Dauer in Weltzeit umgerechnet werden.

Beispiel:

```ts
{
  type: "rounds",
  value: 2,
  starts: "immediately",
  expires: "end-of-owners-turn"
}
```

Benötigte Ablaufpunkte:

- Beginn des auslösenden Zuges
- Ende des auslösenden Zuges
- Beginn des Zielzuges
- Ende des Zielzuges
- Beginn der Runde
- Ende der Runde

---

# 15. Trigger

## 15.1 Manuelle Trigger

- eigener Button
- Button auf Charakterbogen
- Button in Token Action HUD
- Hotbar-Makro
- Chatkarten-Button
- Rechtsklick auf Token
- Szenensteuerung
- GM-Auslösung
- API-Aufruf eines anderen Moduls

---

## 15.2 Kampftrigger

- Begegnung beginnt
- Begegnung endet
- Runde beginnt
- Runde endet
- eigener Zug beginnt
- eigener Zug endet
- fremder Zug beginnt
- fremder Zug endet
- Initiative wird gewürfelt
- Initiativeposition ändert sich
- Aktion wird begonnen
- Aktion wird abgeschlossen
- Angriff wird gewürfelt
- Angriff trifft
- kritischer Treffer
- Angriff verfehlt
- kritischer Fehlschlag
- Schaden wird verursacht
- Schaden wird genommen
- Heilung wird erhalten
- Ziel fällt auf 0 TP
- Anwender fällt auf 0 TP
- Zustand wird hinzugefügt
- Zustand wird entfernt
- Sterbend-Wert ändert sich
- Kreatur stirbt
- Gegner wird besiegt
- Reaktion würde ausgelöst
- Bewegung beginnt
- Bewegung endet
- Reichweite wird betreten oder verlassen

---

## 15.3 Erkundungs- und Rollenspieltrigger

- Rast begonnen oder beendet
- tägliche Vorbereitung abgeschlossen
- Nahrung gegessen
- bestimmtes Item benutzt
- Gebet ausgeführt
- Glaubensort betreten
- bestimmte Region betreten
- Lichtzustand geändert
- Schatten betreten
- Wasser berührt
- Leiche untersucht
- Gegenstand gestohlen
- Gold erhalten oder ausgegeben
- Lüge ausgesprochen
- Wissen abgerufen
- soziale Probe durchgeführt
- Downtime-Aktivität beendet
- Kalenderdatum erreicht
- GM setzt Story-Flag

---

## 15.4 Zählertrigger

Das Modul benötigt eigene Zähler.

Beispiele:

- X Gegner besiegt
- X kritische Treffer
- X Tage gewartet
- X Gold ausgegeben
- X Mahlzeiten gegessen
- X Zauber gewirkt
- X Schaden erlitten
- X Verbündete geheilt
- X Runden ohne feindliche Aktion

Zähler können zurückgesetzt werden:

- nach Verwendung
- bei täglicher Vorbereitung
- bei Szenenwechsel
- nie
- manuell
- bei einem anderen Trigger

---

# 16. Bedingungseditor

## 16.1 Visueller UND-/ODER-Baum

```text
ALLE Bedingungen:
├─ Anwender ist Sterbend
├─ Anwender ist NICHT Bewusstlos
└─ MINDESTENS EINE:
   ├─ Gegner innerhalb 9 m
   └─ Gegner als Ziel ausgewählt
```

Unterstützte Operatoren:

- UND
- ODER
- NICHT
- mindestens X von Y
- genau X von Y

---

## 16.2 Vergleichsoperatoren

- gleich
- ungleich
- größer
- größer oder gleich
- kleiner
- kleiner oder gleich
- enthält
- enthält nicht
- besitzt Trait
- besitzt Zustand
- besitzt Item
- besitzt Roll-Option
- ist Verbündeter
- ist Gegner
- ist Eigentümer
- ist Boss
- ist einzigartig
- ist bewusstlos
- ist sterbend
- ist tot

---

## 16.3 System- und Weltdaten

Bedingungen dürfen auf Folgendes zugreifen:

- Charakterstufe
- Zielstufe
- Unterschied der Stufen
- Trefferpunkte
- Trefferpunkte in Prozent
- temporäre Trefferpunkte
- Zustände
- Traits
- Größe
- Kreaturentyp
- Fraktion
- Entfernung
- Sichtlinie
- Licht
- Gelände
- Szene
- Region
- Tageszeit
- Kalender
- ausgewählte Gottheit
- Pantheon
- Glaubensort
- Zähler
- verbleibende Nutzungen
- Ausrüstung
- gehaltene Gegenstände
- Tags eines Items
- Ergebnis des letzten Wurfs

---

# 17. Würfe und Schwierigkeitsgrade

## 17.1 Würfelarten

- kein Wurf
- W20
- W100
- frei definierte Würfelformel
- Angriffswurf
- Fertigkeitswurf
- Rettungswurf
- Wahrnehmungswurf
- Klassen-SG
- Zauber-SG
- Gegenstands-SG
- konkurrierender Wurf
- Flat Check
- geheime Probe
- GM-Wurf
- Zielwurf
- Gruppenwurf

---

## 17.2 SG-Quellen

- fester Wert
- SG nach Anwenderstufe
- SG nach Zielstufe
- Klassen-SG
- Zauber-SG
- höherer Wert aus Klassen- und Zauber-SG
- niedrigerer Wert
- Attributs-SG
- Gottheiten-SG
- Item-SG
- eigener Ausdruck
- vom GM beim Aktivieren eingegeben
- aus Originalgottheit oder Vorlage übernommen

Easy-Mode-Empfehlung für PF2e:

1. Klassen- oder Zauber-SG des Anwenders, je nachdem welcher höher ist
2. bei rein erzählerischen Fähigkeiten kein Wurf
3. bei Effekten ohne Anwenderwert ein stufenbasierter SG

---

## 17.3 Vier Erfolgsgrade

PF2e-Fähigkeiten benötigen getrennte Effekte für:

- kritischer Erfolg
- Erfolg
- Fehlschlag
- kritischer Fehlschlag

Der Editor zeigt standardmäßig:

```text
Kritischer Erfolg: Kein Effekt
Erfolg:            Abgeschwächter Effekt
Fehlschlag:        Haupteffekt
Kritischer Fehlschlag: Verstärkter Effekt
```

Natürliche 20 und natürliche 1 werden durch den PF2e-Adapter regelkonform behandelt.

---

## 17.4 Wiederholte Rettungswürfe

Optionen:

- kein erneuter Wurf
- am Ende jedes Zielzuges
- am Beginn jedes Zielzuges
- bei erlittenem Schaden
- bei feindlicher Aktion
- nach einer Runde
- einmalig nach X Runden

---

# 18. Zielsystem

## 18.1 Zielarten

- Anwender
- ausgewählter Token
- ein Verbündeter
- ein Gegner
- eine Kreatur
- mehrere frei gewählte Kreaturen
- alle Verbündeten in Reichweite
- alle Gegner in Reichweite
- alle Kreaturen in Reichweite
- aktuelles Angriffsziel
- letzter Angreifer
- verursachende Kreatur
- Leiche
- Gegenstand
- gehaltenes Item
- getragenes Item
- nicht fest angelegtes Item
- Punkt auf der Szene
- Schatten
- Lichtquelle
- Tür
- Region
- Tile
- Szene
- kein Ziel

---

## 18.2 Flächen

- Aura / Emanation
- Burst
- Kegel
- Linie
- Quadrat
- Kreis
- Ring
- frei gezeichnete Schablone
- Tokenreichweite
- gesamte Szene

---

## 18.3 Zielbeschränkungen

- maximale Anzahl
- minimale Anzahl
- Reichweite
- gleiche Szene
- Sichtlinie
- Wirkungslinie
- freiwillig
- lebendig
- tot
- Leiche vorhanden
- gleiche oder niedrigere Stufe
- maximale Stufendifferenz
- keine Bossgegner
- keine einzigartigen Kreaturen
- keine geistlosen Kreaturen
- bestimmter Trait
- ausgeschlossene Traits
- verbündet
- feindlich
- neutral
- nicht bereits betroffen
- nicht der Anwender
- nur der Anwender

---

## 18.4 Boss-Erkennung

„Kein Bossgegner“ darf nicht nur ein freies Textfeld sein.

Konfigurierbare Erkennung:

- Trait `unique`
- explizites GodForge-Flag `boss`
- NPC-Stufe über Gruppenstufe
- NPC-Stufe über Anwenderstufe
- Tokenname oder Ordner-Tag
- manuelle Markierung durch GM
- Integration in vorhandene Boss-/Elite-Marker
- immer nachfragen, wenn unklar

Die Spielleitung kann die automatische Erkennung überstimmen.

---

# 19. Effektbibliothek

## 19.1 Würfel und Zahlen

- festen Bonus hinzufügen
- Malus hinzufügen
- Formelbonus
- Würfel hinzufügen
- Würfel ersetzen
- Würfelgröße verändern
- Reroll
- bestes Ergebnis nehmen
- schlechtestes Ergebnis nehmen
- Ergebnis festlegen
- Mindestwert
- Höchstwert
- Erfolgsgrad verändern
- Schaden verdoppeln oder halbieren

---

## 19.2 Trefferpunkte

- heilen
- Schaden
- temporäre Trefferpunkte
- maximale TP verändern
- auf 1 TP setzen
- Stabilisieren
- Wiederbeleben
- Regeneration
- fortlaufender Schaden
- Heilung verhindern
- Schaden umleiten
- Schaden teilen

---

## 19.3 Zustände

- Zustand hinzufügen
- Zustand entfernen
- Zustand erhöhen
- Zustand senken
- Zustand für bestimmte Zeit ignorieren
- nur Nachteile eines Zustands ignorieren
- Zustand unterdrücken, aber Wert behalten
- Zustand bei Ablauf wiederherstellen
- Zustand gegen anderen austauschen
- Immunität gegen Zustand
- Zustand nur während bestimmter Aktionen ignorieren

---

## 19.4 Bewegung

- Schritt
- Bewegung
- erzwungene Bewegung
- teleportieren
- Plätze tauschen
- zum Ziel bewegen
- vom Ziel weg bewegen
- Klettergeschwindigkeit
- Schwimmgeschwindigkeit
- Fluggeschwindigkeit
- Grabgeschwindigkeit
- schwieriges Gelände ignorieren
- Bewegung verhindern

---

## 19.5 Gegenstände und Wirtschaft

- Item erzeugen
- Item kopieren
- Item übertragen
- Item stehlen
- Item verbrauchen
- Item zerstören
- Item umwandeln
- Gold erzeugen
- Gold entfernen
- Formelwert erzeugen
- zufälliges Item aus Tabelle
- Item für bestimmte Zeit erzeugen
- Item nach Ablauf entfernen
- Item nur für Besitzer sichtbar

---

## 19.6 Informationen und Wahrnehmung

- Illusionen besser erkennen
- Unsichtbarkeit erkennen
- Gestaltwandler erkennen
- Lügen erkennen
- Aura analysieren
- Kreaturentyp identifizieren
- Schwächen anzeigen
- Geheimnis aufdecken
- tote Kreatur befragen
- GM-Fragefenster öffnen
- geheime Information als Whisper senden

---

## 19.7 Kontrolle

- Ziel übernimmt Fraktion
- Ziel betrachtet Verbündete als Verbündete
- Ziel führt vorgegebene Aktion aus
- Ziel verliert Aktionen
- Ziel verliert Reaktion
- Ziel darf nur bestimmte Aktionen ausführen
- Ziel kann nicht sprechen
- Zauberkomponenten blockieren
- Ziel wird fasziniert
- Ziel wird verängstigt
- Ziel kann Zielauswahl nicht frei ändern

---

## 19.8 Auren

- Radius
- betrifft Selbst
- betrifft Verbündete
- betrifft Gegner
- Eintrittseffekt
- Austrittseffekt
- wiederkehrender Effekt
- Stapelverhalten
- Sichtbarkeit auf Szene
- Farbe und Animation
- Token-Aura oder unsichtbare Region

---

## 19.9 Narrative und GM-Effekte

- Chattext
- Journal öffnen
- Handout anzeigen
- Bild zeigen
- Sound abspielen
- Playlist wechseln
- Licht verändern
- Szene wechseln
- Tile aktivieren
- Tür öffnen
- Tokenbild verändern
- Wettereffekt auslösen
- GM um Entscheidung bitten
- Dialog mit Freitextantwort
- Story-Flag setzen

---

# 20. Effektkette und Ablaufsteuerung

Eine Fähigkeit besteht nicht nur aus einer flachen Liste. Sie benötigt einen Ablaufgraphen.

Mögliche Knoten:

- Aktion
- Bedingung
- Verzweigung
- Schleife über Ziele
- Verzögerung
- Würfelwurf
- Entscheidung des Anwenders
- Entscheidung der Spielleitung
- Zufall
- Effekt
- Chatnachricht
- Fehler-/Abbruchpfad

Beispiel „Betörende Herrschaft“:

```text
Ziel auswählen
→ Ziel prüfen
  → gleiche oder niedrigere Stufe?
  → kein Boss?
  → nicht geistlos?
→ Willenswurf
  ├─ Kritischer Erfolg: kein Effekt
  ├─ Erfolg: optional fasziniert 1 Runde
  ├─ Fehlschlag: Fraktion 1 Runde ändern
  └─ Kritischer Fehlschlag: Fraktion ändern + Reaktion verlieren
→ Nutzung verbrauchen
→ Chatkarte erzeugen
```

---

# 21. Auswahl- und Variantenfähigkeiten

Für Fähigkeiten wie **Anpassung** wird ein `Choice`-Knoten benötigt.

Optionen können:

- einen einzelnen Effekt auswählen
- mehrere Effekte erlauben
- abhängig von Voraussetzungen sein
- dauerhaft gespeichert werden
- bei jeder Nutzung neu gewählt werden
- geheim durch den GM gewählt werden
- zufällig gewählt werden

Beispiel:

```ts
{
  type: "choice",
  prompt: "Wähle eine Anpassung",
  count: 1,
  options: [
    { id: "climb", label: "Klettergeschwindigkeit", effects: [...] },
    { id: "swim", label: "Schwimmgeschwindigkeit", effects: [...] },
    { id: "darkvision", label: "Dunkelsicht", effects: [...] },
    { id: "resistance", label: "Elementresistenz", effects: [...] }
  ]
}
```

---

# 22. Sicherer Formel-Editor

## 22.1 Erlaubte Variablen

Beispiele:

```text
@actor.level
@actor.hp
@actor.maxHp
@actor.classDC
@actor.spellDC
@target.level
@target.hpPercent
@ability.rank
@counter.defeatedEnemies
@usage.remaining
@party.level
@world.day
@scene.darkness
```

---

## 22.2 Erlaubte Funktionen

- `min()`
- `max()`
- `round()`
- `floor()`
- `ceil()`
- `abs()`
- `clamp()`
- `if()`
- Würfelformeln
- systembereitgestellte sichere Resolver

Beispiele:

```text
@actor.level
3d8 + @actor.level
ceil(@actor.level / 2)
max(1, @actor.level)
if(@target.level <= @actor.level, 1, 0)
```

---

## 22.3 Formelvorschau

Der Editor zeigt:

- berechneten Wert für einen gewählten Testcharakter
- Werte für Stufe 1, 5, 10, 15 und 20
- Warnung bei extremen Ausreißern
- fehlende Variablen
- inkompatible Systempfade
- Ergebnisbereich bei Würfeln

---

# 23. Spezieller Zustand: Effekte ignorieren, ohne sie zu entfernen

Dies wird insbesondere für **Iravex – Blinder Zorn** benötigt.

## 23.1 Unterschiedliche Modi

- **Entfernen:** Zustand wird gelöscht
- **Unterdrücken:** Zustand bleibt gespeichert, seine Wirkung pausiert
- **Nachteile ignorieren:** Nur negative Modifikatoren werden ignoriert
- **Aktionsbeschränkung ignorieren:** Zustand bleibt sichtbar, blockiert aber bestimmte Aktionen nicht
- **Ausgewählte Teile ignorieren:** systemabhängige Teilwirkung

---

## 23.2 Sterbend, aber handlungsfähig

Die gewünschte Iravex-Funktion lautet technisch:

- `Sterbend` bleibt bestehen.
- Der Sterbend-Wert kann weiter steigen.
- Die Todesgrenze gilt weiterhin.
- Der Charakter wird nicht geheilt.
- Der Charakter wird nicht stabilisiert.
- Die normalerweise daraus abgeleitete Handlungsunfähigkeit bzw. Bewusstlosigkeit wird für die Dauer unterdrückt.
- Ein bereits separat vorhandener Zustand `Bewusstlos` wird **nicht** ignoriert.
- Der Charakter darf ausschließlich:
  - angreifen
  - sich auf einen Gegner zubewegen
  - eine Waffe ziehen
- keine Heilung
- keine Stabilisierung
- keine defensiven oder unterstützenden Aktionen
- nach Ablauf werden alle weiterhin vorhandenen Zustände normal ausgewertet
- erreicht der Charakter die Todesgrenze, stirbt er trotz des Wunders

Dies ist keine rein generische Statusentfernung und muss im PF2e-Adapter ausdrücklich implementiert und getestet werden.

---

# 24. Zufallstabellen

## 24.1 Tabellenarten

- klassische Würfeltabelle
- gewichtete Tabelle
- Bereichstabelle
- Kartendeck
- Ziehen ohne Zurücklegen
- verschachtelte Tabelle
- mehrere Ergebnisse gleichzeitig
- geheime GM-Tabelle
- öffentliches Glücksrad

---

## 24.2 Einträge

Jeder Eintrag besitzt:

```ts
interface RandomEntry {
  id: string;
  label: string;
  range?: { from: number; to: number };
  weight?: number;

  category?: "positive" | "neutral" | "negative" | "catastrophic" | "jackpot";
  description?: string;
  icon?: string;
  image?: string;

  effects: EffectNode[];

  visibleToPlayers: boolean;
  revealAfterRoll: boolean;
  allowReroll: boolean;
}
```

---

## 24.3 Unterstützte Würfel

- W2
- W4
- W6
- W8
- W10
- W12
- W20
- W100
- frei definierte Formel
- gewichtete Ergebnisse ohne sichtbare Würfelzahlen

---

# 25. Animiertes Glücksrad

## 25.1 Grundsatz

Das Würfelergebnis wird zuerst autoritativ durch Foundry beziehungsweise den GM-Client ermittelt. Die Animation ist nur die visuelle Darstellung dieses bereits feststehenden Ergebnisses.

Dadurch kann ein Spieler das Ergebnis nicht durch Manipulation der Animation verändern.

---

## 25.2 Darstellungsmodi

- Vollbild über dem Spielfeld
- zentriert über dem Canvas
- kleines Fenster
- Chatkarten-Rad
- nur auf dem GM-Bildschirm
- nur für Besitzer der Fähigkeit
- für alle Spieler
- nur für ausgewählte Benutzer
- Ergebnis geheim, Animation öffentlich
- Animation geheim, nur Ergebnis öffentlich

---

## 25.3 Ablauf

1. Spieler drückt „Chaosrad“.
2. Modul prüft Nutzungen und Bedingungen.
3. Anfrage wird an den autoritativen GM gesendet.
4. GM würfelt das Ergebnis.
5. Ergebnis wird gespeichert.
6. Berechtigte Clients erhalten Animationsdaten.
7. Rad dreht mit kontrollierter Animation.
8. Rad stoppt auf dem festgelegten Segment.
9. Effekt wird durch GM-Autorität ausgeführt.
10. Chatkarte und gegebenenfalls Sound werden erzeugt.
11. Nutzung wird verbraucht.

---

## 25.4 Konfiguration

- Radbild
- Rahmen
- Segmentfarben
- Zeiger
- Drehdauer
- Mindestumdrehungen
- Beschleunigungs- und Abbremskurve
- Startsound
- Drehsound
- Ergebnissound
- Partikeleffekt
- Bildschirmzittern
- Konfetti
- Ergebnisbanner
- automatische Chatnachricht
- Skip-Button
- reduzierte Bewegung für Barrierefreiheit
- Fallback ohne Canvas

---

## 25.5 GM-Sichtbarkeit

Einstellung pro Rad und pro Fähigkeit:

- **Öffentlich**
- **Nur Spielleitung**
- **Nur ausführender Spieler und GM**
- **Individuelle Benutzer**
- **Animation öffentlich, Tabelleninhalt geheim**
- **Nur Ergebnis offenlegen**

Die vollständige 1–100-Tabelle kann verborgen bleiben, obwohl das Rad öffentlich sichtbar ist.

---

# 26. Nutzung und Autorität im Mehrspielermodus

## 26.1 Wer darf aktivieren?

Pro Fähigkeit:

- nur Besitzer des Charakters
- Besitzer und GM
- nur GM
- vertrauenswürdige Spieler
- alle Spieler
- nur über Automation
- nur durch API

---

## 26.2 Wer führt Änderungen aus?

Sicherheitskritische Änderungen werden GM-autoritativ ausgeführt:

- fremde Actor-Dokumente verändern
- Gegenstände stehlen oder übertragen
- Gold erzeugen
- Kreaturen kontrollieren
- Szenen verändern
- geheime Tabellen würfeln
- Items aus Kompendien erzeugen

Der Spieler sendet eine validierte Anfrage. Der GM-Client prüft erneut:

- Besitzrechte
- Ziel
- Distanz
- Nutzung
- Bedingungen
- Formel
- erlaubte Effektknoten

---

## 26.3 Keine doppelte Aktivierung

Benötigt wird eine Sperre pro Aktivierung:

```ts
activationId = crypto.randomUUID();
```

Der Server-/GM-Prozess markiert die Aktivierung als:

- angefragt
- validiert
- läuft
- abgeschlossen
- abgebrochen
- rückgängig gemacht

Doppelte Klicks oder verzögerte Socket-Nachrichten dürfen keine zweite Nutzung erzeugen.

---

# 27. Charakterbogen-Integration

## 27.1 Anzeige

Ein eigener Bereich zeigt:

- Gottheit
- Porträt und Symbol
- Pantheon
- passive Boni
- göttliche Wunder
- verbleibende Nutzungen
- Resetzeit
- Bedingungen
- Aktivierungsbuttons
- Link zum Spielerkompendium

---

## 27.2 PF2e-Integration

Der PF2e-Adapter muss:

- Homebrew-Gottheit als gültiges Deity-Item materialisieren
- offizielle versteckte Gottheiten aus Auswahlquellen filtern
- Boni möglichst über PF2e-Rule-Elements abbilden
- Actions/Effects für Wunder erzeugen
- Inline Checks und Chatkarten nutzen
- Systemstapelregeln respektieren
- bestehende Charaktere migrieren können
- Änderungen an der Gottheit kontrolliert synchronisieren

Da PF2e-Datenpfade und Rule Elements sich ändern können, gehören sämtliche PF2e-Pfade ausschließlich in den Adapter.

---

## 27.3 Synchronisierungsmodi

Pro Gottheit oder Welt:

- **Live-Verknüpfung:** Änderungen gelten sofort für alle Anhänger
- **Beim nächsten Laden:** Änderungen werden beim Öffnen des Actors synchronisiert
- **Manuelle Aktualisierung:** GM bestätigt
- **Kopie beim Auswählen:** Charakter behält damalige Version
- **Versionsgebunden:** Charakter zeigt Update an, übernimmt aber erst nach Bestätigung

Empfehlung:

- Standard: Live-Verknüpfung für Beschreibungen und Boni
- Bestätigungspflicht bei regelrelevanten Änderungen während einer laufenden Sitzung
- Backup vor Massenmigration

---

# 28. Integration in Darkis PF2e Leveler

Der Leveler fragt ausschließlich die GodForge-API ab.

Beim Gottheitenschritt:

1. GodForge liefert sichtbare Gottheiten.
2. Leveler übergibt Actor, Spieler, Klasse und Stufe als Kontext.
3. GodForge filtert:
   - Voraussetzungen
   - Region
   - Pantheon
   - verbotene Optionen
   - Sichtbarkeit
   - Veröffentlichungsstatus
4. Leveler rendert Karten.
5. Je nach GM-Einstellung zeigt die Karte:
   - nur Name und Bild
   - Kurzbeschreibung
   - Boni
   - Wunder
   - alle mechanischen Werte
6. Auswahl wird durch GodForge validiert.
7. Materialisierte Items und Effekte werden auf Actor angewendet.

---

# 29. Spielerkompendium im Buchdesign

## 29.1 Grundidee

Die GM-Oberfläche orientiert sich an den bereitgestellten dunklen Verwaltungs-Dashboards:

- linke Navigation
- große Gottheitenkarten
- Schnellzugriff
- Aktivitätsübersicht
- Detailseiten mit Tabs
- dunkles Gothic-Design
- Violett als Hauptakzent
- visuelle Trennung von Pantheons

Die Spieleransicht soll keine Admin-Oberfläche kopieren, sondern als **interaktives Glaubensbuch** erscheinen.

---

## 29.2 Spielerbuch

Mögliche Darstellung:

- aufgeschlagenes Buch
- Register nach Pantheon
- Lesezeichen
- Gottheitensymbol als Kapitelmarke
- Porträtseite
- Zitat
- Beschreibung
- sichtbare Boni
- sichtbare Wunder
- Domänen und Regeln
- Button „Als Gottheit wählen“, falls erlaubt
- Suchfeld und Filter
- barrierearme Listenansicht als Alternative

---

## 29.3 Sichtbarkeitsvorschau für GM

Der GM kann den Ansichtsmodus wechseln:

- Als GM
- Als Spieler ohne Gottheit
- Als Anhänger dieser Gottheit
- Als Besitzer des gewählten Charakters
- Als bestimmter Benutzer

---

# 30. GM-Dashboard

## 30.1 Hauptbereiche dieser technischen Phase

- Übersicht
- Gottheiten
- Passive Boni
- Göttliche Wunder
- Effekte
- Zufallstabellen
- Glücksräder
- Ersetzungen
- Spielerzuweisungen
- Import / Export
- Modul- und Adaptereinstellungen
- Diagnose

Glaubensorte, Anhängerstatistiken, Geschichten und Lore-Werkzeuge können später ergänzt werden, ohne die technische Kernstruktur zu verändern.

---

## 30.2 Schnellzugriffe

- neue Gottheit
- passiven Bonus erstellen
- göttliches Wunder erstellen
- Zufallstabelle erstellen
- Glücksrad erstellen
- Ersetzungszuordnung bearbeiten
- Charakter Gottheit zuweisen
- Migration prüfen
- Testcharakter auswählen
- Testaktivierung starten

---

# 31. Import und Export

## 31.1 Exportebenen

- einzelne Gottheit
- mehrere Gottheiten
- Pantheon
- nur Fähigkeiten
- nur Boni
- Glücksrad
- vollständiges GodForge-Paket
- Spielerbuch ohne geheime Daten

---

## 31.2 Format

```json
{
  "format": "darkis-godforge",
  "schemaVersion": 1,
  "minimumModuleVersion": "1.0.0",
  "system": {
    "id": "pf2e",
    "minimumVersion": "8.0.0"
  },
  "content": {
    "deities": [],
    "abilities": [],
    "effects": [],
    "tables": [],
    "wheels": []
  }
}
```

---

## 31.3 Importprüfung

Vor Import anzeigen:

- neue Inhalte
- geänderte Inhalte
- Konflikte
- fehlende Quell-UUIDs
- nicht unterstützte Effektknoten
- inkompatible Systemwerte
- enthaltene Makroreferenzen
- unsichere Inhalte
- überschreibbare IDs
- Vorschau der Spielerinformationen

Optionen:

- als Kopie importieren
- vorhandene aktualisieren
- IDs neu erzeugen
- nur kompatible Teile importieren
- in Quarantäne importieren
- Testimport ohne Änderungen

---

# 32. Versionierung und Migration

## 32.1 Jede Definition benötigt

- stabile ID
- Schema-Version
- Inhaltsrevision
- Erstellungszeit
- Änderungszeit
- Autor
- Prüfsumme

---

## 32.2 Migrationsablauf

1. Weltversion und Datenversion prüfen
2. Backup der GodForge-Daten anlegen
3. Migration als Vorschau anzeigen
4. kanonische Definitionen migrieren
5. materialisierte Systemdokumente neu erzeugen
6. Actor-Verknüpfungen aktualisieren
7. Fehlerbericht ausgeben
8. bei Fehlern Rollback anbieten

---

## 32.3 Keine Bearbeitung offizieller Packs

Bei Systemupdates werden offizielle Gottheiten eventuell verändert. Da GodForge nur verlinkt und nicht editiert, kann der Adapter die neuen Quelldaten erneut einlesen und selektive Überschreibungen anwenden.

---

# 33. Sicherheit

## 33.1 Berechtigungen

Nur GM darf standardmäßig:

- Gottheiten erstellen
- Boni ändern
- Fähigkeiten ändern
- Ersetzungen konfigurieren
- Import durchführen
- Makros zuweisen
- Systemdaten freigeben
- Massenmigration starten

Optional kann ein GM einzelnen Benutzern Rollen geben:

- Lore-Editor
- Regel-Editor
- Tester
- Pantheon-Verwalter
- Nur lesen

---

## 33.2 Validierung

Jede Aktivierung prüft server-/GM-seitig:

- Actor existiert
- Benutzer besitzt Actor
- Fähigkeit gehört Actor
- Nutzung verfügbar
- Bedingungen erfüllt
- Ziel gültig
- Entfernung gültig
- Effekt erlaubt
- Formeln sicher
- importierter Inhalt vertrauenswürdig

---

## 33.3 Protokoll

Optionales Audit-Log:

- wer aktivierte
- welcher Actor
- welche Fähigkeit
- welche Ziele
- welcher Wurf
- welcher Effekt
- wann
- Nutzung vorher/nachher
- Fehler
- GM-Override

---

# 34. Performance

## 34.1 Grundsätze

- keine Vollsuche durch alle Dokumente bei jedem Rendern
- kompakte Indizes
- Cache nach Sichtbarkeit und Benutzer
- nur benötigte Kompendiumsdokumente laden
- Trigger nur registrieren, wenn eine aktive Fähigkeit sie benötigt
- keine permanenten Hooks pro theoretischer Fähigkeit
- Batch-Updates bei mehreren Actor-Änderungen
- Wheel-Assets vorladen
- Animationen abbrechbar machen

---

## 34.2 Triggerindex

Statt jede Fähigkeit bei jedem Ereignis zu prüfen:

```ts
triggerIndex = {
  "actor-damaged": Set<AbilityReference>,
  "turn-start": Set<AbilityReference>,
  "enemy-defeated": Set<AbilityReference>,
  "daily-preparations": Set<AbilityReference>
};
```

Nur relevante Fähigkeiten werden ausgewertet.

---

# 35. Fehlerbehandlung

Jede Fähigkeit kann in diesen Modi laufen:

- **streng:** ungültige Konfiguration verhindert Nutzung
- **Warnung:** GM kann trotzdem ausführen
- **manuell:** Modul zeigt Anweisungen, GM setzt Effekt selbst um

Fehlermeldungen müssen verständlich sein:

> „Betörende Herrschaft kann nicht verwendet werden: Das Ziel ist Stufe 9, der Anwender Stufe 7.“

Nicht:

> `Cannot read properties of undefined`.

---

# 36. Test- und Simulationsmodus

Der GM benötigt einen Testbereich.

Funktionen:

- Testactor auswählen
- Testziel auswählen
- Actorstufe simulieren
- Wurfgrad festlegen
- Trigger manuell auslösen
- Nutzung nicht verbrauchen
- Formelwerte für mehrere Stufen anzeigen
- Glücksrad ohne Effekt drehen
- Effektvorschau
- Dokumentänderungen als Diff anzeigen
- Chatkarte testen
- Sichtbarkeit als Spieler prüfen

---

# 37. Noclaris-Fähigkeiten als technische Abnahmetests

Die bisher entwickelten Gottheiten bilden einen sehr guten Testkatalog.

## 37.1 Fester Glaube

Benötigt:

- manuelle Aktivierung nach Fehlschlag
- Reroll
- zweites Ergebnis verpflichtend
- einmal pro Tag

## 37.2 Blitzinstinkt

Benötigt:

- Aktivierung außerhalb des eigenen Zuges
- Schritt oder Bewegung als Auswahl
- Bewegungsvalidierung
- reaktionsähnliches Zeitfenster

## 37.3 Flamme der Rebellion

Benötigt:

- Verbündete in Reichweite
- Gruppenbuff
- Statusbonus auf Schaden
- Ablauf am Ende des nächsten Zuges jedes Ziels

## 37.4 Alles an seinem Platz

Benötigt:

- fehlgeschlagene Aktion erkennen
- Aktion wiederholen
- zweites Ergebnis zählt
- komplexe Wiederholungslogik

## 37.5 Lebensfunke

Benötigt:

- Ziel
- Heilformel `3d8 + @actor.level`
- Chatwurf
- TP-Änderung

## 37.6 Anpassung

Benötigt:

- Auswahlfenster
- mehrere Effektvarianten
- Geschwindigkeit, Sinn oder Resistenz
- zehn Minuten Dauer

## 37.7 Wahrheit erkennen

Benötigt:

- zeitlich begrenzte Wahrnehmungsmodifikation
- Illusion, Unsichtbarkeit und Gestaltwandler
- adapterabhängige Erkennung

## 37.8 Den Schleier durchblicken

Benötigt:

- +2 Statusbonus
- mehrere Selektoren
- Erkennung von Lügen und magischen Täuschungen
- zehn Runden

## 37.9 Geduld wird belohnt

Benötigt:

- prüfen, ob im vorherigen Zug eine feindliche Aktion stattfand
- verzögerter Bonus
- Bonus auf Angriff oder Zauber
- Zusatzschaden nach Stufenformel

## 37.10 Verstummung

Benötigt:

- Zielrettungswurf
- sprachabhängige Fähigkeiten blockieren
- verbale Komponenten blockieren
- Ablauf zu Beginn des nächsten Anwenderzuges

## 37.11 Chaosrad

Benötigt:

- W100
- Tabelle
- animiertes Rad
- geheime oder öffentliche Anzeige
- beliebige Effekte
- GM-Autorität

## 37.12 Die Toten befragen

Benötigt:

- Leiche als Ziel
- drei Fragen
- GM-Dialog
- Antworten als Chat, Whisper oder Journalnotiz
- narrative Fähigkeit ohne vollständig automatisierbaren Inhalt

## 37.13 Unzerstörbar

Benötigt:

- +2 Statusbonus auf RK
- exakt zwei Runden
- normale PF2e-Stapelregeln

## 37.14 Schattenpfad

Benötigt:

- Start- und Zielschatten
- Reichweite 18 Meter
- Teleportation
- Sicht-/Szenenprüfung

## 37.15 Diebischer Griff

Benötigt:

- Zielactor
- Inventarfilter
- kleines, nicht fest angelegtes Item
- keine Waffen, Rüstungen oder gehaltenen Gegenstände
- Itemtransfer
- GM-Autorität

## 37.16 Festmahl des Gefallenen

Benötigt:

- Kill-/Beteiligungszähler
- mindestens drei Gegner
- Leiche
- Körper in Item oder Interaktionsobjekt umwandeln
- mehrere Esser
- Bonus bis tägliche Vorbereitung
- nicht stapelbar

## 37.17 Krone der Überlegenheit

Benötigt:

- Ziel markieren
- +2 Statusbonus auf Angriffe gegen genau dieses Ziel
- +2 auf Rettungswürfe gegen genau dieses Ziel
- zwei Runden
- zielbezogene Prädikate

## 37.18 Goldsegen

Benötigt:

- Goldwert anhand Actorstufe
- Formel `@actor.level`
- einmal pro Tag
- Währungssystemadapter
- Audit-Log

## 37.19 Betörende Herrschaft

Benötigt:

- Willenswurf
- Zielstufe höchstens Anwenderstufe
- Bossausschluss
- temporäre Fraktionsänderung
- Ablauf zu Beginn des nächsten Anwenderzuges

## 37.20 Blinder Zorn

Benötigt:

- Sterbend bleibt aktiv
- Handlungsfähigkeit trotz Sterbend
- Bewusstlos wird nicht ignoriert
- nur Angriff, Annäherung oder Waffe ziehen
- keine Heilung und keine Stabilisierung
- zwei Runden
- Tod bleibt möglich

## 37.21 Lähmende Müdigkeit

Benötigt:

- Willenswurf
- bei Fehlschlag keine Aktionen und Reaktionen
- genau ein Zielzug
- Zielzug korrekt überspringen, ohne Initiative zu zerstören

---

# 38. UI-Leitbild anhand der bereitgestellten Entwürfe

Die beiden Entwürfe definieren eine klare Designsprache:

## 38.1 GM-Dashboard

- feste linke Navigation
- große Wortmarke und Modulbranding
- Suchleiste
- prominent platzierter Button „Neuen Gott erstellen“
- Kartenübersicht der Gottheiten
- Schnellzugriffe
- Statuskarten
- zuletzt bearbeitete Inhalte
- Systeminformationen
- dunkle, leicht strukturierte Panels
- violette Leuchtakzente
- dünne ornamentale Rahmen
- klare Trennung zwischen Inhalt und Werkzeugen

## 38.2 Gottheiten-Detailansicht

- Gottheitenliste links
- großes Porträt
- zentrale Detailansicht
- Tabs
- rechte Kontextspalte
- direkte Bearbeitung
- Domänen, Boni und Wunder als Karten
- Kultsymbol als eigenes Element
- Erweiterbarkeit ohne überfüllte Hauptansicht

## 38.3 Technische UI-Anforderung

Die Oberfläche muss responsiv und skalierbar sein:

- 1080p
- 1440p
- 4K
- Foundry als normales Fenster
- Popout-Fenster
- schmale Auflösung
- optional reduzierte Animationen

Nicht alle Panels dürfen gleichzeitig zwingend sichtbar sein. Bei kleinen Fenstern wechseln rechte Bereiche in Drawer oder Tabs.

---

# 39. Barrierefreiheit

- vollständige Tastaturbedienung
- sichtbare Fokusrahmen
- Suche per Tastenkürzel
- reduzierte Bewegung
- Animation überspringen
- ausreichender Kontrast
- Farbinformation nie allein entscheidend
- Icons mit Textlabels
- skalierbare Schrift
- Screenreader-Beschriftungen
- alternative Listenansicht zum Buchdesign
- keine ausschließlich hoverbasierten Informationen

---

# 40. Empfohlener Entwicklungsumfang

## Phase A – Fundament

- Modulbootstrap
- Adapterregistry
- PF2e-Erkennung
- kanonisches Datenmodell
- journalbasierte Speicherung
- Gottheitenliste
- Editor für Grunddaten
- Ersetzungsfilter
- öffentliche API

## Phase B – Boni und einfache Wunder

- passiver Bonusbaukasten
- Easy Mode
- Formelparser
- Nutzung und Reset
- Dauer
- einfache Ziele
- Heilung, Schaden, Bonus, Zustand
- PF2e-Rule-Element-Generator

## Phase C – Fortgeschrittene Automation

- Trigger
- Bedingungsbaum
- Aktionshistorie
- Zielbeschränkungen
- Fraktionskontrolle
- Itemtransfer
- Statusunterdrückung
- Kill-Zähler
- GM-Autorität

## Phase D – Zufallssystem

- Tabelleneditor
- W100
- Glücksrad
- Canvas-/DOM-Overlay
- Sounds und Animation
- geheime Sichtbarkeit

## Phase E – Integration

- Charakterbogen
- PF2e Leveler API
- Spielerkompendium
- Auswahlkarten
- Live-Synchronisierung
- Import/Export
- Migration

---

# 41. Mindestumfang für Version 1.0

Version 1.0 gilt erst als vollständig, wenn:

1. Das aktive System automatisch erkannt wird.
2. PF2e offiziell unterstützt wird.
3. Originalgottheiten ohne Löschung ausgeblendet werden können.
4. Eine Homebrew-Gottheit eine offizielle Vorlage übernehmen kann.
5. Eigene Namen, Bilder, Symbole und Texte möglich sind.
6. Sichtbarkeit pro Informationsbereich konfigurierbar ist.
7. Beliebige systemeigene Boni angelegt werden können.
8. Easy Mode und Expertenmodus verfügbar sind.
9. Aktionskosten, Nutzung, Reset und Dauer getrennt konfigurierbar sind.
10. Eigene Tage, Monate und Jahre als Reset möglich sind.
11. Manuelle und automatische Trigger funktionieren.
12. UND-/ODER-Bedingungen möglich sind.
13. alle relevanten Zielarten unterstützt werden.
14. PF2e-Erfolgsgrade konfigurierbar sind.
15. Effekte als Kette aufgebaut werden können.
16. Zufallstabellen funktionieren.
17. ein animiertes Glücksrad funktioniert.
18. GM-only-Sichtbarkeit des Rads möglich ist.
19. Charakterbogen und öffentliche API integriert sind.
20. Import, Export, Migration und Sicherheitsprüfung vorhanden sind.
21. alle 21 Noclaris-Beispielfähigkeiten technisch umsetzbar sind.

---

# 42. Noch nicht endgültig festzulegende Bereiche

Diese Punkte können in einer späteren Konzeptphase entschieden werden:

- endgültiges Spielerbuch-Layout
- Glaubensorte
- Anhängerstatistiken
- Geschichten
- Kult- und Religionsverwaltung
- Domäneneditor als eigenes großes System
- Marktplatz für Pantheon-Pakete
- Cloud-Synchronisierung
- Mehrsystemunterstützung über PF2e hinaus
- KI-gestützte Fähigkeitserstellung
- automatische Balancebewertung

Die Kernarchitektur muss jedoch bereits Erweiterungspunkte dafür besitzen.

---

# 43. Abschließende Empfehlung

Darkis GodForge sollte nicht als Sammlung einzelner hart codierter Noclaris-Fähigkeiten gebaut werden. Es sollte eine **visuelle Regel-Engine für Gottheiten** sein.

Noclaris dient als realistischer Referenz- und Abnahmekatalog. Andere Spielleitungen können damit vollkommen andere Konzepte abbilden:

- einmal pro Jahr ein Wunder
- Boni nur bei Vollmond
- Kräfte nach geopferten Gegenständen
- Schutz in einem bestimmten Tempel
- zufällige Segnungen
- aktive Domänenkräfte
- Flüche mit negativen Ergebnissen
- pantheonabhängige Auswahl
- Gottheiten, die bestehende Systemgötter vollständig ersetzen

Die entscheidende technische Grundlage ist die klare Trennung zwischen:

1. **Gottheitsdefinition**
2. **Systemadapter**
3. **Aktivierung**
4. **Nutzung und Reset**
5. **Trigger und Bedingungen**
6. **Zielauswahl**
7. **Wurfauflösung**
8. **Effektausführung**
9. **Sichtbarkeit**
10. **Darstellung**

Wird diese Trennung von Anfang an eingehalten, kann GodForge sowohl für Noclaris als auch für völlig fremde Homebrew-Welten funktionieren, ohne später neu geschrieben werden zu müssen.
