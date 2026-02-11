import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { InvoiceDetail } from '@/components/invoices/InvoiceDetail'
import type { Invoice, Client } from '@/lib/supabase/types'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: invoiceData }, { data: clientsData }] = await Promise.all([
    supabase.from('invoices').select('*').eq('id', id).single(),
    supabase.from('clients').select('*').order('name'),
  ])

  if (!invoiceData) {
    notFound()
  }

  const invoice = invoiceData as unknown as Invoice
  const clients = (clientsData || []) as unknown as Client[]

  return <InvoiceDetail invoice={invoice} clients={clients} />
}
