import {defineType, defineArrayMember} from "sanity"

/**
 * Fließtext mit Formatierung und klickbaren Links.
 *
 * Wird von der „Ausführlichen Beschreibung" eines Events und der
 * Kurzbeschreibung eines Films verwendet, damit an beiden Stellen dieselben
 * Möglichkeiten bestehen: Text markieren, Link-Symbol, Adresse eintragen.
 */
export const richtextType = defineType({
  name: "richtext",
  title: "Text mit Formatierung",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      marks: {
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              {
                name: "href",
                type: "url",
                title: "Adresse",
                description:
                  "Vollständige Adresse, z. B. https://shop.kinoweinheim.de — auch mailto: und tel: sind möglich.",
                validation: (Rule: any) =>
                  Rule.required().uri({scheme: ["http", "https", "mailto", "tel"]}),
              },
            ],
          },
        ],
      },
    }),
  ],
})
