import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/demo/data'
import { getSubAccounts } from '@/lib/sub-accounts/queries'
import { AccountsManager } from '@/components/sub-accounts/AccountsManager'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isAdminUser(user.email || '')) redirect('/')

  const accounts = await getSubAccounts()

  return <AccountsManager accounts={accounts} />
}
