import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'kinesio-settings-v1'

export interface VoiceSettingsState {
  preCheckVoices: Record<string, boolean>
  affirmationVoices: Record<string, boolean>
  interventionVoices: Record<string, boolean>
}

function defaultSettings(): VoiceSettingsState {
  return { preCheckVoices: {}, affirmationVoices: {}, interventionVoices: {} }
}

function loadSettings(): VoiceSettingsState {
  if (typeof window === 'undefined') return defaultSettings()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings()
    const parsed = JSON.parse(raw)
    return {
      preCheckVoices: parsed.preCheckVoices ?? {},
      affirmationVoices: parsed.affirmationVoices ?? {},
      interventionVoices: parsed.interventionVoices ?? {},
    }
  } catch {
    return defaultSettings()
  }
}

interface SettingsContextValue {
  settings: VoiceSettingsState
  isPreCheckVoiceEnabled: (voiceId: string) => boolean
  isAffirmationVoiceEnabled: (voiceId: string) => boolean
  isInterventionVoiceEnabled: (voiceId: string) => boolean
  setPreCheckVoiceEnabled: (voiceId: string, enabled: boolean) => void
  setAffirmationVoiceEnabled: (voiceId: string, enabled: boolean) => void
  setInterventionVoiceEnabled: (voiceId: string, enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<VoiceSettingsState>(loadSettings)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // localStorage unavailable (e.g. private browsing) — settings stay in-memory only
    }
  }, [settings])

  const value: SettingsContextValue = {
    settings,
    // absence of a key means "enabled" — so voices default on and newly added
    // voices don't require a settings migration
    isPreCheckVoiceEnabled: (voiceId) => settings.preCheckVoices[voiceId] ?? true,
    isAffirmationVoiceEnabled: (voiceId) => settings.affirmationVoices[voiceId] ?? true,
    isInterventionVoiceEnabled: (voiceId) => settings.interventionVoices[voiceId] ?? true,
    setPreCheckVoiceEnabled: (voiceId, enabled) =>
      setSettings((prev) => ({ ...prev, preCheckVoices: { ...prev.preCheckVoices, [voiceId]: enabled } })),
    setAffirmationVoiceEnabled: (voiceId, enabled) =>
      setSettings((prev) => ({ ...prev, affirmationVoices: { ...prev.affirmationVoices, [voiceId]: enabled } })),
    setInterventionVoiceEnabled: (voiceId, enabled) =>
      setSettings((prev) => ({ ...prev, interventionVoices: { ...prev.interventionVoices, [voiceId]: enabled } })),
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return ctx
}
