import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDemoAccount, isAdminUser } from '@/lib/demo/data'
import { DemoSidebar } from '@/components/demo/DemoSidebar'

export default async function DemoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ accountId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Only Alex (admin) can access demo accounts
  const email = user.email || ''
  if (!isAdminUser(email)) {
    redirect('/')
  }

  const { accountId } = await params
  const account = getDemoAccount(accountId)

  if (!account) {
    redirect('/demo/' + 'luxe-realty')
  }

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <DemoSidebar account={account} userEmail={email} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Demo banner */}
        <div
          className="h-10 flex items-center justify-center text-sm font-medium"
          style={{ backgroundColor: account.primaryColor, color: '#ffffff' }}
        >
          Demo Preview: {account.companyName} ({account.industry})
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
