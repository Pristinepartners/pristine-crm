import { createClient } from '@/lib/supabase/server'
import { ProjectsManager } from '@/components/projects/ProjectsManager'
import type { Project, Client } from '@/lib/supabase/types'

export default async function ProjectsPage() {
  const supabase = await createClient()

  const [
    { data: projectsData },
    { data: clientsData },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('*')
      .order('name'),
  ])

  const projects = (projectsData || []) as unknown as Project[]
  const clients = (clientsData || []) as unknown as Client[]

  return <ProjectsManager projects={projects} clients={clients} />
}
