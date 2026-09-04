import { db } from './db'
import type { SessionState } from '../context/SessionContext'
import type {
  PreCheckRound,
  Goal,
  IntegrationCheck,
  Affirmation,
  PotCreation,
  Closing,
  Intervention,
  NutritionAssessment,
} from '../types'

export async function loadSessionState(sessionId: string): Promise<SessionState> {
  const session = await db.sessions.get(sessionId)
  if (!session) throw new Error('Session not found')

  const [roundRows, goalRows] = await Promise.all([
    db.preCheckRounds.where('sessionId').equals(sessionId).sortBy('roundNumber'),
    db.goals.where('sessionId').equals(sessionId).sortBy('order'),
  ])

  const roundIds = roundRows.map((r) => r.id)
  const goalIds = goalRows.map((g) => g.id)

  const [checkRows, integrationRows, potRows, closingRows, interventionRows, nutritionRows] = await Promise.all([
    roundIds.length ? db.preChecks.where('roundId').anyOf(roundIds).toArray() : Promise.resolve([]),
    goalIds.length ? db.integrationChecks.where('goalId').anyOf(goalIds).toArray() : Promise.resolve([]),
    goalIds.length ? db.potCreations.where('goalId').anyOf(goalIds).toArray() : Promise.resolve([]),
    goalIds.length ? db.closings.where('goalId').anyOf(goalIds).toArray() : Promise.resolve([]),
    goalIds.length ? db.interventions.where('goalId').anyOf(goalIds).toArray() : Promise.resolve([]),
    goalIds.length ? db.nutritionAssessments.where('goalId').anyOf(goalIds).toArray() : Promise.resolve([]),
  ])

  const integrationCheckIds = integrationRows.map((ic) => ic.goalId)
  const affirmationRows = integrationCheckIds.length
    ? await db.affirmations.where('integrationCheckId').anyOf(integrationCheckIds).toArray()
    : []

  // Querying by a non-unique index (roundId) doesn't preserve insertion
  // order — IndexedDB falls back to primary-key order, which is a random
  // UUID here — so sort explicitly by the saved position.
  const sortedCheckRows = [...checkRows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const checksByRound = new Map<string, typeof checkRows>()
  for (const row of sortedCheckRows) {
    const list = checksByRound.get(row.roundId) ?? []
    list.push(row)
    checksByRound.set(row.roundId, list)
  }

  const preCheckRounds: PreCheckRound[] = roundRows.map((row) => ({
    id: row.id,
    roundNumber: row.roundNumber,
    createdAt: row.createdAt,
    checks: (checksByRound.get(row.id) ?? []).map((c) => ({
      id: c.id,
      voiceId: c.voiceId,
      name: c.name,
      source: c.source,
      result: c.result,
      emotionAttached: c.emotionAttached,
      emotionEntry: c.emotionEntry,
      notes: c.notes,
    })),
  }))

  // Same non-unique-index ordering issue as preChecks above.
  const sortedAffirmationRows = [...affirmationRows].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const affirmationsByIntegrationCheck = new Map<string, Affirmation[]>()
  for (const row of sortedAffirmationRows) {
    const list = affirmationsByIntegrationCheck.get(row.integrationCheckId) ?? []
    list.push({ voiceId: row.voiceId, statement: row.statement, resultsByLevel: row.resultsByLevel })
    affirmationsByIntegrationCheck.set(row.integrationCheckId, list)
  }

  const integrationChecks: Record<string, IntegrationCheck> = {}
  for (const row of integrationRows) {
    integrationChecks[row.goalId] = {
      goalId: row.goalId,
      lifeEnergyPercent: row.lifeEnergyPercent,
      stressOnGoalPercent: row.stressOnGoalPercent,
      affirmations: affirmationsByIntegrationCheck.get(row.goalId) ?? [],
      sabotageCheck: row.sabotageCheck,
      sabotageNotes: row.sabotageNotes,
    }
  }

  const potCreations: Record<string, PotCreation> = {}
  for (const row of potRows) {
    potCreations[row.goalId] = { ...row }
  }

  const closings: Record<string, Closing> = {}
  for (const row of closingRows) {
    closings[row.goalId] = { ...row }
  }

  const interventions: Record<string, Intervention> = {}
  for (const row of interventionRows) {
    interventions[row.goalId] = {
      goalId: row.goalId,
      checks: (row.checks ?? []).map((c) => ({ ...c, done: c.done ?? false })),
    }
  }

  const nutritionAssessments: Record<string, NutritionAssessment> = {}
  for (const row of nutritionRows) {
    nutritionAssessments[row.goalId] = { ...row, problemLocations: row.problemLocations ?? [] }
  }

  const goals: Goal[] = goalRows.map((row) => ({
    id: row.id,
    issue: row.issue,
    goalStatement: row.goalStatement,
    status: row.status,
    order: row.order,
  }))

  return {
    preCheckRounds,
    activePreCheckRoundId: session.activePreCheckRoundId ?? preCheckRounds[0]?.id ?? '',
    goals,
    activeGoalId: session.activeGoalId,
    integrationChecks,
    potCreations,
    closings,
    interventions,
    nutritionAssessments,
  }
}
