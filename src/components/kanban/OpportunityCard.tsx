'use client'

import { format } from 'date-fns'
import { User, Calendar, DollarSign, Clock } from 'lucide-react'
import type { Opportunity, Contact, LeadScore } from '@/lib/supabase/types'
import { QuickLogActivityButton } from '@/components/forms/QuickLogActivityButton'

interface OpportunityWithContact extends Opportunity {
  contact: Contact
}

interface OpportunityCardProps {
  opportunity: OpportunityWithContact
  isDragging: boolean
  onClick?: () => void
  onActivityLogged?: () => void
}

const getLeadScoreBorderColor = (score: LeadScore | null) => {
  switch (score) {
    case 'hot':
      return 'border-l-red-500'
    case 'warm':
      return 'border-l-orange-500'
    case 'cold':
      return 'border-l-blue-500'
    default:
      return 'border-l-gray-300'
  }
}

export function OpportunityCard({ opportunity, isDragging, onClick, onActivityLogged }: OpportunityCardProps) {
  const isOverdue =
    opportunity.next_follow_up_date &&
    new Date(opportunity.next_follow_up_date) < new Date()

  const contact = opportunity.contact
  const leadScoreBorder = getLeadScoreBorderColor(contact?.lead_score || null)

  // Calculate days since last contact
  const daysSinceLastContact = contact?.last_contacted_at
    ? Math.floor((new Date().getTime() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.()
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 border-l-4 ${leadScoreBorder} cursor-pointer hover:shadow-md transition ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="font-medium text-gray-900">
          {contact?.name || 'Unknown Contact'}
        </div>
        {contact && (
          <div onClick={(e) => e.stopPropagation()}>
            <QuickLogActivityButton
              contactId={contact.id}
              opportunityId={opportunity.id}
              defaultOwner={opportunity.owner}
              compact
              onSuccess={onActivityLogged}
            />
          </div>
        )}
      </div>

      {contact?.business_name && (
        <div className="text-sm text-gray-500 mb-2">
          {contact.business_name}
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
            opportunity.owner === 'alex'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          <User className="w-3 h-3" />
          {opportunity.owner.charAt(0).toUpperCase() + opportunity.owner.slice(1)}
        </span>

        {opportunity.opportunity_value && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700">
            <DollarSign className="w-3 h-3" />
            {Number(opportunity.opportunity_value).toLocaleString('en-US')}
          </span>
        )}

        {opportunity.next_follow_up_date && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              isOverdue
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {format(new Date(opportunity.next_follow_up_date), 'MMM d')}
          </span>
        )}

        {daysSinceLastContact !== null && (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
            daysSinceLastContact > 14 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'
          }`}>
            <Clock className="w-3 h-3" />
            {daysSinceLastContact}d
          </span>
        )}
      </div>
    </div>
  )
}
