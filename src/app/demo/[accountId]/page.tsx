import { getDemoAccount } from '@/lib/demo/data'
import { redirect } from 'next/navigation'
import { DemoDashboard } from '@/components/demo/DemoDashboard'

export default async function DemoDashboardPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const account = getDemoAccount(accountId)
  if (!account) redirect('/demo/luxe-realty')

  return <DemoDashboard account={account} />
}
