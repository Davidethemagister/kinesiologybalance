import { useState } from 'react'
import { SessionProvider, useSession } from './context/SessionContext'
import { PreChecksPanel } from './panels/PreChecksPanel'
import { GoalPanel } from './panels/GoalPanel'
import { IntegrationPanel } from './panels/IntegrationPanel'
import { PotCreationPanel } from './panels/PotCreationPanel'
import { ClosingPanel } from './panels/ClosingPanel'
import type { PanelId } from './types'

const TABS: { id: PanelId; label: string }[] = [
  { id: 'pre-checks', label: 'Pre-Checks' },
  { id: 'goal', label: 'Goal' },
  { id: 'integration', label: 'Integration' },
  { id: 'pot-creation', label: 'Pot Creation' },
  { id: 'closing', label: 'Closing' },
]

function AppShell() {
  const [panel, setPanel] = useState<PanelId>('pre-checks')
  const { state } = useSession()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <h1 className="text-lg font-bold text-slate-800">Kinesio Session</h1>
          {activeGoal ? (
            <p className="text-sm text-sage-dark font-semibold mt-1 truncate">Active Goal: {activeGoal.issue}</p>
          ) : (
            <p className="text-sm text-slate-400 mt-1">No active goal selected</p>
          )}
        </div>
        <nav className="max-w-2xl mx-auto px-2 mt-3 overflow-x-auto">
          <div className="flex gap-1 pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPanel(tab.id)}
                className={`flex-shrink-0 px-4 py-3 rounded-full text-sm font-semibold transition-colors ${
                  panel === tab.id ? 'bg-sage text-slate-900' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 px-4 pt-6">
        {panel === 'pre-checks' && <PreChecksPanel />}
        {panel === 'goal' && <GoalPanel />}
        {panel === 'integration' && <IntegrationPanel />}
        {panel === 'pot-creation' && <PotCreationPanel />}
        {panel === 'closing' && <ClosingPanel />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <SessionProvider>
      <AppShell />
    </SessionProvider>
  )
}
