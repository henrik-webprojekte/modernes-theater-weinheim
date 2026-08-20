/**
 * Einmal-Migration: Film-Kurzbeschreibungen von reinem Text auf Fließtext.
 *
 * Grund: Im Fließtext lassen sich Wörter verlinken (z. B. der Name eines
 * Kooperationspartners). Das alte Feld war ein einfaches Textfeld.
 *
 * Aufruf im Ordner `studio`:
 *   Trockenlauf:  npx sanity exec migrations/kurzbeschreibung-zu-richtext.ts --with-user-token
 *   Schreiben:    npx sanity exec migrations/kurzbeschreibung-zu-richtext.ts --with-user-token -- --schreiben
 *
 * Leerzeilen im alten Text werden zu eigenen Absätzen. Einzelne Zeilenumbrüche
 * innerhalb eines Absatzes bleiben als Umbruch erhalten. Bereits migrierte
 * Dokumente (Feld ist schon ein Array) werden übersprungen, das Skript kann
 * also gefahrlos mehrfach laufen.
 */
import {getCliClient} from "sanity/cli"

const schreiben = process.argv.includes("--schreiben")
const client = getCliClient({apiVersion: "2024-01-01"})

type FilmZeile = {_id: string; titel?: string; kurzbeschreibung?: unknown}

/** Ein fortlaufender Schlüssel je Dokument reicht — Sanity braucht nur Eindeutigkeit. */
function schluessel(praefix: string, nummer: number): string {
  return `${praefix}${nummer.toString(36)}`
}

function textZuBloecken(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((absatz) => absatz.trim())
    .filter(Boolean)
    .map((absatz, i) => ({
      _type: "block",
      _key: schluessel("b", i),
      style: "normal",
      markDefs: [],
      children: [{_type: "span", _key: schluessel("s", i), text: absatz, marks: []}],
    }))
}

async function los() {
  const filme = await client.fetch<FilmZeile[]>(
    `*[_type == "film" && defined(kurzbeschreibung)]{_id, titel, kurzbeschreibung}`,
  )

  const offen = filme.filter((f) => typeof f.kurzbeschreibung === "string")
  const fertig = filme.length - offen.length

  console.log(`\n${filme.length} Filme mit Beschreibung gefunden.`)
  console.log(`  bereits Fließtext: ${fertig}`)
  console.log(`  umzuwandeln:       ${offen.length}\n`)

  if (offen.length === 0) {
    console.log("Nichts zu tun.")
    return
  }

  const transaktion = client.transaction()
  for (const film of offen) {
    const text = film.kurzbeschreibung as string
    const bloecke = textZuBloecken(text)
    const vorschau = text.replace(/\s+/g, " ").slice(0, 70)
    console.log(
      `  ${(film.titel ?? film._id).slice(0, 34).padEnd(36)} ${bloecke.length} Absatz/Absätze  „${vorschau}…"`,
    )
    if (bloecke.length === 0) {
      // Nur Leerzeichen im Feld: Feld entfernen statt leeres Array schreiben
      transaktion.patch(film._id, (p) => p.unset(["kurzbeschreibung"]))
    } else {
      transaktion.patch(film._id, (p) => p.set({kurzbeschreibung: bloecke}))
    }
  }

  if (!schreiben) {
    console.log("\nTROCKENLAUF — es wurde nichts geändert.")
    console.log("Zum Ausführen dieselbe Zeile noch einmal mit  -- --schreiben  aufrufen.")
    return
  }

  await transaktion.commit({visibility: "async"})
  console.log(`\n${offen.length} Filme umgestellt.`)
}

los().catch((fehler) => {
  console.error("Migration fehlgeschlagen:", fehler)
  process.exit(1)
})
