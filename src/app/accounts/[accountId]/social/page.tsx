'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SubAccountSocialPost } from '@/lib/supabase/types'
import {
  Megaphone,
  Plus,
  X,
  Instagram,
  Facebook,
  Linkedin,
  Clock,
  CheckCircle2,
  FileEdit,
  Send,
  Calendar,
  Trash2,
} from 'lucide-react'

type StatusFilter = 'all' | 'scheduled' | 'published' | 'draft'
type PlatformFilter = 'all' | 'instagram' | 'facebook' | 'linkedin'

export default function SocialPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const [posts, setPosts] = useState<SubAccountSocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadPosts()
  }, [accountId])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('sub_account_social_posts')
      .select('*')
      .eq('sub_account_id', accountId)
      .order('scheduled_at', { ascending: false })
    setPosts((data || []) as unknown as SubAccountSocialPost[])
    setLoading(false)
  }

  const filtered = posts.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesPlatform = platformFilter === 'all' || p.platform === platformFilter
    return matchesStatus && matchesPlatform
  })

  const platformIcon = (platform: string) => {
    if (platform === 'instagram') return <Instagram className="w-4 h-4" />
    if (platform === 'facebook') return <Facebook className="w-4 h-4" />
    return <Linkedin className="w-4 h-4" />
  }

  const platformColor = (platform: string) => {
    if (platform === 'instagram') return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
    if (platform === 'facebook') return 'bg-blue-600 text-white'
    return 'bg-blue-700 text-white'
  }

  const statusBadge = (status: string) => {
    if (status === 'published') return 'bg-green-100 text-green-700'
    if (status === 'scheduled') return 'bg-blue-100 text-blue-700'
    return 'bg-stone-100 text-stone-600'
  }

  const statusIcon = (status: string) => {
    if (status === 'published') return <CheckCircle2 className="w-3.5 h-3.5" />
    if (status === 'scheduled') return <Clock className="w-3.5 h-3.5" />
    return <FileEdit className="w-3.5 h-3.5" />
  }

  async function handleAddPost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const date = form.get('date') as string
    const time = form.get('time') as string
    const scheduledAt = date && time ? new Date(`${date}T${time}`).toISOString() : new Date().toISOString()
    await supabase.from('sub_account_social_posts').insert({
      sub_account_id: accountId,
      platform: form.get('platform') as string,
      content: form.get('content') as string,
      scheduled_at: scheduledAt,
      status: form.get('status') as string || 'draft',
    })
    setShowAddModal(false)
    loadPosts()
  }

  async function handlePublish(id: string) {
    await supabase.from('sub_account_social_posts').update({
      status: 'published',
      published_at: new Date().toISOString(),
    }).eq('id', id)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'published' as const, published_at: new Date().toISOString() } : p))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this post?')) return
    await supabase.from('sub_account_social_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const scheduledCount = posts.filter(p => p.status === 'scheduled').length
  const publishedCount = posts.filter(p => p.status === 'published').length
  const draftCount = posts.filter(p => p.status === 'draft').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Social Planner</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {scheduledCount} scheduled &middot; {publishedCount} published &middot; {draftCount} drafts
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Create Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--color-text)]">{scheduledCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Scheduled</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--color-text)]">{publishedCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Published</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] flex items-center gap-3">
          <div className="p-2 bg-stone-100 rounded-lg">
            <FileEdit className="w-5 h-5 text-stone-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-[var(--color-text)]">{draftCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Drafts</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          {(['all', 'scheduled', 'published', 'draft'] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                statusFilter === f ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          {(['all', 'instagram', 'facebook', 'linkedin'] as PlatformFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setPlatformFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1 ${
                platformFilter === f ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {f !== 'all' && platformIcon(f)}
              {f === 'all' ? 'All Platforms' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[var(--color-text-secondary)]">Loading posts...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-16 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">No posts found</h2>
          <p className="text-[var(--color-text-secondary)]">Create your first social media post</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-sm transition">
              {/* Platform Header */}
              <div className={`px-4 py-2 flex items-center gap-2 ${platformColor(post.platform)}`}>
                {platformIcon(post.platform)}
                <span className="text-sm font-medium capitalize">{post.platform}</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-[var(--color-text)] line-clamp-4 mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(post.status)}`}>
                      {statusIcon(post.status)}
                      {post.status}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(post.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                  {post.status !== 'published' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                    >
                      <Send className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Post Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Create Post</h2>
            </div>
            <form onSubmit={handleAddPost} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Platform *</label>
                  <select name="platform" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm">
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Status</label>
                  <select name="status" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm">
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Content *</label>
                <textarea
                  name="content"
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none resize-none"
                  placeholder="Write your post content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Schedule Date</label>
                  <input name="date" type="date" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Schedule Time</label>
                  <input name="time" type="time" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Create Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
