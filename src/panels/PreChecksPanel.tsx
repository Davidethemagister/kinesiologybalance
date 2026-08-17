import { useEffect, useState } from 'react'
import { useSession } from '../context/SessionContext'
import { useSettings } from '../context/SettingsContext'
import { StrongWeakToggle } from '../components/ui/StrongWeakToggle'
import { EmotionChart } from '../components/EmotionChart'
import type { EmotionEntry } from '../types'

export function PreChecksPanel() {
  const { state, dispatch } = useSession()
  const { isPreCheckVoiceEnabled } = useSettings()
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const [askEmotionForId, setAskEmotionForId] = useState<string | null>(null)
  const [emotionChartForId, setEmotionChartForId] = useState<string | null>(null)
  const [addingCustom, setAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [selectedRoundId, setSelectedRoundId] = useState(state.activePreCheckRoundId)

  // Jump to whichever round becomes active (e.g. right after starting a new one)
  useEffect(() => {
    setSelectedRoundId(state.activePreCheckRoundId)
  }, [state.activePreCheckRoundId])

  const rounds = [...state.preCheckRounds].sort((a, b) => a.roundNumber - b.roundNumber)
  const selectedRound = rounds.find((r) => r.id === selectedRoundId) ?? rounds[rounds.length - 1]
  const readOnly = selectedRound.id !== state.activePreCheckRoundId
  const visibleChecks = selectedRound.checks.filter(
    (c) => c.source === 'custom' || isPreCheckVoiceEnabled(c.voiceId as string),
  )

  function handleResult(id: string, result: 'strong' | 'weak') {
    if (readOnly) return
    dispatch({ type: 'SET_PRECHECK_RESULT', roundId: selectedRound.id, id, result })
    if (result === 'weak') {
      setAskEmotionForId(id)
    }
  }

  function answerEmotionAttached(id: string, attached: boolean) {
    dispatch({ type: 'SET_PRECHECK_EMOTION_ATTACHED', roundId: selectedRound.id, id, attached })
    setAskEmotionForId(null)
    if (attached) {
      setEmotionChartForId(id)
    }
  }

  function handleEmotionConfirm(entry: EmotionEntry) {
    if (emotionChartForId) {
      dispatch({ type: 'SET_PRECHECK_EMOTION_ENTRY', roundId: selectedRound.id, id: emotionChartForId, entry })
    }
    setEmotionChartForId(null)
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
    dispatch({ type: 'ADD_CUSTOM_PRECHECK', roundId: selectedRound.id, name })
    setCustomName('')
    setAddingCustom(false)
  }

  const askingCheck = selectedRound.checks.find((c) => c.id === askEmotionForId)

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {rounds.map((round) => (
          <button
            key={round.id}
            onClick={() => setSelectedRoundId(round.id)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-bold border transition-colors ${
              selectedRound.id === round.id
                ? 'bg-sage text-slate-900 border-transparent'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Round {round.roundNumber}
            {round.id === state.activePreCheckRoundId && <span className="ml-1 opacity-60">· current</span>}
          </button>
        ))}
        <button
          onClick={() => dispatch({ type: 'START_NEW_PRECHECK_ROUND' })}
          className="flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-bold border-2 border-dashed border-slate-300 text-slate-500 hover:border-sage hover:text-sage-dark transition-colors"
        >
          + New round
        </button>
      </div>

      <p className="text-slate-500 mb-6">
        {readOnly
          ? `Viewing Round ${selectedRound.roundNumber} — read-only. Switch to the current round to make changes.`
          : 'Test each item strong or weak.'}
      </p>

      <div className="space-y-3">
        {visibleChecks.map((check) => (
          <div
            key={check.id}
            className={`bg-white rounded-2xl border border-slate-200 p-4 ${readOnly ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                {check.result === 'weak' && (
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500 flex-shrink-0" aria-hidden />
                )}
                <span className="font-medium text-slate-800">{check.name}</span>
              </div>
              <div className={readOnly ? 'pointer-events-none' : ''}>
                <StrongWeakToggle value={check.result} onChange={(r) => handleResult(check.id, r)} />
              </div>
            </div>

            {check.emotionEntry && (
              <div className="mt-2 text-sm text-slate-500">
                Emotion: <span className="font-medium text-slate-700">{check.emotionEntry.emotion}</span>
              </div>
            )}

            {!readOnly && (
              <button onClick={() => toggleNotes(check.id)} className="mt-3 text-sm text-sage-dark font-semibold">
                {expandedNotes.has(check.id) ? 'Hide notes' : 'Add notes'}
              </button>
            )}
            {readOnly && check.notes && <div className="mt-3 text-sm text-slate-500">Notes: {check.notes}</div>}
            {!readOnly && expandedNotes.has(check.id) && (
              <textarea
                value={check.notes}
                onChange={(e) =>
                  dispatch({ type: 'SET_PRECHECK_NOTES', roundId: selectedRound.id, id: check.id, notes: e.target.value })
                }
                placeholder="Notes..."
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
              />
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
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
                placeholder="Check name"
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
              + Add custom check
            </button>
          )}
        </div>
      )}

      {askingCheck && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setAskEmotionForId(null)} />
          <div className="relative bg-cream rounded-3xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-lg font-medium text-slate-800 mb-5">Is there an emotion attached?</p>
            <div className="flex gap-3">
              <button
                onClick={() => answerEmotionAttached(askingCheck.id, false)}
                className="flex-1 rounded-2xl py-4 font-semibold bg-slate-100 text-slate-600"
              >
                No
              </button>
              <button
                onClick={() => answerEmotionAttached(askingCheck.id, true)}
                className="flex-1 rounded-2xl py-4 font-semibold bg-sage text-slate-900"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <EmotionChart
        isOpen={!!emotionChartForId}
        onClose={() => setEmotionChartForId(null)}
        onConfirm={handleEmotionConfirm}
      />
    </div>
  )
}
