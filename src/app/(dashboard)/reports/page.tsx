import { createClient } from '@/lib/supabase/server'
import { ReportsDashboard } from '@/components/reports/ReportsDashboard'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export default async function ReportsPage() {
  const supabase = await createClient()

  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const currentMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Fetch all data in parallel
  const [
    { data: contacts },
    { data: opportunities },
    { data: activities },
    { data: appointments },
    { data: pipelines },
  ] = await Promise.all([
    supabase.from('contacts').select('id, created_at, owner, lead_score'),
    supabase.from('opportunities').select('id, created_at, owner, stage, opportunity_value, pipeline_id'),
    supabase.from('activities').select('id, logged_at, logged_by, outcome, channel'),
    supabase.from('appointments').select('id, datetime, status, created_at'),
    supabase.from('pipelines').select('id, name, stages'),
  ])

  // Calculate KPIs
  const currentMonthContacts = (contacts || []).filter(c =>
    new Date(c.created_at) >= currentMonthStart && new Date(c.created_at) <= currentMonthEnd
  )
  const lastMonthContacts = (contacts || []).filter(c =>
    new Date(c.created_at) >= lastMonthStart && new Date(c.created_at) <= lastMonthEnd
  )

  const currentMonthActivities = (activities || []).filter(a =>
    new Date(a.logged_at) >= currentMonthStart && new Date(a.logged_at) <= currentMonthEnd
  )
  const lastMonthActivities = (activities || []).filter(a =>
    new Date(a.logged_at) >= lastMonthStart && new Date(a.logged_at) <= lastMonthEnd
  )

  const currentMonthAppointments = (appointments || []).filter(a =>
    new Date(a.datetime) >= currentMonthStart && new Date(a.datetime) <= currentMonthEnd
  )
  const lastMonthAppointments = (appointments || []).filter(a =>
    new Date(a.datetime) >= lastMonthStart && new Date(a.datetime) <= lastMonthEnd
  )

  const currentMonthShowedUp = currentMonthAppointments.filter(a => a.status === 'completed').length
  const currentMonthBooked = currentMonthAppointments.length
  const lastMonthShowedUp = lastMonthAppointments.filter(a => a.status === 'completed').length
  const lastMonthBooked = lastMonthAppointments.length

  // Calculate pipeline value
  const totalPipelineValue = (opportunities || []).reduce((sum, o) => sum + (o.opportunity_value || 0), 0)

  // Activities by outcome
  const activityByOutcome = (activities || []).reduce((acc, a) => {
    acc[a.outcome] = (acc[a.outcome] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Activities by owner
  const activityByOwner = (activities || []).reduce((acc, a) => {
    acc[a.logged_by] = (acc[a.logged_by] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Opportunities by stage per pipeline
  const opportunitiesByPipeline = (pipelines || []).map(p => {
    const pipelineOpps = (opportunities || []).filter(o => o.pipeline_id === p.id)
    const stageData = (p.stages as string[]).map(stage => ({
      stage,
      count: pipelineOpps.filter(o => o.stage === stage).length,
      value: pipelineOpps.filter(o => o.stage === stage).reduce((sum, o) => sum + (o.opportunity_value || 0), 0),
    }))
    return {
      pipeline: p.name,
      stages: stageData,
      total: pipelineOpps.length,
      totalValue: pipelineOpps.reduce((sum, o) => sum + (o.opportunity_value || 0), 0),
    }
  })

  // Lead score distribution
  const leadScoreDistribution = (contacts || []).reduce((acc, c) => {
    const score = c.lead_score || 'unscored'
    acc[score] = (acc[score] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const kpiData = {
    totalContacts: contacts?.length || 0,
    newContactsThisMonth: currentMonthContacts.length,
    newContactsLastMonth: lastMonthContacts.length,
    totalOpportunities: opportunities?.length || 0,
    totalPipelineValue,
    totalActivities: activities?.length || 0,
    activitiesThisMonth: currentMonthActivities.length,
    activitiesLastMonth: lastMonthActivities.length,
    appointmentsBooked: currentMonthBooked,
    appointmentsShowedUp: currentMonthShowedUp,
    showUpRate: currentMonthBooked > 0 ? Math.round((currentMonthShowedUp / currentMonthBooked) * 100) : 0,
    lastMonthShowUpRate: lastMonthBooked > 0 ? Math.round((lastMonthShowedUp / lastMonthBooked) * 100) : 0,
    activityByOutcome,
    activityByOwner,
    opportunitiesByPipeline,
    leadScoreDistribution,
  }

  return (
    <div className="p-8">
      <ReportsDashboard data={kpiData} />
    </div>
  )
}
