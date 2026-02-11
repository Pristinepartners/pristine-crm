'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  startOfDay,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  addWeeks,
  subWeeks,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from 'date-fns'
import { Plus, Calendar, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Grid3X3, CalendarDays, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment, Contact, AppointmentStatus } from '@/lib/supabase/types'
import Link from 'next/link'

interface AppointmentWithContact extends Appointment {
  contact: Contact
}

interface CalendarViewProps {
  appointments: AppointmentWithContact[]
  contacts: Contact[]
}

// Working hours for the weekly view
const WORK_HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 8 PM

export function CalendarView({ appointments: initialAppointments, contacts }: CalendarViewProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithContact | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const now = new Date()

  // Get calendar days for month view
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days: Date[] = []
    let day = startDate
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }

  // Get calendar days for week view
  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate)
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i))
    }
    return days
  }

  const calendarDays = viewMode === 'month' ? getMonthDays() : getWeekDays()
  const weekDays = getWeekDays()

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.datetime), day))
  }

  // Get appointments for a specific hour on a specific day
  const getAppointmentsForHour = (day: Date, hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.datetime)
      return isSameDay(aptDate, day) && getHours(aptDate) === hour
    })
  }

  // Navigate calendar
  const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(subWeeks(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addWeeks(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  // Handle day click
  const handleDayClick = (day: Date) => {
    if (selectedDate && isSameDay(selectedDate, day)) {
      setSelectedDate(null)
    } else {
      setSelectedDate(day)
    }
  }

  // Handle appointment click for editing
  const handleAppointmentClick = (apt: AppointmentWithContact, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingAppointment(apt)
    setShowEditModal(true)
  }

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.datetime)

    if (selectedDate) {
      return isSameDay(aptDate, selectedDate)
    }

    if (filter === 'upcoming') return isFuture(aptDate) || isToday(aptDate)
    if (filter === 'past') return isPast(aptDate) && !isToday(aptDate)
    return true
  })

  // Group appointments by date
  const groupedAppointments = filteredAppointments.reduce((groups, apt) => {
    const date = format(new Date(apt.datetime), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(apt)
    return groups
  }, {} as Record<string, AppointmentWithContact[]>)

  // Sort dates
  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    if (filter === 'past') return new Date(b).getTime() - new Date(a).getTime()
    return new Date(a).getTime() - new Date(b).getTime()
  })

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'EEEE, MMMM d, yyyy')
  }

  const getStatusBadge = (status: AppointmentStatus) => {
    const styles: Record<AppointmentStatus, string> = {
      scheduled: 'bg-amber-50 text-amber-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-orange-100 text-orange-700',
    }
    return styles[status]
  }

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    ))
    router.refresh()
  }

  // Stats
  const todayCount = appointments.filter(apt => isToday(new Date(apt.datetime))).length
  const upcomingCount = appointments.filter(apt => isFuture(new Date(apt.datetime))).length
  const completedCount = appointments.filter(apt => apt.status === 'completed').length
  const noShowCount = appointments.filter(apt => apt.status === 'no_show').length

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Calendar</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your appointments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">Today</div>
          <div className="text-2xl font-bold text-[var(--color-text)]">{todayCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">Upcoming</div>
          <div className="text-2xl font-bold text-[var(--color-primary)]">{upcomingCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">Completed</div>
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="text-sm text-[var(--color-text-secondary)]">No Shows</div>
          <div className="text-2xl font-bold text-orange-600">{noShowCount}</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 mb-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-[var(--color-text)] min-w-[180px] text-center">
              {viewMode === 'month'
                ? format(currentDate, 'MMMM yyyy')
                : `Week of ${format(startOfWeek(currentDate), 'MMM d')}`}
            </h2>
            <button
              onClick={goToNext}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition ml-2"
            >
              Today
            </button>
          </div>

          <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === 'month'
                  ? 'bg-white text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                viewMode === 'week'
                  ? 'bg-white text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              Week
            </button>
          </div>
        </div>

        {/* Month View */}
        {viewMode === 'month' && (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-[var(--color-text-secondary)] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-[var(--color-border)]">
              {calendarDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const hasAppointments = dayAppointments.length > 0

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    className={`
                      min-h-[80px] p-2 text-left transition relative bg-white
                      ${!isCurrentMonth ? 'bg-stone-50' : ''}
                      ${isSelected ? 'ring-2 ring-[var(--color-primary)] ring-inset' : ''}
                      ${isToday(day) ? 'bg-amber-50' : ''}
                      hover:bg-stone-100
                    `}
                  >
                    <span
                      className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm
                        ${isToday(day) ? 'bg-[var(--color-primary)] text-white font-bold' : ''}
                        ${!isCurrentMonth ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}
                      `}
                    >
                      {format(day, 'd')}
                    </span>

                    {hasAppointments && (
                      <div className="mt-1 space-y-0.5">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            onClick={(e) => handleAppointmentClick(apt, e)}
                            className={`text-xs truncate px-1 py-0.5 rounded cursor-pointer hover:opacity-80 ${
                              apt.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : apt.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {format(new Date(apt.datetime), 'HH:mm')} {apt.title}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-[var(--color-text-secondary)] px-1">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* Week View with Hours */}
        {viewMode === 'week' && (
          <div className="overflow-x-auto">
            {/* Day Headers */}
            <div className="grid grid-cols-8 border-b border-[var(--color-border)]">
              <div className="p-2 text-center text-sm font-medium text-[var(--color-text-secondary)]">
                {/* Empty cell for time column */}
              </div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-2 text-center border-l border-[var(--color-border)] ${
                    isToday(day) ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      isToday(day) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="relative">
              {WORK_HOURS.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-[var(--color-border)]">
                  {/* Time Label */}
                  <div className="p-2 text-right text-xs text-[var(--color-text-secondary)] pr-3">
                    {format(setHours(new Date(), hour), 'h a')}
                  </div>

                  {/* Day Columns */}
                  {weekDays.map((day, dayIndex) => {
                    const hourAppointments = getAppointmentsForHour(day, hour)
                    const isCurrentHour = isToday(day) && getHours(now) === hour

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          min-h-[60px] border-l border-[var(--color-border)] p-1 relative
                          ${isToday(day) ? 'bg-amber-50/30' : ''}
                          ${isCurrentHour ? 'bg-amber-50/50' : ''}
                        `}
                      >
                        {/* Current time indicator */}
                        {isCurrentHour && (
                          <div
                            className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
                            style={{
                              top: `${(getMinutes(now) / 60) * 100}%`,
                            }}
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full -mt-1 -ml-1" />
                          </div>
                        )}

                        {hourAppointments.map((apt) => (
                          <div
                            key={apt.id}
                            onClick={(e) => handleAppointmentClick(apt, e)}
                            className={`
                              text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 truncate
                              ${apt.status === 'completed'
                                ? 'bg-green-100 text-green-700 border-l-2 border-green-500'
                                : apt.status === 'cancelled'
                                ? 'bg-red-100 text-red-700 border-l-2 border-red-500'
                                : 'bg-amber-50 text-amber-700 border-l-2 border-[var(--color-primary)]'
                              }
                            `}
                          >
                            <div className="font-medium">
                              {format(new Date(apt.datetime), 'HH:mm')}
                            </div>
                            <div className="truncate">{apt.title}</div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Date Header */}
      {selectedDate && (
        <div className="flex items-center justify-between mb-4 p-3 bg-amber-50 rounded-lg">
          <span className="font-medium text-amber-900">
            Showing appointments for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm text-[var(--color-primary)] hover:opacity-80"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Filters */}
      {!selectedDate && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'upcoming'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-stone-50'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'past'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-stone-50'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-stone-50'
            }`}
          >
            All
          </button>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-[var(--color-border)] text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
            <p className="text-[var(--color-text-secondary)]">No appointments found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-[var(--color-primary)] hover:opacity-80 font-medium"
            >
              Create your first appointment
            </button>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              <h2 className={`text-lg font-semibold mb-3 ${
                isToday(new Date(date)) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
              }`}>
                {getDateLabel(date)}
              </h2>
              <div className="space-y-3">
                {groupedAppointments[date].map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)] hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center text-center min-w-[60px]">
                          <div className="text-2xl font-bold text-[var(--color-text)]">
                            {format(new Date(apt.datetime), 'HH:mm')}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            {format(new Date(apt.datetime), 'a')}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--color-text)]">{apt.title}</h3>
                          <Link
                            href={`/contacts/${apt.contact_id}`}
                            className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] mt-1"
                          >
                            <User className="w-3 h-3" />
                            {apt.contact?.name || 'Unknown contact'}
                          </Link>
                          {apt.location && (
                            <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mt-1">
                              <MapPin className="w-3 h-3" />
                              {apt.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                          {apt.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={(e) => handleAppointmentClick(apt, e)}
                          className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-amber-50 rounded transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {apt.status === 'scheduled' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                              title="Mark completed"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'no_show')}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded transition"
                              title="Mark no show"
                            >
                              <AlertCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                              title="Cancel"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AppointmentModal
          contacts={contacts}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newAppointment) => {
            setAppointments([...appointments, newAppointment].sort(
              (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
            ))
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}

      {showEditModal && editingAppointment && (
        <AppointmentModal
          contacts={contacts}
          appointment={editingAppointment}
          onClose={() => {
            setShowEditModal(false)
            setEditingAppointment(null)
          }}
          onSuccess={(updatedAppointment) => {
            setAppointments(appointments.map(apt =>
              apt.id === updatedAppointment.id ? updatedAppointment : apt
            ).sort(
              (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
            ))
            setShowEditModal(false)
            setEditingAppointment(null)
            router.refresh()
          }}
          onDelete={(id) => {
            setAppointments(appointments.filter(apt => apt.id !== id))
            setShowEditModal(false)
            setEditingAppointment(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

function AppointmentModal({
  contacts,
  appointment,
  onClose,
  onSuccess,
  onDelete,
}: {
  contacts: Contact[]
  appointment?: AppointmentWithContact
  onClose: () => void
  onSuccess: (appointment: AppointmentWithContact) => void
  onDelete?: (id: string) => void
}) {
  const isEditing = !!appointment
  const [title, setTitle] = useState(appointment?.title || '')
  const [contactId, setContactId] = useState(appointment?.contact_id || '')
  const [datetime, setDatetime] = useState(
    appointment ? format(new Date(appointment.datetime), "yyyy-MM-dd'T'HH:mm") : ''
  )
  const [location, setLocation] = useState(appointment?.location || '')
  const [status, setStatus] = useState<AppointmentStatus>(appointment?.status || 'scheduled')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactId) {
      alert('Please select a contact')
      return
    }
    setLoading(true)

    if (isEditing) {
      const { data, error } = await supabase
        .from('appointments')
        .update({
          title,
          contact_id: contactId,
          datetime,
          location: location || null,
          status,
        })
        .eq('id', appointment.id)
        .select('*, contact:contacts(*)')
        .single()

      if (error || !data) {
        setLoading(false)
        alert('Error updating appointment')
        return
      }

      onSuccess(data as unknown as AppointmentWithContact)
    } else {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          contact_id: contactId,
          title,
          datetime,
          location: location || null,
          status: 'scheduled',
        })
        .select('*, contact:contacts(*)')
        .single()

      if (error || !data) {
        setLoading(false)
        alert('Error creating appointment')
        return
      }

      onSuccess(data as unknown as AppointmentWithContact)
    }
  }

  const handleDelete = async () => {
    if (!appointment || !onDelete) return
    if (!confirm('Are you sure you want to delete this appointment?')) return

    setDeleting(true)
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointment.id)

    if (error) {
      setDeleting(false)
      alert('Error deleting appointment')
      return
    }

    onDelete(appointment.id)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {isEditing ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg transition"
          >
            ✕
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
              placeholder="Sales Call, Demo, Meeting..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Contact *
            </label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
              required
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
              placeholder="Zoom, Office, Phone..."
            />
          </div>

          {isEditing && (
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
          )}

          <div className="flex gap-3 pt-4">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
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
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
