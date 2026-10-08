DT-01 V2.0 – Messenger: Nachrichten löschen & Profilbilder (Testversion)

WICHTIG: Erst Sicherung/Commit des aktuellen GitHub-Testservers und Supabase-Backup anlegen.

1. Supabase -> SQL Editor: die neue Datei DM_LOESCHEN_SUPABASE.sql EINMAL ausführen.
   Sie ergänzt 2 private Sichtbarkeitsfelder und streng geprüfte Update-Regeln.
   Die vorhandenen DM-Nachrichten bleiben erhalten.
2. Die Website-Dateien mit GitHub Desktop auf das Test-Repository übertragen.
3. Im Browser mit Strg+F5 neu laden; mit ZWEI Testkonten prüfen:
   - Neues Profilbild hochladen/speichern; Community-Chat und Privatnachrichten kontrollieren.
   - Einzelne Nachricht bei A löschen: bei A weg, bei B noch sichtbar.
   - Ganze Unterhaltung bei A löschen: bei A weg, bei B erhalten.
   - Neue Nachricht von B an A: wird wieder im Posteingang angezeigt.
   - Ungelesen-Zähler und Lesestatus kontrollieren.
   - Marktplatz, Sammlungsfortschritt, Rebirth, Kontoverwaltung und Navigation auf dem Testserver prüfen.

LÖSCHVERHALTEN: „Löschen“ verbirgt Nachrichten nur für den aktuellen Nutzer.
Keine physische DB-Löschung, keine Änderung an der Kopie des Gesprächspartners.

Geprüft: JS-Syntax, 12 HTML-Seiten und lokale Verweise,
Playwright-Browser-Simulation für Posteingang, Einzel- und Konversationslöschung.
NICHT geprüft: Live-Supabase-SQL-Ausführung / echte Zwei-Nutzer-End-to-End-Tests.
