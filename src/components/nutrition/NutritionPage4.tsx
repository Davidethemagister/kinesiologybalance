import { useState } from 'react'
import { useSession } from '../../context/SessionContext'
import { EMOTIONAL_CATEGORIES, KEY_QUESTIONS, emotionalFactorId } from '../../data/nutritionEmotional'
import type { NutritionAssessment } from '../../types'

// Page 4 ("Emotional / Behavioural Factors — The Why"). Come here when
// patterns don't shift with physical intervention alone, or when stress/
// cravings/mood/motivation look like the real driver.
export function NutritionPage4({ goalId }: { goalId: string }) {
  const { dispatch, getNutrition } = useSession()
  const nutrition = getNutrition(goalId)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [questionsOpen, setQuestionsOpen] = useState(false)

  function patch(p: Partial<NutritionAssessment>) {
    dispatch({ type: 'PATCH_NUTRITION', goalId, patch: p })
  }

  function toggleCategory(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedCount = nutrition.selectedEmotionalFactors.length

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Come here when patterns don't change with physical interventions, there are inconsistencies (eating, habits,
        follow-through), or stress/cravings/mood/motivation are key.
        {selectedCount > 0 && <span className="text-sage-dark font-semibold"> {selectedCount} factors identified.</span>}
      </p>

      {EMOTIONAL_CATEGORIES.map((cat) => {
        const catExpanded = expanded.has(cat.id)
        const catSelectedCount = cat.items.filter((_, i) =>
          nutrition.selectedEmotionalFactors.includes(emotionalFactorId(cat.id, i)),
        ).length
        return (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button onClick={() => toggleCategory(cat.id)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
              <span className="font-semibold text-slate-800 text-sm">{cat.label}</span>
              <span className="flex items-center gap-2 flex-shrink-0">
                {catSelectedCount > 0 && (
                  <span className="text-xs font-bold text-sage-dark bg-sage/20 rounded-full px-2 py-0.5">{catSelectedCount}</span>
                )}
                <span className="text-slate-400 text-sm">{catExpanded ? '−' : '+'}</span>
              </span>
            </button>
            {catExpanded && (
              <div className="border-t border-slate-100 p-3 flex flex-wrap gap-2">
                {cat.items.map((item, i) => {
                  const id = emotionalFactorId(cat.id, i)
                  const checked = nutrition.selectedEmotionalFactors.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => dispatch({ type: 'TOGGLE_NUTRITION_SET', goalId, field: 'selectedEmotionalFactors', itemId: id })}
                      className={`rounded-full px-3 py-2 text-xs font-medium border text-left ${
                        checked ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-600 border-slate-200'
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

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button onClick={() => setQuestionsOpen((v) => !v)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
          <span className="font-semibold text-slate-800 text-sm">Key questions to unlock the why</span>
          <span className="text-slate-400 text-sm">{questionsOpen ? '−' : '+'}</span>
        </button>
        {questionsOpen && (
          <ul className="border-t border-slate-100 p-4 space-y-1.5 text-sm text-slate-600 list-disc pl-8">
            {KEY_QUESTIONS.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <label className="block font-medium text-slate-700 mb-1">Integrate & prioritise</label>
        <p className="text-xs text-slate-400 mb-2">
          Filter to 1–3 key areas, connect them to the physical issue, plan small realistic shifts, and review as you
          go.
        </p>
        <textarea
          value={nutrition.emotionalNotes}
          onChange={(e) => patch({ emotionalNotes: e.target.value })}
          rows={3}
          placeholder="Which factors matter most right now, how they connect to the physical issue, and the plan..."
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
        />
      </div>

      <p className="text-xs text-slate-400">
        Once the key factors are identified: return to Page 1 → Summary &amp; Intervention to complete the assessment
        and create the plan. Emotional and behavioural factors are real, powerful, and changeable — not "all in your
        head."
      </p>
    </div>
  )
}
