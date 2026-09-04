import { useState } from 'react'
import { NutritionPage1 } from './NutritionPage1'
import { NutritionPage2 } from './NutritionPage2'
import { NutritionPage3 } from './NutritionPage3'
import { NutritionPage4 } from './NutritionPage4'

type NutritionPageId = 1 | 2 | 3 | 4

const TABS: { id: NutritionPageId; label: string }[] = [
  { id: 1, label: 'Page 1 · Core flow' },
  { id: 2, label: 'Page 2 · Food lists' },
  { id: 3, label: 'Page 3 · Mechanisms' },
  { id: 4, label: 'Page 4 · Emotional' },
]

// Nested inside Pot Creation's Nutrition sub-branch (see PotCreationPanel.tsx).
// The source chart is explicitly non-linear ("jump between pages as needed,
// but always return to Page 1"), so this is simple page tabs rather than a
// locked wizard.
export function NutritionFlow({ goalId }: { goalId: string }) {
  const [page, setPage] = useState<NutritionPageId>(1)

  return (
    <div>
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-bold border transition-colors ${
              page === tab.id ? 'bg-sage text-slate-900 border-transparent' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {page === 1 && (
        <NutritionPage1
          goalId={goalId}
          onGoToPage2={() => setPage(2)}
          onGoToPage3={() => setPage(3)}
          onGoToPage4={() => setPage(4)}
        />
      )}
      {page === 2 && <NutritionPage2 goalId={goalId} />}
      {page === 3 && <NutritionPage3 goalId={goalId} />}
      {page === 4 && <NutritionPage4 goalId={goalId} />}
    </div>
  )
}
