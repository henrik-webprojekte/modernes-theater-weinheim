import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {
  useAlleVorstellungenLoeschen,
  useVergangeneVorstellungenEntfernen,
} from './actions/vorstellungenActions'
import {aufraeumenTool} from './tools/AufraeumenTool'

export default defineConfig({
  name: 'default',
  title: 'Modernes Theater Weinheim',

  projectId: 'mooch5bz',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Inhalte')
          .items([
            S.documentTypeListItem('film').title('Filme'),
            S.documentTypeListItem('event').title('Events'),
            S.documentTypeListItem('saal').title('Säle'),
            S.divider(),
            // Singleton: fester Dokument-Eintrag statt Liste — es gibt genau
            // ein Dokument „Preise & Öffnungszeiten" mit fixer ID.
            S.listItem()
              .title('Preise & Öffnungszeiten')
              .id('kinoInfo')
              .child(S.document().schemaType('kinoInfo').documentId('kinoInfo')),
          ]),
    }),
    visionTool(),
  ],

  // Eigenes Werkzeug in der oberen Leiste, neben „Inhalte" und „Vision"
  tools: (prev) => [...prev, aufraeumenTool],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Singleton nicht über „Neues Dokument" anlegbar machen
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'kinoInfo'),

    // Aufräum-Knöpfe nur im Film-Formular anbieten
    actions: (prev, context) =>
      context.schemaType === 'film'
        ? [...prev, useVergangeneVorstellungenEntfernen, useAlleVorstellungenLoeschen]
        : prev,
  },
})
