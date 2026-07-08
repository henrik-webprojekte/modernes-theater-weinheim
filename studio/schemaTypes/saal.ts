import {defineType, defineField} from "sanity"

export const saalType = defineType({
  name: "saal",
  title: "Saal",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Chic, Cherie, Charme oder Kinogarten",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL-Kürzel",
      type: "slug",
      options: {source: "name"},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reihenfolge",
      title: "Reihenfolge",
      type: "number",
      description: "Steuert die Anzeigereihenfolge auf /saele. 1 = ganz oben, höhere Zahlen weiter unten.",
      initialValue: 10,
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: "plaetze",
      title: "Anzahl Plätze",
      type: "number",
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: "kurzbeschreibung",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 3,
      description: "Ein Satz, der den Charakter des Saals einfängt — steht im Fließtext-Block auf /saele.",
    }),
    defineField({
      name: "beschreibungLang",
      title: "Ausführliche Beschreibung",
      type: "array",
      of: [{type: "block"}],
      description: "Mehrere Absätze mit Details zum Saal. Erscheint auf /saele unterhalb von Fakten und Technik.",
    }),
    defineField({
      name: "kicker",
      title: "Kicker (Untertitel oben)",
      type: "string",
      description: "Kurzer Untertitel über dem Namen — z. B. \"Unser Klassiker\"",
    }),
    defineField({
      name: "charakterUntertitel",
      title: "Charakter-Untertitel",
      type: "string",
      description: "Ein poetischer Einzeiler — z. B. \"Der Vorhang öffnet sich, das Licht wird warm\"",
    }),
    defineField({
      name: "technik",
      title: "Technik-Zeile",
      type: "string",
      description: "Kurze Aufzählung der Technik — z. B. \"2K-3D-Projektor · 7.1-Ton · 35 mm\"",
    }),
    defineField({
      name: "fakten",
      title: "Fakten-Kacheln",
      type: "array",
      of: [
        {
          type: "object",
          name: "fakt",
          title: "Fakt",
          fields: [
            defineField({
              name: "wert",
              title: "Wert (groß angezeigt)",
              type: "string",
              description: "z. B. \"201\", \"4 VIP-Sessel\", \"80 m²\"",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label (klein darunter)",
              type: "string",
              description: "z. B. \"Plätze\", \"Lounge\", \"Fläche\"",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: "wert", subtitle: "label"},
          },
        },
      ],
      description: "Kleine Kachel-Reihe (empfohlen: genau drei). Wird als 3-Spalten-Grid neben der Beschreibung angezeigt.",
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "farbakzent",
      title: "Farbakzent",
      type: "string",
      description: "Hex-Farbwert für Ränder und Akzent-Elemente.",
      options: {
        list: [
          {title: "Gold (Chic)", value: "#C9A55C"},
          {title: "Lila (Cherie)", value: "#9A7DC9"},
          {title: "Bronze (Charme)", value: "#B88955"},
          {title: "Grün (Kinogarten)", value: "#9BC988"},
        ],
      },
    }),
    defineField({
      name: "hintergrundFarbe",
      title: "Hintergrundfarbe der Sektion",
      type: "string",
      description: "Hintergrund der Saal-Sektion auf /saele. Bei dunklen Werten unten „Dunkler Hintergrund\" aktivieren.",
      options: {
        list: [
          {title: "Creme (hell)", value: "#F5EDE0"},
          {title: "Off-White (hell)", value: "#FAF6EE"},
          {title: "Warmes Beige (hell)", value: "#FAF0DE"},
          {title: "Cherie-Nacht (dunkel)", value: "#1A1020"},
          {title: "Kinogarten-Nacht (dunkel)", value: "#182018"},
          {title: "Tiefschwarz (dunkel)", value: "#1A1310"},
        ],
      },
      initialValue: "#F5EDE0",
    }),
    defineField({
      name: "dunklerHintergrund",
      title: "Dunkler Hintergrund",
      type: "boolean",
      description: "Anschalten, wenn die Hintergrundfarbe dunkel ist — schaltet die Textfarben auf hell.",
      initialValue: false,
    }),
    defineField({
      name: "bild",
      title: "Hauptbild",
      type: "image",
      description: "Wird groß neben der Beschreibung angezeigt. Ohne Bild erscheint ein stilisierter Platzhalter.",
      options: {hotspot: true},
    }),
  ],
  orderings: [
    {
      title: "Reihenfolge (aufsteigend)",
      name: "reihenfolgeAsc",
      by: [{field: "reihenfolge", direction: "asc"}],
    },
  ],
  preview: {
    select: {title: "name", subtitle: "plaetze", reihenfolge: "reihenfolge", media: "bild"},
    prepare({title, subtitle, reihenfolge, media}) {
      const platzText = subtitle ? `${subtitle} Plätze` : "Keine Angabe"
      const reihenText = typeof reihenfolge === "number" ? ` · Reihenfolge ${reihenfolge}` : ""
      return {
        title,
        subtitle: `${platzText}${reihenText}`,
        media,
      }
    },
  },
})
