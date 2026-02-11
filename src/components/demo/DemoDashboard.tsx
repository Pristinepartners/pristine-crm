'use client'

import {
  Users,
  DollarSign,
  Briefcase,
  Calendar,
  TrendingUp,
  ArrowRight,
  Target,
  BarChart3,
  Megaphone,
} from 'lucide-react'
import type { DemoAccount } from '@/lib/demo/data'
import Link from 'next/link'

interface DemoDashboardProps {
  account: DemoAccount
}

export function DemoDashboard({ account }: DemoDashboardProps) {
  const { stats, contacts, opportunities, appointments, socialPosts } = account

  // Get upcoming appointments (scheduled ones)
  const upcomingAppointments = appointments
    .filter(a => a.status === 'scheduled')
    .slice(0, 4)

  // Get hot leads
  const hotLeads = contacts.filter(c => c.lead_score === 'hot').slice(0, 5)

  // Recent opportunities
  const topOpportunities = [...opportunities]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Welcome back! Here&apos;s your {account.companyName} overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: account.primaryColor }}>
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Total Contacts</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.totalContacts}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.hotLeads} hot leads</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Pipeline Value</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">
                ${(stats.totalPipelineValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{opportunities.length} active deals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Conversion Rate</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.conversionRate}%</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.dealsClosedThisMonth} closed this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">This Week</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.appointmentsThisWeek}</p>
              <p className="text-xs text-[var(--color-text-muted)]">appointments scheduled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue + Social Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5" style={{ color: account.primaryColor }} />
            <span className="font-semibold text-[var(--color-text)]">Monthly Revenue</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">
            ${stats.revenueThisMonth.toLocaleString()}
          </p>
          <p className="text-sm text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <BarChart3 className="w-5 h-5" style={{ color: account.primaryColor }} />
            <span className="font-semibold text-[var(--color-text)]">Avg Deal Size</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">
            ${(stats.avgDealSize / 1000000).toFixed(1)}M
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{stats.dealsClosedThisMonth} deals this month</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-3 mb-3">
            <Megaphone className="w-5 h-5" style={{ color: account.primaryColor }} />
            <span className="font-semibold text-[var(--color-text)]">Social Media</span>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text)]">
            {stats.postsScheduled + stats.postsPublished}
          </p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            {stats.postsScheduled} scheduled, {stats.postsPublished} published
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hot Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Hot Leads</h2>
            <Link
              href={`/demo/${account.id}/contacts`}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: account.primaryColor }}
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {hotLeads.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text)] truncate">{contact.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] truncate">
                    {contact.business_name || contact.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {contact.tags.slice(0, 1).map(tag => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
                      style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    Hot
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Opportunities */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Top Opportunities</h2>
            <Link
              href={`/demo/${account.id}/opportunities`}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: account.primaryColor }}
            >
              View pipeline <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {topOpportunities.map((opp) => (
              <div key={opp.id} className="flex items-center gap-3 p-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${account.primaryColor}10` }}
                >
                  <Briefcase className="w-5 h-5" style={{ color: account.primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text)] truncate">{opp.contact_name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)] truncate">
                    {opp.business_name || 'Individual'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--color-text)]">
                    ${(opp.value / 1000000).toFixed(1)}M
                  </p>
                  <span
                    className="inline-flex px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: `${account.primaryColor}15`, color: account.primaryColor }}
                  >
                    {opp.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Upcoming Appointments</h2>
            <Link
              href={`/demo/${account.id}/calendar`}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: account.primaryColor }}
            >
              View calendar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {upcomingAppointments.map((apt) => {
              const date = new Date(apt.datetime)
              return (
                <div key={apt.id} className="flex items-center gap-3 p-4">
                  <div className="flex flex-col items-center text-center min-w-[50px]">
                    <div className="text-lg font-bold text-[var(--color-text)]">
                      {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text)] truncate">{apt.title}</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{apt.contact_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{apt.location}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Lead Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Lead Score Distribution</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-red-700">Hot Leads</span>
                  <span className="text-sm font-bold text-[var(--color-text)]">{stats.hotLeads}</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${(stats.hotLeads / stats.totalContacts) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-amber-700">Warm Leads</span>
                  <span className="text-sm font-bold text-[var(--color-text)]">{stats.warmLeads}</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(stats.warmLeads / stats.totalContacts) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-500">Cold Leads</span>
                  <span className="text-sm font-bold text-[var(--color-text)]">{stats.coldLeads}</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-400 rounded-full transition-all"
                    style={{ width: `${(stats.coldLeads / stats.totalContacts) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pipeline Stage Summary */}
            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">Pipeline Stages</h3>
              <div className="flex flex-wrap gap-2">
                {account.pipelineStages.map(stage => {
                  const count = opportunities.filter(o => o.stage === stage).length
                  return (
                    <span
                      key={stage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: count > 0 ? `${account.primaryColor}10` : '#f5f5f4',
                        color: count > 0 ? account.primaryColor : '#a8a29e',
                      }}
                    >
                      {stage}
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{
                          backgroundColor: count > 0 ? account.primaryColor : '#d6d3d1',
                          color: '#fff',
                        }}
                      >
                        {count}
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
