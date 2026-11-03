import type { Endpoint } from 'payload'

import { getUserRole } from '@/access/getUserRole'
import { fetchSentryIssues, isSentryApiConfigured } from '@/lib/analytics/sentry'

export const sentryIssuesEndpoint: Endpoint = {
  path: '/sentry-issues',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = await getUserRole(req)
    if (!role?.isAdmin && !role?.viewSentry) {
      return Response.json(
        { error: "Vous n'avez pas la permission de voir ces informations." },
        { status: 403 },
      )
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
