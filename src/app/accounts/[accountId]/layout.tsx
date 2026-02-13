import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/demo/data'
import { getSubAccount, getSubAccounts } from '@/lib/sub-accounts/queries'
import { SubAccountSidebar } from '@/components/sub-accounts/SubAccountSidebar'
import { SubAccountHeader } from '@/components/sub-accounts/SubAccountHeader'

export default async function SubAccountLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ accountId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const email = user.email || ''
  if (!isAdminUser(email)) redirect('/')

  const { accountId } = await params
  const account = await getSubAccount(accountId)

  if (!account) redirect('/accounts')

  const allAccounts = await getSubAccounts()

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      <SubAccountSidebar account={account} allAccounts={allAccounts} userEmail={email} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <SubAccountHeader account={account} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
