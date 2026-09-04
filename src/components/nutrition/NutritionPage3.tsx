import { useState } from 'react'
import { useSession } from '../../context/SessionContext'
import {
  MECHANISMS_BY_LEVEL,
  MECHANISM_LEVEL_LABELS,
  COFACTOR_GROUPS,
  FUNCTIONAL_SYSTEMS,
  SYSTEMS,
  PHYSIOLOGY_NEEDS,
  levelMechanismId,
  groupedItemId,
} from '../../data/nutritionMechanisms'
import type { NutritionAssessment } from '../../types'

const LEVELS: ('intake' | 'digestion' | 'absorption')[] = ['intake', 'digestion', 'absorption']

function TickChip({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-xs font-medium border text-left ${
        checked ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-600 border-slate-200'
      }`}
    >
      {label}
    </button>
  )
}

// Page 3 ("Mechanisms — Why?"). The Intake/Digestion/Absorption levels map
// directly onto Page 1's problemLocations; Utilisation gets its own focus
// section (cofactors + functional systems) per the source chart.
export function NutritionPage3({ goalId }: { goalId: string }) {
  const { dispatch, getNutrition } = useSession()
  const nutrition = getNutrition(goalId)

  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(
    () => new Set(nutrition.problemLocations.filter((l) => l !== 'utilisation')),
  )
  const [expandedCofactorGroups, setExpandedCofactorGroups] = useState<Set<string>>(new Set())
  const [utilisationOpen, setUtilisationOpen] = useState(nutrition.problemLocations.includes('utilisation'))

  function patch(p: Partial<NutritionAssessment>) {
    dispatch({ type: 'PATCH_NUTRITION', goalId, patch: p })
  }

  function toggleSet(field: 'selectedMechanisms' | 'selectedCofactors' | 'selectedFunctionalSystems' | 'selectedSystems' | 'physiologyNeeds', itemId: string) {
    dispatch({ type: 'TOGGLE_NUTRITION_SET', goalId, field, itemId })
  }

  function toggleLevel(level: string) {
    setExpandedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  function toggleCofactorGroup(id: string) {
    setExpandedCofactorGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        On Page 1 you identified the level where the problem occurs. Now identify the mechanism — the why.
      </p>

      {LEVELS.map((level) => {
        const items = MECHANISMS_BY_LEVEL[level]
        const expanded = expandedLevels.has(level)
        const selectedCount = items.filter((_, i) => nutrition.selectedMechanisms.includes(levelMechanismId(level, i))).length
        return (
          <div key={level} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button onClick={() => toggleLevel(level)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
              <span className="font-semibold text-slate-800">{MECHANISM_LEVEL_LABELS[level]}</span>
              <span className="flex items-center gap-2 flex-shrink-0">
                {selectedCount > 0 && (
                  <span className="text-xs font-bold text-sage-dark bg-sage/20 rounded-full px-2 py-0.5">{selectedCount}</span>
                )}
                <span className="text-slate-400 text-sm">{expanded ? '−' : '+'}</span>
              </span>
            </button>
            {expanded && (
              <div className="border-t border-slate-100 p-3 flex flex-wrap gap-2">
                {items.map((item, i) => {
                  const id = levelMechanismId(level, i)
                  return (
                    <TickChip
                      key={id}
                      label={item}
                      checked={nutrition.selectedMechanisms.includes(id)}
                      onClick={() => toggleSet('selectedMechanisms', id)}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button onClick={() => setUtilisationOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
          <span className="font-semibold text-slate-800">D. Utilisation</span>
          <span className="text-slate-400 text-sm">{utilisationOpen ? '−' : '+'}</span>
        </button>
        {utilisationOpen && (
          <div className="border-t border-slate-100 p-3 space-y-3">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                1. Cofactors — missing/insufficient vitamin, mineral or electrolyte?
              </p>
              <div className="space-y-2">
                {COFACTOR_GROUPS.map((group) => {
                  const groupExpanded = expandedCofactorGroups.has(group.id)
                  const selectedCount = group.items.filter((_, i) =>
                    nutrition.selectedCofactors.includes(groupedItemId(group.id, i)),
                  ).length
                  return (
                    <div key={group.id} className="rounded-xl border border-slate-100">
                      <button
                        onClick={() => toggleCofactorGroup(group.id)}
                        className="w-full flex items-center justify-between gap-3 p-3 text-left"
                      >
                        <span className="text-sm font-medium text-slate-700">{group.label}</span>
                        <span className="flex items-center gap-2 flex-shrink-0">
                          {selectedCount > 0 && (
                            <span className="text-xs font-bold text-sage-dark bg-sage/20 rounded-full px-2 py-0.5">
                              {selectedCount}
                            </span>
                          )}
                          <span className="text-slate-300 text-xs">{groupExpanded ? '−' : '+'}</span>
                        </span>
                      </button>
                      {groupExpanded && (
                        <div className="px-3 pb-3 flex flex-wrap gap-2">
                          {group.items.map((item, i) => {
                            const id = groupedItemId(group.id, i)
                            return (
                              <TickChip
                                key={id}
                                label={item}
                                checked={nutrition.selectedCofactors.includes(id)}
                                onClick={() => toggleSet('selectedCofactors', id)}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">2. Functional systems — which body function isn't working?</p>
              <div className="flex flex-wrap gap-2">
                {FUNCTIONAL_SYSTEMS.map((item, i) => {
                  const id = groupedItemId('functional', i)
                  return (
                    <TickChip
                      key={id}
                      label={item}
                      checked={nutrition.selectedFunctionalSystems.includes(id)}
                      onClick={() => toggleSet('selectedFunctionalSystems', id)}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="font-medium text-slate-700 mb-3">E. Is a system involved in this problem? (at any point)</p>
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => patch({ systemInvolved: false })}
            className={`flex-1 rounded-2xl py-3 font-semibold ${
              nutrition.systemInvolved === false ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            No
          </button>
          <button
            onClick={() => patch({ systemInvolved: true })}
            className={`flex-1 rounded-2xl py-3 font-semibold ${
              nutrition.systemInvolved === true ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Yes
          </button>
        </div>
        {nutrition.systemInvolved === false && (
          <p className="text-xs text-slate-400">Stay in food / behaviour / intake level.</p>
        )}
        {nutrition.systemInvolved === true && (
          <div className="flex flex-wrap gap-2">
            {SYSTEMS.map((item, i) => {
              const id = groupedItemId('system', i)
              return (
                <TickChip
                  key={id}
                  label={item}
                  checked={nutrition.selectedSystems.includes(id)}
                  onClick={() => toggleSet('selectedSystems', id)}
                />
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <p className="font-medium text-slate-700 mb-1">Physiology approach</p>
        <p className="text-xs text-slate-400 mb-3">Use when the case is unclear or complex — do you need more precision?</p>
        <div className="flex gap-3">
          <button
            onClick={() => patch({ needsPrecision: false })}
            className={`flex-1 rounded-2xl py-3 font-semibold ${
              nutrition.needsPrecision === false ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            No
          </button>
          <button
            onClick={() => patch({ needsPrecision: true })}
            className={`flex-1 rounded-2xl py-3 font-semibold ${
              nutrition.needsPrecision === true ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Yes
          </button>
        </div>

        {nutrition.needsPrecision === true && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => patch({ precisionPath: 'quick' })}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border ${
                  nutrition.precisionPath === 'quick' ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Quick path
              </button>
              <button
                onClick={() => patch({ precisionPath: 'deep' })}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border ${
                  nutrition.precisionPath === 'deep' ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                Deep path
              </button>
            </div>
            {nutrition.precisionPath === 'quick' && (
              <p className="text-xs text-slate-400">Use the biochemical / cofactor list above — stays on this page.</p>
            )}
            {nutrition.precisionPath === 'deep' && (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">3 fundamental needs — are these supported?</p>
                  <div className="flex flex-wrap gap-2">
                    {PHYSIOLOGY_NEEDS.map((need) => (
                      <TickChip
                        key={need.id}
                        label={need.label}
                        checked={nutrition.physiologyNeeds.includes(need.id)}
                        onClick={() => toggleSet('physiologyNeeds', need.id)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Root cause</label>
                  <textarea
                    value={nutrition.rootCauseNotes}
                    onChange={(e) => patch({ rootCauseNotes: e.target.value })}
                    rows={2}
                    placeholder="Which organ/system is involved, and the real underlying cause..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Once the mechanism is identified: return to Page 1 → Summary &amp; Intervention.
      </p>
    </div>
  )
}
