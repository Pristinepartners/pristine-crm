'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Client, Owner } from '@/lib/supabase/types'
import {
  Building2,
  Users,
  User,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Filter,
} from 'lucide-react'

interface ClientsListProps {
  clients: Client[]
}

const companyTypeLabels: Record<string, string> = {
  solo_agent: 'Solo Agent',
  team: 'Team',
  brokerage: 'Brokerage',
}

const companyTypeIcons: Record<string, React.ElementType> = {
  solo_agent: User,
  team: Users,
  brokerage: Building2,
}

const tierColors: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-700',
  professional: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-yellow-100 text-yellow-700',
  paused: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function ClientsList({ clients }: ClientsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOwner, setFilterOwner] = useState<Owner | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_name: '',
    company_type: 'solo_agent' as const,
    website_url: '',
    subscription_tier: 'starter' as const,
    monthly_fee: '',
    owner: 'alex' as Owner,
  })

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOwner = filterOwner === 'all' || client.owner === filterOwner
    const matchesStatus = filterStatus === 'all' || client.subscription_status === filterStatus
    return matchesSearch && matchesOwner && matchesStatus
  })

  const handleCreate = async () => {
    if (!formData.name.trim()) return
    setCreating(true)

    const { error } = await supabase.from('clients').insert({
      name: formData.name.trim(),
      email: formData.email || null,
      phone: formData.phone || null,
      company_name: formData.company_name || null,
      company_type: formData.company_type,
      website_url: formData.website_url || null,
      subscription_tier: formData.subscription_tier,
      monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
      owner: formData.owner,
    } as unknown as any)

    if (error) {
      alert(`Error creating client: ${error.message}`)
      setCreating(false)
      return
    }

    setShowCreateModal(false)
    setCreating(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company_name: '',
      company_type: 'solo_agent',
      website_url: '',
      subscription_tier: 'starter',
      monthly_fee: '',
      owner: 'alex',
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated projects and invoices.')) return

    await supabase.from('clients').delete().eq('id', id)
    setMenuOpen(null)
    router.refresh()
  }

  const totalMRR = clients
    .filter(c => c.subscription_status === 'active')
    .reduce((sum, c) => sum + (c.monthly_fee || 0), 0)

  const activeCount = clients.filter(c => c.subscription_status === 'active').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Clients</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage your real estate agent and brokerage clients</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 15%, transparent)' }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Total Clients</p>
              <p className="text-xl font-bold text-[var(--color-text)]">{clients.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Active Clients</p>
              <p className="text-xl font-bold text-[var(--color-text)]">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Monthly Recurring</p>
              <p className="text-xl font-bold text-[var(--color-text)]">${totalMRR.toLocaleString('en-US')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value as Owner | 'all')}
          className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        >
          <option value="all">All Owners</option>
          <option value="alex">Alex</option>
          <option value="mikail">Mikail</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="paused">Paused</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-12 text-center">
          <Building2 className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No clients found</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">Add your first client to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const TypeIcon = companyTypeIcons[client.company_type || 'solo_agent'] || User
            return (
              <div
                key={client.id}
                className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/clients/${client.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-[var(--color-text-secondary)]" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-[var(--color-text)]">{client.name}</h3>
                      {client.company_name && (
                        <p className="text-sm text-[var(--color-text-secondary)]">{client.company_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(menuOpen === client.id ? null : client.id)
                      }}
                      className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-gray-100 rounded-lg transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpen === client.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(null) }} />
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/clients/${client.id}`)
                              setMenuOpen(null)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(client.id)
                            }}
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

                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Phone className="w-4 h-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.website_url && (
                    <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{client.website_url.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[client.subscription_tier]}`}>
                      {client.subscription_tier}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[client.subscription_status]}`}>
                      {client.subscription_status}
                    </span>
                  </div>
                  {client.monthly_fee && (
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      ${client.monthly_fee.toLocaleString('en-US')}/mo
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Add New Client</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="John Smith"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Smith Realty"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                  <select
                    value={formData.company_type}
                    onChange={(e) => setFormData({ ...formData, company_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="solo_agent">Solo Agent</option>
                    <option value="team">Team</option>
                    <option value="brokerage">Brokerage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Owner</label>
                  <select
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value as Owner })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="alex">Alex</option>
                    <option value="mikail">Mikail</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="https://smithrealty.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Tier</label>
                  <select
                    value={formData.subscription_tier}
                    onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
                  <input
                    type="number"
                    value={formData.monthly_fee}
                    onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="499"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
