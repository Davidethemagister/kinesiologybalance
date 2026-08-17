import { useState } from 'react'
import { SessionProvider, useSession } from './context/SessionContext'
import { PreChecksPanel } from './panels/PreChecksPanel'
import { GoalPanel } from './panels/GoalPanel'
import { IntegrationPanel } from './panels/IntegrationPanel'
import { PotCreationPanel } from './panels/PotCreationPanel'
import { ClosingPanel } from './panels/ClosingPanel'
import { AFFIRMATION_STATEMENTS } from './data/affirmations'
import type { PanelId } from './types'
import type { SessionState } from './context/SessionContext'

type ViewId = 'home' | PanelId

interface StepMeta {
  id: PanelId
  index: number
  tabLabel: string
  title: string
  soft: string
  softDeep: string
  softText: string
  meta: (state: SessionState) => string
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
    meta: (state) => `${state.preChecks.length} checks`,
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
    meta: () => `${AFFIRMATION_STATEMENTS.length} affirmations`,
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
]

function HomeView({ onSelect, state }: { onSelect: (id: PanelId) => void; state: SessionState }) {
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
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            onClick={() => onSelect(step.id)}
            className={`${step.soft} ${step.softText} rounded-3xl p-5 md:p-7 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition ${
              i === 4
                ? 'col-span-2 md:col-span-1 flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-between'
                : 'flex flex-col justify-between'
            }`}
          >
            <div>
              <span className="block text-xs font-bold uppercase tracking-wide opacity-75">Step {step.index}</span>
              <span className="block text-xl md:text-2xl font-bold mt-1">{step.tabLabel}</span>
            </div>
            <span className="block text-sm font-semibold opacity-80 mt-3">{step.meta(state)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function AppShell() {
  const [view, setView] = useState<ViewId>('home')
  const { state } = useSession()
  const currentStep = STEPS.find((s) => s.id === view)

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
      </header>

      <main className="flex-1 flex flex-col">
        {view === 'home' && <HomeView onSelect={setView} state={state} />}

        {currentStep && (
          <div className="flex-1 flex flex-col">
            <div className={`${currentStep.soft} ${currentStep.softText} px-4 md:px-8 py-6 md:py-8`}>
              <p className="text-xs md:text-sm font-bold uppercase tracking-wide opacity-75">
                Step {currentStep.index} of 5
              </p>
              <h1 className="text-2xl md:text-4xl font-bold mt-1">{currentStep.title}</h1>
            </div>
            <div className="flex-1 px-4 md:px-8 py-6">
              {view === 'pre-checks' && <PreChecksPanel />}
              {view === 'goal' && <GoalPanel />}
              {view === 'integration' && <IntegrationPanel />}
              {view === 'pot-creation' && <PotCreationPanel />}
              {view === 'closing' && <ClosingPanel />}
            </div>
          </div>
        )}
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
