# Master-Prompt für Übungsvideos

**So benutzt du ihn:** Für jede Übung gibt es ein Datenblatt mit VIDEO-TYP ÜBUNG (ganze Übung) oder SATZ (ein Kraftsatz). Alles ab „PROMPT BEGINNT“ bis „PROMPT ENDET“ kopieren und das Datenblatt **einer** Übung aus `video-datenblaetter.md` an der markierten Stelle einfügen. Ein Video pro Durchgang. Die Stilvorlage `public/videos/armkreisen-coach-60s.mp4` mitgeben, falls das Tool Anhänge annimmt.

Einmalig ausfüllen: die Zeile **Stimme** (Name/ID der Stimme aus dem Armkreisen-Video), damit alle Videos gleich klingen.

---

PROMPT BEGINNT

Du erstellst ein animiertes Anleitungsvideo für eine Übung einer Trainings-App für Radsportler. Das Video läuft in der App synchron zum Timer der Übung: Bild und Ton müssen deshalb sekundengenau zum Zeitplan im Datenblatt unten passen. Alle Videos der Reihe müssen identisch aussehen und klingen. Wenn du eine Vorgabe nicht eindeutig umsetzen kannst, frag nach, statt zu raten.

## 1. Technische Vorgaben (verbindlich)

- Format: MP4, **720 × 1280 px Hochformat (9:16)**, **30 fps konstant**
- Video: H.264 High Profile, yuv420p, CRF-Encoding (z. B. x264 CRF 28, preset slow), **Videobitrate höchstens 500 kbit/s**
- Audio: AAC-LC, **mono**, 44,1 kHz, 64 kbit/s; Lautheit −16 LUFS integriert, Spitzen max. −1 dBTP
- **„faststart“** (moov-Atom am Dateianfang, z. B. `-movflags +faststart`), sonst startet die Wiedergabe am iPhone verzögert
- **Länge exakt = GESAMTDAUER aus dem Datenblatt** (Toleranz ±1 Frame)
- Die ersten 0,1 s des Tons sind still
- Dateiname wie im Datenblatt angegeben

## 2. Zeitplan (verbindlich)

- Der Zeitplan im Datenblatt ist genau das, was der Timer der App abspielt. Jede Phase im Video beginnt und endet **auf die Sekunde** wie dort angegeben.
- **ARBEIT**: Die Figur führt die Übung aus, durchgehend bis zum Phasenende.
- **PAUSE**: Die Figur führt die Übung **nicht** aus. Sie steht/liegt entspannt, atmet sichtbar ruhig und nimmt in den letzten ~2 s die Ausgangsposition für die nächste Arbeitsphase ein.
- **WECHSEL** (Seitenwechsel bei einseitigen Übungen): Die Figur wechselt in die Ausgangsposition der anderen Seite.
- Die App hat **keine Vorbereitungszeit** vor der ersten Arbeitsphase. Deshalb gehören Titel und Aufstell-Anweisung in die **ersten höchstens 5 s der ersten ARBEIT-Phase**; danach „Los!“ und Bewegung. Kein Countdown im Intro.
- Wiederholungs-Zähler und Bewegungstempo so wählen, dass die letzte Wiederholung **genau mit dem Phasenende** fertig ist.

### Zusatzregeln für VIDEO-TYP SATZ

Das Datenblatt nennt den Video-Typ. Bei **SATZ** zeigt das Video genau **einen** Kraftsatz. Die App startet es bei jedem Satz neu (2–4 Sätze je nach Einheit) und spielt in jeder Timer-Phase den passenden Abschnitt.

- Keine Satznummern im Video („Satz 2/3“ o. Ä.), weil die Anzahl variiert. Schlagzeile in der Arbeitsphase: „Linke Seite“ / „Rechte Seite“ (einseitig) bzw. „Los geht’s“ (beidseitig).
- Intro: nur **ein** kurzer Aufstell-Satz in den ersten höchstens 4 s, dann „Los!“. Er wird bei jedem Satz wiederholt, deshalb knapp halten. Kein Titelbild.
- Zähler: Wiederholungen „n / N“ pro Seite. N als feste ganze Zahl aus der Wiederholungsvorgabe im Datenblatt wählen (z. B. „ca. 8–12 Wdh.“ → 10), kontrolliertes Tempo, letzte Wiederholung endet mit der Phase. Bei „Pause unten“-Übungen die Pause im Bewegungsablauf sichtbar halten.
- Equipment (Hantel, Bank, Stufe …) flach und gut erkennbar, in Farbe #8C84B8.
- **Pausen-Abschluss (letzte 4 s):** Figur legt ab bzw. richtet sich auf und steht ruhig. Schlagzeile „Satzpause“ (Amber), Zähler zeigt den Endstand gedimmt, Ansage „Satz geschafft. Pause.“. **Das letzte Bild bleibt während der gesamten Satzpause (bis zu 70 s) stehen**: ruhige Haltung, keine Bewegungsspuren, kein Konfetti, kein „Sauber gemacht!“, kein Countdown.

## 3. Bildaufbau (feste Zonen, 720 × 1280 px)

Elemente dürfen sich **nicht überlappen**. Insbesondere müssen Füße und Bodenring der Figur vollständig oberhalb des Zählers bleiben.

| Zone | y-Bereich | Inhalt |
|---|---|---|
| Fortschrittsbalken | 24–32 | volle Breite mit 28 px Rand links/rechts, abgerundet; Spur #2E2D3C, Füllung in Phasenfarbe, wächst linear über die gesamte Videodauer |
| Kopfzeile | 44–110 | links (x = 28): Übungsname, fett-kursiv, weiß, 30 px; darunter Kategorie, 18 px, #9C98B8 |
| Schlagzeile | 140–240 | zentriert, fett-kursiv, 72 px (bei langen Wörtern verkleinern, nie umbrechen), Phasenfarbe |
| Figur | 260–1040 | zentriert; Bodenring unterhalb der Füße endet spätestens bei y = 1040 |
| Zähler | 1060–1150 | zentriert: große Zahl (64 px, fett-kursiv, Phasenfarbe), daneben „/ N“ (32 px, #9C98B8), darunter Einheit (16 px, #9C98B8, z. B. „Kreise“, „Wdh.“, „Sekunden“) |
| Untertitel | 1170–1260 | zentriert, weiß, 26 px, auf dunkler halbtransparenter Box (#000000 bei 45 %, Radius 8 px), max. 2 Zeilen à ca. 38 Zeichen |

Der Titel im Intro ersetzt Kopfzeile und Schlagzeile: Übungsname groß (72 px, weiß, fett-kursiv) bei y ≈ 140–240, darunter eine kurze Zeile (22 px, #C9C5E0), z. B. „2 Richtungen, je 15 Kreise“.

## 4. Farben

| Zweck | Farbe |
|---|---|
| Hintergrund-Verlauf | #0A081E (oben) → #150B28 (unten) |
| Arbeit (Standard, linke Seite, erste Richtung) | Cyan #2CCED5 |
| Arbeit (rechte Seite, zweite Richtung/Variante) | Pink #E94F7C |
| Intro, Pause, Wechsel, Countdown, Abschluss | Amber #E8B038 |
| Figur: Körper | #EDEBF5 |
| Figur: Hose | #453D77 |
| Figur: Füße | #3B3467 |
| Equipment | flach, #8C84B8, nie heller als die Figur |
| Nebentexte | #9C98B8 |

## 5. Figur

- Flache, solide Figur ohne Gesicht: runder Kopf, kurzer Hals, Rumpf als Trapez (Schultern breiter als Hüfte), Gliedmaßen als Kapseln mit runden Enden, kurze Hose, ovale Füße. In allen Videos **dieselben Proportionen und Strichstärken**.
- Bewegung anatomisch korrekt und flüssig (Gelenke drehen um Schulter/Hüfte/Knie, keine gummiartigen Verformungen).
- Bewegte Hände/Füße: weiches Leuchten in Phasenfarbe und eine kurz nachlaufende, ausblendende Bewegungsspur. Wo hilfreich, eine gepunktete Führungslinie der Bewegungsbahn in Phasenfarbe (40 % Deckkraft).
- Unter den Füßen ein flacher elliptischer Bodenring in Phasenfarbe mit dunkler Innenfläche.
- Blickrichtung: frontal; bei Übungen, die von der Seite besser verständlich sind (Liegen, Hüftbeugung, Ausfallschritt), seitlich. **Rechte Seite = gespiegelte linke Seite.**
- Bodenübungen: die Figur liegt auf einer dezenten Bodenlinie (#2E2D3C) im unteren Bereich der Figur-Zone.

## 6. Hintergrund und Effekte

- Senkrechter Verlauf (siehe Farben), darüber langsam schwebende, unscharfe Lichtpunkte (Bokeh, 10–25 % Deckkraft, ruhig, nicht ablenkend).
- Hinter der Figur ein weicher radialer Lichtschein in Phasenfarbe (ca. 35 % Deckkraft), der beim Phasenwechsel in ~0,5 s in die neue Farbe überblendet.
- Leichter Kamera-Zoom (ca. 8 %) auf die Figur beim Start der ersten Arbeitsphase, danach ruhige Kamera.
- Schrift: eine kräftige, kursive serifenlose Schrift (z. B. DejaVu Sans Bold Oblique) für Titel, Schlagzeilen und Zähler, dieselbe Familie normal für Untertitel und Nebentexte. In allen Videos gleich.

## 7. Gestaltung je Phase

**Intro (VIDEO-TYP ÜBUNG, erste ≤ 5 s der ersten ARBEIT; für SATZ siehe Abschnitt 2):** Titelbild (siehe Zone 3), Figur in Ausgangsposition, Sprecher sagt die Aufstell-Anweisung. Dann Schlagzeile „Los!“ (Cyan, ~1 s), Kopfzeile erscheint, Bewegung beginnt.

**ARBEIT:** Schlagzeile = kurzes Aktionswort für das, was gerade passiert, z. B. „Vorwärts“, „Rückwärts“, „Halten“, „Anspannen“, „Linke Seite“, „Rechte Seite“. Zähler:
- Bewegungsübungen: abgeschlossene Wiederholungen „n / N“, Einheit passend („Kreise“, „Wdh.“, „Schritte“, „Sprünge“)
- Halteübungen: verbleibende Sekunden der Phase, Einheit „Sekunden“
- Kontraktionen (Isometrie): „Kontraktion n / N“ als Schlagzeile, im Zähler verbleibende Sekunden

**PAUSE:** Schlagzeile „Pause“, oder die Ansage für den Übergang, wenn sich danach etwas ändert (z. B. „Richtungswechsel“). Zähler zeigt den Endstand der vorherigen Arbeitsphase gedimmt. In den letzten 3 s eine **stumme** visuelle Zahl 3 – 2 – 1 (Amber) in der Schlagzeilen-Zone.

**WECHSEL:** Schlagzeile „Seitenwechsel“ (Amber), Figur wechselt sichtbar die Seite. In den letzten 3 s stumm 3 – 2 – 1.

**Abschluss (nur VIDEO-TYP ÜBUNG; für SATZ siehe Abschnitt 2):**
- Ist die letzte Phase eine PAUSE: Schlagzeile „Locker lassen“ (weiß), in den letzten 4 s „Sauber gemacht!“ (Amber) mit Konfetti in Cyan/Pink/Amber/Weiß und einem Amber-Kreis mit dunklem Haken in der Zähler-Zone.
- Ist die letzte Phase eine ARBEIT: Bewegung läuft bis zum Ende; nur in den letzten 2 s erscheint „Sauber gemacht!“ mit Konfetti.

## 8. Ton und Sprache

- **Stimme:** [HIER NAME/ID DER STIMME AUS DEM ARMKREISEN-VIDEO EINTRAGEN] — für alle Videos dieselbe Stimme, dieselben Einstellungen.
- Deutsch, Du-Form, ruhiger, motivierender Coach-Ton, kurze Sätze.
- **Keine Musik, keine Piep- oder Signaltöne.** Die App spielt selbst Countdown-Pieptöne in den letzten 3 s jeder Phase und einen Startton zu Phasenbeginn.
- Inhalt der Ansagen aus den Technik-Hinweisen und der Ausführung im Datenblatt, nichts erfinden, was dem widerspricht:
  - Intro: Aufstell-Anweisung (1 Satz) und „Los!“
  - ARBEIT: 1–2 Technik-Hinweise, über die Phase verteilt; bei langen Phasen (> 30 s) ein dritter kurzer Motivationssatz erlaubt
  - PAUSE: „Pause, locker lassen.“ plus Vorschau auf das, was als Nächstes kommt
  - WECHSEL: „Seitenwechsel – jetzt die rechte Seite.“
  - Abschluss: VIDEO-TYP ÜBUNG ohne Ansage („Sauber gemacht!“ wird nur eingeblendet, nicht gesprochen); VIDEO-TYP SATZ „Satz geschafft. Pause.“
- **Timing:** Jede Ansage liegt vollständig innerhalb ihrer Phase, beginnt frühestens 0,3 s nach Phasenbeginn (Intro: 0,1 s) und endet spätestens 3 s vor Phasenende (dort piept die App). Ausnahme: „Los!“.
- **Kurze Phasen (≤ 6 s):** höchstens ein Wort oder ein ganz kurzer Satz („Pause.“, „Locker.“), sonst keine Ansage. Lieber weglassen als in die Pieptöne hineinsprechen.
- Untertitel zeigen exakt den gesprochenen Text, synchron, bis 0,3 s nach Satzende.

## 9. Lieferung

1. Die Videodatei (Dateiname laut Datenblatt).
2. Eine Zeitliste als Tabelle: Zeit von–bis | Phase laut Datenblatt | Schlagzeile | Zähler | gesprochener Text. Damit lässt sich die Synchronität prüfen.

## 10. Selbstkontrolle vor der Abgabe

- [ ] Länge exakt GESAMTDAUER, 720 × 1280, 30 fps, H.264 + AAC mono, faststart
- [ ] Jede Phasengrenze im Video liegt auf der Sekunde aus dem Zeitplan
- [ ] In PAUSE-Phasen führt die Figur die Übung nicht aus
- [ ] Keine Überlappung von Figur, Zähler und Untertiteln
- [ ] Keine Ansage in den letzten 3 s einer Phase (außer „Los!“); „Sauber gemacht!“ nicht gesprochen
- [ ] Keine Musik, keine Pieptöne
- [ ] Nur SATZ: keine Satznummern, letztes Bild ist eine ruhige Pausenhaltung ohne Effekte
- [ ] Farben, Schrift, Figur und Stimme wie vorgegeben

## Datenblatt der Übung

[HIER DAS DATENBLATT AUS video-datenblaetter.md EINFÜGEN]

PROMPT ENDET
