import { getDemoAccount } from '@/lib/demo/data'
import { redirect } from 'next/navigation'
import { DemoPipeline } from '@/components/demo/DemoPipeline'

export default async function DemoOpportunitiesPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const account = getDemoAccount(accountId)
  if (!account) redirect('/demo/luxe-realty')

  return <DemoPipeline account={account} />
}
