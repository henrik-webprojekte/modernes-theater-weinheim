import {defineType, defineField, defineArrayMember} from "sanity"

export const eventType = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "titel",
      title: "Titel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-Kürzel",
      type: "slug",
      options: {source: "titel", maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kategorie",
      title: "Kategorie",
      type: "string",
      options: {
        list: [
          {title: "Kaffee-Tee-Kino", value: "kaffee-tee-kino"},
          {title: "Enzo-Day", value: "enzo-day"},
          {title: "Open Air", value: "open-air"},
          {title: "Zauberer Schmittini", value: "schmittini"},
          {title: "Sondervorstellung", value: "sondervorstellung"},
          {title: "Sonstiges", value: "sonstiges"},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kurzbeschreibung",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "beschreibungLang",
      title: "Ausführliche Beschreibung",
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
      description:
        "Für die Event-Detailseite. Text markieren und über das Link-Symbol verlinken — z. B. „Tickets im Shop\" oder den Namen eines Kooperationspartners. Externe Links öffnen sich automatisch in einem neuen Tab.",
    }),
    defineField({
      name: "startDatum",
      title: "Startdatum",
      type: "date",
      options: {dateFormat: "DD.MM.YYYY"},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endDatum",
      title: "Enddatum (optional)",
      type: "date",
      options: {dateFormat: "DD.MM.YYYY"},
      description: "Nur bei mehrtägigen Events ausfüllen",
    }),
    defineField({
      name: "wiederkehrend",
      title: "Wiederkehrend?",
      type: "string",
      description: "z. B. 'Jeden 1. Mittwoch im Monat' oder 'Montag + Freitag ab 16 Uhr'",
    }),
    defineField({
      name: "ort",
      title: "Ort",
      type: "string",
      description: "Saal-Name oder externe Location",
    }),
    defineField({
      name: "bild",
      title: "Bild",
      type: "image",
      options: {hotspot: true},
    }),
    defineField({
      name: "angepinnt",
      title: "Anpinnen",
      type: "boolean",
      description:
        "Hebt das Event hervor: es erscheint ganz oben auf der Event-Seite und bekommt einen Hinweis-Balken, den jeder Besucher auf jeder Seite sieht. Sparsam einsetzen — im Balken steht immer nur das nächste angepinnte Event.",
      initialValue: false,
    }),
    defineField({
      name: "pinnHinweis",
      title: "Text für den Hinweis-Balken (optional)",
      type: "string",
      description:
        "Kurzer Satz für den Balken, z. B. „40 Jahre Modernes Theater — wir feiern mit Ihnen“. Bleibt das Feld leer, wird der Titel des Events angezeigt. Wirkt nur, wenn „Anpinnen“ an ist.",
      hidden: ({parent}) => !parent?.angepinnt,
    }),
    defineField({
      name: "veroeffentlicht",
      title: "Veröffentlicht",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: "titel", subtitle: "kategorie", media: "bild", angepinnt: "angepinnt"},
    prepare({title, subtitle, media, angepinnt}) {
      return {
        title: angepinnt ? `📌 ${title}` : title,
        subtitle: angepinnt ? `Angepinnt · ${subtitle ?? ""}` : subtitle,
        media,
      }
    },
  },
})