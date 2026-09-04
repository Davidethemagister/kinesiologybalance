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
  voiceId: string | null // links back to a STANDARD_CHECKS/SURROGATION_CHECK id for settings filtering; null for custom checks
  name: string
  source: 'standard' | 'surrogation' | 'custom'
  result: StrongWeak | null
  emotionAttached: boolean | null
  emotionEntry: EmotionEntry | null
  notes: string
}

export interface PreCheckRound {
  id: string
  roundNumber: number
  createdAt: string
  checks: PreCheck[]
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
  voiceId: string
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

// Nutrition Kinesiology — Complete Decision Tree (source: Nutrition chart
// .docx). Page 1 (entry flow) and Page 2 (food lists) are covered so far;
// Pages 3-4 (mechanisms/cofactors, emotional-behavioural) are a later phase.
export type NutritionImbalanceType = 'deficiency' | 'excess' | 'sensitivity' | 'absorption' | 'hydration'
export type NutritionLevel = 'macro' | 'micro' | 'both'
export type MacroType = 'protein' | 'fats' | 'carbohydrates'
export type NutritionProblemLocation = 'intake' | 'digestion' | 'absorption' | 'utilisation'
export type NutritionInappropriateReason = 'quality' | 'quantity' | 'timing' | 'behavioural'

export interface NutritionAssessment {
  goalId: string
  involved: boolean | null
  imbalanceType: NutritionImbalanceType | null
  level: NutritionLevel | null
  macroType: MacroType | null
  problemLocations: NutritionProblemLocation[]
  // Page 2: ids of food-list line items (see src/data/nutritionFoods.ts)
  // identified as relevant.
  selectedFoods: string[]
  // Page 2: which of selectedFoods is the single most relevant one, and why
  // it isn't appropriate for this person. 'behavioural' routes to Page 4.
  mostRelevantFoodId: string | null
  inappropriateReason: NutritionInappropriateReason | null
  // Page 3 (see src/data/nutritionMechanisms.ts for the reference lists
  // these ids are drawn from).
  selectedMechanisms: string[] // within intake/digestion/absorption
  selectedCofactors: string[] // Utilisation: vitamins/minerals/electrolytes
  selectedFunctionalSystems: string[] // Utilisation: which body function
  systemInvolved: boolean | null
  selectedSystems: string[]
  needsPrecision: boolean | null
  precisionPath: 'quick' | 'deep' | null
  physiologyNeeds: string[] // deep path: oxygen/water/energy supported
  rootCauseNotes: string // deep path
  // Page 4 (see src/data/nutritionEmotional.ts).
  selectedEmotionalFactors: string[]
  emotionalNotes: string
  notes: string
}

export interface Closing {
  goalId: string
  anythingElse: boolean | null
  anythingElseNotes: string
  retestConfirmed: boolean
  nextSessionDate: string | null
  homework: string
}

export interface InterventionCheck {
  id: string
  voiceId: string | null // links back to a STANDARD_INTERVENTIONS id for settings filtering; null for custom
  name: string
  source: 'standard' | 'custom'
  done: boolean
  notes: string
}

export interface Intervention {
  goalId: string
  checks: InterventionCheck[]
}

export type PanelId = 'pre-checks' | 'goal' | 'integration' | 'pot-creation' | 'closing' | 'intervention'
