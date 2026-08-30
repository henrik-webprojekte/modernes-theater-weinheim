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
      type: "richtext",
      description:
        "Ein bis drei Sätze. Erscheint auf der Event-Seite unter dem Titel und als Anrisstext in den Übersichtskacheln — dort ohne Formatierung, weil die ganze Kachel bereits anklickbar ist.",
    }),
    defineField({
      name: "beschreibungLang",
      title: "Ausführliche Beschreibung",
      type: "richtext",
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
        "Hebt das Event hervor: es erscheint ganz oben auf der Event-Seite und auf der Startseite im Block „Im Rampenlicht“. Sparsam einsetzen — im Rampenlicht ist nur Platz für die drei nächsten Einträge.",
      initialValue: false,
    }),
    defineField({
      name: "pinnHinweis",
      title: "Kurzer Hinweis im Rampenlicht (optional)",
      type: "string",
      description:
        "Ein Satz für die Kachel auf der Startseite, z. B. „40 Jahre Modernes Theater — wir feiern mit Ihnen“. Bleibt das Feld leer, wird die Kurzbeschreibung angezeigt. Die ausführliche Beschreibung sieht man erst auf der Event-Seite. Wirkt nur, wenn „Anpinnen“ an ist.",
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