import { getDemoAccount } from '@/lib/demo/data'
import { redirect } from 'next/navigation'
import { DemoSocialPlanner } from '@/components/demo/DemoSocialPlanner'

export default async function DemoSocialPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const account = getDemoAccount(accountId)
  if (!account) redirect('/demo/luxe-realty')

  return <DemoSocialPlanner account={account} />
}
