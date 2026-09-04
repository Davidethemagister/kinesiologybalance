import { useSession } from '../../context/SessionContext'
import { IMBALANCE_TYPES, NUTRITION_LEVELS, MACRO_TYPES, PROBLEM_LOCATIONS } from '../../data/nutrition'
import type { NutritionAssessment } from '../../types'

// Page 1 ("core flow") of the Nutrition Kinesiology Complete Decision Tree.
// Pages 2 (food lists), 3 (mechanisms/cofactors) and 4 (emotional-
// behavioural) are a later phase — see the note at the bottom of this panel.
export function NutritionPage1({ goalId }: { goalId: string }) {
  const { dispatch, getNutrition } = useSession()
  const nutrition = getNutrition(goalId)

  function patch(p: Partial<NutritionAssessment>) {
    dispatch({ type: 'PATCH_NUTRITION', goalId, patch: p })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6">
      <div>
        <p className="font-medium text-slate-700 mb-3">Is nutrition involved?</p>
        <div className="flex gap-3">
          <button
            onClick={() => patch({ involved: false })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              nutrition.involved === false ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            No
          </button>
          <button
            onClick={() => patch({ involved: true })}
            className={`flex-1 rounded-2xl py-4 font-semibold ${
              nutrition.involved === true ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Yes
          </button>
        </div>
        {nutrition.involved === false && (
          <p className="mt-3 text-sm text-slate-400">Look for other stressors first.</p>
        )}
      </div>

      {nutrition.involved === true && (
        <>
          <div>
            <p className="font-medium text-slate-700 mb-1">1. Type of imbalance</p>
            <p className="text-xs text-slate-400 mb-3">Identify the pattern</p>
            <div className="grid grid-cols-2 gap-2">
              {IMBALANCE_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => patch({ imbalanceType: t.id })}
                  className={`text-left rounded-xl border p-3 transition-colors ${
                    nutrition.imbalanceType === t.id ? 'border-sage bg-sage/10' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="font-medium text-slate-800 text-sm">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-slate-700 mb-1">2. Primary level</p>
            <p className="text-xs text-slate-400 mb-3">What is the main area involved?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {NUTRITION_LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => patch({ level: l.id, macroType: l.id === 'micro' ? null : nutrition.macroType })}
                  className={`text-left rounded-xl border p-3 transition-colors ${
                    nutrition.level === l.id ? 'border-sage bg-sage/10' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="font-medium text-slate-800 text-sm">{l.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{l.hint}</div>
                </button>
              ))}
            </div>

            {(nutrition.level === 'macro' || nutrition.level === 'both') && (
              <div className="mt-3">
                <p className="text-sm text-slate-500 mb-2">Which macro?</p>
                <div className="flex gap-2 flex-wrap">
                  {MACRO_TYPES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => patch({ macroType: m.id })}
                      className={`rounded-full px-4 py-2 text-sm font-semibold border ${
                        nutrition.macroType === m.id
                          ? 'bg-sage text-slate-900 border-transparent'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">→ Food lists (Page 2) — coming soon</p>
              </div>
            )}
            {(nutrition.level === 'micro' || nutrition.level === 'both') && (
              <p className="mt-3 text-xs text-slate-400">→ Mechanisms & cofactors (Page 3) — coming soon</p>
            )}
          </div>

          <div>
            <p className="font-medium text-slate-700 mb-1">3. Where is the problem?</p>
            <p className="text-xs text-slate-400 mb-3">Identify the level — check any that apply</p>
            <div className="space-y-2">
              {PROBLEM_LOCATIONS.map((loc) => {
                const checked = nutrition.problemLocations.includes(loc.id)
                return (
                  <button
                    key={loc.id}
                    onClick={() => dispatch({ type: 'TOGGLE_NUTRITION_PROBLEM_LOCATION', goalId, location: loc.id })}
                    className={`w-full flex items-center gap-3 text-left rounded-xl border p-3 transition-colors ${
                      checked ? 'border-sage bg-sage/10' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center border-2 ${
                        checked ? 'bg-sage border-sage text-slate-900' : 'border-slate-300 text-transparent'
                      }`}
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>
                      <span className="font-medium text-slate-800 text-sm block">{loc.label}</span>
                      <span className="text-xs text-slate-400">{loc.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-400">
            Full mechanism breakdown, food lists, cofactor/system reference tables, and the emotional/behavioural
            grid (Pages 2–4 of the source chart) are coming in a later update. Use the notes field below in the
            meantime.
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={nutrition.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={3}
              placeholder="Findings, which food/nutrient, appropriateness, next steps..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
        </>
      )}
    </div>
  )
}
