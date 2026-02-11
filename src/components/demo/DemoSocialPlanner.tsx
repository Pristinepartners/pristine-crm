'use client'

import { useState } from 'react'
import {
  Calendar,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Send,
} from 'lucide-react'
import type { DemoAccount, DemoSocialPost } from '@/lib/demo/data'

interface DemoSocialPlannerProps {
  account: DemoAccount
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
] as const

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function DemoSocialPlanner({ account }: DemoSocialPlannerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')
  const [selectedPost, setSelectedPost] = useState<DemoSocialPost | null>(null)

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const getPostsForDay = (day: number) => {
    return account.socialPosts.filter(post => {
      const postDate = new Date(post.scheduled_at)
      return (
        postDate.getDate() === day &&
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const getPlatformIcon = (platform: string) => {
    const p = PLATFORMS.find(pl => pl.id === platform)
    if (!p) return null
    const Icon = p.icon
    return <Icon className="w-4 h-4" style={{ color: p.color }} />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-stone-100 text-stone-700'
      case 'scheduled': return 'bg-amber-50 text-amber-700'
      case 'published': return 'bg-green-100 text-green-700'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  const today = new Date()

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const cells = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-32 bg-stone-50 border border-[var(--color-border)]" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDay(day)
      const isToday = day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()

      cells.push(
        <div
          key={day}
          className={`h-32 border border-[var(--color-border)] p-1.5 overflow-hidden ${isToday ? 'bg-amber-50' : 'bg-white'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? '' : 'text-[var(--color-text)]'}`}
            style={isToday ? { color: account.primaryColor } : {}}
          >
            {day}
          </div>
          <div className="space-y-1">
            {dayPosts.slice(0, 3).map(post => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="flex items-center gap-1 p-1 rounded bg-stone-100 hover:bg-gray-200 cursor-pointer text-xs truncate"
              >
                {getPlatformIcon(post.platform)}
                <span className="truncate">{post.content.slice(0, 18)}...</span>
              </div>
            ))}
            {dayPosts.length > 3 && (
              <div className="text-xs text-[var(--color-text-secondary)] text-center">
                +{dayPosts.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return cells
  }

  // Sort posts by date
  const sortedPosts = [...account.socialPosts].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Social Planner</h1>
          <p className="text-[var(--color-text-secondary)]">Schedule and manage your social media posts</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: account.primaryColor }}
        >
          + Create Post
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {PLATFORMS.map(platform => {
          const platformPosts = account.socialPosts.filter(p => p.platform === platform.id)
          const scheduled = platformPosts.filter(p => p.status === 'scheduled').length
          const published = platformPosts.filter(p => p.status === 'published').length

          return (
            <div key={platform.id} className="bg-white rounded-lg border border-[var(--color-border)] p-4">
              <div className="flex items-center gap-3 mb-3">
                <platform.icon className="w-6 h-6" style={{ color: platform.color }} />
                <span className="font-medium text-[var(--color-text)]">{platform.name}</span>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-[var(--color-text-secondary)]">Scheduled:</span>
                  <span className="ml-1 font-medium">{scheduled}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-secondary)]">Published:</span>
                  <span className="ml-1 font-medium">{published}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* View Toggle & Navigation */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex bg-stone-100 rounded-lg p-1">
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              view === 'calendar' ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              view === 'list' ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
            }`}
          >
            List
          </button>
        </div>

        {view === 'calendar' && (
          <div className="flex items-center gap-2">
            <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-stone-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-[var(--color-text)] min-w-[150px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-stone-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="grid grid-cols-7">
            {DAYS.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-[var(--color-text-secondary)] bg-stone-50 border-b">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="bg-white rounded-lg border border-[var(--color-border)]">
          <div className="divide-y">
            {sortedPosts.map(post => (
              <div
                key={post.id}
                className="p-4 flex items-start gap-4 hover:bg-stone-50 cursor-pointer transition"
                onClick={() => setSelectedPost(post)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getPlatformIcon(post.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--color-text)] line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(post.scheduled_at).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Post Preview Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPost(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getPlatformIcon(selectedPost.platform)}
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {PLATFORMS.find(p => p.id === selectedPost.platform)?.name} Post
                </h2>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPost.status)}`}>
                {selectedPost.status}
              </span>
            </div>
            <div className="p-6">
              <p className="text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Clock className="w-4 h-4" />
                  {selectedPost.status === 'published' ? 'Published' : 'Scheduled for'}{' '}
                  {new Date(selectedPost.scheduled_at).toLocaleString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-stone-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100 text-sm"
              >
                Close
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 text-sm"
                style={{ backgroundColor: account.primaryColor }}
              >
                <Edit2 className="w-4 h-4" />
                Edit Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
