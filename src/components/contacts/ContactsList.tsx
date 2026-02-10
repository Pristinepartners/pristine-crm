'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, Search, User, Phone, Mail, Building, Download, Upload, Users, Filter, Linkedin, X, Tag as TagIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Contact, Owner, Pipeline, Tag } from '@/lib/supabase/types'
import { QuickLogActivityButton } from '@/components/forms/QuickLogActivityButton'

interface ContactWithTags extends Contact {
  contact_tags?: { tag: Tag }[]
}

interface ContactsListProps {
  contacts: ContactWithTags[]
  pipelines?: Pipeline[]
  tags?: Tag[]
}

type FilterField = 'all' | 'has_phone' | 'has_email' | 'has_linkedin' | 'no_phone' | 'no_email'

export function ContactsList({ contacts: initialContacts, pipelines = [], tags: initialTags = [] }: ContactsListProps) {
  const [contacts, setContacts] = useState(initialContacts)
  const [allTags, setAllTags] = useState<Tag[]>(initialTags)
  const [searchQuery, setSearchQuery] = useState('')
  const [ownerFilter, setOwnerFilter] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string>('')
  const [activeFilters, setActiveFilters] = useState<FilterField[]>([])
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [showBulkAddModal, setShowBulkAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone?.includes(searchQuery)
    const matchesOwner = !ownerFilter || contact.owner === ownerFilter

    // Tag filter
    const matchesTag = !tagFilter || contact.contact_tags?.some(ct => ct.tag?.id === tagFilter)

    // Apply active filters
    let matchesFilters = true
    for (const filter of activeFilters) {
      switch (filter) {
        case 'has_phone':
          if (!contact.phone) matchesFilters = false
          break
        case 'has_email':
          if (!contact.email) matchesFilters = false
          break
        case 'has_linkedin':
          if (!contact.linkedin_url) matchesFilters = false
          break
        case 'no_phone':
          if (contact.phone) matchesFilters = false
          break
        case 'no_email':
          if (contact.email) matchesFilters = false
          break
      }
    }

    return matchesSearch && matchesOwner && matchesTag && matchesFilters
  })

  const toggleFilter = (filter: FilterField) => {
    setActiveFilters(prev => {
      if (prev.includes(filter)) {
        return prev.filter(f => f !== filter)
      }
      // Remove conflicting filters
      let newFilters = [...prev, filter]
      if (filter === 'has_phone') newFilters = newFilters.filter(f => f !== 'no_phone')
      if (filter === 'no_phone') newFilters = newFilters.filter(f => f !== 'has_phone')
      if (filter === 'has_email') newFilters = newFilters.filter(f => f !== 'no_email')
      if (filter === 'no_email') newFilters = newFilters.filter(f => f !== 'has_email')
      return newFilters
    })
  }

  const clearFilters = () => {
    setActiveFilters([])
    setOwnerFilter('')
    setTagFilter('')
  }

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(contactId)) {
        newSet.delete(contactId)
      } else {
        newSet.add(contactId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set())
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)))
    }
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Business', 'Owner', 'Lead Score', 'Source', 'LinkedIn', 'Created']
    const csvData = contacts.map(c => [
      c.name,
      c.email || '',
      c.phone || '',
      c.business_name || '',
      c.owner,
      c.lead_score || '',
      c.source || '',
      c.linkedin_url || '',
      format(new Date(c.created_at), 'yyyy-MM-dd')
    ])

    const csv = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filterOptions = [
    { id: 'has_phone', label: 'Has Phone', icon: Phone },
    { id: 'no_phone', label: 'No Phone', icon: Phone },
    { id: 'has_email', label: 'Has Email', icon: Mail },
    { id: 'no_email', label: 'No Email', icon: Mail },
    { id: 'has_linkedin', label: 'Has LinkedIn', icon: Linkedin },
  ]

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">{contacts.length} total contacts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedContacts.size > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedContacts.size} contact{selectedContacts.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedContacts(new Set())}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear selection
            </button>
            {pipelines.length > 0 && (
              <button
                onClick={() => setShowBulkAddModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Users className="w-4 h-4" />
                Add to Pipeline
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="">All owners</option>
          <option value="alex">Alex</option>
          <option value="mikail">Mikail</option>
        </select>
        {allTags.length > 0 && (
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All tags</option>
            {allTags.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
        )}
        <button
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
            activeFilters.length > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilters.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Filter by</h3>
            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => {
              const Icon = option.icon
              const isActive = activeFilters.includes(option.id as FilterField)
              return (
                <button
                  key={option.id}
                  onClick={() => toggleFilter(option.id as FilterField)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {option.label}
                  {isActive && <X className="w-3 h-3" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilters.length > 0 && !showFiltersPanel && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {activeFilters.map(filter => (
            <span
              key={filter}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
            >
              {filterOptions.find(f => f.id === filter)?.label}
              <button onClick={() => toggleFilter(filter)} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results count */}
      {(activeFilters.length > 0 || searchQuery || ownerFilter) && (
        <p className="mb-4 text-sm text-gray-500">
          Showing {filteredContacts.length} of {contacts.length} contacts
        </p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 w-16">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredContacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/contacts/${contact.id}`)}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.id)}
                    onChange={() => handleSelectContact(contact.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{contact.name}</span>
                      {contact.contact_tags && contact.contact_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {contact.contact_tags.slice(0, 3).map(ct => ct.tag && (
                            <span
                              key={ct.tag.id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                              style={{ backgroundColor: `${ct.tag.color}20`, color: ct.tag.color }}
                            >
                              {ct.tag.name}
                            </span>
                          ))}
                          {contact.contact_tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{contact.contact_tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {contact.business_name && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="w-4 h-4" />
                      {contact.business_name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </div>
                    )}
                    {contact.linkedin_url && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      contact.owner === 'alex'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {contact.owner.charAt(0).toUpperCase() + contact.owner.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(contact.created_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <QuickLogActivityButton
                    contactId={contact.id}
                    defaultOwner={contact.owner}
                    compact
                    onSuccess={() => router.refresh()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContacts.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            No contacts found
          </div>
        )}
      </div>

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(newContact) => {
            setContacts([newContact, ...contacts])
            setShowAddModal(false)
          }}
        />
      )}

      {showBulkAddModal && (
        <BulkAddToPipelineModal
          contactIds={Array.from(selectedContacts)}
          pipelines={pipelines}
          onClose={() => setShowBulkAddModal(false)}
          onSuccess={() => {
            setShowBulkAddModal(false)
            setSelectedContacts(new Set())
            router.refresh()
          }}
        />
      )}

      {showImportModal && (
        <CSVImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={(importedContacts) => {
            setContacts([...importedContacts, ...contacts])
            setShowImportModal(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

function AddContactModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (contact: Contact) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [owner, setOwner] = useState<Owner>('alex')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        business_name: businessName || null,
        linkedin_url: linkedinUrl || null,
        owner,
        organization_id: crypto.randomUUID(),
      })
      .select()
      .single()

    if (error || !data) {
      setLoading(false)
      alert('Error creating contact')
      return
    }

    onSuccess(data as unknown as Contact)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Contact</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner *
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value as Owner)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="alex">Alex</option>
              <option value="mikail">Mikail</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BulkAddToPipelineModal({
  contactIds,
  pipelines,
  onClose,
  onSuccess,
}: {
  contactIds: string[]
  pipelines: Pipeline[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedPipeline, setSelectedPipeline] = useState<string>(pipelines[0]?.id || '')
  const [selectedStage, setSelectedStage] = useState<string>('')
  const [owner, setOwner] = useState<Owner>('alex')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const currentPipeline = pipelines.find(p => p.id === selectedPipeline)
  const stages = currentPipeline?.stages || []

  useEffect(() => {
    if (stages.length > 0 && !selectedStage) {
      setSelectedStage(stages[0])
    }
  }, [selectedPipeline, stages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPipeline || !selectedStage) return

    setLoading(true)

    // Check which contacts are already in any pipeline
    const { data: existingOpportunities } = await supabase
      .from('opportunities')
      .select('id, contact_id, pipeline_id')
      .in('contact_id', contactIds)

    const contactsInPipeline = new Set((existingOpportunities || []).map(o => o.contact_id))

    // Delete existing opportunities for contacts that will be moved
    if (existingOpportunities && existingOpportunities.length > 0) {
      const oppIds = existingOpportunities.map(o => o.id)
      await supabase.from('opportunities').delete().in('id', oppIds)
    }

    // Create new opportunities for all contacts
    const opportunities = contactIds.map(contactId => ({
      contact_id: contactId,
      pipeline_id: selectedPipeline,
      stage: selectedStage,
      owner,
    }))

    const { error } = await supabase
      .from('opportunities')
      .insert(opportunities)

    if (error) {
      setLoading(false)
      alert('Error adding to pipeline')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add to Pipeline</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Adding {contactIds.length} contact{contactIds.length !== 1 ? 's' : ''} to pipeline
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pipeline *
            </label>
            <select
              value={selectedPipeline}
              onChange={(e) => {
                setSelectedPipeline(e.target.value)
                setSelectedStage('')
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage *
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner *
            </label>
            <select
              value={owner}
              onChange={(e) => setOwner(e.target.value as Owner)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="alex">Alex</option>
              <option value="mikail">Mikail</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedStage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add to Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CSVImportModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: (contacts: Contact[]) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [defaultOwner, setDefaultOwner] = useState<Owner>('alex')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload')
  const supabase = createClient()

  const fieldOptions = [
    { value: '', label: 'Skip this column' },
    { value: 'name', label: 'Name *' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'business_name', label: 'Business Name' },
    { value: 'address', label: 'Address' },
    { value: 'city', label: 'City' },
    { value: 'postal_code', label: 'Postal Code' },
    { value: 'website', label: 'Website' },
    { value: 'linkedin_url', label: 'LinkedIn URL' },
    { value: 'source', label: 'Source' },
    { value: 'notes', label: 'Notes' },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const parsed = lines.map(line => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      })

      if (parsed.length > 0) {
        setHeaders(parsed[0])
        setPreview(parsed.slice(1, 6))

        // Auto-map columns based on header names
        const autoMapping: Record<string, string> = {}
        parsed[0].forEach((header, index) => {
          const h = header.toLowerCase().trim()
          if (h.includes('name') && !h.includes('business')) autoMapping[index.toString()] = 'name'
          else if (h.includes('email') || h.includes('e-mail')) autoMapping[index.toString()] = 'email'
          else if (h.includes('phone') || h.includes('tel')) autoMapping[index.toString()] = 'phone'
          else if (h.includes('business') || h.includes('company')) autoMapping[index.toString()] = 'business_name'
          else if (h.includes('address') && !h.includes('email')) autoMapping[index.toString()] = 'address'
          else if (h.includes('city')) autoMapping[index.toString()] = 'city'
          else if (h.includes('postal') || h.includes('zip')) autoMapping[index.toString()] = 'postal_code'
          else if (h.includes('website') || (h.includes('url') && !h.includes('linkedin'))) autoMapping[index.toString()] = 'website'
          else if (h.includes('linkedin')) autoMapping[index.toString()] = 'linkedin_url'
          else if (h.includes('source')) autoMapping[index.toString()] = 'source'
          else if (h.includes('note')) autoMapping[index.toString()] = 'notes'
        })
        setColumnMapping(autoMapping)
        setStep('map')
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file) return

    // Check if name column is mapped
    const hasNameMapping = Object.values(columnMapping).includes('name')
    if (!hasNameMapping) {
      alert('Please map at least the Name column')
      return
    }

    setLoading(true)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const parsed = lines.map(line => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      })

      const dataRows = parsed.slice(1)
      const contactsToInsert = dataRows
        .map(row => {
          const contact: Record<string, string | null> = {
            owner: defaultOwner,
            organization_id: crypto.randomUUID(),
          }
          Object.entries(columnMapping).forEach(([colIndex, field]) => {
            if (field && row[parseInt(colIndex)]) {
              contact[field] = row[parseInt(colIndex)]
            }
          })
          return contact
        })
        .filter(c => c.name)

      if (contactsToInsert.length === 0) {
        alert('No valid contacts found in CSV')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert(contactsToInsert as any)
        .select()

      if (error) {
        alert(`Error importing contacts: ${error.message}`)
        setLoading(false)
        return
      }

      onSuccess((data || []) as unknown as Contact[])
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Import Contacts from CSV</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Select a CSV file to import</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file"
                />
                <label
                  htmlFor="csv-file"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                >
                  Choose File
                </label>
              </div>
              <div className="text-sm text-gray-500">
                <p className="font-medium mb-1">Expected CSV format:</p>
                <p>Name, Email, Phone, Business Name, Address, City, Postal Code, Website, LinkedIn URL, Source, Notes</p>
              </div>
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Map your CSV columns to contact fields. The Name field is required.
              </p>

              <div className="space-y-3">
                {headers.map((header, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-40 text-sm font-medium text-gray-700 truncate" title={header}>
                      {header}
                    </span>
                    <select
                      value={columnMapping[index.toString()] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [index.toString()]: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      {fieldOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Owner for Imported Contacts
                </label>
                <select
                  value={defaultOwner}
                  onChange={(e) => setDefaultOwner(e.target.value as Owner)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="alex">Alex</option>
                  <option value="mikail">Mikail</option>
                </select>
              </div>

              {preview.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview (first {preview.length} rows):</p>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          {headers.map((h, i) => (
                            <th key={i} className="px-2 py-1 text-left font-medium text-gray-500 border">
                              {columnMapping[i.toString()] || '(skip)'}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {preview.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 border text-gray-600 truncate max-w-[150px]">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          {step === 'map' && (
            <button
              onClick={handleImport}
              disabled={loading || !Object.values(columnMapping).includes('name')}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Importing...' : 'Import Contacts'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
