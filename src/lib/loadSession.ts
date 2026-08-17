import { supabase } from './supabaseClient'
import type { SessionState } from '../context/SessionContext'
import type {
  PreCheck,
  PreCheckRound,
  Goal,
  IntegrationCheck,
  Affirmation,
  PotCreation,
  Closing,
  Intervention,
  Level,
  StrongWeak,
  EmotionEntry,
} from '../types'

export async function loadSessionState(sessionId: string): Promise<SessionState> {
  const { data: sessionRow, error: sessionError } = await supabase
    .from('sessions')
    .select('active_goal_id, active_pre_check_round_id')
    .eq('id', sessionId)
    .single()
  if (sessionError) throw sessionError

  const { data: roundRows, error: roundsError } = await supabase
    .from('pre_check_rounds')
    .select('*')
    .eq('session_id', sessionId)
    .order('round_number', { ascending: true })
  if (roundsError) throw roundsError

  const roundIds = (roundRows ?? []).map((r) => r.id)
  const { data: checkRows, error: checksError } = await supabase
    .from('pre_checks')
    .select('*')
    .in('round_id', roundIds.length > 0 ? roundIds : ['00000000-0000-0000-0000-000000000000'])
  if (checksError) throw checksError

  const { data: goalRows, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('session_id', sessionId)
    .order('order_index', { ascending: true })
  if (goalsError) throw goalsError

  const goalIds = (goalRows ?? []).map((g) => g.id)
  const emptyMatch = ['00000000-0000-0000-0000-000000000000']

  const [{ data: integrationRows, error: integrationError }, { data: potRows, error: potError },
    { data: closingRows, error: closingError }, { data: interventionRows, error: interventionError }] =
    await Promise.all([
      supabase.from('integration_checks').select('*').in('goal_id', goalIds.length > 0 ? goalIds : emptyMatch),
      supabase.from('pot_creations').select('*').in('goal_id', goalIds.length > 0 ? goalIds : emptyMatch),
      supabase.from('closings').select('*').in('goal_id', goalIds.length > 0 ? goalIds : emptyMatch),
      supabase.from('interventions').select('*').in('goal_id', goalIds.length > 0 ? goalIds : emptyMatch),
    ])
  if (integrationError) throw integrationError
  if (potError) throw potError
  if (closingError) throw closingError
  if (interventionError) throw interventionError

  const integrationCheckIds = (integrationRows ?? []).map((ic) => ic.id)
  const { data: affirmationRows, error: affirmationsError } = await supabase
    .from('affirmations')
    .select('*')
    .in('integration_check_id', integrationCheckIds.length > 0 ? integrationCheckIds : emptyMatch)
  if (affirmationsError) throw affirmationsError

  const checksByRound = new Map<string, PreCheck[]>()
  for (const row of checkRows ?? []) {
    const check: PreCheck = {
      id: row.id,
      voiceId: row.voice_id,
      name: row.name,
      source: row.source as PreCheck['source'],
      result: row.result as StrongWeak | null,
      emotionAttached: row.emotion_attached,
      emotionEntry: row.emotion_entry as EmotionEntry | null,
      notes: row.notes,
    }
    const list = checksByRound.get(row.round_id) ?? []
    list.push(check)
    checksByRound.set(row.round_id, list)
  }

  const preCheckRounds: PreCheckRound[] = (roundRows ?? []).map((row) => ({
    id: row.id,
    roundNumber: row.round_number,
    createdAt: row.created_at,
    checks: checksByRound.get(row.id) ?? [],
  }))

  const affirmationsByIntegrationCheck = new Map<string, Affirmation[]>()
  for (const row of affirmationRows ?? []) {
    const affirmation: Affirmation = {
      voiceId: row.voice_id,
      statement: row.statement,
      resultsByLevel: row.results_by_level as Record<Level, StrongWeak | null>,
    }
    const list = affirmationsByIntegrationCheck.get(row.integration_check_id) ?? []
    list.push(affirmation)
    affirmationsByIntegrationCheck.set(row.integration_check_id, list)
  }

  const integrationChecks: Record<string, IntegrationCheck> = {}
  for (const row of integrationRows ?? []) {
    integrationChecks[row.goal_id] = {
      goalId: row.goal_id,
      lifeEnergyPercent: row.life_energy_percent,
      stressOnGoalPercent: row.stress_on_goal_percent,
      affirmations: affirmationsByIntegrationCheck.get(row.id) ?? [],
      sabotageCheck: row.sabotage_check as StrongWeak | null,
      sabotageNotes: row.sabotage_notes,
    }
  }

  const potCreations: Record<string, PotCreation> = {}
  for (const row of potRows ?? []) {
    potCreations[row.goal_id] = {
      goalId: row.goal_id,
      emotionEntry: row.emotion_entry as EmotionEntry | null,
      time: row.time as PotCreation['time'],
      needsMoreInfo: row.needs_more_info,
      moreInfoNotes: row.more_info_notes,
      branch: row.branch as PotCreation['branch'],
      subBranch: row.sub_branch,
      findings: row.findings,
    }
  }

  const closings: Record<string, Closing> = {}
  for (const row of closingRows ?? []) {
    closings[row.goal_id] = {
      goalId: row.goal_id,
      anythingElse: row.anything_else,
      anythingElseNotes: row.anything_else_notes,
      retestConfirmed: row.retest_confirmed,
      nextSessionDate: row.next_session_date,
      homework: row.homework,
    }
  }

  const interventions: Record<string, Intervention> = {}
  for (const row of interventionRows ?? []) {
    interventions[row.goal_id] = {
      goalId: row.goal_id,
      technique: row.technique,
      retestResult: row.retest_result as StrongWeak | null,
      notes: row.notes,
    }
  }

  const goals: Goal[] = (goalRows ?? []).map((row) => ({
    id: row.id,
    issue: row.issue,
    goalStatement: row.goal_statement,
    status: row.status as Goal['status'],
    order: row.order_index,
  }))

  return {
    preCheckRounds,
    activePreCheckRoundId: sessionRow.active_pre_check_round_id ?? preCheckRounds[0]?.id ?? '',
    goals,
    activeGoalId: sessionRow.active_goal_id,
    integrationChecks,
    potCreations,
    closings,
    interventions,
  }
}
