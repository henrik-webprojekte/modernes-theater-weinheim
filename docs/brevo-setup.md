# Brevo-Setup — Dokumentation & Umzugsplan

**Stand: 09.07.2026 · Status: Test-Setup live und End-to-End verifiziert**

## Aktueller Zustand (Test-Setup)

- **Konto:** Brevo-Free-Konto auf Henris E-Mail (rikstar44@gmail.com), Firmenname „Modernes Theater Test"
- **Absender:** rikstar44@gmail.com (verifiziert; Brevo versendet mangels Domain-Auth über `@brevosend.com`)
- **Liste:** „Newsletter Test"
- **DOI-Template:** ID **6** — „Standard-Template für Double-Opt-in-Bestätigungen" (vom Formular-Assistenten erzeugt)
- **Vercel-Env-Vars (Production):** `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_TEMPLATE_ID=6`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `BREVO_VERMIETUNG_TO` (→ Henris Adresse, damit Testanfragen NICHT ans Kino gehen)
- **Newsletter-E2E-Test:** ✅ bestanden (Anmeldung → DOI-Mail → Bestätigung → Kontakt in Liste → Redirect auf /newsletter-bestaetigt)
- ⚠️ **Befund 24.07.2026:** Der Test-Kontakt liegt in **„Ihre erste Liste" (ID 2)**,
  nicht in „Newsletter Test" (ID 3, 0 Kontakte). `BREVO_LIST_ID` zeigt also
  vermutlich auf **2** — die Liste #3 entstand erst nach dem Test (10:00 vs. 12:19).
  Der Wert ist in Vercel „Sensitive" und nicht auslesbar; Klärung nur über einen
  Verhaltenstest (Anmeldung mit Plus-Alias, dann sehen welcher Listenzähler steigt).
  **Beim Konto-Umzug ohnehin neu setzen — dann bewusst und mit Test verifizieren.**
- **Vermietungs-E2E-Test:** ✅ bestanden (Anfrage → Mail an BREVO_VERMIETUNG_TO → Reply-To = Anfragender)

## ⚠️ Die DOI-Template-Falle (teuer gelernt am 09.07.2026)

**Brevo akzeptiert für die API `POST /v3/contacts/doubleOptinConfirmation` NUR
Templates, die intern als „DOI-Template" markiert sind (`doiTemplate: true`).**

- Templates aus **Marketing → Templates** (Drag-&-Drop-Editor) werden **niemals**
  als DOI-Template erkannt — egal ob `{{ params.DOIurl }}` im Button, im
  HTML-Block oder per API-PUT im HTML steht. Fehler: `400 — "An active DOI
  template does not exist"`.
- ⚠️ **Zusatzbefund 24.07.2026 — der Platzhalter war AUCH falsch:** Die
  funktionierende Vorlage #6 nutzt im Button `{{ doubleoptin }}`, die
  gescheiterte Eigenkreation #2 nutzte `{{ params.DOIurl }}`. **Nur
  `{{ doubleoptin }}` erzeugt den echten Bestätigungslink.** Beim Umgestalten
  einer DOI-Vorlage muss dieser Platzhalter zeichengenau erhalten bleiben —
  Design und Texte drumherum sind frei änderbar.
- ✅ **Entwarnung 24.07.2026 (E2E-getestet):** Eine bestehende DOI-Vorlage
  **darf inhaltlich komplett ersetzt werden** — HTML, Design, Texte, Betreff —
  ohne die DOI-Fähigkeit zu verlieren. Vorlage #6 wurde auf Kino-Design
  (Creme/Kino-Rot, Sie-Form, Adresse im Fuß) umgebaut, Anmeldung funktioniert
  weiterhin. **Nur nicht: neue Vorlage anlegen oder `{{ doubleoptin }}` ändern.**
  → Im Ziel-Konto also: Vorlage per Assistent erzeugen, dann Design einsetzen.
- DOI-Templates entstehen **ausschließlich über den Formular-Assistenten**:
  Marketing → **Formulare** → Anmeldeformular anlegen → Schritt „Einstellungen" →
  „Double-Opt-in-E-Mail" → „Standard-Template für Double-Opt-in-Bestätigungen"
  wählen → Assistent **bis zum Ende** durchklicken. Das Formular selbst wird
  nie benutzt — es dient nur als Geburtshelfer für das Template.
- Prüfen, welches Template DOI-fähig ist (PowerShell, `$k` = API-Key):

```powershell
$r = Invoke-RestMethod -Uri "https://api.brevo.com/v3/smtp/templates?limit=50" -Headers @{ "api-key" = $k }
$r.templates | ForEach-Object {
  $d = Invoke-RestMethod -Uri ("https://api.brevo.com/v3/smtp/templates/" + $_.id) -Headers @{ "api-key" = $k }
  [PSCustomObject]@{ id = $_.id; name = $_.name; aktiv = $d.isActive; doiTemplate = $d.doiTemplate }
} | Format-Table -AutoSize
```

Quelle der Lösung: raab-online-marketing.com/blog/brevo-doi-link-funktioniert-nicht/

## Umzugsplan: Test-Konto → echtes Kino-Konto (vor Go-Live)

1. **Konto-Entscheidung (Kino):** Bestehendes Brevo-Konto von GTM Schubert
   übernehmen (Zugang anfragen) **oder** neues Konto auf Kino-E-Mail.
   **Empfehlung: Übernahme** — dort lebt die bestehende Abonnenten-Liste der
   alten Website samt dokumentierter Einwilligungen. Bei einem neuen Konto
   müssten alle Abonnenten neu gewonnen werden (Einwilligungen sind nicht
   übertragbar ohne sauberen Export/Import-Nachweis).
2. **Domain-Absender verifizieren:** z. B. `newsletter@kinoweinheim.de` —
   erfordert DNS-Einträge (DKIM/SPF/Brevo-Code) beim Domain-Hoster. Erst damit
   verschwindet der `@brevosend.com`-Ersatzabsender und die Zustellbarkeit
   wird produktionstauglich.
3. **Im Zielkonto anlegen:** Liste „Newsletter", DOI-Template über den
   Formular-Assistenten (siehe Falle oben!), API-Key erzeugen.
4. **Vercel-Env-Vars tauschen** (alle in Production): `BREVO_API_KEY`,
   `BREVO_LIST_ID`, `BREVO_TEMPLATE_ID`, `BREVO_SENDER_EMAIL`
   (Domain-Adresse), `BREVO_SENDER_NAME` („Modernes Theater Weinheim").
   **`BREVO_VERMIETUNG_TO` LÖSCHEN** — ohne die Variable greift der
   Code-Default `veranstaltung@kinoweinheim.de`.
5. **Redeploy** → beide E2E-Tests wiederholen (Newsletter + Vermietung).
6. **DPA/AVV archivieren** (siehe docs/rechtliches-vorbereitung.md).
7. **Aufräumen:** Henris Test-Kontakt aus der Liste löschen, Test-Konto
   stilllegen, Test-API-Key widerrufen.

## Betrieb nach Go-Live

- Die Website übernimmt nur die **Anmeldung** (DOI-konform). Den eigentlichen
  Newsletter-**Versand** macht das Kino in Brevo: Kampagnen → E-Mail-Kampagne
  an die Liste „Newsletter". Free-Plan: 300 Mails/Tag — bei wachsender Liste
  ggf. auf einen bezahlten Plan wechseln oder Versand über mehrere Tage.
- Abmeldelink ist in Brevo-Kampagnen automatisch enthalten (Pflicht).
- Das Vermietungsformular versendet über denselben Brevo-Account
  Transaktions-Mails an `veranstaltung@kinoweinheim.de` mit Reply-To des
  Anfragenden.
