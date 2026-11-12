import AppShell from './AppShell'
import DashboardPage from './dashboard/DashboardPage'
import DocumentsPage from './documents/DocumentsPage'
import { PomodoroProvider } from './focus/PomodoroContext'
import { usePath } from './router'

export default function App() {
  const path = usePath()
  return (
    <PomodoroProvider>
      <AppShell path={path}>{path.startsWith('/materijali') ? <DocumentsPage /> : <DashboardPage />}</AppShell>
    </PomodoroProvider>
  )
}
