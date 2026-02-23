import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { fetchReadings } from '../api'
import { AnimateIn } from '../components/AnimateIn'
import type { Reading } from '../types'

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ts
  }
}

export function History() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchReadings(100)
      .then((data) => {
        if (!cancelled) setReadings(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const chartData = readings
    .slice()
    .reverse()
    .map((r) => ({
      time: formatTime(r.timestamp),
      full: r.timestamp,
      ph: r.ph,
      turbidity: r.turbidity,
      tds: r.tds,
    }))

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
            Loading history…
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
      <AnimateIn delay={0}>
        <section className="card">
          <h2 className="card-title">Readings over time</h2>
          {chartData.length === 0 ? (
            <p className="muted">No data yet.</p>
          ) : (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      payload[0]?.payload?.full
                        ? new Date(payload[0].payload.full).toLocaleString()
                        : ''
                    }
                  />
                  <Line type="monotone" dataKey="ph" stroke="var(--color-ph)" strokeWidth={2} dot={false} name="pH" />
                  <Line type="monotone" dataKey="turbidity" stroke="var(--color-turbidity)" strokeWidth={2} dot={false} name="Turbidity" />
                  <Line type="monotone" dataKey="tds" stroke="var(--color-tds)" strokeWidth={2} dot={false} name="TDS" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </AnimateIn>
      <AnimateIn delay={100}>
        <section className="card">
          <h2 className="card-title">Table (last {readings.length} readings)</h2>
          {readings.length === 0 ? (
            <p className="muted">No readings.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>pH</th>
                    <th>Turbidity</th>
                    <th>TDS</th>
                    <th>Temp</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((r, i) => (
                    <tr key={i}>
                      <td>{formatTime(r.timestamp)}</td>
                      <td>{r.ph.toFixed(1)}</td>
                      <td>{r.turbidity.toFixed(0)}</td>
                      <td>{r.tds.toFixed(0)}</td>
                      <td>{r.temperature != null ? r.temperature.toFixed(1) : '–'}</td>
                      <td>{r.device_id ?? '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AnimateIn>
    </>
  )
}
