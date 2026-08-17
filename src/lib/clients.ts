import { supabase } from './supabaseClient'
import type { Database } from '../types/database'
import type { Client, NewClientInput, SessionRecord, SessionRecordStatus } from '../context/ClientsContext'

type ClientRow = Database['public']['Tables']['clients']['Row']

function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth ?? '',
    contactEmail: row.contact_email ?? '',
    contactPhone: row.contact_phone ?? '',
    notes: row.notes ?? '',
    consentGiven: row.consent_given,
    consentGivenAt: row.consent_given_at,
    consentVersion: row.consent_version,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
  }
}

export async function fetchClients(practitionerId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('practitioner_id', practitionerId)
    .order('full_name', { ascending: true })
  if (error) throw error
  return (data ?? []).map(rowToClient)
}

export async function insertClient(practitionerId: string, input: NewClientInput): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      practitioner_id: practitionerId,
      full_name: input.fullName,
      date_of_birth: input.dateOfBirth || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      notes: input.notes,
      consent_given: input.consentGiven,
      consent_given_at: input.consentGivenAt,
      consent_version: input.consentVersion,
    })
    .select('*')
    .single()
  if (error) throw error
  return rowToClient(data)
}

export async function deleteClientRow(clientId: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', clientId)
  if (error) throw error
}

export async function fetchClientSessions(clientId: string): Promise<SessionRecord[]> {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, client_id, session_date, status')
    .eq('client_id', clientId)
    .order('session_date', { ascending: false })
  if (error) throw error

  const sessionIds = (sessions ?? []).map((s) => s.id)
  const counts = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: goalRows, error: goalsError } = await supabase
      .from('goals')
      .select('session_id')
      .in('session_id', sessionIds)
    if (goalsError) throw goalsError
    for (const row of goalRows ?? []) {
      counts.set(row.session_id, (counts.get(row.session_id) ?? 0) + 1)
    }
  }

  return (sessions ?? []).map((s) => ({
    id: s.id,
    clientId: s.client_id,
    sessionDate: s.session_date,
    status: s.status as SessionRecordStatus,
    goalCount: counts.get(s.id) ?? 0,
  }))
}

export async function insertSession(practitionerId: string, clientId: string, sessionId: string): Promise<void> {
  const { error } = await supabase.from('sessions').insert({
    id: sessionId,
    practitioner_id: practitionerId,
    client_id: clientId,
  })
  if (error) throw error
}

export async function updateSessionStatus(sessionId: string, status: SessionRecordStatus): Promise<void> {
  const { error } = await supabase.from('sessions').update({ status }).eq('id', sessionId)
  if (error) throw error
}
