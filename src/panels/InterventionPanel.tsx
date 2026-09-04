import { useState } from 'react'
import { useSession, GENERAL_CORRECTION_KEY } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { STANDARD_INTERVENTIONS } from '../data/interventions'

export function InterventionPanel() {
  const { state, dispatch, getIntervention } = useSession()
  const { isInterventionVoiceEnabled } = useSettings()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)
  const goalKey = activeGoal?.id ?? GENERAL_CORRECTION_KEY
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [addingCustom, setAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')

  const intervention = getIntervention(goalKey)
  const infoByVoiceId = new Map(STANDARD_INTERVENTIONS.map((t) => [t.id, t]))
  const visibleChecks = intervention.checks.filter(
    (c) => c.source === 'custom' || isInterventionVoiceEnabled(c.voiceId as string),
  )

  // When a goal is active, anything logged under the general (no-goal)
  // bucket before it was set would otherwise be invisible here — surface it
  // instead of silently hiding it. Only items actually touched, so a fresh
  // untouched general bucket doesn't clutter every goal-scoped session.
  const generalIntervention = activeGoal ? getIntervention(GENERAL_CORRECTION_KEY) : null
  const generalHighlights =
    generalIntervention?.checks.filter((c) => c.done || c.notes.trim() !== '' || c.source === 'custom') ?? []

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleNotes(id: string) {
    setExpandedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function submitCustom() {
    const name = customName.trim()
    if (!name) return
    dispatch({ type: 'ADD_CUSTOM_INTERVENTION_CHECK', goalId: goalKey, name })
    setCustomName('')
    setAddingCustom(false)
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        {activeGoal ? (
          <>
            Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
          </>
        ) : (
          'No active goal — techniques logged here are session-wide.'
        )}
      </p>

      {generalHighlights.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">Also logged before a goal was set</p>
          <div className="space-y-2">
            {generalHighlights.map((check) => (
              <button
                key={check.id}
                onClick={() =>
                  dispatch({
                    type: 'SET_INTERVENTION_CHECK_DONE',
                    goalId: GENERAL_CORRECTION_KEY,
                    id: check.id,
                    done: !check.done,
                  })
                }
                className="w-full flex items-start gap-2 text-left text-sm"
              >
                <span
                  className={`flex-shrink-0 h-5 w-5 mt-0.5 rounded-full flex items-center justify-center border-2 ${
                    check.done ? 'bg-sage border-sage text-slate-900' : 'border-slate-300 text-transparent'
                  }`}
                  aria-hidden
                >
                  ✓
                </span>
                <span>
                  <span className={check.done ? 'text-slate-500 line-through' : 'text-slate-700'}>{check.name}</span>
                  {check.notes && <span className="block text-xs text-slate-400">{check.notes}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibleChecks.map((check) => {
          const info = check.voiceId ? infoByVoiceId.get(check.voiceId) : undefined
          const hasDetails = !!(info?.hint || info?.steps?.length)
          return (
            <div key={check.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() =>
                    dispatch({
                      type: 'SET_INTERVENTION_CHECK_DONE',
                      goalId: goalKey,
                      id: check.id,
                      done: !check.done,
                    })
                  }
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <span
                    className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                      check.done ? 'bg-sage border-sage text-slate-900' : 'border-slate-300 text-transparent'
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className={`font-medium ${check.done ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {check.name}
                  </span>
                </button>
                {hasDetails && (
                  <button
                    onClick={() => toggleExpanded(check.id)}
                    className="flex-shrink-0 text-sm text-sage-dark font-semibold"
                  >
                    {expanded.has(check.id) ? 'Hide' : 'Details'}
                  </button>
                )}
              </div>

              {hasDetails && expanded.has(check.id) && (
                <div className="mt-3 pl-10 text-sm text-slate-500 space-y-1">
                  {info?.hint && <p>{info.hint}</p>}
                  {info?.steps && (
                    <ul className="list-disc pl-4 space-y-0.5">
                      {info.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                onClick={() => toggleNotes(check.id)}
                className="mt-3 ml-10 text-sm text-sage-dark font-semibold"
              >
                {expandedNotes.has(check.id) ? 'Hide notes' : 'Add notes'}
              </button>
              {expandedNotes.has(check.id) && (
                <textarea
                  value={check.notes}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_INTERVENTION_CHECK_NOTES',
                      goalId: goalKey,
                      id: check.id,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Notes..."
                  rows={2}
                  className="mt-2 ml-10 w-[calc(100%-2.5rem)] rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        {addingCustom ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-2">
            <input
              autoFocus
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitCustom()
              }}
              placeholder="Technique name"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
            />
            <div className="flex gap-2">
              <button onClick={submitCustom} className="flex-1 rounded-xl bg-sage px-4 py-3 font-semibold text-slate-900">
                Add
              </button>
              <button
                onClick={() => {
                  setAddingCustom(false)
                  setCustomName('')
                }}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-slate-500 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingCustom(true)}
            className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-4 text-slate-500 font-medium hover:border-sage hover:text-sage-dark transition-colors"
          >
            + Add custom technique
          </button>
        )}
      </div>
    </div>
  )
}
