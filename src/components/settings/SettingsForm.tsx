'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Mail, Palette, Calendar, Save, Building, Upload, FileText, Plus, Trash2, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { UserSettings, Pipeline, Owner } from '@/lib/supabase/types'
import { TagsManager } from './TagsManager'
import { EmailTemplatesManager } from './EmailTemplatesManager'

interface BrandingSettings {
  logo_url?: string
  company_name?: string
  primary_color?: string
  secondary_color?: string
  accent_color?: string
}

interface CallScript {
  id: string
  name: string
  content: string
}

interface SettingsFormProps {
  settings: UserSettings
  pipelines: Pipeline[]
  currentUser: Owner
  isNew: boolean
  branding?: BrandingSettings
}

export function SettingsForm({ settings, pipelines, currentUser, isNew, branding }: SettingsFormProps) {
  const [form, setForm] = useState({
    follow_up_reminder_enabled: settings.follow_up_reminder_enabled ?? true,
    follow_up_reminder_time: settings.follow_up_reminder_time ?? '07:00',
    email_notifications: settings.email_notifications ?? false,
    theme: settings.theme ?? 'light',
    default_pipeline_id: settings.default_pipeline_id ?? '',
  })
  const [brandingForm, setBrandingForm] = useState<BrandingSettings>({
    logo_url: branding?.logo_url ?? '',
    company_name: branding?.company_name ?? 'Pristine Partners',
    primary_color: branding?.primary_color ?? '#2563EB',
    secondary_color: branding?.secondary_color ?? '#151617',
    accent_color: branding?.accent_color ?? '#10B981',
  })
  const [callScripts, setCallScripts] = useState<CallScript[]>([])
  const [editingScript, setEditingScript] = useState<CallScript | null>(null)
  const [showScriptModal, setShowScriptModal] = useState(false)
  const [scriptForm, setScriptForm] = useState({ name: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [savingScript, setSavingScript] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCallScripts()
  }, [])

  const fetchCallScripts = async () => {
    const { data } = await supabase
      .from('call_scripts')
      .select('*')
      .order('name')
    setCallScripts((data || []) as CallScript[])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const settingsData = {
      owner: currentUser,
      follow_up_reminder_enabled: form.follow_up_reminder_enabled,
      follow_up_reminder_time: form.follow_up_reminder_time,
      email_notifications: form.email_notifications,
      theme: form.theme,
      default_pipeline_id: form.default_pipeline_id || null,
    }

    if (isNew) {
      await supabase.from('user_settings').insert(settingsData)
    } else {
      await supabase
        .from('user_settings')
        .update(settingsData)
        .eq('id', settings.id)
    }

    // Save branding settings
    const { data: existingBranding } = await supabase
      .from('branding_settings')
      .select('id')
      .single()

    if (existingBranding) {
      await supabase
        .from('branding_settings')
        .update(brandingForm)
        .eq('id', existingBranding.id)
    } else {
      await supabase.from('branding_settings').insert(brandingForm)
    }

    setSaving(false)
    setSaved(true)
    router.refresh()

    // Hide saved message after 3 seconds
    setTimeout(() => setSaved(false), 3000)
  }

  const openScriptModal = (script?: CallScript) => {
    if (script) {
      setEditingScript(script)
      setScriptForm({ name: script.name, content: script.content })
    } else {
      setEditingScript(null)
      setScriptForm({ name: '', content: '' })
    }
    setShowScriptModal(true)
  }

  const handleSaveScript = async () => {
    if (!scriptForm.name.trim() || !scriptForm.content.trim()) return

    setSavingScript(true)

    if (editingScript) {
      const { data, error } = await supabase
        .from('call_scripts')
        .update({ name: scriptForm.name, content: scriptForm.content })
        .eq('id', editingScript.id)
        .select()
        .single()

      if (!error && data) {
        setCallScripts(callScripts.map(s => s.id === data.id ? data as CallScript : s))
      }
    } else {
      const { data, error } = await supabase
        .from('call_scripts')
        .insert({ name: scriptForm.name, content: scriptForm.content })
        .select()
        .single()

      if (!error && data) {
        setCallScripts([...callScripts, data as CallScript])
      }
    }

    setSavingScript(false)
    setShowScriptModal(false)
    setScriptForm({ name: '', content: '' })
    setEditingScript(null)
  }

  const handleDeleteScript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return

    const { error } = await supabase
      .from('call_scripts')
      .delete()
      .eq('id', id)

    if (!error) {
      setCallScripts(callScripts.filter(s => s.id !== id))
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Branding Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <Building className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Branding</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={brandingForm.company_name}
                onChange={(e) => setBrandingForm({ ...brandingForm, company_name: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                placeholder="Your Company Name"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Logo URL
              </label>
              <input
                type="text"
                value={brandingForm.logo_url}
                onChange={(e) => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                placeholder="https://your-logo-url.com/logo.png"
              />
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Enter a URL to your logo image (recommended size: 200x50px)
              </p>
              {brandingForm.logo_url && (
                <div className="mt-2 p-3 bg-stone-50 rounded-lg">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">Preview:</p>
                  <img
                    src={brandingForm.logo_url}
                    alt="Logo preview"
                    className="h-10 object-contain"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--color-border)]">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.primary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                    className="w-10 h-10 rounded border border-[var(--color-border-strong)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.primary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Buttons, links</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Sidebar Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.secondary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                    className="w-10 h-10 rounded border border-[var(--color-border-strong)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.secondary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Sidebar background</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.accent_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                    className="w-10 h-10 rounded border border-[var(--color-border-strong)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.accent_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, accent_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Success states</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call Scripts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[var(--color-text-secondary)]" />
              <h2 className="font-semibold text-[var(--color-text)]">Call Scripts</h2>
            </div>
            <button
              type="button"
              onClick={() => openScriptModal()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Add Script
            </button>
          </div>

          <div className="p-4">
            {callScripts.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <FileText className="w-10 h-10 mx-auto text-[var(--color-text-muted)] mb-2" />
                <p>No call scripts yet</p>
                <p className="text-sm">Create scripts to use during sales calls</p>
              </div>
            ) : (
              <div className="space-y-3">
                {callScripts.map(script => (
                  <div key={script.id} className="flex items-start gap-4 p-3 bg-stone-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--color-text)]">{script.name}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 mt-1">{script.content}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openScriptModal(script)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-gray-200 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteScript(script.id)}
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
              Tip: Use {'{{name}}'} and {'{{business}}'} as placeholders - they'll be replaced with actual contact info during calls.
            </p>
          </div>
        </div>

        {/* Tags Section */}
        <TagsManager />

        {/* Email Templates Section */}
        <EmailTemplatesManager />

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Notifications</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Follow-up Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--color-text)]">Daily Follow-up Reminder</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Get notified about contacts that need follow-up
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.follow_up_reminder_enabled}
                  onChange={(e) => setForm({ ...form, follow_up_reminder_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-primary-light)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--color-border-strong)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
              </label>
            </div>

            {/* Reminder Time */}
            {form.follow_up_reminder_enabled && (
              <div className="ml-0 pl-0 border-l-0">
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={form.follow_up_reminder_time}
                  onChange={(e) => setForm({ ...form, follow_up_reminder_time: e.target.value })}
                  className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  You&apos;ll receive a notification at this time with contacts due for follow-up
                </p>
              </div>
            )}

            {/* Email Notifications */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
              <div>
                <p className="font-medium text-[var(--color-text)]">Email Notifications</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Receive notifications via email (in addition to in-app)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.email_notifications}
                  onChange={(e) => setForm({ ...form, email_notifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-primary-light)] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[var(--color-border-strong)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <Palette className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Appearance</h2>
          </div>

          <div className="p-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Theme
            </label>
            <div className="flex gap-3">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setForm({ ...form, theme })}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                    form.theme === theme
                      ? 'border-[var(--color-primary)] bg-amber-50/50 text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                  }`}
                >
                  <span className="font-medium capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Defaults Section */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[var(--color-text-secondary)]" />
            <h2 className="font-semibold text-[var(--color-text)]">Defaults</h2>
          </div>

          <div className="p-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Default Pipeline
            </label>
            <select
              value={form.default_pipeline_id}
              onChange={(e) => setForm({ ...form, default_pipeline_id: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
            >
              <option value="">No default</option>
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              This pipeline will be selected by default when adding new opportunities
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>

          {saved && (
            <span className="text-green-600 text-sm font-medium">
              Settings saved successfully!
            </span>
          )}
        </div>
      </form>

      {/* Script Modal */}
      {showScriptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingScript ? 'Edit Script' : 'New Call Script'}
              </h2>
              <button
                onClick={() => { setShowScriptModal(false); setEditingScript(null); setScriptForm({ name: '', content: '' }) }}
                className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Script Name *
                </label>
                <input
                  type="text"
                  value={scriptForm.name}
                  onChange={(e) => setScriptForm({ ...scriptForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g., Cold Call Intro, Follow-up Script..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                  Script Content *
                </label>
                <textarea
                  value={scriptForm.content}
                  onChange={(e) => setScriptForm({ ...scriptForm, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none"
                  placeholder={`Hi {name}! This is [Your Name] from [Company].

I'm reaching out because...

[Continue with your script]

Use {name} and {business} as placeholders.`}
                />
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Available placeholders: {'{{name}}'} - Contact name, {'{{business}}'} - Business name
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-stone-50 flex justify-end gap-3">
              <button
                onClick={() => { setShowScriptModal(false); setEditingScript(null); setScriptForm({ name: '', content: '' }) }}
                className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveScript}
                disabled={savingScript || !scriptForm.name.trim() || !scriptForm.content.trim()}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {savingScript ? 'Saving...' : editingScript ? 'Save Changes' : 'Create Script'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
