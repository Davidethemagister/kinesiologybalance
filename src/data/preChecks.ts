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
