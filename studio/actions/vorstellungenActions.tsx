/**
 * Zwei Aufräum-Knöpfe im geöffneten Film (Menü neben „Veröffentlichen"):
 *
 *  1. „Alle Vorstellungen löschen"        — leert Termine und Serien komplett
 *  2. „Vergangene Vorstellungen entfernen" — löscht nur, was vor heute liegt
 *
 * Beide schreiben direkt in den Entwurf UND in die veröffentlichte Fassung,
 * damit die Website die Änderung sofort übernimmt und kein zweiter Klick auf
 * „Veröffentlichen" nötig ist. Jede Fassung wird dabei einzeln gefiltert, damit
 * ein Entwurf keine fremden Termine untergeschoben bekommt.
 */
import {useCallback, useState} from 'react'
import {ClockIcon, TrashIcon} from '@sanity/icons'
import {useToast} from '@sanity/ui'
import {useClient, type DocumentActionComponent, type DocumentActionProps} from 'sanity'
import {
  alsDeutschesDatum,
  beschreibeBestand,
  heuteIso,
  ohneVergangene,
  zaehleAlles,
  zaehleVergangenes,
  type FilmDokument,
} from '../lib/vorstellungen'

const API_VERSION = '2024-01-01'

/** Entwurf und veröffentlichte Fassung, soweit vorhanden. */
function beideFassungen(props: DocumentActionProps): FilmDokument[] {
  return [props.draft, props.published].filter(Boolean) as FilmDokument[]
}

/** Setzt die Arrays eines Dokuments; leere Arrays werden entfernt statt gesetzt. */
function feldMutation(vorstellungen: unknown[], spielwochen: unknown[]) {
  const set: Record<string, unknown> = {}
  const unset: string[] = []
  if (vorstellungen.length) set.vorstellungen = vorstellungen
  else unset.push('vorstellungen')
  if (spielwochen.length) set.spielwochen = spielwochen
  else unset.push('spielwochen')
  return {set, unset}
}

/** „Alle Vorstellungen löschen" */
export const useAlleVorstellungenLoeschen: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const [dialogOffen, setDialogOffen] = useState(false)
  const [laeuft, setLaeuft] = useState(false)

  const sichtbar = (props.draft ?? props.published) as FilmDokument | null
  const bestand = zaehleAlles(sichtbar)
  const nichtsDa = bestand.termine === 0

  const ausfuehren = useCallback(async () => {
    setLaeuft(true)
    try {
      const transaktion = client.transaction()
      for (const fassung of beideFassungen(props)) {
        if (!fassung._id) continue
        transaktion.patch(fassung._id, (p) => p.unset(['vorstellungen', 'spielwochen']))
      }
      await transaktion.commit({visibility: 'async'})
      toast.push({
        status: 'success',
        title: 'Vorstellungen gelöscht',
        description: `${beschreibeBestand(bestand)} entfernt.`,
      })
      setDialogOffen(false)
    } catch (fehler) {
      toast.push({
        status: 'error',
        title: 'Löschen fehlgeschlagen',
        description: fehler instanceof Error ? fehler.message : 'Unbekannter Fehler',
      })
    } finally {
      setLaeuft(false)
    }
  }, [bestand, client, props, toast])

  return {
    label: laeuft ? 'Wird gelöscht …' : 'Alle Vorstellungen löschen',
    icon: TrashIcon,
    tone: 'critical',
    disabled: laeuft || nichtsDa,
    title: nichtsDa ? 'Dieser Film hat keine Vorstellungen.' : undefined,
    onHandle: () => setDialogOffen(true),
    dialog: dialogOffen && {
      type: 'confirm' as const,
      tone: 'critical' as const,
      message: `Wirklich ${beschreibeBestand(bestand)} von „${sichtbar?.titel ?? 'diesem Film'}" löschen? Der Film selbst bleibt erhalten, nur seine Spielzeiten werden geleert. Das lässt sich nicht rückgängig machen.`,
      confirmButtonText: 'Ja, alle löschen',
      cancelButtonText: 'Abbrechen',
      onConfirm: ausfuehren,
      onCancel: () => setDialogOffen(false),
    },
  }
}

useAlleVorstellungenLoeschen.displayName = 'AlleVorstellungenLoeschen'

/** „Vergangene Vorstellungen entfernen" */
export const useVergangeneVorstellungenEntfernen: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: API_VERSION})
  const toast = useToast()
  const [dialogOffen, setDialogOffen] = useState(false)
  const [laeuft, setLaeuft] = useState(false)

  const stichtag = heuteIso()
  const sichtbar = (props.draft ?? props.published) as FilmDokument | null
  const bestand = zaehleVergangenes(sichtbar, stichtag)
  const nichtsDa = bestand.termine === 0

  const ausfuehren = useCallback(async () => {
    setLaeuft(true)
    try {
      const transaktion = client.transaction()
      for (const fassung of beideFassungen(props)) {
        if (!fassung._id) continue
        const bereinigt = ohneVergangene(fassung, stichtag)
        const {set, unset} = feldMutation(bereinigt.vorstellungen, bereinigt.spielwochen)
        transaktion.patch(fassung._id, (p) => {
          let patch = p
          if (Object.keys(set).length) patch = patch.set(set)
          if (unset.length) patch = patch.unset(unset)
          return patch
        })
      }
      await transaktion.commit({visibility: 'async'})
      toast.push({
        status: 'success',
        title: 'Vergangene Vorstellungen entfernt',
        description: `${beschreibeBestand(bestand)} vor dem ${alsDeutschesDatum(stichtag)} entfernt.`,
      })
      setDialogOffen(false)
    } catch (fehler) {
      toast.push({
        status: 'error',
        title: 'Entfernen fehlgeschlagen',
        description: fehler instanceof Error ? fehler.message : 'Unbekannter Fehler',
      })
    } finally {
      setLaeuft(false)
    }
  }, [bestand, client, props, stichtag, toast])

  return {
    label: laeuft ? 'Wird aufgeräumt …' : 'Vergangene Vorstellungen entfernen',
    icon: ClockIcon,
    disabled: laeuft || nichtsDa,
    title: nichtsDa
      ? 'Bei diesem Film liegt nichts in der Vergangenheit.'
      : `${bestand.termine} Termine vor dem ${alsDeutschesDatum(stichtag)}`,
    onHandle: () => setDialogOffen(true),
    dialog: dialogOffen && {
      type: 'confirm' as const,
      tone: 'caution' as const,
      message: `Bei „${sichtbar?.titel ?? 'diesem Film'}" ${beschreibeBestand(bestand)} vor dem ${alsDeutschesDatum(stichtag)} entfernen? Alles ab heute bleibt stehen. Eine angebrochene Vorstellungsserie wird erst gelöscht, wenn ihr letzter Tag vorbei ist.`,
      confirmButtonText: 'Ja, aufräumen',
      cancelButtonText: 'Abbrechen',
      onConfirm: ausfuehren,
      onCancel: () => setDialogOffen(false),
    },
  }
}

useVergangeneVorstellungenEntfernen.displayName = 'VergangeneVorstellungenEntfernen'
