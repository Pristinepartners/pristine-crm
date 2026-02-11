import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  // Get first pipeline to redirect to
  const { data: pipelines } = await supabase
    .from('pipelines')
    .select('id')
    .order('name')
    .limit(1)

  if (pipelines && pipelines.length > 0) {
    redirect(`/opportunities/${pipelines[0].id}`)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Opportunities</h1>
      <p className="text-[var(--color-text-secondary)] mt-2">No pipelines found. Create a pipeline to get started.</p>
    </div>
  )
}
