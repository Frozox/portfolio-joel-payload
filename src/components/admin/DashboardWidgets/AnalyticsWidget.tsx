'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type TimeseriesPoint = { label: string; activeUsers: number }

type AnalyticsOverview = {
  configured: boolean
  error?: string
  pending?: boolean
  fetchedAt?: string
  stale?: boolean
  totals?: {
    activeUsers: number
    newUsers: number
    pageViews: number
  }
  timeseries?: {
    daily: TimeseriesPoint[]
    weekly: TimeseriesPoint[]
    monthly: TimeseriesPoint[]
  }
  topPages?: { title: string; views: number }[]
  newVsReturning?: { newUsers: number; returningUsers: number }
}

const PERIOD_TABS = [
  { key: 'daily', label: 'Jour' },
  { key: 'weekly', label: 'Semaine' },
  { key: 'monthly', label: 'Mois' },
] as const

type PeriodKey = (typeof PERIOD_TABS)[number]['key']

const formatFetchedAt = (value: string): string =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )

export const AnalyticsWidget = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [period, setPeriod] = useState<PeriodKey>('daily')

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/analytics-overview', { signal: controller.signal })
      .then((res) => {
        if (res.status === 403) {
          setForbidden(true)
          return null
        }
        return res.json()
      })
      .then((json) => json && setData(json))
      .catch(() => setData({ configured: false, error: 'Erreur de chargement' }))
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  const chartData = useMemo(() => data?.timeseries?.[period] ?? [], [data, period])

  const newUsers = data?.newVsReturning?.newUsers ?? 0
  const returningUsers = data?.newVsReturning?.returningUsers ?? 0
  const newVsReturningTotal = newUsers + returningUsers
  const newUsersPercent =
    newVsReturningTotal > 0 ? Math.round((newUsers / newVsReturningTotal) * 100) : 0

  const topPages = data?.topPages ?? []
  const maxPageViews = Math.max(...topPages.map((page) => page.views), 1)

  if (forbidden) return null

  return (
    <div className="dashboard-widget dashboard-widget--wide">
      <h3 className="dashboard-widget__title">Visiteurs du site</h3>

      {loading && <p className="dashboard-widget__muted">Chargement…</p>}

      {!loading && data && !data.configured && (
        <p className="dashboard-widget__muted">
          Non configuré. Ajoutez <code>GA4_PROPERTY_ID</code>, <code>GA4_CLIENT_EMAIL</code> et{' '}
          <code>GA4_PRIVATE_KEY</code> dans les variables d&apos;environnement.
        </p>
      )}

      {!loading && data?.pending && (
        <p className="dashboard-widget__muted">{data.error ?? 'Synchronisation en cours…'}</p>
      )}

      {!loading && data?.error && !data.pending && (
        <p className="dashboard-widget__error">{data.error}</p>
      )}

      {!loading && data?.configured && !data.error && (
        <>
          <div className="dashboard-widget__stats">
            <div className="dashboard-widget__stat dashboard-widget__stat--primary">
              <strong>{data.totals?.activeUsers ?? 0}</strong>
              <span>Visiteurs (30 derniers jours)</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{data.totals?.newUsers ?? 0}</strong>
              <span>Nouveaux visiteurs</span>
            </div>
            <div className="dashboard-widget__stat">
              <strong>{data.totals?.pageViews ?? 0}</strong>
              <span>Pages vues</span>
            </div>
          </div>

          <div className="dashboard-widget__tabs">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={
                  tab.key === period
                    ? 'dashboard-widget__tab dashboard-widget__tab--active'
                    : 'dashboard-widget__tab'
                }
                onClick={() => setPeriod(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="dashboard-widget__chart">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--theme-success-500, #22c55e)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--theme-success-500, #22c55e)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--theme-elevation-150)"
                  vertical={false}
                />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} width={32} />
                <Tooltip formatter={(value: number) => [value, 'Visiteurs']} />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  name="Visiteurs"
                  stroke="var(--theme-success-500, #22c55e)"
                  strokeWidth={2}
                  fill="url(#visitorsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="dashboard-widget__columns">
            <div>
              <h4>Pages les plus consultées</h4>
              {topPages.length === 0 ? (
                <p className="dashboard-widget__muted">Aucune donnée</p>
              ) : (
                <ul className="dashboard-widget__list dashboard-widget__list--bars">
                  {topPages.map((page) => (
                    <li key={page.title}>
                      <div className="dashboard-widget__bar-row">
                        <span>{page.title}</span>
                        <span>{page.views}</span>
                      </div>
                      <div className="dashboard-widget__bar-track">
                        <div
                          className="dashboard-widget__bar-fill"
                          style={{ width: `${(page.views / maxPageViews) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4>Nouveaux vs visiteurs qui reviennent</h4>
              {newVsReturningTotal === 0 ? (
                <p className="dashboard-widget__muted">Aucune donnée</p>
              ) : (
                <>
                  <p className="dashboard-widget__muted">
                    <strong>{newUsersPercent}%</strong> de vos visiteurs sont nouveaux
                  </p>
                  <div className="dashboard-widget__bar-track">
                    <div
                      className="dashboard-widget__bar-fill"
                      style={{ width: `${newUsersPercent}%` }}
                    />
                  </div>
                  <ul className="dashboard-widget__list">
                    <li>
                      <span>Nouveaux</span>
                      <span>{newUsers}</span>
                    </li>
                    <li>
                      <span>Visiteurs qui reviennent</span>
                      <span>{returningUsers}</span>
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>

          {data.fetchedAt && (
            <p className="dashboard-widget__muted" style={{ marginTop: 12, fontSize: 11 }}>
              Dernière mise à jour : {formatFetchedAt(data.fetchedAt)}
              {data.stale && ' — synchronisation en échec, anciennes données affichées'}. Ces
              chiffres peuvent avoir jusqu&apos;à 24-48h de retard (délai de traitement Google).
            </p>
          )}
        </>
      )}
    </div>
  )
}
