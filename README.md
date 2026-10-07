# Droid Tycoon Tracker V2.1 RC3 — Cloud Release Layer

Basis: bestätigte RC2/M6 Item-Sync-Engine.

Neu in RC3:
- V2.1 Willkommens-/Cloud-Einrichtungsdialog
- verständliche Datenschutz-/Speichererklärung
- Passwort-Reset bleibt integriert
- Cloud-Daten separat löschbar
- vollständige Kontolöschung über Supabase Edge Function `delete-account` mit zweistufiger Bestätigung
- lokale Tracker-Daten bleiben bei Kontolöschung standardmäßig erhalten
- RC3-Versionierung/Politur

Wichtig: Die bestätigte Item-Sync-/Offline-Queue-Architektur wurde nicht grundlegend verändert.

V2.1 RELEASE CANDIDATE
- Release-tauglicher V2.0→V2.1 Upgrade-Assistent mit lokaler Bestandsanzeige.
- Cloud-Konto bleibt optional; lokaler Betrieb bleibt vollständig möglich.
- Datenschutz-/Cloud-Erklärung in der Account-Zentrale.
- Release-Oberfläche ohne sichtbare RC4-Entwicklerlabels.
- Sync-Engine basiert unverändert auf dem bestätigten Item-Sync + Offline-Pending-Queue.

## V2.1 FINAL – GitHub Pages Hinweise
- Alle internen Seiten-/Asset-Pfade sind repository-relativ (`./...`).
- CSS/JS erhalten `?v=2.1-final`, damit GitHub/CDN/Browser keine alte Oberfläche aus dem Cache anzeigen.
- Globale Dark-Control-Regel: keine hellen Aktionsbuttons mehr.
- Responsive Hardening: Desktop-Rail wird auf kleineren Viewports entfernt; mobile Bottom-Navigation übernimmt.
- Für GitHub Pages den INHALT dieses Ordners in den veröffentlichten Branch/Ordner kopieren, sodass `index.html` direkt im Pages-Root des Repositories liegt.


V2.1 FINAL + Discord OAuth: Discord ist als zusätzliche optionale Login-Methode integriert.

V2.1 FINAL + Google OAuth: Google ist zusätzlich zu Discord und E-Mail/Passwort als optionale Login-Methode integriert.
