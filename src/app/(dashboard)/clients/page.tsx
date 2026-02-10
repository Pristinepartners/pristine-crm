import { createClient } from '@/lib/supabase/server'
import { ClientsList } from '@/components/clients/ClientsList'
import type { Client } from '@/lib/supabase/types'

export default async function ClientsPage() {
  const supabase = await createClient()

  const { data: clientsData } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  const clients = (clientsData || []) as unknown as Client[]

  return <ClientsList clients={clients} />
}
