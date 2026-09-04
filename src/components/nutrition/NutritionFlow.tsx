import { useState } from 'react'
import { NutritionPage1 } from './NutritionPage1'
import { NutritionPage2 } from './NutritionPage2'

type NutritionPageId = 1 | 2

// Nested inside Pot Creation's Nutrition sub-branch (see PotCreationPanel.tsx).
// The source chart is explicitly non-linear ("jump between pages as needed,
// but always return to Page 1"), so this is simple page tabs rather than a
// locked wizard — Pages 3-4 will slot in here the same way once built.
export function NutritionFlow({ goalId }: { goalId: string }) {
  const [page, setPage] = useState<NutritionPageId>(1)

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setPage(1)}
          className={`px-3.5 py-2 rounded-full text-sm font-bold border transition-colors ${
            page === 1 ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          Page 1 · Core flow
        </button>
        <button
          onClick={() => setPage(2)}
          className={`px-3.5 py-2 rounded-full text-sm font-bold border transition-colors ${
            page === 2 ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-500 border-slate-200'
          }`}
        >
          Page 2 · Food lists
        </button>
      </div>
      {page === 1 && <NutritionPage1 goalId={goalId} onGoToPage2={() => setPage(2)} />}
      {page === 2 && <NutritionPage2 goalId={goalId} />}
    </div>
  )
}
