import { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { EmotionChart } from '../components/EmotionChart'
import { EmptyGoalState } from '../components/EmptyGoalState'
import { PHYSICAL_SUB_BRANCHES, ENERGETIC_SUB_BRANCHES } from '../data/potBranches'
import { ORGAN_CATEGORIES } from '../data/organCategories'
import type { EmotionEntry, PotCreation } from '../types'

export function PotCreationPanel() {
  const { state, dispatch, getPot } = useSession()
  const [emotionChartOpen, setEmotionChartOpen] = useState(false)
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId)

  if (!activeGoal) {
    return <EmptyGoalState message="Select an active goal from the Goal panel to start pot creation." />
  }

  const pot = getPot(activeGoal.id)
  const linkedOrgan = pot.emotionEntry
    ? ORGAN_CATEGORIES.find((o) => o.id === pot.emotionEntry!.organCategoryId)
    : null

  function patch(p: Partial<PotCreation>) {
    dispatch({ type: 'PATCH_POT', goalId: activeGoal!.id, patch: p })
  }

  function handleEmotionConfirm(entry: EmotionEntry) {
    patch({ emotionEntry: entry })
  }

  const subBranches = pot.branch === 'physical' ? PHYSICAL_SUB_BRANCHES : pot.branch === 'energetic' ? ENERGETIC_SUB_BRANCHES : []

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-semibold text-slate-800 mb-1">Pot Creation</h1>
      <p className="text-slate-500 mb-6">
        Working on: <span className="font-medium text-slate-700">{activeGoal.goalStatement}</span>
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="font-medium text-slate-700 mb-3">Emotion</p>
        <button onClick={() => setEmotionChartOpen(true)} className="w-full rounded-2xl bg-sage text-slate-900 font-semibold py-4">
          {pot.emotionEntry ? `Change: ${pot.emotionEntry.emotion}` : 'Open Emotion Chart'}
        </button>
        {pot.emotionEntry && linkedOrgan && (
          <div className="mt-3 text-sm text-slate-500 space-y-1">
            <div>
              <span className="text-slate-400">Organ:</span> {linkedOrgan.name}
            </div>
            {linkedOrgan.muscle && (
              <div>
                <span className="text-slate-400">Muscle:</span> {linkedOrgan.muscle}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="font-medium text-slate-700 mb-3">Time</p>
        <div className="flex gap-3">
          <button
            onClick={() => patch({ time: 'present' })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              pot.time === 'present' ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Present
          </button>
          <button
            onClick={() => patch({ time: 'past' })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              pot.time === 'past' ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="font-medium text-slate-700 mb-3">More info's — needs further investigation?</p>
        <div className="flex gap-3">
          <button
            onClick={() => patch({ needsMoreInfo: false })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              pot.needsMoreInfo === false ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            No
          </button>
          <button
            onClick={() => patch({ needsMoreInfo: true })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              pot.needsMoreInfo === true ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Yes
          </button>
        </div>
        {pot.needsMoreInfo && (
          <textarea
            value={pot.moreInfoNotes}
            onChange={(e) => patch({ moreInfoNotes: e.target.value })}
            placeholder="Linked to a person, situation, or past event"
            rows={2}
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4">
        <p className="font-medium text-slate-700 mb-3">Branch</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => patch({ branch: 'physical', subBranch: null })}
            className={`rounded-2xl py-6 font-semibold ${
              pot.branch === 'physical' ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Physical
          </button>
          <button
            onClick={() => patch({ branch: 'energetic', subBranch: null })}
            className={`rounded-2xl py-6 font-semibold ${
              pot.branch === 'energetic' ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Energetic
          </button>
        </div>
        {subBranches.length > 0 && (
          <div className="space-y-2">
            {subBranches.map((sb) => (
              <button
                key={sb.id}
                onClick={() => patch({ subBranch: sb.id })}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  pot.subBranch === sb.id ? 'border-sage bg-sage/10' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800">{sb.name}</span>
                  {sb.comingSoon && (
                    <span className="flex-shrink-0 text-xs font-semibold text-slate-400 bg-slate-100 rounded-full px-2 py-1">
                      Coming soon
                    </span>
                  )}
                </div>
                {sb.note && <div className="text-xs text-slate-400 mt-1">{sb.note}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <label className="block font-medium text-slate-700 mb-2">Findings</label>
        <textarea
          value={pot.findings}
          onChange={(e) => patch({ findings: e.target.value })}
          rows={4}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>

      <EmotionChart isOpen={emotionChartOpen} onClose={() => setEmotionChartOpen(false)} onConfirm={handleEmotionConfirm} />
    </div>
  )
}
