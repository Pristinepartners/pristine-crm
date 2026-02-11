import { createClient } from '@/lib/supabase/server'
import { ContactsList } from '@/components/contacts/ContactsList'
import type { Contact, Pipeline, Tag } from '@/lib/supabase/types'

interface ContactWithTags extends Contact {
  contact_tags?: { tag: Tag }[]
}

export default async function ContactsPage() {
  const supabase = await createClient()

  const [{ data: contacts }, { data: pipelines }, { data: tags }, { data: opportunities }] = await Promise.all([
    supabase
      .from('contacts')
      .select('*, contact_tags(tag:tags(*))')
      .order('created_at', { ascending: false }),
    supabase.from('pipelines').select('*'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('opportunities').select('contact_id, pipeline_id'),
  ])

  return (
    <div className="p-8">
      <ContactsList
        contacts={(contacts || []) as unknown as ContactWithTags[]}
        pipelines={(pipelines || []) as Pipeline[]}
        tags={(tags || []) as unknown as Tag[]}
        opportunities={(opportunities || []) as { contact_id: string; pipeline_id: string }[]}
      />
    </div>
  )
}
