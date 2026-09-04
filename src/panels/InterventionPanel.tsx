import { useSession } from '../context/SessionContext'
import { EmptyGoalState } from '../components/EmptyGoalState'

export function InterventionPanel() {
  const { state } = useSession()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  if (!activeGoal) {
    return <EmptyGoalState message="Select an active goal from the Goal panel to log a correction." />
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
      </p>
    </div>
  )
}
