import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import type { Pipeline, Opportunity, Contact } from '@/lib/supabase/types'

interface PipelinePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ owner?: string; followUp?: string }>
}

interface OpportunityWithContact extends Opportunity {
  contact: Contact
}

export default async function PipelinePage({ params, searchParams }: PipelinePageProps) {
  const { id } = await params
  const { owner, followUp } = await searchParams
  const supabase = await createClient()

  // Fetch pipeline and all pipelines in parallel
  const [{ data: pipeline }, { data: allPipelines }] = await Promise.all([
    supabase.from('pipelines').select('*').eq('id', id).single(),
    supabase.from('pipelines').select('*').order('name'),
  ])

  if (!pipeline) {
    notFound()
  }

  // Fetch opportunities with contacts
  let query = supabase
    .from('opportunities')
    .select('*, contact:contacts(*)')
    .eq('pipeline_id', id)

  if (owner && (owner === 'alex' || owner === 'mikail')) {
    query = query.eq('owner', owner)
  }

  if (followUp) {
    query = query.lte('next_follow_up_date', followUp)
  }

  const { data: opportunities } = await query.order('updated_at', { ascending: false })

  return (
    <div className="h-full flex flex-col">
      <KanbanBoard
        pipeline={pipeline as unknown as Pipeline}
        allPipelines={(allPipelines || []) as unknown as Pipeline[]}
        opportunities={(opportunities || []) as unknown as OpportunityWithContact[]}
        initialOwnerFilter={owner}
        initialFollowUpFilter={followUp}
      />
    </div>
  )
}
