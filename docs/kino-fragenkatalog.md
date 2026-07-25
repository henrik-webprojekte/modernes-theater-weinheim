# Was wir vom Kino brauchen — Gesprächsleitfaden

Dieses Blatt bündelt **alles, was nur das Kino beantworten oder liefern kann**.
Gedacht als Spickzettel für das Gespräch/die Vorführung — Punkt für Punkt
abhaken. Alles andere (Technik, Code, Konfiguration) ist vorbereitet.

**Dringlichkeit:** 🔴 blockiert den Launch · 🟡 sollte vor Launch · 🟢 später

---

## 1. Grundsatzentscheidungen (am wichtigsten)

- [ ] 🔴 **Wollt ihr die Seite übernehmen?** Wenn ja: als eigenes Projekt
      (Konten laufen aufs Kino) oder betreue ich sie weiter als Dienstleister?
- [ ] 🔴 **Domain:** Soll `kinoweinheim.de` weiterverwendet werden, oder eine
      neue Adresse (z. B. `modernes-theater-weinheim.de`)? Wer verwaltet die
      Domain aktuell (Zugangsdaten)?
- [ ] 🔴 **Newsletter-Konto (Brevo):** Habt ihr Zugang zum bestehenden
      Newsletter-System (lag bei GTM Schubert)? Dort liegen die aktuellen
      Abonnenten. Alternative: neu anfangen (dann sind die Alt-Abonnenten weg).
- [ ] 🔴 **Online-Tickets/Reservierung:** Wollt ihr das irgendwann? (Aktuell
      bewusst nur Telefon/Kasse. Nachrüstbar, aber mit deutlich mehr Aufwand
      und rechtlichen Folgen.)

## 2. Rechtliche Angaben (fürs Impressum) 🔴

- [ ] **Geschäftsführer bestätigen:** Registerauszug sagt, seit 03.06.2024 ist
      **Dominic Speiser** GF (nicht mehr Alfred Speiser). Stimmt das?
- [ ] **Vollständiger Firmenname / Schreibweise:** Register sagt „Woinemer Kino
      GmbH & Co. KG" (getrennt), altes Impressum „WoinemerKino" (zusammen).
      Welche Form ist korrekt?
- [ ] **Komplementärin bestätigen:** Woinemer Kinoverwaltungsgesellschaft mbH,
      AG Mannheim HRB 708 890 — offizieller Auszug vorhanden?
- [ ] **USt-ID `DE 270 149 413`** noch aktuell?
- [ ] **Anwalt für DSGVO-Check:** Habt ihr eine Kanzlei, die die
      Datenschutzerklärung einmal prüft? (200–500 € einmalig, empfohlen)

## 3. Bildmaterial 🔴

Die Website zeigt aktuell **Platzhalter** (fremde Kinos). Für den Live-Gang
brauchen wir echte Fotos in hoher Auflösung:

- [ ] Saal **Chic** (Interieur, gerne mit Vorhang/Bühne)
- [ ] Saal **Cherie** (Lounge-Sessel, Foyer mit Allgeier-Wandmalerei)
- [ ] Saal **Charme** (Sessel, warme Beleuchtung)
- [ ] **Kinogarten** (Außenfläche, Blick auf die Windeck)
- [ ] **Foyer / Snackbar**
- [ ] **Fassade / Eingang / Vintage-Rautenschild**
- [ ] 🟡 Historische Fotos (Stadtmuseum Weinheim wurde in der Historie-Seite
      bereits als Quelle angekündigt)

## 4. Inhalte, die das Kino pflegt (in Sanity) 🔴

Kann das Kino nach kurzer Einweisung selbst — aber der Start-Bestand muss rein:

- [ ] **Aktuelles Filmprogramm** der laufenden + nächsten Woche (Filme +
      Vorstellungen). Aktuell nur Test-Filme drin.
- [ ] **Wiederkehrende Events** anlegen: Kaffee-Tee-Kino, Enzo-Day,
      Zauberer Schmittini, Open-Air-Sommer, Sneak Preview.
- [ ] **Saal-Details** befüllen (Fakten, Beschreibungen — Vorlage liegt bereit).

## 5. Angaben bestätigen 🟡

Aktuell aus der alten Website / Recherche übernommen — bitte gegenprüfen:

- [ ] **Preise** (Stand Juni 2026): Erwachsene 11 €, Ermäßigt 9 €, Kinder 6 €,
      Kinotag Di / Starttag Do 7 €, VIP-Loge +1,50 €, 3D +3 €, Sneak 5 €,
      Kaffee-Tee-Kino 8 €. Noch aktuell?
- [ ] **Öffnungszeiten** (Kasse öffnet 30 Min vor erster Vorstellung …) korrekt?
- [ ] **Kontaktdaten:** Telefon 06201 · 62155, Mail zentrale@kinoweinheim.de /
      veranstaltung@kinoweinheim.de — alles aktuell?
- [ ] **Historie-Text** (Luvo-Lichtspiele 1924, Franz Ade …) inhaltlich ok?
- [ ] **Vermietung:** Wollt ihr Preis-Beispiele nennen („ab X €") oder bewusst
      individuell halten?

## 6. Rechte & Anmeldungen (Kino-intern, betrifft nicht direkt die Website) 🟡

- [ ] **Filmplakat-Rechte:** Verleiher-Verträge auf Klausel „Werbematerial für
      digitale Nutzung" prüfen (bei Unklarheit kurze Bestätigung per Mail).
- [ ] **GEMA** für Musikaufführung im Kino (Compliance-Thema, unabhängig von
      der Website).
- [ ] 🟢 **Analytics gewünscht?** Besucherstatistik ist möglich
      (datenschutzfreundlich, ~10 €/Monat) — aber nur wenn ihr die Zahlen wollt.

## 7. Nach der Zusage — Übergabe der „Macht" 🔴

Wenn das Kino übernimmt, müssen die Konten aufs Kino umziehen:

- [ ] Vercel (Hosting) — inkl. **Pro-Upgrade** (~20 $/Monat, Pflicht für
      kommerzielle Nutzung) auf Kino-Zahlungsmittel
- [ ] Sanity (Inhalte) — Kino-Mitarbeiter als Administrator einladen
- [ ] Brevo (E-Mail) — Kino-Konto, Absenderadresse verifizieren
- [ ] GitHub (Code) — Eigentum klären
- [ ] Domain-Registrar — Zugang ins Kino-Eigentum
- [ ] **Wartungsvertrag** besprechen (Umfang, Reaktionszeit, Preis)

---

## Was NICHT das Kino betrifft — ist bereits erledigt oder in Vorbereitung

Damit du im Gespräch sagen kannst „darum musst du dich nicht kümmern":

- ✅ Komplette Website (10 Seiten, Vintage-Design, responsive)
- ✅ Newsletter- + Vermietungs-Formular (getestet, Bestätigungsmail im
      Kino-Design)
- ✅ Inhalts-System (Sanity) mit deutscher Anleitung
- ✅ Rechtstexte vorbereitet (Impressum, Datenschutz, Barrierefreiheit)
- ✅ SEO, Barrierefreiheit-Grundstock, Sicherheits-Header
- ✅ Automatischer Neubau bei Inhaltsänderung + nächtlich
- ✅ Redirect-Plan für die alten Adressen liegt bereit (siehe
      `docs/redirect-plan.md`)
- ✅ Go-Live-Ablauf dokumentiert (siehe `docs/go-live-ablauf.md`)

---

*Stand: 25.07.2026 · Quelle der offenen Punkte: `LAUNCH-CHECKLIST.md`*
