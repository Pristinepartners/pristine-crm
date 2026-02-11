'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Appointment, AppointmentStatus, Opportunity } from '@/lib/supabase/types'

interface AddAppointmentModalProps {
  contactId: string
  opportunities: Opportunity[]
  onClose: () => void
  onSuccess: (appointment: Appointment) => void
}

export function AddAppointmentModal({
  contactId,
  opportunities,
  onClose,
  onSuccess,
}: AddAppointmentModalProps) {
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('scheduled')
  const [opportunityId, setOpportunityId] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        contact_id: contactId,
        opportunity_id: opportunityId || null,
        title,
        datetime,
        location: location || null,
        status,
      })
      .select()
      .single()

    if (error || !data) {
      setLoading(false)
      alert('Error creating appointment')
      return
    }

    onSuccess(data as unknown as Appointment)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Add Appointment</h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              placeholder="Sales Call, Demo, etc."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              placeholder="Zoom, Office, Phone, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {opportunities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Link to Opportunity
              </label>
              <select
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              >
                <option value="">No opportunity</option>
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.pipeline?.name} - {opp.stage}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {loading ? 'Adding...' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
