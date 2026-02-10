import { createClient } from '@/lib/supabase/server'
import { PropertiesManager } from '@/components/properties/PropertiesManager'
import type { PropertyListing, Client } from '@/lib/supabase/types'

export default async function PropertiesPage() {
  const supabase = await createClient()

  const [
    { data: propertiesData },
    { data: clientsData },
  ] = await Promise.all([
    supabase
      .from('property_listings')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('*')
      .order('name'),
  ])

  const properties = (propertiesData || []) as unknown as PropertyListing[]
  const clients = (clientsData || []) as unknown as Client[]

  return <PropertiesManager properties={properties} clients={clients} />
}
