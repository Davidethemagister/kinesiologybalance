export interface SubBranch {
  id: string
  name: string
  note?: string
  comingSoon?: boolean
}

export const PHYSICAL_SUB_BRANCHES: SubBranch[] = [
  { id: 'organ', name: 'Organ', note: 'Pugno, thumb + index — alarm points' },
  { id: 'gland', name: 'Gland', note: 'Pugno, thumb + middle — scan' },
  { id: 'hormones', name: 'Hormones', note: 'Pugno, thumb + ring — scan' },
  { id: 'nutrition', name: 'Nutrition', note: 'Open hand, thumb + middle', comingSoon: true },
  { id: 'pain', name: 'If pain → action in the body' },
  { id: 'time-of-day', name: 'Time of day (NER)' },
  { id: 'other', name: 'Other', note: 'Bone, veins, nervous system, lymphatic, toxicity, parasites, bacteria' },
]

export const ENERGETIC_SUB_BRANCHES: SubBranch[] = [
  { id: 'aura', name: 'Aura', note: 'Open hand, thumb outside pinkie' },
  { id: 'chakra', name: 'Chakra' },
  { id: 'meridian', name: 'Meridian' },
  { id: 'eight-extraordinary', name: 'Eight extraordinary meridians' },
  { id: 'five-elements', name: 'Five elements' },
  { id: 'nef', name: 'Check for NEF' },
]
