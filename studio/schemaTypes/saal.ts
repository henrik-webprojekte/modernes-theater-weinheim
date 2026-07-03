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
      description: "Ein Satz, der den Charakter des Saals einfängt",
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
      name: "farbakzent",
      title: "Farbakzent",
      type: "string",
      description: "Hex-Farbwert für die visuelle Kennzeichnung",
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
      name: "bild",
      title: "Foto",
      type: "image",
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {title: "name", subtitle: "plaetze", media: "bild"},
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle ? `${subtitle} Plätze` : "Keine Angabe",
        media,
      }
    },
  },
})