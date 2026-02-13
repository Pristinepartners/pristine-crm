import {
  getSubAccountDashboardStats,
  getSubAccount,
} from '@/lib/sub-accounts/queries'
import { redirect } from 'next/navigation'
import {
  Users,
  DollarSign,
  Calendar,
  Megaphone,
  TrendingUp,
  Flame,
  ThermometerSun,
  Snowflake,
  ArrowRight,
  Briefcase,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default async function SubAccountDashboardPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const account = await getSubAccount(accountId)
  if (!account) redirect('/accounts')

  const stats = await getSubAccountDashboardStats(accountId)

  const upcomingAppointments = stats.appointments
    .filter(a => a.status === 'scheduled' && new Date(a.datetime) >= new Date())
    .slice(0, 5)

  const recentOpportunities = stats.opportunities.slice(0, 5)

  const formatCurrency = (val: number) =>
    val >= 1000000
      ? `$${(val / 1000000).toFixed(1)}M`
      : `$${(val / 1000).toFixed(0)}k`

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Overview for {account.company_name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: account.primary_color }}>
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
              <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(stats.totalPipelineValue)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.conversionRate}% conversion</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">This Week</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.appointmentsThisWeek}</p>
              <p className="text-xs text-[var(--color-text-muted)]">appointments</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500 rounded-lg">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)]">Social Posts</p>
              <p className="text-2xl font-bold text-[var(--color-text)]">{stats.postsScheduled}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{stats.postsPublished} published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Score Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)] p-6 mb-8">
        <h2 className="font-semibold text-[var(--color-text)] mb-4">Lead Score Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <Flame className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.hotLeads}</p>
              <p className="text-sm text-red-600">Hot Leads</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
            <ThermometerSun className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-700">{stats.warmLeads}</p>
              <p className="text-sm text-orange-600">Warm Leads</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Snowflake className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.coldLeads}</p>
              <p className="text-sm text-blue-600">Cold Leads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Upcoming Appointments</h2>
            <Link
              href={`/accounts/${accountId}/calendar`}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: account.primary_color }}
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">No upcoming appointments</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-3 p-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${account.primary_color}15` }}
                  >
                    <Calendar className="w-5 h-5" style={{ color: account.primary_color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text)] truncate">{apt.title}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">{apt.contact_name}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-[var(--color-text)]">
                      {new Date(apt.datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[var(--color-text-secondary)]">
                      {new Date(apt.datetime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Opportunities */}
        <div className="bg-white rounded-xl shadow-sm border border-[var(--color-border)]">
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <h2 className="font-semibold text-[var(--color-text)]">Recent Opportunities</h2>
            <Link
              href={`/accounts/${accountId}/opportunities`}
              className="text-sm font-medium flex items-center gap-1"
              style={{ color: account.primary_color }}
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentOpportunities.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
              <p className="text-[var(--color-text-secondary)]">No opportunities yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {recentOpportunities.map((opp) => (
                <div key={opp.id} className="flex items-center gap-3 p-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${account.primary_color}15` }}
                  >
                    <Briefcase className="w-5 h-5" style={{ color: account.primary_color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--color-text)] truncate">{opp.contact_name}</p>
                    <p className="text-sm text-[var(--color-text-secondary)] truncate">{opp.stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[var(--color-text)]">
                      ${Number(opp.value).toLocaleString('en-US')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center border border-[var(--color-border)]">
          <p className="text-3xl font-bold text-[var(--color-text)]">{stats.dealsClosedThisMonth}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Deals This Month</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-[var(--color-border)]">
          <p className="text-3xl font-bold text-[var(--color-text)]">{formatCurrency(stats.revenueThisMonth)}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Revenue This Month</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-[var(--color-border)]">
          <p className="text-3xl font-bold text-[var(--color-text)]">{formatCurrency(stats.avgDealSize)}</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Avg Deal Size</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-[var(--color-border)]">
          <p className="text-3xl font-bold text-[var(--color-text)]">{stats.conversionRate}%</p>
          <p className="text-sm text-[var(--color-text-secondary)]">Conversion Rate</p>
        </div>
      </div>
    </div>
  )
}
