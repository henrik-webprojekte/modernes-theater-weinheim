# Redirect-Plan — alte Adressen auf neue umleiten

**Zweck:** Beim Umstieg auf `kinoweinheim.de` (oder eine neue Domain) existieren
im Netz und im Google-Index noch **alte Adressen** der Vorgänger-Website. Ohne
Weiterleitung landen Besucher und Suchmaschinen auf Fehlerseiten — und Google
stuft die Seite ab. Deshalb: jede wichtige alte Adresse per **301-Weiterleitung**
(„dauerhaft umgezogen") auf die passende neue Seite lenken.

**Status:** Vorbereitet, aber **noch nicht aktiv** — wird scharf geschaltet,
sobald die Domain-Entscheidung steht (siehe `LAUNCH-CHECKLIST.md` Abschnitt 4).

---

## Voraussetzung vor dem Aktivieren

Die alte Website (jQuery + PHP, gebaut von GTM Schubert) nutzte `.php`-Adressen.
Die **exakten alten Pfade müssen vor dem Scharfschalten bestätigt werden** —
entweder aus dem vorhandenen ZIP-Mirror der alten Seite oder per Blick auf die
noch laufende `kinoweinheim.de`. Erst dann sind die `source`-Pfade unten sicher.

Die bekannte alte Hauptnavigation war:
Start · Programm · Kaffee-Tee-Kino · Shop (externe Subdomain) · Vermietung ·
Kontakt/Preise · Impressum/Datenschutz · Brennessel Hemsbach.

---

## Geplante Zuordnung (alt → neu)

| Alte Seite (Inhalt) | Neue Adresse |
|---|---|
| Startseite | `/` |
| Aktuelles Programm | `/programm` |
| Kaffee-Tee-Kino | `/events/kaffee-tee-kino` |
| Vermietung | `/vermietung` |
| Kontakt / Anfahrt | `/kontakt` |
| Preise | `/kontakt#preise` |
| Newsletter-Anmeldung | `/kontakt#newsletter` |
| Impressum | `/impressum` |
| Datenschutz | `/datenschutz` |
| Shop | bleibt extern (`shop.kinoweinheim.de`) — **kein** Redirect |
| Brennessel Hemsbach | bleibt extern (`brennessel-kino.de`) — **kein** Redirect |

Einzelne Film-Seiten der alten Site (statische HTML-„topics") haben keine
dauerhaften Entsprechungen — sie werden pauschal auf `/programm` geleitet.

---

## So wird es umgesetzt (in `vercel.json`)

Wenn die echten alten Pfade feststehen, kommt ein `redirects`-Block in die
`vercel.json`. Vorlage (Pfade sind Platzhalter, vor Aktivierung ersetzen):

```jsonc
{
  "redirects": [
    { "source": "/pages/programm.php",       "destination": "/programm",                 "permanent": true },
    { "source": "/pages/kaffee-tee-kino.php", "destination": "/events/kaffee-tee-kino",   "permanent": true },
    { "source": "/pages/vermietung.php",      "destination": "/vermietung",               "permanent": true },
    { "source": "/pages/kontakt.php",         "destination": "/kontakt",                  "permanent": true },
    { "source": "/pages/impressum.php",       "destination": "/impressum",                "permanent": true }
    // … weitere nach Bestätigung der Alt-Pfade
  ]
}
```

`"permanent": true` erzeugt eine **301**-Weiterleitung (das ist die, die Google
den „Umzug" mitteilt und das Ranking überträgt). `redirects` kann parallel zu
den bestehenden `headers` und `crons` in derselben `vercel.json` stehen.

---

## Reihenfolge am Launch-Tag

1. Domain-Entscheidung steht
2. Exakte alte Pfade aus dem alten Site-Mirror sammeln
3. `redirects`-Block in `vercel.json` einsetzen, committen, deployen
4. Stichprobe: alte Adresse im Browser aufrufen → landet auf neuer Seite (301)
5. Alte Website abschalten (oder DNS auf Vercel umstellen)

---

*Stand: 25.07.2026 · Gehört zu Abschnitt 4 der `LAUNCH-CHECKLIST.md`*
