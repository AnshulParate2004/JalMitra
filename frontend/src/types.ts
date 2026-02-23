/** Single water quality reading from ESP32 */
export interface Reading {
  timestamp: string
  ph: number
  turbidity: number
  tds: number
  device_id?: string
  temperature?: number
}

/** Alert when threshold exceeded (SMS sent) */
export interface Alert {
  timestamp: string
  device_id: string
  message: string
}

/** Dashboard summary from GET /api/stats */
export interface Stats {
  readings_count: number
  alerts_count: number
  latest_timestamp: string | null
  device_id: string | null
}
