import type { Endpoint } from 'payload'

import { getUserRole } from '@/access/getUserRole'
import { isGoogleAnalyticsConfigured } from '@/lib/analytics/googleAnalytics'

export const analyticsOverviewEndpoint: Endpoint = {
  path: '/analytics-overview',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = await getUserRole(req)
    if (!role?.isAdmin && !role?.viewAnalytics) {
      return Response.json(
        { error: "Vous n'avez pas la permission de voir ces statistiques." },
        { status: 403 },
      )
    }

    if (!isGoogleAnalyticsConfigured()) {
      return Response.json({ configured: false })
    }

    const cache = await req.payload.findGlobal({ slug: 'analytics-cache' })

    if (!cache.data) {
      return Response.json(
        { configured: true, pending: true, error: 'En attente de la première synchronisation.' },
        { status: 202 },
      )
    }

    return Response.json({
      configured: true,
      ...(cache.data as Record<string, unknown>),
      fetchedAt: cache.fetchedAt,
      stale: Boolean(cache.lastError),
    })
  },
}
