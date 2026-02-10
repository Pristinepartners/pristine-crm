import { createClient } from '@/lib/supabase/server'
import { AutomationsManager } from '@/components/automations/AutomationsManager'

export default async function AutomationsPage() {
  const supabase = await createClient()

  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: pipelines } = await supabase
    .from('pipelines')
    .select('*')
    .order('name')

  return (
    <div className="p-8">
      <AutomationsManager
        automations={(automations || []) as unknown as any[]}
        pipelines={pipelines || []}
      />
    </div>
  )
}
