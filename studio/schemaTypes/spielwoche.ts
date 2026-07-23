import {defineType, defineField} from "sanity"

// Vorstellungsserie: EIN Eintrag für einen Film, der in einer Kinowoche
// (Do–Mi) an mehreren Tagen zur selben Uhrzeit läuft. Statt sieben
// einzelne Vorstellungen anzulegen, kreuzt man hier die Wochentage an;
// die Website rechnet daraus automatisch die einzelnen Termine aus.
export const spielwocheType = defineType({
  name: "spielwoche",
  title: "Vorstellungsserie (mehrere Tage gleiche Uhrzeit)",
  type: "object",
  fields: [
    defineField({
      name: "uhrzeit",
      title: "Uhrzeit",
      type: "string",
      description: "Format HH:MM, z. B. 17:00 — gilt für alle angekreuzten Tage.",
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "Uhrzeit",
          invert: false,
        }),
    }),
    defineField({
      name: "woche",
      title: "Kinowoche",
      type: "date",
      options: {dateFormat: "DD.MM.YYYY"},
      description:
        "Wähle einen beliebigen Tag der gewünschten Kinowoche (Donnerstag–Mittwoch). Die Website ordnet ihn automatisch der richtigen Woche zu.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "wochentage",
      title: "An diesen Tagen der Woche",
      type: "array",
      of: [{type: "number"}],
      options: {
        layout: "grid",
        list: [
          {title: "Do", value: 4},
          {title: "Fr", value: 5},
          {title: "Sa", value: 6},
          {title: "So", value: 0},
          {title: "Mo", value: 1},
          {title: "Di", value: 2},
          {title: "Mi", value: 3},
        ],
      },
      validation: (Rule) => Rule.required().min(1).error("Mindestens einen Tag ankreuzen."),
    }),
    defineField({
      name: "saal",
      title: "Saal (optional)",
      type: "reference",
      to: [{type: "saal"}],
      description: "Leer lassen, wenn der Saal noch nicht feststeht.",
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [
          {title: "2D", value: "2D"},
          {title: "3D", value: "3D"},
        ],
        layout: "radio",
      },
      initialValue: "2D",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {uhrzeit: "uhrzeit", woche: "woche", wochentage: "wochentage", saal: "saal.name", format: "format"},
    prepare({uhrzeit, woche, wochentage, saal, format}) {
      const kuerzel: Record<number, string> = {4: "Do", 5: "Fr", 6: "Sa", 0: "So", 1: "Mo", 2: "Di", 3: "Mi"}
      const reihenfolge = [4, 5, 6, 0, 1, 2, 3]
      const tage = (wochentage ?? [])
        .slice()
        .sort((a: number, b: number) => reihenfolge.indexOf(a) - reihenfolge.indexOf(b))
        .map((w: number) => kuerzel[w] ?? "?")
        .join(" ")
      return {
        title: `${uhrzeit ?? "?"} · ${tage || "keine Tage"}`,
        subtitle: `Woche ${woche ?? "?"} · ${saal ?? "Saal offen"} · ${format ?? "2D"}`,
      }
    },
  },
})
