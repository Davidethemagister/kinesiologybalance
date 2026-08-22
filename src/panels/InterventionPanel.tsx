import { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { StrongWeakToggle } from '../components/ui/StrongWeakToggle'
import { EmptyGoalState } from '../components/EmptyGoalState'
import { STANDARD_INTERVENTIONS } from '../data/interventions'
import type { Intervention } from '../types'

export function InterventionPanel() {
  const { state, dispatch, getIntervention } = useSession()
  const { isInterventionVoiceEnabled } = useSettings()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [addingCustom, setAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')

  if (!activeGoal) {
    return <EmptyGoalState message="Select an active goal from the Goal panel to log an intervention." />
  }

  const intervention = getIntervention(activeGoal.id)
  const hintByVoiceId = new Map(STANDARD_INTERVENTIONS.map((t) => [t.id, t.hint]))
  const visibleChecks = intervention.checks.filter(
    (c) => c.source === 'custom' || isInterventionVoiceEnabled(c.voiceId as string),
  )

  function patch(p: Partial<Intervention>) {
    dispatch({ type: 'PATCH_INTERVENTION', goalId: activeGoal!.id, patch: p })
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
    dispatch({ type: 'ADD_CUSTOM_INTERVENTION_CHECK', goalId: activeGoal!.id, name })
    setCustomName('')
    setAddingCustom(false)
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
      </p>

      <p className="font-medium text-slate-700 mb-3">Techniques applied</p>
      <div className="space-y-3 mb-4">
        {visibleChecks.map((check) => (
          <div key={check.id} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="font-medium text-slate-800">{check.name}</span>
              <StrongWeakToggle value={check.result} onChange={(r) => dispatch({ type: 'SET_INTERVENTION_CHECK_RESULT', goalId: activeGoal!.id, id: check.id, result: r })} />
            </div>

            {check.voiceId && hintByVoiceId.get(check.voiceId) && (
              <p className="mt-2 text-xs text-slate-400">{hintByVoiceId.get(check.voiceId)}</p>
            )}

            <button onClick={() => toggleNotes(check.id)} className="mt-3 text-sm text-sage-dark font-semibold">
              {expandedNotes.has(check.id) ? 'Hide notes' : 'Add notes'}
            </button>
            {expandedNotes.has(check.id) && (
              <textarea
                value={check.notes}
                onChange={(e) =>
                  dispatch({ type: 'SET_INTERVENTION_CHECK_NOTES', goalId: activeGoal!.id, id: check.id, notes: e.target.value })
                }
                placeholder="Notes..."
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6">
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

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <label className="block font-medium text-slate-700 mb-2">Technique / correction applied</label>
        <textarea
          value={intervention.technique}
          onChange={(e) => patch({ technique: e.target.value })}
          rows={3}
          placeholder="e.g. tapping, sound, colour, essence, acupoint hold..."
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="font-medium text-slate-700 mb-3">Retest after intervention</p>
        <StrongWeakToggle value={intervention.retestResult} onChange={(r) => patch({ retestResult: r })} size="lg" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <label className="block font-medium text-slate-700 mb-2">Notes</label>
        <textarea
          value={intervention.notes}
          onChange={(e) => patch({ notes: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>
    </div>
  )
}
