'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, isSameDay, addDays, startOfWeek, isFuture, isToday } from 'date-fns'
import {
  Plus,
  X,
  Calendar,
  Clock,
  Video,
  Users,
  Repeat,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

interface Meeting {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  location?: string
  meeting_link?: string
  is_recurring: boolean
  recurrence_pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  recurrence_end_date?: string
  notes?: string
  created_at: string
}

interface Appointment {
  id: string
  title: string
  datetime: string
  location?: string
  status: string
  contact: {
    id: string
    name: string
    business_name?: string
  }
}

interface MeetingsManagerProps {
  meetings: Meeting[]
  appointments: Appointment[]
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WORK_HOURS = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM

export function MeetingsManager({ meetings: initialMeetings, appointments }: MeetingsManagerProps) {
  const supabase = createClient()
  const [meetings, setMeetings] = useState(initialMeetings)
  const [showModal, setShowModal] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recurring' | 'calendar'>('upcoming')
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()))

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    meetingLink: '',
    isRecurring: false,
    recurrencePattern: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    recurrenceEndDate: '',
    notes: '',
  })

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      startDate: '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      meetingLink: '',
      isRecurring: false,
      recurrencePattern: 'weekly',
      recurrenceEndDate: '',
      notes: '',
    })
    setEditingMeeting(null)
  }

  const openModal = (meeting?: Meeting) => {
    if (meeting) {
      setEditingMeeting(meeting)
      const startDate = new Date(meeting.start_time)
      const endDate = meeting.end_time ? new Date(meeting.end_time) : null
      setForm({
        title: meeting.title,
        description: meeting.description || '',
        startDate: format(startDate, 'yyyy-MM-dd'),
        startTime: format(startDate, 'HH:mm'),
        endTime: endDate ? format(endDate, 'HH:mm') : '10:00',
        location: meeting.location || '',
        meetingLink: meeting.meeting_link || '',
        isRecurring: meeting.is_recurring,
        recurrencePattern: meeting.recurrence_pattern || 'weekly',
        recurrenceEndDate: meeting.recurrence_end_date || '',
        notes: meeting.notes || '',
      })
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.startDate || !form.startTime) return

    const startTime = `${form.startDate}T${form.startTime}`
    const endTime = form.endTime ? `${form.startDate}T${form.endTime}` : null

    const meetingData = {
      title: form.title,
      description: form.description || null,
      start_time: startTime,
      end_time: endTime,
      location: form.location || null,
      meeting_link: form.meetingLink || null,
      is_recurring: form.isRecurring,
      recurrence_pattern: form.isRecurring ? form.recurrencePattern : null,
      recurrence_end_date: form.isRecurring && form.recurrenceEndDate ? form.recurrenceEndDate : null,
      notes: form.notes || null,
    }

    if (editingMeeting) {
      const { data, error } = await supabase
        .from('meetings')
        .update(meetingData)
        .eq('id', editingMeeting.id)
        .select()
        .single()

      if (!error && data) {
        setMeetings(meetings.map(m => m.id === data.id ? data as Meeting : m))
      }
    } else {
      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData as any)
        .select()
        .single()

      if (!error && data) {
        setMeetings([...meetings, data as Meeting])
      }
    }

    setShowModal(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return

    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)

    if (!error) {
      setMeetings(meetings.filter(m => m.id !== id))
    }
  }

  const handleSaveNotes = async (meetingId: string, notes: string) => {
    await supabase
      .from('meetings')
      .update({ notes })
      .eq('id', meetingId)

    setMeetings(meetings.map(m => m.id === meetingId ? { ...m, notes } : m))
  }

  // Filter meetings
  const upcomingMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.start_time)
    return isFuture(meetingDate) || isToday(meetingDate)
  })

  const recurringMeetings = meetings.filter(m => m.is_recurring)

  // Get week days for calendar
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Get meetings for a specific day and hour
  const getMeetingsForHour = (day: Date, hour: number) => {
    return meetings.filter(m => {
      const meetingDate = new Date(m.start_time)
      return isSameDay(meetingDate, day) && meetingDate.getHours() === hour
    })
  }

  // Get appointments for a specific day and hour
  const getAppointmentsForHour = (day: Date, hour: number) => {
    return appointments.filter(a => {
      const aptDate = new Date(a.datetime)
      return isSameDay(aptDate, day) && aptDate.getHours() === hour
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Meetings</h1>
          <p className="text-[var(--color-text-secondary)]">Manage your meetings and join calls</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          New Meeting
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'upcoming' ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'recurring' ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <Repeat className="w-4 h-4 inline mr-1" />
          Recurring
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            activeTab === 'calendar' ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-1" />
          Calendar
        </button>
      </div>

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {/* Today's Appointments */}
          {appointments.filter(a => isToday(new Date(a.datetime))).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Today's Appointments</h2>
              <div className="grid gap-3">
                {appointments
                  .filter(a => isToday(new Date(a.datetime)))
                  .map(apt => (
                    <div key={apt.id} className="bg-amber-50 border border-[var(--color-border)] rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-[var(--color-primary)]">
                            {format(new Date(apt.datetime), 'HH:mm')}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-[var(--color-text)]">{apt.title}</h3>
                          <Link
                            href={`/contacts/${apt.contact.id}`}
                            className="text-sm text-[var(--color-primary)] hover:opacity-80 flex items-center gap-1"
                          >
                            <User className="w-3 h-3" />
                            {apt.contact.name}
                          </Link>
                          {apt.location && (
                            <div className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {apt.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {apt.location?.toLowerCase().includes('zoom') || apt.location?.toLowerCase().includes('meet') ? (
                        <a
                          href={apt.location.startsWith('http') ? apt.location : `https://${apt.location}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90"
                        >
                          <Video className="w-4 h-4" />
                          Join
                        </a>
                      ) : null}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Upcoming Meetings */}
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Scheduled Meetings</h2>
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
              <p className="text-[var(--color-text-secondary)]">No upcoming meetings</p>
              <button
                onClick={() => openModal()}
                className="mt-4 text-[var(--color-primary)] hover:opacity-80 font-medium"
              >
                Schedule a meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={() => openModal(meeting)}
                  onDelete={() => handleDelete(meeting.id)}
                  onSaveNotes={(notes) => handleSaveNotes(meeting.id, notes)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recurring Tab */}
      {activeTab === 'recurring' && (
        <div>
          {recurringMeetings.length === 0 ? (
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-12 text-center">
              <Repeat className="w-12 h-12 mx-auto text-[var(--color-text-muted)] mb-4" />
              <p className="text-[var(--color-text-secondary)]">No recurring meetings</p>
              <button
                onClick={() => openModal()}
                className="mt-4 text-[var(--color-primary)] hover:opacity-80 font-medium"
              >
                Create a recurring meeting
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recurringMeetings.map(meeting => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={() => openModal(meeting)}
                  onDelete={() => handleDelete(meeting.id)}
                  onSaveNotes={(notes) => handleSaveNotes(meeting.id, notes)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
          {/* Week Navigation */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
              className="p-2 hover:bg-stone-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-[var(--color-text)]">
              Week of {format(currentWeekStart, 'MMM d, yyyy')}
            </h2>
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              className="p-2 hover:bg-stone-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 min-w-[800px]">
              {/* Header */}
              <div className="p-2 border-b bg-stone-50" />
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={`p-2 text-center border-b border-l bg-stone-50 ${
                    isToday(day) ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="text-sm text-[var(--color-text-secondary)]">{DAYS_OF_WEEK[day.getDay()]}</div>
                  <div className={`text-lg font-semibold ${isToday(day) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              ))}

              {/* Time Grid */}
              {WORK_HOURS.map(hour => (
                <>
                  <div key={`hour-${hour}`} className="p-2 text-right text-sm text-[var(--color-text-secondary)] border-b">
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const hourMeetings = getMeetingsForHour(day, hour)
                    const hourAppointments = getAppointmentsForHour(day, hour)

                    return (
                      <div
                        key={`${hour}-${dayIndex}`}
                        className={`min-h-[60px] border-b border-l p-1 ${
                          isToday(day) ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        {hourMeetings.map(m => (
                          <div
                            key={m.id}
                            onClick={() => openModal(m)}
                            className="text-xs bg-purple-100 text-purple-700 p-1 rounded mb-1 cursor-pointer hover:bg-purple-200 truncate"
                          >
                            {format(new Date(m.start_time), 'HH:mm')} {m.title}
                          </div>
                        ))}
                        {hourAppointments.map(a => (
                          <div
                            key={a.id}
                            className="text-xs bg-amber-50 text-amber-700 p-1 rounded mb-1 truncate"
                          >
                            {format(new Date(a.datetime), 'HH:mm')} {a.contact.name}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingMeeting ? 'Edit Meeting' : 'New Meeting'}
              </h2>
              <button onClick={() => { setShowModal(false); resetForm() }} className="p-2 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Team Standup, Client Call..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                  placeholder="Meeting agenda..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Start Time *</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="Conference Room A, Zoom, Google Meet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={form.meetingLink}
                  onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  placeholder="https://zoom.us/j/..."
                />
              </div>

              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={form.isRecurring}
                  onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                  className="w-4 h-4 text-[var(--color-primary)] border-[var(--color-border-strong)] rounded focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="recurring" className="text-sm font-medium text-[var(--color-text)]">
                  Make this a recurring meeting
                </label>
              </div>

              {form.isRecurring && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Repeat</label>
                    <select
                      value={form.recurrencePattern}
                      onChange={(e) => setForm({ ...form, recurrencePattern: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 Weeks</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Until</label>
                    <input
                      type="date"
                      value={form.recurrenceEndDate}
                      onChange={(e) => setForm({ ...form, recurrenceEndDate: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                  placeholder="Meeting notes..."
                />
              </div>
            </div>

            <div className="p-4 border-t bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.startDate || !form.startTime}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingMeeting ? 'Save Changes' : 'Create Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MeetingCard({
  meeting,
  onEdit,
  onDelete,
  onSaveNotes,
}: {
  meeting: Meeting
  onEdit: () => void
  onDelete: () => void
  onSaveNotes: (notes: string) => void
}) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(meeting.notes || '')
  const [saving, setSaving] = useState(false)

  const startDate = new Date(meeting.start_time)
  const endDate = meeting.end_time ? new Date(meeting.end_time) : null

  const handleSaveNotes = async () => {
    setSaving(true)
    await onSaveNotes(notes)
    setSaving(false)
    setShowNotes(false)
  }

  return (
    <div className="bg-white rounded-lg border border-[var(--color-border)] p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-center min-w-[60px]">
            <div className="text-sm text-[var(--color-text-secondary)]">{format(startDate, 'MMM d')}</div>
            <div className="text-xl font-bold text-[var(--color-text)]">{format(startDate, 'HH:mm')}</div>
            {endDate && (
              <div className="text-xs text-[var(--color-text-secondary)]">to {format(endDate, 'HH:mm')}</div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text)] flex items-center gap-2">
              {meeting.title}
              {meeting.is_recurring && (
                <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  <Repeat className="w-3 h-3" />
                  {meeting.recurrence_pattern}
                </span>
              )}
            </h3>
            {meeting.description && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">{meeting.description}</p>
            )}
            {meeting.location && (
              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mt-1">
                <MapPin className="w-3 h-3" />
                {meeting.location}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {meeting.meeting_link && (
            <a
              href={meeting.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm"
            >
              <Video className="w-4 h-4" />
              Join
            </a>
          )}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg"
            title="Notes"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showNotes && (
        <div className="mt-4 pt-4 border-t">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Meeting Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none text-sm"
            placeholder="Add notes from this meeting..."
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowNotes(false)}
              className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
