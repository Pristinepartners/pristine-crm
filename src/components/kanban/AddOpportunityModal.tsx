'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Contact, Owner } from '@/lib/supabase/types'

interface AddOpportunityModalProps {
  pipelineId: string
  stage: string
  onClose: () => void
  onSuccess: () => void
}

export function AddOpportunityModal({
  pipelineId,
  stage,
  onClose,
  onSuccess,
}: AddOpportunityModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContactId, setSelectedContactId] = useState('')
  const [owner, setOwner] = useState<Owner>('alex')
  const [opportunityValue, setOpportunityValue] = useState('')
  const [nextFollowUp, setNextFollowUp] = useState('')
  const [loading, setLoading] = useState(false)
  const [createNewContact, setCreateNewContact] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactBusiness, setNewContactBusiness] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchContacts() {
      const { data } = await supabase
        .from('contacts')
        .select('*')
        .order('name')
      if (data) setContacts(data as unknown as Contact[])
    }
    fetchContacts()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let contactId = selectedContactId

    // Create new contact if needed
    if (createNewContact) {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          name: newContactName,
          email: newContactEmail || null,
          phone: newContactPhone || null,
          business_name: newContactBusiness || null,
          owner,
          organization_id: crypto.randomUUID(),
        })
        .select()
        .single()

      if (contactError || !newContact) {
        setLoading(false)
        alert('Error creating contact')
        return
      }
      contactId = newContact.id
    }

    if (!contactId) {
      setLoading(false)
      alert('Please select or create a contact')
      return
    }

    const { error } = await supabase.from('opportunities').insert({
      contact_id: contactId,
      pipeline_id: pipelineId,
      stage,
      owner,
      opportunity_value: opportunityValue ? parseFloat(opportunityValue) : null,
      next_follow_up_date: nextFollowUp || null,
    })

    if (error) {
      setLoading(false)
      alert('Error creating opportunity')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Add Opportunity to {stage}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={createNewContact}
                onChange={(e) => setCreateNewContact(e.target.checked)}
                className="rounded border-[var(--color-border-strong)]"
              />
              <span className="text-sm font-medium text-[var(--color-text)]">
                Create new contact
              </span>
            </label>
          </div>

          {createNewContact ? (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={newContactBusiness}
                  onChange={(e) => setNewContactBusiness(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Contact *
              </label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                required={!createNewContact}
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                    {contact.business_name ? ` - ${contact.business_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Owner *
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value as Owner)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              required
            >
              <option value="alex">Alex</option>
              <option value="mikail">Mikail</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Opportunity Value
            </label>
            <input
              type="number"
              value={opportunityValue}
              onChange={(e) => setOpportunityValue(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              placeholder="0.00"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Next Follow-up
            </label>
            <input
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
