import { useEffect, useState } from 'react'
import { Modal } from './ui/Modal'
import type { Client, NewClientInput } from '../context/ClientsContext'

const CONSENT_VERSION = '2026-08-v1'
const CONSENT_TEXT =
  'The client consents to their session notes being recorded and stored for the purpose of ongoing kinesiology care, and understands they can request a copy or deletion of their data at any time.'

export type EditableClientFields = Pick<
  Client,
  'fullName' | 'dateOfBirth' | 'contactEmail' | 'contactPhone' | 'notes'
>

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  // When set, the modal edits this client instead of creating a new one.
  client?: Client
  onCreate?: (client: NewClientInput) => void
  onUpdate?: (clientId: string, patch: EditableClientFields) => void
}

export function ClientFormModal({ isOpen, onClose, client, onCreate, onUpdate }: ClientFormModalProps) {
  const isEdit = !!client
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setFullName(client?.fullName ?? '')
    setDateOfBirth(client?.dateOfBirth ?? '')
    setContactEmail(client?.contactEmail ?? '')
    setContactPhone(client?.contactPhone ?? '')
    setNotes(client?.notes ?? '')
    setConsentChecked(false)
  }, [isOpen, client])

  const canSubmit = fullName.trim() !== '' && (isEdit || consentChecked)

  function handleSubmit() {
    if (!canSubmit) return
    const fields: EditableClientFields = {
      fullName: fullName.trim(),
      dateOfBirth,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      notes,
    }
    if (isEdit && client) {
      onUpdate?.(client.id, fields)
    } else {
      onCreate?.({
        ...fields,
        consentGiven: true,
        consentGivenAt: new Date().toISOString(),
        consentVersion: CONSENT_VERSION,
      })
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">{isEdit ? 'Edit Client' : 'New Client'}</h2>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Full name</label>
          <input
            autoFocus
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
            placeholder="Client's name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Date of birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Phone</label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
        </div>

        {isEdit ? (
          <p className="text-xs text-slate-400">
            Consent given {client?.consentGivenAt ? formatDate(client.consentGivenAt) : '—'}
            {client?.consentVersion ? ` · version ${client.consentVersion}` : ''}
          </p>
        ) : (
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-sage-dark flex-shrink-0"
            />
            <span className="text-sm text-slate-600">{CONSENT_TEXT}</span>
          </label>
        )}

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-slate-500 font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-sage px-4 py-3 font-semibold text-slate-900 disabled:opacity-40"
          >
            {isEdit ? 'Save Changes' : 'Add Client'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
