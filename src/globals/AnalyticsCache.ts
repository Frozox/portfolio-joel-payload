import type { GlobalConfig } from 'payload'

// Internal cache populated by the background poller (see instrumentation.ts),
// not meant to be edited manually - hidden from the admin nav.
export const AnalyticsCache: GlobalConfig = {
  slug: 'analytics-cache',
  label: 'Cache Google Analytics',
  admin: {
    hidden: true,
  },
  access: {
    read: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'data',
      type: 'json',
      label: 'Dernier snapshot',
    },
    {
      name: 'fetchedAt',
      type: 'date',
      label: 'Dernière synchronisation réussie',
    },
    {
      name: 'lastError',
      type: 'text',
      label: 'Dernière erreur',
    },
    {
      name: 'lastErrorAt',
      type: 'date',
      label: 'Date de la dernière erreur',
    },
  ],
}
