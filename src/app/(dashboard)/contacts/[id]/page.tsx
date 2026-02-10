import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ContactDetail } from '@/components/contacts/ContactDetail'
import type { Contact, Activity, Opportunity, Appointment, Pipeline, ContactTag } from '@/lib/supabase/types'

interface ContactPageProps {
  params: Promise<{ id: string }>
}

interface OpportunityWithPipeline extends Opportunity {
  pipeline: Pipeline
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: contact },
    { data: activities },
    { data: opportunities },
    { data: appointments },
    { data: pipelines },
    { data: contactTags },
  ] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', id).single(),
    supabase
      .from('activities')
      .select('*')
      .eq('contact_id', id)
      .order('logged_at', { ascending: false }),
    supabase
      .from('opportunities')
      .select('*, pipeline:pipelines(*)')
      .eq('contact_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('appointments')
      .select('*')
      .eq('contact_id', id)
      .order('datetime', { ascending: false }),
    supabase.from('pipelines').select('*'),
    supabase
      .from('contact_tags')
      .select('*, tag:tags(*)')
      .eq('contact_id', id),
  ])

  if (!contact) {
    notFound()
  }

  return (
    <div className="p-8">
      <ContactDetail
        contact={contact as unknown as Contact}
        activities={(activities || []) as unknown as Activity[]}
        opportunities={(opportunities || []) as unknown as OpportunityWithPipeline[]}
        appointments={(appointments || []) as unknown as Appointment[]}
        pipelines={(pipelines || []) as unknown as Pipeline[]}
        contactTags={(contactTags || []) as unknown as ContactTag[]}
      />
    </div>
  )
}
