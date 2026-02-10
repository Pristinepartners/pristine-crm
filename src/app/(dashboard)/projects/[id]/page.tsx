import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectDetail } from '@/components/projects/ProjectDetail'
import type { Project, Client, ProjectTask } from '@/lib/supabase/types'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: projectData },
    { data: clientData },
    { data: tasksData },
  ] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('clients').select('*'),
    supabase.from('project_tasks').select('*').eq('project_id', id).order('sort_order'),
  ])

  if (!projectData) {
    notFound()
  }

  const client = clientData?.find(c => c.id === projectData.client_id)

  return (
    <ProjectDetail
      project={projectData as unknown as Project}
      client={client as unknown as Client}
      tasks={(tasksData || []) as unknown as ProjectTask[]}
      allClients={(clientData || []) as unknown as Client[]}
    />
  )
}
