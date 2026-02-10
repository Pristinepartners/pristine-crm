'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tag, ContactTag } from '@/lib/supabase/types'

interface ContactTagsEditorProps {
  contactId: string
  initialTags?: ContactTag[]
  onTagsChange?: (tags: ContactTag[]) => void
}

export function ContactTagsEditor({ contactId, initialTags = [], onTagsChange }: ContactTagsEditorProps) {
  const [contactTags, setContactTags] = useState<ContactTag[]>(initialTags)
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchAllTags()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAllTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name')
    setAllTags((data || []) as Tag[])
  }

  const availableTags = allTags.filter(
    tag => !contactTags.some(ct => ct.tag_id === tag.id)
  )

  const handleAddTag = async (tag: Tag) => {
    setLoading(true)
    const { error } = await supabase
      .from('contact_tags')
      .insert({ contact_id: contactId, tag_id: tag.id })

    if (!error) {
      const newContactTag: ContactTag = {
        contact_id: contactId,
        tag_id: tag.id,
        added_at: new Date().toISOString(),
        tag,
      }
      const updated = [...contactTags, newContactTag]
      setContactTags(updated)
      onTagsChange?.(updated)
    }
    setLoading(false)
    setShowDropdown(false)
  }

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('contact_tags')
      .delete()
      .eq('contact_id', contactId)
      .eq('tag_id', tagId)

    if (!error) {
      const updated = contactTags.filter(ct => ct.tag_id !== tagId)
      setContactTags(updated)
      onTagsChange?.(updated)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {contactTags.map(ct => {
          const tag = ct.tag || allTags.find(t => t.id === ct.tag_id)
          if (!tag) return null
          return (
            <span
              key={ct.tag_id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium group"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
              <button
                onClick={() => handleRemoveTag(ct.tag_id)}
                className="ml-0.5 p-0.5 hover:bg-black/10 rounded-full transition"
                disabled={loading}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )
        })}

        {/* Add tag button */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={loading || availableTags.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border border-dashed border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Tag
            <ChevronDown className="w-3 h-3" />
          </button>

          {showDropdown && availableTags.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 max-h-48 overflow-y-auto">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => handleAddTag(tag)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {contactTags.length === 0 && (
        <p className="text-sm text-gray-400">No tags assigned</p>
      )}
    </div>
  )
}
