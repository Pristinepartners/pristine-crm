import { createClient } from '@/lib/supabase/server'
import { ContentLibrary } from '@/components/content/ContentLibrary'
import type { ContentAsset, Client } from '@/lib/supabase/types'

export default async function ContentPage() {
  const supabase = await createClient()

  const [
    { data: assetsData },
    { data: clientsData },
  ] = await Promise.all([
    supabase
      .from('content_assets')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('*')
      .order('name'),
  ])

  const assets = (assetsData || []) as unknown as ContentAsset[]
  const clients = (clientsData || []) as unknown as Client[]

  return <ContentLibrary assets={assets} clients={clients} />
}
