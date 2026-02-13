import { createClient } from '@/lib/supabase/server'
import type {
  SubAccount,
  SubAccountContact,
  SubAccountOpportunity,
  SubAccountAppointment,
  SubAccountSocialPost,
  SubAccountContactTag,
} from '@/lib/supabase/types'

export async function getSubAccounts(): Promise<SubAccount[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sub_accounts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []).map(row => ({
    ...row,
    pipeline_stages: typeof row.pipeline_stages === 'string'
      ? JSON.parse(row.pipeline_stages)
      : row.pipeline_stages,
  })) as SubAccount[]
}

export async function getSubAccount(id: string): Promise<SubAccount | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sub_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return {
    ...data,
    pipeline_stages: typeof data.pipeline_stages === 'string'
      ? JSON.parse(data.pipeline_stages)
      : data.pipeline_stages,
  } as SubAccount
}

export async function getSubAccountContacts(accountId: string): Promise<SubAccountContact[]> {
  const supabase = await createClient()
  const { data: contacts, error } = await supabase
    .from('sub_account_contacts')
    .select('*')
    .eq('sub_account_id', accountId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Fetch tags for all contacts
  const contactIds = (contacts || []).map(c => c.id)
  let tags: SubAccountContactTag[] = []
  if (contactIds.length > 0) {
    const { data: tagData } = await supabase
      .from('sub_account_contact_tags')
      .select('*')
      .in('contact_id', contactIds)
    tags = (tagData || []) as SubAccountContactTag[]
  }

  return (contacts || []).map(c => ({
    ...c,
    tags: tags.filter(t => t.contact_id === c.id),
  })) as SubAccountContact[]
}

export async function getSubAccountOpportunities(accountId: string): Promise<SubAccountOpportunity[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sub_account_opportunities')
    .select('*')
    .eq('sub_account_id', accountId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as SubAccountOpportunity[]
}

export async function getSubAccountAppointments(accountId: string): Promise<SubAccountAppointment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sub_account_appointments')
    .select('*')
    .eq('sub_account_id', accountId)
    .order('datetime', { ascending: true })

  if (error) throw error
  return (data || []) as SubAccountAppointment[]
}

export async function getSubAccountSocialPosts(accountId: string): Promise<SubAccountSocialPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sub_account_social_posts')
    .select('*')
    .eq('sub_account_id', accountId)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return (data || []) as SubAccountSocialPost[]
}

export async function getSubAccountDashboardStats(accountId: string) {
  const [contacts, opportunities, appointments, socialPosts] = await Promise.all([
    getSubAccountContacts(accountId),
    getSubAccountOpportunities(accountId),
    getSubAccountAppointments(accountId),
    getSubAccountSocialPosts(accountId),
  ])

  const hotLeads = contacts.filter(c => c.lead_score === 'hot').length
  const warmLeads = contacts.filter(c => c.lead_score === 'warm').length
  const coldLeads = contacts.filter(c => c.lead_score === 'cold').length
  const totalPipelineValue = opportunities
    .filter(o => !o.closed_at)
    .reduce((sum, o) => sum + Number(o.value), 0)
  const closedWon = opportunities.filter(o => o.closed_won)
  const activeDeals = opportunities.filter(o => !o.closed_at)

  const now = new Date()
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const appointmentsThisWeek = appointments.filter(a => {
    const d = new Date(a.datetime)
    return d >= now && d <= weekFromNow && a.status === 'scheduled'
  }).length

  const postsScheduled = socialPosts.filter(p => p.status === 'scheduled').length
  const postsPublished = socialPosts.filter(p => p.status === 'published').length

  const totalOpps = opportunities.length
  const conversionRate = totalOpps > 0
    ? Math.round((closedWon.length / totalOpps) * 100)
    : 0

  const avgDealSize = closedWon.length > 0
    ? closedWon.reduce((sum, o) => sum + Number(o.value), 0) / closedWon.length
    : totalPipelineValue / Math.max(activeDeals.length, 1)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const dealsClosedThisMonth = closedWon.filter(o =>
    o.closed_at && new Date(o.closed_at) >= monthStart
  ).length

  const revenueThisMonth = closedWon
    .filter(o => o.closed_at && new Date(o.closed_at) >= monthStart)
    .reduce((sum, o) => sum + Number(o.value), 0)

  return {
    totalContacts: contacts.length,
    hotLeads,
    warmLeads,
    coldLeads,
    totalPipelineValue,
    appointmentsThisWeek,
    postsScheduled,
    postsPublished,
    conversionRate,
    avgDealSize,
    dealsClosedThisMonth,
    revenueThisMonth,
    contacts,
    opportunities,
    appointments,
    socialPosts,
  }
}
