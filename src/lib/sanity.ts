import {createClient} from "@sanity/client"

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
  }
  laenge: number
  fsk: number
  genre?: string
  kurzbeschreibung?: string
  trailerUrl?: string
  istIn3dVerfuegbar: boolean
  istSneak: boolean
  istSonderreihe: boolean
  badges?: string[]
  vorstellungen?: Vorstellung[]
  status: "entwurf" | "aktiv" | "archiviert"
}

export type Event = {
  _id: string
  titel: string
  slug: {current: string}
  kategorie: string
  kurzbeschreibung?: string
  startDatum: string
  endDatum?: string
  wiederkehrend?: string
  ort?: string
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
      badges,
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
      badges,
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
