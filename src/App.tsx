import { useEffect, useRef, useState } from 'react'
import { SessionProvider, useSession, type SessionState } from './context/SessionContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ClientsProvider, useClients, type SessionRecord } from './context/ClientsContext'
import { LoginView } from './views/LoginView'
import { ClientListView } from './views/ClientListView'
import { ClientDetailView } from './views/ClientDetailView'
import { exportClientData } from './lib/dataExport'
import { loadSessionState } from './lib/loadSession'
import { saveSessionState } from './lib/sessionSync'
import { PreChecksPanel } from './panels/PreChecksPanel'
import { GoalPanel } from './panels/GoalPanel'
import { IntegrationPanel } from './panels/IntegrationPanel'
import { PotCreationPanel } from './panels/PotCreationPanel'
import { InterventionPanel } from './panels/InterventionPanel'
import { ClosingPanel } from './panels/ClosingPanel'
import { SettingsPanel } from './panels/SettingsPanel'
import { AFFIRMATIONS } from './data/affirmations'
import type { PanelId } from './types'

type ViewId = 'home' | 'settings' | PanelId
const TOTAL_STEPS = 6

interface StepMeta {
  id: PanelId
  index: number
  tabLabel: string
  title: string
  soft: string
  softDeep: string
  softText: string
  meta: (state: SessionState, enabledAffirmationCount: number) => string
}

const STEPS: StepMeta[] = [
  {
    id: 'pre-checks',
    index: 1,
    tabLabel: 'Pre-Checks',
    title: 'Pre-Checks',
    soft: 'bg-elementSoft-water',
    softDeep: 'bg-elementSoftDeep-water',
    softText: 'text-elementInk-water',
    meta: (state) => {
      const round = state.preCheckRounds.find((r) => r.id === state.activePreCheckRoundId)
      const roundLabel = round ? `Round ${round.roundNumber}` : ''
      return `${round?.checks.length ?? 0} checks · ${roundLabel}`
    },
  },
  {
    id: 'goal',
    index: 2,
    tabLabel: 'Goal',
    title: 'Issue & Goal',
    soft: 'bg-elementSoft-wood',
    softDeep: 'bg-elementSoftDeep-wood',
    softText: 'text-elementInk-wood',
    meta: (state) => `${state.goals.length} accepted`,
  },
  {
    id: 'integration',
    index: 3,
    tabLabel: 'Integration',
    title: 'Integration & Sabotage',
    soft: 'bg-elementSoft-fire',
    softDeep: 'bg-elementSoftDeep-fire',
    softText: 'text-elementInk-fire',
    meta: (_state, enabledAffirmationCount) => `${enabledAffirmationCount} affirmations`,
  },
  {
    id: 'pot-creation',
    index: 4,
    tabLabel: 'Pot Creation',
    title: 'Pot Creation',
    soft: 'bg-elementSoft-earth',
    softDeep: 'bg-elementSoftDeep-earth',
    softText: 'text-elementInk-earth',
    meta: () => 'Emotion · Time · Branch',
  },
  {
    id: 'closing',
    index: 5,
    tabLabel: 'Closing',
    title: 'Closing',
    soft: 'bg-elementSoft-metal',
    softDeep: 'bg-elementSoftDeep-metal',
    softText: 'text-elementInk-metal',
    meta: () => 'Homework & next date',
  },
  {
    id: 'intervention',
    index: 6,
    tabLabel: 'Intervention',
    title: 'Intervention',
    soft: 'bg-sage/30',
    softDeep: 'bg-sage',
    softText: 'text-slate-800',
    meta: () => 'Technique & retest',
  },
]

function HomeView({
  onSelect,
  state,
  enabledAffirmationCount,
}: {
  onSelect: (id: PanelId) => void
  state: SessionState
  enabledAffirmationCount: number
}) {
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-4 md:px-8 pt-4 md:pt-6 pb-1">
        <h1 className="text-lg md:text-xl font-extrabold text-slate-800">Kinesio Session</h1>
        {activeGoal ? (
          <p className="text-sm md:text-base font-semibold text-sage-dark mt-1">Active Goal: {activeGoal.issue}</p>
        ) : (
          <p className="text-sm md:text-base text-slate-400 mt-1">No active goal selected</p>
        )}
      </div>
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 auto-rows-fr gap-3 md:gap-5 px-4 md:px-8 pb-6 md:pb-8">
        {STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={`${step.soft} ${step.softText} rounded-3xl p-5 md:p-7 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition flex flex-col justify-between`}
          >
            <div>
              <span className="block text-xs font-bold uppercase tracking-wide opacity-75">Step {step.index}</span>
              <span className="block text-xl md:text-2xl font-bold mt-1">{step.tabLabel}</span>
            </div>
            <span className="block text-sm font-semibold opacity-80 mt-3">
              {step.meta(state, enabledAffirmationCount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function AppShell() {
  const [view, setView] = useState<ViewId>('home')
  const { state } = useSession()
  const { isAffirmationVoiceEnabled } = useSettings()
  const currentStep = STEPS.find((s) => s.id === view)
  const enabledAffirmationCount = AFFIRMATIONS.filter((a) => isAffirmationVoiceEnabled(a.id)).length

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center gap-3 md:gap-4 px-4 md:px-8 py-2.5">
        <button
          onClick={() => setView('home')}
          aria-label="Home"
          className={`flex-shrink-0 h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center text-lg transition-colors ${
            view === 'home' ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-500'
          }`}
        >
          ⌂
        </button>
        <nav className="flex-1 flex gap-2 overflow-x-auto">
          {STEPS.map((step) => {
            const active = view === step.id
            return (
              <button
                key={step.id}
                onClick={() => setView(step.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 md:px-4 py-2 md:py-2.5 rounded-full text-sm font-bold border transition-colors ${
                  active
                    ? `${step.soft} ${step.softText} border-transparent`
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${step.softDeep}`} aria-hidden />
                {step.tabLabel}
              </button>
            )
          })}
        </nav>
        <button
          onClick={() => setView('settings')}
          aria-label="Settings"
          className={`flex-shrink-0 h-10 w-10 md:h-11 md:w-11 rounded-xl flex items-center justify-center text-lg transition-colors ${
            view === 'settings' ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-500'
          }`}
        >
          ⚙
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        {view === 'home' && (
          <HomeView onSelect={setView} state={state} enabledAffirmationCount={enabledAffirmationCount} />
        )}

        {view === 'settings' && (
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-100 text-slate-700 px-4 md:px-8 py-6 md:py-8">
              <p className="text-xs md:text-sm font-bold uppercase tracking-wide opacity-75">Settings</p>
              <h1 className="text-2xl md:text-4xl font-bold mt-1">Panel Voices</h1>
            </div>
            <div className="flex-1 px-4 md:px-8 py-6">
              <SettingsPanel />
            </div>
          </div>
        )}

        {currentStep && (
          <div className="flex-1 flex flex-col">
            <div className={`${currentStep.soft} ${currentStep.softText} px-4 md:px-8 py-6 md:py-8`}>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wide opacity-75">
                Step {currentStep.index} of {TOTAL_STEPS}
              </p>
              <h1 className="text-2xl md:text-4xl font-bold mt-1">{currentStep.title}</h1>
            </div>
            <div className="flex-1 px-4 md:px-8 py-6">
              {view === 'pre-checks' && <PreChecksPanel />}
              {view === 'goal' && <GoalPanel />}
              {view === 'integration' && <IntegrationPanel />}
              {view === 'pot-creation' && <PotCreationPanel />}
              {view === 'closing' && <ClosingPanel />}
              {view === 'intervention' && <InterventionPanel />}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

type Route =
  | { kind: 'clients' }
  | { kind: 'client-detail'; clientId: string }
  | { kind: 'session'; sessionId: string; clientId: string }

const SAVE_DEBOUNCE_MS = 600

function ClientSessionShell({
  clientName,
  session,
  onBack,
  onToggleStatus,
}: {
  clientName: string
  session: SessionRecord
  onBack: () => void
  onToggleStatus: () => void
}) {
  const [loadedState, setLoadedState] = useState<SessionState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    loadSessionState(session.id)
      .then((data) => {
        if (!cancelled) setLoadedState(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load session')
      })
    return () => {
      cancelled = true
    }
  }, [session.id])

  function handleChange(data: SessionState) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveSessionState(session.id, data).catch((err) => {
        console.error('Failed to save session', err)
      })
    }, SAVE_DEBOUNCE_MS)
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center gap-3">
        <p className="text-rose-600">Couldn't load this session: {loadError}</p>
        <button onClick={onBack} className="text-sage-dark font-semibold">
          ← Back to {clientName}
        </button>
      </div>
    )
  }

  if (!loadedState) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading session…</div>
  }

  return (
    <SessionProvider initialState={loadedState} onChange={handleChange}>
      <div className="min-h-screen flex flex-col">
        <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-2 flex items-center justify-between gap-3">
          <button onClick={onBack} className="text-sm font-semibold text-sage-dark truncate">
            ← {clientName}
          </button>
          <button
            onClick={onToggleStatus}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {session.status === 'completed' ? 'Completed' : 'In progress'}
          </button>
        </div>
        <AppShell />
      </div>
    </SessionProvider>
  )
}

function AppRouter() {
  const [route, setRoute] = useState<Route>({ kind: 'clients' })
  const { clients, loading, sessionsByClient, loadSessionsForClient, addClient, removeClient, startSession, setSessionStatus } =
    useClients()

  useEffect(() => {
    if (route.kind === 'client-detail' || route.kind === 'session') {
      loadSessionsForClient(route.clientId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.kind === 'clients' ? null : route.clientId])

  if (route.kind === 'clients') {
    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>
    return (
      <ClientListView
        clients={clients}
        onSelectClient={(clientId) => setRoute({ kind: 'client-detail', clientId })}
        onAddClient={(client) => addClient(client)}
      />
    )
  }

  const client = clients.find((c) => c.id === route.clientId)
  if (!client) {
    // Client no longer exists (e.g. just deleted), or clients haven't loaded yet — fall back to the list.
    if (!loading) setRoute({ kind: 'clients' })
    return null
  }

  const sessions = sessionsByClient[client.id]

  if (route.kind === 'client-detail') {
    if (!sessions) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>
    return (
      <ClientDetailView
        client={client}
        sessions={sessions}
        onBack={() => setRoute({ kind: 'clients' })}
        onStartSession={async () => {
          const sessionId = await startSession(client.id)
          setRoute({ kind: 'session', sessionId, clientId: client.id })
        }}
        onOpenSession={(sessionId) => setRoute({ kind: 'session', sessionId, clientId: client.id })}
        onDeleteClient={async () => {
          await removeClient(client.id)
          setRoute({ kind: 'clients' })
        }}
        onExportClient={() => exportClientData(client)}
      />
    )
  }

  const sessionRecord = sessions?.find((s) => s.id === route.sessionId)
  if (!sessionRecord) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>
  }

  return (
    <ClientSessionShell
      clientName={client.fullName}
      session={sessionRecord}
      onBack={() => setRoute({ kind: 'client-detail', clientId: client.id })}
      onToggleStatus={() =>
        setSessionStatus(sessionRecord.id, client.id, sessionRecord.status === 'completed' ? 'in_progress' : 'completed')
      }
    />
  )
}

function AuthGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>
  }
  if (!user) {
    return <LoginView />
  }
  return (
    <ClientsProvider>
      <AppRouter />
    </ClientsProvider>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </SettingsProvider>
  )
}
