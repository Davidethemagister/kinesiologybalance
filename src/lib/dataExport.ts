import { supabase } from './supabaseClient'
import { loadSessionState } from './loadSession'
import type { Client } from '../context/ClientsContext'

export async function exportClientData(client: Client): Promise<void> {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, session_date, status')
    .eq('client_id', client.id)
    .order('session_date', { ascending: false })
  if (error) throw error

  const fullSessions = await Promise.all(
    (sessions ?? []).map(async (s) => ({
      id: s.id,
      sessionDate: s.session_date,
      status: s.status,
      data: await loadSessionState(s.id),
    })),
  )

  const payload = { client, sessions: fullSessions, exportedAt: new Date().toISOString() }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${client.fullName.trim().replace(/\s+/g, '_') || 'client'}-export.json`
  a.click()
  URL.revokeObjectURL(url)
}
