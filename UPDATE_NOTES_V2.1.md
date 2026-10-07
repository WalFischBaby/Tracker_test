# Droid Tycoon Tracker V2.1 — Cloud Update

## Highlights

V2.1 erweitert den Droid Tycoon Tracker um optionalen Cloud Sync und ein eigenes Tracker-Konto. Der Tracker bleibt weiterhin auch komplett lokal nutzbar.

### Cloud Sync
- Fortschritt optional online speichern
- Fortschritt auf mehreren Geräten und Browsern nutzen
- Automatische Synchronisierung
- Gleichzeitige Änderungen auf verschiedenen Geräten werden item-basiert zusammengeführt
- Offline weitermachen; Änderungen werden nach Wiederherstellung der Verbindung synchronisiert
- Lokaler Fortschritt bleibt als Offline-Fallback erhalten

### Tracker-Konto
- Registrierung per E-Mail
- Login direkt beim Start
- Passwort zurücksetzen
- Account-/Cloud-Zentrale
- Konto und Cloud-Daten können wieder gelöscht werden
- Cloud Sync bleibt freiwillig

### Upgrade von V2.0
- Vorhandene lokale Daten werden erkannt
- Lokaler Fortschritt kann beim Einrichten von Cloud Sync übernommen werden
- Droiden, Fusionen, Ikonen und Favoriten werden einzeln synchronisiert

### Oberfläche & Stabilität
- Überarbeitete Login- und Cloud-Oberfläche im DT-01-Terminal-Look
- Dunklere, kontrastreichere Buttons
- Optimierte Dialoge und mobile Darstellung
- Verbesserte GitHub-Pages-Kompatibilität
- Core-Daten und Tracker-Logik robuster gebündelt
- Verständlichere Status- und Fehlermeldungen

### Datenschutz
Cloud Sync speichert nur die für das Tracker-Konto und den Tracker-Fortschritt benötigten Daten. Ein Konto ist nicht erforderlich; der Tracker kann weiterhin ausschließlich lokal genutzt werden.

---

Droid Tycoon Tracker V2.1
Created by WalFischBaby


## Discord Login
- Optionaler Login mit Discord über Supabase OAuth.
- E-Mail/Passwort bleibt weiterhin verfügbar.
- Discord-Login verwendet dieselbe Cloud-Sync- und Offline-Logik.

## Google Login
- Optionaler Login mit Google über Supabase OAuth.
- Google steht zusätzlich zu Discord und E-Mail/Passwort zur Verfügung.
- Nach der Anmeldung verwendet Google dieselbe Cloud-Sync-, Migrations- und Offline-Logik.
- Es werden keine zusätzlichen Google-Dienste wie Gmail oder Google Drive angefordert.
