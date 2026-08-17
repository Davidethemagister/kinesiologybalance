import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { genId } from '../utils/id'
import { createInitialSessionState } from './SessionContext'
import { saveSessionState } from '../lib/sessionSync'
import * as clientsApi from '../lib/clients'

export interface Client {
  id: string
  fullName: string
  dateOfBirth: string
  contactEmail: string
  contactPhone: string
  notes: string
  consentGiven: boolean
  consentGivenAt: string | null
  consentVersion: string | null
  archivedAt: string | null
  createdAt: string
}

export type SessionRecordStatus = 'in_progress' | 'completed'

// Lightweight session metadata for list/history display. Full per-panel data
// (SessionState) is loaded separately, only for the one session actually open
// — see src/lib/loadSession.ts — so opening a client with a long history
// doesn't pull every past visit's full data at once.
export interface SessionRecord {
  id: string
  clientId: string
  sessionDate: string
  status: SessionRecordStatus
  goalCount: number
}

export type NewClientInput = Omit<Client, 'id' | 'createdAt' | 'archivedAt'>

interface ClientsContextValue {
  clients: Client[]
  loading: boolean
  sessionsByClient: Record<string, SessionRecord[] | undefined>
  loadSessionsForClient: (clientId: string) => Promise<void>
  addClient: (input: NewClientInput) => Promise<Client>
  removeClient: (clientId: string) => Promise<void>
  startSession: (clientId: string) => Promise<string>
  setSessionStatus: (sessionId: string, clientId: string, status: SessionRecordStatus) => Promise<void>
}

const ClientsContext = createContext<ClientsContextValue | null>(null)

export function ClientsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionsByClient, setSessionsByClient] = useState<Record<string, SessionRecord[] | undefined>>({})

  useEffect(() => {
    if (!user) {
      setClients([])
      setSessionsByClient({})
      return
    }
    setLoading(true)
    clientsApi
      .fetchClients(user.id)
      .then(setClients)
      .finally(() => setLoading(false))
  }, [user])

  async function loadSessionsForClient(clientId: string) {
    const rows = await clientsApi.fetchClientSessions(clientId)
    setSessionsByClient((prev) => ({ ...prev, [clientId]: rows }))
  }

  async function addClient(input: NewClientInput): Promise<Client> {
    if (!user) throw new Error('Not signed in')
    const client = await clientsApi.insertClient(user.id, input)
    setClients((prev) => [...prev, client].sort((a, b) => a.fullName.localeCompare(b.fullName)))
    return client
  }

  async function removeClient(clientId: string): Promise<void> {
    await clientsApi.deleteClientRow(clientId)
    setClients((prev) => prev.filter((c) => c.id !== clientId))
    setSessionsByClient((prev) => {
      const next = { ...prev }
      delete next[clientId]
      return next
    })
  }

  async function startSession(clientId: string): Promise<string> {
    if (!user) throw new Error('Not signed in')
    const sessionId = genId()
    await clientsApi.insertSession(user.id, clientId, sessionId)
    // Seed the session's first pre-check round immediately so re-opening it
    // (even before any edits) always finds a populated, well-formed state.
    await saveSessionState(sessionId, createInitialSessionState())
    await loadSessionsForClient(clientId)
    return sessionId
  }

  async function setSessionStatus(sessionId: string, clientId: string, status: SessionRecordStatus): Promise<void> {
    await clientsApi.updateSessionStatus(sessionId, status)
    setSessionsByClient((prev) => {
      const list = prev[clientId]
      if (!list) return prev
      return { ...prev, [clientId]: list.map((s) => (s.id === sessionId ? { ...s, status } : s)) }
    })
  }

  const value: ClientsContextValue = {
    clients,
    loading,
    sessionsByClient,
    loadSessionsForClient,
    addClient,
    removeClient,
    startSession,
    setSessionStatus,
  }

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
}

export function useClients(): ClientsContextValue {
  const ctx = useContext(ClientsContext)
  if (!ctx) {
    throw new Error('useClients must be used within a ClientsProvider')
  }
  return ctx
}
