import type { NutritionImbalanceType, NutritionLevel, MacroType, NutritionProblemLocation } from '../types'

// Page 1 ("Type of Imbalance" / "Primary Level" / "Where is the Problem?") of
// the Nutrition Kinesiology Complete Decision Tree. Pages 2-4 (food lists,
// mechanisms/cofactor reference tables, emotional-behavioural grid) land in
// a later phase.
export const IMBALANCE_TYPES: { id: NutritionImbalanceType; label: string; hint: string }[] = [
  { id: 'deficiency', label: 'Deficiency', hint: 'Not enough' },
  { id: 'excess', label: 'Excess', hint: 'Too much' },
  { id: 'sensitivity', label: 'Sensitivity / Intolerance', hint: 'Reaction' },
  { id: 'absorption', label: 'Absorption Issue', hint: 'Not absorbing properly' },
  { id: 'hydration', label: 'Hydration Imbalance', hint: 'Too much / too little, or electrolyte issue' },
]

export const NUTRITION_LEVELS: { id: NutritionLevel; label: string; hint: string }[] = [
  { id: 'macro', label: 'Macronutrient', hint: 'Protein / Fats / Carbohydrates' },
  { id: 'micro', label: 'Micronutrient', hint: 'Vitamins / Minerals / Electrolytes' },
  { id: 'both', label: 'Both', hint: 'Start with the strongest signal' },
]

export const MACRO_TYPES: { id: MacroType; label: string }[] = [
  { id: 'protein', label: 'Protein' },
  { id: 'fats', label: 'Fats' },
  { id: 'carbohydrates', label: 'Carbohydrates' },
]

export const PROBLEM_LOCATIONS: { id: NutritionProblemLocation; label: string; hint: string }[] = [
  { id: 'intake', label: 'Intake', hint: 'What and how much is being eaten?' },
  { id: 'digestion', label: 'Digestion', hint: 'Breaking down the food' },
  { id: 'absorption', label: 'Absorption', hint: 'Getting nutrients through the gut wall' },
  { id: 'utilisation', label: 'Utilisation', hint: 'Using nutrients inside the body (cell level)' },
]
