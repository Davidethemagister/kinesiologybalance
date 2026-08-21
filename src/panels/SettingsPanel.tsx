import { useSettings } from '../context/SettingsContext'
import { STANDARD_CHECKS, SURROGATION_CHECK, ASSEMBLAGE_POINT_CHECK } from '../data/preChecks'
import { AFFIRMATIONS } from '../data/affirmations'

function VoiceRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full text-left rounded-2xl border p-4 flex items-center gap-4 transition-colors ${
        enabled ? 'border-sage bg-sage/10' : 'border-slate-200 bg-white'
      }`}
    >
      <span
        className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          enabled ? 'bg-sage text-slate-900' : 'bg-slate-100 text-slate-400'
        }`}
      >
        {enabled ? '✓' : ''}
      </span>
      <span className={`font-medium ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
    </button>
  )
}

export function SettingsPanel() {
  const { isPreCheckVoiceEnabled, setPreCheckVoiceEnabled, isAffirmationVoiceEnabled, setAffirmationVoiceEnabled } =
    useSettings()

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <p className="text-slate-500 mb-6">
        Turn individual checks and statements on or off to match how you run a session. Custom checks you add during
        a session are always shown. Saved on this device.
      </p>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Pre-Checks</h2>
      <div className="space-y-2 mb-8">
        {STANDARD_CHECKS.map((voice) => (
          <VoiceRow
            key={voice.id}
            label={voice.name}
            enabled={isPreCheckVoiceEnabled(voice.id)}
            onToggle={() => setPreCheckVoiceEnabled(voice.id, !isPreCheckVoiceEnabled(voice.id))}
          />
        ))}
        <VoiceRow
          label={SURROGATION_CHECK.name}
          enabled={isPreCheckVoiceEnabled(SURROGATION_CHECK.id)}
          onToggle={() => setPreCheckVoiceEnabled(SURROGATION_CHECK.id, !isPreCheckVoiceEnabled(SURROGATION_CHECK.id))}
        />
        <VoiceRow
          label={ASSEMBLAGE_POINT_CHECK.name}
          enabled={isPreCheckVoiceEnabled(ASSEMBLAGE_POINT_CHECK.id)}
          onToggle={() =>
            setPreCheckVoiceEnabled(ASSEMBLAGE_POINT_CHECK.id, !isPreCheckVoiceEnabled(ASSEMBLAGE_POINT_CHECK.id))
          }
        />
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-3">Integration Affirmations</h2>
      <div className="space-y-2">
        {AFFIRMATIONS.map((voice) => (
          <VoiceRow
            key={voice.id}
            label={voice.statement}
            enabled={isAffirmationVoiceEnabled(voice.id)}
            onToggle={() => setAffirmationVoiceEnabled(voice.id, !isAffirmationVoiceEnabled(voice.id))}
          />
        ))}
      </div>
    </div>
  )
}
