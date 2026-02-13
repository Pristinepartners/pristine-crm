'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Plus, Users, DollarSign, Briefcase, Trash2, BarChart3, Database } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SubAccount } from '@/lib/supabase/types'
import { seedSubAccountData } from '@/lib/sub-accounts/seed'

interface AccountsManagerProps {
  accounts: SubAccount[]
}

export function AccountsManager({ accounts: initialAccounts }: AccountsManagerProps) {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [seedMessage, setSeedMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSeedData = async () => {
    setSeeding(true)
    setSeedMessage('')
    try {
      const result = await seedSubAccountData(supabase as any)
      setSeedMessage(result.message)
      if (result.success) {
        router.refresh()
      }
    } catch (err: any) {
      setSeedMessage('Error: ' + (err.message || 'Failed to seed data'))
    }
    setSeeding(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-account and all its data?')) return
    await supabase.from('sub_accounts').delete().eq('id', id)
    setAccounts(prev => prev.filter(a => a.id !== id))
    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Sub-Accounts</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Manage client sub-accounts with full CRM capabilities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {accounts.length === 0 && (
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              {seeding ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          )}
          <Link
            href="/accounts/analytics"
            className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50 transition text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition text-sm"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" />
            Create Sub-Account
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${seedMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {seedMessage}
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-16 text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-muted)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-2">No sub-accounts yet</h2>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
            Create a new sub-account or seed demo data to get started with the sub-account system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function AccountCard({ account, onDelete }: { account: SubAccount; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition">
      <div className="h-2" style={{ backgroundColor: account.primary_color }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ border: `2px solid ${account.primary_color}` }}
            >
              <span
                className="text-lg font-semibold"
                style={{ color: account.primary_color, fontFamily: 'var(--font-playfair), Playfair Display, Georgia, serif' }}
              >
                {account.logo_initial}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">{account.company_name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{account.industry}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onDelete(account.id) }}
            className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] mb-4">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {(account.pipeline_stages as string[]).length} stages
          </span>
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'}`}
          >
            {account.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <Link
          href={`/accounts/${account.id}`}
          className="block w-full text-center px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
          style={{ backgroundColor: account.primary_color }}
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  )
}

function CreateAccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    company_name: '',
    industry: 'Real Estate',
    primary_color: '#2563eb',
    secondary_color: '#0f172a',
    logo_initial: '',
    pipeline_stages: 'New Lead, Qualified, Proposal, Negotiation, Closed Won',
  })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const stages = form.pipeline_stages.split(',').map(s => s.trim()).filter(Boolean)
    await supabase.from('sub_accounts').insert({
      name: form.name,
      company_name: form.company_name,
      industry: form.industry,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      logo_initial: form.logo_initial || form.name.charAt(0).toUpperCase(),
      pipeline_stages: JSON.stringify(stages),
    })
    setSaving(false)
    onCreated()
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Create Sub-Account</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Account Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none"
              placeholder="e.g. Luxe Realty Group"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Company Name</label>
            <input
              type="text"
              required
              value={form.company_name}
              onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Industry</label>
              <select
                value={form.industry}
                onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
              >
                <option>Real Estate</option>
                <option>Financial Services</option>
                <option>Insurance</option>
                <option>Legal</option>
                <option>Healthcare</option>
                <option>Technology</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Logo Initial</label>
              <input
                type="text"
                maxLength={2}
                value={form.logo_initial}
                onChange={e => setForm(f => ({ ...f, logo_initial: e.target.value }))}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none"
                placeholder="L"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={form.primary_color}
                  onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={form.secondary_color}
                  onChange={e => setForm(f => ({ ...f, secondary_color: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Pipeline Stages (comma-separated)</label>
            <input
              type="text"
              value={form.pipeline_stages}
              onChange={e => setForm(f => ({ ...f, pipeline_stages: e.target.value }))}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm hover:bg-stone-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
