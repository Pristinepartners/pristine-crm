'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Invoice, Client } from '@/lib/supabase/types'
import {
  ArrowLeft,
  Receipt,
  Pencil,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  Plus,
  Calendar,
  Building2,
} from 'lucide-react'

interface InvoiceDetailProps {
  invoice: Invoice
  clients: Client[]
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-stone-100 text-stone-600', icon: FileText },
  sent: { label: 'Sent', color: 'bg-amber-50 text-amber-700', icon: Send },
  paid: { label: 'Paid', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-50 text-red-700', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-stone-100 text-stone-500', icon: Clock },
}

export function InvoiceDetail({ invoice, clients }: InvoiceDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    client_id: invoice.client_id,
    amount: invoice.amount.toString(),
    due_date: invoice.due_date || '',
    description: invoice.description || '',
    line_items: (invoice.line_items && invoice.line_items.length > 0)
      ? invoice.line_items.map(item => ({
          description: item.description,
          amount: item.amount.toString(),
        }))
      : [{ description: '', amount: '' }],
  })

  const client = clients.find(c => c.id === invoice.client_id)
  const status = statusConfig[invoice.status] || statusConfig.draft
  const StatusIcon = status.icon

  const handleSave = async () => {
    setSaving(true)

    const lineItems = formData.line_items
      .filter(item => item.description && item.amount)
      .map(item => ({
        description: item.description,
        amount: parseFloat(item.amount),
      }))

    const { error } = await supabase
      .from('invoices')
      .update({
        client_id: formData.client_id,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date || null,
        description: formData.description || null,
        line_items: lineItems,
      } as any)
      .eq('id', invoice.id)

    if (error) {
      alert(`Error saving: ${error.message}`)
    } else {
      setIsEditing(false)
      router.refresh()
    }
    setSaving(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'paid') {
      updates.paid_date = new Date().toISOString().split('T')[0]
    }
    await supabase.from('invoices').update(updates as any).eq('id', invoice.id)
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    await supabase.from('invoices').delete().eq('id', invoice.id)
    router.push('/invoices')
    router.refresh()
  }

  const addLineItem = () => {
    setFormData({
      ...formData,
      line_items: [...formData.line_items, { description: '', amount: '' }],
    })
  }

  const updateLineItem = (index: number, field: 'description' | 'amount', value: string) => {
    const newLineItems = [...formData.line_items]
    newLineItems[index] = { ...newLineItems[index], [field]: value }

    const total = newLineItems
      .filter(item => item.amount)
      .reduce((sum, item) => sum + parseFloat(item.amount || '0'), 0)

    setFormData({
      ...formData,
      line_items: newLineItems,
      amount: total > 0 ? total.toString() : formData.amount,
    })
  }

  const removeLineItem = (index: number) => {
    const newLineItems = formData.line_items.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      line_items: newLineItems.length ? newLineItems : [{ description: '', amount: '' }],
    })
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/invoices')}
          className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{invoice.invoice_number}</h1>
          <p className="text-[var(--color-text-secondary)]">
            {client?.company_name || client?.name || 'Unknown Client'}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" />
          {status.label}
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-white transition text-[var(--color-text)]"
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount & Status Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Total Amount</p>
                <p className="text-3xl font-bold text-[var(--color-text)]">
                  ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex gap-2">
                {invoice.status === 'draft' && (
                  <button
                    onClick={() => handleStatusChange('sent')}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition"
                  >
                    <Send className="w-4 h-4" />
                    Mark as Sent
                  </button>
                )}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <button
                    onClick={() => handleStatusChange('paid')}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Paid
                  </button>
                )}
                {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    className="flex items-center gap-2 px-3 py-2 border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] rounded-lg hover:bg-stone-50 transition text-sm"
                  >
                    Cancel Invoice
                  </button>
                )}
              </div>
            </div>

            {invoice.description && !isEditing && (
              <div className="pt-4 border-t border-[var(--color-border)]">
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</p>
                <p className="text-[var(--color-text)]">{invoice.description}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Line Items</h2>
            </div>

            {isEditing ? (
              <div className="p-4 space-y-3">
                {formData.line_items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      value={item.amount}
                      onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                      className="w-32 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                      placeholder="Amount"
                    />
                    {formData.line_items.length > 1 && (
                      <button
                        onClick={() => removeLineItem(index)}
                        className="p-2 text-stone-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addLineItem}
                  className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add line item
                </button>
              </div>
            ) : (
              <div>
                {invoice.line_items && invoice.line_items.length > 0 ? (
                  <>
                    <table className="w-full">
                      <thead className="bg-stone-50 border-b border-[var(--color-border)]">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Description</th>
                          <th className="text-right px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-border)]">
                        {invoice.line_items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-[var(--color-text)]">{item.description}</td>
                            <td className="px-4 py-3 text-right font-medium text-[var(--color-text)]">
                              ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-end p-4 border-t border-[var(--color-border)] bg-stone-50">
                      <div className="text-right">
                        <p className="text-sm text-[var(--color-text-secondary)]">Total</p>
                        <p className="text-xl font-bold text-[var(--color-text)]">
                          ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-[var(--color-text-muted)]">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No line items
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Button when editing */}
          {isEditing && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.client_id || !formData.amount}
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Invoice Info */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">
              {isEditing ? 'Edit Details' : 'Invoice Details'}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company_name || c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Total Amount ($)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text)]">
                    {client?.company_name || client?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text)]">
                    ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {invoice.due_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-text)]">
                      Due {new Date(invoice.due_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {invoice.paid_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">
                      Paid {new Date(invoice.paid_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <hr className="my-3 border-[var(--color-border)]" />
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Created {new Date(invoice.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
