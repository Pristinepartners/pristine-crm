import { createClient } from '@/lib/supabase/server'
import { SocialPlanner } from '@/components/marketing/SocialPlanner'

export default async function MarketingPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .order('scheduled_at', { ascending: true })

  return (
    <div className="p-8">
      <SocialPlanner posts={(posts || []) as unknown as any[]} />
    </div>
  )
}
