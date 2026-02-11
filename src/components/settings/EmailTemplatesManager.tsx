'use client'

import { useState, useEffect } from 'react'
import { Mail, Plus, Trash2, Edit2, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { EmailTemplate } from '@/lib/supabase/types'

export function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from('email_templates')
      .select('*')
      .order('name')
    setTemplates((data || []) as EmailTemplate[])
  }

  const openModal = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setTemplateForm({ name: template.name, subject: template.subject, content: template.content })
    } else {
      setEditingTemplate(null)
      setTemplateForm({ name: '', subject: '', content: '' })
    }
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) return

    setSaving(true)

    if (editingTemplate) {
      const { data, error } = await supabase
        .from('email_templates')
        .update({
          name: templateForm.name,
          subject: templateForm.subject,
          content: templateForm.content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTemplate.id)
        .select()
        .single()

      if (!error && data) {
        setTemplates(templates.map(t => t.id === data.id ? data as EmailTemplate : t))
      }
    } else {
      const { data, error } = await supabase
        .from('email_templates')
        .insert({
          name: templateForm.name,
          subject: templateForm.subject,
          content: templateForm.content,
        })
        .select()
        .single()

      if (!error && data) {
        setTemplates([...templates, data as EmailTemplate])
      }
    }

    setSaving(false)
    setShowModal(false)
    setTemplateForm({ name: '', subject: '', content: '' })
    setEditingTemplate(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (!error) {
      setTemplates(templates.filter(t => t.id !== id))
    }
  }

  const handleCopy = async (template: EmailTemplate) => {
    const text = `Subject: ${template.subject}\n\n${template.content}`
    await navigator.clipboard.writeText(text)
    setCopiedId(template.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Email Templates</h2>
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        </div>

        <div className="p-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-secondary)]">
              <Mail className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-2" />
              <p>No email templates yet</p>
              <p className="text-sm">Create reusable templates for common emails</p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map(template => (
                <div key={template.id} className="flex items-start gap-4 p-3 bg-stone-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[var(--color-text)]">{template.name}</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                      <span className="font-medium">Subject:</span> {template.subject}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-1">{template.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(template)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-gray-200 rounded-lg"
                      title="Copy template"
                    >
                      {copiedId === template.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal(template)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-gray-200 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--color-text-secondary)] mt-4">
            Tip: Use {'{{name}}'}, {'{{business}}'}, and {'{{email}}'} as placeholders - they&apos;ll be replaced with actual contact info.
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTemplate ? 'Edit Template' : 'New Email Template'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingTemplate(null); setTemplateForm({ name: '', subject: '', content: '' }) }}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g., Follow-up Email, Introduction..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g., Following up on our conversation, {{name}}!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Email Content *
                </label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none"
                  placeholder={`Hi {{name}},

I hope this email finds you well. I wanted to follow up on our recent conversation about...

[Your content here]

Best regards,
[Your name]`}
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Available placeholders: {'{{name}}'} - Contact name, {'{{business}}'} - Business name, {'{{email}}'} - Contact email
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); setEditingTemplate(null); setTemplateForm({ name: '', subject: '', content: '' }) }}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
