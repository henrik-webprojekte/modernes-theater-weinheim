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
      name: "hinweis",
      title: "Hinweis / Untertitel",
      type: "string",
      description:
        "Kurzer Zusatz, der direkt in der Programm-Übersicht unter dem Titel erscheint — z. B. „Eintritt nur 5 €\", „Vorpremiere\" oder „mit Filmgespräch\". Optional.",
    }),
    defineField({
      name: "plakat",
      title: "Plakat (optional)",
      type: "image",
      options: {hotspot: true},
      description: "Ohne Plakat zeigt die Website einen Platzhalter.",
    }),
    defineField({
      name: "laenge",
      title: "Länge in Minuten (optional)",
      type: "number",
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: "fsk",
      title: "FSK (optional)",
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
    }),
    defineField({
      name: "genre",
      title: "Genre (optional)",
      type: "string",
      description:
        "Frei eingebbar. Übliche Werte: Action, Animation, Dokumentation, Drama, Familie, Fantasy, Horror, Komödie, Krimi, Musik, Romantik, Sci-Fi, Thriller.",
    }),
    defineField({
      name: "kurzbeschreibung",
      title: "Kurzbeschreibung (optional)",
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
      name: "istNeu",
      title: "Neu",
      type: "boolean",
      description: "Anschalten in der Startwoche des Films — zeigt ein „Neu\"-Chip neben dem Titel auf Programm-Liste, Detail-Seite und Startseite.",
      initialValue: false,
    }),
    defineField({
      name: "istPreview",
      title: "Preview",
      type: "boolean",
      description: "Anschalten bei Vorpremieren (Preview vor dem regulären Kinostart). Nicht identisch mit „Sneak Preview\" — Sneaks sind separat oben.",
      initialValue: false,
    }),
    defineField({
      name: "istOmU",
      title: "OmU",
      type: "boolean",
      description: "Original mit Untertiteln — anschalten wenn der Film in Originalsprache mit deutschen Untertiteln läuft.",
      initialValue: false,
    }),
    defineField({
      name: "spielwochen",
      title: "Vorstellungsserien (mehrere Tage gleiche Uhrzeit)",
      type: "array",
      of: [{type: "spielwoche"}],
      description:
        "Der schnelle Weg: EIN Eintrag für z. B. „diese Woche täglich 17:00\". Uhrzeit + Wochentage ankreuzen — die Website legt die einzelnen Termine automatisch an.",
    }),
    defineField({
      name: "vorstellungen",
      title: "Einzelne Vorstellungen (je ein Termin)",
      type: "array",
      of: [{type: "vorstellung"}],
      description:
        "Für einzelne, unregelmäßige Termine (z. B. eine Vorpremiere oder ein Kaffee-Tee-Kino an genau einem Tag). Für ganze Wochen lieber „Vorstellungsserien\" oben nutzen.",
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