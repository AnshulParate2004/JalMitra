import { useState } from 'react'
import { Layout, type Page } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { Alerts } from './pages/Alerts'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <Layout page={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard />}
      {page === 'history' && <History />}
      {page === 'alerts' && <Alerts />}
    </Layout>
  )
}
