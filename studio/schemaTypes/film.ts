import {defineType, defineField} from "sanity"

export const filmType = defineType({
  name: "film",
  title: "Film",
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
      name: "plakat",
      title: "Plakat",
      type: "image",
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "laenge",
      title: "Länge in Minuten",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "fsk",
      title: "FSK",
      type: "number",
      options: {
        list: [
          {title: "FSK 0", value: 0},
          {title: "FSK 6", value: 6},
          {title: "FSK 12", value: 12},
          {title: "FSK 16", value: 16},
          {title: "FSK 18", value: 18},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "genre",
      title: "Genre",
      type: "string",
      options: {
        list: [
          "Action",
          "Animation",
          "Dokumentation",
          "Drama",
          "Familie",
          "Fantasy",
          "Horror",
          "Komödie",
          "Krimi",
          "Musik",
          "Romantik",
          "Sci-Fi",
          "Thriller",
        ],
      },
    }),
    defineField({
      name: "kurzbeschreibung",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 4,
      description: "Ein bis drei Sätze für die Programm-Übersicht",
    }),
    defineField({
      name: "trailerUrl",
      title: "Trailer-URL",
      type: "url",
      description: "YouTube-Link oder andere Video-Plattform",
    }),
    defineField({
      name: "istIn3dVerfuegbar",
      title: "In 3D verfügbar",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "istSneak",
      title: "Ist Sneak Preview",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "istSonderreihe",
      title: "Gehört zu einer Sonderreihe",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "istKaffeeTeeKino",
      title: "Kaffee-Tee-Kino",
      type: "boolean",
      description: "Anschalten, wenn dieser Film Teil der Kaffee-Tee-Kino-Reihe ist (jeder 1. Mittwoch im Monat, 15:00, 8 EUR inkl. Kaffee/Tee + Kuchen).",
      initialValue: false,
    }),
    defineField({
      name: "badges",
      title: "Badges",
      type: "array",
      of: [{type: "string"}],
      options: {
        list: [
          {title: "Neu", value: "neu"},
          {title: "Preview", value: "preview"},
          {title: "Kaffee-Tee-Kino", value: "kaffee-tee-kino"},
          {title: "OmU", value: "omu"},
        ],
        layout: "tags",
      },
    }),
    defineField({
      name: "vorstellungen",
      title: "Vorstellungen",
      type: "array",
      of: [{type: "vorstellung"}],
      description: "Alle Vorstellungstermine dieses Films",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          {title: "Entwurf", value: "entwurf"},
          {title: "Aktiv", value: "aktiv"},
          {title: "Archiviert", value: "archiviert"},
        ],
        layout: "radio",
      },
      initialValue: "entwurf",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: "titel", subtitle: "genre", media: "plakat", status: "status"},
    prepare({title, subtitle, media, status}) {
      const statusLabel: Record<string, string> = {
        entwurf: "Entwurf",
        aktiv: "Aktiv",
        archiviert: "Archiviert",
      }
      return {
        title,
        subtitle: `${statusLabel[status] ?? "?"} · ${subtitle ?? ""}`,
        media,
      }
    },
  },
})