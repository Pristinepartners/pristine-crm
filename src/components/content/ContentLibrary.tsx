'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ContentAsset, Client } from '@/lib/supabase/types'
import {
  FileImage,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Image,
  Video,
  FileText,
  Palette,
  File,
  Upload,
  Filter,
  Grid,
  List,
} from 'lucide-react'

interface ContentLibraryProps {
  assets: ContentAsset[]
  clients: Client[]
}

type AssetType = 'template' | 'image' | 'video' | 'document' | 'brand_kit'

const assetTypeConfig: Record<AssetType, { label: string; icon: React.ElementType; color: string }> = {
  template: { label: 'Templates', icon: FileText, color: 'bg-purple-100 text-purple-600' },
  image: { label: 'Images', icon: Image, color: 'bg-amber-50 text-[var(--color-primary)]' },
  video: { label: 'Videos', icon: Video, color: 'bg-red-100 text-red-600' },
  document: { label: 'Documents', icon: File, color: 'bg-green-100 text-green-600' },
  brand_kit: { label: 'Brand Kits', icon: Palette, color: 'bg-orange-100 text-orange-600' },
}

export function ContentLibrary({ assets, clients }: ContentLibraryProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all')
  const [filterClient, setFilterClient] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    asset_type: 'image' as AssetType,
    category: '',
    file_url: '',
    thumbnail_url: '',
    description: '',
    client_id: '',
    is_global: true,
    tags: '',
  })

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || asset.asset_type === filterType
    const matchesClient = filterClient === 'all' ||
      (filterClient === 'global' ? asset.is_global : asset.client_id === filterClient)
    return matchesSearch && matchesType && matchesClient
  })

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    setCreating(true)

    const tags = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : null

    const { error } = await supabase.from('content_assets').insert({
      name: formData.name.trim(),
      asset_type: formData.asset_type,
      category: formData.category || null,
      file_url: formData.file_url || null,
      thumbnail_url: formData.thumbnail_url || null,
      description: formData.description || null,
      client_id: formData.is_global ? null : formData.client_id || null,
      is_global: formData.is_global,
      tags,
    } as unknown as any)

    if (error) {
      alert(`Error creating asset: ${error.message}`)
      setCreating(false)
      return
    }

    setShowCreateModal(false)
    setCreating(false)
    setFormData({
      name: '',
      asset_type: 'image',
      category: '',
      file_url: '',
      thumbnail_url: '',
      description: '',
      client_id: '',
      is_global: true,
      tags: '',
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return
    await supabase.from('content_assets').delete().eq('id', id)
    setMenuOpen(null)
    router.refresh()
  }

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'Global'
    const client = clients.find(c => c.id === clientId)
    return client?.company_name || client?.name || 'Unknown'
  }

  const typeCounts = Object.keys(assetTypeConfig).reduce((acc, type) => {
    acc[type as AssetType] = assets.filter(a => a.asset_type === type).length
    return acc
  }, {} as Record<AssetType, number>)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Content Library</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Templates, images, videos, and brand assets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            filterType === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-stone-100 text-[var(--color-text-secondary)] hover:bg-gray-200'
          }`}
        >
          All ({assets.length})
        </button>
        {(Object.entries(assetTypeConfig) as [AssetType, typeof assetTypeConfig.template][]).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filterType === type
                ? 'bg-gray-900 text-white'
                : 'bg-stone-100 text-[var(--color-text-secondary)] hover:bg-gray-200'
            }`}
          >
            <config.icon className="w-4 h-4" />
            {config.label} ({typeCounts[type]})
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search assets, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        >
          <option value="all">All Assets</option>
          <option value="global">Global Only</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.company_name || client.name}
            </option>
          ))}
        </select>
        <div className="flex border border-[var(--color-border-strong)] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
          >
            <Grid className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-stone-100' : 'hover:bg-stone-50'}`}
          >
            <List className="w-5 h-5 text-[var(--color-text-secondary)]" />
          </button>
        </div>
      </div>

      {/* Assets Display */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-12 text-center">
          <FileImage className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No assets found</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">Add your first content asset to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => {
            const typeConfig = assetTypeConfig[asset.asset_type as AssetType]
            const TypeIcon = typeConfig?.icon || File

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition group"
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-stone-100 relative">
                  {asset.thumbnail_url || (asset.asset_type === 'image' && asset.file_url) ? (
                    <img
                      src={asset.thumbnail_url || asset.file_url!}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${typeConfig?.color || 'bg-stone-100'}`}>
                      <TypeIcon className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {asset.file_url && (
                      <a
                        href={asset.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-lg hover:bg-stone-100 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 text-[var(--color-text)]" />
                      </a>
                    )}
                    <button
                      onClick={() => setMenuOpen(menuOpen === asset.id ? null : asset.id)}
                      className="p-2 bg-white rounded-lg hover:bg-stone-100 transition"
                    >
                      <MoreVertical className="w-4 h-4 text-[var(--color-text)]" />
                    </button>
                  </div>
                  {/* Menu */}
                  {menuOpen === asset.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-2 top-2 w-36 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 py-1">
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-medium text-[var(--color-text)] text-sm truncate">{asset.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {asset.is_global ? 'Global' : getClientName(asset.client_id)}
                    </span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs ${typeConfig?.color || 'bg-stone-100 text-[var(--color-text-secondary)]'}`}>
                      {typeConfig?.label.slice(0, -1) || asset.asset_type}
                    </span>
                  </div>
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {asset.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-stone-100 text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {asset.tags.length > 3 && (
                        <span className="text-xs text-[var(--color-text-muted)]">+{asset.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Asset</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Tags</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Created</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredAssets.map((asset) => {
                const typeConfig = assetTypeConfig[asset.asset_type as AssetType]
                const TypeIcon = typeConfig?.icon || File

                return (
                  <tr key={asset.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig?.color || 'bg-stone-100'}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{asset.name}</p>
                          {asset.description && (
                            <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-[200px]">{asset.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${typeConfig?.color || 'bg-stone-100 text-[var(--color-text-secondary)]'}`}>
                        {typeConfig?.label.slice(0, -1) || asset.asset_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {asset.is_global ? 'Global' : getClientName(asset.client_id)}
                    </td>
                    <td className="px-4 py-3">
                      {asset.tags && asset.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs bg-stone-100 text-[var(--color-text-secondary)] px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {asset.tags.length > 2 && (
                            <span className="text-xs text-[var(--color-text-muted)]">+{asset.tags.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {new Date(asset.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === asset.id ? null : asset.id)}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === asset.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 py-1">
                              {asset.file_url && (
                                <a
                                  href={asset.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-stone-50 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View
                                </a>
                              )}
                              <hr className="my-1" />
                              <button
                                onClick={() => handleDelete(asset.id)}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Add Asset</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Asset name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Type</label>
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value as AssetType })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    {Object.entries(assetTypeConfig).map(([value, config]) => (
                      <option key={value} value={value}>{config.label.slice(0, -1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="e.g., Social Media"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">File URL</label>
                <input
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  rows={2}
                  placeholder="Asset description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="social, listing, luxury"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_global}
                    onChange={(e) => setFormData({ ...formData, is_global: e.target.checked })}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text)]">Global asset (available to all clients)</span>
                </label>
              </div>
              {!formData.is_global && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Client</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.company_name || client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Add Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
