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
  kurzbeschreibung?: string
  trailerUrl?: string
  istIn3dVerfuegbar: boolean
  istSneak: boolean
  istSonderreihe: boolean
  istKaffeeTeeKino: boolean
  istNeu: boolean
  istPreview: boolean
  istOmU: boolean
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
function mitAufgeloestenSerien(film: Film): Film {
  const ausSerien = (film.spielwochen ?? []).flatMap(expandiereSpielwoche)
  const alle = [...(film.vorstellungen ?? []), ...ausSerien]
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
  kurzbeschreibung?: string
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
}

export async function getEvents(): Promise<Event[]> {
  return sanity.fetch<Event[]>(
    `*[_type == "event" && veroeffentlicht == true] | order(startDatum asc) {
      _id, titel, slug, kategorie, kurzbeschreibung,
      startDatum, endDatum, wiederkehrend, ort, veroeffentlicht
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
      startDatum, endDatum, wiederkehrend, ort, bild, veroeffentlicht
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
      istKaffeeTeeKino,
      istNeu,
      istPreview,
      istOmU,
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
    `*[_type == "film" && status == "aktiv"] | order(titel asc) {
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
      istKaffeeTeeKino,
      istNeu,
      istPreview,
      istOmU,
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

export async function getKommendeEvents(limit = 3): Promise<Event[]> {
  const alle = await getEvents()
  const heute = heuteIsoDate()
  return alle
    .filter((e) => !e.startDatum || (e.endDatum ?? e.startDatum) >= heute)
    .sort((a, b) => {
      const aDate = a.startDatum ?? "9999-12-31"
      const bDate = b.startDatum ?? "9999-12-31"
      return aDate.localeCompare(bDate)
    })
    .slice(0, limit)
}
