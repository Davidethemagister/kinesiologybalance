import { useSession } from '../context/SessionContext'
import { EmptyGoalState } from '../components/EmptyGoalState'
import type { Closing } from '../types'

export function ClosingPanel() {
  const { state, dispatch, getClosing } = useSession()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  if (!activeGoal) {
    return <EmptyGoalState message="Select an active goal from the Goal panel to close out the session." />
  }

  const closing = getClosing(activeGoal.id)

  function patch(p: Partial<Closing>) {
    dispatch({ type: 'PATCH_CLOSING', goalId: activeGoal!.id, patch: p })
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="font-medium text-slate-700 mb-3">Is there anything else to do / more?</p>
        <div className="flex gap-3">
          <button
            onClick={() => patch({ anythingElse: false })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              closing.anythingElse === false ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            No
          </button>
          <button
            onClick={() => patch({ anythingElse: true })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              closing.anythingElse === true ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Yes
          </button>
        </div>
        {closing.anythingElse && (
          <textarea
            value={closing.anythingElseNotes}
            onChange={(e) => patch({ anythingElseNotes: e.target.value })}
            rows={2}
            placeholder="Notes..."
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
        )}
      </div>

      <button
        onClick={() => patch({ retestConfirmed: !closing.retestConfirmed })}
        className={`w-full text-left rounded-2xl border p-5 mb-4 flex items-center gap-4 transition-colors ${
          closing.retestConfirmed ? 'border-sage bg-sage/10' : 'border-slate-200 bg-white'
        }`}
      >
        <span
          className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            closing.retestConfirmed ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-400'
          }`}
        >
          {closing.retestConfirmed ? '✓' : ''}
        </span>
        <span className="font-medium text-slate-700">Retest goal and any muscles tested at the beginning</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <label className="block font-medium text-slate-700 mb-2">When should the next session be?</label>
        <input
          type="date"
          value={closing.nextSessionDate ?? ''}
          onChange={(e) => patch({ nextSessionDate: e.target.value || null })}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <label className="block font-medium text-slate-700 mb-2">Homework</label>
        <textarea
          value={closing.homework}
          onChange={(e) => patch({ homework: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>
    </div>
  )
}
