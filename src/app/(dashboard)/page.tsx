import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2,
  DollarSign,
  FolderKanban,
  Home,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Users,
} from 'lucide-react'
import type { Client, Project, PropertyListing, Invoice } from '@/lib/supabase/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: clientsData },
    { data: projectsData },
    { data: propertiesData },
    { data: invoicesData },
  ] = await Promise.all([
    supabase.from('clients').select('*'),
    supabase.from('projects').select('*'),
    supabase.from('property_listings').select('*'),
    supabase.from('invoices').select('*'),
  ])

  const clients = (clientsData || []) as unknown as Client[]
  const projects = (projectsData || []) as unknown as Project[]
  const properties = (propertiesData || []) as unknown as PropertyListing[]
  const invoices = (invoicesData || []) as unknown as Invoice[]

  // Calculate stats
  const activeClients = clients.filter(c => c.subscription_status === 'active')
  const mrr = activeClients.reduce((sum, c) => sum + (c.monthly_fee || 0), 0)
  const projectsInProgress = projects.filter(p => p.status === 'in_progress')
  const projectsPending = projects.filter(p => p.status === 'pending')
  const overdueProjects = projects.filter(p => {
    if (!p.due_date || p.status === 'completed' || p.status === 'cancelled') return false
    return new Date(p.due_date) < new Date()
  })
  const activeListings = properties.filter(p => p.listing_status === 'active')
  const outstandingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
  const outstandingAmount = outstandingInvoices.reduce((sum, i) => sum + i.amount, 0)

  // Recent clients
  const recentClients = clients.slice(0, 5)

  // Recent projects
  const recentProjects = projects.slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your agency overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients.length}</p>
              <p className="text-xs text-gray-400">{clients.length} total</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Monthly Recurring</p>
              <p className="text-2xl font-bold text-gray-900">${mrr.toLocaleString('en-US')}</p>
              <p className="text-xs text-gray-400">from {activeClients.length} clients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{projectsInProgress.length}</p>
              <p className="text-xs text-gray-400">{projectsPending.length} pending</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-lg">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">{activeListings.length}</p>
              <p className="text-xs text-gray-400">{properties.length} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Row */}
      {(overdueProjects.length > 0 || outstandingAmount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {overdueProjects.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-900">{overdueProjects.length} Overdue Project{overdueProjects.length !== 1 ? 's' : ''}</p>
                  <p className="text-sm text-red-700">Needs immediate attention</p>
                </div>
                <Link href="/projects?status=overdue" className="text-sm text-red-600 font-medium hover:text-red-700">
                  View all
                </Link>
              </div>
            </div>
          )}

          {outstandingAmount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">${outstandingAmount.toLocaleString('en-US')} Outstanding</p>
                  <p className="text-sm text-yellow-700">{outstandingInvoices.length} unpaid invoice{outstandingInvoices.length !== 1 ? 's' : ''}</p>
                </div>
                <Link href="/invoices?status=sent" className="text-sm text-yellow-600 font-medium hover:text-yellow-700">
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Clients</h2>
            <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No clients yet</p>
              <Link href="/clients" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
                Add your first client
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentClients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{client.name}</p>
                    <p className="text-sm text-gray-500 truncate">{client.company_name || 'No company'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      client.subscription_status === 'active' ? 'bg-green-100 text-green-700' :
                      client.subscription_status === 'trial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {client.subscription_status}
                    </span>
                    {client.monthly_fee && (
                      <p className="text-sm text-gray-500 mt-1">${client.monthly_fee.toLocaleString('en-US')}/mo</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="p-8 text-center">
              <FolderKanban className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No projects yet</p>
              <Link href="/projects" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
                Create your first project
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentProjects.map((project) => {
                const client = clients.find(c => c.id === project.client_id)
                const isOverdue = project.due_date &&
                  new Date(project.due_date) < new Date() &&
                  project.status !== 'completed' &&
                  project.status !== 'cancelled'

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      project.status === 'completed' ? 'bg-green-100' :
                      project.status === 'in_progress' ? 'bg-blue-100' :
                      isOverdue ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {project.status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <FolderKanban className={`w-5 h-5 ${
                          project.status === 'in_progress' ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {client?.company_name || client?.name || 'Unknown client'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        isOverdue ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {isOverdue ? 'Overdue' : project.status.replace('_', ' ')}
                      </span>
                      {project.due_date && (
                        <p className={`text-sm mt-1 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                          Due {new Date(project.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{projects.filter(p => p.status === 'completed').length}</p>
          <p className="text-sm text-gray-500">Completed Projects</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{properties.filter(p => p.listing_status === 'sold').length}</p>
          <p className="text-sm text-gray-500">Properties Sold</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">${(invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0) / 1000).toFixed(0)}k</p>
          <p className="text-sm text-gray-500">Revenue (All Time)</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-gray-900">{clients.filter(c => c.company_type === 'brokerage').length}</p>
          <p className="text-sm text-gray-500">Brokerage Clients</p>
        </div>
      </div>
    </div>
  )
}
