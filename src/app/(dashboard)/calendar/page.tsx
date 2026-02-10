import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { Appointment, Contact } from '@/lib/supabase/types'

interface AppointmentWithContact extends Appointment {
  contact: Contact
}

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, contact:contacts(*)')
    .order('datetime', { ascending: true })

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('name')

  return (
    <div className="p-8">
      <CalendarView
        appointments={(appointments || []) as unknown as AppointmentWithContact[]}
        contacts={(contacts || []) as unknown as Contact[]}
      />
    </div>
  )
}
