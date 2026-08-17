import type { Level } from '../types'

export interface AffirmationVoice {
  id: string
  statement: string
}

export const AFFIRMATIONS: AffirmationVoice[] = [
  { id: 'release-need', statement: 'This being is 100% willing to release the need for the problem on all levels.' },
  { id: 'accept-benefits', statement: 'This being is 100% willing to accept benefits of the change on all levels.' },
  { id: 'determination', statement: 'This being has 100% determination to implement the goal on all levels.' },
  {
    id: 'protected-safer',
    statement:
      'This person is 100% protected and safer during the implementation and outworking of this goal on all levels.',
  },
]

export const LEVELS: { id: Level; label: string }[] = [
  { id: 'mental', label: 'Mental' },
  { id: 'physical', label: 'Physical' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'spiritual', label: 'Spiritual' },
  { id: 'other-realities', label: 'Other Realities' },
]
