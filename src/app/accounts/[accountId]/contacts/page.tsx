'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SubAccountContact, SubAccountContactTag } from '@/lib/supabase/types'
import {
  Users,
  Search,
  Flame,
  ThermometerSun,
  Snowflake,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Building2,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'

type LeadFilter = 'all' | 'hot' | 'warm' | 'cold'

export default function ContactsPage() {
  const { accountId } = useParams<{ accountId: string }>()
  const [contacts, setContacts] = useState<SubAccountContact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('all')
  const [selectedContact, setSelectedContact] = useState<SubAccountContact | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadContacts()
  }, [accountId])

  async function loadContacts() {
    setLoading(true)
    const { data: contactsData } = await supabase
      .from('sub_account_contacts')
      .select('*')
      .eq('sub_account_id', accountId)
      .order('created_at', { ascending: false })

    const cList = (contactsData || []) as unknown as SubAccountContact[]
    const contactIds = cList.map(c => c.id)

    let tags: SubAccountContactTag[] = []
    if (contactIds.length > 0) {
      const { data: tagData } = await supabase
        .from('sub_account_contact_tags')
        .select('*')
        .in('contact_id', contactIds)
      tags = (tagData || []) as unknown as SubAccountContactTag[]
    }

    setContacts(cList.map(c => ({ ...c, tags: tags.filter(t => t.contact_id === c.id) })))
    setLoading(false)
  }

  const filtered = contacts.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.business_name?.toLowerCase().includes(search.toLowerCase())
    const matchesLead = leadFilter === 'all' || c.lead_score === leadFilter
    return matchesSearch && matchesLead
  })

  const leadIcon = (score: string) => {
    if (score === 'hot') return <Flame className="w-4 h-4 text-red-500" />
    if (score === 'warm') return <ThermometerSun className="w-4 h-4 text-orange-500" />
    return <Snowflake className="w-4 h-4 text-blue-500" />
  }

  const leadColor = (score: string) => {
    if (score === 'hot') return 'bg-red-100 text-red-700'
    if (score === 'warm') return 'bg-orange-100 text-orange-700'
    return 'bg-blue-100 text-blue-700'
  }

  async function handleAddContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await supabase.from('sub_account_contacts').insert({
      sub_account_id: accountId,
      name: form.get('name') as string,
      email: form.get('email') as string || null,
      phone: form.get('phone') as string || null,
      business_name: form.get('business_name') as string || null,
      city: form.get('city') as string || null,
      lead_score: form.get('lead_score') as string || 'cold',
      source: form.get('source') as string || null,
    })
    setShowAddModal(false)
    loadContacts()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Contacts</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">{contacts.length} total contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none"
          />
        </div>
        <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
          {(['all', 'hot', 'warm', 'cold'] as LeadFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setLeadFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                leadFilter === f ? 'bg-white shadow text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[var(--color-text-secondary)]">Loading contacts...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-16 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">No contacts found</h2>
          <p className="text-[var(--color-text-secondary)]">
            {search || leadFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first contact to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-stone-50">
                <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-4 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-4 py-3">Score</th>
                <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-4 py-3 hidden md:table-cell">Source</th>
                <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Tags</th>
                <th className="text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Last Contacted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-[var(--color-bg-hover)] cursor-pointer transition"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--color-text)] truncate">{contact.name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                          {contact.business_name || contact.email || contact.city || ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${leadColor(contact.lead_score)}`}>
                      {leadIcon(contact.lead_score)}
                      {contact.lead_score}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] hidden md:table-cell">
                    {contact.source || '-'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(contact.tags || []).slice(0, 2).map(tag => (
                        <span
                          key={tag.id}
                          className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {(contact.tags || []).length > 2 && (
                        <span className="text-xs text-[var(--color-text-muted)]">+{(contact.tags || []).length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell">
                    {contact.last_contacted_at
                      ? new Date(contact.last_contacted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Detail Drawer */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedContact(null)}>
          <div
            className="bg-white w-full max-w-lg shadow-xl overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">{selectedContact.name}</h2>
              <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-stone-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-[var(--color-text-secondary)]">
                    {selectedContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--color-text)]">{selectedContact.name}</p>
                  {selectedContact.business_name && (
                    <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> {selectedContact.business_name}
                    </p>
                  )}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${leadColor(selectedContact.lead_score)}`}>
                    {leadIcon(selectedContact.lead_score)}
                    {selectedContact.lead_score} lead
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {selectedContact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={`mailto:${selectedContact.email}`} className="text-[var(--color-text)] hover:underline">{selectedContact.email}</a>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text)]">{selectedContact.phone}</span>
                  </div>
                )}
                {selectedContact.city && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text)]">{selectedContact.city}</span>
                  </div>
                )}
                {selectedContact.linkedin_url && (
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={selectedContact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-text)] hover:underline">LinkedIn Profile</a>
                  </div>
                )}
              </div>

              {(selectedContact.tags || []).length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {(selectedContact.tags || []).map(tag => (
                      <span
                        key={tag.id}
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-[var(--color-text-secondary)]">Source</p>
                  <p className="font-medium text-[var(--color-text)]">{selectedContact.source || 'Unknown'}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3">
                  <p className="text-xs text-[var(--color-text-secondary)]">Engagement</p>
                  <p className="font-medium text-[var(--color-text)]">{selectedContact.engagement_score || 0}</p>
                </div>
              </div>

              {selectedContact.notes && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text)] mb-2">Notes</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{selectedContact.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Add Contact</h2>
            </div>
            <form onSubmit={handleAddContact} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Name *</label>
                <input name="name" required className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Email</label>
                  <input name="email" type="email" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Phone</label>
                  <input name="phone" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Business</label>
                  <input name="business_name" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">City</label>
                  <input name="city" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Lead Score</label>
                  <select name="lead_score" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm">
                    <option value="cold">Cold</option>
                    <option value="warm">Warm</option>
                    <option value="hot">Hot</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Source</label>
                  <input name="source" className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none" placeholder="e.g. Referral" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm hover:bg-stone-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style={{ backgroundColor: 'var(--color-primary)' }}>Add Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
