# Update 0.1

Die Reviewpunkte wurden umgesetzt und anschließend durch einen vollständigen Projektcheck geprüft.

- Foundry-Bildpfade und URL-Sicherheit korrigiert
- offizielle Systemgottheiten und kontextabhängige Ersetzungen verdrahtet
- gemischte Würfelformeln vollständig auswertbar
- Sprachumschaltung mit separat geladenen Sprachkatalogen
- deutsche und englische Übersetzungsschlüssel in Parität
- verschachtelte Grant-Gruppen und Fähigkeitsüberschreibungen
- getrenntes Timing-Modell für Aktion, Nutzung, Reset, Abklingzeit und Dauer
- PF2e-Klassenkopplung aus dem systemneutralen Kern entfernt
- Actor-Flags über Foundrys Flag-API entfernbar
- unsupported systems werden sauber deaktiviert
- Zufallsentscheidungen benötigen einen autoritativen Resolver
- Handlebars-Detailansicht und UI-Regressionskorrekturen

Validierung: TypeScript, ESLint, 22 Tests, Produktions-Build, npm-Audit und Diff-Check erfolgreich.
