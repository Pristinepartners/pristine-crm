'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Plus,
  MessageSquare,
  Pencil,
  X,
  MapPin,
  Globe,
  Linkedin,
  FileText,
  Clock,
  Copy,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Contact, Activity, Opportunity, Appointment, Pipeline, Owner, LeadScore, ContactTag } from '@/lib/supabase/types'
import { LogActivityModal } from '@/components/forms/LogActivityModal'
import { AddAppointmentModal } from '@/components/forms/AddAppointmentModal'
import { ContactTagsEditor } from './ContactTagsEditor'
import { LeadScoreBreakdown } from './LeadScoreBreakdown'
import { ContactTimeline } from './ContactTimeline'

interface OpportunityWithPipeline extends Opportunity {
  pipeline: Pipeline
}

interface ContactDetailProps {
  contact: Contact
  activities: Activity[]
  opportunities: OpportunityWithPipeline[]
  appointments: Appointment[]
  pipelines: Pipeline[]
  contactTags?: ContactTag[]
}

const LEAD_SCORES: LeadScore[] = ['hot', 'warm', 'cold']

const getLeadScoreColor = (score: LeadScore | null) => {
  switch (score) {
    case 'hot':
      return 'bg-red-100 text-red-700'
    case 'warm':
      return 'bg-orange-100 text-orange-700'
    case 'cold':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function ContactDetail({
  contact: initialContact,
  activities: initialActivities,
  opportunities,
  appointments: initialAppointments,
  pipelines,
  contactTags: initialContactTags = [],
}: ContactDetailProps) {
  const [contact, setContact] = useState(initialContact)
  const [activities, setActivities] = useState(initialActivities)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [currentOpportunities, setCurrentOpportunities] = useState(opportunities)
  const [showLogActivity, setShowLogActivity] = useState(false)
  const [showAddAppointment, setShowAddAppointment] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingOppId, setEditingOppId] = useState<string | null>(null)
  const [oppPipelineId, setOppPipelineId] = useState('')
  const [oppStage, setOppStage] = useState('')
  const [oppValue, setOppValue] = useState('')
  const [savingOpp, setSavingOpp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: contact.name,
    email: contact.email || '',
    phone: contact.phone || '',
    business_name: contact.business_name || '',
    address: contact.address || '',
    city: contact.city || '',
    postal_code: contact.postal_code || '',
    website: contact.website || '',
    linkedin_url: contact.linkedin_url || '',
    notes: contact.notes || '',
    source: contact.source || '',
    lead_score: contact.lead_score || 'cold',
    owner: contact.owner,
  })

  const handleStartEdit = () => {
    setEditForm({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      business_name: contact.business_name || '',
      address: contact.address || '',
      city: contact.city || '',
      postal_code: contact.postal_code || '',
      website: contact.website || '',
      linkedin_url: contact.linkedin_url || '',
      notes: contact.notes || '',
      source: contact.source || '',
      lead_score: contact.lead_score || 'cold',
      owner: contact.owner,
    })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    setSaving(true)

    const updateData = {
      name: editForm.name,
      email: editForm.email || null,
      phone: editForm.phone || null,
      business_name: editForm.business_name || null,
      address: editForm.address || null,
      city: editForm.city || null,
      postal_code: editForm.postal_code || null,
      website: editForm.website || null,
      linkedin_url: editForm.linkedin_url || null,
      notes: editForm.notes || null,
      source: editForm.source || null,
      lead_score: editForm.lead_score,
      owner: editForm.owner,
    }

    console.log('Updating contact with data:', updateData)
    console.log('Contact ID:', contact.id)

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', contact.id)
      .select()
      .single()

    setSaving(false)

    if (error) {
      console.error('Update error:', error)
      alert(`Error updating contact: ${error.message}`)
      return
    }

    if (!data) {
      console.error('No data returned from update')
      alert('Error updating contact: No data returned')
      return
    }

    console.log('Update successful:', data)
    setContact(data as unknown as Contact)
    setIsEditing(false)
    router.refresh()
  }

  const handleCopyPhone = () => {
    if (contact.phone) {
      navigator.clipboard.writeText(contact.phone)
    }
  }

  const handleEmailClick = () => {
    if (contact.email) {
      window.location.href = `mailto:${contact.email}`
    }
  }

  const handleStartEditOpp = (opp: OpportunityWithPipeline) => {
    setEditingOppId(opp.id)
    setOppPipelineId(opp.pipeline_id)
    setOppStage(opp.stage)
    setOppValue(opp.opportunity_value?.toString() || '')
  }

  const handleCancelEditOpp = () => {
    setEditingOppId(null)
    setOppPipelineId('')
    setOppStage('')
    setOppValue('')
  }

  const handleSaveOpp = async (oppId: string) => {
    setSavingOpp(true)
    const { error } = await supabase
      .from('opportunities')
      .update({
        pipeline_id: oppPipelineId,
        stage: oppStage,
        opportunity_value: oppValue ? parseFloat(oppValue) : null,
      })
      .eq('id', oppId)

    setSavingOpp(false)

    if (error) {
      alert(`Error updating opportunity: ${error.message}`)
      return
    }

    // Update local state
    const newPipeline = pipelines.find(p => p.id === oppPipelineId)
    setCurrentOpportunities(prev =>
      prev.map(o =>
        o.id === oppId
          ? { ...o, pipeline_id: oppPipelineId, stage: oppStage, opportunity_value: oppValue ? parseFloat(oppValue) : null, pipeline: newPipeline! }
          : o
      )
    )
    handleCancelEditOpp()
    router.refresh()
  }

  const handleDeleteOpp = async (oppId: string) => {
    if (!confirm('Remove this contact from the pipeline?')) return

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', oppId)

    if (error) {
      alert(`Error removing from pipeline: ${error.message}`)
      return
    }

    setCurrentOpportunities(prev => prev.filter(o => o.id !== oppId))
    router.refresh()
  }

  const getStagesForPipeline = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId)
    return (pipeline?.stages || []) as string[]
  }

  const getOutcomeColor = (outcome: string) => {
    const colors: Record<string, string> = {
      Answered: 'bg-green-100 text-green-700',
      'No Answer': 'bg-gray-100 text-gray-700',
      Voicemail: 'bg-yellow-100 text-yellow-700',
      'Not Interested': 'bg-red-100 text-red-700',
      Callback: 'bg-blue-100 text-blue-700',
      'Meeting Booked': 'bg-purple-100 text-purple-700',
      'Left Message': 'bg-orange-100 text-orange-700',
      'Wrong Number': 'bg-red-100 text-red-700',
    }
    return colors[outcome] || 'bg-gray-100 text-gray-700'
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Phone':
        return <Phone className="w-4 h-4" />
      case 'Email':
        return <Mail className="w-4 h-4" />
      case 'LinkedIn':
        return <MessageSquare className="w-4 h-4" />
      default:
        return null
    }
  }

  const daysSinceLastContact = contact.last_contacted_at
    ? Math.floor((new Date().getTime() - new Date(contact.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/contacts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contacts
        </Link>
        {!isEditing && (
          <button
            onClick={handleStartEdit}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <Pencil className="w-4 h-4" />
            Edit Contact
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {isEditing ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Edit Contact</h2>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={editForm.business_name}
                    onChange={(e) => setEditForm({ ...editForm, business_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={editForm.postal_code}
                      onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={editForm.linkedin_url}
                    onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input
                    type="text"
                    value={editForm.source}
                    onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Where did this lead come from?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lead Score</label>
                  <select
                    value={editForm.lead_score}
                    onChange={(e) => setEditForm({ ...editForm, lead_score: e.target.value as LeadScore })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {LEAD_SCORES.map((score) => (
                      <option key={score} value={score}>
                        {score.charAt(0).toUpperCase() + score.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner *</label>
                  <select
                    value={editForm.owner}
                    onChange={(e) => setEditForm({ ...editForm, owner: e.target.value as Owner })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="alex">Alex</option>
                    <option value="mikail">Mikail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Additional notes about this contact..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={saving || !editForm.name}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{contact.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          contact.owner === 'alex'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {contact.owner.charAt(0).toUpperCase() + contact.owner.slice(1)}
                      </span>
                      {contact.lead_score && (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getLeadScoreColor(contact.lead_score)}`}>
                          {contact.lead_score.charAt(0).toUpperCase() + contact.lead_score.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mb-6">
                  {contact.phone && (
                    <button
                      onClick={handleCopyPhone}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      title="Copy phone number"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Phone
                    </button>
                  )}
                  {contact.email && (
                    <button
                      onClick={handleEmailClick}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      title="Send email"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {contact.business_name && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Building className="w-5 h-5 text-gray-400" />
                      {contact.business_name}
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {(contact.address || contact.city || contact.postal_code) && (
                    <div className="flex items-start gap-3 text-gray-600">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        {contact.address && <div>{contact.address}</div>}
                        {(contact.city || contact.postal_code) && (
                          <div>
                            {contact.city}
                            {contact.city && contact.postal_code && ', '}
                            {contact.postal_code}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a
                        href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        {contact.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {contact.linkedin_url && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Linkedin className="w-5 h-5 text-gray-400" />
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        LinkedIn Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                  {contact.source && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">Source: {contact.source}</span>
                    </div>
                  )}
                  {contact.last_contacted_at && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">
                        Last contact: {format(new Date(contact.last_contacted_at), 'MMM d, yyyy')}
                        {daysSinceLastContact !== null && (
                          <span className="text-gray-400 ml-1">({daysSinceLastContact} days ago)</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-gray-500 text-sm pt-2">
                    <Calendar className="w-4 h-4" />
                    Created {format(new Date(contact.created_at), 'MMM d, yyyy')}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <ContactTagsEditor contactId={contact.id} initialTags={initialContactTags} />
                </div>

                {/* Lead Score Breakdown */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Lead Score</h3>
                  <LeadScoreBreakdown
                    leadScore={contact.lead_score}
                    activities={activities}
                    appointments={appointments}
                    opportunities={currentOpportunities}
                    lastContactedAt={contact.last_contacted_at}
                  />
                </div>

                {/* Notes Section */}
                {contact.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Opportunities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pipeline</h2>
            {currentOpportunities.length === 0 ? (
              <p className="text-gray-500 text-sm">Not in any pipeline</p>
            ) : (
              <div className="space-y-3">
                {currentOpportunities.map((opp) => (
                  <div key={opp.id}>
                    {editingOppId === opp.id ? (
                      <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Pipeline</label>
                          <select
                            value={oppPipelineId}
                            onChange={(e) => {
                              setOppPipelineId(e.target.value)
                              const stages = getStagesForPipeline(e.target.value)
                              if (stages.length > 0) setOppStage(stages[0])
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            {pipelines.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Stage</label>
                          <select
                            value={oppStage}
                            onChange={(e) => setOppStage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                          >
                            {getStagesForPipeline(oppPipelineId).map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Value ($)</label>
                          <input
                            type="number"
                            value={oppValue}
                            onChange={(e) => setOppValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancelEditOpp}
                            className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveOpp(opp.id)}
                            disabled={savingOpp}
                            className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50"
                          >
                            {savingOpp ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <Link href={`/pipelines/${opp.pipeline_id}`} className="flex-1">
                            <div className="font-medium text-gray-900 hover:text-blue-600">{opp.pipeline?.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Stage: {opp.stage}
                              {opp.opportunity_value && (
                                <span className="ml-2">
                                  · ${Number(opp.opportunity_value).toLocaleString('en-US')}
                                </span>
                              )}
                            </div>
                          </Link>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEditOpp(opp)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOpp(opp.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Remove from pipeline"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
              <button
                onClick={() => setShowAddAppointment(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-sm">No appointments scheduled</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{apt.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(apt.datetime), 'MMM d, yyyy h:mm a')}
                    </div>
                    {apt.location && (
                      <div className="text-sm text-gray-500">{apt.location}</div>
                    )}
                    <span
                      className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                        apt.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : apt.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : apt.status === 'no_show'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
              <button
                onClick={() => setShowLogActivity(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Log Activity
              </button>
            </div>

            <ContactTimeline
              activities={activities}
              appointments={appointments}
              contactCreatedAt={contact.created_at}
            />
          </div>
        </div>
      </div>

      {showLogActivity && (
        <LogActivityModal
          contactId={contact.id}
          opportunities={opportunities}
          onClose={() => setShowLogActivity(false)}
          onSuccess={(newActivity) => {
            setActivities([newActivity, ...activities])
            setShowLogActivity(false)
            // Update last_contacted_at locally
            setContact({ ...contact, last_contacted_at: newActivity.logged_at })
            router.refresh()
          }}
        />
      )}

      {showAddAppointment && (
        <AddAppointmentModal
          contactId={contact.id}
          opportunities={opportunities}
          onClose={() => setShowAddAppointment(false)}
          onSuccess={(newAppointment) => {
            setAppointments([newAppointment, ...appointments])
            setShowAddAppointment(false)
            router.refresh()
          }}
        />
      )}
    </>
  )
}
