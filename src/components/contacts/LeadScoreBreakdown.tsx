'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Activity, Calendar, Clock, Briefcase, TrendingUp } from 'lucide-react'
import type { LeadScore, Activity as ActivityType, Appointment, Opportunity } from '@/lib/supabase/types'

interface LeadScoreBreakdownProps {
  leadScore: LeadScore | null
  activities: ActivityType[]
  appointments: Appointment[]
  opportunities: Opportunity[]
  lastContactedAt: string | null
}

const getScoreColor = (score: LeadScore | null) => {
  switch (score) {
    case 'hot':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'warm':
      return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'cold':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function LeadScoreBreakdown({
  leadScore,
  activities,
  appointments,
  opportunities,
  lastContactedAt,
}: LeadScoreBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate score components
  const activityCount = activities.length
  const activityPoints = Math.min(activityCount * 5, 30)

  const meetingsBooked = activities.filter(a => a.outcome === 'Meeting Booked').length
  const meetingPoints = Math.min(meetingsBooked * 10, 30)

  const positiveOutcomes = activities.filter(a => ['Answered', 'Callback'].includes(a.outcome)).length
  const positivePoints = Math.min(positiveOutcomes * 3, 15)

  let recencyPoints = 0
  let daysSinceContact: number | null = null
  if (lastContactedAt) {
    daysSinceContact = Math.floor((new Date().getTime() - new Date(lastContactedAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceContact <= 7) recencyPoints = 15
    else if (daysSinceContact <= 14) recencyPoints = 10
    else if (daysSinceContact <= 30) recencyPoints = 5
    else recencyPoints = -10
  }

  const inPipeline = opportunities.length > 0
  let pipelinePoints = inPipeline ? 10 : 0
  if (inPipeline) {
    const latestOpp = opportunities[0]
    const stage = latestOpp?.stage || ''
    if (['Proposal', 'Negotiation', 'Closed Won'].includes(stage)) {
      pipelinePoints += 15
    } else if (['Discovery', 'Demo', 'Trial'].includes(stage)) {
      pipelinePoints += 10
    }
  }

  const completedAppointments = appointments.filter(a => a.status === 'completed').length
  const appointmentPoints = completedAppointments > 0 ? 15 : 0

  const totalScore = activityPoints + meetingPoints + positivePoints + recencyPoints + pipelinePoints + appointmentPoints

  const scoreItems = [
    {
      icon: Activity,
      label: 'Activities',
      detail: `${activityCount} logged`,
      points: activityPoints,
      max: 30,
    },
    {
      icon: Calendar,
      label: 'Meetings Booked',
      detail: `${meetingsBooked} meetings`,
      points: meetingPoints,
      max: 30,
    },
    {
      icon: TrendingUp,
      label: 'Positive Outcomes',
      detail: `${positiveOutcomes} positive`,
      points: positivePoints,
      max: 15,
    },
    {
      icon: Clock,
      label: 'Contact Recency',
      detail: daysSinceContact !== null ? `${daysSinceContact} days ago` : 'Never contacted',
      points: recencyPoints,
      max: 15,
    },
    {
      icon: Briefcase,
      label: 'Pipeline Stage',
      detail: inPipeline ? opportunities[0]?.stage || 'In pipeline' : 'Not in pipeline',
      points: pipelinePoints,
      max: 25,
    },
    {
      icon: Calendar,
      label: 'Completed Appointments',
      detail: `${completedAppointments} completed`,
      points: appointmentPoints,
      max: 15,
    },
  ]

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(leadScore)}`}>
            {leadScore ? leadScore.charAt(0).toUpperCase() + leadScore.slice(1) : 'Not Scored'}
          </span>
          <span className="text-sm text-gray-500">
            Score: {totalScore} pts
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mt-3 mb-2">
            Score Breakdown (Hot: 60+, Warm: 30-59, Cold: &lt;30)
          </div>
          <div className="space-y-2">
            {scoreItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <item.icon className="w-4 h-4 text-gray-400" />
                  <span>{item.label}</span>
                  <span className="text-gray-400">({item.detail})</span>
                </div>
                <span className={`font-medium ${item.points > 0 ? 'text-green-600' : item.points < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}/{item.max}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between font-medium">
            <span className="text-gray-700">Total Score</span>
            <span className="text-gray-900">{totalScore} pts</span>
          </div>
        </div>
      )}
    </div>
  )
}
