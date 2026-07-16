import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

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

  schema: {
    types: schemaTypes,
  },

  document: {
    // Singleton nicht über „Neues Dokument" anlegbar machen
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== 'kinoInfo'),
  },
})
