import { useState } from 'react'
import { useSession } from '../../context/SessionContext'
import { FOOD_LISTS, foodItemId, foodLabelFromId, type FoodListGroupId } from '../../data/nutritionFoods'
import type { NutritionAssessment, NutritionInappropriateReason } from '../../types'

const INAPPROPRIATE_REASONS: { id: NutritionInappropriateReason; label: string }[] = [
  { id: 'quality', label: 'Quality' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'timing', label: 'Timing' },
  { id: 'behavioural', label: 'Behaviour/emotional pattern' },
]

function appendNote(existing: string, line: string): string {
  return existing ? `${existing}\n${line}` : line
}

// Page 2 ("Food Lists — What?") — identify the specific food or source
// involved. Nested accordion (group -> subcategory -> items) since the full
// list is ~150 line items; a flat list would be unusable one-handed.
export function NutritionPage2({ goalId, onGoToPage4 }: { goalId: string; onGoToPage4: () => void }) {
  const { dispatch, getNutrition } = useSession()
  const nutrition = getNutrition(goalId)

  function patch(p: Partial<NutritionAssessment>) {
    dispatch({ type: 'PATCH_NUTRITION', goalId, patch: p })
  }

  function selectMostRelevantFood(foodId: string) {
    const nowSelected = nutrition.mostRelevantFoodId === foodId ? null : foodId
    patch({
      mostRelevantFoodId: nowSelected,
      inappropriateReason: nowSelected ? nutrition.inappropriateReason : null,
      notes: nowSelected
        ? appendNote(nutrition.notes, `Most relevant food/source: ${foodLabelFromId(foodId)}`)
        : nutrition.notes,
    })
  }

  function selectInappropriateReason(reason: NutritionInappropriateReason) {
    const reasonLabel = INAPPROPRIATE_REASONS.find((r) => r.id === reason)?.label
    patch({
      inappropriateReason: reason,
      notes: nutrition.mostRelevantFoodId
        ? appendNote(nutrition.notes, `Not appropriate (${reasonLabel}): ${foodLabelFromId(nutrition.mostRelevantFoodId)}`)
        : nutrition.notes,
    })
    if (reason === 'behavioural') onGoToPage4()
  }

  const [expandedGroups, setExpandedGroups] = useState<Set<FoodListGroupId>>(() => {
    const suggested: FoodListGroupId | null =
      nutrition.imbalanceType === 'hydration' ? 'hydration' : nutrition.macroType
    return new Set(suggested ? [suggested] : [])
  })
  const [expandedSubcats, setExpandedSubcats] = useState<Set<string>>(new Set())

  function toggleGroup(id: FoodListGroupId) {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSubcat(id: string) {
    setExpandedSubcats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedCount = nutrition.selectedFoods.length

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Scan the lists, identify the most relevant food or source, and check appropriateness (quality, quantity,
        timing, context).
        {selectedCount > 0 && <span className="text-sage-dark font-semibold"> {selectedCount} selected.</span>}
      </p>

      {FOOD_LISTS.map((group) => {
        const groupSelectedCount = group.subcategories.reduce(
          (sum, sub) =>
            sum + sub.items.filter((_, i) => nutrition.selectedFoods.includes(foodItemId(group.id, sub.id, i))).length,
          0,
        )
        const groupExpanded = expandedGroups.has(group.id)
        return (
          <div key={group.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between gap-3 p-4 text-left"
            >
              <span className="font-semibold text-slate-800">{group.label}</span>
              <span className="flex items-center gap-2 flex-shrink-0">
                {groupSelectedCount > 0 && (
                  <span className="text-xs font-bold text-sage-dark bg-sage/20 rounded-full px-2 py-0.5">
                    {groupSelectedCount}
                  </span>
                )}
                <span className="text-slate-400 text-sm">{groupExpanded ? '−' : '+'}</span>
              </span>
            </button>

            {groupExpanded && (
              <div className="border-t border-slate-100 p-3 space-y-2">
                {group.subcategories.map((sub) => {
                  const subKey = `${group.id}:${sub.id}`
                  const subSelectedCount = sub.items.filter((_, i) =>
                    nutrition.selectedFoods.includes(foodItemId(group.id, sub.id, i)),
                  ).length
                  const subExpanded = expandedSubcats.has(subKey)
                  return (
                    <div key={sub.id} className="rounded-xl border border-slate-100">
                      <button
                        onClick={() => toggleSubcat(subKey)}
                        className="w-full flex items-center justify-between gap-3 p-3 text-left"
                      >
                        <span className="text-sm font-medium text-slate-700">{sub.name}</span>
                        <span className="flex items-center gap-2 flex-shrink-0">
                          {subSelectedCount > 0 && (
                            <span className="text-xs font-bold text-sage-dark bg-sage/20 rounded-full px-2 py-0.5">
                              {subSelectedCount}
                            </span>
                          )}
                          <span className="text-slate-300 text-xs">{subExpanded ? '−' : '+'}</span>
                        </span>
                      </button>
                      {subExpanded && (
                        <div className="px-3 pb-3 flex flex-wrap gap-2">
                          {sub.items.map((item, i) => {
                            const id = foodItemId(group.id, sub.id, i)
                            const checked = nutrition.selectedFoods.includes(id)
                            return (
                              <button
                                key={id}
                                onClick={() => dispatch({ type: 'TOGGLE_NUTRITION_FOOD', goalId, foodId: id })}
                                className={`rounded-full px-3 py-2 text-xs font-medium border text-left ${
                                  checked
                                    ? 'bg-sage text-slate-900 border-transparent'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                {item}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {selectedCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <p className="font-medium text-slate-700">Which food or source is most relevant to the issue?</p>
          <div className="flex flex-wrap gap-2">
            {nutrition.selectedFoods.map((foodId) => {
              const checked = nutrition.mostRelevantFoodId === foodId
              return (
                <button
                  key={foodId}
                  onClick={() => selectMostRelevantFood(foodId)}
                  className={`rounded-full px-3 py-2 text-xs font-medium border text-left ${
                    checked ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {foodLabelFromId(foodId)}
                </button>
              )
            })}
          </div>

          {nutrition.mostRelevantFoodId && (
            <div className="pt-1 border-t border-slate-100">
              <p className="font-medium text-slate-700 mt-3 mb-2">Why isn't it appropriate for this person?</p>
              <div className="flex flex-wrap gap-2">
                {INAPPROPRIATE_REASONS.map((reason) => {
                  const checked = nutrition.inappropriateReason === reason.id
                  return (
                    <button
                      key={reason.id}
                      onClick={() => selectInappropriateReason(reason.id)}
                      className={`rounded-full px-3 py-2 text-xs font-medium border ${
                        checked ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {reason.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
