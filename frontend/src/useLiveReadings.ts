import { useCallback, useEffect, useState } from 'react'
import type { Reading, Alert } from './types'

const API_BASE = ''
const WS_URL = (() => {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${proto}//${host}/ws`
})()

export function useLiveReadings() {
  const [latest, setLatest] = useState<Reading | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [wsConnected, setWsConnected] = useState(false)

  const fetchLatest = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/readings/latest`)
      if (r.ok) {
        const data = await r.json()
        setLatest(data)
      }
    } catch (_) {
      // ignore
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/api/alerts?limit=20`)
      if (r.ok) {
        const data = await r.json()
        setAlerts(data.alerts || [])
      }
    } catch (_) {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchLatest()
    fetchAlerts()
  }, [fetchLatest, fetchAlerts])

  useEffect(() => {
    let ws: WebSocket
    const connect = () => {
      ws = new WebSocket(WS_URL)
      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => {
        setWsConnected(false)
        setTimeout(connect, 3000)
      }
      ws.onerror = () => {}
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'reading' && msg.data) {
            setLatest(msg.data)
          }
          if (msg.type === 'alert' && msg.data) {
            setAlerts((prev) => [{ timestamp: msg.data.timestamp, device_id: msg.data.device_id, message: msg.data.message }, ...prev].slice(0, 50))
          }
        } catch (_) {}
      }
    }
    connect()
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) ws.close()
    }
  }, [])

  return { latest, alerts, wsConnected, refresh: () => { fetchLatest(); fetchAlerts() } }
}
