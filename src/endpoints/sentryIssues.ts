import type { Endpoint } from 'payload'

import { fetchSentryIssues, isSentryApiConfigured } from '@/lib/analytics/sentry'

export const sentryIssuesEndpoint: Endpoint = {
  path: '/sentry-issues',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSentryApiConfigured()) {
      return Response.json({ configured: false })
    }

    try {
      const issues = await fetchSentryIssues()
      return Response.json({ configured: true, issues })
    } catch (error) {
      req.payload.logger.error(error)
      return Response.json(
        { configured: true, error: 'Impossible de charger les issues Sentry' },
        { status: 502 },
      )
    }
  },
}
