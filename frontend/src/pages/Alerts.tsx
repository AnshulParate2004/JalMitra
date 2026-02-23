import React, { useEffect, useState } from 'react'
import { fetchAlerts, fetchStats } from '../api'
import { AnimateIn } from '../components/AnimateIn'
import type { Alert as AlertType } from '../types'

export function Alerts() {
  const [alerts, setAlerts] = useState<AlertType[]>([])
  const [stats, setStats] = useState<{ alerts_count: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([fetchAlerts(100), fetchStats()])
      .then(([a, s]) => {
        setAlerts(a)
        setStats(s)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <AnimateIn>
        <div className="card loading-card">
          <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="loading-dots">
              <span />
              <span />
              <span />
            </span>
            Loading alerts…
          </p>
        </div>
      </AnimateIn>
    )
  }
  if (error) {
    return (
      <AnimateIn>
        <div className="card">
          <p className="error">{error}</p>
        </div>
      </AnimateIn>
    )
  }

  return (
    <>
      {stats != null && (
        <AnimateIn delay={0}>
          <section className="card stats-card">
            <p className="muted">
              Total alerts stored: <strong style={{ color: 'var(--text)' }}>{stats.alerts_count}</strong>
            </p>
          </section>
        </AnimateIn>
      )}
      <AnimateIn delay={80}>
        <section className="card">
          <h2 className="card-title">Alert history (SMS sent for each)</h2>
          {alerts.length === 0 ? (
            <p className="muted">No alerts yet.</p>
          ) : (
            <ul className="alert-list full">
              {alerts.map((a, i) => (
                <li key={i} className="alert-item">
                  <strong>{a.message}</strong>
                  <span className="muted">
                    {new Date(a.timestamp).toLocaleString()}
                    {a.device_id ? ` · ${a.device_id}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button type="button" className="btn btn-sm" onClick={load} style={{ marginTop: '1rem' }}>
            Refresh
          </button>
        </section>
      </AnimateIn>
    </>
  )
}
