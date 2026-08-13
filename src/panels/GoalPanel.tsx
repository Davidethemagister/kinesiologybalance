import { useState } from 'react'
import { useSession } from '../context/SessionContext'

export function GoalPanel() {
  const { state, dispatch } = useSession()
  const [issue, setIssue] = useState('')
  const [goalStatement, setGoalStatement] = useState('')
  const [gateResult, setGateResult] = useState<'strong' | 'weak' | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const canTest = issue.trim() !== '' && goalStatement.trim() !== ''

  function handleGate(result: 'strong' | 'weak') {
    setGateResult(result)
    if (result === 'strong') {
      dispatch({ type: 'ADD_ACCEPTED_GOAL', issue: issue.trim(), goalStatement: goalStatement.trim() })
      setIssue('')
      setGoalStatement('')
      setGateResult(null)
    }
  }

  const sortedGoals = [...state.goals].sort((a, b) => a.order - b.order)

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return
    const ids = sortedGoals.map((g) => g.id)
    const from = ids.indexOf(draggingId)
    const to = ids.indexOf(targetId)
    ids.splice(from, 1)
    ids.splice(to, 0, draggingId)
    dispatch({ type: 'REORDER_GOALS', orderedIds: ids })
    setDraggingId(null)
  }

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Issue &amp; Goal</h1>
      <p className="text-slate-500 mb-6">Define the issue and goal statement, then test.</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Issue</label>
          <input
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
            placeholder="What is the issue?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Goal Statement</label>
          <textarea
            value={goalStatement}
            onChange={(e) => setGoalStatement(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
            placeholder="What is the goal?"
          />
        </div>

        {canTest && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-slate-700 font-medium mb-3">Is this the best goal in her highest good for now?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleGate('weak')}
                className="flex-1 rounded-2xl py-4 font-semibold bg-rose-50 text-rose-700"
              >
                Weak
              </button>
              <button
                onClick={() => handleGate('strong')}
                className="flex-1 rounded-2xl py-4 font-semibold bg-emerald-500 text-white"
              >
                Strong
              </button>
            </div>
            {gateResult === 'weak' && (
              <div className="mt-3 text-sm text-rose-600">
                Retest — adjust the goal statement above, then test again.
                <button onClick={() => setGateResult(null)} className="ml-2 underline font-medium">
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mt-8 mb-3">Accepted Goals</h2>
      {sortedGoals.length === 0 && <p className="text-slate-400">No goals accepted yet.</p>}
      <div className="space-y-2">
        {sortedGoals.map((goal) => (
          <div
            key={goal.id}
            draggable
            onDragStart={() => setDraggingId(goal.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(goal.id)}
            className={`bg-white rounded-2xl border p-4 flex items-center gap-3 cursor-move ${
              state.activeGoalId === goal.id ? 'border-sage' : 'border-slate-200'
            }`}
          >
            <span className="text-slate-300 select-none">⠿</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate">{goal.issue}</div>
              <div className="text-sm text-slate-500 truncate">{goal.goalStatement}</div>
            </div>
            {state.activeGoalId === goal.id ? (
              <span className="flex-shrink-0 text-xs font-semibold text-sage-dark bg-sage/20 rounded-full px-3 py-1">
                Active
              </span>
            ) : (
              <button
                onClick={() => dispatch({ type: 'SET_ACTIVE_GOAL', id: goal.id })}
                className="flex-shrink-0 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full px-3 py-1.5 hover:bg-slate-200"
              >
                Set active
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
