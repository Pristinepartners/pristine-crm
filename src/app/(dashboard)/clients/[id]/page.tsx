import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ClientDetail } from '@/components/clients/ClientDetail'
import type { Client, Project, Invoice, PropertyListing } from '@/lib/supabase/types'

interface ClientPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: clientData },
    { data: projectsData },
    { data: invoicesData },
    { data: propertiesData },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).single(),
    supabase.from('projects').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('invoices').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('property_listings').select('*').eq('client_id', id).order('created_at', { ascending: false }),
  ])

  if (!clientData) {
    notFound()
  }

  return (
    <ClientDetail
      client={clientData as unknown as Client}
      projects={(projectsData || []) as unknown as Project[]}
      invoices={(invoicesData || []) as unknown as Invoice[]}
      properties={(propertiesData || []) as unknown as PropertyListing[]}
    />
  )
}
