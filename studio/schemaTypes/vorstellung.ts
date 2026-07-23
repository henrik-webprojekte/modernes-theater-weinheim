import {defineType, defineField} from "sanity"

export const vorstellungType = defineType({
  name: "vorstellung",
  title: "Vorstellung",
  type: "object",
  fields: [
    defineField({
      name: "datum",
      title: "Datum",
      type: "date",
      options: {dateFormat: "DD.MM.YYYY"},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "uhrzeit",
      title: "Uhrzeit",
      type: "string",
      description: "Format HH:MM, z. B. 20:00",
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
          name: "Uhrzeit",
          invert: false,
        }),
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
    select: {datum: "datum", uhrzeit: "uhrzeit", saal: "saal.name", format: "format"},
    prepare({datum, uhrzeit, saal, format}) {
      return {
        title: `${datum ?? "?"} · ${uhrzeit ?? "?"}`,
        subtitle: `${saal ?? "Saal offen"} · ${format ?? "?"}`,
      }
    },
  },
})