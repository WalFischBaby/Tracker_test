# DT-01 Assistant 3.2 – Installation

1. Im Supabase Dashboard unter Edge Functions > dt01-assistant > Code den Inhalt von `supabase/functions/dt01-assistant/index.ts` einfügen und Deploy updates klicken. Die bestehenden Secrets bleiben unverändert.
2. Die Website-Dateien aus dem ZIP in `Tracker_test` hochladen, Ordnerstruktur erhalten und bestehende Dateien ersetzen.
3. GitHub Pages abwarten, mit Strg+F5 aktualisieren und den Assistant öffnen.
4. Ohne Gemini-Verbrauch die drei neuen Berater-Schaltflächen testen. Anschließend mit einer KI-Frage die personalisierten Prioritäten testen und den Zähler kontrollieren.

Keine SQL-Migration erforderlich. Keine Änderungen an Tabellen, Fortschritten, Profilen, Chat oder Moderation.

Die Berater-Vorschläge beruhen auf bereits im Browser vorhandenen Daten und sind keine verifizierten Spielrezepte. Die KI erhält bis zu 12 offene Ziele, die vom Browser geliefert werden; die Daten werden nicht unabhängig serverseitig überprüft.
