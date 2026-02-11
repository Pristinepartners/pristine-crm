'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Client, Project, Invoice, PropertyListing, Owner } from '@/lib/supabase/types'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  FolderKanban,
  Receipt,
  Home,
  Plus,
  User,
  Users,
} from 'lucide-react'

interface ClientDetailProps {
  client: Client
  projects: Project[]
  invoices: Invoice[]
  properties: PropertyListing[]
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

export function ClientDetail({ client, projects, invoices, properties }: ClientDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    company_name: client.company_name || '',
    company_type: client.company_type || 'solo_agent',
    website_url: client.website_url || '',
    address: client.address || '',
    city: client.city || '',
    state: client.state || '',
    subscription_tier: client.subscription_tier,
    subscription_status: client.subscription_status,
    monthly_fee: client.monthly_fee?.toString() || '',
    notes: client.notes || '',
    owner: client.owner,
  })

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('clients')
      .update({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        company_type: formData.company_type,
        website_url: formData.website_url || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        subscription_tier: formData.subscription_tier,
        subscription_status: formData.subscription_status,
        monthly_fee: formData.monthly_fee ? parseFloat(formData.monthly_fee) : null,
        notes: formData.notes || null,
        owner: formData.owner,
      } as any)
      .eq('id', client.id)

    if (error) {
      alert(`Error saving: ${error.message}`)
    } else {
      setIsEditing(false)
      router.refresh()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client? This will also delete all associated projects, invoices, and properties.')) return

    await supabase.from('clients').delete().eq('id', client.id)
    router.push('/clients')
    router.refresh()
  }

  const TypeIcon = companyTypeIcons[client.company_type || 'solo_agent'] || Building2

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.amount, 0)
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'pending')

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/clients')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            {client.logo_url ? (
              <img src={client.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TypeIcon className="w-6 h-6 text-[var(--color-text-secondary)]" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">{client.name}</h1>
              {client.company_name && (
                <p className="text-[var(--color-text-secondary)]">{client.company_name}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${tierColors[client.subscription_tier]}`}>
            {client.subscription_tier}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[client.subscription_status]}`}>
            {client.subscription_status}
          </span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-gray-50 transition"
        >
          <Pencil className="w-4 h-4" />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)]">Monthly Fee</p>
              <p className="text-xl font-bold text-[var(--color-text)]">
                {client.monthly_fee ? `$${client.monthly_fee.toLocaleString('en-US')}` : '-'}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)]">Active Projects</p>
              <p className="text-xl font-bold text-[var(--color-text)]">{activeProjects.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)]">Total Invoiced</p>
              <p className="text-xl font-bold text-[var(--color-text)]">${totalInvoiced.toLocaleString('en-US')}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
              <p className="text-sm text-[var(--color-text-secondary)]">Total Paid</p>
              <p className="text-xl font-bold text-green-600">${totalPaid.toLocaleString('en-US')}</p>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Projects ({projects.length})</h2>
              <Link
                href={`/projects?client=${client.id}`}
                className="text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                View all
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                No projects yet
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-4 hover:bg-[var(--color-bg-hover)] transition"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{project.name}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{project.project_type.replace('_', ' ')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Invoices ({invoices.length})</h2>
              <Link
                href={`/invoices?client=${client.id}`}
                className="text-sm font-medium"
                style={{ color: 'var(--color-primary)' }}
              >
                View all
              </Link>
            </div>
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <Receipt className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                No invoices yet
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{invoice.invoice_number}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">{invoice.description || 'No description'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[var(--color-text)]">${invoice.amount.toLocaleString('en-US')}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info / Edit Form */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">
              {isEditing ? 'Edit Client' : 'Contact Information'}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.subscription_status}
                      onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="trial">Trial</option>
                      <option value="paused">Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee ($)</label>
                  <input
                    type="number"
                    value={formData.monthly_fee}
                    onChange={(e) => setFormData({ ...formData, monthly_fee: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <select
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value as Owner })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="alex">Alex</option>
                    <option value="mikail">Mikail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {client.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={`mailto:${client.email}`} style={{ color: 'var(--color-primary)' }} className="hover:underline">
                      {client.email}
                    </a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={`tel:${client.phone}`} className="text-[var(--color-text)]">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.website_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={client.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }} className="hover:underline truncate">
                      {client.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {(client.city || client.state) && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text)]">
                      {[client.city, client.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Client since {new Date(client.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-secondary)] capitalize">
                    Owner: {client.owner}
                  </span>
                </div>
                {client.notes && (
                  <>
                    <hr className="my-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                      <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Properties */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Properties ({properties.length})</h2>
            </div>
            {properties.length === 0 ? (
              <div className="p-6 text-center text-[var(--color-text-secondary)]">
                <Home className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                No properties
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {properties.slice(0, 3).map((property) => (
                  <div key={property.id} className="p-4">
                    <p className="font-medium text-[var(--color-text)] text-sm">{property.address}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {property.city}, {property.state}
                    </p>
                    {property.price && (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        ${property.price.toLocaleString('en-US')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
