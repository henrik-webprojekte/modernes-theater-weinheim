# Launch-Checkliste — Modernes Theater Weinheim

Zentrale Sammlung aller offenen Punkte, die vor der finalen Live-Schaltung
erledigt sein müssen. Wird laufend erweitert.

**Legende:**
🔴 Muss vor Live · 🟡 Sollte vor Live · 🟢 Kann nach Live · ✅ Erledigt

**Verantwortlich:**
👨‍💻 Henri · 🎬 Kino · ⚖️ Anwalt · 🌐 Externer Dienstleister

---

## 1. Rechtliches

### 1.1 Impressum

- [ ] 🔴 🎬 Geschäftsführung bestätigen — **Registerfund 09.07.2026: seit
      03.06.2024 ist Dominic Speiser GF** (vorher Alfred Hans Speiser).
      Details + vorbereiteter Impressums-Baustein in `docs/rechtliches-vorbereitung.md`
- [ ] 🔴 🎬 Komplementärin **recherchiert**: Woinemer Kinoverwaltungsgesellschaft mbH,
      AG Mannheim **HRB 708 890** — per offiziellem Auszug bestätigen, dann ins
      Impressum übernehmen
- [ ] 🔴 🎬 Firmierungs-Schreibweise klären: Register sagt „Woinemer Kino GmbH & Co. KG"
      (getrennt), altes Impressum „WoinemerKino" (zusammen) — registrierte Form gilt
- [ ] 🔴 🎬 USt-ID `DE 270 149 413` auf bzst.de kurz verifizieren (noch aktiv?)
- [ ] 🟡 ⚖️ Zuordnung nach § 18 Abs. 2 MStV vom Anwalt prüfen lassen
      (strittig ob für Info-Website ohne journalistisch-redaktionelle Inhalte anwendbar)

### 1.2 Datenschutzerklärung

- [ ] 🔴 ⚖️ Kanzlei mit DSGVO-Fokus prüft die 10 Sections
      (Speicherdauern, Auftragsverarbeiter-Aufzählung, Vollständigkeit).
      Kosten typisch 200–500 € einmalig
- [ ] 🔴 🎬 **AVVs (Auftragsverarbeitungsverträge nach Art. 28 DSGVO)** schließen und
      archivieren — alle drei sind Self-Service, Links + Abschlusswege recherchiert
      und dokumentiert in `docs/rechtliches-vorbereitung.md` (Vercel, Sanity, Brevo)
- [ ] 🔴 👨‍💻 **Vercel auf Pro-Plan upgraden** (~20 $/Monat) vor dem Launch:
      Hobby-Plan erlaubt keine kommerzielle Nutzung, und das Vercel-DPA gilt
      erst ab Pro — beides für den Kino-Betrieb zwingend
- [ ] 🟡 🎬 Prüfen ob externer Datenschutzbeauftragter nötig ist
      (bei ≥ 20 regelmäßigen Daten-Verarbeitern im Betrieb)
- [ ] 🟡 🎬 Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO) intern anlegen

### 1.3 Barrierefreiheit

- [ ] 🟡 👨‍💻 Screenreader-Test mit NVDA durchführen (Anleitung im Session-Gedächtnis)
- [ ] 🟡 👨‍💻 Danach Barrierefreiheitserklärung Section 3 aktualisieren (Test-Status)
- [ ] 🟢 🌐 Optional: Fachaudit durch zertifizierten Prüfer (BITV-Siegel, 1.500–4.000 €)
- [ ] 🟢 🎬 BFSG-Anpassung, sobald Online-Ticketing eingeführt wird

### 1.4 Filmplakat-Rechte

- [ ] 🟡 🎬 Verleiher-Verträge auf Klausel „Werbematerial für digitale Nutzung" prüfen
- [ ] 🟡 🎬 Bei Unklarheit: kurze schriftliche Bestätigung des Verleihers einholen
      (Zwei-Zeilen-Email reicht)

### 1.5 Sonstiges

- [ ] 🟡 🎬 GEMA-Anmeldung für Musikaufführung im Kino (Compliance, nicht Website)

---

## 2. Content

### 2.1 Bildmaterial

- [ ] 🔴 🎬 **Echte Kinofotos** in Hi-Res liefern:
    - Saal Chic (Interieur, gerne mit Vorhang)
    - Saal Cherie (Lounge-Sessel, Foyer mit Wandmalerei)
    - Saal Charme (Sessel, warme Beleuchtung)
    - Kinogarten (Außenfläche, mit Blick auf Windeck)
    - Foyer / Snackbar
    - Fassade / Eingang / Vintage-Rautenschild
- [ ] 🔴 👨‍💻 Stock-Bilder in `src/assets/` durch echte Fotos ersetzen
- [ ] 🟡 🎬 Historisches Fotomaterial vom Stadtmuseum Weinheim
      (in Historie-Section angekündigt)

### 2.2 Sanity-Content

- [ ] 🔴 🎬 Aktuelles Filmprogramm der laufenden Woche anlegen
      (aktuell nur Test-Film „Der Teufel trägt Prada 2" mit Vorstellung 03.07.2026)
- [ ] 🔴 🎬 Reale Vorstellungen für laufende + nächste Woche im Sanity
- [ ] 🔴 🎬 Wiederkehrende Events in Sanity anlegen (Kaffee-Tee-Kino, Enzo-Day,
      Schmittini, Open-Air-Sommer, Sneak Preview)
- [ ] 🟡 🎬 Öffnungszeiten aktueller Stand
- [ ] 🟡 🎬 Vermietungs-Details schärfen: „ab X €"-Angabe oder Beispiel-Pakete?

### 2.3 Statische Texte

- [ ] 🟡 🎬 Historie-Text final abnehmen (aktuell Recherche-Ergebnisse)
- [ ] 🟡 🎬 Preise final bestätigen (aktuell aus alter Site übernommen, Stand Juni 2026)
- [ ] 🟡 🎬 Kontaktdaten final bestätigen (Telefon, E-Mail-Adressen)

---

## 3. Konfiguration

### 3.1 Brevo (E-Mail-Dienst)

- [x] ✅ 👨‍💻 **Test-Setup komplett live** (09.07.2026): Test-Konto, Liste,
      DOI-Template (ID 6 via Formular-Assistent!), alle 6 Env-Vars in Vercel.
      Newsletter End-to-End bestanden. Setup-Doku + ⚠️ DOI-Template-Falle +
      Umzugsplan: `docs/brevo-setup.md`
- [ ] 🔴 🎬 Brevo-Konto klären: bestehendes von GTM Schubert übernehmen
      (Empfehlung — dort liegt die Alt-Abonnentenliste) oder neues Konto
- [ ] 🔴 🎬 Domain-Absender im Zielkonto verifizieren (DKIM/SPF beim Hoster,
      z. B. newsletter@kinoweinheim.de)
- [ ] 🔴 👨‍💻 Beim Umzug aufs echte Konto: Env-Vars tauschen nach Plan in
      `docs/brevo-setup.md` — **`BREVO_VERMIETUNG_TO` dabei löschen** (Default
      greift dann: veranstaltung@kinoweinheim.de)
- [ ] 🔴 👨‍💻 **`BREVO_LIST_ID` bewusst setzen und verifizieren.** Befund
      24.07.2026: Der Test-Kontakt landete in „Ihre erste Liste" (ID 2), nicht in
      „Newsletter Test" (ID 3, leer) — die Variable zeigt vermutlich auf 2.
      Nach dem Setzen mit einer Test-Anmeldung prüfen, in welcher Liste der
      Kontakt tatsächlich erscheint (Wert ist „Sensitive", nicht auslesbar)

### 3.2 Sanity-Zugang

- [ ] 🔴 👨‍💻 Kino-Mitarbeiter in Sanity-Projekt `mooch5bz` einladen.
      **Hinweis Free-Plan** (greift nach Trial-Ende ~Aug 2026): nur 2 Rollen
      (Administrator/Viewer) — Content-Pfleger müssen Administrator sein.
      Historie nur 3 Tage, kein Scheduled Publishing. Webhooks (2) und
      Limits reichen für den Live-Betrieb; Growth wäre 15 €/Seat/Monat.
- [x] ✅ 👨‍💻 Kurzanleitung Sanity-Studio geschrieben (09.07.2026):
      `docs/sanity-anleitung.md` — Filme, Vorstellungen, Events, Säle, Publish-Konzept,
      Bild-Tipps, häufige Probleme. Bei Übergabe ggf. als PDF exportieren

### 3.3 Sanity → Vercel Rebuild-Automatik

- [x] ✅ 👨‍💻 **Sanity-Webhook auf Vercel-Deploy-Hook eingerichtet** (09.07.2026).
      Slug-Korrekturen als Live-Test bestanden — korrigierte Event-URLs sind
      auf Production. Restcheck: im Vercel-Deployments-Tab einmal verifizieren,
      dass ein Build mit Quelle „Deploy Hook: sanity-content" auftaucht
- [x] ✅ 👨‍💻 Täglicher Rebuild via Vercel Cron (03:00 UTC auf `/api/rebuild`,
      Env-Var `VERCEL_DEPLOY_HOOK_URL`; optional `CRON_SECRET` als Absicherung).
      Nach dem ersten Cron-Lauf im Vercel-Log prüfen, ob 200 zurückkam

### 3.4 Analytics-Entscheidung

- [ ] 🟡 🎬 Nutzungsstatistiken gewünscht? (Plausible/Umatomic, ~9–12 €/Monat, DSGVO-friendly)
- [ ] 🟡 👨‍💻 Falls ja: Analytics einbinden + Cookie-Banner wieder aktivieren
      + Datenschutz Section 4 anpassen

---

## 4. Domain / Deployment

- [ ] 🔴 🎬 Domain-Entscheidung: `kinoweinheim.de` behalten (Wechsel-Aufwand)
      oder neue Domain wie `modernes-theater-weinheim.de`?
- [ ] 🔴 👨‍💻 Falls Domain-Wechsel: DNS bei Registrar konfigurieren
- [ ] 🔴 👨‍💻 Custom Domain in Vercel-Projekt eintragen
- [ ] 🔴 👨‍💻 Redirect-Strategie für alte Site-URLs:
      alte `kinoweinheim.de/pages/*` → neue Pfade per 301-Redirect,
      oder alte Site komplett abschalten?
- [ ] 🟡 👨‍💻 SSL-Zertifikat verifizieren (Vercel macht automatisch)
- [ ] 🟡 🎬 E-Mail-Adressen an neuer Domain funktionsfähig (falls Domain-Wechsel)
- [ ] 🟡 👨‍💻 Deploy-Zeitfenster planen (Downtime minimieren)

---

## 5. Testing (letzte Runde vor Go-Live)

- [ ] 🔴 👨‍💻 `npm run build` lokal ohne Fehler durchgelaufen
- [ ] 🔴 👨‍💻 Sitemap `dist/sitemap-index.xml` + `dist/sitemap-0.xml` vorhanden
- [x] ✅ 👨‍💻 **End-to-End Newsletter-Anmeldung** bestanden (09.07.2026, auf
      Production mit Test-Brevo): echte Mail + DOI-Klick + Redirect + Kontakt
      in Liste. Beim Konto-Umzug einmal wiederholen
- [x] ✅ 👨‍💻 **End-to-End Vermietungs-Formular** bestanden (09.07.2026):
      Anfrage über /vermietung → Empfang unter BREVO_VERMIETUNG_TO →
      Reply-To geht korrekt an den Anfragenden. Beim Konto-Umzug wiederholen
- [ ] 🟡 👨‍💻 Cross-Browser-Test auf echten Geräten:
      Chrome, Firefox, Safari macOS, Edge, Safari iOS, Chrome Android
- [ ] 🟡 👨‍💻 Lighthouse-Score im Production-Build:
      Performance/A11y/Best-Practices/SEO jeweils ≥ 90
- [ ] 🟡 👨‍💻 axe DevTools auf allen Seiten in Production: 0 kritische/ernste Verstöße
- [x] ✅ 👨‍💻 Custom 404-Seite mit Vintage-Design ergänzt (`src/pages/404.astro`)
- [ ] 🟡 👨‍💻 npm-audit-Finding beobachten: `path-to-regexp` (High, transitiv über
      `@astrojs/vercel`) — reine Build-Zeit-Abhängigkeit, kein Runtime-Risiko;
      Fix erst wenn Adapter-Update ohne Downgrade verfügbar
- [x] ✅ 🎬 Sanity-Slug-Tippfehler korrigiert (09.07.2026): `kaffee-tee-kino`,
      `wiesensee-hemsbach` — auf Production verifiziert
- [ ] 🔴 🎬 Neue Saal-Felder in Sanity befüllen (Reihenfolge, Fakten-Kacheln,
      Hintergrundfarbe, Dunkler-Hintergrund-Schalter, Hauptbild, ausführliche
      Beschreibung) — Werte-Vorlage liegt im Chat-Verlauf vom 09.07.2026

---

## 6. Nice-to-have (kann nach Live)

- [ ] 🟢 👨‍💻 Auto-A11y-Testing mit Playwright + axe (Regressionsschutz nach Launch)
- [ ] 🟢 👨‍💻 Fokus-Restore nach Newsletter/Vermietung-Submit
      (Fokus auf Status-Meldung statt auf Button)
- [ ] 🟢 👨‍💻 Custom-Marker auf OSM (Leaflet.js, ~150 KB Bundle-Kosten)
- [x] ✅ 👨‍💻 Preise / Öffnungszeiten in Sanity ziehen (16.07.2026): Singleton
      „Preise & Öffnungszeiten" (kinoInfo) im Studio, Kontakt-Seite liest daraus
      mit eingebautem Fallback. Anleitung Abschnitt 6a ergänzt.
      **Restschritt: `npx sanity deploy` + Kino trägt Werte ein**
- [ ] 🟢 👨‍💻 Sanity-Content-Automation: Neuer Film → Newsletter-Vorschlag?
- [ ] 🟢 👨‍💻 PWA-Konfiguration (Homescreen-Icon, offline Lesezugriff)

---

## 7. Prozess (rund um Go-Live)

- [ ] 🟡 🎬 Wartungsvertrag mit Kino verhandeln (Umfang, Reaktionszeiten, Preis)
- [ ] 🟡 👨‍💻 Sanity-Anleitung an Kino übergeben (siehe 3.2)
- [ ] 🟡 👨‍💻 Dependencies-Update-Rhythmus definieren (~1× jährlich)
- [ ] 🟢 🎬 Presse-Ankündigung / Social-Media-Post zum Launch vorbereiten

---

## Bereits erledigt (Stand 06.07.2026)

Zur Übersicht kompakt, was schon fertig ist:

✅ Website-Grundgerüst (Astro 7 + Tailwind 4 + Sanity + Vercel)
✅ 10 Seiten fertig gestaltet und getextet (Vintage-Design)
✅ SEO-Setup (Meta, Open Graph, Twitter, JSON-LD MovieTheater, Sitemap-Integration)
✅ Barrierefreiheit-Grundstock (Skip-Link, Focus-Styles, Kontrast auf 4.5:1, Target-Size, aria-current, prefers-reduced-motion)
✅ A11y-Test-Runden: axe / Tastatur / Zoom / Reflow / Farbwahrnehmung / Reduced Motion / Formulare (nur Screenreader offen)
✅ Newsletter-Backend (API + Fetch-Form + DOI-Landing, 501-Fallback ohne Env-Vars)
✅ Vermietungs-Formular-Backend (API + Fetch-Form, 501-Fallback ohne Env-Vars)
✅ OSM-Karte auf Kontakt-Seite mit korrekten Koordinaten
✅ Filmplakat-Rendering aus Sanity mit responsive srcset + Hotspot-Croppung
✅ Impressum (WoinemerKino, § 18 Abs. 2 MStV)
✅ Datenschutzerklärung (10 Sections, alle Auftragsverarbeiter benannt)
✅ Barrierefreiheitserklärung als freiwillige Selbstverpflichtung
✅ Preise-Hinweis „inkl. gesetzl. USt." (PAngV-konform)
✅ Vermietungs-Formular mit Datenschutz-Hinweis
✅ Cookie-Banner entfernt (kein Consent nötig ohne Tracking)
✅ Security-Headers via vercel.json (HSTS, X-Frame-Options, etc.)
✅ Lokale Fonts via Fontsource (kein Google-CDN, DSGVO-relevant)

---

*Zuletzt aktualisiert: 09.07.2026 (Final-Audit: Rebuild-Webhook, npm audit, Saal-Felder, Slug-Typos ergänzt; 404 erledigt)*
