/**
 * Gemeinsame Rechenlogik rund um Vorstellungen und Vorstellungsserien.
 *
 * Die Auflösung der Serien ist bewusst identisch zu `expandiereSpielwoche`
 * in `src/lib/sanity.ts` der Website (UTC-basiert, Kinowoche Donnerstag–Mittwoch),
 * damit Studio und Website exakt dieselben Termine sehen. Wird die Logik dort
 * geändert, muss sie hier mitgeändert werden.
 */

export type Vorstellung = {
  _key?: string
  datum?: string
  uhrzeit?: string
  format?: string
  saal?: unknown
}

export type Spielwoche = {
  _key?: string
  uhrzeit?: string
  woche?: string
  wochentage?: number[]
  format?: string
  saal?: unknown
}

/** Nur die Felder eines Film-Dokuments, die hier gebraucht werden. */
export type FilmDokument = {
  _id?: string
  titel?: string
  vorstellungen?: Vorstellung[]
  spielwochen?: Spielwoche[]
}

/** Was an Terminen in einem Film steckt bzw. entfernt würde. */
export type Bestand = {
  /** Einzelne Vorstellungen (Array-Einträge) */
  einzel: number
  /** Vorstellungsserien (Array-Einträge) */
  serien: number
  /** Tatsächliche Termine = Einzelvorstellungen + alle Tage aller Serien */
  termine: number
}

const LEER: Bestand = {einzel: 0, serien: 0, termine: 0}

function isoZuUtc(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
}

function utcZuIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Alle Einzeltermine einer Vorstellungsserie als ISO-Datum (YYYY-MM-DD). */
export function serienTermine(sw: Spielwoche | undefined): string[] {
  if (!sw?.woche || !sw?.uhrzeit || !sw?.wochentage?.length) return []
  const basis = isoZuUtc(sw.woche)
  if (Number.isNaN(basis.getTime())) return []
  // Donnerstag (Starttag) der Kinowoche, die den gewählten Tag enthält
  const seitDonnerstag = (basis.getUTCDay() - 4 + 7) % 7
  const donnerstag = new Date(basis)
  donnerstag.setUTCDate(basis.getUTCDate() - seitDonnerstag)
  return sw.wochentage.map((w) => {
    const tag = new Date(donnerstag)
    tag.setUTCDate(donnerstag.getUTCDate() + ((w - 4 + 7) % 7)) // Do=0, Fr=1, … Mi=6
    return utcZuIso(tag)
  })
}

/**
 * Letzter Termin einer Serie. Erst wenn dieser vorbei ist, gilt die ganze
 * Serie als Vergangenheit — eine angebrochene Woche bleibt vollständig stehen.
 */
export function serienEnde(sw: Spielwoche | undefined): string | null {
  const termine = serienTermine(sw).slice().sort()
  return termine.length ? termine[termine.length - 1] : null
}

/** Heutiges Datum als ISO — lokale Zeit, also Kinozeit. */
export function heuteIso(): string {
  const jetzt = new Date()
  const zweistellig = (n: number) => String(n).padStart(2, '0')
  return `${jetzt.getFullYear()}-${zweistellig(jetzt.getMonth() + 1)}-${zweistellig(jetzt.getDate())}`
}

/** ISO-Datum als DD.MM.YYYY für die Anzeige. */
export function alsDeutschesDatum(iso: string | undefined): string {
  if (!iso) return '?'
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}.${m}.${y}` : iso
}

/** Alles, was aktuell an dem Film hängt. */
export function zaehleAlles(doc: FilmDokument | null | undefined): Bestand {
  if (!doc) return LEER
  const einzelne = doc.vorstellungen ?? []
  const serien = doc.spielwochen ?? []
  return {
    einzel: einzelne.length,
    serien: serien.length,
    termine: einzelne.length + serien.reduce((summe, sw) => summe + serienTermine(sw).length, 0),
  }
}

/** Was am Stichtag bereits vorbei ist (alles echt vor dem Stichtag). */
export function zaehleVergangenes(doc: FilmDokument | null | undefined, stichtag: string): Bestand {
  if (!doc) return LEER
  const einzelne = (doc.vorstellungen ?? []).filter((v) => istVergangen(v, stichtag))
  const serien = (doc.spielwochen ?? []).filter((sw) => serieIstVergangen(sw, stichtag))
  return {
    einzel: einzelne.length,
    serien: serien.length,
    termine: einzelne.length + serien.reduce((summe, sw) => summe + serienTermine(sw).length, 0),
  }
}

function istVergangen(v: Vorstellung, stichtag: string): boolean {
  // Ohne Datum lässt sich nichts beurteilen — solche Einträge bleiben stehen.
  return Boolean(v?.datum) && (v.datum as string) < stichtag
}

function serieIstVergangen(sw: Spielwoche, stichtag: string): boolean {
  const ende = serienEnde(sw)
  return ende !== null && ende < stichtag
}

/** Die Arrays, wie sie nach dem Entfernen der vergangenen Termine aussehen. */
export function ohneVergangene(
  doc: FilmDokument | null | undefined,
  stichtag: string,
): {vorstellungen: Vorstellung[]; spielwochen: Spielwoche[]} {
  return {
    vorstellungen: (doc?.vorstellungen ?? []).filter((v) => !istVergangen(v, stichtag)),
    spielwochen: (doc?.spielwochen ?? []).filter((sw) => !serieIstVergangen(sw, stichtag)),
  }
}

/** „3 Vorstellungen und 1 Serie (10 Termine)" — für Dialoge und Listen. */
export function beschreibeBestand(bestand: Bestand): string {
  const teile: string[] = []
  if (bestand.einzel > 0) {
    teile.push(`${bestand.einzel} ${bestand.einzel === 1 ? 'einzelne Vorstellung' : 'einzelne Vorstellungen'}`)
  }
  if (bestand.serien > 0) {
    teile.push(`${bestand.serien} ${bestand.serien === 1 ? 'Vorstellungsserie' : 'Vorstellungsserien'}`)
  }
  if (!teile.length) return 'nichts'
  const aufzaehlung = teile.join(' und ')
  return `${aufzaehlung} (zusammen ${bestand.termine} ${bestand.termine === 1 ? 'Termin' : 'Termine'})`
}
