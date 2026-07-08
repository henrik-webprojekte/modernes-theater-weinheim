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

export type Saal = {
  _id: string
  name: string
  slug: {current: string}
  plaetze: number
  kurzbeschreibung?: string
  farbakzent?: string
  kicker?: string
  charakterUntertitel?: string
  technik?: string
}

export async function getSaele(): Promise<Saal[]> {
  return sanity.fetch<Saal[]>(
    `*[_type == "saal"] | order(plaetze desc) {
      _id, name, slug, plaetze, kurzbeschreibung, farbakzent,
      kicker, charakterUntertitel, technik
    }`
  )
}

export type Vorstellung = {
  datum: string
  uhrzeit: string
  format: "2D" | "3D"
  saal: {
    _id: string
    name: string
    farbakzent?: string
  } | null
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
  laenge: number
  fsk: number
  genre?: string
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
  status: "entwurf" | "aktiv" | "archiviert"
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
  return sanity.fetch<Film | null>(
    `*[_type == "film" && slug.current == $slug][0]{
      _id,
      titel,
      slug,
      plakat,
      laenge,
      fsk,
      genre,
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
      }
    }`,
    {slug}
  )
}

export async function getAktiveFilme(): Promise<Film[]> {
  return sanity.fetch<Film[]>(
    `*[_type == "film" && status == "aktiv"] | order(titel asc) {
      _id,
      titel,
      slug,
      plakat,
      laenge,
      fsk,
      genre,
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
      }
    }`
  )
}

function heuteIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getFilmeMitBevorstehendenVorstellungen(limit = 4): Promise<Film[]> {
  const alle = await getAktiveFilme()
  const heute = heuteIsoDate()
  const withNext = alle
    .map((f) => {
      const kommende = (f.vorstellungen ?? [])
        .filter((v) => v.datum && v.datum >= heute)
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
