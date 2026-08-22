export interface InterventionTechnique {
  id: string
  name: string
  hint?: string
}

export const STANDARD_INTERVENTIONS: InterventionTechnique[] = [
  {
    id: 'neurolymphatic-points',
    name: "Neurolymphatic Massage Points (Chapman's reflexes)",
    hint: 'Direct massage of specific reflex points correlated to each muscle/organ.',
  },
  {
    id: 'neurovascular-points',
    name: 'Neurovascular Holding Points',
    hint: 'Light-touch holding of specific scalp points to influence blood flow to the related muscle/organ.',
  },
  {
    id: 'meridian-tracing',
    name: 'Meridian Tracing',
    hint: 'Tracing the direction of a specific acupuncture meridian by hand to help balance its energy.',
  },
  {
    id: 'acupressure-point-holding',
    name: 'Acupressure Point Holding',
    hint: 'Holding a specific acupoint (rather than tracing a full meridian) during correction.',
  },
  {
    id: 'sound-tone-therapy',
    name: 'Sound / Tone Therapy',
    hint: 'Using a spoken tone, humming, or tuning fork against a weak muscle to test or support a correction.',
  },
  {
    id: 'colour-therapy',
    name: 'Colour Therapy',
    hint: 'Presenting a colour swatch to test or support a correction.',
  },
]
