import { createContext, useContext, useEffect, useReducer, useRef, type Dispatch, type ReactNode } from 'react'
import type {
  PreCheck,
  PreCheckRound,
  Goal,
  IntegrationCheck,
  PotCreation,
  Closing,
  Intervention,
  InterventionCheck,
  EmotionEntry,
  Level,
  StrongWeak,
} from '../types'
import { STANDARD_CHECKS, SURROGATION_CHECK, ASSEMBLAGE_POINT_CHECK } from '../data/preChecks'
import { STANDARD_INTERVENTIONS } from '../data/interventions'
import { AFFIRMATIONS, LEVELS } from '../data/affirmations'
import { genId } from '../utils/id'

// This state shape is intentionally flat and keyed by goalId for the
// per-goal panels (Integration, Pot Creation, Intervention, Closing) so it
// maps cleanly onto the local Dexie tables (see src/lib/db.ts) with minimal
// reshaping.
export interface SessionState {
  preCheckRounds: PreCheckRound[]
  activePreCheckRoundId: string
  goals: Goal[]
  activeGoalId: string | null
  integrationChecks: Record<string, IntegrationCheck>
  potCreations: Record<string, PotCreation>
  closings: Record<string, Closing>
  interventions: Record<string, Intervention>
}

function emptyLevelResults(): Record<Level, StrongWeak | null> {
  return LEVELS.reduce(
    (acc, level) => {
      acc[level.id] = null
      return acc
    },
    {} as Record<Level, StrongWeak | null>,
  )
}

function makeStandardChecks(): PreCheck[] {
  const standard: PreCheck[] = STANDARD_CHECKS.map((voice) => ({
    id: genId(),
    voiceId: voice.id,
    name: voice.name,
    source: 'standard',
    result: null,
    emotionAttached: null,
    emotionEntry: null,
    notes: '',
  }))
  const surrogation: PreCheck = {
    id: genId(),
    voiceId: SURROGATION_CHECK.id,
    name: SURROGATION_CHECK.name,
    source: 'surrogation',
    result: null,
    emotionAttached: null,
    emotionEntry: null,
    notes: '',
  }
  const assemblagePoint: PreCheck = {
    id: genId(),
    voiceId: ASSEMBLAGE_POINT_CHECK.id,
    name: ASSEMBLAGE_POINT_CHECK.name,
    source: 'standard',
    result: null,
    emotionAttached: null,
    emotionEntry: null,
    notes: '',
  }
  return [...standard, surrogation, assemblagePoint]
}

function makePreCheckRound(roundNumber: number): PreCheckRound {
  return {
    id: genId(),
    roundNumber,
    createdAt: new Date().toISOString(),
    checks: makeStandardChecks(),
  }
}

function makeInitialIntegration(goalId: string): IntegrationCheck {
  return {
    goalId,
    lifeEnergyPercent: null,
    stressOnGoalPercent: null,
    affirmations: AFFIRMATIONS.map((voice) => ({
      voiceId: voice.id,
      statement: voice.statement,
      resultsByLevel: emptyLevelResults(),
    })),
    sabotageCheck: null,
    sabotageNotes: '',
  }
}

function makeInitialPot(goalId: string): PotCreation {
  return {
    goalId,
    emotionEntry: null,
    time: null,
    needsMoreInfo: null,
    moreInfoNotes: '',
    branch: null,
    subBranch: null,
    findings: '',
  }
}

function makeInterventionChecks(): InterventionCheck[] {
  return STANDARD_INTERVENTIONS.map((technique) => ({
    id: genId(),
    voiceId: technique.id,
    name: technique.name,
    source: 'standard',
    done: false,
    notes: '',
  }))
}

function makeInitialIntervention(goalId: string): Intervention {
  return {
    goalId,
    checks: makeInterventionChecks(),
  }
}

function makeInitialClosing(goalId: string): Closing {
  return {
    goalId,
    anythingElse: null,
    anythingElseNotes: '',
    retestConfirmed: false,
    nextSessionDate: null,
    homework: '',
  }
}

// Exported so callers that own session persistence (ClientsContext, via
// src/lib/sessionSync.ts) can seed a brand-new session's starting data.
export function createInitialSessionState(): SessionState {
  const firstRound = makePreCheckRound(1)
  return {
    preCheckRounds: [firstRound],
    activePreCheckRoundId: firstRound.id,
    goals: [],
    activeGoalId: null,
    integrationChecks: {},
    potCreations: {},
    closings: {},
    interventions: {},
  }
}

type Action =
  | { type: 'SET_PRECHECK_RESULT'; roundId: string; id: string; result: StrongWeak }
  | { type: 'SET_PRECHECK_EMOTION_ATTACHED'; roundId: string; id: string; attached: boolean }
  | { type: 'SET_PRECHECK_EMOTION_ENTRY'; roundId: string; id: string; entry: EmotionEntry }
  | { type: 'SET_PRECHECK_NOTES'; roundId: string; id: string; notes: string }
  | { type: 'ADD_CUSTOM_PRECHECK'; roundId: string; name: string }
  | { type: 'START_NEW_PRECHECK_ROUND' }
  | { type: 'SET_ACTIVE_PRECHECK_ROUND'; roundId: string }
  | { type: 'ADD_ACCEPTED_GOAL'; issue: string; goalStatement: string }
  | { type: 'REORDER_GOALS'; orderedIds: string[] }
  | { type: 'SET_ACTIVE_GOAL'; id: string }
  | { type: 'PATCH_INTEGRATION'; goalId: string; patch: Partial<IntegrationCheck> }
  | { type: 'SET_AFFIRMATION_LEVEL'; goalId: string; voiceId: string; level: Level; result: StrongWeak }
  | { type: 'PATCH_POT'; goalId: string; patch: Partial<PotCreation> }
  | { type: 'SET_INTERVENTION_CHECK_DONE'; goalId: string; id: string; done: boolean }
  | { type: 'SET_INTERVENTION_CHECK_NOTES'; goalId: string; id: string; notes: string }
  | { type: 'ADD_CUSTOM_INTERVENTION_CHECK'; goalId: string; name: string }
  | { type: 'PATCH_CLOSING'; goalId: string; patch: Partial<Closing> }

function patchRound(
  rounds: PreCheckRound[],
  roundId: string,
  updateChecks: (checks: PreCheck[]) => PreCheck[],
): PreCheckRound[] {
  return rounds.map((round) => (round.id === roundId ? { ...round, checks: updateChecks(round.checks) } : round))
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'SET_PRECHECK_RESULT':
      return {
        ...state,
        preCheckRounds: patchRound(state.preCheckRounds, action.roundId, (checks) =>
          checks.map((c) => (c.id === action.id ? { ...c, result: action.result } : c)),
        ),
      }
    case 'SET_PRECHECK_EMOTION_ATTACHED':
      return {
        ...state,
        preCheckRounds: patchRound(state.preCheckRounds, action.roundId, (checks) =>
          checks.map((c) => (c.id === action.id ? { ...c, emotionAttached: action.attached } : c)),
        ),
      }
    case 'SET_PRECHECK_EMOTION_ENTRY':
      return {
        ...state,
        preCheckRounds: patchRound(state.preCheckRounds, action.roundId, (checks) =>
          checks.map((c) => (c.id === action.id ? { ...c, emotionEntry: action.entry } : c)),
        ),
      }
    case 'SET_PRECHECK_NOTES':
      return {
        ...state,
        preCheckRounds: patchRound(state.preCheckRounds, action.roundId, (checks) =>
          checks.map((c) => (c.id === action.id ? { ...c, notes: action.notes } : c)),
        ),
      }
    case 'ADD_CUSTOM_PRECHECK':
      return {
        ...state,
        preCheckRounds: patchRound(state.preCheckRounds, action.roundId, (checks) => [
          ...checks,
          {
            id: genId(),
            voiceId: null,
            name: action.name,
            source: 'custom',
            result: null,
            emotionAttached: null,
            emotionEntry: null,
            notes: '',
          },
        ]),
      }
    case 'START_NEW_PRECHECK_ROUND': {
      const nextRoundNumber = state.preCheckRounds.length + 1
      const newRound = makePreCheckRound(nextRoundNumber)
      return {
        ...state,
        preCheckRounds: [...state.preCheckRounds, newRound],
        activePreCheckRoundId: newRound.id,
      }
    }
    case 'SET_ACTIVE_PRECHECK_ROUND':
      return { ...state, activePreCheckRoundId: action.roundId }
    case 'ADD_ACCEPTED_GOAL': {
      const goal: Goal = {
        id: genId(),
        issue: action.issue,
        goalStatement: action.goalStatement,
        status: 'accepted',
        order: state.goals.length,
      }
      return {
        ...state,
        goals: [...state.goals, goal],
        activeGoalId: state.activeGoalId ?? goal.id,
      }
    }
    case 'REORDER_GOALS': {
      const byId = new Map(state.goals.map((g) => [g.id, g]))
      const goals = action.orderedIds
        .map((id, index) => {
          const goal = byId.get(id)
          return goal ? { ...goal, order: index } : null
        })
        .filter((g): g is Goal => g !== null)
      return { ...state, goals }
    }
    case 'SET_ACTIVE_GOAL':
      return { ...state, activeGoalId: action.id }
    case 'PATCH_INTEGRATION': {
      const existing = state.integrationChecks[action.goalId] ?? makeInitialIntegration(action.goalId)
      return {
        ...state,
        integrationChecks: {
          ...state.integrationChecks,
          [action.goalId]: { ...existing, ...action.patch },
        },
      }
    }
    case 'SET_AFFIRMATION_LEVEL': {
      const existing = state.integrationChecks[action.goalId] ?? makeInitialIntegration(action.goalId)
      const affirmations = existing.affirmations.map((aff) =>
        aff.voiceId === action.voiceId
          ? { ...aff, resultsByLevel: { ...aff.resultsByLevel, [action.level]: action.result } }
          : aff,
      )
      return {
        ...state,
        integrationChecks: {
          ...state.integrationChecks,
          [action.goalId]: { ...existing, affirmations },
        },
      }
    }
    case 'PATCH_POT': {
      const existing = state.potCreations[action.goalId] ?? makeInitialPot(action.goalId)
      return {
        ...state,
        potCreations: {
          ...state.potCreations,
          [action.goalId]: { ...existing, ...action.patch },
        },
      }
    }
    case 'SET_INTERVENTION_CHECK_DONE': {
      const existing = state.interventions[action.goalId] ?? makeInitialIntervention(action.goalId)
      return {
        ...state,
        interventions: {
          ...state.interventions,
          [action.goalId]: {
            ...existing,
            checks: existing.checks.map((c) => (c.id === action.id ? { ...c, done: action.done } : c)),
          },
        },
      }
    }
    case 'SET_INTERVENTION_CHECK_NOTES': {
      const existing = state.interventions[action.goalId] ?? makeInitialIntervention(action.goalId)
      return {
        ...state,
        interventions: {
          ...state.interventions,
          [action.goalId]: {
            ...existing,
            checks: existing.checks.map((c) => (c.id === action.id ? { ...c, notes: action.notes } : c)),
          },
        },
      }
    }
    case 'ADD_CUSTOM_INTERVENTION_CHECK': {
      const existing = state.interventions[action.goalId] ?? makeInitialIntervention(action.goalId)
      const newCheck: InterventionCheck = {
        id: genId(),
        voiceId: null,
        name: action.name,
        source: 'custom',
        done: false,
        notes: '',
      }
      return {
        ...state,
        interventions: {
          ...state.interventions,
          [action.goalId]: { ...existing, checks: [...existing.checks, newCheck] },
        },
      }
    }
    case 'PATCH_CLOSING': {
      const existing = state.closings[action.goalId] ?? makeInitialClosing(action.goalId)
      return {
        ...state,
        closings: {
          ...state.closings,
          [action.goalId]: { ...existing, ...action.patch },
        },
      }
    }
    default:
      return state
  }
}

interface SessionContextValue {
  state: SessionState
  dispatch: Dispatch<Action>
  getIntegration: (goalId: string) => IntegrationCheck
  getPot: (goalId: string) => PotCreation
  getIntervention: (goalId: string) => Intervention
  getClosing: (goalId: string) => Closing
}

const SessionContext = createContext<SessionContextValue | null>(null)

interface SessionProviderProps {
  children: ReactNode
  // Seeds the reducer from an existing session's saved data (e.g. reopening a
  // past client visit) instead of always starting a brand-new session.
  initialState?: SessionState
  // Fired after every state change so an owner (App.tsx's ClientSessionShell,
  // via src/lib/sessionSync.ts) can persist the latest snapshot to Dexie. Not
  // used for the initial mount value.
  onChange?: (state: SessionState) => void
}

export function SessionProvider({ children, initialState: initialStateProp, onChange }: SessionProviderProps) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialStateProp ?? createInitialSessionState())

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onChangeRef.current?.(state)
  }, [state])

  const value: SessionContextValue = {
    state,
    dispatch,
    getIntegration: (goalId) => state.integrationChecks[goalId] ?? makeInitialIntegration(goalId),
    getPot: (goalId) => state.potCreations[goalId] ?? makeInitialPot(goalId),
    getIntervention: (goalId) => state.interventions[goalId] ?? makeInitialIntervention(goalId),
    getClosing: (goalId) => state.closings[goalId] ?? makeInitialClosing(goalId),
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return ctx
}
