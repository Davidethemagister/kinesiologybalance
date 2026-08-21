import { useState } from 'react'
import type { Client, SessionRecord } from '../context/ClientsContext'

interface ClientDetailViewProps {
  client: Client
  sessions: SessionRecord[]
  onBack: () => void
  onStartSession: () => void
  onOpenSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onDeleteClient: () => void
  onExportClient: () => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ClientDetailView({
  client,
  sessions,
  onBack,
  onStartSession,
  onOpenSession,
  onDeleteSession,
  onDeleteClient,
  onExportClient,
}: ClientDetailViewProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null)
  const sessionToDelete = sessions.find((s) => s.id === deleteSessionId) ?? null

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-sm font-semibold text-sage-dark flex-shrink-0">
          ← Clients
        </button>
      </header>

      <div className="px-4 md:px-8 py-6 max-w-3xl w-full mx-auto flex-1">
        <h1 className="text-2xl font-bold text-slate-800">{client.fullName}</h1>
        <div className="text-sm text-slate-500 mt-1 space-x-3">
          {client.dateOfBirth && <span>DOB {client.dateOfBirth}</span>}
          {client.contactEmail && <span>{client.contactEmail}</span>}
          {client.contactPhone && <span>{client.contactPhone}</span>}
        </div>
        {client.notes && <p className="text-sm text-slate-500 mt-2">{client.notes}</p>}
        <p className="text-xs text-slate-400 mt-2">
          Consent given {client.consentGivenAt ? formatDate(client.consentGivenAt) : '—'}
          {client.consentVersion ? ` · version ${client.consentVersion}` : ''}
        </p>

        <button
          onClick={onStartSession}
          className="w-full mt-6 rounded-2xl bg-sage text-slate-900 font-semibold py-4 hover:brightness-95 transition"
        >
          + Start New Session
        </button>

        <h2 className="text-lg font-semibold text-slate-800 mt-8 mb-3">Session History</h2>
        {sessions.length === 0 && <p className="text-slate-400">No sessions yet.</p>}
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="w-full bg-white rounded-2xl border border-slate-200 hover:border-sage transition-colors flex items-center gap-3"
            >
              <button
                onClick={() => onOpenSession(session.id)}
                className="flex-1 min-w-0 text-left p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-slate-800">{formatDate(session.sessionDate)}</div>
                  <div className="text-sm text-slate-500">{session.goalCount} goal(s)</div>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${
                    session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {session.status === 'completed' ? 'Completed' : 'In progress'}
                </span>
              </button>
              <button
                onClick={() => setDeleteSessionId(session.id)}
                aria-label="Delete session"
                className="flex-shrink-0 h-9 w-9 mr-3 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onExportClient}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-slate-600 font-medium"
          >
            Export Data (JSON)
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex-1 rounded-xl bg-rose-50 px-4 py-3 text-rose-700 font-medium"
          >
            Delete Client
          </button>
        </div>

        {sessionToDelete && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDeleteSessionId(null)} />
            <div className="relative bg-cream rounded-3xl shadow-xl p-6 w-full max-w-sm">
              <p className="text-lg font-medium text-slate-800 mb-2">Delete this session?</p>
              <p className="text-sm text-slate-500 mb-4">
                The session from {formatDate(sessionToDelete.sessionDate)} and everything recorded in it will be
                permanently deleted. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteSessionId(null)}
                  className="flex-1 rounded-2xl py-3 font-semibold bg-slate-100 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteSession(sessionToDelete.id)
                    setDeleteSessionId(null)
                  }}
                  className="flex-1 rounded-2xl py-3 font-semibold bg-rose-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDeleteOpen(false)} />
            <div className="relative bg-cream rounded-3xl shadow-xl p-6 w-full max-w-sm">
              <p className="text-lg font-medium text-slate-800 mb-2">Delete {client.fullName}?</p>
              <p className="text-sm text-slate-500 mb-4">
                This permanently deletes this client and all {sessions.length} session(s) of their history. This
                cannot be undone. Type their name to confirm.
              </p>
              <input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={client.fullName}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-rose-300 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteOpen(false)
                    setConfirmName('')
                  }}
                  className="flex-1 rounded-2xl py-3 font-semibold bg-slate-100 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={onDeleteClient}
                  disabled={confirmName.trim() !== client.fullName.trim()}
                  className="flex-1 rounded-2xl py-3 font-semibold bg-rose-500 text-white disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
