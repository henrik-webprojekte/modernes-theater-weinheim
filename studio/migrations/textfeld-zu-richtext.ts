/**
 * Migration: ein einfaches Textfeld auf Fließtext („richtext") umstellen.
 *
 * Grund: Im Fließtext lassen sich Wörter verlinken — etwa der Name eines
 * Kooperationspartners oder ein Ticketshop. Die alten Felder waren reine
 * Textfelder, in denen das nicht möglich war.
 *
 * Aufruf im Ordner `studio`, Dokumenttyp und Feld als Argumente:
 *   Trockenlauf:  npx sanity exec migrations/textfeld-zu-richtext.ts --with-user-token -- film kurzbeschreibung
 *   Schreiben:    npx sanity exec migrations/textfeld-zu-richtext.ts --with-user-token -- film kurzbeschreibung --schreiben
 *
 * Bereits gelaufen für `film kurzbeschreibung` und `event kurzbeschreibung`.
 *
 * Leerzeilen im alten Text werden zu eigenen Absätzen. Dokumente, deren Feld
 * bereits Fließtext ist, werden übersprungen — das Skript kann also gefahrlos
 * mehrfach laufen.
 */
import {getCliClient} from "sanity/cli"

const argumente = process.argv.slice(2).filter((a) => !a.startsWith("-"))
const dokumentTyp = argumente[argumente.length - 2]
const feld = argumente[argumente.length - 1]
const schreiben = process.argv.includes("--schreiben")

if (!dokumentTyp || !feld) {
  console.error("Aufruf: ... -- <dokumenttyp> <feld> [--schreiben]")
  process.exit(1)
}

const client = getCliClient({apiVersion: "2024-01-01"})

type Zeile = {_id: string; titel?: string; inhalt?: unknown}

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
  const zeilen = await client.fetch<Zeile[]>(
    `*[_type == $typ && defined(@[$feld])]{_id, titel, "inhalt": @[$feld]}`,
    {typ: dokumentTyp, feld},
  )

  const offen = zeilen.filter((z) => typeof z.inhalt === "string")
  const fertig = zeilen.length - offen.length

  console.log(`\n„${dokumentTyp}" mit Inhalt in „${feld}": ${zeilen.length}`)
  console.log(`  bereits Fließtext: ${fertig}`)
  console.log(`  umzuwandeln:       ${offen.length}\n`)

  if (offen.length === 0) {
    console.log("Nichts zu tun.")
    return
  }

  const transaktion = client.transaction()
  for (const eintrag of offen) {
    const text = eintrag.inhalt as string
    const bloecke = textZuBloecken(text)
    const vorschau = text.replace(/\s+/g, " ").slice(0, 60)
    console.log(
      `  ${(eintrag.titel ?? eintrag._id).slice(0, 34).padEnd(36)} ${bloecke.length} Absatz/Absätze  „${vorschau}…"`,
    )
    if (bloecke.length === 0) {
      // Nur Leerzeichen im Feld: Feld entfernen statt leeres Array schreiben
      transaktion.patch(eintrag._id, (p) => p.unset([feld]))
    } else {
      transaktion.patch(eintrag._id, (p) => p.set({[feld]: bloecke}))
    }
  }

  if (!schreiben) {
    console.log("\nTROCKENLAUF — es wurde nichts geändert.")
    console.log("Zum Ausführen dieselbe Zeile noch einmal mit  --schreiben  aufrufen.")
    return
  }

  await transaktion.commit({visibility: "async"})
  console.log(`\n${offen.length} Dokumente umgestellt.`)
}

los().catch((fehler) => {
  console.error("Migration fehlgeschlagen:", fehler)
  process.exit(1)
})
