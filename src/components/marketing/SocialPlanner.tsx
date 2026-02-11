'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  X,
  Calendar,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  Send,
} from 'lucide-react'

interface SocialPost {
  id: string
  platform: 'facebook' | 'instagram' | 'linkedin'
  content: string
  image_url?: string
  scheduled_at: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  created_at: string
}

interface SocialPlannerProps {
  posts: SocialPost[]
}

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
] as const

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function SocialPlanner({ posts: initialPosts }: SocialPlannerProps) {
  const supabase = createClient()
  const [posts, setPosts] = useState(initialPosts)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // Form state
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook'])
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('09:00')

  const resetForm = () => {
    setSelectedPlatforms(['facebook'])
    setContent('')
    setImageUrl('')
    setScheduledDate('')
    setScheduledTime('09:00')
    setEditingPost(null)
  }

  const openModal = (post?: SocialPost) => {
    if (post) {
      setEditingPost(post)
      setSelectedPlatforms([post.platform])
      setContent(post.content)
      setImageUrl(post.image_url || '')
      const date = new Date(post.scheduled_at)
      setScheduledDate(date.toISOString().split('T')[0])
      setScheduledTime(date.toTimeString().slice(0, 5))
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleSave = async (status: 'draft' | 'scheduled') => {
    if (!content.trim() || selectedPlatforms.length === 0) return

    const scheduledAt = scheduledDate && scheduledTime
      ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      : new Date().toISOString()

    if (editingPost) {
      const { data, error } = await supabase
        .from('social_posts')
        .update({
          platform: selectedPlatforms[0],
          content,
          image_url: imageUrl || null,
          scheduled_at: scheduledAt,
          status,
        })
        .eq('id', editingPost.id)
        .select()
        .single()

      if (!error && data) {
        setPosts(posts.map(p => p.id === data.id ? data as SocialPost : p))
      }
    } else {
      // Create a post for each selected platform
      const newPosts: SocialPost[] = []
      for (const platform of selectedPlatforms) {
        const { data, error } = await supabase
          .from('social_posts')
          .insert({
            platform,
            content,
            image_url: imageUrl || null,
            scheduled_at: scheduledAt,
            status,
          } as any)
          .select()
          .single()

        if (!error && data) {
          newPosts.push(data as SocialPost)
        }
      }
      setPosts([...posts, ...newPosts])
    }

    setShowModal(false)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)

    if (!error) {
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  const togglePlatform = (platformId: string) => {
    if (editingPost) return // Can't change platform when editing
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    )
  }

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const getPostsForDay = (day: number) => {
    return posts.filter(post => {
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
      case 'draft': return 'bg-stone-100 text-[var(--color-text)]'
      case 'scheduled': return 'bg-amber-50 text-amber-700'
      case 'published': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-stone-100 text-[var(--color-text)]'
    }
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-stone-50 border border-[var(--color-border)]" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPosts = getPostsForDay(day)
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear()

      days.push(
        <div
          key={day}
          className={`h-32 border border-[var(--color-border)] p-1 overflow-hidden ${
            isToday ? 'bg-amber-50' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayPosts.slice(0, 3).map(post => (
              <div
                key={post.id}
                onClick={() => openModal(post)}
                className="flex items-center gap-1 p-1 rounded bg-stone-100 hover:bg-gray-200 cursor-pointer text-xs truncate"
              >
                {getPlatformIcon(post.platform)}
                <span className="truncate">{post.content.slice(0, 20)}...</span>
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

    return days
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Social Planner</h1>
          <p className="text-[var(--color-text-secondary)]">Schedule and manage your social media posts</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {PLATFORMS.map(platform => {
          const platformPosts = posts.filter(p => p.platform === platform.id)
          const scheduled = platformPosts.filter(p => p.status === 'scheduled').length
          const published = platformPosts.filter(p => p.status === 'published').length

          return (
            <div
              key={platform.id}
              className="bg-white rounded-lg border border-[var(--color-border)] p-4"
            >
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

      {/* View Toggle */}
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
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-stone-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-[var(--color-text)] min-w-[150px] text-center">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-stone-100 rounded-lg"
            >
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
          {posts.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-secondary)]">
              No posts scheduled. Create your first post to get started.
            </div>
          ) : (
            <div className="divide-y">
              {posts.map(post => (
                <div key={post.id} className="p-4 flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--color-text)] line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(post.scheduled_at).toLocaleString('en-US')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                  </div>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt=""
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(post)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingPost ? 'Edit Post' : 'Create Post'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="p-2 hover:bg-stone-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Platforms
                </label>
                <div className="flex gap-3">
                  {PLATFORMS.map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      disabled={!!editingPost}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition ${
                        selectedPlatforms.includes(platform.id)
                          ? 'border-[var(--color-primary)] bg-amber-50'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                      } ${editingPost ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                      <span className="font-medium">{platform.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                  placeholder="What would you like to share?"
                />
                <div className="flex justify-between mt-1 text-sm text-[var(--color-text-secondary)]">
                  <span>{content.length} characters</span>
                  {selectedPlatforms.includes('linkedin') && content.length > 3000 && (
                    <span className="text-orange-500">LinkedIn limit: 3000</span>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Image URL (optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {imageUrl && (
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-50"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {showPreview && imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="mt-2 max-h-48 rounded-lg object-cover"
                  />
                )}
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetForm() }}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave('draft')}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave('scheduled')}
                disabled={!scheduledDate}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
