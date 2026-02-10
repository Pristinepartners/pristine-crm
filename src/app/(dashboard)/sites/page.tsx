import { createClient } from '@/lib/supabase/server'
import { SitesManager } from '@/components/sites/SitesManager'

export default async function SitesPage() {
  const supabase = await createClient()

  const [
    { data: funnels },
    { data: websites },
    { data: forms },
    { data: surveys },
  ] = await Promise.all([
    supabase.from('funnels').select('*').order('created_at', { ascending: false }),
    supabase.from('websites').select('*').order('created_at', { ascending: false }),
    supabase.from('forms').select('*').order('created_at', { ascending: false }),
    supabase.from('surveys').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div className="h-full">
      <SitesManager
        funnels={funnels || []}
        websites={websites || []}
        forms={forms || []}
        surveys={surveys || []}
      />
    </div>
  )
}
