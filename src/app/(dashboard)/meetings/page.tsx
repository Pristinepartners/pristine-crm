import { createClient } from '@/lib/supabase/server'
import { MeetingsManager } from '@/components/meetings/MeetingsManager'

export default async function MeetingsPage() {
  const supabase = await createClient()

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .order('start_time', { ascending: true })

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*)')
    .eq('status', 'scheduled')
    .order('datetime', { ascending: true })

  return (
    <div className="p-8">
      <MeetingsManager
        meetings={(meetings || []) as unknown as any[]}
        appointments={(appointments || []) as unknown as any[]}
      />
    </div>
  )
}
