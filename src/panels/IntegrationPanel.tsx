import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { StrongWeakToggle } from '../components/ui/StrongWeakToggle'
import { EmptyGoalState } from '../components/EmptyGoalState'
import { LEVELS } from '../data/affirmations'

export function IntegrationPanel({ onNavigateToCorrection }: { onNavigateToCorrection: () => void }) {
  const { state, dispatch, getIntegration } = useSession()
  const { isAffirmationVoiceEnabled } = useSettings()
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  if (!activeGoal) {
    return <EmptyGoalState message="Select an active goal from the Goal panel to begin integration testing." />
  }

  const integration = getIntegration(activeGoal.id)
  const visibleAffirmations = integration.affirmations.filter((aff) => isAffirmationVoiceEnabled(aff.voiceId))

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Life energy %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={integration.lifeEnergyPercent ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'PATCH_INTEGRATION',
                goalId: activeGoal.id,
                patch: { lifeEnergyPercent: e.target.value === '' ? null : Number(e.target.value) },
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Stress on the goal %</label>
          <p className="text-xs text-slate-400 mb-1">Tap on the thymus</p>
          <input
            type="number"
            min={0}
            max={100}
            value={integration.stressOnGoalPercent ?? ''}
            onChange={(e) =>
              dispatch({
                type: 'PATCH_INTEGRATION',
                goalId: activeGoal.id,
                patch: { stressOnGoalPercent: e.target.value === '' ? null : Number(e.target.value) },
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {visibleAffirmations.map((aff) => (
          <div key={aff.voiceId} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-slate-700 mb-4">{aff.statement}</p>
            <div className="grid grid-cols-5 gap-2">
              {LEVELS.map((level) => (
                <div key={level.id} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 text-center leading-tight">
                    {level.label}
                  </span>
                  <div className="flex flex-col gap-1 w-full">
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'SET_AFFIRMATION_LEVEL',
                          goalId: activeGoal.id,
                          voiceId: aff.voiceId,
                          level: level.id,
                          result: 'strong',
                        })
                      }
                      className={`rounded-lg py-2.5 text-xs font-bold ${
                        aff.resultsByLevel[level.id] === 'strong'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      S
                    </button>
                    <button
                      onClick={() => {
                        dispatch({
                          type: 'SET_AFFIRMATION_LEVEL',
                          goalId: activeGoal.id,
                          voiceId: aff.voiceId,
                          level: level.id,
                          result: 'weak',
                        })
                        onNavigateToCorrection()
                      }}
                      className={`rounded-lg py-2.5 text-xs font-bold ${
                        aff.resultsByLevel[level.id] === 'weak' ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      W
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-slate-700 font-medium">Sabotage programmes — what is in the way of the goal statement?</p>
        <p className="text-xs text-slate-400 mb-3">Open hand, thumb on exterior side of ring finger</p>
        <StrongWeakToggle
          value={integration.sabotageCheck}
          onChange={(r) => {
            dispatch({ type: 'PATCH_INTEGRATION', goalId: activeGoal.id, patch: { sabotageCheck: r } })
            if (r === 'weak') onNavigateToCorrection()
          }}
          size="lg"
        />
        <textarea
          value={integration.sabotageNotes}
          onChange={(e) =>
            dispatch({ type: 'PATCH_INTEGRATION', goalId: activeGoal.id, patch: { sabotageNotes: e.target.value } })
          }
          placeholder="Notes..."
          rows={2}
          className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>
    </div>
  )
}
