'use client'

import { useEffect, useState } from 'react'

type SentryIssue = {
  id: string
  title: string
  culprit: string
  level: string
  count: string
  userCount: number
  lastSeen: string
  permalink: string
}

type SentryOverview = {
  configured: boolean
  error?: string
  issues?: SentryIssue[]
}

export const SentryWidget = () => {
  const [data, setData] = useState<SentryOverview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/sentry-issues', { signal: controller.signal })
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData({ configured: false, error: 'Erreur de chargement' }))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return (
    <div className="dashboard-widget">
      <h3 className="dashboard-widget__title">Sentry — issues non résolues (14 derniers jours)</h3>

      {loading && <p className="dashboard-widget__muted">Chargement…</p>}

      {!loading && data && !data.configured && (
        <p className="dashboard-widget__muted">
          Non configuré. Renseignez <code>SENTRY_AUTH_TOKEN</code>, <code>SENTRY_ORG</code> et{' '}
          <code>SENTRY_PROJECT</code> (le token doit avoir le scope <code>project:read</code>) pour
          activer ce widget.
        </p>
      )}

      {!loading && data?.error && <p className="dashboard-widget__error">{data.error}</p>}

      {!loading && data?.configured && !data.error && (
        <ul className="dashboard-widget__list">
          {(data.issues ?? []).length === 0 && (
            <li className="dashboard-widget__muted">Aucune issue non résolue 🎉</li>
          )}
          {(data.issues ?? []).map((issue) => (
            <li key={issue.id}>
              <a href={issue.permalink} target="_blank" rel="noreferrer">
                {issue.title}
              </a>
              <span>
                {issue.count} occurrences · {issue.userCount} utilisateurs
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
