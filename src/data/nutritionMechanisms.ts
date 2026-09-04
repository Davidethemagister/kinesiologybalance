// Page 3 ("Mechanisms — Why?") of the Nutrition Kinesiology Complete
// Decision Tree (source: Nutrition chart .docx). The three intake/digestion/
// absorption levels map directly onto NutritionProblemLocation from Page 1.
export const MECHANISMS_BY_LEVEL: Record<'intake' | 'digestion' | 'absorption', string[]> = {
  intake: [
    'Poor food quality',
    'Imbalanced diet',
    'Low variety',
    'Inappropriate food choices',
    'Timing issues (skipping, irregular)',
    'Appetite dysregulation',
    'Overeating / undereating',
  ],
  digestion: [
    'Low stomach acid',
    'Enzyme deficiency',
    'Bile insufficiency',
    'Gut inflammation',
    'Microbiome imbalance (dysbiosis)',
    'Motility issues',
    'Nervous system inhibition (stress)',
  ],
  absorption: [
    'Gut lining integrity issues (leaky gut)',
    'Inflammation',
    'Transport issues',
    'Nutrient competition',
    'Damage to villi',
    'Low digestive secretions',
  ],
}

export const MECHANISM_LEVEL_LABELS: Record<'intake' | 'digestion' | 'absorption', string> = {
  intake: 'A. Intake',
  digestion: 'B. Digestion (Universal)',
  absorption: 'C. Absorption',
}

// D. Utilisation — cofactors (micronutrients missing/insufficient to allow
// the reaction to happen).
export const COFACTOR_GROUPS: { id: string; label: string; items: string[] }[] = [
  {
    id: 'vitamins',
    label: 'Vitamins',
    items: [
      'Vitamin A',
      'Vitamin B1 (Thiamine)',
      'Vitamin B2 (Riboflavin)',
      'Vitamin B3 (Niacin)',
      'Vitamin B5 (Pantothenic acid)',
      'Vitamin B6 (Pyridoxine)',
      'Vitamin B7 (Biotin)',
      'Vitamin B9 (Folate)',
      'Vitamin B12 (Cobalamin)',
      'Vitamin C (Ascorbic acid)',
      'Vitamin D',
      'Vitamin E',
      'Vitamin K',
    ],
  },
  {
    id: 'minerals',
    label: 'Minerals',
    items: [
      'Calcium',
      'Magnesium',
      'Potassium',
      'Sodium',
      'Iron',
      'Zinc',
      'Copper',
      'Selenium',
      'Iodine',
      'Manganese',
      'Chromium',
      'Molybdenum',
      'Phosphorus',
      'Sulphur',
    ],
  },
  {
    id: 'electrolytes',
    label: 'Electrolytes',
    items: ['Sodium', 'Potassium', 'Magnesium', 'Chloride', 'Calcium', 'Phosphate'],
  },
]

// D. Utilisation — functional systems (which body function isn't working).
export const FUNCTIONAL_SYSTEMS: string[] = [
  'Liver / Detoxification',
  'Energy production (ATP)',
  'Blood sugar regulation',
  'Hormonal balance',
  'Nervous system balance',
  'Immune function',
  'Digestive function',
  'Respiratory function',
  'Cardiovascular function',
  'Musculoskeletal function',
  'Cellular function',
  'Skin / Hair / Nails',
  'Reproductive function',
  'Sleep / Circadian rhythm',
  'Inflammation regulation',
  'Methylation / Epigenetic function',
]

// E. System involvement (at any point).
export const SYSTEMS: string[] = [
  'Digestive',
  'Liver',
  'Blood sugar',
  'Hormonal',
  'Nervous',
  'Immune',
  'Cardiovascular',
  'Respiratory',
  'Urinary',
  'Other systems',
]

// Physiology approach — the 3 fundamental needs, used on the deep path.
export const PHYSIOLOGY_NEEDS: { id: string; label: string }[] = [
  { id: 'oxygen', label: 'Oxygen (O2)' },
  { id: 'water', label: 'Water (Hydration)' },
  { id: 'energy', label: 'Energy (ATP)' },
]

export function levelMechanismId(level: 'intake' | 'digestion' | 'absorption', index: number): string {
  return `${level}-${index}`
}

export function groupedItemId(groupId: string, index: number): string {
  return `${groupId}-${index}`
}
