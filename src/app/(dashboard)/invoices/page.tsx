import { createClient } from '@/lib/supabase/server'
import { InvoicesManager } from '@/components/invoices/InvoicesManager'
import type { Invoice, Client } from '@/lib/supabase/types'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const [
    { data: invoicesData },
    { data: clientsData },
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('*')
      .order('name'),
  ])

  const invoices = (invoicesData || []) as unknown as Invoice[]
  const clients = (clientsData || []) as unknown as Client[]

  return <InvoicesManager invoices={invoices} clients={clients} />
}
