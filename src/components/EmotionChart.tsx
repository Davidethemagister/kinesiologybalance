import { useEffect, useMemo, useState } from 'react'
import type { Element, EmotionEntry } from '../types'
import { ORGAN_CATEGORIES } from '../data/organCategories'
import { Modal } from './ui/Modal'

interface EmotionChartProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (entry: EmotionEntry) => void
}

type Step = 'element' | 'organ' | 'emotion' | 'confirm'
type Group = Element | 'central' | 'governing'

const ELEMENT_GROUPS: { id: Element; label: string; classes: string }[] = [
  { id: 'wood', label: 'Wood', classes: 'bg-element-wood text-white' },
  { id: 'fire', label: 'Fire', classes: 'bg-element-fire text-white' },
  { id: 'earth', label: 'Earth', classes: 'bg-element-earth text-slate-900' },
  { id: 'metal', label: 'Metal', classes: 'bg-element-metal text-slate-900' },
  { id: 'water', label: 'Water', classes: 'bg-element-water text-white' },
]

export function EmotionChart({ isOpen, onClose, onConfirm }: EmotionChartProps) {
  const [step, setStep] = useState<Step>('element')
  const [group, setGroup] = useState<Group | null>(null)
  const [organCategoryId, setOrganCategoryId] = useState<string | null>(null)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStep('element')
      setGroup(null)
      setOrganCategoryId(null)
      setEmotion(null)
      setSearch('')
    }
  }, [isOpen])

  const organsForGroup = useMemo(() => ORGAN_CATEGORIES.filter((o) => o.element === group), [group])

  const organCategory = useMemo(
    () => ORGAN_CATEGORIES.find((o) => o.id === organCategoryId) ?? null,
    [organCategoryId],
  )

  const filteredEmotions = useMemo(() => {
    if (!organCategory) return []
    if (!search.trim()) return organCategory.emotions
    return organCategory.emotions.filter((e) => e.toLowerCase().includes(search.toLowerCase()))
  }, [organCategory, search])

  function pickGroup(g: Group) {
    setGroup(g)
    if (g === 'central' || g === 'governing') {
      const cat = ORGAN_CATEGORIES.find((o) => o.id === g)
      setOrganCategoryId(cat?.id ?? null)
      setStep('emotion')
    } else {
      setStep('organ')
    }
  }

  function pickOrgan(id: string) {
    setOrganCategoryId(id)
    setStep('emotion')
  }

  function pickEmotion(word: string) {
    setEmotion(word)
    setStep('confirm')
  }

  function handleConfirm() {
    if (!organCategoryId || !emotion) return
    onConfirm({ organCategoryId, emotion })
    onClose()
  }

  function goBack() {
    if (step === 'confirm') setStep('emotion')
    else if (step === 'emotion') setStep(group === 'central' || group === 'governing' ? 'element' : 'organ')
    else if (step === 'organ') setStep('element')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Emotion Chart</h2>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 text-2xl leading-none px-2"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {step !== 'element' && (
        <button onClick={goBack} className="mb-4 text-sm text-sage-dark font-semibold">
          ← Back
        </button>
      )}

      {step === 'element' && (
        <div>
          <p className="text-sm text-slate-500 mb-3">Choose an element</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {ELEMENT_GROUPS.map((el) => (
              <button
                key={el.id}
                onClick={() => pickGroup(el.id)}
                className={`${el.classes} rounded-2xl py-7 text-lg font-semibold shadow-sm active:scale-95 transition-transform`}
              >
                {el.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-500 mb-3">Or a non-elemental category</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => pickGroup('central')}
              className="bg-sage text-slate-900 rounded-2xl py-7 text-lg font-semibold shadow-sm active:scale-95 transition-transform"
            >
              Central
            </button>
            <button
              onClick={() => pickGroup('governing')}
              className="bg-sage text-slate-900 rounded-2xl py-7 text-lg font-semibold shadow-sm active:scale-95 transition-transform"
            >
              Governing
            </button>
          </div>
        </div>
      )}

      {step === 'organ' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-1">Choose an organ</p>
          {organsForGroup.map((organ) => (
            <button
              key={organ.id}
              onClick={() => pickOrgan(organ.id)}
              className="w-full text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-sage transition-colors"
            >
              <div className="font-semibold text-slate-800">{organ.name}</div>
              <div className="text-sm text-slate-500">
                {organ.muscle && <span>{organ.muscle}</span>}
                {organ.acupoint && (
                  <span>
                    {organ.muscle ? ' · ' : ''}
                    {organ.acupoint}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 'emotion' && organCategory && (
        <div>
          <p className="text-sm text-slate-500 mb-2">{organCategory.name} — choose an emotion</p>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emotions..."
            className="w-full mb-3 rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <div className="max-h-80 overflow-y-auto grid grid-cols-2 gap-2">
            {filteredEmotions.map((word) => (
              <button
                key={word}
                onClick={() => pickEmotion(word)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:border-sage hover:bg-sage/10 transition-colors text-left"
              >
                {word}
              </button>
            ))}
            {filteredEmotions.length === 0 && (
              <p className="col-span-2 text-sm text-slate-400 py-4 text-center">No emotions match your search.</p>
            )}
          </div>
        </div>
      )}

      {step === 'confirm' && organCategory && emotion && (
        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Emotion selected</div>
            <div className="text-xl font-semibold text-slate-800 mb-3">{emotion}</div>
            <div className="text-sm text-slate-600 space-y-1">
              <div>
                <span className="text-slate-400">Organ:</span> {organCategory.name}
              </div>
              {organCategory.muscle && (
                <div>
                  <span className="text-slate-400">Muscle:</span> {organCategory.muscle}
                </div>
              )}
              {organCategory.acupoint && (
                <div>
                  <span className="text-slate-400">Acupoint:</span> {organCategory.acupoint}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('emotion')}
              className="flex-1 rounded-2xl py-4 font-semibold bg-slate-100 text-slate-600"
            >
              Change
            </button>
            <button onClick={handleConfirm} className="flex-1 rounded-2xl py-4 font-semibold bg-sage text-slate-900">
              Confirm
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
