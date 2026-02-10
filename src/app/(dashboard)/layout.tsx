import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Header } from '@/components/ui/Header'
import type { Owner } from '@/lib/supabase/types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Determine current user (alex or mikail) from email
  const userName = user.email?.split('@')[0]?.toLowerCase() || 'alex'
  const currentUser: Owner = userName === 'mikail' ? 'mikail' : 'alex'

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userEmail={user.email || ''} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header currentUser={currentUser} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
