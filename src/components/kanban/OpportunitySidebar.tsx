'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import {
  X,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  MessageSquare,
  Plus,
  Clock,
  Copy,
  ExternalLink,
  Trash2,
  PhoneCall,
  FileText,
} from 'lucide-react'
import type { Opportunity, Contact, Activity, Owner, ActivityOutcome, ActivityChannel, LeadScore, Pipeline } from '@/lib/supabase/types'

interface CallScript {
  id: string
  name: string
  content: string
}

interface OpportunitySidebarProps {
  opportunity: Opportunity & { contact: Contact }
  pipelineName: string
  pipelines?: Pipeline[]
  onClose: () => void
  onUpdate: () => void
  onDelete?: (id: string) => void
}

const OUTCOMES: ActivityOutcome[] = [
  'Answered',
  'No Answer',
  'Voicemail',
  'Not Interested',
  'Callback',
  'Meeting Booked',
  'Left Message',
  'Wrong Number',
]

const CHANNELS: ActivityChannel[] = ['Phone', 'LinkedIn', 'Email']

const getLeadScoreColor = (score: LeadScore | null) => {
  switch (score) {
    case 'hot':
      return 'bg-red-100 text-red-700'
    case 'warm':
      return 'bg-orange-100 text-orange-700'
    case 'cold':
      return 'bg-amber-50 text-amber-700'
    default:
      return 'bg-stone-100 text-[var(--color-text)]'
  }
}

const getOutcomeColor = (outcome: string) => {
  const colors: Record<string, string> = {
    Answered: 'bg-green-100 text-green-700',
    'No Answer': 'bg-stone-100 text-[var(--color-text)]',
    Voicemail: 'bg-yellow-100 text-yellow-700',
    'Not Interested': 'bg-red-100 text-red-700',
    Callback: 'bg-amber-50 text-amber-700',
    'Meeting Booked': 'bg-purple-100 text-purple-700',
    'Left Message': 'bg-orange-100 text-orange-700',
    'Wrong Number': 'bg-red-100 text-red-700',
  }
  return colors[outcome] || 'bg-stone-100 text-[var(--color-text)]'
}

export function OpportunitySidebar({
  opportunity,
  pipelineName,
  pipelines = [],
  onClose,
  onUpdate,
  onDelete,
}: OpportunitySidebarProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [showAddActivity, setShowAddActivity] = useState(false)
  const [showScheduleAppointment, setShowScheduleAppointment] = useState(false)
  const [showCallScript, setShowCallScript] = useState(false)
  const [callScripts, setCallScripts] = useState<CallScript[]>([])
  const [selectedScript, setSelectedScript] = useState<CallScript | null>(null)
  const [isEditingOpp, setIsEditingOpp] = useState(false)
  const [oppValue, setOppValue] = useState(opportunity.opportunity_value?.toString() || '')
  const [followUpDate, setFollowUpDate] = useState(opportunity.next_follow_up_date || '')
  const [selectedPipelineId, setSelectedPipelineId] = useState(opportunity.pipeline_id)
  const [selectedStage, setSelectedStage] = useState(opportunity.stage)

  // Get stages for selected pipeline
  const currentPipeline = pipelines.find(p => p.id === selectedPipelineId)
  const availableStages = (currentPipeline?.stages || []) as string[]
  const [savingOpp, setSavingOpp] = useState(false)

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    title: '',
    datetime: '',
    location: '',
    assignedTo: 'alex' as Owner,
  })
  const [savingAppointment, setSavingAppointment] = useState(false)

  // Activity form state
  const [activityForm, setActivityForm] = useState({
    outcome: 'Answered' as ActivityOutcome,
    channel: 'Phone' as ActivityChannel,
    notes: '',
    nextAction: '',
    nextFollowUp: '',
    loggedBy: 'alex' as Owner,
  })
  const [savingActivity, setSavingActivity] = useState(false)

  const supabase = createClient()
  const contact = opportunity.contact

  // Calculate days since last contact
  const daysSinceLastContact = contact.last_contacted_at
    ? Math.floor((new Date().getTime() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  useEffect(() => {
    fetchActivities()
    fetchCallScripts()
  }, [opportunity.id])

  const fetchActivities = async () => {
    setLoadingActivities(true)
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('contact_id', contact.id)
      .order('logged_at', { ascending: false })
      .limit(10)

    setActivities((data || []) as unknown as Activity[])
    setLoadingActivities(false)
  }

  const fetchCallScripts = async () => {
    const { data } = await supabase
      .from('call_scripts')
      .select('*')
      .order('name')
    setCallScripts((data || []) as CallScript[])
    if (data && data.length > 0) {
      setSelectedScript(data[0] as CallScript)
    }
  }

  const handleCopyPhone = () => {
    if (contact.phone) {
      navigator.clipboard.writeText(contact.phone)
    }
  }

  const handleStartCall = () => {
    setShowCallScript(true)
    // Also open phone dialer
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_blank')
    }
  }

  const handleSaveOpp = async () => {
    setSavingOpp(true)
    await supabase
      .from('opportunities')
      .update({
        opportunity_value: oppValue ? parseFloat(oppValue) : null,
        next_follow_up_date: followUpDate || null,
        pipeline_id: selectedPipelineId,
        stage: selectedStage,
      })
      .eq('id', opportunity.id)

    setSavingOpp(false)
    setIsEditingOpp(false)
    onUpdate()
  }

  // Handle pipeline change - reset stage to first stage of new pipeline
  const handlePipelineChange = (newPipelineId: string) => {
    setSelectedPipelineId(newPipelineId)
    const newPipeline = pipelines.find(p => p.id === newPipelineId)
    if (newPipeline && newPipeline.stages.length > 0) {
      setSelectedStage(newPipeline.stages[0])
    }
  }

  // Handle delete opportunity
  const handleDeleteOpportunity = async () => {
    if (!confirm('Are you sure you want to remove this contact from the pipeline?')) return

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', opportunity.id)

    if (error) {
      alert('Error removing from pipeline')
      return
    }

    if (onDelete) {
      onDelete(opportunity.id)
    } else {
      onUpdate()
    }
    onClose()
  }

  const handleScheduleAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointmentForm.title || !appointmentForm.datetime) return

    setSavingAppointment(true)

    const { error } = await supabase.from('appointments').insert({
      contact_id: contact.id,
      title: appointmentForm.title,
      datetime: appointmentForm.datetime,
      location: appointmentForm.location || null,
      status: 'scheduled',
      assigned_to: appointmentForm.assignedTo,
    })

    if (error) {
      alert('Error scheduling appointment')
      setSavingAppointment(false)
      return
    }

    // Also create a task for the assigned user
    await supabase.from('daily_tasks').insert({
      owner: appointmentForm.assignedTo,
      title: `Appointment: ${appointmentForm.title} with ${contact.name}`,
      due_date: appointmentForm.datetime.split('T')[0],
      priority: 'high',
      is_company_wide: false,
      completed: false,
    })

    setAppointmentForm({
      title: '',
      datetime: '',
      location: '',
      assignedTo: 'alex',
    })
    setSavingAppointment(false)
    setShowScheduleAppointment(false)
    onUpdate()
  }

  const handleSubmitActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingActivity(true)

    const { error } = await supabase.from('activities').insert({
      contact_id: contact.id,
      opportunity_id: opportunity.id,
      outcome: activityForm.outcome,
      channel: activityForm.channel,
      notes: activityForm.notes || null,
      next_action: activityForm.nextAction || null,
      logged_by: activityForm.loggedBy,
    })

    if (error) {
      alert('Error logging activity')
      setSavingActivity(false)
      return
    }

    // Update opportunity's next follow-up date if provided
    if (activityForm.nextFollowUp) {
      await supabase
        .from('opportunities')
        .update({ next_follow_up_date: activityForm.nextFollowUp })
        .eq('id', opportunity.id)
    }

    // Update contact's last_contacted_at
    await supabase
      .from('contacts')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', contact.id)

    // Reset form
    setActivityForm({
      outcome: 'Answered',
      channel: 'Phone',
      notes: '',
      nextAction: '',
      nextFollowUp: '',
      loggedBy: 'alex',
    })
    setSavingActivity(false)
    setShowAddActivity(false)
    setShowCallScript(false)
    fetchActivities()
    onUpdate()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">{contact.name}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{pipelineName} - {opportunity.stage}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDeleteOpportunity}
              className="p-2 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Remove from pipeline"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-stone-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact Info */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[var(--color-text-muted)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      opportunity.owner === 'alex'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {opportunity.owner.charAt(0).toUpperCase() + opportunity.owner.slice(1)}
                  </span>
                  {contact.lead_score && (
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getLeadScoreColor(contact.lead_score)}`}>
                      {contact.lead_score.charAt(0).toUpperCase() + contact.lead_score.slice(1)}
                    </span>
                  )}
                  {daysSinceLastContact !== null && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {daysSinceLastContact}d since contact
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {contact.business_name && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Building className="w-4 h-4 text-[var(--color-text-muted)]" />
                  {contact.business_name}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <a href={`tel:${contact.phone}`} className="hover:text-[var(--color-primary)]">
                    {contact.phone}
                  </a>
                  <button
                    onClick={handleCopyPhone}
                    className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] rounded"
                    title="Copy phone"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <Mail className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <a href={`mailto:${contact.email}`} className="hover:text-[var(--color-primary)]">
                    {contact.email}
                  </a>
                </div>
              )}
              {(contact.address || contact.city) && (
                <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                  <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span>
                    {contact.address}
                    {contact.address && contact.city && ', '}
                    {contact.city}
                    {contact.postal_code && ` ${contact.postal_code}`}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {contact.phone && (
                <>
                  <button
                    onClick={handleStartCall}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <PhoneCall className="w-3 h-3" />
                    Call with Script
                  </button>
                  <button
                    onClick={handleCopyPhone}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-stone-100 text-[var(--color-text)] rounded-lg hover:bg-stone-100 transition"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Phone
                  </button>
                </>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs bg-stone-100 text-[var(--color-text)] rounded-lg hover:bg-stone-100 transition"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              )}
              <button
                onClick={() => setShowScheduleAppointment(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition"
              >
                <Calendar className="w-3 h-3" />
                Schedule Appointment
              </button>
              <a
                href={`/contacts/${contact.id}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-stone-100 text-[var(--color-text)] rounded-lg hover:bg-stone-100 transition"
              >
                <ExternalLink className="w-3 h-3" />
                Full Profile
              </a>
            </div>
          </div>

          {/* Call Script Panel */}
          {showCallScript && (
            <div className="p-4 border-b border-[var(--color-border)] bg-green-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-900">Call Script</h3>
                </div>
                <button
                  onClick={() => setShowCallScript(false)}
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  Close
                </button>
              </div>

              {callScripts.length > 0 ? (
                <>
                  <select
                    value={selectedScript?.id || ''}
                    onChange={(e) => {
                      const script = callScripts.find(s => s.id === e.target.value)
                      setSelectedScript(script || null)
                    }}
                    className="w-full px-3 py-2 mb-3 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                  >
                    {callScripts.map(script => (
                      <option key={script.id} value={script.id}>{script.name}</option>
                    ))}
                  </select>

                  {selectedScript && (
                    <div className="p-3 bg-white rounded-lg border border-green-200 text-sm text-[var(--color-text)] whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {selectedScript.content.replace(/\{name\}/g, contact.name).replace(/\{business\}/g, contact.business_name || 'your business')}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-green-700">
                  No call scripts found. Add scripts in Settings.
                </p>
              )}

              {/* Quick Log Activity */}
              <div className="mt-3 pt-3 border-t border-green-200">
                <button
                  onClick={() => setShowAddActivity(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Log Call Result
                </button>
              </div>
            </div>
          )}

          {/* Schedule Appointment Form */}
          {showScheduleAppointment && (
            <div className="p-4 border-b border-[var(--color-border)] bg-amber-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium" style={{ color: 'var(--color-primary)' }}>Schedule Appointment</h3>
                <button
                  onClick={() => setShowScheduleAppointment(false)}
                  className="text-[var(--color-primary)] hover:opacity-90 text-sm"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleScheduleAppointment} className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Title *</label>
                  <input
                    type="text"
                    value={appointmentForm.title}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="Sales Call, Demo, Meeting..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={appointmentForm.datetime}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, datetime: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Location</label>
                  <input
                    type="text"
                    value={appointmentForm.location}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="Zoom, Office, Phone..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Assign To</label>
                  <select
                    value={appointmentForm.assignedTo}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, assignedTo: e.target.value as Owner })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="alex">Alex</option>
                    <option value="mikail">Mikail</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingAppointment}
                  className="w-full py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50"
                >
                  {savingAppointment ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </form>
            </div>
          )}

          {/* Opportunity Details */}
          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-[var(--color-text)]">Opportunity Details</h3>
              {!isEditingOpp && (
                <button
                  onClick={() => setIsEditingOpp(true)}
                  className="text-sm text-[var(--color-primary)]" style={{ color: 'var(--color-primary)' }}
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingOpp ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Pipeline</label>
                  <select
                    value={selectedPipelineId}
                    onChange={(e) => handlePipelineChange(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    {pipelines.length > 0 ? (
                      pipelines.map((pipeline) => (
                        <option key={pipeline.id} value={pipeline.id}>
                          {pipeline.name}
                        </option>
                      ))
                    ) : (
                      <option value={opportunity.pipeline_id}>{pipelineName}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Stage</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    {availableStages.length > 0 ? (
                      availableStages.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))
                    ) : (
                      <option value={opportunity.stage}>{opportunity.stage}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Value</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                      type="number"
                      value={oppValue}
                      onChange={(e) => setOppValue(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Next Follow-up</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingOpp(false)
                      setSelectedPipelineId(opportunity.pipeline_id)
                      setSelectedStage(opportunity.stage)
                    }}
                    className="flex-1 px-3 py-1.5 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveOpp}
                    disabled={savingOpp}
                    className="flex-1 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50"
                  >
                    {savingOpp ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text-secondary)]">
                    Value: {opportunity.opportunity_value
                      ? `$${Number(opportunity.opportunity_value).toLocaleString('en-US')}`
                      : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className={`text-[var(--color-text-secondary)] ${
                    opportunity.next_follow_up_date &&
                    new Date(opportunity.next_follow_up_date) < new Date()
                      ? 'text-red-600 font-medium'
                      : ''
                  }`}>
                    Follow-up: {opportunity.next_follow_up_date
                      ? format(new Date(opportunity.next_follow_up_date), 'MMM d, yyyy')
                      : 'Not set'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Activity Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-[var(--color-text)]">Activity Log</h3>
              <button
                onClick={() => setShowAddActivity(!showAddActivity)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Activity
              </button>
            </div>

            {/* Add Activity Form */}
            {showAddActivity && (
              <form onSubmit={handleSubmitActivity} className="mb-4 p-3 bg-stone-50 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Outcome</label>
                  <select
                    value={activityForm.outcome}
                    onChange={(e) => setActivityForm({ ...activityForm, outcome: e.target.value as ActivityOutcome })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-sm"
                  >
                    {OUTCOMES.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Channel</label>
                  <div className="flex gap-2">
                    {CHANNELS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setActivityForm({ ...activityForm, channel: c })}
                        className={`flex-1 px-2 py-1.5 rounded-lg border text-sm transition ${
                          activityForm.channel === c
                            ? 'bg-amber-50 border-[var(--color-primary)] text-amber-700'
                            : 'border-[var(--color-border-strong)] text-[var(--color-text)] hover:bg-stone-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Notes</label>
                  <textarea
                    value={activityForm.notes}
                    onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-sm resize-none"
                    placeholder="Add notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Next Follow-up</label>
                  <input
                    type="date"
                    value={activityForm.nextFollowUp}
                    onChange={(e) => setActivityForm({ ...activityForm, nextFollowUp: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[var(--color-text-secondary)] mb-1">Logged By</label>
                  <select
                    value={activityForm.loggedBy}
                    onChange={(e) => setActivityForm({ ...activityForm, loggedBy: e.target.value as Owner })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-sm"
                  >
                    <option value="alex">Alex</option>
                    <option value="mikail">Mikail</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddActivity(false)}
                    className="flex-1 px-3 py-1.5 border border-[var(--color-border-strong)] text-[var(--color-text)] rounded-lg hover:bg-stone-50 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingActivity}
                    className="flex-1 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50"
                  >
                    {savingActivity ? 'Logging...' : 'Log Activity'}
                  </button>
                </div>
              </form>
            )}

            {/* Activity List */}
            {loadingActivities ? (
              <div className="text-center py-4 text-[var(--color-text-secondary)] text-sm">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-secondary)]">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                <p className="text-sm">No activities yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-l-2 border-[var(--color-border)] pl-3 py-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getOutcomeColor(activity.outcome)}`}>
                        {activity.outcome}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">{activity.channel}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {format(new Date(activity.logged_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-1">{activity.notes}</p>
                    )}
                    {activity.next_action && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-primary)' }}>Next: {activity.next_action}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
