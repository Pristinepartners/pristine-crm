'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SubAccountAppointment } from '@/lib/supabase/types'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

type ViewMode = 'list' | 'week'

export default function CalendarPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const [appointments, setAppointments] = useState<SubAccountAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const supabase = createClient()

  useEffect(() => {
    loadAppointments()
  }, [accountId])

  async function loadAppointments() {
    setLoading(true)
    const { data } = await supabase
      .from('sub_account_appointments')
      .select('*')
      .eq('sub_account_id', accountId)
      .order('datetime', { ascending: true })
    setAppointments((data || []) as unknown as SubAccountAppointment[])
    setLoading(false)
  }

  const now = new Date()
  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return new Date(a.datetime) >= now
    if (filter === 'past') return new Date(a.datetime) < now
    return true
  })

  const groupedByDate = filtered.reduce<Record<string, SubAccountAppointment[]>>((acc, apt) => {
    const dateKey = new Date(apt.datetime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(apt)
    return acc
  }, {})

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (status === 'cancelled') return <XCircle className="w-4 h-4 text-red-500" />
    if (status === 'no_show') return <AlertTriangle className="w-4 h-4 text-orange-500" />
    return <Clock className="w-4 h-4 text-blue-500" />
  }

  const statusLabel = (status: string) => {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'cancelled') return 'bg-red-100 text-red-700'
    if (status === 'no_show') return 'bg-orange-100 text-orange-700'
    return 'bg-blue-100 text-blue-700'
  }

  async function handleAddAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const date = form.get('date') as string
    const time = form.get('time') as string
    const datetime = new Date(`${date}T${time}`).toISOString()
    await supabase.from('sub_account_appointments').insert({
      sub_account_id: accountId,
      title: form.get('title') as string,
      contact_name: form.get('contact_name') as string,
      datetime,
      location: form.get('location') as string || null,
      status: 'scheduled',
    })
    setShowAddModal(false)
    loadAppointments()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('sub_account_appointments').update({ status }).eq('id', id)
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as SubAccountAppointment['status'] } : a))
  }

  const scheduledCount = appointments.filter(a => a.status === 'scheduled' && new Date(a.datetime) >= now).length
  const completedCount = appointments.filter(a => a.status === 'completed').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Calendar</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {scheduledCount} upcoming &middot; {completedCount} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Add Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-lg p-1 mb-6 w-fit">
        {(['upcoming', 'past', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              filter === f ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[var(--color-text-secondary)]">Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-16 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">No appointments</h2>
          <p className="text-[var(--color-text-secondary)]">Schedule your first appointment to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([dateKey, apts]) => {
            const isToday = new Date(apts[0].datetime).toDateString() === now.toDateString()
            return (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    {isToday ? 'Today' : dateKey}
                  </h3>
                  {isToday && (
                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Today</span>
                  )}
                </div>
                <div className="space-y-2">
                  {apts.map((apt) => (
                    <div key={apt.id} className="bg-white rounded-xl border border-[var(--color-border)] p-4 hover:shadow-sm transition">
                      <div className="flex items-start gap-4">
                        <div className="text-center min-w-[56px] flex-shrink-0">
                          <p className="text-lg font-bold text-[var(--color-text)]">
                            {new Date(apt.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-[var(--color-text)]">{apt.title}</p>
                              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-[var(--color-text-secondary)]">
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5" /> {apt.contact_name}
                                </span>
                                {apt.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" /> {apt.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusLabel(apt.status)}`}>
                                {statusIcon(apt.status)}
                                {apt.status.replace('_', ' ')}
                              </span>
                              {apt.status === 'scheduled' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateStatus(apt.id, 'completed')}
                                    className="p-1 hover:bg-green-50 rounded text-green-600"
                                    title="Mark completed"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => updateStatus(apt.id, 'cancelled')}
                                    className="p-1 hover:bg-red-50 rounded text-red-600"
                                    title="Cancel"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Add Appointment</h2>
            </div>
            <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Title *</label>
                <input name="title" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" placeholder="e.g. Property Showing" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Contact Name *</label>
                <input name="contact_name" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Date *</label>
                  <input name="date" type="date" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Time *</label>
                  <input name="time" type="time" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Location</label>
                <input name="location" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" placeholder="e.g. Office, Zoom, Address" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Add Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
