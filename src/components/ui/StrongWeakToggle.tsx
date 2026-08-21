import type { StrongWeak } from '../../types'

interface StrongWeakToggleProps {
  value: StrongWeak | null
  onChange: (value: StrongWeak) => void
  size?: 'sm' | 'md' | 'lg'
  // Lets a check reuse the strong/weak result under the hood while showing
  // different wording — e.g. Assemblage Point's aligned/out of balance.
  labels?: { strong: string; weak: string }
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-2.5 text-xs min-w-[64px]',
  md: 'px-4 py-3 text-sm min-w-[88px]',
  lg: 'px-6 py-4 text-base min-w-[110px]',
}

export function StrongWeakToggle({ value, onChange, size = 'md', labels }: StrongWeakToggleProps) {
  const base = SIZE_CLASSES[size]
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('strong')}
        className={`${base} rounded-2xl font-semibold transition-colors ${
          value === 'strong' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
        }`}
      >
        {labels?.strong ?? 'Strong'}
      </button>
      <button
        type="button"
        onClick={() => onChange('weak')}
        className={`${base} rounded-2xl font-semibold transition-colors ${
          value === 'weak' ? 'bg-rose-500 text-white shadow-sm' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
        }`}
      >
        {labels?.weak ?? 'Weak'}
      </button>
    </div>
  )
}
