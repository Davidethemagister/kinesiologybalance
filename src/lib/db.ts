import Dexie, { type EntityTable } from 'dexie'
import type { EmotionEntry, Level, StrongWeak } from '../types'

// Local-only storage (IndexedDB via Dexie) — this app runs for one
// practitioner on one device, so there's no auth and no sync. PRACTITIONER_ID
// is a fixed local stand-in for what would be auth.uid() in a hosted
// multi-tenant setup: every client/session row carries it so that if this
// ever needs a real backend again, it's an owner field already in place
// rather than a schema change.
export const PRACTITIONER_ID = 'local-practitioner'

export interface ClientRow {
  id: string
  practitionerId: string
  fullName: string
  dateOfBirth: string
  contactEmail: string
  contactPhone: string
  notes: string
  consentGiven: boolean
  consentGivenAt: string | null
  consentVersion: string | null
  archivedAt: string | null
  createdAt: string
}

export interface SessionRow {
  id: string
  practitionerId: string
  clientId: string
  sessionDate: string
  status: 'in_progress' | 'completed'
  activeGoalId: string | null
  activePreCheckRoundId: string | null
}

export interface PreCheckRoundRow {
  id: string
  sessionId: string
  roundNumber: number
  createdAt: string
}

export interface PreCheckRow {
  id: string
  roundId: string
  voiceId: string | null
  name: string
  source: 'standard' | 'surrogation' | 'custom'
  result: StrongWeak | null
  emotionAttached: boolean | null
  emotionEntry: EmotionEntry | null
  notes: string
}

export interface GoalRow {
  id: string
  sessionId: string
  issue: string
  goalStatement: string
  status: 'pending' | 'accepted'
  order: number
}

export interface IntegrationCheckRow {
  goalId: string
  lifeEnergyPercent: number | null
  stressOnGoalPercent: number | null
  sabotageCheck: StrongWeak | null
  sabotageNotes: string
}

export interface AffirmationRow {
  integrationCheckId: string
  voiceId: string
  statement: string
  resultsByLevel: Record<Level, StrongWeak | null>
}

export interface PotCreationRow {
  goalId: string
  emotionEntry: EmotionEntry | null
  time: 'present' | 'past' | null
  needsMoreInfo: boolean | null
  moreInfoNotes: string
  branch: 'physical' | 'energetic' | null
  subBranch: string | null
  findings: string
}

export interface ClosingRow {
  goalId: string
  anythingElse: boolean | null
  anythingElseNotes: string
  retestConfirmed: boolean
  nextSessionDate: string | null
  homework: string
}

export interface InterventionRow {
  goalId: string
  technique: string
  retestResult: StrongWeak | null
  notes: string
}

const db = new Dexie('kinesio-session') as Dexie & {
  clients: EntityTable<ClientRow, 'id'>
  sessions: EntityTable<SessionRow, 'id'>
  preCheckRounds: EntityTable<PreCheckRoundRow, 'id'>
  preChecks: EntityTable<PreCheckRow, 'id'>
  goals: EntityTable<GoalRow, 'id'>
  integrationChecks: EntityTable<IntegrationCheckRow, 'goalId'>
  affirmations: EntityTable<AffirmationRow, 'integrationCheckId'>
  potCreations: EntityTable<PotCreationRow, 'goalId'>
  closings: EntityTable<ClosingRow, 'goalId'>
  interventions: EntityTable<InterventionRow, 'goalId'>
}

db.version(1).stores({
  clients: 'id, practitionerId, fullName',
  sessions: 'id, clientId, practitionerId',
  preCheckRounds: 'id, sessionId',
  preChecks: 'id, roundId',
  goals: 'id, sessionId',
  integrationChecks: 'goalId',
  affirmations: '[integrationCheckId+voiceId], integrationCheckId',
  potCreations: 'goalId',
  closings: 'goalId',
  interventions: 'goalId',
})

export { db }
