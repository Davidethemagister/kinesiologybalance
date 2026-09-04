import { db, PRACTITIONER_ID, GOAL_KEYED_TABLES, type ClientRow } from './db'
import { genId } from '../utils/id'
import type { Client, NewClientInput, SessionRecord, SessionRecordStatus } from '../context/ClientsContext'

function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    fullName: row.fullName,
    dateOfBirth: row.dateOfBirth,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    notes: row.notes,
    consentGiven: row.consentGiven,
    consentGivenAt: row.consentGivenAt,
    consentVersion: row.consentVersion,
    archivedAt: row.archivedAt,
    createdAt: row.createdAt,
  }
}

export async function fetchClients(): Promise<Client[]> {
  const rows = await db.clients.where('practitionerId').equals(PRACTITIONER_ID).toArray()
  return rows.map(rowToClient).sort((a, b) => a.fullName.localeCompare(b.fullName))
}

export async function insertClient(input: NewClientInput): Promise<Client> {
  const row: ClientRow = {
    id: genId(),
    practitionerId: PRACTITIONER_ID,
    fullName: input.fullName,
    dateOfBirth: input.dateOfBirth,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    notes: input.notes,
    consentGiven: input.consentGiven,
    consentGivenAt: input.consentGivenAt,
    consentVersion: input.consentVersion,
    archivedAt: null,
    createdAt: new Date().toISOString(),
  }
  await db.clients.add(row)
  return rowToClient(row)
}

export async function updateClientRow(
  clientId: string,
  patch: Partial<Pick<ClientRow, 'fullName' | 'dateOfBirth' | 'contactEmail' | 'contactPhone' | 'notes'>>,
): Promise<void> {
  await db.clients.update(clientId, patch)
}

export async function setClientArchived(clientId: string, archived: boolean): Promise<void> {
  await db.clients.update(clientId, { archivedAt: archived ? new Date().toISOString() : null })
}

export async function deleteClientRow(clientId: string): Promise<void> {
  const sessionIds = await db.sessions.where('clientId').equals(clientId).primaryKeys()
  const roundIds = sessionIds.length
    ? await db.preCheckRounds.where('sessionId').anyOf(sessionIds).primaryKeys()
    : []
  const goalIds = sessionIds.length ? await db.goals.where('sessionId').anyOf(sessionIds).primaryKeys() : []
  const integrationCheckIds = goalIds as string[] // affirmations are keyed by integrationCheckId, which equals goalId

  await db.transaction(
    'rw',
    [db.clients, db.sessions, db.preCheckRounds, db.preChecks, db.goals, db.affirmations, ...GOAL_KEYED_TABLES],
    async () => {
      await db.clients.delete(clientId)
      await db.sessions.bulkDelete(sessionIds)
      await db.preCheckRounds.bulkDelete(roundIds)
      if (roundIds.length) await db.preChecks.where('roundId').anyOf(roundIds).delete()
      await db.goals.bulkDelete(goalIds)
      if (integrationCheckIds.length) await db.affirmations.where('integrationCheckId').anyOf(integrationCheckIds).delete()
      for (const table of GOAL_KEYED_TABLES) await table.bulkDelete(goalIds)
    },
  )
}

export async function fetchClientSessions(clientId: string): Promise<SessionRecord[]> {
  const sessions = await db.sessions.where('clientId').equals(clientId).toArray()
  const sessionIds = sessions.map((s) => s.id)
  const goalRows = sessionIds.length ? await db.goals.where('sessionId').anyOf(sessionIds).toArray() : []
  const counts = new Map<string, number>()
  for (const row of goalRows) {
    counts.set(row.sessionId, (counts.get(row.sessionId) ?? 0) + 1)
  }

  return sessions
    .map((s) => ({
      id: s.id,
      clientId: s.clientId,
      sessionDate: s.sessionDate,
      status: s.status as SessionRecordStatus,
      goalCount: counts.get(s.id) ?? 0,
    }))
    .sort((a, b) => (a.sessionDate < b.sessionDate ? 1 : -1))
}

export async function insertSession(clientId: string, sessionId: string): Promise<void> {
  await db.sessions.add({
    id: sessionId,
    practitionerId: PRACTITIONER_ID,
    clientId,
    sessionDate: new Date().toISOString(),
    status: 'in_progress',
    activeGoalId: null,
    activePreCheckRoundId: null,
  })
}

export async function updateSessionStatus(sessionId: string, status: SessionRecordStatus): Promise<void> {
  await db.sessions.update(sessionId, { status })
}

export async function deleteSessionRow(sessionId: string): Promise<void> {
  const roundIds = await db.preCheckRounds.where('sessionId').equals(sessionId).primaryKeys()
  const goalIds = await db.goals.where('sessionId').equals(sessionId).primaryKeys()

  await db.transaction(
    'rw',
    [db.sessions, db.preCheckRounds, db.preChecks, db.goals, db.affirmations, ...GOAL_KEYED_TABLES],
    async () => {
      await db.sessions.delete(sessionId)
      if (roundIds.length) await db.preChecks.where('roundId').anyOf(roundIds).delete()
      await db.preCheckRounds.bulkDelete(roundIds)
      if (goalIds.length) await db.affirmations.where('integrationCheckId').anyOf(goalIds).delete()
      for (const table of GOAL_KEYED_TABLES) await table.bulkDelete(goalIds)
      await db.goals.bulkDelete(goalIds)
    },
  )
}
