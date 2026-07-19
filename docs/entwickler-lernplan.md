# Entwickler-Lernplan — Modernes Theater Weinheim

Ziel: **Vollständige Selbstständigkeit.** Du kannst jede Änderung an der
Website allein umsetzen, jeden Fehler allein beheben und jede Frage zur
Technik beantworten.

Lernstoff ist ausschließlich **dieses Projekt** — keine Tutorial-Apps.
Jedes Modul endet mit einer Übung an der echten Website.

**Legende:** 🔴 Blocker (ohne das geht nichts) · 🟡 Wichtig · 🟢 Vertiefung

---

## Der Stack in einem Bild

```
   DU
    │  Code ändern (VS Code)
    ▼
 ┌────────────────┐   git push    ┌──────────────┐
 │  Lokales Repo  │ ────────────► │   GitHub     │  (Code-Archiv, Historie)
 │  C:\My Web...  │               └──────┬───────┘
 └────────────────┘                      │ Webhook „neuer Commit"
    │ npm run dev                        ▼
    │ (localhost:4321)             ┌──────────────┐
    └─ zum Testen                  │   Vercel     │  baut + hostet
                                   └──────┬───────┘
                                          │
                      ┌───────────────────┼───────────────────┐
                      ▼                   ▼                   ▼
              ┌──────────────┐   ┌─────────────────┐  ┌─────────────┐
              │   Sanity     │   │  Live-Website   │  │   Brevo     │
              │ (Inhalte:    │──►│ modernes-...    │◄─│ (Newsletter │
              │ Filme,Events)│   │ .vercel.app     │  │ + Formular) │
              └──────┬───────┘   └─────────────────┘  └─────────────┘
                     │ Webhook „Inhalt geändert" → Vercel baut neu
                     └────────────────────────────────────────┘
```

**Der wichtigste Satz zum Verstehen:** Die Website ist **statisch
vorgebaut**. Vercel erzeugt bei jedem Build fertige HTML-Dateien, in die
die Sanity-Inhalte bereits eingebacken sind. Deshalb ist sie schnell —
und deshalb muss nach jeder Sanity-Änderung neu gebaut werden (das macht
der Webhook automatisch). Ausnahme: die drei API-Routen unter
`/src/pages/api/`, die laufen live bei jedem Aufruf.

---

## Modul 1 🔴 — Terminal & Git (6–8 h)

**Warum zuerst:** Ohne Git kannst du nichts sichern, nichts rückgängig
machen, nichts veröffentlichen. Git ist das Sicherheitsnetz, das dir
erlaubt, mutig zu experimentieren.

### Lernziele
- PowerShell/Bash: navigieren (`cd`, `ls`), Pfade verstehen
- Git-Grundmodell: Arbeitsverzeichnis → Staging → Commit → Push
- `git status` lesen und verstehen, was er dir sagt
- Änderungen ansehen (`git diff`), committen, pushen
- **Rückgängig machen**: letzte Änderung verwerfen, Commit zurücknehmen
  (`git revert`), zu altem Stand zurück (`git checkout`)
- Historie lesen (`git log`), verstehen wer wann was geändert hat

### Die Befehle, die du täglich brauchst
```bash
cd "C:\My Web Sites\modernes-theater-neu"   # ins Projekt wechseln
git status                                   # Was habe ich geändert?
git diff                                     # Was genau?
git add .                                    # Änderungen vormerken
git commit -m "Beschreibung"                 # Sichern (lokal)
git push                                     # Zu GitHub → löst Deploy aus
git log --oneline -10                        # Letzte 10 Commits
git revert <commit-id>                       # Commit rückgängig (sicher!)
```

### Übung
1. Ändere einen Text auf der Kontakt-Seite (z. B. eine Überschrift)
2. `git status` + `git diff` — verstehe die Ausgabe Zeile für Zeile
3. Commit + Push, warte auf den Vercel-Deploy, prüfe live
4. Mache es mit `git revert` wieder rückgängig und pushe erneut

### Ressourcen
- Git-Buch (kostenlos, deutsch): https://git-scm.com/book/de/v2 — Kapitel 1–3
- Interaktiv: https://learngitbranching.js.org/?locale=de_DE

---

## Modul 2 🔴 — Das Projekt lokal betreiben (3–4 h)

### Lernziele
- Warum `npm`/`node` bei dir nicht im PATH sind und wie du das löst
- Dev-Server starten und die Live-Vorschau nutzen
- Produktions-Build lokal testen (findet Fehler, die der Dev-Server nicht zeigt)
- `package.json` lesen: was sind Dependencies, was sind Scripts
- Was `node_modules` ist (und warum es nicht ins Git gehört)

### Die Befehle
```powershell
# PATH-Problem umgehen (in PowerShell, einmal pro Sitzung):
$env:Path = "C:\Program Files\nodejs;$env:Path"

npm install        # Abhängigkeiten installieren (nach frischem Clone)
npm run dev        # Dev-Server auf localhost:4321
npm run build      # Produktions-Build — MUSS vor jedem Push fehlerfrei sein
npm run preview    # Gebaute Version lokal ansehen
```

### Übung
- Starte den Dev-Server, ändere einen Text, beobachte den Hot-Reload
- Lasse `npm run build` durchlaufen, finde im Output die Anzahl gebauter
  Seiten und die Sitemap
- Baue absichtlich einen Fehler ein (z. B. `</div>` löschen) und lies die
  Fehlermeldung — **Fehlermeldungen lesen ist die wichtigste Fähigkeit**

---

## Modul 3 🔴 — HTML, CSS, JavaScript: nur das Nötige (10–15 h)

Du musst kein JS-Experte werden. Du musst Code **lesen** und gezielt
**anpassen** können.

### HTML (3 h)
- Tags, Attribute, Verschachtelung
- Semantik: `<header> <main> <section> <article> <nav> <footer>`
- Barrierefreiheit-Basics: `alt`, `aria-label`, Überschriften-Hierarchie
  (h1 → h2 → h3, keine Sprünge)
- Warum das bei euch wichtig ist: siehe `/barrierefreiheit`

### CSS (5 h)
- Selektoren, Kaskade, Spezifität (**das erklärt 90 % aller „warum greift
  mein Style nicht"-Probleme**)
- Box-Modell: margin, padding, border
- Flexbox (der Header nutzt es massiv), Grid (die Karten-Raster)
- Position: relative/absolute/sticky — der Header ist `sticky`
- Media Queries (`@media (min-width: 1280px)`) — siehe `global.css`

### JavaScript (5 h)
- Variablen, Funktionen, Arrays, Objekte
- Array-Methoden `.map()` `.filter()` `.sort()` — **die nutzt ihr überall**,
  z. B. in `src/lib/sanity.ts` beim Filtern der Vorstellungen
- `async`/`await` und was ein Promise ist (jeder Sanity-Aufruf ist einer)
- DOM-Manipulation: `querySelector`, `addEventListener`, `classList`
  (siehe Header-Script, Programm-Filter)
- Optional Chaining `?.` und Nullish Coalescing `??` — steht überall im Code

### Übung
Öffne `src/components/Header.astro` und erkläre dir selbst laut:
- Was macht `class:list={[...]}`?
- Warum ist die mobile Navigation ein eigenes `<div>` außerhalb `<header>`?
- Was macht die Fokus-Falle im Script und warum gibt es sie?

### Ressourcen
- MDN (das Standardwerk, deutsch): https://developer.mozilla.org/de/
- CSS Flexbox visuell: https://flexboxfroggy.com/#de
- CSS Grid visuell: https://cssgridgarden.com/#de

---

## Modul 4 🔴 — Astro (8–12 h)

Astro ist das Framework, das aus deinen Dateien die Website baut.

### Lernziele
- **Datei = Route**: `src/pages/kontakt.astro` → `/kontakt`.
  `src/pages/programm/[slug].astro` → `/programm/beliebiger-film`
- **Frontmatter** (der `---`-Block oben): läuft **beim Bauen** auf dem
  Server, nicht im Browser. Hier holst du Daten aus Sanity.
- **Template** (darunter): HTML mit `{}`-Ausdrücken
- **Komponenten**: `Header.astro`, `Footer.astro`, `HeroBg.astro` —
  wiederverwendbare Bausteine mit Props
- **Layouts**: `src/layouts/Layout.astro` — der gemeinsame Rahmen aller
  Seiten (`<head>`, Meta-Tags, SEO, JSON-LD)
- **`<slot />`**: die Stelle, an der der Seiteninhalt ins Layout eingesetzt wird
- **Islands-Prinzip**: Astro liefert standardmäßig **null JavaScript** an
  den Browser. Nur was in `<script>`-Tags steht, läuft beim Besucher.
- **Statisch vs. Server**: `output: 'static'` + Vercel-Adapter. Einzelne
  Routen können mit `export const prerender = false` server-seitig laufen
  — genau das machen die drei API-Routen.
- **`getStaticPaths()`**: erzeugt beim Build eine Seite pro Film/Event

### Die Dateien, die du verstehen musst (in dieser Reihenfolge)
1. `src/layouts/Layout.astro` — der Rahmen
2. `src/pages/kontakt.astro` — eine einfache Seite mit Sanity-Daten
3. `src/components/Header.astro` — Komponente mit Logik und Script
4. `src/pages/programm/[slug].astro` — dynamische Route mit `getStaticPaths`

### Übung
Baue eine neue Seite `/gutscheine`:
- Layout, Header, Footer einbinden
- Hero-Sektion mit `HeroBg` im Stil der anderen Unterseiten
- Text zu Gutscheinen + Link zum Shop
- In die Navigation im Header aufnehmen
- Lokal testen, bauen, pushen, live prüfen

### Ressourcen
- Astro-Doku (exzellent): https://docs.astro.build/de/getting-started/
- Besonders: „Astro-Komponenten", „Routing", „Endpunkte"

---

## Modul 5 🟡 — Tailwind CSS 4 (5–8 h)

Jede Farbe, jeder Abstand auf der Seite ist eine Tailwind-Klasse.

### Lernziele
- Utility-First-Prinzip: `px-6 py-16` statt eigener CSS-Klassen
- Das Abstands-System (4 = 1rem = 16px)
- Responsive Präfixe: `md:` `lg:` `xl:` — **mobile first**, also gilt die
  Klasse ohne Präfix für alle Größen aufwärts
- Zustände: `hover:` `focus-visible:` `group-hover:`
- **Euer Theme**: in `src/styles/global.css` unter `@theme` — dort sind
  `--color-kino-rot`, `--color-vintage-gold` usw. definiert. Daraus
  entstehen automatisch Klassen wie `bg-kino-rot`, `text-vintage-gold`.
- Tailwind 4 unterscheidet sich von 3: **keine `tailwind.config.js` mehr**,
  Konfiguration steckt im CSS
- **Bekannte Falle in diesem Projekt**: Arbitrary Values wie
  `grid-cols-[...]` sind unzuverlässig → stattdessen feste Utilities oder
  inline `style=""`

### Übung
- Ändere die Markenfarbe testweise (`--color-kino-rot`) und beobachte,
  wo überall sie greift → verstehe, warum zentrale Theme-Werte wichtig sind
- Mache die Spar-Tage-Karten auf der Startseite auf Mobilgeräten
  zweispaltig statt einspaltig

### Ressource
- https://tailwindcss.com/docs — Suchfunktion nutzen, nicht linear lesen

---

## Modul 6 🟡 — Sanity: Content-Modell & Abfragen (8–10 h)

### Lernziele
- **Trennung verstehen**: `studio/` ist ein **eigenes Projekt** mit eigenem
  `package.json`. Es wird getrennt deployed (`npx sanity deploy`).
- **Schema = Datenmodell**: `studio/schemaTypes/*.ts` definiert, welche
  Felder es gibt. Änderungen hier ändern die Eingabemasken.
- `document` vs. `object`: `film` ist ein Dokument, `vorstellung` ein
  eingebettetes Objekt innerhalb eines Films
- **Singleton-Muster**: `kinoInfo` (Preise & Öffnungszeiten) — feste
  Dokument-ID, eigener Menüeintrag, nicht dupliziertbar. Siehe
  `sanity.config.ts`
- **GROQ**, die Abfragesprache (das Herzstück von `src/lib/sanity.ts`):
  ```groq
  *[_type == "film"]                    // alle Filme
  *[_type == "film"] | order(titel asc) // sortiert
  *[_type == "kinoInfo"][0]             // erstes (einziges) Dokument
  { titel, slug, "saalName": saal->name } // Felder + Referenz auflösen
  ```
- **Draft vs. Published**: Die Website sieht nur Veröffentlichtes
- **Bilder**: `urlFor()` mit `@sanity/image-url`, Hotspot/Crop, `.auto("format")`
- **Projekt-ID `mooch5bz`**, Dataset `production`

### Die Befehle
```powershell
cd "C:\My Web Sites\modernes-theater-neu\studio"
npm run dev            # Studio lokal auf localhost:3333
npx sanity deploy      # Studio veröffentlichen → kinoweinheim.sanity.studio
npx sanity schema list # Welche Schemas sind deployed?
```

### Übung
Ergänze am Film-Schema ein Feld „Originaltitel":
1. Feld in `studio/schemaTypes/film.ts` hinzufügen
2. Studio lokal testen, dann deployen
3. Typ in `src/lib/sanity.ts` erweitern + in die GROQ-Abfrage aufnehmen
4. Auf der Film-Detailseite anzeigen (nur wenn vorhanden)
5. Beide Teile deployen — **verstehe, warum es zwei Deploys sind**

### Ressourcen
- GROQ-Spickzettel: https://www.sanity.io/docs/query-cheat-sheet
- Schema-Typen: https://www.sanity.io/docs/schema-types

---

## Modul 7 🟡 — Vercel: Hosting & Betrieb (5–6 h)

### Lernziele
- **Deployment-Automatik**: Push auf `main` → Build → live (~2 Min)
- **Preview-Deployments**: Jeder Branch/PR bekommt eine eigene Test-URL —
  **so testest du große Änderungen, ohne die Live-Seite zu gefährden**
- **Build-Logs lesen**: Wo steht, warum ein Build fehlgeschlagen ist
- **Environment Variables**: Production/Preview/Development getrennt.
  Eure: `SANITY_PROJECT_ID`, `SANITY_DATASET`, `BREVO_*`,
  `VERCEL_DEPLOY_HOOK_URL`. **Nach Änderung ist ein Redeploy nötig.**
- **Instant Rollback**: Deployments-Tab → altes Deployment → „Promote to
  Production". Der schnellste Notfall-Fix überhaupt.
- **Deploy Hooks**: Die URL, die Sanity aufruft, wenn Inhalte sich ändern
- **Crons**: `vercel.json` → täglich 03:00 UTC `/api/rebuild`
- **Security-Header**: ebenfalls `vercel.json` (HSTS, X-Frame-Options …)
- **Domains**: Custom Domain eintragen, DNS-Records (A/CNAME), SSL automatisch
- **Hobby vs. Pro**: Hobby verbietet kommerzielle Nutzung → vor Launch
  Pro (~20 $/Monat), auch wegen DPA (Datenschutz-Vertrag)

### Übung
- Finde im Dashboard das letzte Deployment und lies das Build-Log
- Übe einen Rollback auf ein früheres Deployment (und wieder zurück)
- Schau dir die Env-Vars an — verstehe, welche wofür da ist

---

## Modul 8 🟡 — Brevo & die API-Routen (4–5 h)

### Lernziele
- **Zwei verschiedene Brevo-Welten**:
  - *Marketing/Contacts*: Newsletter-Liste, Double-Opt-In
  - *Transactional*: einzelne E-Mails (das Vermietungs-Formular)
- **Double-Opt-In (DOI)** und warum er rechtlich Pflicht ist
- ⚠️ **Die dokumentierte Falle**: DOI-Templates entstehen **nur** über den
  Formular-Assistenten, nie über „Templates" — siehe `docs/brevo-setup.md`
- **API-Routen verstehen** (`src/pages/api/*.ts`):
  - `export const prerender = false` → läuft server-seitig, nicht beim Build
  - Request lesen, validieren, an Brevo weiterreichen, Response zurück
  - Warum ohne Env-Vars bewusst **501 + Mailto-Fallback** kommt
  - XSS-Escaping bei Nutzereingaben
- **Wie das Frontend damit spricht**: `fetch()` im Formular-Script,
  Zustände idle/loading/success/error, `aria-live` für Screenreader

### Übung
Lies `src/pages/api/vermietung.ts` Zeile für Zeile und beantworte:
- Was passiert bei fehlendem Namen?
- Warum ist `replyTo` gesetzt und was wäre ohne?
- Wo genau würdest du ein Feld „Wunschtermin" ergänzen? (Frontend + API!)

---

## Modul 9 🟡 — Debugging & Notfälle (5–6 h)

**Das Modul, das dich nachts ruhig schlafen lässt.**

### Lernziele
- Browser-DevTools: Elements (HTML/CSS live prüfen), Console (JS-Fehler),
  Network (was wird geladen), Lighthouse (Performance/A11y)
- Vercel-Logs für die API-Routen (Runtime Logs)
- Systematisch eingrenzen: Lokal oder nur live? Alle Seiten oder eine?
  Seit welchem Commit? (`git log`)

### Notfall-Playbook

| Problem | Erste Maßnahme |
|---|---|
| Live-Seite kaputt nach Deploy | Vercel → Deployments → letztes gutes → **Promote to Production** |
| Build schlägt fehl | Build-Log lesen, `npm run build` lokal reproduzieren |
| Sanity-Änderung erscheint nicht | Published? Webhook gelaufen? Notfalls Redeploy von Hand |
| Formular antwortet 501 | Env-Vars in Vercel fehlen/falsch → prüfen, dann Redeploy |
| Style greift nicht | DevTools → Element → Computed: welche Regel gewinnt? |
| Lokal geht's, live nicht | Env-Vars? Build-only-Fehler? `npm run build` lokal testen |

### Übung
- Provoziere lokal einen Build-Fehler und behebe ihn allein
- Simuliere den Notfall: Rollback auf ein altes Deployment üben
- Nutze Lighthouse auf der Live-Seite, verstehe die vier Werte

---

## Modul 10 🟢 — Architektur erklären können (3–4 h)

Für Kundengespräche. Übe **laut** zu antworten, in einfachen Worten:

- „Warum ist die Seite so schnell?" → Statisch vorgebaut, kein
  Datenbank-Zugriff beim Besuch, Bilder als WebP in mehreren Größen,
  fast kein JavaScript
- „Können wir die Inhalte selbst pflegen?" → Ja, Sanity-Studio im Browser,
  Änderung ist in ~2 Min live
- „Was kostet der Betrieb?" → Vercel Pro ~20 $/Monat, Sanity Free (ggf.
  Growth 15 $/Seat), Brevo je nach Kontakten, Domain ~15 €/Jahr
- „Sind wir DSGVO-konform?" → Keine Cookies/Tracking, lokale Fonts,
  Zwei-Klick-Lösung bei Karten, alle Auftragsverarbeiter benannt,
  AVVs nötig (Doku vorhanden)
- „Was, wenn du nicht mehr kannst?" → Standard-Stack (Astro, Tailwind,
  Sanity, Vercel, GitHub), jede Agentur kann übernehmen, kein Lock-in
- „Ist die Seite barrierefrei?" → WCAG 2.2 AA angestrebt, Kontraste
  gehärtet, Tastaturbedienung, Screenreader-Test offen, eigene
  Erklärungsseite unter `/barrierefreiheit`
- „Warum kein Online-Ticketing?" → Bewusst nicht, weil Reservierung
  telefonisch/vor Ort läuft; nachrüstbar, dann greift aber BFSG

### Übung
Erkläre einer nicht-technischen Person in 3 Minuten, wie eine Änderung
im Sanity-Studio auf der Website landet. Ohne Fachbegriffe.

---

## Wochenplan (Vorschlag, ~6 h/Woche)

| Woche | Inhalt |
|---|---|
| 1 | Modul 1: Terminal & Git |
| 2 | Modul 2 + Start Modul 3 (HTML/CSS) |
| 3 | Modul 3 fertig (JavaScript) |
| 4–5 | Modul 4: Astro + Übungsseite `/gutscheine` |
| 6 | Modul 5: Tailwind |
| 7–8 | Modul 6: Sanity + Schema-Übung |
| 9 | Modul 7: Vercel |
| 10 | Modul 8: Brevo & API-Routen |
| 11 | Modul 9: Debugging & Notfälle |
| 12 | Modul 10: Architektur + Wiederholung |

**Nach Woche 5 bist du handlungsfähig.** Der Rest macht dich souverän.

---

## Arbeitsregeln, die dich vor Schäden schützen

1. **Nie direkt live experimentieren.** Immer lokal testen (`npm run dev`),
   dann `npm run build`, dann pushen.
2. **Kleine Commits mit klarer Beschreibung.** Ein Thema pro Commit —
   dann ist ein gezielter Rollback möglich.
3. **Vor größeren Umbauten einen Branch.** `git checkout -b versuch-xy` —
   Vercel gibt dir eine Preview-URL zum gefahrlosen Testen.
4. **Nach jedem Deploy einmal live nachsehen.** 30 Sekunden, spart Stunden.
5. **Zugangsdaten nie in Git.** Alles Geheime gehört in `.env` (lokal) und
   in die Vercel-Env-Vars — `.env` steht in `.gitignore`.
6. **Bei Unsicherheit: erst lesen, dann ändern.** Der Code ist deutsch
   kommentiert, gerade an den kniffligen Stellen.

---

## Die wichtigsten Adressen

| Was | Wo |
|---|---|
| Live-Website | https://modernes-theater-weinheim.vercel.app |
| Sanity-Studio | https://kinoweinheim.sanity.studio |
| Code (GitHub) | https://github.com/henrik-webprojekte/modernes-theater-weinheim |
| Vercel-Dashboard | https://vercel.com/henrik-dubiel1/modernes-theater-weinheim |
| Projekt lokal | `C:\My Web Sites\modernes-theater-neu` |
| Studio lokal | `C:\My Web Sites\modernes-theater-neu\studio` |

**Weitere Doku im Projekt:**
- `docs/sanity-anleitung.md` — Content-Pflege (für das Kino)
- `docs/brevo-setup.md` — E-Mail-Setup inkl. DOI-Falle
- `docs/rechtliches-vorbereitung.md` — Handelsregister, AVVs, Vercel-Pro
- `LAUNCH-CHECKLIST.md` — alle offenen Punkte bis Go-Live
- `CLAUDE.md` / `AGENTS.md` — Projektkonventionen

---

*Erstellt: 16.07.2026 · Fortschritt hier abhaken, Plan bei Bedarf anpassen.*
