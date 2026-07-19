# Wegweiser — Wo finde ich was, und wer macht es

Dieses Dokument beantwortet **eine** Frage in vielen Varianten:
*„Ich will X ändern — wo muss ich hin?"*

Es setzt **nicht** voraus, dass du selbst programmierst. Es macht dich
auskunftsfähig und handlungsfähig: Du weißt, wo etwas liegt, was es tut,
wie eine Änderung live geht und wen du dafür brauchst.

---

## 1. Die vier Orte — mehr gibt es nicht

Alles an dieser Website liegt an genau einem von vier Orten:

| Ort | Was dort lebt | Wer arbeitet dort |
|---|---|---|
| **Sanity** (Studio im Browser) | Inhalte, die sich oft ändern: Filme, Vorstellungen, Events, Säle, Preise, Öffnungszeiten | Kino + du — **ohne Programmierkenntnisse** |
| **Der Code** (GitHub / lokaler Ordner) | Aussehen, Struktur, feste Texte, Rechtstexte, Navigation, Funktionen | Entwickler |
| **Vercel** (Dashboard im Browser) | Hosting, Domain, Geheimnisse (Zugangsdaten), Deploys, Rollback | du — **klickbar, kein Code** |
| **Brevo** (Dashboard im Browser) | Newsletter-Empfänger, E-Mail-Versand, Vorlagen | du / Kino — klickbar |

**Merksatz:** *Inhalt → Sanity. Aussehen → Code. Betrieb → Vercel. E-Mail → Brevo.*

Dazu zwei Dinge, die **nicht** dir gehören: der **Shop**
(shop.kinoweinheim.de, fremdes System, nur verlinkt) und der
**Domain-Registrar** (wo `kinoweinheim.de` registriert ist).

---

## 2. Wie eine Änderung live geht — die vier Wege

Das ist das Wichtigste zum Verstehen. Je nachdem, was du änderst, ist der
Weg ein anderer:

**Weg A — Inhalt (kein Code):**
Sanity-Studio → bearbeiten → **Publish** → automatisch nach ~2 Min live.
*Das kann das Kino selbst, täglich.*

**Weg B — Aussehen/Funktion (Code):**
Entwickler ändert Datei → speichert in Git (*Commit*) → schiebt zu GitHub
(*Push*) → Vercel merkt das und **baut die Seite neu** → nach ~2 Min live.

**Weg C — Neues Eingabefeld in Sanity:**
Braucht **zwei** Schritte: der Entwickler ändert das *Schema* (damit das
Feld im Studio erscheint) **und** die Website (damit das Feld angezeigt
wird). Zwei getrennte Veröffentlichungen.

**Weg D — Zugangsdaten/Einstellungen:**
Vercel → Environment Variables ändern → **danach neu deployen**, sonst
greift die Änderung nicht.

> **Warum überhaupt „bauen"?** Die Website ist *statisch vorgebaut*: Vercel
> erzeugt einmal fertige Seiten, in die die Sanity-Inhalte fest eingebacken
> sind. Deshalb ist sie so schnell — und deshalb muss nach jeder Änderung
> neu gebaut werden. Das passiert automatisch (bei Sanity-Änderungen per
> Signal, zusätzlich jede Nacht um 3 Uhr vorsichtshalber).

---

## 3. Nachschlagetabelle: „Ich will …"

### Inhalte — geht ohne Entwickler (Sanity)

| Ich will … | Wohin | Weg |
|---|---|---|
| Neuen Film mit Vorstellungen anlegen | Sanity → **Filme** | A |
| Vorstellungszeiten ändern | Sanity → Filme → beim Film unten | A |
| Filmplakat austauschen | Sanity → Filme → Plakat | A |
| Event anlegen/ändern (Kaffee-Tee-Kino, Open Air …) | Sanity → **Events** | A |
| Saal-Beschreibung, Saal-Foto, Technik-Angaben | Sanity → **Säle** | A |
| **Eintrittspreise** ändern | Sanity → **Preise & Öffnungszeiten** | A |
| **Öffnungszeiten** ändern | Sanity → Preise & Öffnungszeiten | A |
| Reihenfolge der Säle auf der Seite | Sanity → Säle → Feld „Reihenfolge" | A |

→ Ausführliche Klick-Anleitung dafür: `docs/sanity-anleitung.md`

### Aussehen & Texte — braucht einen Entwickler (Code)

| Ich will … | Liegt in | Weg |
|---|---|---|
| **Markenfarben** ändern (Rot, Gold, Creme …) | `src/styles/global.css`, ganz oben im Block `@theme` | B |
| **Schriftarten** ändern | `src/styles/global.css` (`@theme`) + `package.json` | B |
| **Menüpunkte** im Header ändern/umsortieren | `src/components/Header.astro`, die Liste ganz oben | B |
| Header-Aussehen (Filmstreifen, Logo-Position) | `src/components/Header.astro` | B |
| **Footer**-Links, Adresse, Social-Icons | `src/components/Footer.astro` | B |
| Text auf der **Startseite** | `src/pages/index.astro` | B |
| Text auf **Vermietung / Historie / Kontakt** | `src/pages/vermietung.astro` usw. — Datei heißt wie die Seite | B |
| **Impressum / Datenschutz / Barrierefreiheit** | `src/pages/impressum.astro`, `datenschutz.astro`, `barrierefreiheit.astro` | B |
| **Neue Seite** anlegen (z. B. `/gutscheine`) | Neue Datei in `src/pages/` — Dateiname = Adresse | B |
| **Hintergrundbild** (Foyer im Kopfbereich) | `src/assets/hero/` | B |
| **Logos** (Modernes Theater, Rautenschild) | `public/logos/` | B |
| **Google-Text** einer Seite (Suchergebnis-Beschreibung) | Oben in der jeweiligen Seitendatei bei `description=` | B |
| Neues Eingabefeld im Sanity-Studio | `studio/schemaTypes/` **und** Website | C |

**Faustregel für Texte:** Wenn ein Text *überall gleich* ist (Impressum,
Vermietungs-Erklärung), steht er im Code. Wenn er *sich regelmäßig ändert*
(Filme, Preise), gehört er nach Sanity. Falls dich ein Code-Text oft
stört: Er kann nach Sanity umgezogen werden — das ist eine bewusste
Entscheidung, kein Naturgesetz.

### Betrieb — kannst du selbst, im Browser (Vercel)

| Ich will … | Wohin | Weg |
|---|---|---|
| **Kaputte Seite sofort reparieren** | Vercel → Deployments → letztes funktionierendes → „Promote to Production" | sofort |
| Sehen, ob ein Deploy geklappt hat | Vercel → Deployments (grün = ok, rot = Fehler) | — |
| Sehen, **warum** ein Deploy fehlschlug | Vercel → das rote Deployment anklicken → Build-Log | — |
| **Empfänger** der Vermietungsanfragen ändern | Vercel → Settings → Environment Variables → `BREVO_VERMIETUNG_TO` | D |
| **Domain** eintragen/ändern | Vercel → Settings → Domains (+ DNS beim Registrar) | D |
| Nächtlichen Auto-Neubau ändern | Code: `vercel.json` | B |

### E-Mail — im Brevo-Dashboard

| Ich will … | Wohin |
|---|---|
| Newsletter-Empfänger sehen/exportieren | Brevo → Contacts → Liste |
| Newsletter verschicken | Brevo → Campaigns |
| Bestätigungsmail (Anmeldung) ändern | Brevo → Formular-Assistent ⚠️ |
| Absenderadresse verifizieren | Brevo → Senders & Domains |

> ⚠️ **Bekannte Falle:** Die Double-Opt-In-Vorlage lässt sich **nur** über
> den Formular-Assistenten anlegen, nicht über „Templates". Hat uns drei
> Stunden gekostet — dokumentiert in `docs/brevo-setup.md`.

---

## 4. Der Projektordner, erklärt

`C:\My Web Sites\modernes-theater-neu`

```
src/                    ← Hier lebt die Website
  pages/                ← Eine Datei = eine Seite. Dateiname = Adresse.
    index.astro         ← Startseite
    programm.astro      ← /programm
    programm/[slug]     ← Detailseite je Film (eckige Klammern = „für jeden")
    api/                ← Formular-Empfang (Newsletter, Vermietung)
  components/           ← Bausteine, die auf mehreren Seiten vorkommen
    Header.astro        ← Kopfbereich mit Navigation
    Footer.astro        ← Fußbereich
  layouts/
    Layout.astro        ← Der gemeinsame Rahmen ALLER Seiten (Google-Infos)
  styles/
    global.css          ← Farben, Schriften, seitenweite Regeln
  lib/
    sanity.ts           ← Die Brücke zu den Inhalten aus Sanity
  assets/               ← Bilder, die die Website verkleinert/optimiert

studio/                 ← EIGENES Projekt: das Sanity-Eingabesystem
  schemaTypes/          ← Welche Felder es zum Ausfüllen gibt

public/                 ← Dateien, die unverändert ausgeliefert werden
  logos/                ← Logos
  robots.txt            ← Anweisung für Suchmaschinen

docs/                   ← Anleitungen (dieses Dokument, Sanity, Brevo, Recht)
LAUNCH-CHECKLIST.md     ← Alle offenen Punkte bis zur Live-Schaltung
vercel.json             ← Sicherheits-Einstellungen + nächtlicher Neubau
package.json            ← Liste der verwendeten Bausteine
```

**Was du getrost ignorieren kannst:** `node_modules` (heruntergeladene
Hilfsprogramme), `dist` (das Bauergebnis), `.astro`, `package-lock.json`.
Nichts davon wird von Hand angefasst.

---

## 5. Was du selbst kannst — und wofür du jemanden brauchst

**Ohne Hilfe, jederzeit:**
- Alle Inhalte pflegen (Sanity)
- Prüfen, ob ein Deploy lief oder scheiterte (Vercel)
- **Eine kaputte Live-Seite sofort zurückrollen** (Vercel, 3 Klicks) —
  das ist dein wichtigster Notfallknopf
- Zugangsdaten/Empfängeradressen ändern (Vercel Env-Vars)
- Newsletter verschicken, Empfänger verwalten (Brevo)
- Domain-Einstellungen (Vercel + Registrar)

**Dafür brauchst du einen Entwickler:**
- Alles, was Aussehen, Layout oder Funktion betrifft
- Neue Seiten oder neue Eingabefelder
- Feste Texte im Code ändern
- Fehlerursachen beheben (Rollback verschafft nur Zeit)
- Regelmäßige Updates der Bausteine (~1× jährlich)

---

## 6. Vokabeln, damit du mitreden kannst

| Wort | Heißt schlicht |
|---|---|
| **Repository / Repo** | Der Projektordner samt kompletter Änderungshistorie |
| **Commit** | Ein gespeicherter Änderungsstand mit Beschreibung |
| **Push** | Änderungen zu GitHub hochladen — löst den Neubau aus |
| **Deploy / Deployment** | Eine veröffentlichte Version der Website |
| **Build** | Der Vorgang, der aus dem Code fertige Seiten macht |
| **Rollback** | Zurück auf eine frühere, funktionierende Version |
| **Framework (Astro)** | Das Baukastensystem, mit dem die Seite gebaut ist |
| **CMS (Sanity)** | Das Redaktionssystem für Inhalte |
| **Schema** | Die Definition, welche Felder es in Sanity gibt |
| **GROQ** | Die Sprache, in der die Website Sanity nach Daten fragt |
| **Env-Var** | Ein Geheimnis (Passwort/Schlüssel), das nie im Code steht |
| **API-Route** | Kleines Programm auf dem Server — hier: Formular-Empfang |
| **DNS** | Das Telefonbuch des Internets: Domain → Server |
| **DOI (Double-Opt-In)** | Pflicht-Bestätigungsmail bei Newsletter-Anmeldung |
| **Statisch** | Seiten sind vorgebaut statt bei jedem Aufruf berechnet |

---

## 7. Wenn dich jemand fragt — Kurzantworten

- **„Warum ist die Seite so schnell?"** Sie ist vorgebaut, holt beim Besuch
  keine Daten und lädt fast kein JavaScript.
- **„Können wir Inhalte selbst pflegen?"** Ja, im Browser über Sanity —
  Filme, Events, Säle, Preise, Öffnungszeiten. Nach ~2 Minuten live.
- **„Was kostet der Betrieb?"** Vercel Pro ~20 $/Monat, Sanity kostenlos
  (bei Bedarf 15 $/Platz), Brevo je nach Kontaktzahl, Domain ~15 €/Jahr.
- **„Und wenn du nicht mehr kannst?"** Alles Standard-Technik ohne
  Sonderlocken — jede Agentur kann übernehmen, kein Anbieter-Lock-in.
- **„Ist das datenschutzkonform?"** Kein Tracking, keine Cookies, Schriften
  lokal, Karten erst nach Klick. Verträge mit den Dienstleistern nötig
  (siehe `docs/rechtliches-vorbereitung.md`).
- **„Warum keine Online-Tickets?"** Bewusst nicht — Reservierung läuft
  telefonisch und an der Kasse. Nachrüstbar.

---

## 8. Notfall

**Die Live-Seite ist kaputt:**
Vercel → Projekt → *Deployments* → letztes grünes Deployment →
**„Promote to Production"**. Nach ~30 Sekunden ist der alte Stand wieder
da. Danach in Ruhe die Ursache suchen lassen.

**Eine Sanity-Änderung erscheint nicht:**
Ist sie wirklich *published* (nicht nur gespeichert)? Sonst in Vercel ein
Deployment von Hand auslösen („Redeploy").

**Ein Formular meldet einen Fehler:**
Meist fehlen Zugangsdaten. Vercel → Environment Variables prüfen, danach
neu deployen.

---

## Adressen

| Was | Wo |
|---|---|
| Live-Website | https://modernes-theater-weinheim.vercel.app |
| Sanity-Studio | https://kinoweinheim.sanity.studio |
| Vercel-Dashboard | https://vercel.com/henrik-dubiel1/modernes-theater-weinheim |
| Code | https://github.com/henrik-webprojekte/modernes-theater-weinheim |
| Projektordner | `C:\My Web Sites\modernes-theater-neu` |

**Weitere Anleitungen:** `docs/sanity-anleitung.md` (Content-Pflege),
`docs/brevo-setup.md` (E-Mail), `docs/rechtliches-vorbereitung.md`,
`LAUNCH-CHECKLIST.md` (offene Punkte bis Go-Live).

---

*Stand: 16.07.2026*
