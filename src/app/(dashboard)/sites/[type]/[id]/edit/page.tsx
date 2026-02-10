import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageBuilder } from '@/components/sites/PageBuilder'

interface EditPageProps {
  params: Promise<{ type: string; id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { type, id } = await params
  const supabase = await createClient()

  // Validate type
  if (!['funnels', 'websites', 'forms', 'surveys'].includes(type)) {
    notFound()
  }

  const { data: item } = await supabase
    .from(type as 'funnels' | 'websites' | 'forms' | 'surveys')
    .select('*')
    .eq('id', id)
    .single()

  if (!item) {
    notFound()
  }

  return (
    <div className="h-full">
      <PageBuilder
        type={type as 'funnels' | 'websites' | 'forms' | 'surveys'}
        item={item as unknown as any}
      />
    </div>
  )
}
