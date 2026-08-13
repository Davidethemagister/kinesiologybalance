export type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

export interface OrganCategory {
  id: string
  name: string // e.g. "Heart", "Small Intestine", "Central", "Governing"
  element: Element | 'central' | 'governing'
  muscle: string // e.g. "Subscapularis" — empty string if not given in source
  acupoint?: string // e.g. "CV14"
  emotions: string[]
}

export interface EmotionEntry {
  organCategoryId: string
  emotion: string
}

export type StrongWeak = 'strong' | 'weak'

export interface PreCheck {
  id: string
  name: string
  source: 'standard' | 'surrogation' | 'custom'
  result: StrongWeak | null
  emotionAttached: boolean | null
  emotionEntry: EmotionEntry | null
  notes: string
}

export interface Goal {
  id: string
  issue: string
  goalStatement: string
  status: 'pending' | 'accepted'
  order: number
}

export type Level = 'mental' | 'physical' | 'emotional' | 'spiritual' | 'other-realities'

export interface Affirmation {
  statement: string
  resultsByLevel: Record<Level, StrongWeak | null>
}

export interface IntegrationCheck {
  goalId: string
  lifeEnergyPercent: number | null
  stressOnGoalPercent: number | null
  affirmations: Affirmation[]
  sabotageCheck: StrongWeak | null
  sabotageNotes: string
}

export type PotBranch = 'physical' | 'energetic'

export interface PotCreation {
  goalId: string
  emotionEntry: EmotionEntry | null
  time: 'present' | 'past' | null
  needsMoreInfo: boolean | null
  moreInfoNotes: string
  branch: PotBranch | null
  subBranch: string | null // one of the sub-branch ids for the selected branch
  findings: string // free text for now, placeholder for future structured data
}

export interface Closing {
  goalId: string
  anythingElse: boolean | null
  anythingElseNotes: string
  retestConfirmed: boolean
  nextSessionDate: string | null
  homework: string
}

export type PanelId = 'pre-checks' | 'goal' | 'integration' | 'pot-creation' | 'closing'
