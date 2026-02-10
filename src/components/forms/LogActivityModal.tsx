'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Activity, ActivityOutcome, ActivityChannel, Owner, Opportunity } from '@/lib/supabase/types'

interface LogActivityModalProps {
  contactId: string
  opportunities: Opportunity[]
  onClose: () => void
  onSuccess: (activity: Activity) => void
}

const OUTCOMES: ActivityOutcome[] = [
  'Answered',
  'No Answer',
  'Voicemail',
  'Not Interested',
  'Callback',
  'Meeting Booked',
  'Left Message',
  'Wrong Number',
]

const CHANNELS: ActivityChannel[] = ['Phone', 'LinkedIn', 'Email']

export function LogActivityModal({
  contactId,
  opportunities,
  onClose,
  onSuccess,
}: LogActivityModalProps) {
  const [outcome, setOutcome] = useState<ActivityOutcome>('Answered')
  const [channel, setChannel] = useState<ActivityChannel>('Phone')
  const [notes, setNotes] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [nextFollowUp, setNextFollowUp] = useState('')
  const [loggedBy, setLoggedBy] = useState<Owner>('alex')
  const [opportunityId, setOpportunityId] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('activities')
      .insert({
        contact_id: contactId,
        opportunity_id: opportunityId || null,
        outcome,
        channel,
        notes: notes || null,
        next_action: nextAction || null,
        logged_by: loggedBy,
      })
      .select()
      .single()

    if (error || !data) {
      setLoading(false)
      alert('Error logging activity')
      return
    }

    // Update opportunity's next follow-up date if provided
    if (opportunityId && nextFollowUp) {
      await supabase
        .from('opportunities')
        .update({ next_follow_up_date: nextFollowUp })
        .eq('id', opportunityId)
    }

    // Update contact's last_contacted_at
    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', contactId)

    onSuccess(data as unknown as Activity)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Log Activity</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outcome *
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value as ActivityOutcome)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel *
            </label>
            <div className="flex gap-2">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setChannel(c)}
                  className={`flex-1 px-3 py-2 rounded-lg border transition ${
                    channel === c
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Add any notes about this interaction..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Action
            </label>
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="What's the next step?"
            />
          </div>

          {opportunities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Opportunity
              </label>
              <select
                value={opportunityId}
                onChange={(e) => setOpportunityId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Follow-up Date
            </label>
            <input
              type="date"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logged By *
            </label>
            <select
              value={loggedBy}
              onChange={(e) => setLoggedBy(e.target.value as Owner)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="alex">Alex</option>
              <option value="mikail">Mikail</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
