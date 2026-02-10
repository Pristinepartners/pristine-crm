import { createClient } from '@/lib/supabase/server'
import { ContactsList } from '@/components/contacts/ContactsList'
import type { Contact, Tag } from '@/lib/supabase/types'

export default async function LeadsPage() {
  const supabase = await createClient()

  const [
    { data: contactsData },
    { data: tagsData },
  ] = await Promise.all([
    supabase
      .from('contacts')
      .select('*, contact_tags(*, tag:tags(*))')
      .order('created_at', { ascending: false }),
    supabase
      .from('tags')
      .select('*')
      .order('name'),
  ])

  const contacts = (contactsData || []) as unknown as Contact[]
  const tags = (tagsData || []) as Tag[]

  return <ContactsList contacts={contacts} tags={tags} />
}
