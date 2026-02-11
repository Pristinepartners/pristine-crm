'use client'

import { useState } from 'react'
import { format, isToday, isYesterday, differenceInDays, parseISO } from 'date-fns'
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  List,
  GitBranch,
} from 'lucide-react'
import type { Activity, Appointment } from '@/lib/supabase/types'

interface TimelineEvent {
  id: string
  type: 'activity' | 'appointment' | 'created'
  date: Date
  data: Activity | Appointment | { created_at: string }
}

interface ContactTimelineProps {
  activities: Activity[]
  appointments: Appointment[]
  contactCreatedAt: string
}

const getOutcomeColor = (outcome: string) => {
  const colors: Record<string, string> = {
    Answered: 'bg-green-100 text-green-700 border-green-200',
    'No Answer': 'bg-gray-100 text-[var(--color-text)] border-[var(--color-border)]',
    Voicemail: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Not Interested': 'bg-red-100 text-red-700 border-red-200',
    Callback: 'bg-blue-100 text-blue-700 border-blue-200',
    'Meeting Booked': 'bg-purple-100 text-purple-700 border-purple-200',
    'Left Message': 'bg-orange-100 text-orange-700 border-orange-200',
    'Wrong Number': 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[outcome] || 'bg-gray-100 text-[var(--color-text)] border-[var(--color-border)]'
}

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case 'Phone':
      return Phone
    case 'Email':
      return Mail
    case 'LinkedIn':
      return MessageSquare
    default:
      return Phone
  }
}

const getAppointmentStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return CheckCircle
    case 'cancelled':
      return XCircle
    case 'no_show':
      return XCircle
    default:
      return Clock
  }
}

const getAppointmentStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500'
    case 'cancelled':
      return 'bg-red-500'
    case 'no_show':
      return 'bg-orange-500'
    default:
      return 'bg-[var(--color-primary)]'
  }
}

const formatDateHeader = (date: Date) => {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  const daysDiff = differenceInDays(new Date(), date)
  if (daysDiff < 7) return format(date, 'EEEE')
  return format(date, 'MMMM d, yyyy')
}

export function ContactTimeline({
  activities,
  appointments,
  contactCreatedAt,
}: ContactTimelineProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')

  // Combine and sort all events
  const events: TimelineEvent[] = [
    ...activities.map(a => ({
      id: `activity-${a.id}`,
      type: 'activity' as const,
      date: parseISO(a.logged_at),
      data: a,
    })),
    ...appointments.map(a => ({
      id: `appointment-${a.id}`,
      type: 'appointment' as const,
      date: parseISO(a.datetime),
      data: a,
    })),
    {
      id: 'created',
      type: 'created' as const,
      date: parseISO(contactCreatedAt),
      data: { created_at: contactCreatedAt },
    },
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  // Group events by date
  const groupedEvents: { [key: string]: TimelineEvent[] } = {}
  events.forEach(event => {
    const dateKey = format(event.date, 'yyyy-MM-dd')
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = []
    }
    groupedEvents[dateKey].push(event)
  })

  const renderActivityEvent = (activity: Activity) => {
    const ChannelIcon = getChannelIcon(activity.channel)
    return (
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(activity.outcome)}`}>
            {activity.outcome}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-stone-100 text-[var(--color-text-secondary)]">
            <ChannelIcon className="w-3 h-3" />
            {activity.channel}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {format(parseISO(activity.logged_at), 'h:mm a')}
          </span>
        </div>
        {activity.notes && (
          <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{activity.notes}</p>
        )}
        {activity.next_action && (
          <p className="mt-1 text-sm" style={{ color: 'var(--color-primary)' }}>Next: {activity.next_action}</p>
        )}
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          by {activity.logged_by.charAt(0).toUpperCase() + activity.logged_by.slice(1)}
        </p>
      </div>
    )
  }

  const renderAppointmentEvent = (appointment: Appointment) => {
    const StatusIcon = getAppointmentStatusIcon(appointment.status)
    return (
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[var(--color-text)]">{appointment.title}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            appointment.status === 'completed' ? 'bg-green-100 text-green-700' :
            appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            appointment.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            <StatusIcon className="w-3 h-3" />
            {appointment.status.replace('_', ' ')}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {format(parseISO(appointment.datetime), 'h:mm a')}
          {appointment.location && ` - ${appointment.location}`}
        </p>
      </div>
    )
  }

  const renderEvent = (event: TimelineEvent) => {
    const getIconBg = () => {
      if (event.type === 'activity') {
        const activity = event.data as Activity
        if (activity.outcome === 'Meeting Booked') return 'bg-purple-500'
        if (activity.outcome === 'Answered') return 'bg-green-500'
        if (['Not Interested', 'Wrong Number'].includes(activity.outcome)) return 'bg-red-500'
        return 'bg-[var(--color-primary)]'
      }
      if (event.type === 'appointment') {
        return getAppointmentStatusColor((event.data as Appointment).status)
      }
      return 'bg-gray-400'
    }

    const getIcon = () => {
      if (event.type === 'activity') {
        const activity = event.data as Activity
        const ChannelIcon = getChannelIcon(activity.channel)
        return <ChannelIcon className="w-3 h-3 text-white" />
      }
      if (event.type === 'appointment') {
        return <Calendar className="w-3 h-3 text-white" />
      }
      return <UserPlus className="w-3 h-3 text-white" />
    }

    return (
      <div key={event.id} className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 w-0.5 bg-[var(--color-border)] my-1" />
        </div>
        <div className="flex-1 pb-4">
          {event.type === 'activity' && renderActivityEvent(event.data as Activity)}
          {event.type === 'appointment' && renderAppointmentEvent(event.data as Appointment)}
          {event.type === 'created' && (
            <div className="text-sm text-[var(--color-text-secondary)]">
              Contact created
              <span className="text-xs text-[var(--color-text-muted)] ml-2">
                {format(event.date, 'h:mm a')}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (events.length === 1 && events[0].type === 'created') {
    return (
      <div className="text-center py-8 text-[var(--color-text-secondary)]">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
        <p>No activities or appointments yet</p>
        <p className="text-sm mt-1">Start logging interactions to build a timeline</p>
      </div>
    )
  }

  return (
    <div>
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('timeline')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
            viewMode === 'timeline'
              ? 'bg-amber-50/50 text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:bg-stone-100'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Timeline
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition ${
            viewMode === 'list'
              ? 'bg-amber-50/50 text-[var(--color-primary)]'
              : 'text-[var(--color-text-secondary)] hover:bg-stone-100'
          }`}
        >
          <List className="w-4 h-4" />
          List
        </button>
      </div>

      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          {Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
            <div key={dateKey}>
              <div className="sticky top-0 bg-white py-2 z-10">
                <span className="text-sm font-medium text-[var(--color-text)] bg-stone-100 px-3 py-1 rounded-full">
                  {formatDateHeader(parseISO(dateKey))}
                </span>
              </div>
              <div className="mt-2">
                {dateEvents.map(event => renderEvent(event))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div
              key={event.id}
              className="p-3 bg-stone-50 rounded-lg border border-[var(--color-border)]"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  event.type === 'activity' ? 'bg-amber-50/50' :
                  event.type === 'appointment' ? 'bg-purple-100' : 'bg-stone-100'
                }`}>
                  {event.type === 'activity' && (() => {
                    const ChannelIcon = getChannelIcon((event.data as Activity).channel)
                    return <ChannelIcon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  })()}
                  {event.type === 'appointment' && <Calendar className="w-4 h-4 text-purple-600" />}
                  {event.type === 'created' && <UserPlus className="w-4 h-4 text-[var(--color-text-secondary)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  {event.type === 'activity' && renderActivityEvent(event.data as Activity)}
                  {event.type === 'appointment' && renderAppointmentEvent(event.data as Appointment)}
                  {event.type === 'created' && (
                    <p className="text-sm text-[var(--color-text-secondary)]">Contact created</p>
                  )}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                  {format(event.date, 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
