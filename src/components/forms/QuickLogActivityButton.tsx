'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, ChevronDown, Check, PhoneOff, Voicemail, XCircle, Calendar, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityOutcome, ActivityChannel, Owner, Activity } from '@/lib/supabase/types'

interface QuickLogActivityButtonProps {
  contactId: string
  opportunityId?: string | null
  defaultChannel?: ActivityChannel
  defaultOwner?: Owner
  onSuccess?: (activity: Activity) => void
  compact?: boolean
}

const QUICK_OUTCOMES: { outcome: ActivityOutcome; label: string; icon: typeof Phone; color: string }[] = [
  { outcome: 'No Answer', label: 'No Answer', icon: PhoneOff, color: 'text-gray-600' },
  { outcome: 'Voicemail', label: 'Voicemail', icon: Voicemail, color: 'text-yellow-600' },
  { outcome: 'Answered', label: 'Answered', icon: Check, color: 'text-green-600' },
  { outcome: 'Not Interested', label: 'Not Interested', icon: XCircle, color: 'text-red-600' },
  { outcome: 'Meeting Booked', label: 'Meeting Booked', icon: Calendar, color: 'text-purple-600' },
  { outcome: 'Left Message', label: 'Left Message', icon: MessageSquare, color: 'text-orange-600' },
]

export function QuickLogActivityButton({
  contactId,
  opportunityId,
  defaultChannel = 'Phone',
  defaultOwner = 'alex',
  onSuccess,
  compact = false,
}: QuickLogActivityButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuickLog = async (outcome: ActivityOutcome) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('activities')
      .insert({
        contact_id: contactId,
        opportunity_id: opportunityId || null,
        outcome,
        channel: defaultChannel,
        logged_by: defaultOwner,
      })
      .select()
      .single()

    if (error) {
      setLoading(false)
      alert('Error logging activity')
      return
    }

    // Update contact's last_contacted_at
    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', contactId)

    setLoading(false)
    setSuccess(true)
    setIsOpen(false)

    if (data) {
      onSuccess?.(data as unknown as Activity)
    }

    // Reset success state after animation
    setTimeout(() => setSuccess(false), 2000)
  }

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
          disabled={loading}
          className={`p-1.5 rounded transition ${
            success
              ? 'bg-green-100 text-green-600'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100'
          }`}
          title="Quick log activity"
        >
          {success ? (
            <Check className="w-4 h-4" />
          ) : loading ? (
            <div className="w-4 h-4 border-2 border-stone-300 border-t-[var(--color-primary)] rounded-full animate-spin" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-[var(--color-border)] py-1 z-20">
            <div className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
              Quick Log
            </div>
            {QUICK_OUTCOMES.map(({ outcome, label, icon: Icon, color }) => (
              <button
                key={outcome}
                onClick={(e) => {
                  e.stopPropagation()
                  handleQuickLog(outcome)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
              >
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
          success
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-stone-100 text-[var(--color-text-secondary)] hover:bg-stone-200 border border-[var(--color-border)]'
        }`}
      >
        {success ? (
          <>
            <Check className="w-4 h-4" />
            Logged!
          </>
        ) : loading ? (
          <>
            <div className="w-4 h-4 border-2 border-stone-300 border-t-[var(--color-primary)] rounded-full animate-spin" />
            Logging...
          </>
        ) : (
          <>
            <Phone className="w-4 h-4" />
            Quick Log
            <ChevronDown className="w-3 h-3" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-[var(--color-border)] py-1 z-20">
          <div className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
            Quick Log Activity
          </div>
          {QUICK_OUTCOMES.map(({ outcome, label, icon: Icon, color }) => (
            <button
              key={outcome}
              onClick={(e) => {
                e.stopPropagation()
                handleQuickLog(outcome)
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 flex items-center gap-2"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
