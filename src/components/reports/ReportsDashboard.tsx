'use client'

import { useState } from 'react'
import {
  Users,
  Target,
  PhoneCall,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
} from 'lucide-react'

interface KPIData {
  totalContacts: number
  newContactsThisMonth: number
  newContactsLastMonth: number
  totalOpportunities: number
  totalPipelineValue: number
  totalActivities: number
  activitiesThisMonth: number
  activitiesLastMonth: number
  appointmentsBooked: number
  appointmentsShowedUp: number
  showUpRate: number
  lastMonthShowUpRate: number
  activityByOutcome: Record<string, number>
  activityByOwner: Record<string, number>
  opportunitiesByPipeline: Array<{
    pipeline: string
    stages: Array<{ stage: string; count: number; value: number }>
    total: number
    totalValue: number
  }>
  leadScoreDistribution: Record<string, number>
}

interface ReportsDashboardProps {
  data: KPIData
}

type TabType = 'overview' | 'pipeline' | 'activities' | 'team'

function KPICard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue',
}: {
  title: string
  value: string | number
  subValue?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

function BarChart({ data, title }: { data: Record<string, number>; title: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(e => e[1]), 1)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{label}</span>
              <span className="font-medium text-gray-900">{value}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No data available</p>
        )}
      </div>
    </div>
  )
}

function PipelineFunnel({ data }: { data: KPIData['opportunitiesByPipeline'][0] }) {
  const max = Math.max(...data.stages.map(s => s.count), 1)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{data.pipeline}</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">{data.total} opportunities</p>
          <p className="text-sm font-medium text-green-600">${data.totalValue.toLocaleString('en-US')}</p>
        </div>
      </div>
      <div className="space-y-2">
        {data.stages.map((stage, index) => (
          <div key={stage.stage} className="relative">
            <div
              className="h-10 bg-blue-500 rounded-lg flex items-center justify-between px-3 text-white text-sm"
              style={{
                width: `${Math.max((stage.count / max) * 100, 20)}%`,
                opacity: 1 - (index * 0.15),
              }}
            >
              <span className="font-medium truncate">{stage.stage}</span>
              <span>{stage.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ReportsDashboard({ data }: ReportsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const contactsTrend = data.newContactsLastMonth > 0
    ? ((data.newContactsThisMonth - data.newContactsLastMonth) / data.newContactsLastMonth) * 100
    : 0
  const activitiesTrend = data.activitiesLastMonth > 0
    ? ((data.activitiesThisMonth - data.activitiesLastMonth) / data.activitiesLastMonth) * 100
    : 0
  const showUpTrend = data.showUpRate - data.lastMonthShowUpRate

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pipeline', label: 'Pipeline', icon: Briefcase },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'team', label: 'Team Performance', icon: Users },
  ]

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & KPIs</h1>
        <p className="text-gray-500 mt-1">Track your performance metrics</p>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Contacts"
              value={data.totalContacts}
              subValue={`${data.newContactsThisMonth} new this month`}
              icon={Users}
              trend={contactsTrend > 0 ? 'up' : contactsTrend < 0 ? 'down' : 'neutral'}
              trendValue={`${contactsTrend >= 0 ? '+' : ''}${contactsTrend.toFixed(0)}% vs last month`}
              color="blue"
            />
            <KPICard
              title="Pipeline Value"
              value={`$${data.totalPipelineValue.toLocaleString('en-US')}`}
              subValue={`${data.totalOpportunities} opportunities`}
              icon={DollarSign}
              color="green"
            />
            <KPICard
              title="Activities This Month"
              value={data.activitiesThisMonth}
              subValue={`${data.totalActivities} total`}
              icon={PhoneCall}
              trend={activitiesTrend > 0 ? 'up' : activitiesTrend < 0 ? 'down' : 'neutral'}
              trendValue={`${activitiesTrend >= 0 ? '+' : ''}${activitiesTrend.toFixed(0)}% vs last month`}
              color="purple"
            />
            <KPICard
              title="Show Up Rate"
              value={`${data.showUpRate}%`}
              subValue={`${data.appointmentsShowedUp} / ${data.appointmentsBooked} appointments`}
              icon={Percent}
              trend={showUpTrend > 0 ? 'up' : showUpTrend < 0 ? 'down' : 'neutral'}
              trendValue={`${showUpTrend >= 0 ? '+' : ''}${showUpTrend}% vs last month`}
              color="orange"
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{data.totalContacts}</p>
                <p className="text-sm text-gray-500">Total Leads</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{data.totalActivities}</p>
                <p className="text-sm text-gray-500">Total Calls</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{data.appointmentsBooked}</p>
                <p className="text-sm text-gray-500">Appointments Set</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{data.appointmentsShowedUp}</p>
                <p className="text-sm text-gray-500">Showed Up</p>
              </div>
            </div>
          </div>

          {/* Lead Score Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart data={data.leadScoreDistribution} title="Lead Score Distribution" />
            <BarChart data={data.activityByOutcome} title="Activities by Outcome" />
          </div>
        </>
      )}

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <>
          {/* Pipeline Value Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KPICard
              title="Total Pipeline Value"
              value={`$${data.totalPipelineValue.toLocaleString('en-US')}`}
              icon={DollarSign}
              color="green"
            />
            <KPICard
              title="Total Opportunities"
              value={data.totalOpportunities}
              icon={Target}
              color="blue"
            />
            <KPICard
              title="Pipelines"
              value={data.opportunitiesByPipeline.length}
              icon={Briefcase}
              color="purple"
            />
          </div>

          {/* Pipeline Funnels */}
          {data.opportunitiesByPipeline.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.opportunitiesByPipeline.map((pipeline) => (
                <PipelineFunnel key={pipeline.pipeline} data={pipeline} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No pipeline data available</p>
            </div>
          )}
        </>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <>
          {/* Activity KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Activities"
              value={data.totalActivities}
              icon={PhoneCall}
              color="blue"
            />
            <KPICard
              title="This Month"
              value={data.activitiesThisMonth}
              trend={activitiesTrend > 0 ? 'up' : activitiesTrend < 0 ? 'down' : 'neutral'}
              trendValue={`${activitiesTrend >= 0 ? '+' : ''}${activitiesTrend.toFixed(0)}%`}
              icon={Activity}
              color="green"
            />
            <KPICard
              title="Appointments Booked"
              value={data.appointmentsBooked}
              icon={Calendar}
              color="purple"
            />
            <KPICard
              title="Show Up Rate"
              value={`${data.showUpRate}%`}
              icon={Percent}
              color="orange"
            />
          </div>

          {/* Activity Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart data={data.activityByOutcome} title="Activities by Outcome" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-full bg-blue-500 text-white rounded-lg py-3 px-4 flex justify-between">
                    <span>Total Activities</span>
                    <span className="font-bold">{data.totalActivities}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-3/4 bg-blue-400 text-white rounded-lg py-3 px-4 flex justify-between">
                    <span>Meetings Booked</span>
                    <span className="font-bold">{data.activityByOutcome['Meeting Booked'] || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-1/2 bg-blue-300 text-white rounded-lg py-3 px-4 flex justify-between">
                    <span>Showed Up</span>
                    <span className="font-bold">{data.appointmentsShowedUp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <>
          {/* Team Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart data={data.activityByOwner} title="Activities by Team Member" />
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Team Leaderboard</h3>
              <div className="space-y-4">
                {Object.entries(data.activityByOwner)
                  .sort((a, b) => b[1] - a[1])
                  .map(([owner, count], index) => (
                    <div key={owner} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 capitalize">{owner}</p>
                        <p className="text-sm text-gray-500">{count} activities</p>
                      </div>
                      {index === 0 && (
                        <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Top Performer</span>
                      )}
                    </div>
                  ))}
                {Object.keys(data.activityByOwner).length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No team data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Team Stats Grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Team Statistics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Team Member</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Activities</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.activityByOwner).map(([owner, count]) => (
                    <tr key={owner} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900 capitalize">{owner}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{count}</td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {data.totalActivities > 0 ? ((count / data.totalActivities) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
