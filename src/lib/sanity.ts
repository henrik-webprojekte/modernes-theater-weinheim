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
