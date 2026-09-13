# Kraft & Mobility App

Radsportspezifische Kraft- und Mobility-App als Progressive Web App (PWA). Umsetzung
von **Ausbaustufe 1a** gemäß Lastenheft: Übungsbibliothek, manuelle Einheiten-
Zusammenstellung, Zufallsgenerator, Vorlagenverwaltung, Timer mit Tönen und Wake
Lock, Verlauf sowie Speicherung in Google Drive mit Export/Import.

Nicht enthalten (bewusst, siehe Lastenheft Abschnitt 2): eigene Videos (1b),
Freigabe/Kopien/Änderungshinweise (Phase 2).

## Hinweis zur Startbibliothek

Anhang A nennt im Titel "71 Übungen"; die eigene Kategorie-Summentabelle (A.16)
ergibt jedoch 86, und genau 86 Übungen sind in den Abschnitten A.3–A.15 einzeln
aufgeführt. Diese App implementiert die tatsächlich aufgeführten **86 Übungen**
mit je einer eigenen Strichfiguren-Animation — die Kopfzahl "71" ist ein
Rechenfehler der Vorlage, kein bewusstes Auslassen.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Production-Build:

```bash
npm run build
npm run preview
```

App-Icons neu erzeugen (falls `public/icons/favicon.svg` geändert wird):

```bash
npm run gen-icons
```

## Architektur

- **Reines Frontend** (React + TypeScript + Vite), kein eigener Server. Auf dem
  Hosting liegt nur der Programmcode (Lastenheft 3.2/3.3).
- **Datenspeicherung** ausschließlich in Google Drive des Nutzers (Scope
  `drive.file` — die App sieht nur Dateien, die sie selbst angelegt hat), mit
  Konflikterkennung über die Datei-Revision (3.4) und Pflicht-Export/Import als
  Datei (3.7). Ohne konfigurierte Google-Client-ID läuft die App im **lokalen
  Modus** (Daten nur in diesem Browser via `localStorage`), damit sie sich auch
  vor der Google-Cloud-Einrichtung schon benutzen lässt.
- **PWA**: installierbar auf dem Homescreen, Screen Wake Lock während einer
  laufenden Einheit (3.6), keine Offline-Funktion vorgesehen.
- Datenmodell (`src/types.ts`) enthält bereits alle Felder für Video
  (`darstellungsart`, `video_datei`, `video_start_s`, `video_ende_s`) sowie
  `ersteller`/`sichtbarkeit`, damit 1b und Phase 2 ohne Umbau ergänzt werden
  können (in 1a ist `darstellungsart` immer `figur`).

## Google Cloud / OAuth einrichten

Die App braucht eine eigene OAuth-Client-ID, damit sie sich mit dem Google-Konto
des Nutzers verbinden und in dessen Drive schreiben kann.

1. [Google Cloud Console](https://console.cloud.google.com/) → neues Projekt
   anlegen.
2. **APIs & Dienste → Bibliothek**: "Google Drive API" aktivieren.
3. **APIs & Dienste → OAuth-Zustimmungsbildschirm**:
   - Nutzertyp "Extern" (bei einem privaten Google-Konto) oder "Intern" (Google
     Workspace).
   - App-Name, Support-E-Mail eintragen.
   - Scope `.../auth/drive.file` hinzufügen (gilt als nicht sensibel, keine
     Google-Verifizierung nötig für den privaten Gebrauch).
   - **Wichtig (Lastenheft 3.3):** Zustimmungsbildschirm auf **"In Produktion"**
     stellen, nicht auf "Testing" belassen — im Testing-Modus laufen
     Autorisierungen nach 7 Tagen ab und erzwingen eine wöchentliche
     Neuanmeldung.
4. **APIs & Dienste → Anmeldedaten → Anmeldedaten erstellen → OAuth-Client-ID**:
   - Anwendungstyp "Webanwendung".
   - **Autorisierte JavaScript-Quellen**: die HTTPS-URL des Hostings eintragen
     (z. B. `https://<nutzername>.github.io`), für lokale Entwicklung zusätzlich
     `http://localhost:5173`.
   - Es wird **keine** Redirect-URI benötigt (Google Identity Services'
     Token-Client läuft ohne Redirect).
5. Die erzeugte Client-ID (Format `xxxxx.apps.googleusercontent.com`) in der
   App unter **Mehr → Google Drive → Google-OAuth-Client-ID** eintragen und
   anschließend "Mit Google verbinden".

Die Anmeldung erfolgt einmalig pro Gerät; danach erneuert die App das Token bei
Bedarf im Hintergrund, solange die Google-Sitzung im Browser aktiv bleibt.

## Hosting

Statisches Hosting genügt (z. B. GitHub Pages, Cloudflare Pages, Netlify) —
`npm run build` erzeugt den `dist/`-Ordner. **HTTPS ist zwingend** (Voraussetzung
für OAuth, Wake Lock und Homescreen-Installation).

## Mindestversionen

iOS/iPadOS 18.4+ (Screen Wake Lock in installierten Web-Apps), aktuelles Chrome
unter Android (Wake Lock ab Chrome 84).
