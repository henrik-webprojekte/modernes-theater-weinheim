import {createClient} from "@sanity/client"
import imageUrlBuilder from "@sanity/image-url"
import type {SanityImageSource} from "@sanity/image-url/lib/types/types"

const projectId = import.meta.env.SANITY_PROJECT_ID
const dataset = import.meta.env.SANITY_DATASET

if (!projectId || !dataset) {
  throw new Error(
    "SANITY_PROJECT_ID oder SANITY_DATASET fehlt in der .env-Datei"
  )
}

export const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  useCdn: true,
})

const imageBuilder = imageUrlBuilder(sanity)

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source).auto("format")
}

export type Fakt = {
  wert: string
  label: string
}

export type Saal = {
  _id: string
  name: string
  slug: {current: string}
  reihenfolge?: number
  plaetze: number
  kurzbeschreibung?: string
  beschreibungLang?: unknown[]
  farbakzent?: string
  hintergrundFarbe?: string
  dunklerHintergrund?: boolean
  kicker?: string
  charakterUntertitel?: string
  technik?: string
  fakten?: Fakt[]
  bild?: {
    asset: {_ref: string; _type: string}
    hotspot?: {x: number; y: number; height: number; width: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
}

export type Preis = {
  wert: string
  label: string
  highlight?: boolean
}

export type KinoInfo = {
  preise?: Preis[]
  zuschlaege?: string[]
  oeffnungszeitenKasse?: string
  oeffnungszeitenZusatz?: string
}

/** Singleton „Preise & Öffnungszeiten" (Dokument-ID kinoInfo).
 *  Liefert null, solange das Kino den Eintrag noch nicht gepflegt hat —
 *  die Kontakt-Seite fällt dann auf ihre eingebauten Werte zurück. */
export async function getKinoInfo(): Promise<KinoInfo | null> {
  return sanity.fetch<KinoInfo | null>(
    `*[_type == "kinoInfo"][0] {
      preise, zuschlaege, oeffnungszeitenKasse, oeffnungszeitenZusatz
    }`
  )
}

export async function getSaele(): Promise<Saal[]> {
  return sanity.fetch<Saal[]>(
    `*[_type == "saal"] | order(coalesce(reihenfolge, 999) asc, plaetze desc) {
      _id, name, slug, reihenfolge, plaetze, kurzbeschreibung, beschreibungLang,
      farbakzent, hintergrundFarbe, dunklerHintergrund,
      kicker, charakterUntertitel, technik, fakten, bild
    }`
  )
}

export type Saalref = {
  _id: string
  name: string
  farbakzent?: string
} | null

export type Vorstellung = {
  datum: string
  uhrzeit: string
  format: "2D" | "3D"
  saal: Saalref
  /** Gesetzt bei der einen Vorstellung, die als Kaffee-Tee-Kino läuft. */
  istKaffeeTeeKino?: boolean
  einlass?: string
  eintritt?: string
  /** Einzeln angepinnt: erscheint auf der Startseite im Rampenlicht. */
  hervorheben?: boolean
}

/** Vorstellungsserie aus Sanity: Uhrzeit + eine Kinowoche + angekreuzte
 *  Wochentage. Wird beim Laden in einzelne Vorstellungen aufgelöst. */
export type Spielwoche = {
  uhrzeit: string
  woche: string
  wochentage?: number[]
  format: "2D" | "3D"
  saal: Saalref
}

/** Der eine Kaffee-Tee-Kino-Termin eines Films (Reihe: 1. Mittwoch im Monat). */
export type KaffeeTeeKinoTermin = {
  datum?: string
  beginn?: string
  einlass?: string
  eintritt?: string
  saal?: Saalref
  hervorheben?: boolean
}

export type Film = {
  _id: string
  titel: string
  slug: {current: string}
  plakat?: {
    asset: {_ref: string; _type: string}
    hotspot?: {x: number; y: number; height: number; width: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
  laenge?: number
  fsk?: number
  genre?: string
  hinweis?: string
  /** Seit der Umstellung Fließtext; ältere Datensätze können noch String sein. */
  kurzbeschreibung?: unknown
  trailerUrl?: string
  istIn3dVerfuegbar: boolean
  istSneak: boolean
  istSonderreihe: boolean
  kaffeeTeeKino?: KaffeeTeeKinoTermin
  istNeu: boolean
  istPreview: boolean
  istOmU: boolean
  angepinnt?: boolean
  vorstellungen?: Vorstellung[]
  spielwochen?: Spielwoche[]
  status: "entwurf" | "aktiv" | "archiviert"
}

/** Wandelt die Vorstellungsserien eines Films in einzelne Vorstellungen um
 *  und hängt sie an film.vorstellungen an. Rein datumsbasiert (UTC), damit
 *  das Ergebnis unabhängig von der Bau-Zeitzone reproduzierbar ist. */
function isoZuUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
}
function utcZuIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function expandiereSpielwoche(sw: Spielwoche): Vorstellung[] {
  if (!sw.woche || !sw.uhrzeit || !sw.wochentage?.length) return []
  // Donnerstag (Starttag) der Kinowoche, die den gewählten Tag enthält
  const basis = isoZuUtc(sw.woche)
  const seitDonnerstag = (basis.getUTCDay() - 4 + 7) % 7
  const donnerstag = new Date(basis)
  donnerstag.setUTCDate(basis.getUTCDate() - seitDonnerstag)
  return sw.wochentage.map((w) => {
    const offset = (w - 4 + 7) % 7 // Do=0, Fr=1, … Mi=6
    const tag = new Date(donnerstag)
    tag.setUTCDate(donnerstag.getUTCDate() + offset)
    return {datum: utcZuIso(tag), uhrzeit: sw.uhrzeit, format: sw.format ?? "2D", saal: sw.saal ?? null}
  })
}

/** Führt Einzel-Vorstellungen und aufgelöste Serien zu einer Liste zusammen;
 *  entfernt exakte Doppel (gleiches Datum/Uhrzeit/Format/Saal). */
/** Vorbelegung der Reihe, falls im Termin nichts Abweichendes steht. */
export const KTK_BEGINN = "15:00"
export const KTK_EINLASS = "14:00"
export const KTK_EINTRITT = "8,00 €"

/** Der Kaffee-Tee-Kino-Termin eines Films als vollwertige Vorstellung. */
export function kaffeeTeeKinoVorstellung(film: Film): Vorstellung | null {
  const termin = film.kaffeeTeeKino
  if (!termin?.datum) return null
  return {
    datum: termin.datum,
    uhrzeit: termin.beginn || KTK_BEGINN,
    format: "2D",
    saal: termin.saal ?? null,
    istKaffeeTeeKino: true,
    einlass: termin.einlass || KTK_EINLASS,
    eintritt: termin.eintritt || KTK_EINTRITT,
    hervorheben: termin.hervorheben,
  }
}

function mitAufgeloestenSerien(film: Film): Film {
  const ausSerien = (film.spielwochen ?? []).flatMap(expandiereSpielwoche)
  const ktk = kaffeeTeeKinoVorstellung(film)
  // Der Kaffee-Tee-Kino-Termin steht vorn: Trifft er zufällig auf eine
  // gleiche reguläre Vorstellung, gewinnt er beim Entdoppeln — er trägt
  // die zusätzlichen Angaben der Reihe.
  const alle = [...(ktk ? [ktk] : []), ...(film.vorstellungen ?? []), ...ausSerien]
  const gesehen = new Set<string>()
  const vorstellungen = alle.filter((v) => {
    const key = `${v.datum}|${v.uhrzeit}|${v.format}|${v.saal?._id ?? ""}`
    if (gesehen.has(key)) return false
    gesehen.add(key)
    return true
  })
  return {...film, vorstellungen}
}

export type Event = {
  _id: string
  titel: string
  slug: {current: string}
  kategorie: string
  /** Seit der Umstellung Fließtext; ältere Datensätze können noch String sein. */
  kurzbeschreibung?: unknown
  beschreibungLang?: unknown[]
  startDatum: string
  endDatum?: string
  wiederkehrend?: string
  ort?: string
  bild?: {
    asset: {_ref: string; _type: string}
    hotspot?: {x: number; y: number; height: number; width: number}
    crop?: {top: number; bottom: number; left: number; right: number}
  }
  veroeffentlicht: boolean
  angepinnt?: boolean
  pinnHinweis?: string
}

export async function getEvents(): Promise<Event[]> {
  return sanity.fetch<Event[]>(
    `*[_type == "event" && veroeffentlicht == true] | order(startDatum asc) {
      _id, titel, slug, kategorie, kurzbeschreibung,
      startDatum, endDatum, wiederkehrend, ort, veroeffentlicht,
      angepinnt, pinnHinweis
    }`
  )
}

export async function getEventSlugs(): Promise<string[]> {
  const slugs = await sanity.fetch<{current: string}[]>(
    `*[_type == "event" && veroeffentlicht == true && defined(slug.current)]{ "current": slug.current }`
  )
  return slugs.map((s) => s.current)
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  return sanity.fetch<Event | null>(
    `*[_type == "event" && slug.current == $slug][0]{
      _id, titel, slug, kategorie, kurzbeschreibung, beschreibungLang,
      startDatum, endDatum, wiederkehrend, ort, bild, veroeffentlicht,
      angepinnt, pinnHinweis
    }`,
    {slug}
  )
}

export async function getFilmSlugs(): Promise<string[]> {
  const slugs = await sanity.fetch<{current: string}[]>(
    `*[_type == "film" && status == "aktiv" && defined(slug.current)]{ "current": slug.current }`
  )
  return slugs.map((s) => s.current)
}

export async function getFilmBySlug(slug: string): Promise<Film | null> {
  const film = await sanity.fetch<Film | null>(
    `*[_type == "film" && slug.current == $slug][0]{
      _id,
      titel,
      slug,
      plakat,
      laenge,
      fsk,
      genre,
      hinweis,
      kurzbeschreibung,
      trailerUrl,
      istIn3dVerfuegbar,
      istSneak,
      istSonderreihe,
      kaffeeTeeKino {
        datum,
        beginn,
        einlass,
        eintritt,
        hervorheben,
        "saal": saal->{ _id, name, farbakzent }
      },
      istNeu,
      istPreview,
      istOmU,
      angepinnt,
      status,
      vorstellungen[] {
        datum,
        uhrzeit,
        format,
        hervorheben,
        "saal": saal->{ _id, name, farbakzent }
      },
      spielwochen[] {
        uhrzeit,
        woche,
        wochentage,
        format,
        "saal": saal->{ _id, name, farbakzent }
      }
    }`,
    {slug}
  )
  return film ? mitAufgeloestenSerien(film) : null
}

export async function getAktiveFilme(): Promise<Film[]> {
  const filme = await sanity.fetch<Film[]>(
    `*[_type == "film" && status == "aktiv"]
     | order(
         coalesce(istSneak, false) asc,
         coalesce(angepinnt, false) desc,
         coalesce(istNeu, false) desc,
         titel asc
       ) {
      _id,
      titel,
      slug,
      plakat,
      laenge,
      fsk,
      genre,
      hinweis,
      kurzbeschreibung,
      trailerUrl,
      istIn3dVerfuegbar,
      istSneak,
      istSonderreihe,
      kaffeeTeeKino {
        datum,
        beginn,
        einlass,
        eintritt,
        hervorheben,
        "saal": saal->{ _id, name, farbakzent }
      },
      istNeu,
      istPreview,
      istOmU,
      angepinnt,
      status,
      vorstellungen[] {
        datum,
        uhrzeit,
        format,
        hervorheben,
        "saal": saal->{ _id, name, farbakzent }
      },
      spielwochen[] {
        uhrzeit,
        woche,
        wochentage,
        format,
        "saal": saal->{ _id, name, farbakzent }
      }
    }`
  )
  return filme.map(mitAufgeloestenSerien)
}

function heuteIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Ende der laufenden Kinowoche (Donnerstag bis Mittwoch):
 *  liefert das ISO-Datum des Mittwochs. Gleiche Wochenlogik wie der
 *  Wochen-Umschalter auf /programm. */
function kinowocheEndeIsoDate(): string {
  const d = new Date()
  const diffZuDonnerstag = (d.getDay() - 4 + 7) % 7
  d.setDate(d.getDate() - diffZuDonnerstag + 6)
  return d.toISOString().slice(0, 10)
}

/** Filme mit Vorstellungen in der laufenden Kinowoche (heute bis
 *  einschließlich Mittwoch). Filme, deren nächste Vorstellung erst in
 *  einer späteren Kinowoche liegt (z. B. Kaffee-Tee-Kino nächsten Monat),
 *  gehören nicht zu „Diese Woche im Kino" und fallen raus. */
export async function getFilmeMitBevorstehendenVorstellungen(limit = 4): Promise<Film[]> {
  const alle = await getAktiveFilme()
  const heute = heuteIsoDate()
  const bis = kinowocheEndeIsoDate()
  const withNext = alle
    .map((f) => {
      const kommende = (f.vorstellungen ?? [])
        .filter((v) => v.datum && v.datum >= heute && v.datum <= bis)
        .sort((a, b) =>
          (a.datum ?? "").localeCompare(b.datum ?? "") ||
          (a.uhrzeit ?? "").localeCompare(b.uhrzeit ?? "")
        )
      return {film: f, naechste: kommende[0]}
    })
    .filter((x) => x.naechste !== undefined)
    .sort((a, b) =>
      (a.naechste!.datum ?? "").localeCompare(b.naechste!.datum ?? "") ||
      (a.naechste!.uhrzeit ?? "").localeCompare(b.naechste!.uhrzeit ?? "")
    )
    .slice(0, limit)
  return withNext.map((x) => x.film)
}

/** Das Event, das die Reihe „Kaffee-Tee-Kino" beschreibt (der wiederkehrende
 *  Eintrag, nicht ein einzelner Termin). Liefert den Text, der bei jeder
 *  Kaffee-Tee-Kino-Vorstellung eingeblendet wird — gepflegt an einer Stelle. */
export async function getKaffeeTeeKinoReihe(): Promise<Event | null> {
  return sanity.fetch<Event | null>(
    `*[_type == "event" && kategorie == "kaffee-tee-kino" && veroeffentlicht == true
       && defined(wiederkehrend)] | order(_createdAt asc) [0]{
      _id, titel, slug, kategorie, kurzbeschreibung,
      startDatum, endDatum, wiederkehrend, ort, veroeffentlicht,
      angepinnt, pinnHinweis
    }`
  )
}

/** Ein Kaffee-Tee-Kino-Termin samt zugehörigem Film — für die Reihen-Seite. */
export type KaffeeTeeKinoEintrag = {film: Film; vorstellung: Vorstellung}

/** Alle noch bevorstehenden Kaffee-Tee-Kino-Termine, chronologisch.
 *  Gepflegt wird nur am Film; diese Liste entsteht daraus von selbst. */
export async function getKaffeeTeeKinoTermine(): Promise<KaffeeTeeKinoEintrag[]> {
  const filme = await getAktiveFilme()
  const heute = heuteIsoDate()
  const eintraege: KaffeeTeeKinoEintrag[] = []
  for (const film of filme) {
    const vorstellung = kaffeeTeeKinoVorstellung(film)
    if (vorstellung && vorstellung.datum >= heute) eintraege.push({film, vorstellung})
  }
  return eintraege.sort((a, b) => a.vorstellung.datum.localeCompare(b.vorstellung.datum))
}

/** Ist das Event noch aktuell? Wiederkehrende Reihen (Kaffee-Tee-Kino,
 *  Enzo-Day) laufen dauerhaft und bleiben immer stehen; alle anderen sind
 *  vorbei, sobald ihr letzter Tag verstrichen ist. */
export function istEventAktuell(event: Event, heute = heuteIsoDate()): boolean {
  if (event.wiederkehrend) return true
  if (!event.startDatum) return true
  return (event.endDatum ?? event.startDatum) >= heute
}

/** Chronologisch, wiederkehrende Reihen ans Ende (sie haben kein echtes Datum). */
export function nachDatum(a: Event, b: Event): number {
  const aDatum = a.wiederkehrend ? "9999-12-31" : (a.startDatum ?? "9999-12-31")
  const bDatum = b.wiederkehrend ? "9999-12-31" : (b.startDatum ?? "9999-12-31")
  return aDatum.localeCompare(bDatum) || a.titel.localeCompare(b.titel, "de")
}

/** Alle angepinnten Events, die noch aktuell sind — für die Event-Seite. */
export async function getAngepinnteEvents(): Promise<Event[]> {
  const alle = await getEvents()
  return alle.filter((e) => e.angepinnt && istEventAktuell(e)).sort(nachDatum)
}

/** Das eine Event für den Hinweis-Balken im Kopf jeder Seite: das
 *  nächststattfindende der angepinnten. Gibt es keins, bleibt der Balken weg. */
export async function getHinweisEvent(): Promise<Event | null> {
  const angepinnt = await getAngepinnteEvents()
  return angepinnt[0] ?? null
}

export async function getKommendeEvents(limit = 3): Promise<Event[]> {
  const alle = await getEvents()
  return alle
    .filter((e) => istEventAktuell(e))
    // Angepinntes zuerst, sonst chronologisch — damit ein hervorgehobenes
    // Event auch im Startseiten-Block „Nächste Höhepunkte" oben steht.
    .sort((a, b) => Number(Boolean(b.angepinnt)) - Number(Boolean(a.angepinnt)) || nachDatum(a, b))
    .slice(0, limit)
}

/* ────────────────────────────────────────────────────────────────────────
   Rampenlicht — der hervorgehobene Block ganz oben auf der Startseite
   ──────────────────────────────────────────────────────────────────────── */

/**
 * Ein Eintrag im Rampenlicht. Drei Herkünfte, eine gemeinsame Form, damit die
 * Startseite sie in einer Schleife ausgeben kann:
 *
 * - `vorstellung` — eine einzeln angepinnte Vorstellung (auch ein
 *   Kaffee-Tee-Kino-Termin). Verschwindet von allein, sobald sie vorbei ist.
 * - `film`        — ein angepinnter Film ohne konkreten Termin.
 * - `event`       — ein angepinntes Event.
 */
export type RampenlichtEintrag = {
  typ: "vorstellung" | "film" | "event"
  /** Für die Reihenfolge; angepinnte Filme ohne Termin haben keins. */
  datum?: string
  titel: string
  /** Kurzes Etikett darüber, z. B. „Kaffee-Tee-Kino" oder die Event-Kategorie. */
  kicker: string
  /** Termin im Klartext, z. B. „Mi 02.09. · 15:00 Uhr, Einlass 14:00". */
  termin?: string
  /** Zusatz aus dem Feld „Hinweis" bzw. der Event-Kurzbeschreibung. */
  hinweis?: string
  ziel: string
  bild?: Film["plakat"] | Event["bild"]
  /** Plakate stehen hochkant, Event-Bilder quer — die Kachel richtet sich danach. */
  bildFormat: "hochkant" | "quer"
}

/** Anzeigename der Event-Kategorien — die Liste steht im Studio-Schema
 *  `event.kategorie`; hier stehen dieselben Werte für die Website. */
export const EVENT_KATEGORIE_LABEL: Record<string, string> = {
  "kaffee-tee-kino": "Kaffee-Tee-Kino",
  "enzo-day": "Enzo-Day",
  "open-air": "Open Air",
  schmittini: "Zauberer Schmittini",
  sondervorstellung: "Sondervorstellung",
  sonstiges: "Sonstiges",
}

const WOCHENTAGE_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

function terminText(v: Vorstellung): string {
  const tag = WOCHENTAGE_KURZ[isoZuUtc(v.datum).getUTCDay()]
  const [, monat, tagZahl] = v.datum.split("-")
  const basis = `${tag} ${tagZahl}.${monat}. · ${v.uhrzeit} Uhr`
  return v.istKaffeeTeeKino && v.einlass ? `${basis}, Einlass ${v.einlass}` : basis
}

/**
 * Alles, was gerade im Rampenlicht steht — chronologisch, Termine zuerst.
 *
 * Was hier landet, entscheidet allein das Kino über die Schalter in Sanity.
 * Zwei Regeln halten den Block sauber, ohne dass jemand aufräumen muss:
 *
 * 1. Vorbei ist vorbei: Vorstellungen in der Vergangenheit und abgelaufene
 *    Events fallen automatisch raus.
 * 2. Der genauere Eintrag gewinnt: Ist an einem Film eine einzelne
 *    Vorstellung hervorgehoben, erscheint der Film nicht zusätzlich als
 *    eigener Eintrag — sonst stünde er doppelt im Block.
 */
export async function getRampenlicht(limit = 3): Promise<RampenlichtEintrag[]> {
  const [filme, events] = await Promise.all([getAktiveFilme(), getEvents()])
  const heute = heuteIsoDate()

  const ausVorstellungen: RampenlichtEintrag[] = []
  const filmeMitTermin = new Set<string>()

  for (const film of filme) {
    const hervorgehoben = (film.vorstellungen ?? [])
      .filter((v) => v.hervorheben && v.datum >= heute)
      .sort((a, b) => a.datum.localeCompare(b.datum) || a.uhrzeit.localeCompare(b.uhrzeit))

    for (const v of hervorgehoben) {
      filmeMitTermin.add(film._id)
      ausVorstellungen.push({
        typ: "vorstellung",
        datum: v.datum,
        titel: film.titel,
        kicker: v.istKaffeeTeeKino ? "Kaffee-Tee-Kino" : "Besondere Vorstellung",
        termin: terminText(v),
        hinweis: film.hinweis,
        ziel: `/programm/${film.slug.current}`,
        bild: film.plakat,
        bildFormat: "hochkant",
      })
    }
  }

  const ausFilmen: RampenlichtEintrag[] = filme
    .filter((f) => f.angepinnt && !filmeMitTermin.has(f._id))
    .map((f) => ({
      typ: "film" as const,
      titel: f.titel,
      kicker: f.istNeu ? "Neu im Programm" : "Unser Tipp",
      hinweis: f.hinweis,
      ziel: `/programm/${f.slug.current}`,
      bild: f.plakat,
      bildFormat: "hochkant" as const,
    }))

  const ausEvents: RampenlichtEintrag[] = events
    .filter((e) => e.angepinnt && istEventAktuell(e, heute))
    .map((e) => ({
      typ: "event" as const,
      datum: e.wiederkehrend ? undefined : e.startDatum,
      titel: e.titel,
      kicker: EVENT_KATEGORIE_LABEL[e.kategorie] ?? e.kategorie ?? "Event",
      termin: e.wiederkehrend || undefined,
      hinweis: e.pinnHinweis,
      ziel: `/events/${e.slug.current}`,
      bild: e.bild,
      bildFormat: "quer" as const,
    }))

  // Termine chronologisch nach vorn, Dauerhaftes ohne Datum dahinter.
  return [...ausVorstellungen, ...ausEvents, ...ausFilmen]
    .sort((a, b) => (a.datum ?? "9999-12-31").localeCompare(b.datum ?? "9999-12-31"))
    .slice(0, limit)
}
