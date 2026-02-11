'use client'

import { useState, useEffect } from 'react'
import { Tag as TagIcon, Plus, Trash2, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/lib/supabase/types'

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
]

export function TagsManager() {
  const [tags, setTags] = useState<Tag[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [tagForm, setTagForm] = useState({ name: '', color: '#3B82F6' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    setTags((data || []) as Tag[])
  }

  const openModal = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      setTagForm({ name: tag.name, color: tag.color })
    } else {
      setEditingTag(null)
      setTagForm({ name: '', color: '#3B82F6' })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!tagForm.name.trim()) return

    setSaving(true)

    if (editingTag) {
      const { data, error } = await supabase
        .from('tags')
        .update({ name: tagForm.name, color: tagForm.color })
        .eq('id', editingTag.id)
        .select()
        .single()

      if (!error && data) {
        setTags(tags.map(t => t.id === data.id ? data as Tag : t))
      }
    } else {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name: tagForm.name, color: tagForm.color })
        .select()
        .single()

      if (!error && data) {
        setTags([...tags, data as Tag])
      }
    }

    setSaving(false)
    setShowModal(false)
    setTagForm({ name: '', color: '#3B82F6' })
    setEditingTag(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag? It will be removed from all contacts.')) return

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id)

    if (!error) {
      setTags(tags.filter(t => t.id !== id))
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TagIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Tags</h2>
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Tag
          </button>
        </div>

        <div className="p-4">
          {tags.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">
              <TagIcon className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-2" />
              <p>No tags yet</p>
              <p className="text-sm">Create tags to organize your contacts</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium group"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <div className="hidden group-hover:flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      onClick={() => openModal(tag)}
                      className="p-0.5 hover:bg-white/50 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="p-0.5 hover:bg-white/50 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTag ? 'Edit Tag' : 'New Tag'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingTag(null); setTagForm({ name: '', color: '#3B82F6' }) }}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g., VIP, Follow Up, New Lead..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setTagForm({ ...tagForm, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        tagForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-[var(--color-text-secondary)]">Custom:</span>
                  <input
                    type="color"
                    value={tagForm.color}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                    className="w-8 h-8 rounded border border-[var(--color-border-strong)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={tagForm.color}
                    onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                    className="flex-1 px-2 py-1 border border-[var(--color-border-strong)] rounded text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-[var(--color-text-secondary)]">Preview:</p>
                <span
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mt-2"
                  style={{ backgroundColor: `${tagForm.color}20`, color: tagForm.color }}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tagForm.color }}
                  />
                  {tagForm.name || 'Tag Name'}
                </span>
              </div>
            </div>

            <div className="p-4 border-t bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setEditingTag(null); setTagForm({ name: '', color: '#3B82F6' }) }}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !tagForm.name.trim()}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingTag ? 'Save Changes' : 'Create Tag'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
