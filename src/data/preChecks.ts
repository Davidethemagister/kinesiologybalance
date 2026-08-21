export interface PreCheckVoice {
  id: string
  name: string
}

export const STANDARD_CHECKS: PreCheckVoice[] = [
  { id: 'ionization', name: 'Ionization' },
  { id: 'supraspinatus', name: 'Supraspinatus' },
  { id: 'homolateral', name: 'Homolateral' },
  { id: 'centered-in-aura', name: 'Cantered in aura' },
  { id: 'protection', name: 'Protection' },
  { id: 'hoyd', name: 'Hoyd' },
  { id: 'hips', name: 'Hips' },
  { id: 'hearth-heaven', name: 'Hearth/Heaven' },
]

export const SURROGATION_CHECK: PreCheckVoice = {
  id: 'surrogation',
  name: 'Surrogation: "I am being my own being"',
}

// Added at the end of the standard list, not mixed in — it's tested last and
// has its own result vocabulary (aligned / out of balance) rather than
// strong/weak, since it's checking alignment rather than muscle strength.
export const ASSEMBLAGE_POINT_CHECK: PreCheckVoice = {
  id: 'assemblage-point',
  name: 'Assemblage Point',
}
