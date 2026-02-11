'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { DemoAccount, DemoAppointment } from '@/lib/demo/data'

interface DemoCalendarProps {
  account: DemoAccount
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function DemoCalendar({ account }: DemoCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  const today = new Date()

  // Calendar logic
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getAppointmentsForDay = (day: number) => {
    return account.appointments.filter(apt => {
      const aptDate = new Date(apt.datetime)
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const filteredAppointments = account.appointments.filter((apt) => {
    const aptDate = new Date(apt.datetime)
    if (filter === 'upcoming') return aptDate >= today || isSameDay(aptDate, today)
    if (filter === 'past') return aptDate < today && !isSameDay(aptDate, today)
    return true
  }).sort((a, b) => {
    if (filter === 'past') return new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    return new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  })

  function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  }

  // Group by date
  const grouped: Record<string, DemoAppointment[]> = {}
  filteredAppointments.forEach(apt => {
    const key = new Date(apt.datetime).toDateString()
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(apt)
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-amber-50 text-amber-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'no_show': return 'bg-orange-100 text-orange-700'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  // Stats
  const todayCount = account.appointments.filter(apt => isSameDay(new Date(apt.datetime), today)).length
  const upcomingCount = account.appointments.filter(apt => new Date(apt.datetime) > today).length
  const completedCount = account.appointments.filter(apt => apt.status === 'completed').length
  const noShowCount = account.appointments.filter(apt => apt.status === 'no_show').length

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  // Render calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const cells = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 bg-stone-50 border border-[var(--color-border)]" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppts = getAppointmentsForDay(day)
      const isToday = day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()

      cells.push(
        <div
          key={day}
          className={`h-24 border border-[var(--color-border)] p-1.5 overflow-hidden ${isToday ? 'bg-amber-50' : 'bg-white'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
            {isToday ? (
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs"
                style={{ backgroundColor: account.primaryColor }}
              >
                {day}
              </span>
            ) : day}
          </div>
          <div className="space-y-0.5">
            {dayAppts.slice(0, 2).map(apt => (
              <div
                key={apt.id}
                className={`text-xs truncate px-1 py-0.5 rounded ${
                  apt.status === 'completed' ? 'bg-green-100 text-green-700'
                    : apt.status === 'cancelled' ? 'bg-red-100 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {new Date(apt.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} {apt.title.slice(0, 15)}...
              </div>
            ))}
            {dayAppts.length > 2 && (
              <div className="text-xs text-[var(--color-text-secondary)] px-1">+{dayAppts.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }

    return cells
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Calendar</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your appointments</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
          style={{ backgroundColor: account.primaryColor }}
        >
          + New Appointment
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
          <div className="text-2xl font-bold" style={{ color: account.primaryColor }}>{upcomingCount}</div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-[var(--color-text)] min-w-[180px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-stone-100 rounded-lg transition ml-2"
            >
              Today
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-sm font-medium text-[var(--color-text-secondary)] py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['upcoming', 'past', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg font-medium transition"
            style={filter === f ? {
              backgroundColor: account.primaryColor,
              color: '#fff',
            } : {
              backgroundColor: '#fff',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-[var(--color-border)] text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)]" />
            <p className="text-[var(--color-text-secondary)]">No appointments found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, apts]) => {
            const date = new Date(dateStr)
            const isToday2 = isSameDay(date, today)
            const label = isToday2 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

            return (
              <div key={dateStr}>
                <h2 className={`text-lg font-semibold mb-3 ${isToday2 ? '' : 'text-[var(--color-text)]'}`}
                  style={isToday2 ? { color: account.primaryColor } : {}}
                >
                  {label}
                </h2>
                <div className="space-y-3">
                  {apts.map(apt => {
                    const aptDate = new Date(apt.datetime)
                    return (
                      <div key={apt.id} className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="flex flex-col items-center text-center min-w-[60px]">
                              <div className="text-2xl font-bold text-[var(--color-text)]">
                                {aptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-semibold text-[var(--color-text)]">{apt.title}</h3>
                              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mt-1">
                                <User className="w-3 h-3" />
                                {apt.contact_name}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)] mt-1">
                                <MapPin className="w-3 h-3" />
                                {apt.location}
                              </div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                            {apt.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
