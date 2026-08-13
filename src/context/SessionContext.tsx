import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import type {
  PreCheck,
  Goal,
  IntegrationCheck,
  PotCreation,
  Closing,
  EmotionEntry,
  Level,
  StrongWeak,
} from '../types'
import { STANDARD_CHECK_NAMES, SURROGATION_CHECK_NAME } from '../data/preChecks'
import { AFFIRMATION_STATEMENTS, LEVELS } from '../data/affirmations'
import { genId } from '../utils/id'

// This state shape is intentionally flat and keyed by goalId for the
// per-goal panels (Integration, Pot Creation, Closing) so it can later be
// mirrored into Supabase tables (or localStorage) with minimal reshaping.
export interface SessionState {
  preChecks: PreCheck[]
  goals: Goal[]
  activeGoalId: string | null
  integrationChecks: Record<string, IntegrationCheck>
  potCreations: Record<string, PotCreation>
  closings: Record<string, Closing>
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

function makeInitialPreChecks(): PreCheck[] {
  const standard: PreCheck[] = STANDARD_CHECK_NAMES.map((name) => ({
    id: genId(),
    name,
    source: 'standard',
    result: null,
    emotionAttached: null,
    emotionEntry: null,
    notes: '',
  }))
  const surrogation: PreCheck = {
    id: genId(),
    name: SURROGATION_CHECK_NAME,
    source: 'surrogation',
    result: null,
    emotionAttached: null,
    emotionEntry: null,
    notes: '',
  }
  return [...standard, surrogation]
}

function makeInitialIntegration(goalId: string): IntegrationCheck {
  return {
    goalId,
    lifeEnergyPercent: null,
    stressOnGoalPercent: null,
    affirmations: AFFIRMATION_STATEMENTS.map((statement) => ({
      statement,
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

function initialState(): SessionState {
  return {
    preChecks: makeInitialPreChecks(),
    goals: [],
    activeGoalId: null,
    integrationChecks: {},
    potCreations: {},
    closings: {},
  }
}

type Action =
  | { type: 'SET_PRECHECK_RESULT'; id: string; result: StrongWeak }
  | { type: 'SET_PRECHECK_EMOTION_ATTACHED'; id: string; attached: boolean }
  | { type: 'SET_PRECHECK_EMOTION_ENTRY'; id: string; entry: EmotionEntry }
  | { type: 'SET_PRECHECK_NOTES'; id: string; notes: string }
  | { type: 'ADD_CUSTOM_PRECHECK'; name: string }
  | { type: 'ADD_ACCEPTED_GOAL'; issue: string; goalStatement: string }
  | { type: 'REORDER_GOALS'; orderedIds: string[] }
  | { type: 'SET_ACTIVE_GOAL'; id: string }
  | { type: 'PATCH_INTEGRATION'; goalId: string; patch: Partial<IntegrationCheck> }
  | { type: 'SET_AFFIRMATION_LEVEL'; goalId: string; index: number; level: Level; result: StrongWeak }
  | { type: 'PATCH_POT'; goalId: string; patch: Partial<PotCreation> }
  | { type: 'PATCH_CLOSING'; goalId: string; patch: Partial<Closing> }

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'SET_PRECHECK_RESULT':
      return {
        ...state,
        preChecks: state.preChecks.map((c) => (c.id === action.id ? { ...c, result: action.result } : c)),
      }
    case 'SET_PRECHECK_EMOTION_ATTACHED':
      return {
        ...state,
        preChecks: state.preChecks.map((c) =>
          c.id === action.id ? { ...c, emotionAttached: action.attached } : c,
        ),
      }
    case 'SET_PRECHECK_EMOTION_ENTRY':
      return {
        ...state,
        preChecks: state.preChecks.map((c) => (c.id === action.id ? { ...c, emotionEntry: action.entry } : c)),
      }
    case 'SET_PRECHECK_NOTES':
      return {
        ...state,
        preChecks: state.preChecks.map((c) => (c.id === action.id ? { ...c, notes: action.notes } : c)),
      }
    case 'ADD_CUSTOM_PRECHECK':
      return {
        ...state,
        preChecks: [
          ...state.preChecks,
          {
            id: genId(),
            name: action.name,
            source: 'custom',
            result: null,
            emotionAttached: null,
            emotionEntry: null,
            notes: '',
          },
        ],
      }
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
      const affirmations = existing.affirmations.map((aff, i) =>
        i === action.index
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
  getClosing: (goalId: string) => Closing
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  const value: SessionContextValue = {
    state,
    dispatch,
    getIntegration: (goalId) => state.integrationChecks[goalId] ?? makeInitialIntegration(goalId),
    getPot: (goalId) => state.potCreations[goalId] ?? makeInitialPot(goalId),
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
