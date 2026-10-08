# DT-01 Assistant 3.0 – Gemini Testinstallation

1. Im Supabase SQL Editor `SUPABASE_ASSISTANT_3_0.sql` ausführen.
2. In Google AI Studio einen Gemini API-Schlüssel erstellen; kostenlose Stufe/Quota prüfen. KEINE kostenpflichtige Abrechnung aktivieren, wenn strikt 0 € gewünscht.
3. In Supabase → Edge Functions → Secrets `GEMINI_API_KEY` setzen. Optional `GEMINI_MODEL=gemini-2.5-flash-lite`. **Nie in GitHub oder HTML eintragen.**
4. Supabase CLI: `supabase login`, `supabase link --project-ref mmitxiaidgvifxzqqrae`, `supabase functions deploy dt01-assistant` im Verzeichnis dieses ZIP (oder Funktion im Dashboard anlegen und index.ts einfügen). JWT-Prüfung in der Funktion ist aktiv; bei älteren Supabase-Keys ggf. in Edge Function Settings die automatische JWT-Verifizierung ausschalten, da die Funktion `auth.getUser(token)` selbst sicher prüft.
5. Die Dateien des ZIP ohne den Ordner `supabase/` auf GitHub Pages `Tracker_test` hochladen (supabase-Ordner darf im Repo liegen, wird nicht vom Browser ausgeführt). Test als eingeloggter Nutzer.

Sicherheit: 10 Anfragen pro angemeldetem Nutzer pro UTC-Tag per atomarer SQL-RPC; keine Datenbankänderung an Fortschritt oder Profil. Der Browser sendet für Antworten nur Fortschrittsprozente und bis zu 12 offene Ziele an Gemini; keine E-Mail. Die öffentliche App übermittelt Daten an Google – Datenschutzhinweis vor Livebetrieb ergänzen. Kein Garant für dauerhaft kostenlose Nutzung: Gratis-Kontingente/Verfügbarkeit ändern sich. Bei Fehlern greift die lokale Assistant-2.0-Antwort.
