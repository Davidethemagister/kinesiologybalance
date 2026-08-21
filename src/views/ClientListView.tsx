import { useRef, useState } from 'react'
import { ClientFormModal } from '../components/ClientFormModal'
import { exportAllData, importAllData } from '../lib/dataExport'
import type { Client, NewClientInput } from '../context/ClientsContext'

interface ClientListViewProps {
  clients: Client[]
  onSelectClient: (id: string) => void
  onAddClient: (client: NewClientInput) => void
}

export function ClientListView({ clients, onSelectClient, onAddClient }: ClientListViewProps) {
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  async function handleImportFile(file: File) {
    if (!confirm('This replaces ALL local data with the contents of this backup file. Continue?')) return
    setImporting(true)
    try {
      await importAllData(file)
      window.location.reload()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to restore backup')
    } finally {
      setImporting(false)
    }
  }

  const activeClients = clients.filter((c) => !c.archivedAt)
  const filtered =
    query.trim() === ''
      ? activeClients
      : activeClients.filter((c) => c.fullName.toLowerCase().includes(query.trim().toLowerCase()))

  const sorted = [...filtered].sort((a, b) => a.fullName.localeCompare(b.fullName))

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between gap-3">
        <h1 className="text-lg md:text-xl font-extrabold text-slate-800">Clients</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => exportAllData()} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
            Backup
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={importing}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-50"
          >
            {importing ? 'Restoring…' : 'Restore'}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImportFile(file)
              e.target.value = ''
            }}
          />
        </div>
      </header>

      <div className="px-4 md:px-8 py-4 max-w-3xl w-full mx-auto flex-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients by name"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage mb-4"
        />

        {sorted.length === 0 && (
          <p className="text-slate-400 text-center py-12">
            {activeClients.length === 0 ? 'No clients yet — add your first one below.' : 'No clients match that search.'}
          </p>
        )}

        <div className="space-y-2">
          {sorted.map((client) => (
            <button
              key={client.id}
              onClick={() => onSelectClient(client.id)}
              className="w-full text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-sage transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-800 truncate">{client.fullName}</div>
                <div className="text-sm text-slate-500 truncate">
                  {client.contactEmail || client.contactPhone || 'No contact info'}
                </div>
              </div>
              <span className="text-slate-300 flex-shrink-0">›</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setAddOpen(true)}
          className="w-full mt-4 rounded-2xl border-2 border-dashed border-slate-300 py-4 text-slate-500 font-medium hover:border-sage hover:text-sage-dark transition-colors"
        >
          + Add Client
        </button>
      </div>

      <ClientFormModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSubmit={onAddClient} />
    </div>
  )
}
