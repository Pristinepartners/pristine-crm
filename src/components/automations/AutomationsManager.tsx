'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Zap,
  Play,
  Pause,
  Trash2,
  MoreVertical,
  Mail,
  MessageSquare,
  Clock,
  Users,
  GitBranch,
  Bell,
  ChevronRight,
  X,
} from 'lucide-react'

interface Automation {
  id: string
  name: string
  description?: string
  trigger_type: string
  trigger_config: Record<string, any>
  actions: Array<{
    type: string
    config: Record<string, any>
  }>
  status: 'active' | 'paused'
  created_at: string
}

interface Pipeline {
  id: string
  name: string
  stages: string[]
}

interface AutomationsManagerProps {
  automations: Automation[]
  pipelines: Pipeline[]
}

const triggerTypes = [
  { id: 'contact_created', label: 'Contact Created', icon: Users, description: 'When a new contact is added' },
  { id: 'contact_updated', label: 'Contact Updated', icon: Users, description: 'When a contact is modified' },
  { id: 'pipeline_stage_changed', label: 'Pipeline Stage Changed', icon: GitBranch, description: 'When opportunity moves to a stage' },
  { id: 'appointment_booked', label: 'Appointment Booked', icon: Clock, description: 'When an appointment is scheduled' },
  { id: 'form_submitted', label: 'Form Submitted', icon: MessageSquare, description: 'When a form is filled out' },
  { id: 'tag_added', label: 'Tag Added', icon: Bell, description: 'When a tag is added to contact' },
]

const actionTypes = [
  { id: 'send_email', label: 'Send Email', icon: Mail, description: 'Send an email to the contact' },
  { id: 'send_sms', label: 'Send SMS', icon: MessageSquare, description: 'Send a text message' },
  { id: 'add_tag', label: 'Add Tag', icon: Bell, description: 'Add a tag to the contact' },
  { id: 'remove_tag', label: 'Remove Tag', icon: Bell, description: 'Remove a tag from contact' },
  { id: 'move_pipeline', label: 'Move in Pipeline', icon: GitBranch, description: 'Move to a pipeline stage' },
  { id: 'create_task', label: 'Create Task', icon: Clock, description: 'Create a task for follow-up' },
  { id: 'wait', label: 'Wait', icon: Clock, description: 'Wait for a specified time' },
  { id: 'webhook', label: 'Webhook', icon: Zap, description: 'Send data to external URL' },
]

export function AutomationsManager({ automations: initialAutomations, pipelines }: AutomationsManagerProps) {
  const [automations, setAutomations] = useState(initialAutomations)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleToggleStatus = async (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    const isActive = newStatus === 'active'

    setAutomations(prev =>
      prev.map(a => a.id === automation.id ? { ...a, status: newStatus } : a)
    )

    await supabase
      .from('automations')
      .update({ is_active: isActive } as any)
      .eq('id', automation.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return

    setAutomations(prev => prev.filter(a => a.id !== id))
    await supabase.from('automations').delete().eq('id', id)
    setMenuOpen(null)
  }

  const getTriggerIcon = (type: string) => {
    const trigger = triggerTypes.find(t => t.id === type)
    return trigger?.icon || Zap
  }

  const getTriggerLabel = (type: string) => {
    const trigger = triggerTypes.find(t => t.id === type)
    return trigger?.label || type
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Automations</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Automate your workflows and save time</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Create Automation
        </button>
      </div>

      {automations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-12 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No automations yet</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">Create your first automation to streamline your workflow</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            Create Automation
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {automations.map((automation) => {
            const TriggerIcon = getTriggerIcon(automation.trigger_type)
            return (
              <div
                key={automation.id}
                className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      automation.status === 'active' ? 'bg-green-50' : 'bg-stone-100'
                    }`}>
                      <TriggerIcon className={`w-6 h-6 ${
                        automation.status === 'active' ? 'text-green-600' : 'text-[var(--color-text-muted)]'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">{automation.name}</h3>
                      {automation.description && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{automation.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          Trigger: {getTriggerLabel(automation.trigger_type)}
                        </span>
                        <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)]" />
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          {automation.actions?.length || 0} action{automation.actions?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(automation)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        automation.status === 'active'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-stone-100 text-[var(--color-text-secondary)] hover:bg-gray-200'
                      }`}
                    >
                      {automation.status === 'active' ? (
                        <>
                          <Pause className="w-3 h-3" />
                          Active
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Paused
                        </>
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === automation.id ? null : automation.id)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {menuOpen === automation.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 py-1">
                            <button
                              onClick={() => {
                                setEditingAutomation(automation)
                                setShowCreateModal(true)
                                setMenuOpen(null)
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-stone-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(automation.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <AutomationModal
          automation={editingAutomation}
          pipelines={pipelines}
          onClose={() => {
            setShowCreateModal(false)
            setEditingAutomation(null)
          }}
          onSave={() => {
            setShowCreateModal(false)
            setEditingAutomation(null)
            router.refresh()
          }}
        />
      )}
    </>
  )
}

function AutomationModal({
  automation,
  pipelines,
  onClose,
  onSave,
}: {
  automation: Automation | null
  pipelines: Pipeline[]
  onClose: () => void
  onSave: () => void
}) {
  const [step, setStep] = useState<'trigger' | 'actions' | 'review'>('trigger')
  const [name, setName] = useState(automation?.name || '')
  const [description, setDescription] = useState(automation?.description || '')
  const [triggerType, setTriggerType] = useState(automation?.trigger_type || '')
  const [triggerConfig, setTriggerConfig] = useState(automation?.trigger_config || {})
  const [actions, setActions] = useState<Array<{ type: string; config: Record<string, any> }>>(
    automation?.actions || []
  )
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleAddAction = (type: string) => {
    setActions([...actions, { type, config: {} }])
  }

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const handleUpdateActionConfig = (index: number, config: Record<string, any>) => {
    setActions(actions.map((a, i) => i === index ? { ...a, config } : a))
  }

  const handleSave = async () => {
    if (!name || !triggerType) return
    setSaving(true)

    const data = {
      name,
      description: description || null,
      trigger_type: triggerType,
      trigger_config: triggerConfig,
      actions,
      status: 'paused',
    }

    if (automation) {
      await supabase
        .from('automations')
        .update(data)
        .eq('id', automation.id)
    } else {
      await supabase.from('automations').insert(data)
    }

    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {automation ? 'Edit Automation' : 'Create Automation'}
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-[var(--color-border)]">
          {(['trigger', 'actions', 'review'] as const).map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                step === s
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 'trigger' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Automation Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g., Welcome Email Sequence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Select Trigger *</label>
                <div className="grid grid-cols-2 gap-3">
                  {triggerTypes.map((trigger) => (
                    <button
                      key={trigger.id}
                      type="button"
                      onClick={() => setTriggerType(trigger.id)}
                      className={`p-3 border rounded-lg text-left transition ${
                        triggerType === trigger.id
                          ? 'border-[var(--color-primary)] bg-amber-50'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <trigger.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                        <span className="font-medium text-sm text-[var(--color-text)]">{trigger.label}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)]">{trigger.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {triggerType === 'pipeline_stage_changed' && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-stone-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Pipeline</label>
                    <select
                      value={triggerConfig.pipeline_id || ''}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, pipeline_id: e.target.value, stage: '' })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                    >
                      <option value="">Select pipeline</option>
                      {pipelines.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">Stage</label>
                    <select
                      value={triggerConfig.stage || ''}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, stage: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                    >
                      <option value="">Any stage</option>
                      {pipelines.find(p => p.id === triggerConfig.pipeline_id)?.stages.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'actions' && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)]">Add actions that will run when the trigger fires.</p>

              {actions.length > 0 && (
                <div className="space-y-3">
                  {actions.map((action, index) => {
                    const actionType = actionTypes.find(a => a.id === action.type)
                    const ActionIcon = actionType?.icon || Zap
                    return (
                      <div key={index} className="p-3 border border-[var(--color-border)] rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-xs font-medium text-[var(--color-text-secondary)]">
                              {index + 1}
                            </span>
                            <ActionIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                            <span className="font-medium text-sm">{actionType?.label}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveAction(index)}
                            className="p-1 text-[var(--color-text-muted)] hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {action.type === 'send_email' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Email subject"
                              value={action.config.subject || ''}
                              onChange={(e) => handleUpdateActionConfig(index, { ...action.config, subject: e.target.value })}
                              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                            />
                            <textarea
                              placeholder="Email body"
                              value={action.config.body || ''}
                              onChange={(e) => handleUpdateActionConfig(index, { ...action.config, body: e.target.value })}
                              rows={3}
                              className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                            />
                          </div>
                        )}

                        {action.type === 'send_sms' && (
                          <textarea
                            placeholder="SMS message"
                            value={action.config.message || ''}
                            onChange={(e) => handleUpdateActionConfig(index, { ...action.config, message: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                          />
                        )}

                        {action.type === 'wait' && (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Duration"
                              value={action.config.duration || ''}
                              onChange={(e) => handleUpdateActionConfig(index, { ...action.config, duration: e.target.value })}
                              className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                            />
                            <select
                              value={action.config.unit || 'minutes'}
                              onChange={(e) => handleUpdateActionConfig(index, { ...action.config, unit: e.target.value })}
                              className="px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        )}

                        {(action.type === 'add_tag' || action.type === 'remove_tag') && (
                          <input
                            type="text"
                            placeholder="Tag name"
                            value={action.config.tag || ''}
                            onChange={(e) => handleUpdateActionConfig(index, { ...action.config, tag: e.target.value })}
                            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                          />
                        )}

                        {action.type === 'create_task' && (
                          <input
                            type="text"
                            placeholder="Task title"
                            value={action.config.title || ''}
                            onChange={(e) => handleUpdateActionConfig(index, { ...action.config, title: e.target.value })}
                            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                          />
                        )}

                        {action.type === 'webhook' && (
                          <input
                            type="url"
                            placeholder="Webhook URL"
                            value={action.config.url || ''}
                            onChange={(e) => handleUpdateActionConfig(index, { ...action.config, url: e.target.value })}
                            className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Add Action</label>
                <div className="grid grid-cols-2 gap-2">
                  {actionTypes.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleAddAction(action.id)}
                      className="flex items-center gap-2 p-2 border border-[var(--color-border)] rounded-lg hover:border-amber-300 hover:bg-amber-50 transition text-left"
                    >
                      <action.icon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                      <span className="text-sm text-[var(--color-text)]">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-lg">
                <h3 className="font-medium text-[var(--color-text)] mb-2">{name || 'Untitled Automation'}</h3>
                {description && <p className="text-sm text-[var(--color-text-secondary)] mb-3">{description}</p>}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">Trigger:</span>
                    <span className="text-sm text-[var(--color-text)]">{getTriggerLabel(triggerType)}</span>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)] uppercase">Actions:</span>
                    <div className="mt-1 space-y-1">
                      {actions.map((action, i) => {
                        const actionType = actionTypes.find(a => a.id === action.type)
                        return (
                          <div key={i} className="text-sm text-[var(--color-text)] flex items-center gap-2">
                            <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                              {i + 1}
                            </span>
                            {actionType?.label}
                          </div>
                        )
                      })}
                      {actions.length === 0 && (
                        <p className="text-sm text-[var(--color-text-muted)]">No actions added</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 border-t border-[var(--color-border)]">
          {step !== 'trigger' && (
            <button
              onClick={() => setStep(step === 'actions' ? 'trigger' : 'actions')}
              className="px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50">
            Cancel
          </button>
          {step === 'review' ? (
            <button
              onClick={handleSave}
              disabled={saving || !name || !triggerType}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Saving...' : automation ? 'Update' : 'Create'}
            </button>
          ) : (
            <button
              onClick={() => setStep(step === 'trigger' ? 'actions' : 'review')}
              disabled={step === 'trigger' && (!name || !triggerType)}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getTriggerLabel(type: string) {
  const trigger = triggerTypes.find(t => t.id === type)
  return trigger?.label || type
}
