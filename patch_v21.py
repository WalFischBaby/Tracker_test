from pathlib import Path
root=Path('/mnt/data/v21')
# Translate navigation and major labels across pages
for fn in ['index.html','droids.html','fusionen.html','ikonen.html','rebirth.html']:
    p=root/fn; s=p.read_text(encoding='utf-8')
    repl={
      'DROID COMMAND // SYSTEM ONLINE':'DROID-ZENTRALE // SYSTEM ONLINE',
      'Droid Archive':'Droiden-Archiv', 'Fusion Lab':'Fusionslabor', 'Icon Vault':'Ikonen-Tresor', 'Rebirth Protocol':'Rebirth-Protokoll',
      'DROID ARCHIVE':'DROIDEN-ARCHIV','FUSION LAB':'FUSIONSLABOR','ICON VAULT':'IKONEN-TRESOR','REBIRTH PROTOCOL':'REBIRTH-PROTOKOLL',
      'COMMANDER STATUS':'SPIELER-STATUS','GALAXY SECURED':'GALAXIE GESICHERT','GALACTIC MASTER':'GALAKTISCHER MEISTER',
      'DROID SCOUT':'DROIDEN-SCOUT','FUSION TECHNICIAN':'FUSIONS-TECHNIKER','GALAXY COLLECTOR':'GALAXIE-SAMMLER','DROID TYCOON':'DROID-TYCOON',
      'SYSTEM ONLINE':'SYSTEM ONLINE','LOCAL SAVE // ACTIVE':'LOKALER SPIELSTAND // AKTIV','ARCHIVE // LIVE':'DATENBANK // LIVE',
      'ARCHIV ÖFFNEN →':'ARCHIV ÖFFNEN →','LABOR BETRETEN →':'LABOR ÖFFNEN →','TRESOR ÖFFNEN →':'TRESOR ÖFFNEN →',
      'MISSION CONTROL':'MISSIONSZENTRALE','GALAXY SCANNER':'GALAXIE-SCANNER','MISSION LOG':'MISSIONSLOG','RECENTLY SECURED':'ZUletzt GESICHERT',
      'BACKUP SYSTEM':'SICHERUNGSSYSTEM','LOCAL SAVE // AUTOMATISCH':'LOKALER SPIELSTAND // AUTOMATISCH',
      'EXPORT SAVE':'SPIELSTAND EXPORTIEREN','RESTORE SAVE':'SPIELSTAND WIEDERHERSTELLEN',
      'SCAN GALAXY...':'GALAXIE DURCHSUCHEN...','SCAN BEREIT // Suche nach Droid, Fusion oder Ikone':'SCAN BEREIT // Suche nach Droid, Fusion oder Ikone',
      'SCAN. COLLECT. FUSE. ASCEND.':'SAMMELN. FUSIONIEREN. AUFSTEIGEN.',
      'SYSTEM SIGNAL':'SYSTEM-SIGNAL','NÄCHSTER MYTHIC DROP':'NÄCHSTER MYTHIC-DROP','NÄCHSTER KYBER DROP':'NÄCHSTER KYBER-DROP','NÄCHSTER STELLAR DROP':'NÄCHSTER STELLAR-DROP',
    }
    for a,b in repl.items(): s=s.replace(a,b)
    p.write_text(s,encoding='utf-8')

p=root/'index.html'; s=p.read_text(encoding='utf-8')
# Replace hero copy and card copy for a more WalFischBaby-specific German voice
s=s.replace('Willkommen zurück, Commander. Die Galaxie wartet nicht – sichere Droiden, perfektioniere Fusionen und öffne den Icon Vault.',
'''Willkommen zurück, Team WalFischBaby. 🐋<br><b>Hier wird gesammelt, fusioniert und abgetaucht.</b><br>Dein persönlicher Droid-Tycoon-Tracker – gebaut für die komplette Jagd auf 100 %.''')
s=s.replace('Dein Archiv erwacht.','Dein WalFischBaby-Fortschritt')
s=s.replace('Jeder Droid hat eine Geschichte. Sichere jede Variante.','Jeder Droid zählt. Hol dir jede Variante und mach dein Archiv komplett.')
s=s.replace('Aus drei Droiden wird etwas, das die Galaxie nicht erwartet.','Drei Droiden rein – eine neue Kreation raus. Entdecke jede Fusion.')
s=s.replace('Nur die seltensten Exemplare schaffen es in diesen Tresor.','Die seltensten Droiden gehören hier hinein. Finde jede Ikone.')
s=s.replace('Wenn alles endet, beginnt die nächste Stufe.','Wenn alles erledigt ist, beginnt der nächste Zyklus.')
s=s.replace('5 CYCLES // REQUIREMENT DATABASE','5 CYCLES // ALLE ANFORDERUNGEN AUF EINEN BLICK')
s=s.replace('<div class="section-kicker">LIVE DROP CONTROL // ZEITPLAN AUTOMATISCH</div><div class="drop-header"><div><h2>⚡ Blueprint Drops</h2><p>Verpasse keinen seltenen Drop. Die Countdown-Uhr folgt automatisch der aktuellen Spielrotation.</p></div>',
'''<div class="section-kicker">LIVE-TIMER // AUTOMATISCHE SPIELZEITEN</div><div class="drop-header"><div><h2>⚡ Seltene Blueprint-Drops</h2><p>Kyber, Mythic und Stellar im Blick – der WalFischBaby-Timer zählt automatisch bis zum nächsten Drop.</p></div>''')
# Add mini events section after drop zone
marker='</section><div class="stats command-cards">'
mini='''</section>
<section class="mini-events-zone">
  <div class="section-kicker">MINI-EVENTS // LIVE-KALENDER</div>
  <div class="mini-events-head"><div><h2>🎉 Die nächsten Mini-Events</h2><p>Dienstag und Donnerstag – inklusive Start-/Endzeit und eigenem Countdown.</p></div><span class="mini-events-note">ZEITZONE: DEIN GERÄT</span></div>
  <div class="mini-events-grid">
    <article class="mini-event-card dj-event" data-mini-event="dienstag">
      <div class="event-art"><div class="event-bubble">🎧</div><div class="event-droid">DJ<br><b>R-3X</b></div><div class="event-eq"><i></i><i></i><i></i><i></i><i></i></div></div>
      <div class="event-info"><div class="event-top"><span class="event-day">DIENSTAG</span><span class="event-live-state">● WARTET</span></div><h3>DJ-R3X Tanzparty</h3><p>Credits, Upgrade-Chips und seltene Blueprints – Zeit für die Party.</p><div class="event-times"><span>☀️ 16:00–19:00</span><span>🌙 21:00–00:00</span></div><strong class="event-countdown">--:--:--</strong><small class="event-next">NÄCHSTER START WIRD BERECHNET</small></div>
    </article>
    <article class="mini-event-card crate-event" data-mini-event="donnerstag">
      <div class="event-art"><div class="event-bubble">📦</div><div class="event-crate">MEGA<br><b>CRATE</b></div><div class="event-spark">✦</div></div>
      <div class="event-info"><div class="event-top"><span class="event-day">DONNERSTAG</span><span class="event-live-state">● WARTET</span></div><h3>Mega-Crate Mini-Event</h3><p>2× Upgrade-Chips und Mega-Crates mit Nova-Kristallen &amp; Stellar-Blueprints.</p><div class="event-times"><span>☀️ 16:00–19:00</span><span>🌙 21:00–00:00</span></div><strong class="event-countdown">--:--:--</strong><small class="event-next">NÄCHSTER START WIRD BERECHNET</small></div>
    </article>
  </div>
  <div class="mini-event-foot">Während des Donnerstag-Events erscheint die Mega-Crate-Schleife zusätzlich alle 30 Minuten.</div>
</section>
<div class="stats command-cards">'''
s=s.replace(marker,mini)
s=s.replace('Droid Command • Fortschritt bleibt lokal','Droid-Zentrale • Fortschritt bleibt lokal')
p.write_text(s,encoding='utf-8')
