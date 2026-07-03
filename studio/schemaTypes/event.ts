import {defineType, defineField} from "sanity"

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
      of: [{type: "block"}],
      description: "Für die Event-Detailseite",
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
      name: "veroeffentlicht",
      title: "Veröffentlicht",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {title: "titel", subtitle: "kategorie", media: "bild"},
    prepare({title, subtitle, media}) {
      return {title, subtitle, media}
    },
  },
})