// Sourced from "Corrections - Powers of Stress.docx". Some of these will
// later get photos and richer reference info attached per technique — hint
// and steps are deliberately plain text for now so that's an additive change.
export interface InterventionTechnique {
  id: string
  name: string
  hint?: string
  steps?: string[]
}

export const STANDARD_INTERVENTIONS: InterventionTechnique[] = [
  { id: 'esr', name: 'ESRs (Emotional Stress Release)' },
  { id: 'esr-reptilian', name: 'ESRs + Reptilian Brain' },
  { id: 'pbp', name: 'PBP (Primary Brain Point)' },
  { id: 'gv20-k1', name: 'GV20 + K1' },
  { id: 'figure-8', name: 'Figure 8', steps: ['Ask where'] },
  { id: 'chakra', name: 'Chakra', steps: ['Which one', 'Work with hand', 'Tuning fork'] },
  {
    id: 'meridian',
    name: 'Meridian',
    steps: ['Which one', 'Tracing the meridian', 'Follow the Meridian Charts for possible corrections'],
  },
  {
    id: '8em',
    name: '8EM',
    steps: [
      'Opening/access point (show chart of the specific 8EM)',
      'Use with paired point (show paired point)',
      'Stimulate/apply pressure/massage',
      'Trace',
    ],
  },
  { id: 'tuning-forks', name: 'Tuning Forks' },
  { id: 'singing-bowl', name: 'Singing Bowl' },
  { id: 'mops', name: 'MOPS' },
  { id: 'ner-s18', name: 'Neuro Emotional Reflex', hint: 'S18 — outside elbow groove (funny bone)' },
  { id: 'nvr-th10', name: 'Neurovascular Reflex', hint: 'TH10 — back of the elbow' },
  { id: 'sr-li11', name: 'Spinal Reflex', hint: 'LI11 — inside to outside of elbow' },
  { id: 'nlr-st36', name: 'Neurolymphatic Reflex', hint: 'ST36 — leg' },
  { id: 'spinal-flow', name: 'Spinal Flow' },
]
