# Update

Die im Review beschriebenen kritischen Fehler wurden behoben:

- HTML-Ausgaben und Bildpfade werden gegen XSS abgesichert.
- GM-/Besitzprüfung und socketlib-Transport sind verdrahtet.
- Beispieldaten werden nicht mehr automatisch in Welten geschrieben.
- Das Dashboard öffnet sich nicht mehr automatisch bei jedem Login.
- Ersetzungsfilter und Katalog-Cache wurden korrigiert.
- Gemischte Würfelformeln wie `3d8 + @actor.level` funktionieren wieder.
- Der Formelparser berücksichtigt Operatorpräzedenz korrekt.
- Zufalls-/Importpfade und Regressionstests wurden erweitert.

Validierung: 20 Tests, TypeScript, ESLint, Build, Diff-Check und npm-Audit erfolgreich.
