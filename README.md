<div align="center">

<img src="assets/logo.png" alt="Darkis GodForge" width="340">

# Darkis GodForge

Homebrew-Gottheiten für Pathfinder und Starfinder in Foundry VTT.

[![Release](https://img.shields.io/github/v/release/Darkiyus/Darkis-Godforge?display_name=tag&style=for-the-badge&color=8b5cf6)](https://github.com/Darkiyus/Darkis-Godforge/releases/latest)
[![Status](https://img.shields.io/badge/Status-Alpha-f59e0b?style=for-the-badge)](#entwicklungsstatus--development-status)
[![Foundry](https://img.shields.io/badge/Foundry_VTT-v13_%7C_v14-ff6400?style=for-the-badge)](https://foundryvtt.com/)
[![Sprachen](https://img.shields.io/badge/Sprachen-DE_%7C_EN-0f766e?style=for-the-badge)](#sprachen--languages)

**[Deutsch](#deutsch) · [English](#english) · [Manifest installieren](https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json)**

</div>

## Deutsch

> [!WARNING]
> **Alpha:** Sichere deine Foundry-Welt vor Aktualisierungen. Datenmodell und Bedienung können sich bis zur stabilen Version noch ändern.

Darkis GodForge verwaltet eigene Gottheiten direkt in Foundry. Die Spielleitung erstellt Regeln und sichtbare Inhalte; Spieler verwenden den Götterkodex und den persönlichen Charakter-Hub, ohne Entwürfe oder interne SL-Daten zu erhalten.

### Funktionen

- **Gottheiten-Editor:** Identität, Porträt, Icon, Symbol, Banner, Pantheone, Domänen, Zauber, Waffe, Edikte, Anathema und weitere Systemwerte – inklusive Foundry-Dateibrowser und Bildvorschau.
- **Regeln und Gewährungen:** passive Boni, göttliche Wunder, Nutzungen, Zurücksetzungen sowie verschachtelte UND-/ODER-Auswahlen, die Spieler bei der Zuweisung selbst treffen können.
- **Veröffentlichung und Sichtbarkeit:** Entwurf, Test, veröffentlicht, deaktiviert oder archiviert; jeder Datenbereich kann getrennt für Auswahl, Anhänger, Besitzer, vertrauenswürdige Spieler oder nur die SL freigegeben werden.
- **Götterkodex und Charakter-Hub:** Suche, Domänenfilter, Spielerwahl, zugewiesene Gottheit, aktive Gewährungen, Wunder und verbleibende Nutzungen.
- **Pathfinder-/Starfinder-Integration:** native Gottheiten-Items für PF2e und SF2e sowie das GodForge-eigene Charaktermodell für Starfinder 1e.
- **Ersetzungen und Zufallsinhalte:** offizielle Gottheiten kontextabhängig ausblenden oder ersetzen, ohne Kompendien zu verändern; gewichtete Zufallstabellen und Glücksräder sind ebenfalls enthalten.
- **Werkzeuge und Sicherheit:** validierter Import/Export, automatische Schemamigration, deutscher und englischer UI-Text sowie SL- und Besitzerprüfungen für alle schreibenden Aktionen.

### Unterstützte Systeme

| System | Unterstützung | Native Gottheiten-Synchronisierung |
|---|:---:|:---:|
| Pathfinder Second Edition (`pf2e`) | ✅ | ✅ |
| Starfinder Second Edition (`sf2e`) | ✅ | ✅ |
| Starfinder First Edition (`sfrpg`) | ✅ | Im System nicht vorhanden |

Das Modul ist für **Foundry VTT 14** geprüft und unterstützt **Foundry VTT 13**, soweit das aktive Spielsystem diese Version unterstützt.

### Installation

1. Öffne in Foundry **Add-on-Module** und klicke auf **Modul installieren**.
2. Füge diese Adresse in das Feld **Manifest-URL** ein:

```text
https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json
```

3. Klicke auf **Installieren**.
4. Aktiviere **Darkis GodForge** anschließend unter **Module verwalten** in deiner Welt.
5. Aktiviere zusätzlich **socketlib**, wenn Spieler Gottheiten wählen oder Wunder selbst auslösen sollen.

### GodForge öffnen

Die Spielleitung öffnet das Dashboard über **Spieleinstellungen → Darkis GodForge → GodForge öffnen** oder über das **Hammer-Symbol** in der Szenensteuerung.

Das **Buch-Symbol** öffnet den Götterkodex. Das **Stern-Symbol** öffnet den Hub des ausgewählten oder zugewiesenen Charakters. Alternativ: `G` für den Hub und `Umschalt+G` für den Kodex.

## English

> [!WARNING]
> **Alpha:** Back up your Foundry world before updating. The data model and interface may still change before the stable release.

Darkis GodForge manages custom deities directly in Foundry. Game Masters create rules and visible content; players use the Divine Codex and personal character hub without receiving drafts or private GM data.

### Features

- **Deity editor:** identity, portrait, icon, symbol, banner, pantheons, domains, spells, weapon, edicts, anathema, and other system values, with Foundry's file browser and live image previews.
- **Rules and grants:** passive bonuses, divine wonders, uses, resets, and nested AND/OR choices that players can select during assignment.
- **Publication and visibility:** draft, test, published, disabled, or archived; each data area can be exposed separately for selection, followers, owners, trusted players, or the GM only.
- **Divine Codex and character hub:** search, domain filters, player selection, assigned deity, active grants, wonders, and remaining uses.
- **Pathfinder/Starfinder integration:** native deity items for PF2e and SF2e plus GodForge's own character model for Starfinder 1e.
- **Replacements and random content:** hide or replace official deities by context without modifying compendiums; weighted random tables and fortune wheels are included.
- **Tools and security:** validated import/export, automatic schema migration, German and English UI, and GM/owner checks for every write action.

### Supported systems

| System | Support | Native deity synchronization |
|---|:---:|:---:|
| Pathfinder Second Edition (`pf2e`) | ✅ | ✅ |
| Starfinder Second Edition (`sf2e`) | ✅ | ✅ |
| Starfinder First Edition (`sfrpg`) | ✅ | Not provided by the system |

The module is verified for **Foundry VTT 14** and supports **Foundry VTT 13** where the active game system supports that version.

### Installation

1. Open **Add-on Modules** in Foundry and click **Install Module**.
2. Paste this address into **Manifest URL**:

```text
https://github.com/Darkiyus/Darkis-Godforge/releases/latest/download/module.json
```

3. Click **Install**.
4. Enable **Darkis GodForge** under **Manage Modules** in your world.
5. Enable **socketlib** as well if players should choose deities or activate wonders themselves.

### Opening GodForge

Game Masters open the dashboard through **Game Settings → Darkis GodForge → Open GodForge** or the **hammer control** in Scene Controls.

The **book control** opens the Divine Codex. The **star control** opens the hub for the selected or assigned character. Keyboard shortcuts: `G` for the Hub and `Shift+G` for the Codex.

## Entwicklungsstatus / Development status

Darkis GodForge befindet sich in der Alpha-Phase und kann noch inkompatible Änderungen erhalten.

Darkis GodForge is in alpha and may still receive breaking changes.

## Sprachen / Languages

Die Oberfläche folgt Foundrys Sprache oder der Auswahl in den Moduleinstellungen.

The interface follows Foundry's language or the selection in module settings.

## Entwicklung / Development

```bash
npm install
npm run check
```

`npm run check` prüft Typen, Linting, Tests, Produktions-Build und den Foundry-Bootstrap-Smoke-Test.
