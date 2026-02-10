'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  GitBranch,
  Globe,
  FileText,
  ClipboardList,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Copy,
} from 'lucide-react'

type TabType = 'funnels' | 'websites' | 'forms' | 'surveys'

interface SiteItem {
  id: string
  name: string
  slug?: string
  status?: string
  created_at: string
  updated_at?: string
}

interface SitesManagerProps {
  funnels: SiteItem[]
  websites: SiteItem[]
  forms: SiteItem[]
  surveys: SiteItem[]
}

const tabs = [
  { id: 'funnels' as TabType, label: 'Funnels', icon: GitBranch },
  { id: 'websites' as TabType, label: 'Websites', icon: Globe },
  { id: 'forms' as TabType, label: 'Forms', icon: FileText },
  { id: 'surveys' as TabType, label: 'Surveys', icon: ClipboardList },
]

export function SitesManager({ funnels, websites, forms, surveys }: SitesManagerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('funnels')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [creating, setCreating] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const getItems = () => {
    switch (activeTab) {
      case 'funnels': return funnels
      case 'websites': return websites
      case 'forms': return forms
      case 'surveys': return surveys
    }
  }

  const getTableName = () => {
    return activeTab
  }

  const handleCreate = async () => {
    if (!newItemName.trim()) return
    setCreating(true)

    const slug = newItemName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const { data, error } = await supabase
      .from(getTableName())
      .insert({
        name: newItemName.trim(),
        slug,
        status: 'draft',
        content: JSON.stringify({ elements: [] }),
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Error creating:', error)
      alert(`Error creating ${activeTab.slice(0, -1)}: ${error.message}`)
      setCreating(false)
      return
    }

    setNewItemName('')
    setShowCreateModal(false)
    setCreating(false)
    router.refresh()

    // Navigate to editor
    if (data) {
      router.push(`/sites/${activeTab}/${data.id}/edit`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return

    await supabase.from(getTableName()).delete().eq('id', id)
    setMenuOpen(null)
    router.refresh()
  }

  const handleDuplicate = async (item: SiteItem) => {
    const { error } = await supabase
      .from(getTableName())
      .insert({
        name: `${item.name} (Copy)`,
        slug: `${item.slug}-copy-${Date.now()}`,
        status: 'draft',
      })

    if (!error) {
      router.refresh()
    }
    setMenuOpen(null)
  }

  const items = getItems()
  const singularLabel = activeTab.slice(0, -1)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-gray-500 mt-1">Build funnels, websites, forms, and surveys</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Create {singularLabel}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'funnels' && <GitBranch className="w-8 h-8 text-gray-400" />}
            {activeTab === 'websites' && <Globe className="w-8 h-8 text-gray-400" />}
            {activeTab === 'forms' && <FileText className="w-8 h-8 text-gray-400" />}
            {activeTab === 'surveys' && <ClipboardList className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} yet</h3>
          <p className="text-gray-500 mb-4">Create your first {singularLabel} to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create {singularLabel}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">/{item.slug}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === item.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                        <button
                          onClick={() => {
                            router.push(`/sites/${activeTab}/${item.id}/edit`)
                            setMenuOpen(null)
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => window.open(`/preview/${activeTab}/${item.slug}`, '_blank')}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Preview
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  item.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.status || 'draft'}
                </span>
                <button
                  onClick={() => router.push(`/sites/${activeTab}/${item.id}/edit`)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create {singularLabel}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder={`My ${singularLabel}`}
                autoFocus
              />
            </div>
            <div className="flex gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newItemName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
