import {defineType, defineField} from "sanity"

// Singleton-Dokument: es gibt genau EINEN Eintrag davon (im Studio links
// unter „Preise & Öffnungszeiten"). Gepflegt werden hier die Angaben,
// die auf der Kontakt-Seite unter /kontakt#preise erscheinen.
export const kinoInfoType = defineType({
  name: "kinoInfo",
  title: "Preise & Öffnungszeiten",
  type: "document",
  fields: [
    defineField({
      name: "preise",
      title: "Eintrittspreise",
      type: "array",
      description:
        "Die Preis-Kacheln auf der Kontakt-Seite. Empfohlen: genau vier, damit das Raster gleichmäßig bleibt.",
      of: [
        {
          type: "object",
          name: "preis",
          title: "Preis",
          fields: [
            defineField({
              name: "wert",
              title: "Preis (groß angezeigt)",
              type: "string",
              description: 'z. B. "11 €"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Bezeichnung (klein darunter)",
              type: "string",
              description: 'z. B. "Erwachsene"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "highlight",
              title: "Hervorheben (goldener Rahmen)",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {title: "wert", subtitle: "label"},
          },
        },
      ],
    }),
    defineField({
      name: "zuschlaege",
      title: "Zuschläge & Sonderpreise",
      type: "array",
      of: [{type: "string"}],
      description: 'Je Zeile ein Eintrag — z. B. "VIP-Loge +1,50 €" oder "3D +3,00 €".',
    }),
    defineField({
      name: "oeffnungszeitenKasse",
      title: "Öffnungszeiten: Kasse",
      type: "text",
      rows: 3,
      description:
        "Erster Absatz unter „Öffnungszeiten\" auf der Kontakt-Seite — wann die Kasse öffnet und schließt.",
    }),
    defineField({
      name: "oeffnungszeitenZusatz",
      title: "Öffnungszeiten: Zusatz",
      type: "text",
      rows: 3,
      description:
        "Zweiter Absatz — z. B. Erreichbarkeit an Tagen ohne Vorstellungen. Der Verweis auf das aktuelle Programm wird automatisch angehängt.",
    }),
  ],
  preview: {
    prepare() {
      return {title: "Preise & Öffnungszeiten"}
    },
  },
})
