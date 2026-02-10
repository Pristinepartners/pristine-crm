import { createClient } from '@/lib/supabase/server'
import { TasksList } from '@/components/tasks/TasksList'
import type { DailyTask, Owner } from '@/lib/supabase/types'
import { format } from 'date-fns'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.email?.split('@')[0]?.toLowerCase() || 'alex'
  const currentUser: Owner = userName === 'mikail' ? 'mikail' : 'alex'

  const today = format(new Date(), 'yyyy-MM-dd')

  // Fetch both personal tasks (owned by current user, not company-wide)
  // and all company-wide tasks
  const { data: tasks } = await supabase
    .from('daily_tasks')
    .select('*')
    .gte('due_date', today)
    .or(`owner.eq.${currentUser},is_company_wide.eq.true`)
    .order('due_date', { ascending: true })
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="p-8">
      <TasksList
        tasks={(tasks || []) as unknown as DailyTask[]}
        currentUser={currentUser}
      />
    </div>
  )
}
