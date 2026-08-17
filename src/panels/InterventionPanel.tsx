import { useSession } from '../context/SessionContext'
import { StrongWeakToggle } from '../components/ui/StrongWeakToggle'
import { EmptyGoalState } from '../components/EmptyGoalState'
import type { Intervention } from '../types'

export function InterventionPanel() {
  const { state, dispatch, getIntervention } = useSession()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  if (!activeGoal) {
    return <EmptyGoalState message="Select an active goal from the Goal panel to log an intervention." />
  }

  const intervention = getIntervention(activeGoal.id)

  function patch(p: Partial<Intervention>) {
    dispatch({ type: 'PATCH_INTERVENTION', goalId: activeGoal!.id, patch: p })
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
      </p>

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
