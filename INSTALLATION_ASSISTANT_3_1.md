# DT-01 Assistant 3.1 – sichtbarer Tageszähler

1. Im Supabase SQL Editor **SUPABASE_ASSISTANT_3_1_ZAEHLER.sql** ausführen (zusätzliche read-only RPC; bestehende Quota bleibt unverändert).
2. Unter Edge Functions > dt01-assistant den aktualisierten Code aus **supabase/functions/dt01-assistant/index.ts** deployen. Vorhandenes GEMINI_API_KEY und GEMINI_MODEL unverändert lassen.
3. Website-Dateien (HTML, JS, CSS und Assets) auf Tracker_test hochladen.
4. Mit Account anmelden, Assistant öffnen: Zähler zeigt X/10. Frage stellen, Zähler sollte um eins steigen; bei 10/10 lokale Hilfe.
5. Tageswechsel ist 00:00 UTC (in Deutschland abhängig von Sommer-/Winterzeit 02:00/01:00).

Hinweis: Die Frontend-Anzeige ist nur informativ. Die serverseitige 10er-Sperre bleibt in dt01_take_ai_quota. Kein SQL löscht Nutzerdaten.
