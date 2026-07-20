# Darkis GodForge
## Design-, UI- und UX-Spezifikation für Foundry VTT

**Dokumentstatus:** Designkonzept / UI-Pflichtenheft  
**Ergänzt:** `Darkis_GodForge_Technische_Spezifikation.md`  
**Primäre Oberfläche:** Spielleitungs-Dashboard  
**Spieleroberfläche:** Götterkodex, Charakterbogen-Widget und GodForge-Hub  
**Designrichtung:** düstere Gothic-Fantasy, edel, modern, lesbar und nicht überladen  
**Primäres Ziel:** Mächtiges Homebrew-Werkzeug, das für Anfänger verständlich und für Experten vollständig konfigurierbar bleibt

---

# 1. Ziel dieses Dokuments

Dieses Dokument beschreibt ausschließlich das **visuelle Design, die Informationsarchitektur, Bedienlogik und Darstellung** von Darkis GodForge.

Es legt fest:

- welche Oberflächen existieren,
- welche Oberfläche von Spielleitung oder Spielern genutzt wird,
- wie GodForge in Foundry VTT erreichbar ist,
- wie das GM-Dashboard aufgebaut ist,
- wie der Gottheiten-Editor funktioniert,
- wie Spieler Gottheiten nachlesen und auswählen,
- wie aktive Wunder im Spiel ausgelöst werden,
- wie Zufallstabellen und das animierte Glücksrad erscheinen,
- wie Berechtigungen und geheime Informationen dargestellt werden,
- wie das Design auf verschiedenen Auflösungen funktioniert,
- welche Komponenten und visuellen Regeln überall gleich sein müssen.

Die technische Umsetzung der Regel-Engine, Systemadapter, Effekte und Datenmodelle wird im separaten technischen Dokument behandelt.

---

# 2. Produktidentität

## 2.1 Produktname

**Darkis GodForge**

Optionale Unterzeile:

> Götter erschaffen. Glauben formen. Schicksal schmieden.

Der Name muss in allen GM-Oberflächen sichtbar sein, darf aber in kleinen Spielfenstern auf ein kompaktes Symbol reduziert werden.

---

## 2.2 Spielername der Bibliothek

Für die Spieleroberfläche wird standardmäßig der Name **Götterkodex** verwendet.

Empfohlene Bezeichnungen:

- Deutsch: **Götterkodex**
- Englisch: **Divine Codex**
- Technischer interner Name: `GodForge Companion`

Die Spielleitung kann den sichtbaren Namen ändern, etwa:

- Buch der Götter
- Pantheon-Chronik
- Glaubenskompendium
- Heilige Schriften
- Götterarchiv

**Empfehlung:** In Menüs und Buttons steht kurz **Götterkodex**. `Companion` wird höchstens als technischer Begriff oder englischer Produktname verwendet.

---

## 2.3 Markenwirkung

Darkis GodForge soll vermitteln:

- mächtig, aber nicht chaotisch,
- düster, aber gut lesbar,
- mystisch, aber technisch zuverlässig,
- hochwertig wie ein eigenständiges Foundry-Tool,
- klarer als ein typisches Einstellungsfenster,
- atmosphärischer als ein Tabelleneditor.

Die Oberfläche darf nach Gothic-Fantasy aussehen, muss sich aber wie moderne Software bedienen lassen.

---

# 3. Visuelle Leitidee

## 3.1 Grundstil

Die Referenzbilder zeigen eine passende Kombination aus:

- fast schwarzem Hintergrund,
- leicht bläulich-violetten Oberflächen,
- violettem Leuchten als Hauptakzent,
- dünnen ornamentalen Rahmen,
- großen illustrierten Gottheitenkarten,
- Gothic-Serifenschrift für Überschriften,
- neutraler UI-Schrift für längere Texte,
- Karten und Panels mit sehr subtilen Texturen,
- farblich unterscheidbaren Pantheons,
- einer klaren Dreiteilung aus Navigation, Inhalt und Kontextleiste.

Diese Richtung wird als verbindliche Designbasis übernommen.

---

## 3.2 Wichtigste Designregel

> **Atmosphäre liegt in Rahmen, Bildern, Überschriften und Übergängen. Bedienbarkeit liegt in klaren Abständen, normalen Formularen und einer gut lesbaren UI-Schrift.**

Gothic-Schrift darf nicht für lange Beschreibungen, Formulare, Tabellen oder technische Werte verwendet werden.

---

## 3.3 Keine unnötige Dekoration

Ornamente werden gezielt eingesetzt:

- Ecken großer Panels,
- Titelbereiche,
- Gottheitenporträts,
- Buchseiten,
- Pantheon-Trenner,
- Glücksrad,
- besondere Warnungen oder göttliche Wunder.

Sie werden nicht an jedes Eingabefeld, jede Tabellenzeile oder jeden kleinen Button gesetzt. Zu viele Verzierungen würden die Oberfläche unruhig und unübersichtlich machen.

---

# 4. Designsystem

## 4.1 Farbvariablen

Die Farben werden als CSS-Variablen angelegt und können später über Themes überschrieben werden.

```css
:root {
  --dg-bg-deep: #05060a;
  --dg-bg-base: #090b11;
  --dg-surface-1: #0d1018;
  --dg-surface-2: #121620;
  --dg-surface-3: #181d29;

  --dg-border-soft: #252a38;
  --dg-border-strong: #3a4052;
  --dg-border-ornament: #4b3a62;

  --dg-text-primary: #f0edf5;
  --dg-text-secondary: #aaa6b5;
  --dg-text-muted: #737080;
  --dg-text-disabled: #4e4c57;

  --dg-accent: #8f38e8;
  --dg-accent-hover: #a955ff;
  --dg-accent-soft: rgba(143, 56, 232, 0.18);
  --dg-accent-glow: rgba(154, 63, 255, 0.35);

  --dg-success: #5fcf86;
  --dg-warning: #e9b85f;
  --dg-danger: #e45b68;
  --dg-info: #67a7ef;

  --dg-focus: #c883ff;
  --dg-shadow: rgba(0, 0, 0, 0.55);
}
```

Die Werte sind Richtwerte und müssen in einem echten Kontrasttest geprüft werden.

---

## 4.2 Pantheonfarben

Jedes Pantheon kann eine eigene Akzentfarbe besitzen. Die Farbe erscheint nur als sekundärer Akzent:

- Rand einer Gottheitenkarte,
- kleiner Edelstein,
- Icon-Hintergrund,
- Registermarke,
- dünne Linie,
- dezenter Glow.

Nicht die gesamte Oberfläche wird in der Pantheonfarbe eingefärbt.

Beispiel für Noclaris:

- Lux: Gold / warmes Elfenbein
- Tenebrae: Violett / kaltes Blauviolett
- Infernaris: Dunkelrot / Glutrot

Pantheonfarben müssen frei konfigurierbar sein.

---

## 4.3 Typografie

### Display-Schrift

Einsatz:

- Produktlogo,
- große Seitentitel,
- Gottheitsname,
- Buchkapitel,
- besondere Zitate.

Eigenschaften:

- Gothic- oder Fantasy-Serifenschrift,
- moderate Verzierung,
- nicht zu eng,
- gute Lesbarkeit auch bei 24–32 px.

Fallback-Kette:

```css
font-family: "GodForge Display", "Cinzel", Georgia, serif;
```

### UI-Schrift

Einsatz:

- Navigation,
- Formulare,
- Buttons,
- Beschreibungen,
- Tabellen,
- Tooltips,
- Chatkarten.

Fallback-Kette:

```css
font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
```

### Monospace

Einsatz:

- Formeln,
- JSON,
- Selektoren,
- IDs,
- technische Diagnose.

```css
font-family: "JetBrains Mono", Consolas, monospace;
```

---

## 4.4 Schriftgrößen

- Produktlogo: 30–38 px
- Haupttitel: 26–32 px
- Gottheitsname: 28–36 px
- Paneltitel: 17–20 px
- Kartentitel: 15–17 px
- Standardtext: 14–15 px
- Sekundärtext: 12–13 px
- Badges und Metadaten: 11–12 px
- Tooltips: 12–13 px

Kleinere Schrift als 11 px wird vermieden.

---

## 4.5 Abstände

Grundraster: **4 px**

Empfohlene Stufen:

- 4 px: Icon zu Text, kleine Innenabstände
- 8 px: Elemente innerhalb einer Zeile
- 12 px: kompakte Karten
- 16 px: Standardabstand
- 24 px: Panelbereiche
- 32 px: Hauptsektionen
- 48 px: große visuelle Trennung

---

## 4.6 Rundungen und Rahmen

- kleine Buttons: 6 px
- Eingabefelder: 7 px
- Karten: 9 px
- große Panels: 12 px
- Buchseiten: abhängig vom Theme, meist 8–12 px

Rahmen:

- Standard: 1 px
- aktives Element: 1 px plus Glow
- ausgewählte Gottheitenkarte: 1–2 px
- Hauptpanel: dünner Grundrahmen plus ornamentale Eckgrafiken

---

## 4.7 Schatten und Glow

Glows werden sparsam verwendet.

Erlaubt:

- aktiver Navigationspunkt,
- ausgewählte Gottheit,
- primärer Button,
- gerade aktiviertes Wunder,
- Glücksrad,
- Hover bei besonderen Karten.

Nicht erlaubt:

- permanenter Glow an jedem Icon,
- leuchtende Fließtexte,
- mehrere konkurrierende Farben im selben Panel.

---

# 5. Oberflächenlandschaft

Darkis GodForge besteht nicht aus einem einzigen Fenster. Es gibt fünf klar getrennte Oberflächenebenen.

## 5.1 Foundry-Moduleinstellungen

Kleine, technische Grundeinstellungen im normalen Foundry-Einstellungsbereich.

## 5.2 GodForge-GM-Dashboard

Große Verwaltungsoberfläche für die komplette Erstellung und Verwaltung.

## 5.3 GodForge-Hub

Kompakte Schnelloberfläche direkt im laufenden Spiel.

## 5.4 Götterkodex

Spielerorientiertes Buch zum Nachlesen, Filtern und gegebenenfalls Auswählen.

## 5.5 Charakterbogen-Integration

Kompakte Anzeige der eigenen Gottheit, Boni und Wunder direkt am Charakter.

Diese Ebenen müssen unterschiedlich aussehen und unterschiedlich viel Komplexität zeigen.

---

# 6. Foundry-Moduleinstellungen

## 6.1 Zweck

Das normale Foundry-Einstellungsfenster ist nicht der Ort für den kompletten Gottheitenbaukasten.

Es enthält ausschließlich globale technische Optionen, beispielsweise:

- GodForge aktivieren,
- Systemadapter wählen oder automatisch erkennen,
- offizielle Gottheiten ausblenden,
- Charakterbogen-Integration aktivieren,
- Leveler-Integration aktivieren,
- Hub anzeigen,
- Spieler dürfen Götterkodex öffnen,
- Animationen reduzieren,
- Standardsichtbarkeit,
- Standard-Resetzeit,
- Debug-Modus,
- Backup und Diagnose,
- Button „GodForge-Dashboard öffnen“.

---

## 6.2 Aufbau

Die Einstellungen werden in Kategorien gegliedert:

### Allgemein

- Modul aktiv
- Sprache
- Oberfläche öffnen
- Standardtheme

### Systemintegration

- erkanntes System
- aktiver Adapter
- Adapterstatus
- Character-Sheet-Integration
- Leveler-Integration
- offizielle Gottheiten filtern

### Spielerzugriff

- Götterkodex aktivieren
- Auswahl erlauben
- Boni vor Auswahl sichtbar
- geheime Einträge ausblenden

### Darstellung

- kompakte oder komfortable Dichte
- Animationen
- reduzierte Bewegung
- Pantheonfarben
- Hintergrundbild

### Sicherheit

- Spieler dürfen selbst aktivieren
- GM-Bestätigung bei kontrollierenden Effekten
- Importierte Makros deaktivieren
- Audit-Log

### Wartung

- Daten prüfen
- Materialisierung neu erzeugen
- Migration starten
- Backup exportieren
- Diagnosebericht

---

## 6.3 Einstellungszeile

Jede Option besitzt:

- klaren Titel,
- eine kurze Beschreibung,
- Eingabefeld rechts,
- optionales Info-Icon,
- Badge `GM`, `PF2e`, `Experimentell` oder `Neustart nötig`,
- sichtbaren Standardwert.

Technische IDs werden nur in einem erweiterten Bereich angezeigt.

---

# 7. Zugangspunkte in Foundry VTT

GodForge muss erreichbar sein, ohne dass die Spielleitung jedes Mal durch die Moduleinstellungen navigiert.

## 7.1 Scene-Control-Button

In der linken Foundry-Werkzeugleiste erscheint eine eigene Gruppe:

**GodForge**

Iconvorschlag:

- stilisierter Altar,
- göttliches Auge,
- Amboss mit Stern,
- aufgeschlagenes Buch mit Halo.

Werkzeuge:

- GodForge-Hub öffnen
- Götterkodex öffnen
- ausgewählte Gottheit anzeigen
- göttliches Wunder aktivieren
- Glücksrad öffnen
- GM-Dashboard öffnen, nur für GM

---

## 7.2 Navigations-Button rechts oben

Optional kann ein kompakter Button neben Foundrys vorhandenen Spielwerkzeugen eingeblendet werden.

Darstellung:

```text
[ Gottheitssymbol ]
```

Statuspunkte:

- Grün: Wunder verfügbar
- Grau: Wunder verbraucht
- Gold: neue Information im Götterkodex
- Rot: Fähigkeit nicht ausführbar oder fehlerhaft

---

## 7.3 Hotkey

Standardvorschlag:

- `G`: GodForge-Hub
- `Shift + G`: Götterkodex
- keine automatische Belegung, wenn bereits Konflikt besteht
- vollständig änderbar in Foundrys Tastenbelegung

---

# 8. GodForge-Hub

## 8.1 Aufgabe

Der Hub ist die kompakte Schaltzentrale während einer Sitzung. Er soll nicht den gesamten Editor enthalten.

Er beantwortet in wenigen Sekunden:

- Welche Gottheit hat mein Charakter?
- Welche Boni sind aktiv?
- Welche Wunder kann ich verwenden?
- Wie oft sind sie noch verfügbar?
- Wann werden sie zurückgesetzt?
- Welche Bedingungen fehlen?
- Wo öffne ich den Götterkodex?

---

## 8.2 Spieleransicht

```text
┌─────────────────────────────────────────┐
│ [Symbol] Velaria – Verborgenheit        │
│ Göttliches Wunder verfügbar             │
├─────────────────────────────────────────┤
│ Passiver Bonus                          │
│ Täuschung +1                            │
├─────────────────────────────────────────┤
│ SCHATTENPFAD                       1/1   │
│ Teleportiere dich zwischen Schatten.    │
│ [ Aktivieren ] [ Details ]              │
├─────────────────────────────────────────┤
│ [ Götterkodex ] [ Charakter öffnen ]    │
└─────────────────────────────────────────┘
```

---

## 8.3 Mehrere Charaktere

Besitzt ein Spieler mehrere Charaktere, zeigt der Kopfbereich einen Actor-Wechsler.

- zuletzt kontrollierter Token als Standard,
- eigener Charakter bevorzugt,
- GM kann jeden Actor wählen,
- ungültige oder nicht besessene Actors werden gekennzeichnet.

---

## 8.4 Wunderkarten

Jede Wunderkarte enthält:

- Icon
- Name
- Aktionskosten als PF2e-Symbole oder Systemdarstellung
- verbleibende Nutzungen
- Resetart
- kurze Beschreibung
- erfüllte und unerfüllte Bedingungen
- Aktivierungsbutton
- Kontextmenü

Zustände:

- verfügbar
- nicht verfügbar
- verbraucht
- Ziel erforderlich
- GM-Bestätigung erforderlich
- automatisch ausgelöst
- fehlerhaft konfiguriert

---

## 8.5 GM-Hub

Zusätzliche GM-Aktionen:

- Fähigkeit für Actor auslösen
- Nutzung zurücksetzen
- Zustand prüfen
- Zielbeschränkung übersteuern
- geheimes Ergebnis würfeln
- Audit-Log öffnen
- Gottheit wechseln
- Definition bearbeiten

GM-Aktionen werden visuell durch ein kleines `GM`-Badge markiert.

---

# 9. GM-Dashboard

## 9.1 Fensterform

Das Dashboard ist eine große Foundry-Anwendung.

Unterstützte Modi:

- maximiertes Foundry-Fenster,
- normales frei skalierbares Fenster,
- Popout-Fenster,
- optional browserfüllende Ansicht.

Empfohlene Mindestgröße:

- 1100 × 700 px

Optimale Größe:

- 1440 × 900 px oder größer

---

## 9.2 Grundaufbau

```text
┌──────────────┬──────────────────────────────────────┬──────────────┐
│ Navigation   │ Hauptinhalt                          │ Kontextleiste│
│              │                                      │              │
│ Übersicht    │ Seitentitel + Suche + Aktionen       │ Schnellzugriff│
│ Götter       │                                      │ Hinweise     │
│ Fähigkeiten  │ Karten / Tabellen / Editor           │ Vorschau     │
│ Boni         │                                      │ Systemstatus │
│ Glücksräder  │                                      │              │
│ Import       │                                      │              │
└──────────────┴──────────────────────────────────────┴──────────────┘
```

---

## 9.3 Linke Navigation

Gruppen:

### Hauptmenü

- Übersicht
- Götter
- Pantheons
- Göttliche Wunder
- Passive Boni
- Zufallstabellen
- Glücksräder

### Integration

- Ersetzungen
- Charakterzuweisungen
- Spieleransicht
- Kompendium

### Werkzeuge

- Import / Export
- Migrationen
- Testlabor
- Audit-Log

### Einstellungen

- Moduloptionen
- Adapter
- Hilfe und Dokumentation

Einträge können kleine Zähler anzeigen:

- Anzahl Gottheiten
- unveröffentlichte Entwürfe
- Fehler
- ausstehende Migrationen

---

## 9.4 Kompakte Navigation

Bei schmalen Fenstern wird die Leiste auf Icons reduziert.

Hover oder Fokus zeigt:

- Name
- Kurzbeschreibung
- Tastenkürzel

Der Zustand wird gespeichert.

---

# 10. Dashboard-Startseite

## 10.1 Kopfbereich

Enthält:

- Produktname
- Unterzeile
- optionale dunkle Landschaft oder Pantheon-Silhouette
- globale Suche
- Button `Neuen Gott erstellen`
- Götterkodex-Vorschau
- Einstellungen
- Benutzeravatar

Der Hintergrund darf dekorativ sein, aber Text und Buttons müssen auf einer ruhigen, abgedunkelten Fläche liegen.

---

## 10.2 Meine Götter

Horizontale Reihe der zuletzt bearbeiteten oder favorisierten Gottheiten.

Karte:

- großes Porträt
- Name
- Titel
- Pantheonfarbe
- Status
- kleiner Edelstein als Pantheonindikator
- Hover-Aktionen

Statusbeispiele:

- Entwurf
- veröffentlicht
- deaktiviert
- Fehler
- Update erforderlich

---

## 10.3 Schnellzugriff

Kartenartige Liste:

- Neuen Gott erstellen
- Göttliches Wunder erstellen
- Passiven Bonus erstellen
- Zufallstabelle erstellen
- Glücksrad erstellen
- offizielles Vorbild ersetzen
- Spieleransicht testen

Jeder Eintrag hat:

- Icon
- Titel
- einen erklärenden Satz
- Pfeil

---

## 10.4 Aktivität und Übersicht

Kennzahlen sind nur echte Verwaltungswerte, keine erfundenen Weltstatistiken.

Sinnvolle Werte:

- Gottheiten
- veröffentlichte Gottheiten
- Fähigkeiten
- passive Boni
- Zufallstabellen
- fehlerhafte Definitionen
- zugewiesene Charaktere
- ausstehende Updates

Anhängerzahlen oder Glaubensorte gehören erst in eine spätere Lore-Erweiterung.

---

## 10.5 Kürzlich bearbeitet

Spalten:

- Name
- Typ
- Status
- letzte Änderung
- geändert von

Aktionen:

- öffnen
- duplizieren
- veröffentlichen
- archivieren
- Verlauf anzeigen

---

## 10.6 Systeminformationen

Anzeige:

- Foundry-Version
- aktives System
- Systemversion
- GodForge-Version
- erkannter Adapter
- Datenbankschema
- Diagnosezustand

Button:

- Nach Updates suchen
- Diagnose öffnen

---

# 11. Gottheiten-Browser für die Spielleitung

## 11.1 Ansichtstypen

- Kartenansicht
- kompakte Liste
- Tabelle

Der gewählte Modus wird gespeichert.

---

## 11.2 Filter

- Name
- Pantheon
- Status
- Veröffentlichung
- offizielle Vorlage
- hat Fehler
- besitzt Wunder
- besitzt passive Boni
- sichtbar für Spieler
- Systemkompatibilität
- Tags

---

## 11.3 Gottheitenkarte

Pflichtinhalte:

- Porträt
- Name
- Titel
- Pantheon
- Sichtbarkeitsstatus
- Vorlage oder ersetzter Gott
- Anzahl Wunder
- Anzahl Boni

Hover-Aktionen:

- öffnen
- Vorschau
- duplizieren
- veröffentlichen
- Mehr-Menü

---

# 12. Gottheiten-Detailseite

## 12.1 Dreispaltige Struktur

Wie in der Referenz:

- links: Gottheitenliste oder Browser
- Mitte: ausgewählte Gottheit
- rechts: Kontextkarten

Bei kleinen Fenstern wird die rechte Spalte zu einem Drawer.

---

## 12.2 Header der Gottheit

Enthält:

- großes Porträt
- Symbol
- Name
- editierbarer Titel
- Kurzbeschreibung
- Pantheonfarbe
- Tags
- Status
- Bearbeiten-Button
- Duplizieren
- Export
- Mehr-Menü

Optional:

- offizielle Vorlage
- ersetzte Gottheit
- letzte Aktualisierung
- Validierungsstatus

---

## 12.3 Tabs

Technischer Kernumfang:

- Übersicht
- Systemwerte
- Passive Boni
- Göttliche Wunder
- Zufall
- Sichtbarkeit
- Ersetzung
- Zuweisungen
- Verlauf

Spätere Lore-Erweiterungen können ergänzen:

- Glaubensorte
- Anhänger
- Geschichten
- Rituale

---

## 12.4 Übersicht

Karten:

- Kurzbeschreibung
- sichtbares Zitat
- offizielle Vorlage
- passiver Hauptbonus
- primäres göttliches Wunder
- Kompendiumsvorschau
- Kultsymbol
- Veröffentlichung

Jede Karte besitzt oben rechts ein Bearbeiten-Icon.

---

# 13. Gottheit erstellen – Assistent

## 13.1 Grundsatz

Die Schaltfläche `Neuen Gott erstellen` öffnet zunächst einen verständlichen Assistenten und nicht sofort einen komplexen JSON-Editor.

---

## 13.2 Schrittleiste

```text
1 Grunddaten → 2 Darstellung → 3 Vorlage → 4 Boni → 5 Wunder → 6 Sichtbarkeit → 7 Vorschau
```

Die Spielleitung darf:

- zurückgehen,
- speichern und später fortsetzen,
- Schritte überspringen,
- in den Expertenmodus wechseln.

---

## 13.3 Grunddaten

Felder:

- Name
- Titel
- Kurzbeschreibung
- ausführliche Beschreibung
- Zitat
- Pantheon
- Tags
- Status

Sofortige Vorschau rechts.

---

## 13.4 Darstellung

Uploadbereiche:

- Porträt
- kleines Icon
- Kultsymbol
- Banner

Funktionen:

- Datei wählen
- Drag-and-drop
- Ausschnitt anpassen
- Fokuspunkt setzen
- Kreis-/Karten-/Buchvorschau
- Standardbild verwenden
- Bild entfernen

---

## 13.5 Offizielle Vorlage

Darstellung als Vergleich:

```text
Homebrew-Gott              übernimmt von              Pathfinder-Gott
Lexara – Ordnung           ←                          Abadar
```

Darunter Schalter:

- Domänen
- Waffe
- Zauber
- Heiligung
- Fertigkeit
- Attribute
- Edikte
- Anathema

Status:

- übernommen
- überschrieben
- nicht unterstützt
- fehlt in dieser Systemversion

---

## 13.6 Boni

Easy-Mode-Karten:

- Fertigkeitsbonus
- Rettungswurfbonus
- RK-Bonus
- Schadensbonus
- Wahrnehmungsbonus
- eigene Auswahl

Expertenmodus:

- Selektoren
- Prädikate
- Formel
- Bonusart
- Stapelverhalten

---

## 13.7 Wunder

Optionen:

- neues Wunder
- Vorlage verwenden
- bestehendes Wunder verknüpfen
- Zufallstabelle
- Glücksrad

---

## 13.8 Veröffentlichung

Abschlussseite:

- Validierungsbericht
- sichtbare Spielerinformationen
- versteckte Informationen
- Materialisierungsvorschau
- betroffene offizielle Gottheit
- betroffene Charaktere

Buttons:

- als Entwurf speichern
- veröffentlichen
- Testcharakter zuweisen
- Spieleransicht öffnen

---

# 14. Göttliches-Wunder-Editor

## 14.1 Zwei Modi

Oben sichtbar:

```text
[ Einfach ] [ Experte ]
```

Ein Wechsel darf keine Daten löschen.

---

## 14.2 Easy Mode

Aufbau als verständliche Abschnitte:

1. Was macht die Fähigkeit?
2. Wer kann sie benutzen?
3. Wann kann sie benutzt werden?
4. Wen betrifft sie?
5. Muss gewürfelt werden?
6. Wie lange wirkt sie?
7. Was passiert bei Erfolg oder Fehlschlag?
8. Wie erscheint sie im Spiel?

---

## 14.3 Effektvorlagen

Große auswählbare Karten:

- Bonus geben
- heilen
- Schaden verursachen
- Zustand hinzufügen
- Zustand ignorieren
- teleportieren
- Item erzeugen
- Gegenstand stehlen
- Ziel kontrollieren
- Aktion verhindern
- Würfel wiederholen
- Zufallstabelle würfeln
- Glücksrad drehen
- rein erzählerischer Effekt

Nach Auswahl werden nur passende Felder angezeigt.

---

## 14.4 Expertenmodus

Dreiteilung:

- links: Knotenbibliothek
- Mitte: Ablaufgraph
- rechts: Eigenschaften des gewählten Knotens

```text
┌──────────────┬───────────────────────────┬────────────────────┐
│ Knoten       │ Ablauf                    │ Eigenschaften       │
│ Trigger      │ [Aktivierung]             │ Dauer: 2 Runden     │
│ Bedingung    │      ↓                    │ Ziel: Gegner        │
│ Wurf         │ [Ziel prüfen]             │ Formel: ...         │
│ Effekt       │    ↙   ↘                  │ Sichtbarkeit: GM    │
│ Zufall       │ [Erfolg] [Fehlschlag]     │                    │
└──────────────┴───────────────────────────┴────────────────────┘
```

---

## 14.5 Validierung

Fehler werden direkt am betroffenen Abschnitt gezeigt.

Stufen:

- Information
- Warnung
- Fehler
- inkompatibel

Beispiel:

> Die Fähigkeit kontrolliert Gegner, besitzt aber noch keine maximale Zielstufe.

Button:

- automatisch korrigieren
- zu Feld springen
- ignorieren, nur GM

---

## 14.6 Testleiste

Am unteren Fensterrand:

- Testactor
- Testziel
- Erfolgsgrad
- Nutzung nicht verbrauchen
- Fähigkeit testen
- Spieleransicht
- Chatkartenvorschau

---

# 15. Passiver-Bonus-Editor

## 15.1 Easy Mode

```text
Bonus auf:        [ Heimlichkeit ▼ ]
Wert:             [ +1 ]
Bonusart:         [ Statusbonus ▼ ]
Gilt für:         [ alle Würfe ▼ ]
Bedingung:        [ immer ▼ ]
Sichtbarkeit:     [ öffentlich ▼ ]
```

---

## 15.2 Mehrere Boni

Ein Gott kann mehrere Bonuszeilen besitzen.

Karten lassen sich:

- sortieren,
- duplizieren,
- deaktivieren,
- in Vorlagen speichern,
- auf mehrere Gottheiten anwenden.

---

## 15.3 Konfliktanzeige

Bei PF2e zeigt der Editor:

> Dieser Statusbonus stapelt sich nicht mit einem anderen Statusbonus auf denselben Selektor. Im Spiel gilt nur der höchste Wert.

Dies ist eine Warnung, kein Verbot.

---

# 16. Zufallstabellen-Editor

## 16.1 Tabellenansicht

Spalten:

- Ergebnis oder Bereich
- Titel
- Kategorie
- Effekt
- Sichtbarkeit
- Gewicht
- Aktionen

---

## 16.2 Kategorien

Standardkategorien:

- Jackpot
- positiv
- neutral
- negativ
- katastrophal

Die Kategorien steuern optional:

- Segmentfarbe
- Sound
- Partikel
- Ergebnisbanner

Sie haben keine feste mechanische Bedeutung.

---

## 16.3 Bereiche

Der Editor akzeptiert:

- `1`
- `2–5`
- `6-10`
- gewichtete Einträge ohne Zahlen

Überlappungen und Lücken werden markiert.

Buttons:

- Lücken automatisch füllen
- Bereiche neu verteilen
- auf W100 normalisieren
- Testwürfe

---

# 17. Glücksrad-Editor

## 17.1 Vorschau

Links erscheint das animierbare Rad, rechts die Einstellungen.

---

## 17.2 Einstellungen

### Daten

- verknüpfte Tabelle
- sichtbare Beschriftung
- Segmente nach Eintrag oder Kategorie
- Gewichtung

### Darstellung

- Rahmenbild
- Hintergrund
- Zeiger
- Segmentfarben
- Text anzeigen
- Icons anzeigen
- Pantheonstil

### Animation

- Dauer
- Mindestumdrehungen
- Startverzögerung
- Abbremsung
- Partikel
- Bildschirmzittern

### Ton

- Start
- Drehen
- Tick
- Ergebnis
- Jackpot
- negatives Ergebnis

### Sichtbarkeit

- alle
- nur ausführender Spieler
- nur GM
- bestimmte Benutzer
- Animation öffentlich, Ergebnis geheim
- Tabelle geheim

---

## 17.3 Testmodus

- bestimmtes Ergebnis erzwingen
- zufällig drehen
- keine Effekte ausführen
- Sound stumm
- reduzierte Bewegung
- verschiedene Fenstergrößen simulieren

---

# 18. Glücksrad im Spiel

## 18.1 Vollbild-Overlay

Das Rad erscheint zentriert über dem Canvas.

Hintergrund:

- Szene bleibt sichtbar,
- wird leicht abgedunkelt und weichgezeichnet,
- Foundry-Seitenleisten bleiben je nach Einstellung bedienbar oder werden gesperrt.

---

## 18.2 Bestandteile

- Gottheit oder Fähigkeit oben
- großes Rad
- Zeiger
- kleiner Untertitel
- optional ausführender Charakter
- Skip-Button
- Lautstärke-Button
- Ergebniskarte

---

## 18.3 Ergebnis

Nach dem Stoppen:

- Segment leuchtet auf,
- Ergebnisname erscheint,
- kurze Beschreibung,
- mechanischer Effekt,
- Button `Im Chat anzeigen`, falls nicht automatisch,
- GM sieht zusätzliche Details.

---

## 18.4 Geheimer GM-Modus

Spieler erhalten höchstens eine neutrale Meldung:

> Das Chaosrad wurde gedreht.

Nur die Spielleitung sieht:

- Animation,
- Ergebnis,
- Tabelle,
- Effekt.

Alternativ kann die Animation öffentlich sein, während das Ergebnis als `???` erscheint.

---

# 19. Götterkodex für Spieler

## 19.1 Ziel

Der Götterkodex ist keine abgespeckte GM-Datenbank. Er soll sich wie ein **in der Welt existierendes Buch** anfühlen, ohne die Lesbarkeit zu opfern.

---

## 19.2 Darstellungsmodi

### Buchansicht

Atmosphärische Standardansicht:

- aufgeschlagenes Buch oder einzelne Pergamentseiten,
- Pantheonregister,
- Porträt und Symbol,
- Kapitelüberschriften,
- dekorative Initialen,
- Zitate,
- sichtbare Regeln.

### Archivansicht

Barrierearme Alternative:

- dunkle normale Panels,
- Liste links,
- Inhalt rechts,
- keine Buchanimation,
- hohe Lesbarkeit.

Jeder Spieler kann den Modus persönlich wählen.

---

## 19.3 Startseite des Götterkodex

Enthält:

- Titel des Buchs
- Welten- oder Pantheonlogo
- Suche
- Pantheonregister
- favorisierte Gottheiten
- eigene Gottheit
- zuletzt gelesene Seiten
- zufällige Gottheit

---

## 19.4 Pantheonregister

Darstellung als Lesezeichen am Buchrand oder Tabs in der Archivansicht.

Registerfarbe basiert auf Pantheonfarbe.

Ein Register zeigt:

- Pantheonname
- Symbol
- Anzahl sichtbarer Gottheiten

---

## 19.5 Gottheitsseite

Linke Buchseite:

- Porträt
- Kultsymbol
- Name
- Titel
- Pantheon
- Zitat

Rechte Buchseite:

- Beschreibung
- sichtbare Edikte und Anathema
- sichtbare Systemwerte
- passive Boni
- göttliche Wunder
- bevorzugte Waffe und Domänen, falls sichtbar
- Button `Als Gottheit wählen`, falls erlaubt

---

## 19.6 Verborgene Informationen

Nicht sichtbare Felder erscheinen nicht als leere Abschnitte.

Optionale geheimnisvolle Darstellung:

- `Noch nicht offenbart`
- versiegelte Buchseite
- verblasstes Schloss

Nur verwenden, wenn die Spielleitung bewusst zeigen möchte, dass es noch verborgene Inhalte gibt.

---

## 19.7 Eigene Gottheit

Bei der ausgewählten Gottheit erscheinen zusätzliche Inhalte:

- `Deine Gottheit`-Badge
- verbleibende Wunder
- Resetzeit
- persönliche Boni
- Button `Wunder öffnen`
- Link zum Charakterbogen

---

## 19.8 Auswahlmodus

Wenn Spieler ihre Gottheit selbst wählen dürfen:

- Auswahlmodus deutlich kennzeichnen,
- nur zulässige Gottheiten anzeigen,
- Vergleichsmodus für bis zu drei Gottheiten,
- sichtbare Boni gemäß GM-Einstellung,
- Warnung vor endgültiger Auswahl,
- optional GM-Freigabe.

---

# 20. Vergleichsansicht für Spieler

Spalten:

- Gottheit
- sichtbarer Bonus
- Wunder
- Domänen
- Waffe
- Voraussetzungen

Die Spielleitung kann einzelne Vergleichszeilen verbergen.

Auf kleinen Bildschirmen werden die Kandidaten als nacheinander wechselnde Karten angezeigt.

---

# 21. Charakterbogen-Widget

## 21.1 Kompakte Darstellung

```text
┌───────────────────────────────────────┐
│ [Symbol] Velaria – Verborgenheit      │
│ Täuschung +1                          │
│ Schattenpfad                    1/1   │
│ [ Aktivieren ] [ Kodex ]              │
└───────────────────────────────────────┘
```

---

## 21.2 Position

Adapterabhängige Optionen:

- eigener Reiter
- Seitenleiste
- Abschnitt unter Religion
- Header-Chip
- zusätzlicher Button

PF2e sollte sich an vorhandene Charakterbogenstrukturen anpassen, statt einen fremden Vollbildblock hineinzuzwingen.

---

## 21.3 Konfiguration

Spieler können persönlich wählen:

- kompakt
- vollständig
- nur Symbol
- Wunder einklappen
- Zitat ausblenden

Die Spielleitung kann Mindestinformationen erzwingen.

---

# 22. Chatkarten

## 22.1 Göttliches Wunder

Chatkarte enthält:

- Gottheitssymbol
- Charakter
- Wundername
- Aktionskosten
- Ziel
- Wurf und SG
- Ergebnis
- Effekt
- Dauer
- verbleibende Nutzung

---

## 22.2 Gestaltung

- schmaler Pantheonfarbrand
- dunkle Oberfläche
- Gottheitsname in Display-Schrift
- Werte in UI-Schrift
- Erfolgsgrad farblich und textlich
- Buttons nur für berechtigte Benutzer

---

## 22.3 Geheime Chatkarte

GM sieht vollständige Karte.

Spieler sehen je nach Konfiguration:

- gar nichts,
- neutrale Meldung,
- Fähigkeit ohne Ergebnis,
- vollständiges Ergebnis.

---

# 23. Dialoge und Bestätigungen

## 23.1 Standarddialog

Bestandteile:

- Icon
- klarer Titel
- ein Satz Erklärung
- relevante Werte
- primäre Aktion rechts
- Abbrechen links oder neutral

---

## 23.2 Gefährliche Aktionen

Bei Löschen, Massenaktualisierung oder Ersetzung:

- rote Warnfarbe,
- konkrete Auswirkung,
- Anzahl betroffener Inhalte,
- optional Eingabe des Namens,
- Backup-Hinweis.

---

## 23.3 Spielerentscheidungen

Bei Auswahl einer Gottheit:

> Du wählst Velaria – Verborgenheit als Gottheit für Nyx. Dadurch werden die angezeigten Boni und Wunder auf den Charakter angewendet.

Buttons:

- Zurück
- Auswahl bestätigen
- GM um Freigabe bitten

---

# 24. Benachrichtigungen

## 24.1 Toasts

Arten:

- Erfolg
- Information
- Warnung
- Fehler

Beispiele:

- Gottheit gespeichert
- Wunder verbraucht
- Nutzung bei täglicher Vorbereitung zurückgesetzt
- Ziel ist ein Bossgegner
- Adapter konnte einen Wert nicht anwenden

---

## 24.2 Keine Toast-Flut

Wiederkehrende automatische Ereignisse werden gesammelt.

Beispiel:

> 4 göttliche Wunder wurden bei der täglichen Vorbereitung zurückgesetzt.

---

# 25. Suchfunktion

## 25.1 Globale Suche

Durchsucht:

- Gottheiten
- Pantheons
- Wunder
- Boni
- Zufallstabellen
- Charakterzuweisungen
- Einstellungen

Tastenkürzel:

- `Strg + K`

---

## 25.2 Command Palette

Ergebnisse als Befehle:

- Gottheit öffnen
- neues Wunder
- Spieleransicht testen
- Nutzung zurücksetzen
- Dashboard-Einstellung öffnen

GM-only-Aktionen werden gekennzeichnet.

---

# 26. Kontextmenüs

Gottheitenkarte:

- öffnen
- bearbeiten
- Vorschau als Spieler
- duplizieren
- exportieren
- veröffentlichen
- deaktivieren
- archivieren
- löschen

Wunderkarte:

- bearbeiten
- testen
- duplizieren
- in Vorlage speichern
- Nutzung zurücksetzen
- deaktivieren
- löschen

---

# 27. Icons

## 27.1 Stil

- dünne, leicht ornamentale Linien
- einheitliche Strichstärke
- monochrom
- Farbe über CSS
- klar bei 16, 20, 24 und 32 px

---

## 27.2 Iconkategorien

- Gottheit
- Pantheon
- Bonus
- Wunder
- Ritual
- Wurf
- Effekt
- Trigger
- Bedingung
- Ziel
- Dauer
- Nutzung
- Reset
- Glücksrad
- Kompendium
- Spieler
- GM
- Sichtbarkeit
- Warnung

Systemeigene Aktionssymbole werden übernommen, wenn der Adapter sie bereitstellt.

---

# 28. Bilder und Porträts

## 28.1 Bildformate

Empfohlene Verhältnisse:

- Gottheitenkarte: 4:5
- Detailporträt: 1:1 oder 4:5
- Rundes Icon: 1:1
- Kultsymbol: 1:1, idealerweise transparent
- Banner: 21:9 oder 16:5

---

## 28.2 Zuschnitt

Der Bildeditor speichert:

- Fokuspunkt
- Zoom
- Kartenposition
- Buchposition
- Iconausschnitt

Ein Bild darf in verschiedenen UI-Kontexten unterschiedlich zugeschnitten werden, ohne mehrere Dateien zu benötigen.

---

## 28.3 Fallbacks

Ohne Bild:

- Pantheonsymbol
- generische Silhouette
- Initiale
- kein kaputtes Bildsymbol

---

# 29. Animationen

## 29.1 Mikroanimationen

- Karten heben sich 2–3 px
- Rand leuchtet sanft auf
- Drawer gleitet ein
- Tabs wechseln mit kurzer Überblendung
- Nutzungszähler pulsiert nach Verbrauch

Dauer:

- 120–220 ms für Standardinteraktionen

---

## 29.2 Große Animationen

Nur für:

- Glücksrad
- besondere Wunder
- Gottheitenauswahl
- Veröffentlichung
- Buchseitenwechsel

---

## 29.3 Reduzierte Bewegung

Bei aktivierter Einstellung:

- keine Parallaxeffekte
- kein Bildschirmzittern
- Buchseiten nur überblenden
- Glücksrad kann als kurze Ergebnisanimation dargestellt werden
- keine langen Partikeleffekte

---

# 30. Sounddesign

Sound ist optional und standardmäßig zurückhaltend.

Mögliche Ereignisse:

- Buch öffnen
- Gottheit auswählen
- Wunder aktivieren
- Glücksrad drehen
- Jackpot
- Fehler

Regeln:

- globale Lautstärke
- Spielerlautstärke respektieren
- einzeln abschaltbar
- kein Sound bei Hover
- keine dauerhaften Hintergrundschleifen im Dashboard

---

# 31. Responsives Verhalten

## 31.1 Groß – ab 1500 px

- Navigation links
- Hauptinhalt Mitte
- Kontextleiste rechts
- mehrere Karten nebeneinander

## 31.2 Mittel – 1100 bis 1499 px

- Kontextleiste als einklappbarer Drawer
- Kartenanzahl reduziert
- Navigation bleibt sichtbar

## 31.3 Klein – 800 bis 1099 px

- Navigation auf Icons
- einspaltige Hauptkarten
- rechte Details als Modal oder Drawer
- kein dauerhaftes Dreispaltenlayout

## 31.4 Sehr klein – unter 800 px

Kein vollständiger Experteneditor.

Unterstützt werden:

- Götterkodex
- Hub
- Fähigkeit aktivieren
- einfache Einstellungen
- Lesemodus

Der GM-Editor zeigt einen Hinweis, dass ein größeres Fenster empfohlen wird.

---

# 32. Zustände jeder Oberfläche

Jede Hauptansicht benötigt Designs für:

- Laden
- leer
- Suche ohne Treffer
- fehlende Berechtigung
- Adapter nicht verfügbar
- ungültige Daten
- Offline-/Socketproblem
- Migration erforderlich
- schreibgeschützt

---

## 32.1 Leerer Zustand

Beispiel Gottheiten:

```text
Noch keine eigenen Gottheiten
Erschaffe einen neuen Gott oder importiere ein Pantheon.
[ Neuen Gott erstellen ] [ Importieren ]
```

Mit einer ruhigen Illustration, nicht nur leerem Raum.

---

## 32.2 Fehlerzustand

Fehlerkarten zeigen:

- verständliche Zusammenfassung
- technischen Detailbereich zum Aufklappen
- kopierbare Diagnose
- Reparaturvorschlag
- Button `Erneut prüfen`

---

# 33. Berechtigungen sichtbar machen

## 33.1 Sichtbarkeits-Badges

- Öffentlich
- Vor Auswahl sichtbar
- Nur Anhänger
- Nur Besitzer
- Nur GM
- Verborgen

Farben plus Icon plus Text.

---

## 33.2 Vorschau

Ein Augen-Button öffnet immer eine Vorschau:

- als beliebiger Spieler
- als bestimmter Spieler
- als Anhänger
- als GM

So muss die Spielleitung nicht raten, was Spieler tatsächlich sehen.

---

# 34. Design des Ersetzungsmanagers

## 34.1 Tabellenaufbau

| Offizielle Gottheit | Status | Homebrew-Ersatz | Übernahme | Bestehende Charaktere |
|---|---|---|---|---|

Status:

- sichtbar
- ausgeblendet
- ersetzt
- konfliktbehaftet
- Quelle fehlt

---

## 34.2 Visuelles Mapping

```text
[ Abadar ]  ─────────────→  [ Lexara – Ordnung ]
  offiziell                    Homebrew
```

Unter der Verbindung:

- 7 Werte übernommen
- 2 überschrieben
- 1 inkompatibel

---

## 34.3 Filter nach Systemaktualisierung

Nach einem PF2e-Update können geänderte Quellen markiert werden:

- Quelle aktualisiert
- Materialisierung veraltet
- Prüfung empfohlen

Kein alarmierendes Rot, solange kein echter Fehler vorliegt.

---

# 35. Testlabor

## 35.1 Layout

Links:

- Testactor
- Testziel
- Szene
- System

Mitte:

- Fähigkeit
- Bedingungen
- Wurf
- Effektvorschau

Rechts:

- Ereignisprotokoll
- Dokumentänderungen
- Warnungen

---

## 35.2 Testzustände

Voreinstellungen:

- Stufe 1
- Stufe 5
- Stufe 10
- Stufe 15
- Stufe 20
- Bossziel
- bewusstlos
- sterbend
- keine Nutzungen
- tägliche Vorbereitung

---

# 36. Hilfe und Onboarding

## 36.1 Erster Start

Kurzer Assistent:

1. System erkannt
2. Adapterstatus
3. offizielle Gottheiten behalten oder ersetzen
4. Götterkodex aktivieren
5. Beispielgottheit anlegen oder überspringen
6. Dashboard öffnen

---

## 36.2 Kontextuelle Hilfe

- Info-Icons
- kurze Tooltips
- Beispielwerte
- Link zur passenden Dokumentationsseite
- `Warum ist diese Option deaktiviert?`

---

## 36.3 Vorlagen

Für Anfänger:

- einfacher Fertigkeitsbonus
- tägliche Heilung
- zwei Runden RK-Bonus
- Zielrettungswurf
- Teleportation
- Item erzeugen
- W100-Glücksrad

Noclaris kann als optionales Beispielpaket dienen, darf aber nicht fest im Kern vorausgesetzt werden.

---

# 37. Barrierefreiheit

Pflichtanforderungen:

- vollständige Tastaturbedienung
- sichtbarer Fokuszustand
- keine Information nur durch Farbe
- Textalternativen für Icons
- ausreichender Kontrast
- skalierbare Schrift
- reduzierte Bewegung
- Animation überspringbar
- Archivansicht statt Buchansicht
- keine Pflicht-Hoverinteraktionen
- Formulare mit echten Labels
- Fehlermeldungen direkt mit dem Feld verknüpft
- Tabellen auch linear lesbar

---

# 38. Lokalisierung

Die Oberfläche darf keine fest eingebauten deutschen Texte enthalten.

Alle Texte werden über Foundry-Lokalisierungsschlüssel geladen.

Zu berücksichtigen:

- längere englische Begriffe
- zusammengesetzte deutsche Begriffe
- Pluralformen
- Datums- und Zahlenformat
- unterschiedliche Würfelbezeichnungen
- unterschiedliche Leserichtung als späterer Erweiterungspunkt

Buttons müssen auch bei längeren Übersetzungen funktionieren.

---

# 39. Benennungskonventionen

## 39.1 Deutsch

- Gottheit
- Pantheon
- Passiver Bonus
- Göttliches Wunder
- Nutzung
- Zurücksetzung
- Dauer
- Auslöser
- Bedingung
- Ziel
- Effekt
- Zufallstabelle
- Glücksrad
- Götterkodex

## 39.2 Vermeiden

- englische Mischbegriffe in der deutschen Oberfläche, wenn ein klarer deutscher Begriff existiert
- `Cooldown` statt `Abklingzeit`
- `Companion` als sichtbarer Hauptname im deutschen UI
- technische Datenpfade im Easy Mode

---

# 40. Komponentenbibliothek

Verbindliche wiederverwendbare Komponenten:

- AppShell
- SidebarNavigation
- TopBar
- ContextRail
- OrnamentalPanel
- DeityCard
- DeityPortrait
- PantheonGem
- StatusBadge
- VisibilityBadge
- AbilityCard
- BonusCard
- UsagePips
- ResetTimer
- SearchField
- FilterChip
- EmptyState
- ValidationBanner
- PropertyInspector
- StepWizard
- CodexPage
- CodexRegister
- FortuneWheel
- ResultReveal
- ChatCard
- ConfirmDialog
- UserPreviewSwitch

Jede Komponente besitzt dokumentierte Größen, Zustände und Berechtigungsvarianten.

---

# 41. Beispielhafte Hauptnavigation

```text
DARKIS GODFORGE

HAUPTMENÜ
  Übersicht
  Götter
  Pantheons
  Göttliche Wunder
  Passive Boni
  Zufallstabellen
  Glücksräder

INTEGRATION
  Ersetzungen
  Charaktere
  Götterkodex
  Spieleransicht

WERKZEUGE
  Testlabor
  Import / Export
  Migration
  Audit-Log

EINSTELLUNGEN
  Moduloptionen
  Systemadapter
  Hilfe
```

---

# 42. Empfohlene Interaktionsabläufe

## 42.1 Gottheit erstellen

```text
Dashboard
→ Neuer Gott
→ Grunddaten
→ Porträt und Symbol
→ offizielle Vorlage wählen
→ Werte übernehmen
→ Bonus anlegen
→ Wunder anlegen
→ Sichtbarkeit festlegen
→ Spieleransicht prüfen
→ veröffentlichen
```

## 42.2 Spieler nutzt Wunder

```text
GodForge-Hub
→ Wunder auswählen
→ Ziel auswählen
→ Bedingungen werden geprüft
→ Bestätigen
→ Wurf / Effekt
→ Animation und Chatkarte
→ Nutzung wird aktualisiert
```

## 42.3 Spieler wählt Gottheit

```text
Götterkodex
→ Pantheon
→ Gottheit
→ sichtbare Werte lesen
→ vergleichen
→ auswählen
→ Bestätigung oder GM-Anfrage
→ Charakterbogen wird aktualisiert
```

## 42.4 Chaosrad

```text
Hub oder Charakterbogen
→ Chaosrad aktivieren
→ Sichtbarkeit prüfen
→ Overlay erscheint
→ Rad dreht
→ Ergebnis wird enthüllt
→ Effekt wird ausgeführt
→ Chatkarte
```

---

# 43. Anti-Patterns

Nicht umsetzen:

- alle Funktionen in einem riesigen Einstellungsdialog,
- Gothic-Schrift in Formularfeldern,
- ausschließlich violette Texte auf schwarzem Grund,
- versteckte Hauptaktionen nur in Kontextmenüs,
- kleine unbeschriftete Icons ohne Tooltip,
- dreispaltiges Layout bei zu kleinem Fenster,
- Spieleransicht als Kopie des GM-Dashboards,
- Glücksrad, dessen Animation das Ergebnis bestimmt,
- unterschiedliche Datenmodelle für Easy und Experte,
- automatische Veröffentlichung ohne Vorschau,
- unerklärte technische Fehlermeldungen,
- Pantheonfarben als vollflächige Hintergründe,
- Zahlenwerte nur durch Farben kennzeichnen.

---

# 44. Design-Abnahmekriterien für Version 1.0

Das Design gilt als vollständig, wenn:

1. Es eine eigenständige GM-Dashboard-Oberfläche gibt.
2. Die normalen Foundry-Moduleinstellungen nur globale Optionen enthalten.
3. Der Scene-Control-Button und GodForge-Hub funktionieren.
4. Spieler einen Götterkodex öffnen können.
5. Buch- und Archivansicht existieren.
6. Eine Gottheit über einen Assistenten angelegt werden kann.
7. Easy Mode und Expertenmodus visuell klar getrennt sind.
8. Gottheiten, Boni, Wunder, Tabellen und Räder eigene Browser besitzen.
9. Offizielle Gottheiten visuell auf Homebrew-Ersatz gemappt werden können.
10. Die Spielleitung jederzeit eine Spieleransicht simulieren kann.
11. Wunder im Charakterbogen und Hub angezeigt werden.
12. Nutzungen und Resetzeit verständlich sichtbar sind.
13. Das Glücksrad öffentlich oder nur für GM erscheinen kann.
14. Alle Hauptansichten Lade-, Leer- und Fehlerzustände besitzen.
15. Das UI bei 1100 px Breite sinnvoll funktioniert.
16. Die Spieleroberfläche ohne Expertenbegriffe verständlich ist.
17. Tastaturbedienung und reduzierte Bewegung unterstützt werden.
18. Pantheonfarben frei konfigurierbar sind.
19. Formulare und Texte ohne Gothic-Schrift lesbar bleiben.
20. Die gesamte Oberfläche wie ein zusammenhängendes Produkt wirkt.

---

# 45. Priorisierung für die Designumsetzung

## Designphase 1 – Fundament

- Logo- und Farbvariablen
- AppShell
- Navigation
- Dashboard-Startseite
- Gottheiten-Browser
- Gottheiten-Detailseite
- responsive Grundstruktur

## Designphase 2 – Erstellung

- Gottheiten-Assistent
- Bildauswahl
- Vorlagenvergleich
- Bonus-Easy-Mode
- Wunder-Easy-Mode
- Validierung

## Designphase 3 – Expertenwerkzeuge

- Ablaufgraph
- Eigenschaftsinspektor
- Bedingungseditor
- Zufallstabellen-Editor
- Glücksrad-Editor
- Testlabor

## Designphase 4 – Spieler

- Götterkodex
- Buchansicht
- Archivansicht
- Auswahl und Vergleich
- Charakterbogen-Widget
- GodForge-Hub
- Chatkarten

## Designphase 5 – Feinschliff

- Animationen
- Sounds
- Barrierefreiheit
- Lokalisierung
- Themes
- Onboarding
- Hilfe

---

# 46. Abschließendes Designbild

Darkis GodForge besitzt drei bewusst unterschiedliche Gesichter:

## Für die Spielleitung: die Schmiede

Eine dunkle, präzise Verwaltungsoberfläche. Gottheiten werden wie komplexe Werkstücke gebaut, geprüft, getestet und veröffentlicht.

## Für Spieler: der Kodex

Ein atmosphärisches Glaubensbuch. Spieler entdecken Pantheons, lesen über Götter und verstehen ihre sichtbaren Vorteile, ohne mit technischen Editoren konfrontiert zu werden.

## Während des Spiels: der Hub

Eine kompakte, schnelle Oberfläche. Sie zeigt nur die eigene Gottheit, aktive Boni, verfügbare Wunder und die unmittelbar benötigten Aktionen.

Das Produkt darf daher nicht überall identisch aussehen. Es muss jedoch durch dieselben Farben, Icons, Rahmen, Typografie und Interaktionsmuster eindeutig als **Darkis GodForge** erkennbar bleiben.
