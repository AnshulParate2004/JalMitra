import React from 'react'

interface LiveStatusProps {
  connected: boolean
  onRefresh?: () => void
}

export function LiveStatus({ connected, onRefresh }: LiveStatusProps) {
  return (
    <div className="card live-status-card">
      <div className="live-status">
        <span className={`live-dot ${connected ? 'live' : 'off'}`} aria-hidden />
        <span className="live-label">{connected ? 'Live' : 'Disconnected'}</span>
        <span className="live-desc">
          {connected ? 'WebSocket connected' : 'Reconnecting…'}
        </span>
        {onRefresh && (
          <button type="button" className="btn btn-sm" onClick={onRefresh}>
            Refresh
          </button>
        )}
      </div>
    </div>
  )
}
