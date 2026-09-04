import { db } from './db'
import type { SessionState } from '../context/SessionContext'

// Replace-in-place: wipe every child row for this session, then reinsert the
// current in-memory state fresh. Row counts per session are small (a few
// dozen at most), so this stays simple and correct rather than diffing per
// reducer action. Unlike a hosted DB with server-generated ids, every id
// here is already a stable client-generated UUID (see src/utils/id.ts), so
// there's no id-remapping step needed between old and new rows.
export async function saveSessionState(sessionId: string, state: SessionState): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.sessions,
      db.preCheckRounds,
      db.preChecks,
      db.goals,
      db.integrationChecks,
      db.affirmations,
      db.potCreations,
      db.closings,
      db.interventions,
      db.nutritionAssessments,
    ],
    async () => {
      // Clear this session's existing child rows before reinserting.
      const existingRoundIds = await db.preCheckRounds.where('sessionId').equals(sessionId).primaryKeys()
      if (existingRoundIds.length) await db.preChecks.where('roundId').anyOf(existingRoundIds).delete()
      await db.preCheckRounds.where('sessionId').equals(sessionId).delete()

      const existingGoalIds = await db.goals.where('sessionId').equals(sessionId).primaryKeys()
      await db.integrationChecks.bulkDelete(existingGoalIds)
      if (existingGoalIds.length) await db.affirmations.where('integrationCheckId').anyOf(existingGoalIds).delete()
      await db.potCreations.bulkDelete(existingGoalIds)
      await db.closings.bulkDelete(existingGoalIds)
      await db.interventions.bulkDelete(existingGoalIds)
      await db.nutritionAssessments.bulkDelete(existingGoalIds)
      await db.goals.where('sessionId').equals(sessionId).delete()

      await db.preCheckRounds.bulkAdd(
        state.preCheckRounds.map((round) => ({
          id: round.id,
          sessionId,
          roundNumber: round.roundNumber,
          createdAt: round.createdAt,
        })),
      )

      const checkRows = state.preCheckRounds.flatMap((round) =>
        round.checks.map((check, order) => ({
          id: check.id,
          roundId: round.id,
          voiceId: check.voiceId,
          name: check.name,
          source: check.source,
          result: check.result,
          emotionAttached: check.emotionAttached,
          emotionEntry: check.emotionEntry,
          notes: check.notes,
          order,
        })),
      )
      if (checkRows.length) await db.preChecks.bulkAdd(checkRows)

      await db.goals.bulkAdd(
        state.goals.map((goal) => ({
          id: goal.id,
          sessionId,
          issue: goal.issue,
          goalStatement: goal.goalStatement,
          status: goal.status,
          order: goal.order,
        })),
      )

      const integrationRows = Object.values(state.integrationChecks).map((ic) => ({
        goalId: ic.goalId,
        lifeEnergyPercent: ic.lifeEnergyPercent,
        stressOnGoalPercent: ic.stressOnGoalPercent,
        sabotageCheck: ic.sabotageCheck,
        sabotageNotes: ic.sabotageNotes,
      }))
      if (integrationRows.length) await db.integrationChecks.bulkAdd(integrationRows)

      const affirmationRows = Object.values(state.integrationChecks).flatMap((ic) =>
        ic.affirmations.map((aff, order) => ({
          integrationCheckId: ic.goalId,
          voiceId: aff.voiceId,
          statement: aff.statement,
          resultsByLevel: aff.resultsByLevel,
          order,
        })),
      )
      if (affirmationRows.length) await db.affirmations.bulkAdd(affirmationRows)

      const potRows = Object.values(state.potCreations)
      if (potRows.length) await db.potCreations.bulkAdd(potRows)

      const closingRows = Object.values(state.closings)
      if (closingRows.length) await db.closings.bulkAdd(closingRows)

      const interventionRows = Object.values(state.interventions)
      if (interventionRows.length) await db.interventions.bulkAdd(interventionRows)

      const nutritionRows = Object.values(state.nutritionAssessments)
      if (nutritionRows.length) await db.nutritionAssessments.bulkAdd(nutritionRows)

      await db.sessions.update(sessionId, {
        activeGoalId: state.activeGoalId,
        activePreCheckRoundId: state.activePreCheckRoundId || null,
      })
    },
  )
}
