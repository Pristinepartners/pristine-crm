'use client'

import { useState } from 'react'
import { Search, User, Phone, Mail, Building, Linkedin, Filter, X } from 'lucide-react'
import type { DemoAccount, DemoContact } from '@/lib/demo/data'

interface DemoContactsProps {
  account: DemoAccount
}

export function DemoContacts({ account }: DemoContactsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [scoreFilter, setScoreFilter] = useState<string>('')
  const [selectedContact, setSelectedContact] = useState<DemoContact | null>(null)

  const filteredContacts = account.contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
    const matchesScore = !scoreFilter || contact.lead_score === scoreFilter
    return matchesSearch && matchesScore
  })

  const getScoreBadge = (score: string) => {
    switch (score) {
      case 'hot': return 'bg-red-100 text-red-700'
      case 'warm': return 'bg-amber-100 text-amber-700'
      case 'cold': return 'bg-stone-100 text-stone-600'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">Contacts</h1>
            <p className="text-[var(--color-text-secondary)] mt-1">{account.contacts.length} total contacts</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: account.primaryColor }}
          >
            + Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:border-transparent outline-none"
              style={{ '--tw-ring-color': account.primaryColor } as React.CSSProperties}
            />
          </div>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:border-transparent outline-none"
          >
            <option value="">All lead scores</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>

        {/* Results count */}
        {(searchQuery || scoreFilter) && (
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            Showing {filteredContacts.length} of {account.contacts.length} contacts
          </p>
        )}

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Lead Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Added
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-stone-50 cursor-pointer transition"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-[var(--color-text)]">{contact.name}</span>
                        {contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contact.tags.slice(0, 2).map(tag => (
                              <span
                                key={tag.name}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs"
                                style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {contact.tags.length > 2 && (
                              <span className="text-xs text-[var(--color-text-muted)]">+{contact.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {contact.business_name && (
                      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                        <Building className="w-4 h-4" />
                        {contact.business_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Mail className="w-4 h-4" />
                        {contact.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                        <Phone className="w-4 h-4" />
                        {contact.phone}
                      </div>
                      {contact.linkedin_url && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: account.primaryColor }}>
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getScoreBadge(contact.lead_score)}`}>
                      {contact.lead_score.charAt(0).toUpperCase() + contact.lead_score.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                    {contact.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--color-text-secondary)]">
                    {formatDate(contact.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredContacts.length === 0 && (
            <div className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
              No contacts found
            </div>
          )}
        </div>
      </div>

      {/* Contact Detail Sidebar */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end" onClick={() => setSelectedContact(null)}>
          <div
            className="w-[420px] bg-white h-full shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Contact Details</h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-[var(--color-text-secondary)]">
                    {selectedContact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text)]">{selectedContact.name}</h3>
                  {selectedContact.business_name && (
                    <p className="text-[var(--color-text-secondary)]">{selectedContact.business_name}</p>
                  )}
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getScoreBadge(selectedContact.lead_score)}`}>
                    {selectedContact.lead_score.charAt(0).toUpperCase() + selectedContact.lead_score.slice(1)} Lead
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{selectedContact.phone}</span>
                  </div>
                  {selectedContact.city && (
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm text-[var(--color-text-secondary)]">{selectedContact.city}</span>
                    </div>
                  )}
                  {selectedContact.linkedin_url && (
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <span className="text-sm" style={{ color: account.primaryColor }}>LinkedIn Profile</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedContact.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedContact.tags.map(tag => (
                      <span
                        key={tag.name}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div>
                <h4 className="text-sm font-medium text-[var(--color-text)] mb-3">Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Source</span>
                    <span className="text-[var(--color-text)]">{selectedContact.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-secondary)]">Added</span>
                    <span className="text-[var(--color-text)]">{formatDate(selectedContact.created_at)}</span>
                  </div>
                  {selectedContact.last_contacted_at && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)]">Last Contacted</span>
                      <span className="text-[var(--color-text)]">{formatDate(selectedContact.last_contacted_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: account.primaryColor }}
                >
                  Log Activity
                </button>
                <button className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg text-sm font-medium hover:bg-stone-50 transition">
                  Edit Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
