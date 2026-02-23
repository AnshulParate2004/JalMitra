import React from 'react'

export type Page = 'dashboard' | 'history' | 'alerts'

interface LayoutProps {
  page: Page
  onNavigate: (page: Page) => void
  children: React.ReactNode
}

const NAV: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '◉' },
  { id: 'history', label: 'History', icon: '▣' },
  { id: 'alerts', label: 'Alerts', icon: '⚠' },
]

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Live overview',
  history: 'Readings history',
  alerts: 'Alert history',
}

export function Layout({ page, onNavigate, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">JalSuraksha</span>
          <span className="sidebar-tagline">Water quality</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              className={`sidebar-btn ${page === id ? 'active' : ''}`}
              onClick={() => onNavigate(id)}
            >
              <span className="sidebar-btn-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer" aria-hidden>
          <span className="sidebar-footer-text">जलमंथन</span>
        </div>
      </aside>
      <div className="app-main">
        <header className="page-header">
          <h1 className="page-title">{PAGE_TITLES[page]}</h1>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  )
}
