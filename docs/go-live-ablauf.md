# Go-Live-Ablaufplan (Runbook)

Die Schritte zur Live-Schaltung **in der richtigen Reihenfolge**. Kein Ersatz
für die `LAUNCH-CHECKLIST.md` (die sammelt alle Einzelpunkte) — dieser Plan
bringt sie in eine sinnvolle zeitliche Abfolge, damit am Launch-Tag nichts
in falscher Reihenfolge passiert.

**Symbole:** 👨‍💻 Henri/Entwickler · 🎬 Kino · ⚖️ Anwalt

---

## Phase 0 — Freigabe (Voraussetzung für alles)

- [ ] 🎬 Kino sagt „Ja, wir übernehmen die Seite" (siehe `kino-fragenkatalog.md`)
- [ ] 🎬 Entscheidungen getroffen: Domain, Newsletter-Konto, Wartungsvertrag

## Phase 1 — Inhalte & Rechtliches vervollständigen

*(kann teils parallel laufen, muss aber vor Phase 3 fertig sein)*

- [ ] 🎬 Echte Fotos liefern → 👨‍💻 in `src/assets/` einsetzen, Stock-Bilder raus
- [ ] 🎬 Reales Filmprogramm + Events + Saal-Details in Sanity anlegen
- [ ] 🎬 Preise / Öffnungszeiten / Kontaktdaten / Historie bestätigen
      → 👨‍💻 „Preise & Öffnungszeiten" im Sanity-Studio eintragen
- [ ] 🎬 Impressum-Angaben bestätigen (GF, Firmierung, Komplementärin, USt-ID)
      → 👨‍💻 ins `impressum.astro` übernehmen
- [ ] ⚖️ Datenschutzerklärung prüfen lassen → 👨‍💻 Änderungen einarbeiten
- [ ] 🎬 AVVs mit Vercel, Sanity, Brevo abschließen und archivieren

## Phase 2 — Konten aufs Kino umziehen

- [ ] 👨‍💻 **Vercel auf Pro upgraden** (Kino-Zahlungsmittel) — Pflicht für
      kommerzielle Nutzung + DPA
- [ ] 👨‍💻 Vercel-Projekt ins Kino-Team übertragen
- [ ] 👨‍💻 GitHub-Repo-Eigentum klären
- [ ] 👨‍💻 Sanity: Kino-Mitarbeiter als Administrator einladen
- [ ] 🎬/👨‍💻 **Brevo-Konto** klären/übernehmen:
  - [ ] Absenderadresse `newsletter@kinoweinheim.de` verifizieren (DNS: DKIM/SPF)
  - [ ] DOI-Vorlage per Formular-Assistent erzeugen, dann das fertige Kino-HTML
        einsetzen (siehe `brevo-setup.md`), Absendername „Modernes Theater Weinheim"
  - [ ] Liste „Newsletter" anlegen, neuen API-Key erzeugen
- [ ] 👨‍💻 **Vercel-Env-Vars aufs Kino-Konto umstellen** (alle in Production):
      `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_TEMPLATE_ID`, `BREVO_SENDER_EMAIL`,
      `BREVO_SENDER_NAME` — und **`BREVO_VERMIETUNG_TO` LÖSCHEN**
      (Default `veranstaltung@kinoweinheim.de` greift dann)
- [ ] 👨‍💻 **Redeploy** (sonst greifen die neuen Env-Vars nicht)

## Phase 3 — Domain & Weiterleitungen

- [ ] 👨‍💻 Custom Domain in Vercel eintragen
- [ ] 👨‍💻 DNS beim Registrar auf Vercel zeigen lassen
- [ ] 👨‍💻 `site` in `astro.config.mjs` + OG-URLs auf die echte Domain ändern
- [ ] 👨‍💻 **301-Redirects** aktivieren (alte Pfade → neue, siehe `redirect-plan.md`)
- [ ] 👨‍💻 SSL prüfen (Vercel macht automatisch)

## Phase 4 — Letzte Tests (alles auf der echten Domain)

- [ ] 👨‍💻 `npm run build` lokal fehlerfrei
- [ ] 👨‍💻 **Newsletter-E2E** wiederholen (Anmeldung → Kino-Bestätigungsmail →
      Klick → Kontakt landet in richtiger Liste — Liste per Verhaltenstest prüfen!)
- [ ] 👨‍💻 **Vermietungs-E2E** wiederholen (Anfrage → landet bei
      `veranstaltung@kinoweinheim.de` → Reply-To = Anfragender)
- [ ] 👨‍💻 Stichprobe alte Adresse → 301 auf neue Seite
- [ ] 👨‍💻 Screenreader-Test (NVDA), Lighthouse ≥ 90, axe = 0 kritische
- [ ] 👨‍💻 Cross-Browser (Chrome/Firefox/Safari/Edge, iOS/Android)

## Phase 5 — Umschalten & Nachlauf

- [ ] 👨‍💻 Alte Website abschalten bzw. DNS endgültig umlegen (Downtime minimieren)
- [ ] 👨‍💻 Test-Kontakte aus Brevo löschen, Test-Konto stilllegen, Test-API-Key
      widerrufen
- [ ] 🎬 Presse-/Social-Media-Ankündigung
- [ ] 👨‍💻 Anleitung an Kino übergeben (`sanity-anleitung.md` als PDF)
- [ ] 👨‍💻/🎬 Wartungsrhythmus vereinbaren (Dependency-Updates ~1×/Jahr)

---

## Notfall am Launch-Tag

- **Seite kaputt nach einem Deploy:** Vercel → Deployments → letztes gutes →
  „Instant Rollback". 30 Sekunden, sofort wirksam.
- **Formular meldet 501:** Env-Var fehlt/falsch → Vercel prüfen, Redeploy.
- **Änderung erscheint nicht:** Sanity published? Sonst Vercel „Redeploy".

---

*Stand: 25.07.2026 · Details je Punkt in `LAUNCH-CHECKLIST.md`, `brevo-setup.md`,
`redirect-plan.md`, `rechtliches-vorbereitung.md`*
