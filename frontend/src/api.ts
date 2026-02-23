import type { Reading, Alert, Stats } from './types'

const API_BASE = ''

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`)
  if (!r.ok) throw new Error(`API ${r.status}: ${path}`)
  return r.json()
}

export async function fetchLatestReading(deviceId?: string): Promise<Reading | null> {
  const q = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''
  try {
    return await get<Reading>(`/api/readings/latest${q}`)
  } catch {
    return null
  }
}

export async function fetchReadings(limit = 100, deviceId?: string): Promise<Reading[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (deviceId) params.set('device_id', deviceId)
  const { readings } = await get<{ readings: Reading[] }>(`/api/readings?${params}`)
  return readings ?? []
}

export async function fetchAlerts(limit = 50): Promise<Alert[]> {
  const { alerts } = await get<{ alerts: Alert[] }>(`/api/alerts?limit=${limit}`)
  return alerts ?? []
}

export async function fetchStats(): Promise<Stats> {
  return get<Stats>('/api/stats')
}
