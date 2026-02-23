import React from 'react'
import { useLiveReadings } from '../useLiveReadings'
import { LiveStatus } from '../components/LiveStatus'
import { AnimateIn } from '../components/AnimateIn'
import type { Reading } from '../types'

function ReadingCard({ reading }: { reading: Reading }) {
  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts)
      return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'medium' })
    } catch {
      return ts
    }
  }
  const phOk = reading.ph >= 6 && reading.ph <= 9
  const turbOk = reading.turbidity <= 100
  const tdsOk = reading.tds <= 500

  return (
    <section className="card reading-card">
      <h2 className="card-title">Latest reading</h2>
      <div className="reading-grid">
        <div className={`reading-item ${phOk ? 'ok' : 'alert'}`}>
          <span className="reading-label">pH</span>
          <span className="reading-value">{reading.ph.toFixed(1)}</span>
          <span className="reading-meta">safe 6–9</span>
        </div>
        <div className={`reading-item ${turbOk ? 'ok' : 'alert'}`}>
          <span className="reading-label">Turbidity (NTU)</span>
          <span className="reading-value">{reading.turbidity.toFixed(0)}</span>
          <span className="reading-meta">≤100</span>
        </div>
        <div className={`reading-item ${tdsOk ? 'ok' : 'alert'}`}>
          <span className="reading-label">TDS (ppm)</span>
          <span className="reading-value">{reading.tds.toFixed(0)}</span>
          <span className="reading-meta">≤500</span>
        </div>
        {reading.temperature != null && (
          <div className="reading-item">
            <span className="reading-label">Temp (°C)</span>
            <span className="reading-value">{reading.temperature.toFixed(1)}</span>
          </div>
        )}
      </div>
      <p className="reading-meta-line">
        {formatTime(reading.timestamp)}
        {reading.device_id && ` · ${reading.device_id}`}
      </p>
    </section>
  )
}

export function Dashboard() {
  const { latest, alerts, wsConnected, refresh } = useLiveReadings()

  return (
    <>
      <AnimateIn delay={0}>
        <LiveStatus connected={wsConnected} onRefresh={refresh} />
      </AnimateIn>
      {latest ? (
        <AnimateIn delay={80}>
          <ReadingCard reading={latest} />
        </AnimateIn>
      ) : (
        <AnimateIn delay={80}>
          <section className="card">
            <p className="muted">No readings yet. Send data from ESP32 to POST /api/readings.</p>
          </section>
        </AnimateIn>
      )}
      <AnimateIn delay={160}>
        <section className="card">
          <h2 className="card-title">Recent alerts (SMS sent when threshold exceeded)</h2>
          {alerts.length === 0 ? (
            <p className="muted">No alerts yet.</p>
          ) : (
            <ul className="alert-list">
              {alerts.slice(0, 10).map((a, i) => (
                <li key={i} className="alert-item">
                  <strong>{a.message}</strong>
                  <span className="muted">{new Date(a.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </AnimateIn>
    </>
  )
}
