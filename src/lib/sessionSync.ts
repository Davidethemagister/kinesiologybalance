import { supabase } from './supabaseClient'
import type { SessionState } from '../context/SessionContext'
import type { Json } from '../types/database'

function toJson(value: unknown): Json {
  return value as Json
}

// Saves a session's full panel data. Strategy: replace-in-place — delete every
// child row for this session, then reinsert the current in-memory state fresh.
// Row counts per session are small (a few dozen at most), so this stays simple
// and correct rather than diffing per reducer action. Postgres/PostgREST
// return rows for a single multi-row INSERT in the order they were given, so
// we can zip the old in-memory ids to the newly generated DB ids to wire up
// foreign keys without a second round trip.
export async function saveSessionState(sessionId: string, state: SessionState): Promise<void> {
  // Cascade deletes: pre_check_rounds -> pre_checks, goals -> integration_checks/
  // affirmations/pot_creations/closings/interventions.
  await Promise.all([
    supabase.from('pre_check_rounds').delete().eq('session_id', sessionId),
    supabase.from('goals').delete().eq('session_id', sessionId),
  ])

  const roundIdMap = new Map<string, string>() // old (in-memory) round id -> new DB id
  if (state.preCheckRounds.length > 0) {
    const { data: insertedRounds, error } = await supabase
      .from('pre_check_rounds')
      .insert(
        state.preCheckRounds.map((round) => ({
          session_id: sessionId,
          round_number: round.roundNumber,
          created_at: round.createdAt,
        })),
      )
      .select('id')
    if (error) throw error
    state.preCheckRounds.forEach((round, i) => roundIdMap.set(round.id, insertedRounds![i].id))

    const checkRows = state.preCheckRounds.flatMap((round) =>
      round.checks.map((check) => ({
        round_id: roundIdMap.get(round.id)!,
        voice_id: check.voiceId,
        name: check.name,
        source: check.source,
        result: check.result,
        emotion_attached: check.emotionAttached,
        emotion_entry: toJson(check.emotionEntry),
        notes: check.notes,
      })),
    )
    if (checkRows.length > 0) {
      const { error: checksError } = await supabase.from('pre_checks').insert(checkRows)
      if (checksError) throw checksError
    }
  }

  const goalIdMap = new Map<string, string>() // old (in-memory) goal id -> new DB id
  if (state.goals.length > 0) {
    const { data: insertedGoals, error } = await supabase
      .from('goals')
      .insert(
        state.goals.map((goal) => ({
          session_id: sessionId,
          issue: goal.issue,
          goal_statement: goal.goalStatement,
          status: goal.status,
          order_index: goal.order,
        })),
      )
      .select('id')
    if (error) throw error
    state.goals.forEach((goal, i) => goalIdMap.set(goal.id, insertedGoals![i].id))

    const integrationRows: { id: string; goal_id: string; life_energy_percent: number | null; stress_on_goal_percent: number | null; sabotage_check: string | null; sabotage_notes: string }[] = []
    const affirmationRows: { integration_check_id: string; voice_id: string; statement: string; results_by_level: Json }[] = []
    const potRows: { id: string; goal_id: string; emotion_entry: Json; time: string | null; needs_more_info: boolean | null; more_info_notes: string; branch: string | null; sub_branch: string | null; findings: string }[] = []
    const closingRows: { id: string; goal_id: string; anything_else: boolean | null; anything_else_notes: string; retest_confirmed: boolean; next_session_date: string | null; homework: string }[] = []
    const interventionRows: { id: string; goal_id: string; technique: string; retest_result: string | null; notes: string }[] = []

    for (const oldGoalId of Object.keys(state.integrationChecks)) {
      const newGoalId = goalIdMap.get(oldGoalId)
      if (!newGoalId) continue
      const ic = state.integrationChecks[oldGoalId]
      integrationRows.push({
        id: newGoalId,
        goal_id: newGoalId,
        life_energy_percent: ic.lifeEnergyPercent,
        stress_on_goal_percent: ic.stressOnGoalPercent,
        sabotage_check: ic.sabotageCheck,
        sabotage_notes: ic.sabotageNotes,
      })
      for (const aff of ic.affirmations) {
        affirmationRows.push({
          integration_check_id: newGoalId,
          voice_id: aff.voiceId,
          statement: aff.statement,
          results_by_level: toJson(aff.resultsByLevel),
        })
      }
    }
    for (const oldGoalId of Object.keys(state.potCreations)) {
      const newGoalId = goalIdMap.get(oldGoalId)
      if (!newGoalId) continue
      const pot = state.potCreations[oldGoalId]
      potRows.push({
        id: newGoalId,
        goal_id: newGoalId,
        emotion_entry: toJson(pot.emotionEntry),
        time: pot.time,
        needs_more_info: pot.needsMoreInfo,
        more_info_notes: pot.moreInfoNotes,
        branch: pot.branch,
        sub_branch: pot.subBranch,
        findings: pot.findings,
      })
    }
    for (const oldGoalId of Object.keys(state.closings)) {
      const newGoalId = goalIdMap.get(oldGoalId)
      if (!newGoalId) continue
      const closing = state.closings[oldGoalId]
      closingRows.push({
        id: newGoalId,
        goal_id: newGoalId,
        anything_else: closing.anythingElse,
        anything_else_notes: closing.anythingElseNotes,
        retest_confirmed: closing.retestConfirmed,
        next_session_date: closing.nextSessionDate,
        homework: closing.homework,
      })
    }
    for (const oldGoalId of Object.keys(state.interventions)) {
      const newGoalId = goalIdMap.get(oldGoalId)
      if (!newGoalId) continue
      const intervention = state.interventions[oldGoalId]
      interventionRows.push({
        id: newGoalId,
        goal_id: newGoalId,
        technique: intervention.technique,
        retest_result: intervention.retestResult,
        notes: intervention.notes,
      })
    }

    if (integrationRows.length > 0) {
      const { error: e } = await supabase.from('integration_checks').insert(integrationRows)
      if (e) throw e
    }
    if (affirmationRows.length > 0) {
      const { error: e } = await supabase.from('affirmations').insert(affirmationRows)
      if (e) throw e
    }
    if (potRows.length > 0) {
      const { error: e } = await supabase.from('pot_creations').insert(potRows)
      if (e) throw e
    }
    if (closingRows.length > 0) {
      const { error: e } = await supabase.from('closings').insert(closingRows)
      if (e) throw e
    }
    if (interventionRows.length > 0) {
      const { error: e } = await supabase.from('interventions').insert(interventionRows)
      if (e) throw e
    }
  }

  const { error: sessionUpdateError } = await supabase
    .from('sessions')
    .update({
      active_goal_id: state.activeGoalId ? (goalIdMap.get(state.activeGoalId) ?? null) : null,
      active_pre_check_round_id: roundIdMap.get(state.activePreCheckRoundId) ?? null,
    })
    .eq('id', sessionId)
  if (sessionUpdateError) throw sessionUpdateError
}
