<div align="center">

<img src="assets/logo.png" alt="Darkis GodForge" width="340">

# Darkis GodForge

### Erschaffe Götter. Forme Glauben. Verändere Welten.

Homebrew-Gottheiten für **Pathfinder 2e**, **Starfinder 2e** und **Starfinder 1e** in Foundry VTT.

[![Release](https://img.shields.io/github/v/release/Darkiyus/Darkis-Godforge?display_name=tag&style=for-the-badge&color=8b5cf6)](https://github.com/Darkiyus/Darkis-Godforge/releases/latest)
[![Status](https://img.shields.io/badge/Status-Alpha-f59e0b?style=for-the-badge)](#entwicklungsstatus--development-status)
[![Foundry](https://img.shields.io/badge/Foundry_VTT-v13_%7C_v14-ff6400?style=for-the-badge)](https://foundryvtt.com/)
[![Systems](https://img.shields.io/badge/Systeme-Pathfinder_%7C_Starfinder-7c3aed?style=for-the-badge)](#unterstützte-systeme)
[![Languages](https://img.shields.io/badge/Sprachen-DE_%7C_EN-0f766e?style=for-the-badge)](#sprachen--languages)
[![Downloads](https://img.shields.io/github/downloads/Darkiyus/Darkis-Godforge/total?style=for-the-badge&color=2563eb)](https://github.com/Darkiyus/Darkis-Godforge/releases)

**[Deutsch](#deutsch) · [English](#english) · [Manifest installieren](https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json)**

</div>

---

## Deutsch

> [!WARNING]
> **Alpha:** Darkis GodForge wird aktiv entwickelt. Sichere deine Welt vor Aktualisierungen; Datenmodell und Bedienung können sich bis zur stabilen Version noch ändern.

Darkis GodForge ist eine vollständige Werkbank für eigene Gottheiten. Die Spielleitung baut Identität, Regeln, Segnungen, Wunder und Systemwerte in Foundry. Spieler erhalten einen gesonderten Götterkodex und einen kompakten Charakter-Hub – ohne Zugriff auf Entwürfe oder interne SL-Daten.

### Funktionen

- **Atmosphärisches Verwaltungs-Dashboard** mit Banner, Suche, Navigation, echten Kennzahlen, Systemstatus und zuletzt bearbeiteten Gottheiten.
- **Gottheiten-Editor** für Porträtpfade, Pantheons, Domänen, alternative Domänen, göttliche Attribute, Font, Fertigkeit, Waffe, Heiligung, Edikte, Anathema und gewährte Zauber.
- **Veröffentlichungsworkflow** mit Entwurf, Test, Veröffentlicht, Deaktiviert und Archiviert.
- **Sichtbarkeit pro Datenbereich**: öffentlich, vor Auswahl, nur Anhänger, nur Besitzer, vertrauenswürdig, nur SL oder bis zur Auswahl verborgen.
- **Spielervorschau** direkt aus dem Editor; nicht berechtigte Felder werden vor dem Rendern aus den Daten entfernt.
- **Passive Boni** mit systemabhängigen Selektoren, Bonusart, Ziel, Bedingung, Sichtbarkeit, Sortieren und Duplizieren.
- **Göttliche Wunder** mit getrennten Aktionskosten, Nutzungen, Reset, Abklingzeit und Dauer sowie Effektvorlagen für Erzählung, Heilung, Schaden und Modifikatoren.
- **Verschachtelte UND/ODER-Gewährungen** einschließlich Auswahlanzahl und Überschreibungen für Name, Beschreibung und Wert.
- **Götterkodex für Spieler** mit Suche und Domänenfilter; sichtbar sind ausschließlich veröffentlichte und freigegebene Inhalte.
- **Charakter-Hub und Charakterbogen-Schaltfläche** für die zugewiesene Gottheit, aktive Gewährungen, Wunder und verbleibende Nutzungen.
- **Native PF2e-/SF2e-Kopplung**: Beim Zuweisen wird ein echtes Gottheiten-Item mit Domänen, Zaubern, Font, Fertigkeit, Waffe, Attributen und Heiligung am Actor synchronisiert.
- **SFRPG-Unterstützung** über das GodForge-eigene Daten- und Charaktermodell, da Starfinder 1e keinen nativen Gottheiten-Itemtyp besitzt.
- **Ersetzungsmanager** für offizielle Systemgottheiten mit kontextabhängigem Ersetzen, Ausblenden und selektiver Vererbung.
- **Zufallstabellen und Glücksräder** mit gewichteten Ergebnissen, Sichtbarkeit, Testziehung und persistenter Weltspeicherung.
- **Import/Export mit Vorschau** für Gottheiten, Sichtbarkeit, Regeln, Ersetzungen und Zufallsinhalte; alte Definitionen werden migriert.
- **Harte Rechteprüfung** für Dashboard, Editoren und schreibende APIs. Spieleraktionen werden über eine authentifizierte Socketlib-Absender-ID von der Spielleitung ausgeführt.
- **Deutsch und Englisch** mit automatisch geprüfter Schlüsselgleichheit.

### Unterstützte Systeme

| System | GodForge | Native Gottheiten-Synchronisierung |
|---|:---:|:---:|
| Pathfinder Second Edition (`pf2e`) | ✅ | ✅ |
| Starfinder Second Edition (`sf2e`) | ✅ | ✅ |
| Starfinder First Edition (`sfrpg`) | ✅ | Nicht im System vorhanden |

Das Modul ist für **Foundry VTT 14** geprüft und unterstützt **Foundry VTT 13** innerhalb der Kompatibilität des jeweils aktiven Spielsystems.

### Installation

1. Öffne in Foundry VTT den Bereich **Add-on-Module**.
2. Klicke auf **Modul installieren**.
3. Füge folgende Adresse in **Manifest-URL** ein:

```text
https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json
```

4. Klicke auf **Installieren**.
5. Öffne deine Pathfinder- oder Starfinder-Welt und aktiviere **Darkis GodForge** unter **Module verwalten**.
6. Installiere zusätzlich **socketlib**, wenn Spieler selbst eine Gottheit wählen oder Wunder aus ihrem Hub aktivieren sollen. Der reine Kodex funktioniert auch ohne socketlib.

### GodForge öffnen

Für die Spielleitung:

- **Spieleinstellungen → Darkis GodForge → GodForge öffnen**
- oder das **Hammer-Symbol** in der Szenensteuerung

Für Spieler und Spielleitung:

- **Stern-Symbol**: persönlicher GodForge-Hub des ausgewählten beziehungsweise zugewiesenen Charakters
- **Buch-Symbol**: Götterkodex
- Tastatur: `G` für den Hub, `Umschalt+G` für den Kodex

Integrationen erreichen die öffentliche API über:

```js
game.modules.get("darkis-godforge").api
```

SL-Funktionen bleiben auch über die Konsole geschützt.

### Manuelle Installation

Lade die ZIP-Datei der [aktuellen Veröffentlichung](https://github.com/Darkiyus/Darkis-Godforge/releases/latest) herunter und entpacke sie als `darkis-godforge` in `Data/modules/`. Starte Foundry anschließend neu und aktiviere das Modul in der Welt.

---

## English

> [!WARNING]
> **Alpha:** Darkis GodForge is under active development. Back up your world before updating; the data model and interface may still change before the stable release.

Darkis GodForge is a complete workshop for custom deities. Game Masters define identity, rules, blessings, wonders, and system values directly in Foundry. Players receive a separate Divine Codex and compact character hub without access to drafts or private GM data.

### Features

- **Atmospheric management dashboard** with banner, search, navigation, real statistics, system health, and recently edited deities.
- **Deity editor** for portraits, pantheons, domains, alternate domains, divine attributes, font, skill, weapon, sanctification, edicts, anathema, and granted spells.
- **Publication workflow** covering draft, test, published, disabled, and archived states.
- **Field-level visibility** for public, selection, followers, owners, trusted users, GM-only, and hidden-until-selected content.
- **Player preview** from the editor; unauthorized fields are removed from data before templates render.
- **Passive bonuses** with system selectors, modifier type, target, condition, visibility, ordering, and duplication.
- **Divine wonders** with separate action cost, uses, reset, cooldown, and duration plus narrative, healing, damage, and modifier templates.
- **Nested AND/OR grants** with pick counts and inherited name, description, or value overrides.
- **Player Divine Codex** with search and domain filters; only published and authorized content is included.
- **Character hub and sheet control** showing the assigned deity, grants, wonders, and remaining uses.
- **Native PF2e/SF2e coupling** that synchronizes an actual deity item containing domains, spells, font, skill, weapon, attributes, and sanctification when assigned.
- **SFRPG support** through GodForge's own deity and character model because Starfinder 1e has no native deity item type.
- **Replacement manager** for context-aware hiding or replacing official system deities with selective inheritance.
- **Random tables and fortune wheels** with weighted results, visibility, test draws, and persistent world storage.
- **Validated import/export preview** for deities, visibility, rules, replacements, and random content, including legacy migration.
- **Enforced permissions** on dashboards, editors, and write APIs. Player requests use Socketlib's authenticated sender identity for GM-authoritative execution.
- **German and English localization** with automatically tested key parity.

### Supported systems

| System | GodForge | Native deity synchronization |
|---|:---:|:---:|
| Pathfinder Second Edition (`pf2e`) | ✅ | ✅ |
| Starfinder Second Edition (`sf2e`) | ✅ | ✅ |
| Starfinder First Edition (`sfrpg`) | ✅ | Not provided by the system |

The module is verified for **Foundry VTT 14** and supports **Foundry VTT 13** within the active game system's own compatibility range.

### Installation

1. Open **Add-on Modules** in Foundry VTT.
2. Click **Install Module**.
3. Paste this address into **Manifest URL**:

```text
https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json
```

4. Click **Install**.
5. Open your Pathfinder or Starfinder world and enable **Darkis GodForge** under **Manage Modules**.
6. Install **socketlib** as well if players should select deities or activate wonders from their hub. The read-only Codex works without it.

### Opening GodForge

For Game Masters:

- **Game Settings → Darkis GodForge → Open GodForge**
- or the **hammer control** in Scene Controls

For players and Game Masters:

- **Star control**: personal GodForge Hub for the selected or assigned character
- **Book control**: Divine Codex
- Keyboard: `G` opens the Hub, `Shift+G` opens the Codex

Integrations can access the public API at:

```js
game.modules.get("darkis-godforge").api
```

GM-only operations remain protected when called from the browser console.

### Manual installation

Download the ZIP from the [latest release](https://github.com/Darkiyus/Darkis-Godforge/releases/latest), extract it as `darkis-godforge` inside `Data/modules/`, restart Foundry, and enable the module in your world.

---

## Entwicklungsstatus / Development status

**Alpha:** Das Modul wird aktiv entwickelt und kann noch inkompatible Änderungen erhalten.  
**Alpha:** The module is under active development and may still receive breaking changes.

## Sprachen / Languages

- 🇩🇪 Deutsch
- 🇬🇧 English

Die Sprache folgt Foundry automatisch oder kann in den Moduleinstellungen gewählt werden.  
The interface follows Foundry automatically or can be selected in module settings.

## Entwicklung / Development

```bash
npm install
npm run check
```

`npm run check` führt Typprüfung, Linting, Tests, Produktions-Build und Foundry-Bootstrap-Smoke-Test aus.  
`npm run check` runs type checking, linting, tests, the production build, and the Foundry bootstrap smoke test.

---

<div align="center">

**Forge the divine. Shape your world.**

[Neueste Version](https://github.com/Darkiyus/Darkis-Godforge/releases/latest) · [Manifest installieren](https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json) · [Fehler melden](https://github.com/Darkiyus/Darkis-Godforge/issues)

Darkis GodForge ist ein unabhängiges Community-Projekt und steht in keiner offiziellen Verbindung zu Foundry Gaming, Paizo oder den jeweiligen Spielsystem-Projekten.

</div>
