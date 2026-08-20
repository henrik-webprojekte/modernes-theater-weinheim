/**
 * Werkzeug „Aufräumen" in der oberen Studio-Leiste.
 *
 * Zeigt für alle Filme auf einen Blick, wie viele Termine bereits vorbei sind,
 * und entfernt sie auf Knopfdruck in einem Rutsch. Gearbeitet wird auf der
 * Roh-Ebene (`perspective: 'raw'`), damit Entwurf und veröffentlichte Fassung
 * eines Films gleichermaßen bereinigt werden — sonst tauchen alte Termine beim
 * nächsten Veröffentlichen wieder auf.
 */
import {useCallback, useEffect, useMemo, useState} from 'react'
import {ClockIcon, TrashIcon} from '@sanity/icons'
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Dialog,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  TextInput,
  useToast,
} from '@sanity/ui'
import {useClient} from 'sanity'
import {
  alsDeutschesDatum,
  beschreibeBestand,
  heuteIso,
  ohneVergangene,
  zaehleAlles,
  zaehleVergangenes,
  type Bestand,
  type FilmDokument,
} from '../lib/vorstellungen'

const API_VERSION = '2024-01-01'

type Fassung = FilmDokument & {_id: string}

/** Ein Film mit allen seinen Fassungen (Entwurf und/oder veröffentlicht). */
type Gruppe = {
  basisId: string
  titel: string
  fassungen: Fassung[]
  vergangen: Bestand
  gesamt: Bestand
  hatEntwurf: boolean
}

function basisId(id: string): string {
  return id.replace(/^drafts\./, '')
}

export function AufraeumenTool() {
  const client = useClient({apiVersion: API_VERSION})
  const rohClient = useMemo(() => client.withConfig({perspective: 'raw', useCdn: false}), [client])
  const toast = useToast()

  const [stichtag, setStichtag] = useState(heuteIso())
  const [fassungen, setFassungen] = useState<Fassung[] | null>(null)
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState<string | null>(null)
  const [raeumtAuf, setRaeumtAuf] = useState(false)
  const [dialogOffen, setDialogOffen] = useState(false)

  const laden = useCallback(async () => {
    setLaedt(true)
    setFehler(null)
    try {
      const ergebnis = await rohClient.fetch<Fassung[]>(
        `*[_type == "film"]{_id, titel, vorstellungen, spielwochen}`,
      )
      setFassungen(ergebnis)
    } catch (ausnahme) {
      setFehler(
        ausnahme instanceof Error ? ausnahme.message : 'Filme konnten nicht geladen werden.',
      )
    } finally {
      setLaedt(false)
    }
  }, [rohClient])

  useEffect(() => {
    laden()
  }, [laden])

  // Fassungen zu Filmen zusammenfassen und durchrechnen
  const gruppen = useMemo<Gruppe[]>(() => {
    if (!fassungen) return []
    const nachFilm = new Map<string, Fassung[]>()
    for (const fassung of fassungen) {
      const schluessel = basisId(fassung._id)
      const liste = nachFilm.get(schluessel)
      if (liste) liste.push(fassung)
      else nachFilm.set(schluessel, [fassung])
    }
    const alle: Gruppe[] = []
    nachFilm.forEach((liste, schluessel) => {
      const entwurf = liste.find((f) => f._id.startsWith('drafts.'))
      // Im Studio sichtbar ist der Entwurf, sonst die veröffentlichte Fassung
      const massgeblich = entwurf ?? liste[0]
      alle.push({
        basisId: schluessel,
        titel: massgeblich?.titel ?? '(ohne Titel)',
        fassungen: liste,
        vergangen: zaehleVergangenes(massgeblich, stichtag),
        gesamt: zaehleAlles(massgeblich),
        hatEntwurf: Boolean(entwurf),
      })
    })
    return alle.sort(
      (a, b) => b.vergangen.termine - a.vergangen.termine || a.titel.localeCompare(b.titel, 'de'),
    )
  }, [fassungen, stichtag])

  const betroffene = gruppen.filter((g) => g.vergangen.termine > 0)
  const summeTermine = betroffene.reduce((summe, g) => summe + g.vergangen.termine, 0)

  const aufraeumen = useCallback(async () => {
    setRaeumtAuf(true)
    try {
      const transaktion = rohClient.transaction()
      let angefasst = 0
      for (const gruppe of betroffene) {
        for (const fassung of gruppe.fassungen) {
          // Jede Fassung einzeln prüfen: Entwurf und veröffentlichte Fassung
          // können unterschiedliche Termine enthalten.
          if (zaehleVergangenes(fassung, stichtag).termine === 0) continue
          const bereinigt = ohneVergangene(fassung, stichtag)
          transaktion.patch(fassung._id, (p) => {
            let patch = p
            if (bereinigt.vorstellungen.length) {
              patch = patch.set({vorstellungen: bereinigt.vorstellungen})
            } else {
              patch = patch.unset(['vorstellungen'])
            }
            if (bereinigt.spielwochen.length) {
              patch = patch.set({spielwochen: bereinigt.spielwochen})
            } else {
              patch = patch.unset(['spielwochen'])
            }
            return patch
          })
          angefasst++
        }
      }
      if (angefasst === 0) {
        toast.push({
          status: 'info',
          title: 'Nichts zu tun',
          description: 'Es liegt nichts in der Vergangenheit.',
        })
      } else {
        await transaktion.commit({visibility: 'async'})
        toast.push({
          status: 'success',
          title: 'Aufgeräumt',
          description: `${summeTermine} vergangene Termine aus ${betroffene.length} ${
            betroffene.length === 1 ? 'Film' : 'Filmen'
          } entfernt.`,
        })
      }
      setDialogOffen(false)
      await laden()
    } catch (ausnahme) {
      toast.push({
        status: 'error',
        title: 'Aufräumen fehlgeschlagen',
        description: ausnahme instanceof Error ? ausnahme.message : 'Unbekannter Fehler',
      })
    } finally {
      setRaeumtAuf(false)
    }
  }, [betroffene, laden, rohClient, stichtag, summeTermine, toast])

  return (
    <Container width={2} paddingX={4} paddingY={5}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading as="h1" size={3}>
            Vergangene Vorstellungen aufräumen
          </Heading>
          <Text muted size={1}>
            Entfernt alle Termine, die vor dem Stichtag liegen — bei jedem Film, in Entwurf und
            veröffentlichter Fassung. Eine Vorstellungsserie wird erst gelöscht, wenn auch ihr
            letzter Tag vorbei ist. Die Filme selbst bleiben immer erhalten.
          </Text>
        </Stack>

        <Card padding={4} radius={2} shadow={1}>
          <Flex align="flex-end" gap={3} wrap="wrap">
            <Stack space={3} flex={1}>
              <Text size={1} weight="medium">
                Stichtag — alles davor gilt als vergangen
              </Text>
              <TextInput
                type="date"
                value={stichtag}
                onChange={(e) => setStichtag(e.currentTarget.value)}
              />
            </Stack>
            <Button text="Neu einlesen" mode="ghost" onClick={laden} disabled={laedt || raeumtAuf} />
            <Button
              text={`${summeTermine} vergangene Termine entfernen`}
              tone="critical"
              icon={TrashIcon}
              onClick={() => setDialogOffen(true)}
              disabled={laedt || raeumtAuf || summeTermine === 0}
            />
          </Flex>
        </Card>

        {laedt && (
          <Flex align="center" gap={3} padding={4}>
            <Spinner muted />
            <Text muted size={1}>
              Filme werden gelesen …
            </Text>
          </Flex>
        )}

        {fehler && (
          <Card padding={4} radius={2} tone="critical">
            <Text size={1}>{fehler}</Text>
          </Card>
        )}

        {!laedt && !fehler && (
          <Stack space={3}>
            <Text size={1} weight="medium">
              {betroffene.length === 0
                ? `Nichts vor dem ${alsDeutschesDatum(stichtag)} — alle ${gruppen.length} Filme sind sauber.`
                : `${betroffene.length} von ${gruppen.length} Filmen haben Termine vor dem ${alsDeutschesDatum(stichtag)}:`}
            </Text>

            {betroffene.map((gruppe) => (
              <Card key={gruppe.basisId} padding={3} radius={2} shadow={1}>
                <Flex align="center" gap={3} wrap="wrap">
                  <Box flex={1}>
                    <Stack space={2}>
                      <Flex align="center" gap={2}>
                        <Text weight="medium">{gruppe.titel}</Text>
                        {gruppe.hatEntwurf && <Badge tone="caution">Entwurf</Badge>}
                      </Flex>
                      <Text muted size={1}>
                        {beschreibeBestand(gruppe.vergangen)} vorbei — von insgesamt{' '}
                        {gruppe.gesamt.termine}{' '}
                        {gruppe.gesamt.termine === 1 ? 'Termin' : 'Terminen'}
                      </Text>
                    </Stack>
                  </Box>
                  <Badge
                    tone={gruppe.vergangen.termine === gruppe.gesamt.termine ? 'critical' : 'primary'}
                  >
                    {gruppe.vergangen.termine === gruppe.gesamt.termine
                      ? 'komplett vorbei'
                      : `${gruppe.gesamt.termine - gruppe.vergangen.termine} bleiben`}
                  </Badge>
                </Flex>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {dialogOffen && (
        <Dialog
          id="aufraeumen-bestaetigen"
          header="Vergangene Vorstellungen entfernen"
          width={1}
          onClose={() => (raeumtAuf ? undefined : setDialogOffen(false))}
          footer={
            <Flex gap={2} justify="flex-end" padding={3}>
              <Button
                text="Abbrechen"
                mode="ghost"
                onClick={() => setDialogOffen(false)}
                disabled={raeumtAuf}
              />
              <Button
                text={raeumtAuf ? 'Wird aufgeräumt …' : 'Ja, entfernen'}
                tone="critical"
                icon={TrashIcon}
                onClick={aufraeumen}
                disabled={raeumtAuf}
              />
            </Flex>
          }
        >
          <Box padding={4}>
            <Stack space={4}>
              <Text size={1}>
                {summeTermine} Termine aus {betroffene.length}{' '}
                {betroffene.length === 1 ? 'Film' : 'Filmen'} werden gelöscht — alles vor dem{' '}
                {alsDeutschesDatum(stichtag)}. Das lässt sich nicht rückgängig machen.
              </Text>
              <Text size={1} muted>
                Die Änderung wirkt sofort, auch auf der veröffentlichten Website.
              </Text>
            </Stack>
          </Box>
        </Dialog>
      )}
    </Container>
  )
}

export const aufraeumenTool = {
  name: 'aufraeumen',
  title: 'Aufräumen',
  icon: ClockIcon,
  component: AufraeumenTool,
}
