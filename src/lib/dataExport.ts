import { db, PRACTITIONER_ID } from './db'
import { loadSessionState } from './loadSession'
import type { Client } from '../context/ClientsContext'

function download(payload: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportClientData(client: Client): Promise<void> {
  const sessions = await db.sessions.where('clientId').equals(client.id).toArray()
  const fullSessions = await Promise.all(
    sessions.map(async (s) => ({
      id: s.id,
      sessionDate: s.sessionDate,
      status: s.status,
      data: await loadSessionState(s.id),
    })),
  )
  download(
    { client, sessions: fullSessions, exportedAt: new Date().toISOString() },
    `${client.fullName.trim().replace(/\s+/g, '_') || 'client'}-export.json`,
  )
}

const BACKUP_TABLES = [
  'clients',
  'sessions',
  'preCheckRounds',
  'preChecks',
  'goals',
  'integrationChecks',
  'affirmations',
  'potCreations',
  'closings',
  'interventions',
] as const

type BackupPayload = {
  version: 1
  exportedAt: string
  practitionerId: string
  tables: Record<(typeof BACKUP_TABLES)[number], unknown[]>
}

// Whole-database backup — there's no cloud copy of this data anymore, so this
// is the practitioner's own safety net. Restoring wipes and replaces every
// local table, so the caller must confirm with the user first.
export async function exportAllData(): Promise<void> {
  const tables = {} as BackupPayload['tables']
  for (const name of BACKUP_TABLES) {
    tables[name] = await db.table(name).toArray()
  }
  download(
    { version: 1, exportedAt: new Date().toISOString(), practitionerId: PRACTITIONER_ID, tables },
    `kinesio-session-backup-${new Date().toISOString().slice(0, 10)}.json`,
  )
}

export async function importAllData(file: File): Promise<void> {
  const text = await file.text()
  const payload = JSON.parse(text) as BackupPayload
  if (payload.version !== 1 || !payload.tables) {
    throw new Error('Unrecognized backup file format')
  }

  await db.transaction('rw', BACKUP_TABLES.map((name) => db.table(name)), async () => {
    for (const name of BACKUP_TABLES) {
      await db.table(name).clear()
      const rows = payload.tables[name]
      if (Array.isArray(rows) && rows.length) await db.table(name).bulkAdd(rows)
    }
  })
}
