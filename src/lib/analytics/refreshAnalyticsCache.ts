import type { Payload } from 'payload'

import { buildAnalyticsSnapshot, isGoogleAnalyticsConfigured } from './googleAnalytics'

/**
 * Polled on an interval (see instrumentation.ts) instead of on every dashboard
 * load, to stay within GA4 Data API rate limits. Keeps the last good snapshot
 * on failure so the dashboard always has something to show.
 */
export const refreshAnalyticsCache = async (payload: Payload): Promise<void> => {
  if (!isGoogleAnalyticsConfigured()) return

  try {
    const snapshot = await buildAnalyticsSnapshot()

    await payload.updateGlobal({
      slug: 'analytics-cache',
      data: {
        data: snapshot,
        fetchedAt: new Date().toISOString(),
        lastError: null,
      },
    })
  } catch (error) {
    payload.logger.error(error, 'Failed to refresh Google Analytics cache')

    await payload.updateGlobal({
      slug: 'analytics-cache',
      data: {
        lastError: error instanceof Error ? error.message : 'Erreur inconnue',
        lastErrorAt: new Date().toISOString(),
      },
    })
  }
}
