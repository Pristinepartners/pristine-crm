'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project, Client, Owner, ProjectType, ProjectStatus } from '@/lib/supabase/types'
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Filter,
} from 'lucide-react'

interface ProjectsManagerProps {
  projects: Project[]
  clients: Client[]
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

const statusConfig: Record<ProjectStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-stone-100 text-stone-700', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-amber-50 text-amber-700', icon: AlertCircle },
  review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  on_hold: { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: PauseCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
}

const priorityColors: Record<string, string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
}

export function ProjectsManager({ projects, clients }: ProjectsManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all')
  const [filterClient, setFilterClient] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    project_type: 'website' as ProjectType,
    priority: 'medium' as const,
    description: '',
    due_date: '',
    budget: '',
    assigned_to: 'alex' as Owner,
  })

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesClient = filterClient === 'all' || project.client_id === filterClient
    return matchesSearch && matchesStatus && matchesClient
  })

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.client_id) return
    setCreating(true)

    const { error } = await supabase.from('projects').insert({
      name: formData.name.trim(),
      client_id: formData.client_id,
      project_type: formData.project_type,
      priority: formData.priority,
      description: formData.description || null,
      due_date: formData.due_date || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      assigned_to: formData.assigned_to,
      status: 'pending',
    } as unknown as any)

    if (error) {
      alert(`Error creating project: ${error.message}`)
      setCreating(false)
      return
    }

    setShowCreateModal(false)
    setCreating(false)
    setFormData({
      name: '',
      client_id: '',
      project_type: 'website',
      priority: 'medium',
      description: '',
      due_date: '',
      budget: '',
      assigned_to: 'alex',
    })
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    setMenuOpen(null)
    router.refresh()
  }

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    await supabase.from('projects').update({ status } as any).eq('id', id)
    setMenuOpen(null)
    router.refresh()
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    return client?.company_name || client?.name || 'Unknown'
  }

  const inProgressCount = projects.filter(p => p.status === 'in_progress').length
  const pendingCount = projects.filter(p => p.status === 'pending').length
  const overdueCount = projects.filter(p => {
    if (!p.due_date || p.status === 'completed' || p.status === 'cancelled') return false
    return new Date(p.due_date) < new Date()
  }).length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Projects</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Manage client website builds, campaigns, and design work</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <FolderKanban className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">In Progress</p>
              <p className="text-xl font-bold text-[var(--color-text)]">{inProgressCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-100 rounded-lg">
              <Clock className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Pending</p>
              <p className="text-xl font-bold text-[var(--color-text)]">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Overdue</p>
              <p className="text-xl font-bold text-[var(--color-text)]">{overdueCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
          className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="px-4 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
        >
          <option value="all">All Clients</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.company_name || client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-12 text-center">
          <FolderKanban className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--color-text)] mb-2">No projects found</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">Create a new project to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-[var(--color-border)]">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Project</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Due Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)]">Assigned</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredProjects.map((project) => {
                const status = statusConfig[project.status]
                const isOverdue = project.due_date &&
                  new Date(project.due_date) < new Date() &&
                  project.status !== 'completed' &&
                  project.status !== 'cancelled'

                return (
                  <tr
                    key={project.id}
                    className="hover:bg-stone-50 cursor-pointer"
                    onClick={() => router.push(`/projects/${project.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{project.name}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityColors[project.priority]}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {getClientName(project.client_id)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {projectTypeLabels[project.project_type]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        <status.icon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                      {project.due_date ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(project.due_date).toLocaleDateString()}
                          {isOverdue && <AlertCircle className="w-4 h-4 text-red-500" />}
                        </div>
                      ) : (
                        <span className="text-[var(--color-text-muted)]">No due date</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                      {project.assigned_to || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpen(menuOpen === project.id ? null : project.id)
                          }}
                          className="p-1.5 text-[var(--color-text-muted)] hover:text-gray-600 hover:bg-stone-100 rounded-lg transition"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === project.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(null) }} />
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-20 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  router.push(`/projects/${project.id}`)
                                  setMenuOpen(null)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-stone-50 flex items-center gap-2"
                              >
                                <Pencil className="w-4 h-4" />
                                Edit
                              </button>
                              <hr className="my-1" />
                              {project.status !== 'in_progress' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(project.id, 'in_progress')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-stone-50"
                                >
                                  Mark In Progress
                                </button>
                              )}
                              {project.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStatusChange(project.id, 'completed')
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-stone-50"
                                >
                                  Mark Completed
                                </button>
                              )}
                              <hr className="my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(project.id)
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[var(--color-text-muted)] hover:text-gray-600 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="New Website Build"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.company_name || client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[var(--color-border-strong)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Project details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="5000"
                  />
                </div>
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
            </div>
            <div className="flex gap-3 p-4 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-[var(--color-border-strong)] text-gray-700 rounded-lg hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formData.name.trim() || !formData.client_id}
                className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
