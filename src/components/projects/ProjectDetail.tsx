'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Project, Client, ProjectTask, Owner, ProjectType, ProjectStatus } from '@/lib/supabase/types'
import {
  ArrowLeft,
  FolderKanban,
  Building2,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  GripVertical,
} from 'lucide-react'

interface ProjectDetailProps {
  project: Project
  client: Client | undefined
  tasks: ProjectTask[]
  allClients: Client[]
}

const projectTypeLabels: Record<ProjectType, string> = {
  website: 'Website',
  landing_page: 'Landing Page',
  rebrand: 'Rebrand',
  seo_campaign: 'SEO Campaign',
  social_campaign: 'Social Campaign',
  ad_campaign: 'Ad Campaign',
  content_creation: 'Content Creation',
  other: 'Other',
}

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-stone-100 text-stone-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700' },
  review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

const priorityColors: Record<string, string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
}

export function ProjectDetail({ project, client, tasks: initialTasks, allClients }: ProjectDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tasks, setTasks] = useState(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    client_id: project.client_id,
    project_type: project.project_type,
    status: project.status,
    priority: project.priority,
    description: project.description || '',
    due_date: project.due_date || '',
    budget: project.budget?.toString() || '',
    assigned_to: project.assigned_to || 'alex',
  })

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('projects')
      .update({
        name: formData.name,
        client_id: formData.client_id,
        project_type: formData.project_type,
        status: formData.status,
        priority: formData.priority,
        description: formData.description || null,
        due_date: formData.due_date || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        assigned_to: formData.assigned_to,
      } as any)
      .eq('id', project.id)

    if (error) {
      alert(`Error saving: ${error.message}`)
    } else {
      setIsEditing(false)
      router.refresh()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return
    await supabase.from('projects').delete().eq('id', project.id)
    router.push('/projects')
    router.refresh()
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    setAddingTask(true)

    const { data, error } = await supabase
      .from('project_tasks')
      .insert({
        project_id: project.id,
        title: newTaskTitle.trim(),
        status: 'pending',
        sort_order: tasks.length,
      } as any)
      .select()
      .single()

    if (!error && data) {
      setTasks([...tasks, data as unknown as ProjectTask])
      setNewTaskTitle('')
    }
    setAddingTask(false)
  }

  const handleToggleTask = async (task: ProjectTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await supabase
      .from('project_tasks')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
      } as any)
      .eq('id', task.id)

    setTasks(tasks.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ))
  }

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from('project_tasks').delete().eq('id', taskId)
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const status = statusConfig[project.status]
  const isOverdue = project.due_date &&
    new Date(project.due_date) < new Date() &&
    project.status !== 'completed' &&
    project.status !== 'cancelled'

  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/projects')}
          className="p-2 text-[var(--color-text-muted)] hover:text-gray-600 hover:bg-stone-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{project.name}</h1>
          {client && (
            <Link href={`/clients/${client.id}`} className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
              {client.company_name || client.name}
            </Link>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[project.priority]}`}>
          {project.priority}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${isOverdue ? 'bg-red-100 text-red-700' : status.color}`}>
          {isOverdue ? 'Overdue' : status.label}
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--color-border-strong)] rounded-lg hover:bg-stone-50 transition"
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
          {/* Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[var(--color-text)]">Progress</h2>
              <span className="text-sm text-[var(--color-text-secondary)]">{completedTasks} of {tasks.length} tasks</span>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-3">
              <div
                className="bg-[var(--color-primary)] h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-sm text-[var(--color-text-secondary)] mt-1">{progress}% complete</p>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">Tasks</h2>
            </div>
            <div className="p-4">
              {/* Add Task */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button
                  onClick={handleAddTask}
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Task List */}
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-secondary)]">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)]" />
                  No tasks yet. Add one above.
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        task.status === 'completed' ? 'bg-stone-50 border-[var(--color-border)]' : 'bg-white border-[var(--color-border)]'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-[var(--color-border-strong)] hover:border-green-500'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      </button>
                      <span className={`flex-1 ${task.status === 'completed' ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}`}>
                        {task.title}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-[var(--color-text-muted)] hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && !isEditing && (
            <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6">
              <h2 className="font-semibold text-[var(--color-text)] mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info / Edit Form */}
          <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4">
            <h2 className="font-semibold text-[var(--color-text)] mb-4">
              {isEditing ? 'Edit Project' : 'Project Details'}
            </h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    {allClients.map(c => (
                      <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value as ProjectType })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    {Object.entries(projectTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    >
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <option key={value} value={value}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' })}
                      className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={formData.assigned_to}
                    onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value as Owner })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  >
                    <option value="alex">Alex</option>
                    <option value="mikail">Mikail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    rows={4}
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="w-full px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FolderKanban className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-gray-600">{projectTypeLabels[project.project_type]}</span>
                </div>
                {project.due_date && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-[var(--color-text-muted)]'}`} />
                    <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      Due {new Date(project.due_date).toLocaleDateString()}
                      {isOverdue && ' (Overdue)'}
                    </span>
                  </div>
                )}
                {project.budget && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-gray-600">Budget: ${project.budget.toLocaleString('en-US')}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                  <span className="text-gray-600">
                    Created {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                {project.assigned_to && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span className="text-gray-600 capitalize">Assigned to: {project.assigned_to}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Client Card */}
          {client && (
            <Link
              href={`/clients/${client.id}`}
              className="block bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-4 hover:shadow-md transition"
            >
              <h2 className="font-semibold text-[var(--color-text)] mb-3">Client</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[var(--color-text-secondary)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text)]">{client.name}</p>
                  {client.company_name && (
                    <p className="text-sm text-[var(--color-text-secondary)]">{client.company_name}</p>
                  )}
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
